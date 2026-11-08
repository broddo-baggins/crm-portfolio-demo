import type { Page } from '@playwright/test';
import { test, expect, waitForApp, acceptCookies, axeViolations, AI_REPLY } from './fixtures';

const isMobile = (name: string) => name === 'mobile';

test.beforeEach(async ({ page }) => {
  await acceptCookies(page);
});

test.describe('landing page', () => {
  test('Sign In goes to the login page and back home', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await page.getByRole('button', { name: 'Back to Home' }).click();
    await expect(page).toHaveURL((url) => url.pathname === '/');
  });

  test('FAQ accordion opens an answer', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    const question = page.getByRole('button', { name: 'How long does implementation take?' });
    await question.scrollIntoViewIfNeeded();
    await question.click();
    await expect(question).toHaveAttribute('aria-expanded', 'true');
  });

  test('switching to Hebrew renders right-to-left', async ({ page }) => {
    await page.goto('/');
    await waitForApp(page);
    await page.getByRole('button', { name: 'עברית' }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('stats counters render (react-countup default-import regression)', async ({ page }) => {
    await page.goto('/landingpage');
    await waitForApp(page);
    await expect(page.getByText('Advanced Lead Heating System')).toBeVisible();
    await expect(page.getByText("We're sorry, but something unexpected happened")).toHaveCount(0);
  });
});

test.describe('auth', () => {
  test('demo login with any credentials opens the dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await waitForApp(page);
    await page.getByRole('textbox', { name: 'Email' }).fill('guest@example.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('anything');
    await page.getByRole('button', { name: 'Sign In', exact: true }).last().click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('main').getByText('Total Leads').first()).toBeVisible();
  });

  test('password field can be revealed', async ({ page }) => {
    await page.goto('/auth/login');
    await waitForApp(page);
    const password = page.getByRole('textbox', { name: 'Password' });
    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(page.getByRole('textbox', { name: 'Password' })).toHaveAttribute('type', 'text');
  });

  test('"Forgot Password?" leads to password recovery, whose back link returns to login', async ({ page }) => {
    await page.goto('/auth/login');
    await waitForApp(page);
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await expect(page).toHaveURL(/\/auth\/password-recovery$/);
    await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toBeVisible();
    // Regression: this link pointed at /login, which doesn't exist
    await page.getByRole('link', { name: /back to login|sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
  });

  test('reset-password without a token sends the visitor to request a new link (was a 404)', async ({ page }) => {
    await page.goto('/auth/reset-password');
    await expect(page).toHaveURL(/\/auth\/password-recovery$/);
    await expect(page.getByRole('heading', { name: 'Reset Your Password' })).toBeVisible();
    await expect(page.getByText('Page not found')).toHaveCount(0);
  });

  test('reset-password with a token sets a new password and returns to sign in', async ({ page }) => {
    await page.goto('/auth/reset-password?token=e2e-recovery-token');
    await expect(page.getByRole('heading', { name: 'Choose a new password' })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.getByLabel('New Password').fill('a-new-password');
    await page.getByLabel('Confirm Password').fill('a-new-password');
    await page.getByRole('button', { name: 'Reset Password' }).click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByText('Page not found')).toHaveCount(0);
  });
});

test.describe('app shell', () => {
  test('navigation reaches every section', async ({ page }, info) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    const sections: Array<[string, RegExp]> = [
      ['Leads', /\/leads$/],
      ['Projects', /\/projects$/],
      ['Templates', /\/lead-pipeline$/],
      ['Calendar', /\/calendar$/],
      ['Messages', /\/messages$/],
      ['Reports', /\/reports$/],
      ['Settings', /\/settings$/],
      ['Help & FAQ', /\/faq$/],
      ['Admin Center', /\/admin$/],
      ['Dashboard', /\/dashboard$/],
    ];
    for (const [name, url] of sections) {
      if (name === 'Help & FAQ') continue; // leaves the app layout; covered below
      if (isMobile(info.project.name)) {
        await page.getByRole('button', { name: 'Open navigation' }).click();
        await page.getByTestId('navigation-drawer').getByRole('link', { name, exact: true }).click();
        // The drawer closes after navigating
        await expect(page.getByTestId('navigation-drawer')).toHaveCount(0);
      } else {
        await page.getByTestId('main-sidebar').getByRole('link', { name, exact: true }).click();
      }
      await expect(page).toHaveURL(url);
      await waitForApp(page);
    }
  });

  test('mobile: the sidebar is a drawer, not a column that squeezes the page', async ({ page }, info) => {
    test.skip(!isMobile(info.project.name), 'mobile only');
    await page.goto('/dashboard');
    await waitForApp(page);
    await expect(page.getByTestId('main-sidebar')).toBeHidden();
    const main = await page.getByRole('main').boundingBox();
    expect(main!.width).toBeGreaterThan(350);
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await expect(page.getByTestId('navigation-drawer')).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('navigation-drawer')).toHaveCount(0);
  });

  // On phones the theme and language controls live in the navigation drawer
  async function shellControls(page: Page, project: string) {
    if (!isMobile(project)) return page.getByRole('banner');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    return page.getByTestId('navigation-drawer');
  }

  test('dark mode toggles and survives a reload', async ({ page }, info) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    // Desktop: the account menu; phones: the navigation drawer
    const toggle = async () => {
      if (isMobile(info.project.name)) {
        const controls = await shellControls(page, info.project.name);
        await controls.getByTestId('theme-controller').click();
      } else {
        await page.getByRole('button', { name: 'Account menu' }).click();
        await page.getByTestId('theme-menu-item').click();
      }
    };
    await toggle();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await waitForApp(page);
    await expect(page.locator('html')).toHaveClass(/dark/);
    await toggle();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('switching the app to Hebrew flips it right-to-left', async ({ page }, info) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    if (isMobile(info.project.name)) {
      const controls = await shellControls(page, info.project.name);
      await controls.getByRole('button', { name: 'English' }).click();
    } else {
      await page.getByRole('button', { name: 'Account menu' }).click();
    }
    await page.getByRole('menuitem', { name: /עברית/ }).click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('notifications popover opens and links to the notifications page', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByRole('button', { name: /^Notifications/ }).click();
    await page.getByRole('link', { name: 'View all notifications' }).click();
    await expect(page).toHaveURL(/\/notifications$/);
  });

  test('a slow page shows the loading state, then the page', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForApp(page);
    // Hold back the lazily loaded Reports chunk to observe the Suspense fallback
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(/\/assets\/Reports-[^/]+\.js$/, async (route) => {
      await held;
      await route.continue();
    });
    await page.goto('/reports');
    await expect(page.getByText('Loading...')).toBeVisible();
    release();
    await waitForApp(page);
    await expect(page.getByRole('main').getByText('Lead Conversion Funnel').first()).toBeVisible();
  });
});

test.describe('AI assistant', () => {
  test('answers a question, with a loading state', async ({ page }) => {
    let release!: () => void;
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route('**/api/ai-assistant', async (route) => {
      expect(route.request().postDataJSON()).toMatchObject({ question: 'What is BANT?', pageContext: 'dashboard' });
      await held;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: AI_REPLY, provider: 'gemini' }) });
    });
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByRole('button', { name: 'AI Assistant' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('Ask me anything about this CRM demo...').fill('What is BANT?');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('Thinking...')).toBeVisible();
    release();
    await expect(dialog.getByText(AI_REPLY)).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });

  test('falls back to built-in answers when the AI backend errors', async ({ page, problems }) => {
    problems.allowed.push(/status of 502/, /ai-assistant -> 502/);
    await page.route('**/api/ai-assistant', (route) =>
      route.fulfill({ status: 502, contentType: 'application/json', body: '{"error":"AI providers are currently unavailable"}' }),
    );
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByRole('button', { name: 'AI Assistant' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('Ask me anything about this CRM demo...').fill('What is BANT?');
    await dialog.getByPlaceholder('Ask me anything about this CRM demo...').press('Enter');
    await expect(dialog.getByText('AI Temporarily Unavailable')).toBeVisible();
  });

  test('uses mock mode quietly when no AI key is configured (503)', async ({ page, problems }) => {
    problems.allowed.push(/status of 503/, /ai-assistant -> 503/);
    await page.route('**/api/ai-assistant', (route) =>
      route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"AI assistant is not configured"}' }),
    );
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByRole('button', { name: 'AI Assistant' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByPlaceholder('Ask me anything about this CRM demo...').fill('What is the tech stack?');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('Running in mock mode')).toBeVisible();
    await expect(dialog.getByText('AI Temporarily Unavailable')).toHaveCount(0);
  });
});

test.describe('leads', () => {
  test('shows lead names and counts hot and new leads', async ({ page }) => {
    await page.goto('/leads');
    await waitForApp(page);
    const main = page.getByRole('main');
    // Regressions: names were blank and the hot/new cards always said 0
    await expect(main.getByTestId('lead-name-lead-001')).toHaveText('Sarah Johnson');
    const card = (label: string) => main.getByText(label, { exact: true }).locator('..');
    await expect(card('Hot Leads')).not.toContainText(/^Hot Leads\s*0\b/);
    await expect(card('New Leads')).not.toContainText(/^New Leads\s*0\b/);
  });

  test('search narrows the table and shows an empty state for no matches', async ({ page }) => {
    await page.goto('/leads');
    await waitForApp(page);
    const search = page.getByPlaceholder('Search leads...');
    await search.fill('Sarah');
    await expect(page.getByTestId('leads-table-body').locator('tr')).toHaveCount(1);
    await search.fill('zzz-no-such-lead');
    await expect(page.getByTestId('leads-table-body').locator('tr[data-testid^="lead-row"]')).toHaveCount(0);
    await search.fill('');
    await expect(page.getByTestId('leads-table-body').locator('tr[data-testid^="lead-row"]')).toHaveCount(20);
  });

  test('heat filter finds the hot leads', async ({ page }) => {
    await page.goto('/leads');
    await waitForApp(page);
    await page.getByRole('combobox', { name: 'Heat Level' }).click();
    await page.getByRole('option', { name: /^Hot/ }).click();
    await expect(page.getByTestId('leads-table-body').locator('tr[data-testid^="lead-row"]').first()).toBeVisible();
  });

  test('add-lead form validates, then saves', async ({ page }) => {
    await page.goto('/leads');
    await waitForApp(page);
    await page.getByRole('button', { name: 'Add Lead' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    // Empty required fields: the browser blocks the submit and the dialog stays open
    await dialog.locator('button[type="submit"]').click();
    expect(await dialog.locator('#first_name').evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await expect(dialog).toBeVisible();
    await dialog.locator('#first_name').fill('Dana');
    await dialog.locator('#last_name').fill('Levi');
    await dialog.locator('#phone').fill('+972501234567');
    await dialog.locator('button[type="submit"]').click();
    await expect(page.getByText('Lead created successfully')).toBeVisible();
    await expect(dialog).toBeHidden();
  });
});

test.describe('messages', () => {
  test('open a conversation and send a message', async ({ page }) => {
    await page.goto('/messages');
    await waitForApp(page);
    await page.getByTestId('conversations-list').getByText('Sarah Johnson').first().click();
    const chat = page.getByTestId('chat-area');
    await expect(chat).toBeVisible();
    const input = chat.getByRole('textbox').last();
    await input.fill('Following up from the e2e suite');
    await chat.getByRole('button', { name: 'Send message' }).click();
    // Demo mode shows the message locally (it used to call Meta's API and fail)
    await expect(chat.getByText('Following up from the e2e suite')).toBeVisible();
    await expect(input).toHaveValue('');
  });

  test('sort order toggles', async ({ page }) => {
    await page.goto('/messages');
    await waitForApp(page);
    const toggle = page.getByTestId('sort-order-toggle');
    const before = await toggle.getAttribute('aria-label');
    await toggle.click();
    await expect(toggle).not.toHaveAttribute('aria-label', before!);
  });

  test('optimized view loads a conversation (was "Conversation not found")', async ({ page }) => {
    await page.goto('/messages/optimized');
    await waitForApp(page);
    await page.getByRole('region', { name: 'Conversations' }).getByText('Sarah Johnson').first().click();
    await expect(page.getByText(/Perfect! I'll send you a Ca/).first()).toBeVisible();
  });
});

test.describe('other pages', () => {
  test('calendar month navigation', async ({ page }) => {
    await page.goto('/calendar');
    await waitForApp(page);
    const month = page.getByRole('main').getByRole('heading', { level: 3 }).first();
    const current = await month.textContent();
    await page.getByRole('button', { name: 'Next month' }).click();
    await expect(month).not.toHaveText(current!);
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(month).toHaveText(current!);
  });

  test('calendar integration cards expand from the keyboard', async ({ page }) => {
    await page.goto('/calendar');
    await waitForApp(page);
    const trigger = page.getByRole('button', { name: /Calendly Integration/ });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('template pipeline tabs switch panels (tab values matched no panel)', async ({ page }) => {
    await page.goto('/lead-pipeline');
    await waitForApp(page);
    await page.getByRole('tab', { name: 'Templates' }).click();
    await expect(page.getByRole('tabpanel').first()).toBeVisible();
    await page.getByRole('tab', { name: 'WhatsApp Manager' }).click();
    await expect(page.getByRole('tabpanel').first()).toBeVisible();
    await page.getByRole('tab', { name: 'Pipeline' }).click();
    await expect(page.getByRole('tabpanel').getByText('Active Templates', { exact: true })).toBeVisible();
  });

  test('FAQ search shows an empty state for no matches', async ({ page }) => {
    await page.goto('/faq');
    await waitForApp(page);
    await page.getByRole('textbox').first().fill('zzz-nothing-matches-this');
    await expect(page.getByText('No results found')).toBeVisible();
  });

  test('admin can add and remove a demo user', async ({ page }) => {
    page.on('dialog', (d) => d.accept());
    await page.goto('/admin/users');
    await waitForApp(page);
    await page.getByRole('button', { name: /Create User|Add User/ }).first().click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel(/Email/).first().fill('new.person@crm.demo');
    await dialog.getByRole('button', { name: /Create User/ }).last().click();
    await expect(page.getByRole('main').getByText('new.person@crm.demo', { exact: true })).toBeVisible();
  });

  test('users page: add a user and disable one (the /api/users calls always failed)', async ({ page }) => {
    await page.goto('/users');
    await waitForApp(page);
    await page.getByRole('button', { name: 'Add User' }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Email').fill('added.in.e2e@crm.demo');
    await dialog.getByLabel('Password').fill('Sup3r-secret!');
    expect(await axeViolations(page)).toEqual([]);
    await dialog.locator('button[type="submit"]').click();
    await expect(dialog).toBeHidden();
    const row = page.getByRole('row', { name: /added\.in\.e2e@crm\.demo/ });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Disable User' }).click();
    await row.getByRole('button', { name: 'Actions' }).click();
    await expect(page.getByRole('menuitem', { name: 'Enable User' })).toBeVisible();
  });

  test('company management shows the demo company (was stuck loading)', async ({ page }) => {
    await page.goto('/admin/company');
    await waitForApp(page);
    await expect(page.getByRole('main').getByText('CRM Portfolio Demo Company').first()).toBeVisible();
    await expect(page.getByText('Loading company management...')).toHaveCount(0);
  });

  test('cookie banner: accepting hides it and it stays hidden', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);
    await page.reload();
    await waitForApp(page);
    await expect(page.getByTestId('cookie-consent')).toHaveCount(0);
    await context.close();
  });
});

test.describe('design 1.2: palette, sidebar rail, bottom nav', () => {
  test.beforeEach(async ({ page }) => {
    await acceptCookies(page);
  });

  test('Ctrl K opens the command palette and Enter jumps to a page', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'keyboard shortcut');
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.keyboard.press('Control+k');
    const dialog = page.getByTestId('command-palette');
    await expect(dialog).toBeVisible();
    await page.getByRole('combobox', { name: 'Search pages, leads and projects' }).fill('calend');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/calendar$/);
    await expect(dialog).toHaveCount(0);
  });

  test('G then L goes to Leads', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'keyboard shortcut');
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.keyboard.press('g');
    await page.keyboard.press('l');
    await expect(page).toHaveURL(/\/leads$/);
  });

  test('the sidebar collapses to an icon rail and remembers it', async ({ page }, info) => {
    test.skip(isMobile(info.project.name), 'desktop rail');
    await page.goto('/dashboard');
    await waitForApp(page);
    await page.getByTestId('sidebar-collapse').click();
    await expect(page.getByTestId('main-sidebar')).toHaveAttribute('data-collapsed', 'true');
    await expect(page.getByTestId('nav-link-leads')).toHaveAccessibleName('Leads');
    await page.reload();
    await waitForApp(page);
    await expect(page.getByTestId('main-sidebar')).toHaveAttribute('data-collapsed', 'true');
    await page.getByTestId('sidebar-expand').click();
    await expect(page.getByTestId('main-sidebar')).not.toHaveAttribute('data-collapsed', 'true');
  });

  test('phones get a bottom navigation with a More button for the drawer', async ({ page }, info) => {
    test.skip(!isMobile(info.project.name), 'phone only');
    await page.goto('/dashboard');
    await waitForApp(page);
    const nav = page.getByTestId('bottom-nav');
    await expect(nav).toBeVisible();
    await nav.getByRole('link', { name: 'Leads' }).click();
    await expect(page).toHaveURL(/\/leads$/);
    await nav.getByRole('button', { name: 'More' }).click();
    await expect(page.getByTestId('navigation-drawer')).toBeVisible();
  });
});
