import { expect, test, type Page } from "@playwright/test";

async function openStableDetail(page: Page, id: string) {
  await page.goto(`/nft/${id}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
  await page.evaluate(() => document.fonts.ready);
}

async function firstNftId(page: Page) {
  await page.goto("/");
  const href = await page.locator(".nft-card h3 a").first().getAttribute("href");
  return href!.split("/").pop()!;
}

test("abre o detalhe pelo card, escolhe quantidade e compra", async ({ page }) => {
  await page.goto("/");
  const name = (await page.locator(".nft-card h3").first().textContent())!.trim();
  await page.locator(".nft-card h3 a").first().click();

  await expect(page).toHaveURL(/\/nft\//);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();

  const stepper = page.getByRole("group", { name: "Quantidade" }).first();
  await stepper.getByRole("button", { name: "Aumentar quantidade" }).click();
  await expect(stepper.locator("output")).toHaveText("2");

  await page.getByRole("button", { name: "COMPRAR" }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(page.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(page.locator(".cart-row .quantity-stepper output")).toHaveText("2");
});

test("limita a quantidade ao total de edições", async ({ page }) => {
  await page.goto(`/nft/${await firstNftId(page)}`);
  const stepper = page.getByRole("group", { name: "Quantidade" }).first();
  const plus = stepper.getByRole("button", { name: "Aumentar quantidade" });
  while (await plus.isEnabled()) await plus.click();
  await expect(page.getByRole("status").filter({ hasText: "Limite de" })).toBeVisible();
});

test("mostra a mensagem de NFT não encontrado", async ({ page }) => {
  await page.goto("/nft/nao-existe");
  await expect(page.getByRole("heading", { name: "NFT não encontrado" })).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao mercado" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("a busca do header leva ao catálogo filtrado", async ({ page }) => {
  await page.goto(`/nft/${await firstNftId(page)}`);
  await page.locator(".header-search").click();
  const search = page.getByRole("textbox", { name: "Buscar NFTs" }).first();
  await search.fill("cosmic bloom");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".nft-card h3").first()).toContainText("Cosmic Bloom");
});

test("no mobile, a barra de compra adiciona ao carrinho", async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 896 });
  await page.goto(`/nft/${await firstNftId(page)}`);
  await expect(page.locator(".site-header")).toBeHidden();
  await page.getByRole("button", { name: /Adicionar .* ao carrinho/ }).click();
  await expect(page.locator(".cart-toast")).toContainText("adicionado ao carrinho");
});

test("o detalhe corresponde à baseline visual desktop", async ({ page }) => {
  const id = await firstNftId(page);
  await page.setViewportSize({ width: 1440, height: 2400 });
  await openStableDetail(page, id);
  await expect(page).toHaveScreenshot("detail-desktop.png", { animations: "disabled", caret: "hide" });
});

test("o detalhe corresponde à baseline visual mobile", async ({ page }) => {
  const id = await firstNftId(page);
  await page.setViewportSize({ width: 414, height: 896 });
  await openStableDetail(page, id);
  await expect(page).toHaveScreenshot("detail-mobile.png", { animations: "disabled", caret: "hide" });
});
