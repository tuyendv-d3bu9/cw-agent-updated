import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for ShopGo Voucher Automation
 */
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: {
    timeout: 8000
  },
  fullyParallel: false, // Run sequentially for shared localStorage and stability
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'https://cwshopgo.github.io',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
