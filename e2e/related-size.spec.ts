import { expect, test } from "@playwright/test";

test("os cards de 'Mais desta coleção' têm o mesmo tamanho", async ({ page }) => {
  for (const width of [1440, 1100, 414]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const href = await page.locator(".nft-card h2 a").first().getAttribute("href");
    await page.goto(href!);
    const items = page.locator(".related-grid li");
    await expect(items).toHaveCount(5);
    await page.locator(".related-grid").scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    const sizes = await items.evaluateAll((els) =>
      els.map((el) => {
        const art = el.querySelector(".related-art")!.getBoundingClientRect();
        return [Math.round(el.getBoundingClientRect().width), Math.round(art.height)];
      }),
    );
    expect(new Set(sizes.map(([w]) => w)).size).toBe(1);
    expect(new Set(sizes.map(([, h]) => h)).size).toBe(1);
  }
});
