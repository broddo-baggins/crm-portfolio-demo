import { test, expect } from './fixtures';

/**
 * First visit, nothing cached: the dashboard must show its content quickly, never a
 * full-screen spinner or the login screen, and the console must stay clean.
 * The budget is 2.5 s on broadband; 4 s here leaves room for CI noise.
 */
test('cold load of /dashboard renders content fast, with no spinner and no console errors', async ({ page, problems }) => {
  const seen: string[] = [];
  await page.exposeFunction('__seen', (what: string) => seen.push(what));
  await page.addInitScript(() => {
    new MutationObserver(() => {
      // The full-screen spinners: auth check and the app-level route fallback
      if (document.querySelector('[data-testid="app-container"] > div > .animate-spin')) void (window as any).__seen('spinner');
      if (location.pathname.startsWith('/auth/login')) void (window as any).__seen('login');
    }).observe(document, { childList: true, subtree: true });
  });

  const start = Date.now();
  await page.goto('/dashboard');
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 10_000 });
  const elapsed = Date.now() - start;
  console.log(`cold load to dashboard content: ${elapsed} ms`);

  expect(elapsed).toBeLessThan(4000);
  expect(seen).toEqual([]);
  expect(problems.consoleErrors).toEqual([]);
});

test('the Nagishli language files are served as scripts, not the SPA page', async ({ request }) => {
  for (const lang of ['en', 'he']) {
    const res = await request.get(`/nagishli-files/lang/${lang}/core.${lang}.js`);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/javascript/);
  }
});
