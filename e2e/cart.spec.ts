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

async function openStableCart(page: Page) {
  await page.goto("/carrinho");
  await expect(page.locator(".cart-row")).toHaveCount(3);
  await expect(page.locator(".cart-totals")).toBeVisible();
  await expect(page.locator(".related-grid li")).toHaveCount(5);
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
  await page.waitForTimeout(1000);
}

test("lista os itens e calcula o resumo pela cotação", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-row")).toHaveCount(3);
  // 1.19*2 + 1.69 + 1.99 = 6.06; + 0.016 de taxa
  await expect(page.locator(".cart-totals")).toContainText("6.06 ETH");
  await expect(page.locator(".cart-total")).toContainText("6.076 ETH");
});

test("edita a quantidade, remove itens e persiste após recarregar", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  const first = page.locator(".cart-row").first();
  await first.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(first.locator("output")).toHaveText("3");
  await expect(page.locator(".cart-total")).toContainText("7.266 ETH");

  await page
    .locator(".cart-row")
    .nth(1)
    .getByRole("button", { name: /^Remover/ })
    .click();
  await expect(page.locator(".cart-row")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".cart-row")).toHaveCount(2);
});

test("aplica, remove e rejeita cupons", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  const input = page.getByLabel("Código promocional");

  await input.fill("kurio10");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.locator(".cart-discount")).toContainText("0.61");
  await expect(page.getByRole("status").filter({ hasText: "KURIO10 aplicado" })).toBeVisible();

  await page.getByRole("button", { name: "Remover", exact: true }).click();
  await expect(page.locator(".cart-discount")).toContainText("0.00");

  await input.fill("VERAO20");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("Este código promocional expirou.")).toBeVisible();

  await input.fill("XPTO");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText("Código promocional inválido.")).toBeVisible();
});

test("a prévia do header mostra 2 itens e leva ao carrinho completo", async ({ page }) => {
  await seedCart(page);
  await page.goto("/");
  await page.locator(".cart-preview-wrap").hover();
  const preview = page.getByRole("region", { name: "Prévia do carrinho" });
  await expect(preview.locator("li")).toHaveCount(2);
  await expect(preview.getByText("+ 1 outro item")).toBeVisible();
  await preview.getByRole("link", { name: "Ver carrinho completo" }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
});

test("no mobile, tocar no carrinho vai direto ao carrinho completo", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto("/");
  await page.getByRole("button", { name: /Abrir carrinho/ }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
});

test("mostra o estado vazio e leva de volta ao mercado", async ({ page }) => {
  await page.goto("/carrinho");
  await expect(page.getByRole("heading", { name: "Seu carrinho está vazio" })).toBeVisible();
  await page.getByRole("link", { name: "Explorar NFTs" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("no mobile, mostra o cabeçalho de tela e a folha de resumo", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto("/carrinho");
  await expect(page.locator(".site-header")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Carrinho de NFTs" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Conectar e finalizar" })).toBeInViewport();
});

test("o carrinho corresponde à baseline visual desktop", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 1440, height: 1700 });
  await openStableCart(page);
  await expect(page).toHaveScreenshot("cart-desktop.png", { animations: "disabled", caret: "hide" });
});

test("o carrinho corresponde à baseline visual mobile", async ({ page }) => {
  await seedCart(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto("/carrinho");
  await expect(page.locator(".cart-totals")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await expect(page).toHaveScreenshot("cart-mobile.png", { animations: "disabled", caret: "hide" });
});
