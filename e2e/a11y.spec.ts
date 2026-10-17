import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { nfts } from "../src/features/marketplace/mocks/data";
import { loginAs, openApp, seedCartFor } from "./support";

const entries = [
  { nft: nfts[0], quantity: 1 },
  { nft: nfts[1], quantity: 1 },
];

async function expectNoViolations(page: Page) {
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(summary).toEqual([]);
}

const viewports = [
  { name: "desktop", size: { width: 1440, height: 1000 } },
  { name: "mobile", size: { width: 414, height: 896 } },
];

for (const { name, size } of viewports) {
  test.describe(`acessibilidade ${name}`, () => {
    test.use({ viewport: size });

    test("home", async ({ page }) => {
      await openApp(page);
      await expect(page.locator(".nft-card").first()).toBeVisible();
      await expectNoViolations(page);
    });

    test("detalhe do NFT", async ({ page }) => {
      await openApp(page, `/nft/${nfts[0].id}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoViolations(page);
    });

    test("carrinho", async ({ page }) => {
      await seedCartFor(page, entries);
      await openApp(page, "/carrinho");
      await expect(page.locator(".cart-row")).toHaveCount(2);
      await expectNoViolations(page);
    });

    test("pagamento", async ({ page }) => {
      await loginAs(page);
      await seedCartFor(page, entries, "u-demo");
      await page.goto("/pagamento");
      await expect(page.locator(".pay-total, .pay-mobile-total").first()).toBeVisible();
      await expectNoViolations(page);
    });

    test("diálogos de entrar e criar conta", async ({ page }) => {
      await openApp(page);
      await page
        .getByRole("button", { name: /^(Entrar|Perfil)$/ })
        .filter({ visible: true })
        .first()
        .click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expectNoViolations(page);
      await dialog
        .getByRole("tab", { name: "Criar conta" })
        .or(dialog.getByRole("button", { name: "Crie uma conta" }))
        .first()
        .click();
      await expect(dialog.locator("#auth-register-confirm")).toBeVisible();
      await expectNoViolations(page);
    });

    test("perfil e carteiras", async ({ page }) => {
      await loginAs(page);
      await page.goto("/perfil");
      await expect(page.locator("#account-username")).toBeVisible();
      await expectNoViolations(page);
      await page.goto("/perfil/carteiras");
      await expect(page.locator("#wallet-displayName")).toBeVisible();
      await expectNoViolations(page);
    });
  });
}

test.describe("teclado", () => {
  test("o diálogo de login prende o foco, fecha com Esc e devolve o foco ao gatilho", async ({ page }) => {
    await openApp(page);
    const trigger = page.getByRole("button", { name: "Entrar", exact: true }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")))).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("o foco do teclado é visível nos controles interativos", async ({ page }) => {
    await openApp(page);
    await expect(page.locator(".nft-card").first()).toBeVisible();
    for (let i = 0; i < 3; i += 1) await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement as Element);
      return { width: parseFloat(style.outlineWidth), style: style.outlineStyle, shadow: style.boxShadow };
    });
    expect(outline.width > 0 && outline.style !== "none" ? true : outline.shadow !== "none").toBe(true);
  });

  test("o formulário de login valida e envia só pelo teclado", async ({ page }) => {
    await openApp(page);
    await page.getByRole("button", { name: "Entrar", exact: true }).first().focus();
    await page.keyboard.press("Enter");
    await page.locator("#auth-login-email").focus();
    await page.keyboard.type("contato@email.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("kurio1234");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.locator(".login-button.is-user")).toBeVisible();
  });
});
