import { expect, test } from "@playwright/test";
import { articles } from "../src/features/marketplace/content/articles";
import { nfts } from "../src/features/marketplace/mocks/data";
import { loginAs, maria, openApp } from "./support";

test("a lista de interesse mostra os favoritos e permite remover", async ({ page }) => {
  await openApp(page, "/");
  await loginAs(page, maria);
  await page.goto("/perfil/lista-de-interesse");
  await expect(page.getByText(/ainda não favoritou/)).toBeVisible();

  await page.goto(`/nft/${nfts[0].id}`);
  await page
    .getByRole("button", { name: /Adicionar aos favoritos|Favoritar/ })
    .first()
    .click();
  await page.goto("/perfil/lista-de-interesse");
  const cards = page.locator(".wishlist .nft-card");
  await expect(cards).toHaveCount(1);
  await expect(page.getByRole("status").filter({ hasText: "1 favorito" })).toBeVisible();

  await cards
    .first()
    .getByRole("button", { name: /favoritos/ })
    .click();
  await expect(cards).toHaveCount(0);
  await expect(page.getByText(/ainda não favoritou/)).toBeVisible();
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("as páginas da conta e do blog têm a barra de navegação inferior", async ({ page }) => {
    await openApp(page, "/");
    await loginAs(page, maria);
    for (const path of [
      "/perfil",
      "/perfil/carteiras",
      "/perfil/lista-de-interesse",
      "/perfil/suporte",
      `/diario/${articles[0].slug}`,
    ]) {
      await page.goto(path);
      const bar = page.getByRole("navigation", { name: "Navegação inferior" });
      await expect(bar).toBeVisible();
      await expect(bar.getByRole("button", { name: "Lista de interesse" })).toBeVisible();
    }
    await page.goto("/perfil");
    await page
      .getByRole("navigation", { name: "Navegação inferior" })
      .getByRole("button", { name: "Lista de interesse" })
      .click();
    await expect(page).toHaveURL(/\/perfil\/lista-de-interesse$/);
  });
});
