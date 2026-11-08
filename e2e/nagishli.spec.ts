import { test, expect, waitForApp, axeViolations } from './fixtures';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const JQUERY = readFileSync(createRequire(import.meta.url).resolve('jquery/dist/jquery.min.js'), 'utf8');

/**
 * The NagishLi loader skips localhost, so these runs force it with ?nagishli=1. jQuery
 * (normally from code.jquery.com, stubbed out by the fixtures) comes from node_modules.
 */
async function openWidget(page: import('@playwright/test').Page, withCookieBar: boolean) {
  await page.route('https://code.jquery.com/**', (r) => r.fulfill({ contentType: 'application/javascript', body: JQUERY }));
  if (!withCookieBar) {
    await page.addInitScript(() => {
      localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false }));
    });
  }
  await page.goto('/dashboard?nagishli=1');
  await waitForApp(page);
  const trigger = page.locator('#NagishLiTrigger');
  await expect(trigger).toBeVisible({ timeout: 15_000 });
  return trigger;
}

const widget = (page: import('@playwright/test').Page) => page.locator('#NagishLiWidget');

test('accessibility widget opens, switches Hebrew and English, traps focus and closes on Escape', async ({ page }) => {
  const trigger = await openWidget(page, false);
  await trigger.click();
  await expect(widget(page)).toHaveClass(/nagishli-widget-show/);
  await expect(widget(page)).toContainText('Accessibility');
  await expect(widget(page)).toHaveAttribute('role', 'dialog');
  await expect(page.locator('#NagishLiCloseBtn')).toBeFocused();

  // Hebrew, then back to English
  await page.locator('#NagishLiLangChooser').click();
  await page.locator('#NagishLiLangOptions li', { hasText: 'עברית' }).click();
  await expect(widget(page)).toContainText('נגישות');
  await expect(widget(page)).toContainText('איפוס הגדרות');
  await page.locator('#NagishLiLangChooser').click();
  await page.locator('#NagishLiLangOptions li', { hasText: 'English' }).click();
  await expect(widget(page)).toContainText('Reset Settings');

  // Tab never leaves the panel while it is open
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('#NagishLiWidget'))).toBe(true);
  }
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => !!document.activeElement?.closest('#NagishLiWidget'))).toBe(true);

  const violations = await axeViolations(page);
  expect(violations.filter((v) => v.targets.some((t) => t.includes('NagishLi')))).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(widget(page)).not.toHaveClass(/nagishli-widget-show/);
  await expect(trigger).toBeFocused();
});

test('accessibility trigger does not cover the cookie bar buttons', async ({ page }) => {
  const trigger = await openWidget(page, true);
  const bar = page.getByTestId('cookie-consent');
  await expect(bar).toBeVisible();
  await page.waitForTimeout(500);
  const t = (await trigger.boundingBox())!;
  const b = (await bar.boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(b.y + 1);
});

test('accessibility trigger clears the bottom nav on phones', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'bottom nav is phone-only');
  const trigger = await openWidget(page, false);
  const nav = page.locator('nav.fixed.bottom-0').first();
  await expect(nav).toBeVisible();
  const t = (await trigger.boundingBox())!;
  const n = (await nav.boundingBox())!;
  expect(t.y + t.height).toBeLessThanOrEqual(n.y + 1);
});
