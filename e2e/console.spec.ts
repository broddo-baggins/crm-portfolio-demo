import { test, expect, acceptCookies, waitForApp } from './fixtures';
import { ALL_ROUTES } from './routes';

/**
 * Production build, every route: console.log/info/debug calls are stripped at build time,
 * so a visitor's devtools shows no debug chatter (config details, "mock", cache notes).
 */
for (const route of ALL_ROUTES) {
  test(`${route.path} prints no console log/info/debug`, async ({ page }) => {
    const lines: string[] = [];
    page.on('console', (msg) => {
      if (['log', 'info', 'debug'].includes(msg.type())) lines.push(`${msg.type()}: ${msg.text()}`);
    });
    await acceptCookies(page);
    await page.goto(route.path);
    await waitForApp(page);
    await page.waitForTimeout(1000);
    expect(lines).toEqual([]);
  });
}
