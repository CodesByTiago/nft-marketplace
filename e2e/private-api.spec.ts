import { expect, test, type Page } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { control, demo, loginAs, maria, openApp, seedCartFor } from "./support";

const nft = nfts[0];
const add = (page: Page) => page.getByRole("button", { name: `Adicionar ${nft.name} aos favoritos` });
const remove = (page: Page) => page.getByRole("button", { name: `Remover ${nft.name} dos favoritos` });

async function signInThroughDialog(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("E-mail").fill(demo.email);
  await dialog.getByLabel("Senha", { exact: true }).fill(demo.password);
  await dialog.locator(".auth-submit").click();
  await expect(dialog).toHaveCount(0);
}

test("busca filtra o catálogo pelo servidor", async ({ page }) => {
  await openApp(page);
  await page.locator(".header-search").click();
  await page.getByRole("textbox", { name: "Buscar NFTs" }).first().fill(nft.name);
  await expect(page.locator(".nft-card h2").first()).toContainText(nft.name);
  await expect(page.locator(".nft-card h2").filter({ hasNotText: nft.name })).toHaveCount(0);
});

test("visitante que favorita é levado ao login e o favorito fica salvo no servidor", async ({ page }) => {
  await openApp(page);
  await add(page).click();
  await signInThroughDialog(page);
  await expect(remove(page)).toBeVisible();

  await page.reload();
  await expect(remove(page)).toBeVisible();
});

test("favoritos pertencem ao usuário: outra conta não os enxerga", async ({ page }) => {
  await loginAs(page, demo);
  await page.goto("/");
  await add(page).click();
  await expect(remove(page)).toBeVisible();

  const visible = await page.evaluate(async (other) => {
    const login = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(other),
    });
    const { token } = (await login.json()) as { token: string };
    const response = await fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } });
    return ((await response.json()) as { ids: string[] }).ids;
  }, maria);
  expect(visible).toEqual([]);

  // Trocar de usuário não reaproveita o cache privado do anterior.
  await loginAs(page, maria);
  await page.goto("/");
  await expect(add(page)).toBeVisible();
});

test("falha ao favoritar desfaz a atualização otimista", async ({ page }) => {
  await loginAs(page);
  await control(page, "scenario", { scenario: "favorites-error" });
  await page.goto("/");
  await add(page).click();
  await expect(add(page)).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "favorito" })).toBeVisible();
});

test("sessão expirada limpa a sessão e pede novo login sem perder o carrinho", async ({ page }) => {
  await loginAs(page);
  await seedCartFor(page, [{ nft, quantity: 1 }], demo.id);
  await openApp(page);
  await control(page, "session/expire");
  await page.reload();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Sua sessão expirou");
  expect(await page.evaluate(() => localStorage.getItem("kurio-session"))).toBeNull();

  await signInThroughDialog(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-row")).toHaveCount(1);
});

test("sessão expirada durante o checkout pede login e mantém o carrinho", async ({ page }) => {
  await loginAs(page);
  await seedCartFor(page, [{ nft, quantity: 1 }], demo.id);
  await page.goto("/pagamento");
  await expect(page.locator(".pay-total")).toBeVisible();
  await control(page, "session/expire");
  await page.reload();
  await expect(page.getByRole("dialog")).toContainText("Sua sessão expirou");
});

test("carrinho de visitante é mesclado ao da conta ao entrar", async ({ page }) => {
  await seedCartFor(page, [{ nft, quantity: 1 }]);
  await openApp(page, "/carrinho");
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await page.getByRole("button", { name: "Conectar e finalizar" }).click();
  await signInThroughDialog(page);
  await page.goto("/carrinho");
  await expect(page.locator(".cart-row")).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem("kurio-cart:guest"))).toBe("[]");
});

test("cenário catalog-error mostra o erro e permite tentar de novo", async ({ page }) => {
  await openApp(page);
  await control(page, "scenario", { scenario: "catalog-error" });
  await page.goto("/");
  await expect(page.getByRole("alert").filter({ hasText: "Não foi possível carregar os NFTs" })).toBeVisible();
  await control(page, "scenario", { scenario: "default" });
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".nft-card").first()).toBeVisible();
});

test("cenário catalog-transient se recupera sozinho com retentativas", async ({ page }) => {
  await openApp(page, "/?scenario=catalog-transient");
  await expect(page.locator(".nft-card").first()).toBeVisible({ timeout: 20_000 });
});
