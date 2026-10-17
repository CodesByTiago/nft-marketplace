import { expect, test, type Page } from "@playwright/test";
import { loginAs as login, maria } from "./support";

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

test("sem sessão redireciona ao login ao abrir o perfil", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/entrar\?redirect=%2Fperfil/);
  await expect(page.locator("h1", { hasText: "Entre para continuar" })).toBeVisible();
  await page.getByRole("button", { name: "Entrar", exact: true }).last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("valida, salva e mantém os dados do perfil", async ({ page }) => {
  await login(page);
  await page.goto("/perfil");
  await expect(page.locator("#account-username")).toHaveValue("colecionador");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("#account-displayName-error")).toHaveText("Campo obrigatório.");
  await page.locator("#account-displayName").fill("Nova Colecionadora");
  await page.locator("#account-ensName").fill("nova");
  await page.locator("#account-walletNickname").fill("Principal");
  await page.locator("#account-next").fill("12345678");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("#account-current-error")).toHaveText("Informe a senha atual.");
  await page.locator("#account-current").fill("kurio1234");
  await page.locator("#account-confirm").fill("12345678");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator(".account-saved")).toHaveText("Alterações salvas.");
  await page.reload();
  await expect(page.locator("#account-displayName")).toHaveValue("Nova Colecionadora");
  await expect(page.locator("#account-current")).toHaveValue("");
});

test("o servidor recusa a senha atual incorreta e o perfil não aparece para outra conta", async ({ page }) => {
  await login(page);
  await page.goto("/perfil");
  await page.locator("#account-displayName").fill("Nova Colecionadora");
  await page.locator("#account-ensName").fill("nova");
  await page.locator("#account-walletNickname").fill("Principal");
  await page.locator("#account-current").fill("errada123");
  await page.locator("#account-next").fill("12345678");
  await page.locator("#account-confirm").fill("12345678");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator("#account-current-error")).toHaveText("Senha atual incorreta.");
  await page.locator("#account-current").fill("kurio1234");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.locator(".account-saved")).toBeVisible();

  await login(page, maria);
  await page.goto("/perfil");
  await expect(page.locator("#account-username")).toHaveValue("maria");
  await expect(page.locator("#account-displayName")).toHaveValue("");
});

test("troca e remove o avatar", async ({ page }) => {
  await login(page);
  await page.goto("/perfil");
  await page.getByLabel("Arquivo do avatar").setInputFiles("public/images/auth-google.svg");
  await expect(page.getByAltText("Seu avatar")).toBeVisible();
  await page.getByRole("button", { name: "Remover" }).click();
  await expect(page.getByAltText("Seu avatar")).toBeHidden();
});

test("o perfil corresponde à baseline visual desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await login(page);
  await page.goto("/perfil");
  await settle(page);
  await expect(page).toHaveScreenshot("profile-desktop.png", { maxDiffPixelRatio: 0.02 });
});

test("o perfil corresponde à baseline visual mobile", async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 896 });
  await login(page);
  await page.goto("/perfil");
  await settle(page);
  await expect(page).toHaveScreenshot("profile-mobile.png", { fullPage: true, maxDiffPixelRatio: 0.02 });
});
