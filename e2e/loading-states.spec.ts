import { expect, test } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { control, openApp, seedCartFor } from "./support";

const entries = [
  { nft: nfts[0], quantity: 1 },
  { nft: nfts[1], quantity: 1 },
];

test("catálogo mostra skeletons com shimmer e depois os cards", async ({ page }) => {
  await openApp(page, "/?scenario=slow");
  const grid = page.getByLabel("Carregando catálogo");
  await expect(grid).toBeVisible();
  await expect(grid).toHaveAttribute("aria-busy", "true");
  const skeleton = grid.locator(".nft-skeleton").first();
  expect((await skeleton.boundingBox())?.height).toBeGreaterThanOrEqual(350);
  expect(await skeleton.evaluate((node) => getComputedStyle(node).animationName)).toBe("shimmer");
  await expect(page.locator(".nft-card").first()).toBeVisible();
  await expect(grid).toHaveCount(0);
});

test("detalhe mostra skeleton e preserva a área da galeria", async ({ page }) => {
  await openApp(page, `/nft/${nfts[0].id}?scenario=slow`);
  const skeleton = page.getByLabel("Carregando detalhes");
  await expect(skeleton).toBeVisible();
  expect((await skeleton.locator(".detail-skeleton-image").boundingBox())?.height).toBeGreaterThanOrEqual(300);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(skeleton).toHaveCount(0);
});

test("o resumo do carrinho mostra skeleton enquanto a cotação carrega", async ({ page }) => {
  await seedCartFor(page, entries);
  await openApp(page, "/carrinho?scenario=slow");
  await expect(page.getByRole("status", { name: "Calculando resumo" })).toBeVisible();
  await expect(page.locator(".cart-total")).toBeVisible();
  await expect(page.getByRole("status", { name: "Calculando resumo" })).toHaveCount(0);
});

test("com movimento reduzido o shimmer não anima", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openApp(page, "/?scenario=slow");
  const skeleton = page.getByLabel("Carregando catálogo").locator(".nft-skeleton").first();
  await expect(skeleton).toBeVisible();
  expect(await skeleton.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
});

test("falha do catálogo mostra o erro e a nova tentativa recupera a lista", async ({ page }) => {
  await openApp(page, "/?scenario=catalog-error");
  const alert = page.getByRole("alert").first();
  await expect(alert).toBeVisible();
  await control(page, "scenario", { scenario: "default" });
  await page.getByRole("button", { name: /Tentar novamente/ }).click();
  await expect(page.locator(".nft-card").first()).toBeVisible();
});
