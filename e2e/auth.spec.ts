import { expect, test, type Page } from "@playwright/test";

async function settle(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    images.forEach((image) => {
      image.loading = "eager";
    });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
  });
  await page.waitForTimeout(500);
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("alterna entre entrar e criar conta", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("tab", { name: "Entrar" })).toHaveAttribute("aria-selected", "true");
    await settle(page);
    await expect(dialog).toHaveScreenshot("login-desktop.png", { maxDiffPixelRatio: 0.02 });
    await dialog.getByRole("tab", { name: "Criar conta" }).click();
    await expect(dialog.locator("#auth-register-confirm")).toBeVisible();
    await settle(page);
    await expect(dialog).toHaveScreenshot("register-desktop.png", { maxDiffPixelRatio: 0.02 });
  });

  test("valida os campos e mostra erro de credenciais", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("button[type=submit]").click();
    await expect(dialog.getByText("Informe um e-mail válido.")).toBeVisible();
    await dialog.locator("#auth-login-email").fill("contato@email.com");
    await dialog.locator("#auth-login-password").fill("errada");
    await dialog.locator("button[type=submit]").click();
    await expect(dialog.getByRole("alert")).toContainText("E-mail ou senha incorretos.");
  });

  test("mostra e oculta a senha", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    const password = page.locator("#auth-login-password");
    await expect(password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Mostrar senha" }).click();
    await expect(password).toHaveAttribute("type", "text");
  });

  test("entra, persiste a sessão e sai", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    await page.locator("#auth-login-email").fill("contato@email.com");
    await page.locator("#auth-login-password").fill("kurio1234");
    await page.getByRole("dialog").locator("button[type=submit]").click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.reload();
    const profile = page.getByRole("link", { name: /colecionador, meu perfil/ }).first();
    await expect(profile).toBeVisible();
    await profile.click();
    await page.getByRole("button", { name: "Sair", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "Entrar", exact: true }).first()).toBeVisible();
  });

  test("cria a conta e fecha com Esc sem conta", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.getByRole("button", { name: "Entrar", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("tab", { name: "Criar conta" }).click();
    await dialog.locator("#auth-register-username").fill("nova");
    await dialog.locator("#auth-register-email").fill("nova@kurio.art");
    await dialog.locator("#auth-register-password").fill("12345678");
    await dialog.locator("#auth-register-confirm").fill("12345678");
    await dialog.locator("button[type=submit]").click();
    await expect(page.getByRole("link", { name: /nova, meu perfil/ }).first()).toBeVisible();
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 414, height: 896 } });

  test("abre pelo Perfil em tela cheia, alterna e fecha pelo X", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Perfil" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot("login-mobile.png", { maxDiffPixelRatio: 0.02 });
    await dialog.getByRole("button", { name: "Crie uma conta" }).click();
    await expect(dialog.getByRole("heading", { name: "Criar perfil de colecionador" })).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot("register-mobile.png", { maxDiffPixelRatio: 0.02 });
    await dialog.getByRole("button", { name: "Fechar" }).click();
    await expect(dialog).toBeHidden();
  });
});
