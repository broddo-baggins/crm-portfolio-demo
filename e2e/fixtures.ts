import { test as base, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

export interface PageProblems {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  /** Errors a test provokes on purpose (e.g. a 502 from a mocked API); everything else fails it */
  allowed: RegExp[];
}

/** Canned reply for the /api/ai-assistant function, which `vite preview` doesn't serve. */
export const AI_REPLY = 'Mocked assistant reply about BANT scoring.';

/**
 * Every test gets a page that records console errors, uncaught exceptions and failed
 * requests, and fails the test if any happened. Third-party hosts are stubbed so the
 * suite is hermetic; /api/ai-assistant answers with AI_REPLY unless a test overrides it.
 */
export const test = base.extend<{ problems: PageProblems }>({
  problems: [async ({ page }, use, testInfo) => {
    const problems: PageProblems = { consoleErrors: [], pageErrors: [], failedRequests: [], allowed: [] };
    const origin = new URL(testInfo.project.use.baseURL!).origin;

    page.on('console', (msg) => {
      if (msg.type() === 'error') problems.consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => problems.pageErrors.push(err.message));
    page.on('requestfailed', (req) => {
      const failure = req.failure()?.errorText ?? '';
      // Navigating away cancels in-flight requests; that's not a failure of the app
      if (failure.includes('ERR_ABORTED')) return;
      problems.failedRequests.push(`${req.method()} ${req.url()} ${failure}`);
    });
    page.on('response', (res) => {
      if (res.status() >= 400 && res.url().startsWith(origin)) {
        problems.failedRequests.push(`${res.request().method()} ${res.url()} -> ${res.status()}`);
      }
    });

    await page.route(
      (url) => url.origin !== origin,
      (route) => route.fulfill({ status: 204, body: '' }),
    );
    // Vercel serves its analytics scripts in production; `vite preview` doesn't
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
    );
    await page.route('**/api/ai-assistant', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: AI_REPLY, provider: 'gemini' }) }),
    );

    await use(problems);

    const unexpected = (list: string[]) => list.filter((msg) => !problems.allowed.some((re) => re.test(msg)));
    expect.soft(unexpected(problems.pageErrors), 'uncaught page errors').toEqual([]);
    expect.soft(unexpected(problems.consoleErrors), 'console errors').toEqual([]);
    expect.soft(unexpected(problems.failedRequests), 'failed requests').toEqual([]);
  }, { auto: true }],
});

export { expect };

/** Pre-answer the cookie banner (essential cookies only) so it doesn't cover the page. */
export async function acceptCookies(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cookie-consent', JSON.stringify({ essential: true, analytics: false, marketing: false }));
  });
}

/** Wait until the lazy-loaded route is on screen: no suspense/auth spinners left. */
export async function waitForApp(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByTestId('app-container')).toBeVisible();
  await expect(page.getByText(/^(Loading\.\.\.|Checking authentication\.\.\.)$/)).toHaveCount(0, { timeout: 20_000 });
  await page.waitForLoadState('networkidle');
}

/** axe-core WCAG 2 A/AA scan, colour contrast included. */
export async function axeViolations(page: Page) {
  // Entrance fades would be measured half-way (an ember button at 60% reads as 3:1).
  // Contrast is about the settled page: finish finite animations, then wait until
  // opacity and colours stop changing. Infinite ones (spinners, pulses) are left alone.
  await page.evaluate(async () => {
    const looping = new Set<Element>();
    for (const animation of document.getAnimations()) {
      const effect = animation.effect as KeyframeEffect | null;
      if (effect?.getComputedTiming().endTime === Infinity) {
        if (effect.target) looping.add(effect.target);
        continue;
      }
      try { animation.finish(); } catch { /* already finished or idle */ }
    }
    const snapshot = () => {
      let s = '';
      for (const el of document.querySelectorAll('body *')) {
        if (looping.has(el)) continue;
        const c = getComputedStyle(el);
        s += `${c.opacity}${c.color}${c.backgroundColor};`;
      }
      return s;
    };
    let previous = snapshot();
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 150));
      const current = snapshot();
      if (current === previous) return;
      previous = current;
    }
  });
  // evaluate() runs through the DevTools protocol, so the page's CSP doesn't block it
  await page.evaluate(AXE_SOURCE);
  const result = await page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    type Node = { target: string[]; any: { data?: { fgColor?: string; bgColor?: string; contrastRatio?: number } }[] };
    return r.violations.map((v: { id: string; impact: string; nodes: Node[] }) => ({
      id: v.id,
      impact: v.impact,
      targets: v.nodes.slice(0, 5).map((n) => {
        // For contrast, say which colours failed so the report is actionable
        const d = n.any[0]?.data;
        return d?.contrastRatio ? `${n.target.join(' ')} (${d.fgColor} on ${d.bgColor}, ${d.contrastRatio}:1)` : n.target.join(' ');
      }),
    }));
  });
  return result as Array<{ id: string; impact: string; targets: string[] }>;
}
