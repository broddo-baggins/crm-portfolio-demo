import { test, expect, waitForApp, axeViolations } from './fixtures';
import { ALL_ROUTES } from './routes';

/**
 * Every route, at desktop (1440x900) and mobile (390x844): the right page renders,
 * redirects land where they should, nothing crashes into the error boundary, every
 * control is on screen, and axe finds no WCAG 2.1 A/AA violations. The fixture fails
 * the test on any console error, uncaught exception or failed request.
 */
for (const route of ALL_ROUTES) {
  test(`${route.path} renders`, async ({ page }) => {
    // First visit: the cookie banner is part of what axe checks
    await page.goto(route.path);
    await waitForApp(page);

    await expect(page).toHaveURL((url) => url.pathname === (route.redirectsTo ?? route.path));
    const scope = route.inMain ? page.getByRole('main') : page.locator('body');
    await expect(scope.getByText(route.expect).first()).toBeVisible();
    // The error boundary's own message (the 500 page legitimately says "Something went wrong")
    await expect(page.getByText("We're sorry, but something unexpected happened")).toHaveCount(0);
    await expect(page.getByTestId('error-boundary')).toHaveCount(0);

    // No horizontal page scroll, and no button/link pushed past the right edge
    const layout = await page.evaluate(() => {
      const scrollsX = (el: Element | null) => {
        for (let p = el?.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if (o === 'auto' || o === 'scroll') return true;
        }
        return false;
      };
      const clipped = [...document.querySelectorAll('button, a[href], input, select, [role="button"]')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && r.right > window.innerWidth + 1 && !scrollsX(el);
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`);
      return { overflow: document.documentElement.scrollWidth - window.innerWidth, clipped: clipped.slice(0, 5) };
    });
    expect(layout.overflow, 'horizontal page overflow (px)').toBeLessThanOrEqual(0);
    expect(layout.clipped, 'controls past the right edge').toEqual([]);

    expect(await axeViolations(page)).toEqual([]);
  });
}

test('unknown top-level path shows the 404 page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await waitForApp(page);
  await expect(page.getByText('Page not found')).toBeVisible();
  await page.getByText('Return to Home').click();
  await expect(page).toHaveURL((url) => url.pathname === '/');
});

test('unknown path inside the app shows the 404 page', async ({ page }) => {
  await page.goto('/admin/does-not-exist');
  await waitForApp(page);
  await expect(page.getByText('Page not found')).toBeVisible();
});

test('the removed /admin/app-layout shell now 404s instead of rendering an empty page', async ({ page }) => {
  await page.goto('/admin/app-layout');
  await waitForApp(page);
  await expect(page.getByText('Page not found')).toBeVisible();
});
