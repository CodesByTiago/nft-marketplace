import { expect, test, type Page } from "@playwright/test";

async function openStableHome(page: Page) {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content:
      "html { scrollbar-width: none !important; } html::-webkit-scrollbar { display: none !important; width: 0 !important; }",
  });
  await expect(page.locator(".nft-card")).toHaveCount(9);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    images.forEach((image) => {
      image.loading = "eager";
    });
    await Promise.all(images.map((image) => image.decode()));
  });
  await page.waitForTimeout(300);
}

test("o carrossel alterna os destaques e o primeiro leva ao catálogo", async ({ page }) => {
  await page.goto("/");

  const carousel = page.getByRole("region", { name: "Destaques", exact: true });
  await expect(carousel).toHaveAttribute("aria-roledescription", "carrossel");
  await expect(carousel.getByRole("group", { name: "Slide 1 de 2" })).toBeVisible();
  await expect(carousel.locator(".hero-slide:not([hidden]) .hero-dot")).toHaveCount(2);

  await expect(carousel.getByRole("group", { name: "Slide 2 de 2" })).toBeVisible({ timeout: 8_000 });
  await carousel.getByRole("button", { name: "Ir para o destaque 1" }).click();

  await carousel.getByRole("link", { name: "EXPLORAR" }).click();
  await expect(page).toHaveURL(/#catalogo$/);
});

test("combina filtros e adiciona um NFT ao carrinho", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /Fotografia/ }).click();
  await expect(page.locator(".nft-card")).toHaveCount(5);
  await expect(page.getByRole("button", { name: "Fotografia (5)" })).toBeVisible();
  await expect(page.locator(".nft-card h2").filter({ hasText: "Cosmic Bloom" })).toHaveCount(5);

  await expect(page).toHaveURL(/category=Fotografia/);
  await expect(page).not.toHaveURL(/q=/);

  await page.getByRole("button", { name: "Adicionar Cosmic Bloom #118 ao carrinho" }).click();
  const toast = page.locator(".cart-toast");
  await expect(toast).toContainText("Cosmic Bloom #118 adicionado ao carrinho");
  await toast.getByRole("button", { name: "Ver carrinho" }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await expect(page.locator(".cart-row")).toHaveCount(1);
  await page.goBack();

  await page.locator(".cart-preview-wrap").hover();
  const preview = page.getByRole("region", { name: "Prévia do carrinho" });
  await expect(preview.getByText("Cosmic Bloom #118")).toBeVisible();
  await preview.getByRole("link", { name: "Ver carrinho completo" }).click();
  await expect(page).toHaveURL(/\/carrinho$/);
  await page.goBack();
  await page.getByRole("button", { name: "Fotografia (5)" }).click();
  await expect(page).not.toHaveURL(/category=/);
  await expect(page.locator(".nft-card")).toHaveCount(9);
  await expect(page.getByRole("button", { name: "Limpar filtros" })).toHaveCount(0);

  await page.getByRole("button", { name: /Arte digital/ }).click();
  await page.getByRole("button", { name: /Generativa/ }).click();
  await expect(page).toHaveURL(/category=/);
  await page.getByRole("button", { name: "Limpar filtros" }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator(".nft-card")).toHaveCount(9);
});

test("as abas recortam o catálogo e atualizam as contagens", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".nft-card")).toHaveCount(9);
  const totalAll = await page.getByRole("button", { name: /^Fotografia \(\d+\)/ }).textContent();

  await page.getByRole("button", { name: "Novos lançamentos" }).click();
  await expect(page).toHaveURL(/tab=new/);
  await expect(page.getByRole("button", { name: "Novos lançamentos" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^Fotografia \(\d+\)/ })).not.toHaveText(totalAll ?? "");

  await page.getByRole("button", { name: "Todos os NFTs" }).click();
  await expect(page).not.toHaveURL(/tab=/);
});

test("o header permanece fixo ao rolar a página", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await expect(page.getByRole("link", { name: /Abrir carrinho/ })).toBeInViewport();
});

test("o menu ativo do header acompanha a seção visível", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navegação principal" });
  await expect(nav.locator("a[aria-current=page]")).toHaveText("Início");

  const links = nav.locator("a");
  const before = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  await page.evaluate(() => document.getElementById("catalogo")?.scrollIntoView());
  await expect(nav.locator("a[aria-current=page]")).toHaveText("Mercado");
  const after = await links.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  expect(after).toEqual(before);

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(nav.locator("a[aria-current=page]")).toHaveText("Início");
});

test("o filtro mobile pode ser aberto e fechado", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await page.getByRole("button", { name: "Filtros" }).click();
  await expect(page.getByRole("heading", { name: "Filtros" })).toBeVisible();
  await page.getByRole("button", { name: "Fechar filtros" }).click();
  await expect(page.getByRole("heading", { name: "Filtros" })).toBeHidden();
});

test("a home corresponde à baseline visual desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openStableHome(page);
  await expect(page).toHaveScreenshot("home-desktop.png", {
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
});

test("a home corresponde à baseline visual mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openStableHome(page);
  const pagination = await page.locator(".pagination").boundingBox();
  expect(pagination).not.toBeNull();
  expect(pagination!.x).toBeGreaterThanOrEqual(0);
  expect(pagination!.x + pagination!.width).toBeLessThanOrEqual(390);
  await expect(page).toHaveScreenshot("home-mobile.png", {
    fullPage: true,
    animations: "disabled",
    caret: "hide",
  });
});
