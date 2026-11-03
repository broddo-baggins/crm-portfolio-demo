import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4731);

/**
 * End-to-end suite. Runs against the production build served by `vite preview`,
 * at the two viewports the app is designed for.
 *
 *   npm run test:e2e            # builds first
 *   E2E_SKIP_BUILD=1 npm run test:e2e
 */
export default defineConfig({
  testDir: '.',
  outputDir: '../test-results/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : 4,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `${process.env.E2E_SKIP_BUILD ? '' : 'npm run build && '}npx vite preview --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    cwd: '..',
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
