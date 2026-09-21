import { defineConfig, devices } from '@playwright/test';

/**
 * Cấu hình Playwright cho SUT ShopGo.
  */
export default defineConfig({
  testDir: './automation/tests',
  timeout: 45_000,
  expect: { timeout: 10_000 },

  fullyParallel: true,
  retries: 0,
  workers: 2,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'automation/playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'https://cwshopgo.github.io',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    actionTimeout: 10_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },

  outputDir: 'automation/test-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
