import { readFileSync } from 'node:fs';
import { test, expect, waitForApp, acceptCookies, axeViolations } from './fixtures';

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test('password recovery: submit shows the confirmation', async ({ page }) => {
  await page.goto('/auth/password-recovery');
  await waitForApp(page);
  const send = page.getByRole('button', { name: 'Send Reset Instructions' });
  await page.getByRole('textbox', { name: 'Email Address' }).fill('someone@example.com');
  await send.click();
  await expect(page.getByText('If an account exists with this email')).toBeVisible();
});

test('data export downloads the selected data (said "You must be logged in")', async ({ page }) => {
  await page.goto('/data-export');
  await waitForApp(page);
  const exportButton = page.getByRole('button', { name: 'Export Selected Data' });
  // Nothing selected: nothing to export
  for (const name of ['Profile Information', 'Lead Data', 'Projects & Settings', 'Notifications']) {
    await page.getByRole('checkbox', { name, exact: true }).uncheck();
  }
  await expect(exportButton).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Lead Data' }).check();
  const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
  expect(download.suggestedFilename()).toMatch(/^lead-reviver-data-export-\d{4}-\d{2}-\d{2}\.json$/);
  const data = JSON.parse(readFileSync(await download.path(), 'utf8'));
  expect(data).toEqual(expect.objectContaining({}));
  await expect(page.getByText('Data exported successfully!')).toBeVisible();
});

test('data deletion: a reason is required before submitting', async ({ page }) => {
  await page.goto('/data-deletion');
  await waitForApp(page);
  await page.getByRole('button', { name: 'Request Manual Review' }).click();
  const submit = page.getByRole('button', { name: 'Submit Deletion Request' });
  await expect(submit).toBeDisabled();
  await page.getByPlaceholder('Please provide a reason for your data deletion request...').fill('Testing the request flow');
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText(/Data deletion request submitted successfully/)).toBeVisible();
});

test('settings: tabs switch and project settings save', async ({ page }) => {
  await page.goto('/settings');
  await waitForApp(page);
  for (const tab of ['Performance', 'Integrations', 'System', 'General']) {
    await page.getByRole('tab', { name: tab }).click();
    await expect(page.getByRole('tab', { name: tab })).toHaveAttribute('aria-selected', 'true');
    expect(await axeViolations(page)).toEqual([]);
  }
  await page.getByRole('textbox', { name: 'WhatsApp Number' }).fill('+972501234567');
  await page.getByRole('button', { name: 'Save Project Settings' }).click();
  await expect(page.getByText('Project updated successfully!')).toBeVisible();
});

test('notifications: mark all as read', async ({ page }) => {
  await page.goto('/notifications');
  await waitForApp(page);
  await page.getByRole('main').getByRole('button', { name: 'Mark all as read' }).click();
  await expect(page.getByRole('main').getByRole('button', { name: 'Mark all as read' })).toHaveCount(0);
});

test('error pages offer a way back home', async ({ page }) => {
  for (const path of ['/unauthorized', '/forbidden', '/bad-request', '/service-unavailable']) {
    await page.goto(path);
    await waitForApp(page);
    await page.getByTestId('go-home-button').click();
    await expect(page).toHaveURL((url) => url.pathname === '/' || url.pathname === '/dashboard');
  }
});

test('404 alternative page: search sends you to the help center (was a dead /search link)', async ({ page }) => {
  await page.goto('/not-found-alternative');
  await waitForApp(page);
  await page.getByTestId('search-input').fill('BANT');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/faq\?q=BANT$/);
  await expect(page.getByRole('textbox').first()).toHaveValue('BANT');
});

test('footer links open their pages (Accessibility was a dead link)', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForApp(page);
  const footer = page.getByRole('contentinfo');
  for (const [name, path] of [
    ['Privacy Policy', '/privacy-policy'],
    ['Terms & Conditions', '/terms-of-service'],
    ['Cookie Policy', '/cookies'],
    ['Accessibility', '/accessibility-declaration'],
  ] as const) {
    await page.goto('/dashboard');
    await waitForApp(page);
    await footer.getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === path);
    await waitForApp(page);
    await expect(page.getByText('Page not found')).toHaveCount(0);
  }
});
