import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for ShopGo Automation
 */
export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false, // Run sequentially for shared localStorage and stability
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../automation/playwright-report', open: 'never' }],
    ['json', { outputFile: '../automation/test-results/results.json' }],
  ],
  use: {
    baseURL: 'https://cwshopgo.github.io',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    viewport: { width: 1280, height: 800 },
  },
  outputDir: './test-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
