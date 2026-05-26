import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',
  globalSetup: './playwright/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Keep workers at 1 to stay under the auth rate-limiter (10 req/min per IP).
  // Parallel logins from multiple workers will hit 429 before the first test finishes.
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run dev',
        cwd: './frontend',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
      },
});
