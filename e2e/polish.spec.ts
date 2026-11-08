import { test, expect, waitForApp, acceptCookies } from './fixtures';

const isMobile = (name: string) => name === 'mobile';

test.describe('first load without cookie consent', () => {
  test('no toast covers the cookie bar and no admin toast appears', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    const bar = page.getByTestId('cookie-consent');
    await expect(bar).toBeVisible();
    // The pending-registrations notice used to appear after 3 s
    await page.waitForTimeout(4500);
    await expect(page.getByText(/pending user registration/)).toHaveCount(0);

    const barBox = (await bar.boundingBox())!;
    const toasts = page.locator('[data-sonner-toast], [role="status"][data-state], li[data-state="open"][role="status"]');
    for (const toast of await toasts.all()) {
      const box = await toast.boundingBox();
      if (!box) continue;
      expect(box.y + box.height, 'toast bottom is above the cookie bar').toBeLessThanOrEqual(barBox.y + 1);
    }
    await expect(page.getByRole('button', { name: 'Decline' })).toBeVisible();
    await page.getByRole('button', { name: 'Decline' }).click();
  });

  test('a toast raised while the bar is up stacks above it', async ({ page }) => {
    await page.goto('/reports');
    await waitForApp(page);
    await page.getByRole('button', { name: /Refresh Data/ }).click();
    const toast = page.locator('[data-sonner-toast]').first();
    await expect(toast).toBeVisible();
    const barBox = (await page.getByTestId('cookie-consent').boundingBox())!;
    const box = (await toast.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(barBox.y + 1);
  });
});

test.describe('header', () => {
  for (const width of [1024, 1280, 1440]) {
    test(`search and demo badge do not overlap at ${width}`, async ({ page }, info) => {
      test.skip(isMobile(info.project.name), 'desktop only');
      await acceptCookies(page);
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/dashboard');
      await waitForApp(page);
      const search = (await page.getByTestId('search-trigger').boundingBox())!;
      const badge = (await page.getByTestId('demo-badge').boundingBox())!;
      const hint = page.getByTestId('search-trigger').locator('kbd').first();
      expect(search.x + search.width, 'search ends before the badge').toBeLessThanOrEqual(badge.x);
      if (await hint.isVisible()) {
        const k = (await hint.boundingBox())!;
        expect(k.x + k.width).toBeLessThanOrEqual(search.x + search.width);
      }
    });
  }
});

test.describe('one source of numbers', () => {
  test('dashboard, sidebar, Reports and Leads show the same lead count and conversion', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'sidebar stats are desktop only');
    await acceptCookies(page);
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto('/dashboard');
    await waitForApp(page);
    const main = page.getByRole('main');
    const sidebar = page.getByTestId('main-sidebar');
    const sideValue = (label: string) => sidebar.getByText(label, { exact: true }).locator('xpath=following-sibling::dd');

    const total = (await page.getByTestId('metric-value-total-leads').locator('span').first().getAttribute('aria-label'))!;
    expect(Number(total)).toBeGreaterThan(20);
    await expect(sideValue('Leads Count')).toHaveText(total);
    const conversion = (await sideValue('Conversion').innerText()).trim();
    await expect(main.getByText(new RegExp(`${conversion.replace('%', '')}% conversion rate`, 'i')).first()).toBeVisible();

    await page.goto('/reports');
    await waitForApp(page);
    await expect(main.getByText('Total Leads', { exact: true }).first().locator('xpath=following-sibling::*[1]')).toContainText(total);
    await expect(main.getByText('Conversion Rate', { exact: true }).first().locator('xpath=following-sibling::*[1]')).toContainText(conversion);
    await expect(main.getByText(`${total} leads analyzed`)).toBeVisible();
    await expect(sideValue('Leads Count')).toHaveText(total);

    await page.goto('/leads');
    await waitForApp(page);
    await expect(main.getByText('Total Leads', { exact: true }).locator('xpath=following-sibling::p[1]')).toHaveText(total);
    await expect(main.getByText('Conversion Rate', { exact: true }).locator('xpath=following-sibling::p[1]')).toHaveText(conversion);
    await expect(sideValue('Leads Count')).toHaveText(total);
  });
});

test.describe('Leads page header', () => {
  test('titled Leads, never Offline in the demo', async ({ page }) => {
    await acceptCookies(page);
    await page.goto('/leads');
    await waitForApp(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Leads', exact: true })).toBeVisible();
    await expect(page.getByText('Live demo')).toBeVisible();
    await expect(page.getByText('Offline')).toHaveCount(0);
  });
});
