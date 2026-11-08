import { test, expect, acceptCookies, waitForApp } from './fixtures';
import { ALL_ROUTES } from './routes';

/**
 * Demo mode, every route: a visitor's devtools must show no warnings (React keys,
 * deprecated APIs, missing translations, failed preloads), not only no errors.
 */
for (const route of ALL_ROUTES) {
  test(`${route.path} logs no warnings`, async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'warning') warnings.push(msg.text());
    });
    await acceptCookies(page);
    await page.goto(route.path);
    await waitForApp(page);
    await page.waitForTimeout(1000);
    expect(warnings).toEqual([]);
  });
}
