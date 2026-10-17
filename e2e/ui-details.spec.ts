import { expect, test } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { openApp, seedCartFor } from "./support";

test("a prévia do carrinho não abre dentro do próprio carrinho", async ({ page }) => {
  await seedCartFor(page, [{ nft: nfts[0], quantity: 1 }]);
  await openApp(page, "/carrinho");
  await expect(page.locator(".cart-total")).toBeVisible();
  await expect(page.getByLabel("Prévia do carrinho")).toHaveCount(0);
  await openApp(page, "/");
  await expect(page.getByLabel("Prévia do carrinho")).toHaveCount(1);
});

test("os recomendados reutilizam o card da home", async ({ page }) => {
  await openApp(page, `/nft/${nfts[0].id}`);
  const card = page.locator(".related-section .nft-card").first();
  await expect(card).toBeVisible();
  await expect(card.getByRole("button", { name: /favoritos/ })).toHaveCount(1);
  await expect(card.getByRole("button", { name: /ao carrinho/ })).toHaveCount(1);
});

test("os ícones de compartilhar são pequenos e alinhados", async ({ page }) => {
  await openApp(page, `/nft/${nfts[0].id}`);
  await expect(page.locator(".detail-share a")).toHaveCount(3);
  const boxes = await page.locator(".detail-share a").evaluateAll((links) =>
    links.map((link) => {
      const { width, height, top } = link.getBoundingClientRect();
      return { width: Math.round(width), height: Math.round(height), top: Math.round(top) };
    }),
  );
  expect(boxes).toHaveLength(3);
  expect(new Set(boxes.map((box) => `${box.width}x${box.height}@${box.top}`)).size).toBe(1);
  expect(boxes[0].width).toBeLessThanOrEqual(36);
});

test("o carrossel troca de destaque sozinho com transição", async ({ page }) => {
  await openApp(page, "/");
  const cta = page.getByRole("link", { name: "APRENDA", exact: true });
  await expect(cta).toBeHidden();
  await expect(cta).toBeVisible({ timeout: 8_000 });
  expect(await page.locator(".hero-slide:not([hidden])").evaluate((node) => getComputedStyle(node).animationName)).toBe(
    "hero-slide-in",
  );
});

test("o segundo destaque leva para a seção Aprenda", async ({ page }) => {
  await openApp(page, "/");
  await page.getByRole("button", { name: "Ir para o destaque 2" }).click();
  const cta = page.getByRole("link", { name: "APRENDA", exact: true });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page).toHaveURL(/#diario$/);
  await expect(page.locator("#diario")).toBeInViewport();
});

test("o site declara um favicon da Kurio", async ({ page, request }) => {
  await openApp(page, "/");
  const href = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(href).toBe("/favicon.svg");
  expect((await request.get(href!)).ok()).toBe(true);
});
