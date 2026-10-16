import { expect, test, type Page } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";

const seeded = [
  { nft: nfts[0], quantity: 2 },
  { nft: nfts[1], quantity: 1 },
  { nft: nfts[2], quantity: 1 },
];

async function seedCart(page: Page) {
  await page.addInitScript((entries) => {
    if (!localStorage.getItem("kurio-cart")) localStorage.setItem("kurio-cart", JSON.stringify(entries));
  }, seeded);
}

async function fillProfile(page: Page) {
  await page.locator("#pay-displayName").fill("Nova Colecionadora");
  await page.locator("#pay-username").fill("nova");
  await page.locator("#pay-network").selectOption("Ethereum");
  await page.locator("#pay-profileName").fill("Nova Kurio");
  await page.locator("#pay-address").fill("0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C");
  await page.locator("#pay-referral").fill("KURIO-2026");
  await page.locator("#pay-email").fill("nova@kurio.art");
  await page.locator("#pay-ens").fill("nova");
}

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content:
      "html { scrollbar-width: none !important; } html::-webkit-scrollbar { display: none !important; width: 0 !important; }",
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    images.forEach((image) => {
      image.loading = "eager";
    });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(800);
}

test("o carrinho leva ao pagamento levando o cupom aplicado", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  await page.getByLabel("Código promocional").fill("kurio10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.locator(".cart-discount")).toContainText("0.61");
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await expect(page).toHaveURL(/\/pagamento\?coupon=KURIO10$/);
  await expect(page.locator(".pay-totals")).toContainText("(-) 0.61");
  await expect(page.locator(".pay-total")).toContainText("5.470 ETH");
});

test("valida os campos obrigatórios antes de enviar", async ({ page }) => {
  await seedCart(page);
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("6.076 ETH");
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText("Informe o nome de exibição.")).toBeVisible();
  await expect(page.getByText("Selecione uma rede.")).toBeVisible();
  await expect(page.locator("#pay-displayName")).toBeFocused();
  await page.locator("#pay-email").fill("invalido");
  await page.locator("#pay-address").fill("0x123");
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText("Informe um e-mail válido.")).toBeVisible();
  await expect(page.getByText(/endereço 0x válido/)).toBeVisible();
});

test("confirma a compra, mostra o recibo e remove só os itens comprados", async ({ page }) => {
  await seedCart(page);
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("6.076 ETH");
  await fillProfile(page);
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  const receipt = page.getByRole("dialog", { name: "Seus NFTs agora estão na sua carteira" });
  await expect(receipt).toBeVisible();
  await expect(receipt).toContainText("6.076 ETH");
  await expect(receipt).toContainText("Coinbase Wallet");
  await expect(receipt.getByRole("link", { name: "Ver no Etherscan" })).toHaveAttribute(
    "href",
    /^https:\/\/etherscan\.io\/tx\/0x[0-9a-f]{64}$/,
  );
  expect(await page.evaluate(() => localStorage.getItem("kurio-cart"))).toBe("[]");

  // O recibo sobrevive a um refresh até ser fechado.
  await page.reload();
  await expect(receipt).toBeVisible();
  await receipt.getByRole("button", { name: "Fechar" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/pagamento");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Não há itens para pagar" })).toBeVisible();
});

test("compra recusada preserva os itens e permite tentar com outra carteira", async ({ page }) => {
  await seedCart(page);
  await page.goto("/pagamento");
  await fillProfile(page);
  await page.getByRole("radio", { name: "WalletConnect" }).check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "recusada na carteira" })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("kurio-cart") ?? "[]").length)).toBe(3);

  await page.getByRole("radio", { name: "MetaMask" }).check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("dialog")).toContainText("MetaMask");
});

test("cliques repetidos criam um único pedido", async ({ page }) => {
  await seedCart(page);
  let requests = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/orders")) requests += 1;
  });
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("6.076 ETH");
  await fillProfile(page);
  const submit = page.getByRole("button", { name: "Confirmar compra" });
  await submit.dblclick();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(requests).toBe(1);
});

test("no mobile, usa carteiras cadastradas e confirma pelo botão fixo", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto("/pagamento");
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Pagamento com carteira" })).toBeVisible();
  await expect(page.locator("#pay-displayName")).toHaveCount(0);
  await expect(page.locator(".pay-mobile-total")).toContainText("6.076 ETH");
  await page.getByRole("radio", { name: /Principal/ }).check();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("dialog")).toContainText("Seus NFTs agora estão na sua carteira");
});

test("pagamento corresponde à baseline visual desktop", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 1440, height: 1300 });
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("6.076 ETH");
  await settle(page);
  await expect(page).toHaveScreenshot("payment-desktop.png", { animations: "disabled", caret: "hide" });
});

test("pagamento corresponde à baseline visual mobile", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto("/pagamento");
  await expect(page.locator(".pay-mobile-total")).toContainText("6.076 ETH");
  await settle(page);
  await expect(page).toHaveScreenshot("payment-mobile.png", { animations: "disabled", caret: "hide" });
});

test("o recibo corresponde à baseline visual", async ({ page }) => {
  await seedCart(page);
  await page.clock.setFixedTime(new Date("2026-07-29T12:00:00Z"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("6.076 ETH");
  await fillProfile(page);
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  const receipt = page.getByRole("dialog");
  await expect(receipt).toBeVisible();
  await settle(page);
  await expect(receipt).toHaveScreenshot("payment-receipt.png", {
    animations: "disabled",
    caret: "hide",
    mask: [receipt.locator(".receipt-meta > div").first()],
  });
});
