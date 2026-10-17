import { expect, test, type Page } from "@playwright/test";
import { loginAs as login } from "./support";

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

test("o menu lateral navega entre carteiras e seções em manutenção", async ({ page }) => {
  await login(page);
  await page.goto("/perfil");
  const menu = page.getByRole("complementary", { name: "Meu perfil" });
  await menu.getByRole("link", { name: "Carteiras" }).click();
  await expect(page).toHaveURL(/\/perfil\/carteiras$/);
  await expect(page.getByRole("heading", { name: "Carteira principal" })).toBeVisible();
  for (const [name, path] of [
    ["Atividade", "atividade"],
    ["Ofertas", "ofertas"],
    ["Arquivos baixados", "arquivos-baixados"],
    ["Suporte", "suporte"],
  ]) {
    await menu.getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`/perfil/${path}$`));
    await expect(page.getByRole("heading", { name: `${name} em manutenção` })).toBeVisible();
  }
});

test("valida e salva a carteira principal e a secundária", async ({ page }) => {
  await login(page);
  await page.goto("/perfil/carteiras");
  await expect(page.locator("#wallet-email")).toHaveValue("contato@email.com");
  await page.getByRole("button", { name: "Salvar carteira", exact: true }).click();
  await expect(page.locator("#wallet-displayName-error")).toHaveText("Informe o nome de exibição.");
  await page.locator("#wallet-displayName").fill("Nova");
  await page.locator("#wallet-nickname").fill("Principal");
  await page.locator("#wallet-network").selectOption("Ethereum");
  await page.locator("#wallet-profileName").fill("Nova Kurio");
  await page.locator("#wallet-address").fill("0x123");
  await page.locator("#wallet-provider").selectOption("metamask");
  await page.locator("#wallet-referral").fill("KURIO-2026");
  await page.locator("#wallet-ens").fill("nova");
  await page.getByRole("button", { name: "Salvar carteira", exact: true }).click();
  await expect(page.locator("#wallet-address-error")).toContainText("endereço 0x válido");
  await page.locator("#wallet-address").fill("0xA91F3c5b7d9e1a2b4c6d8e0f1a3b5c7d9e0fE82C");
  await page.getByRole("button", { name: "Salvar carteira", exact: true }).click();
  await expect(page.locator(".account-saved")).toHaveText("Carteira principal salva.");

  await page.getByLabel("Igual à carteira principal").click();
  await expect(page.getByTestId("secondary-summary")).toContainText("Principal · Ethereum");
  await page.reload();
  await expect(page.locator("#wallet-displayName")).toHaveValue("Nova");
  await expect(page.getByTestId("secondary-summary")).toBeVisible();
  await page.getByLabel("Igual à carteira principal").click();
  await expect(page.getByText("Você ainda não adicionou uma carteira secundária.")).toBeVisible();
});

test("a carteira corresponde à baseline visual desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await login(page);
  await page.goto("/perfil/carteiras");
  await settle(page);
  await expect(page).toHaveScreenshot("wallets-desktop.png", { maxDiffPixelRatio: 0.02 });
});

test("a carteira corresponde à baseline visual mobile", async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 896 });
  await login(page);
  await page.goto("/perfil/carteiras");
  await settle(page);
  await expect(page).toHaveScreenshot("wallets-mobile.png", { fullPage: true, maxDiffPixelRatio: 0.02 });
});

test("a seção em manutenção corresponde à baseline visual", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await login(page);
  await page.goto("/perfil/ofertas");
  await settle(page);
  await expect(page).toHaveScreenshot("maintenance-desktop.png", { maxDiffPixelRatio: 0.02 });
});
