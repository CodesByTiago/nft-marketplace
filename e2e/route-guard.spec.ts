import { expect, test, type Page } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { demo, loginAs, openApp, seedCartFor } from "./support";

const entries = [
  { nft: nfts[0], quantity: 1 },
  { nft: nfts[1], quantity: 1 },
];

async function signInThroughDialog(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("E-mail").fill(demo.email);
  await dialog.getByLabel("Senha", { exact: true }).fill(demo.password);
  await dialog.locator(".auth-submit").click();
  await expect(dialog).toHaveCount(0);
}

test.describe("rotas privadas", () => {
  for (const path of [
    "/pagamento",
    "/perfil",
    "/perfil/carteiras",
    "/perfil/atividade",
    "/perfil/lista-de-interesse",
    "/perfil/ofertas",
    "/perfil/arquivos-baixados",
    "/perfil/suporte",
  ]) {
    test(`${path} sem sessão redireciona ao login com o retorno`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`/entrar\\?redirect=${encodeURIComponent(path)}`));
      await expect(page.getByRole("dialog")).toBeVisible();
    });
  }

  test("após entrar, volta ao fluxo de origem com a busca preservada", async ({ page }) => {
    await seedCartFor(page, entries);
    await page.goto("/pagamento?coupon=KURIO10");
    await expect(page).toHaveURL(/\/entrar/);
    await signInThroughDialog(page);
    await expect(page).toHaveURL(/\/pagamento\?coupon=KURIO10$/);
    await expect(page.locator(".pay-total")).toBeVisible();
  });

  test("fechar o diálogo mantém a página de acesso e permite tentar de novo", async ({ page }) => {
    await page.goto("/perfil");
    await page.getByRole("dialog").getByRole("button", { name: "Fechar" }).click();
    await expect(page.getByRole("heading", { name: "Entre para continuar" })).toBeVisible();
    await page.getByRole("button", { name: "Entrar", exact: true }).click();
    await signInThroughDialog(page);
    await expect(page).toHaveURL(/\/perfil$/);
  });

  test("o retorno aceita só caminhos internos", async ({ page }) => {
    await page.goto("/entrar?redirect=//exemplo.com/phishing");
    await signInThroughDialog(page);
    await expect(page).toHaveURL(/127\.0\.0\.1:5173\/$/);
  });

  test("com sessão, o acesso direto abre a tela sem passar pelo login", async ({ page }) => {
    await loginAs(page);
    await page.goto("/perfil/carteiras");
    await expect(page).toHaveURL(/\/perfil\/carteiras$/);
    await expect(page.locator("#wallet-displayName")).toBeVisible();
  });

  test("rota inexistente mostra a página não encontrada", async ({ page }) => {
    await page.goto("/nada-aqui");
    await expect(page.getByText("Esta página não existe.")).toBeVisible();
  });
});

test("a chave de idempotência recupera o mesmo pedido e recusa conteúdo diferente", async ({ page }) => {
  await loginAs(page);
  const result = await page.evaluate(async () => {
    const { token } = JSON.parse(localStorage.getItem("kurio-session") ?? "{}") as { token: string };
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    const items = [{ id: "emerald-ape-042", quantity: 1 }];
    const quote = (await (
      await fetch("/api/cart/quote", { method: "POST", headers, body: JSON.stringify({ items }) })
    ).json()) as { total: string };
    const base = {
      key: "idem-e2e-1",
      items,
      expectedTotal: quote.total,
      provider: "metamask",
      network: "Ethereum",
      address: "0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C",
    };
    const send = async (body: object) => {
      const response = await fetch("/api/orders", { method: "POST", headers, body: JSON.stringify(body) });
      return { status: response.status, body: (await response.json()) as { id?: string; code?: string } };
    };
    return { first: await send(base), again: await send(base), other: await send({ ...base, network: "Polygon" }) };
  });

  expect(result.first.status).toBe(202);
  expect(result.again.status).toBe(200);
  expect(result.again.body.id).toBe(result.first.body.id);
  expect(result.other.status).toBe(409);
  expect(result.other.body.code).toBe("idempotency-conflict");
});

const widths = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const { name, width, height } of widths) {
  test.describe(`sem overflow horizontal em ${name} (${width}px)`, () => {
    test.use({ viewport: { width, height } });

    const noOverflow = async (page: Page) => {
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    };

    test("início, detalhe e carrinho", async ({ page }) => {
      await seedCartFor(page, entries);
      await openApp(page);
      await expect(page.locator(".nft-card").first()).toBeVisible();
      await noOverflow(page);
      await page.goto(`/nft/${nfts[0].id}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await noOverflow(page);
      await page.goto("/carrinho");
      await expect(page.locator(".cart-row")).toHaveCount(2);
      await noOverflow(page);
    });

    test("pagamento, perfil e carteiras", async ({ page }) => {
      await loginAs(page);
      await seedCartFor(page, entries, demo.id);
      await page.goto("/pagamento");
      await expect(page.locator(".pay-total, .pay-mobile-total").first()).toBeVisible();
      await noOverflow(page);
      await page.goto("/perfil");
      await expect(page.locator("#account-username")).toBeVisible();
      await noOverflow(page);
      await page.goto("/perfil/carteiras");
      await expect(page.locator("#wallet-displayName")).toBeVisible();
      await noOverflow(page);
    });
  });
}
