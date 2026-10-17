import { expect, test } from "@playwright/test";
import { articles } from "../src/features/marketplace/content/articles";
import { openApp } from "./support";

test("os cards do Diário abrem o artigo com barra lateral e rodapé", async ({ page }) => {
  await openApp(page, "/");
  await page.getByRole("link", { name: `Ler mais: ${articles[0].title}` }).click();
  await expect(page).toHaveURL(new RegExp(`/diario/${articles[0].slug}$`));
  await expect(page.getByRole("heading", { level: 1, name: articles[0].title })).toBeVisible();
  await expect(page.locator(".article h2").first()).toBeVisible();

  const aside = page.getByRole("complementary", { name: "Outros artigos" });
  await expect(aside.getByRole("link")).toHaveCount(3);
  await expect(aside.getByRole("link", { name: new RegExp(articles[0].title) })).toHaveCount(0);
  await expect(page.locator(".site-footer")).toBeVisible();

  await aside.getByRole("link").first().click();
  await expect(page).toHaveURL(/\/diario\/(?!como-funciona-a-propriedade)/);
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(articles[0].title);
});

test("todos os artigos abrem e artigo inexistente mostra aviso", async ({ page }) => {
  for (const article of articles) {
    await openApp(page, `/diario/${article.slug}`);
    await expect(page.getByRole("heading", { level: 1, name: article.title })).toBeVisible();
  }
  await openApp(page, "/diario/nao-existe");
  await expect(page.getByRole("heading", { name: "Artigo não encontrado" })).toBeVisible();
});

test("o artigo não gera overflow horizontal no mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await openApp(page, `/diario/${articles[1].slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
