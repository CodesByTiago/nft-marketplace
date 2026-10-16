import { expect, test, type Page } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { control, demo, loginAs, maria, seedCartFor } from "./support";

const nft = nfts[0];
const wallet = "0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C";

async function seedCart(page: Page) {
  await loginAs(page);
  await seedCartFor(page, [{ nft, quantity: 1 }], demo.id);
}

// O cliente só recebe eventos depois que o handshake do Socket.IO conclui.
async function waitForSocket(page: Page) {
  await expect(page.locator(".realtime-notices")).toHaveAttribute("data-connected", "true");
}

async function fillProfile(page: Page) {
  await page.locator("#pay-displayName").fill("Nova Colecionadora");
  await page.locator("#pay-username").fill("nova");
  await page.locator("#pay-network").selectOption("Ethereum");
  await page.locator("#pay-profileName").fill("Nova Kurio");
  await page.locator("#pay-address").fill(wallet);
  await page.locator("#pay-referral").fill("KURIO-2026");
  await page.locator("#pay-email").fill("nova@kurio.art");
  await page.locator("#pay-ens").fill("nova");
}

async function startCheckout(page: Page) {
  await seedCart(page);
  await page.goto("/");
  await waitForSocket(page);
  await control(page, "config", { orderSettleMs: 600_000 });
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toContainText("1.206 ETH");
  await fillProfile(page);
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByRole("button", { name: "Processando compra…" })).toBeVisible();
}

async function pendingKey(page: Page) {
  // O pedido só existe no backend simulado depois que o POST responde.
  await expect
    .poll(() =>
      page.evaluate(() => {
        const entry = Object.entries(localStorage).find(([name]) => name.startsWith("kurio-pending-order:"));
        const orders = localStorage.getItem("kurio-mock-orders") ?? "";
        const key = entry ? (JSON.parse(entry[1]) as { key: string }).key : "";
        return key && orders.includes(key) ? key : "";
      }),
    )
    .not.toBe("");
  return page.evaluate(() => {
    const entry = Object.entries(localStorage).find(([name]) => name.startsWith("kurio-pending-order:"));
    return (JSON.parse(entry![1]) as { key: string }).key;
  });
}

test("nft.updated atualiza preço, resumo e avisa o colecionador no carrinho", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-total")).toContainText("1.206 ETH");
  await waitForSocket(page);

  await control(page, "nft-update", { nftId: nft.id, price: "2.00" });
  await expect(page.getByRole("status").filter({ hasText: "mudou de 1.19 para 2.00 ETH" })).toBeVisible();
  await expect(page.locator(".cart-row-price")).toContainText("2.00 ETH");
  await expect(page.locator(".cart-total")).toContainText("2.016 ETH");
});

test("catálogo e detalhe refletem preço e esgotamento recebidos pelo socket", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: `Adicionar ${nft.name} ao carrinho` })).toBeEnabled();
  await waitForSocket(page);
  await control(page, "nft-update", { nftId: nft.id, price: "3.10" });
  await expect(page.locator(".nft-card", { hasText: nft.name })).toContainText("3.10 ETH");

  await page.goto(`/nft/${nft.id}`);
  await expect(page.getByRole("heading", { name: nft.name }).first()).toBeVisible();
  await waitForSocket(page);
  await control(page, "nft-update", { nftId: nft.id, available: false });
  await expect(page.getByRole("button", { name: "COMPRAR", exact: true }).first()).toBeDisabled();
});

test("item esgotado sai do resumo e bloqueia o checkout", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-total")).toContainText("1.206 ETH");
  await waitForSocket(page);

  await control(page, "nft-update", { nftId: nft.id, available: false });
  await expect(page.getByRole("status").filter({ hasText: "ficou indisponível" })).toBeVisible();
  await expect(page.locator(".cart-row-price")).toHaveText("Esgotado");
  await expect(page.getByRole("button", { name: "Conectar e finalizar" })).toBeDisabled();
});

test("eventos duplicados e antigos não regridem nem repetem efeitos", async ({ page }) => {
  await seedCart(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-total")).toContainText("1.206 ETH");
  await waitForSocket(page);

  await control(page, "nft-update", { nftId: nft.id, price: "2.00", version: 5, eventId: "evt-fixed" });
  await expect(page.locator(".cart-row-price")).toContainText("2.00 ETH");
  await control(page, "nft-update", { nftId: nft.id, price: "2.00", version: 5, eventId: "evt-fixed" });
  await control(page, "nft-update", { nftId: nft.id, price: "9.00", version: 3 });
  // Um evento mais novo prova que os anteriores já foram processados.
  await control(page, "nft-update", { nftId: nft.id, price: "2.50", version: 6 });
  await expect(page.locator(".cart-row-price")).toContainText("2.50 ETH");

  await expect(page.locator(".realtime-notice")).toHaveCount(2);
  await expect(page.locator(".realtime-notice").filter({ hasText: "9.00" })).toHaveCount(0);
});

test("o pedido fica pendente e só é confirmado pelo evento order.updated", async ({ page }) => {
  await startCheckout(page);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await waitForSocket(page);
  await control(page, "orders/settle", { key: await pendingKey(page) });
  await expect(page.getByRole("dialog", { name: "Seus NFTs agora estão na sua carteira" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("kurio-cart:u-demo"))).toBe("[]");
});

test("queda da conexão com pedido pendente recupera o estado ao reconectar sem nova compra", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/orders")) posts += 1;
  });
  await startCheckout(page);
  await waitForSocket(page);

  await control(page, "disconnect");
  // O pedido conclui enquanto o colecionador está offline: o evento se perde.
  await control(page, "orders/settle", { key: await pendingKey(page) });
  await expect(page.getByRole("dialog", { name: "Seus NFTs agora estão na sua carteira" })).toBeVisible();
  expect(posts).toBe(1);
});

test("recarregar com pedido pendente retoma o mesmo pedido", async ({ page }) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().endsWith("/api/orders")) posts += 1;
  });
  await startCheckout(page);
  const key = await pendingKey(page);

  await page.reload();
  await expect(page.getByRole("button", { name: "Processando compra…" })).toBeVisible();
  expect(posts).toBe(2);
  await waitForSocket(page);
  await control(page, "orders/settle", { key });
  await expect(page.getByRole("dialog", { name: "Seus NFTs agora estão na sua carteira" })).toBeVisible();
});

test("pedido e eventos de um usuário não aparecem para outro", async ({ page }) => {
  await startCheckout(page);
  const key = await pendingKey(page);

  // Sessão da Maria criada pela API; o token do usuário dono do pedido continua na página.
  const status = await page.evaluate(
    async ({ orderKey, other }) => {
      const login = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(other),
      });
      const { token: otherToken } = (await login.json()) as { token: string };
      const ownToken = (JSON.parse(localStorage.getItem("kurio-session")!) as { token: string }).token;
      const get = (token?: string) =>
        fetch(`/api/orders/${orderKey}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return [(await get(ownToken)).status, (await get(otherToken)).status, (await get()).status];
    },
    { orderKey: key, other: maria },
  );
  expect(status).toEqual([200, 404, 401]);

  await seedCartFor(page, [{ nft, quantity: 1 }], maria.id);
  await loginAs(page, maria);
  await page.goto("/pagamento");
  await expect(page.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();
  await waitForSocket(page);
  await control(page, "orders/settle", { key });
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("cenário payment-declined recusa o pedido e mantém o carrinho", async ({ page }) => {
  await startCheckout(page);
  const key = await pendingKey(page);
  await control(page, "scenario", { scenario: "payment-declined" });
  await control(page, "orders/settle", { key });
  await expect(page.getByText(/recusad/i).first()).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
