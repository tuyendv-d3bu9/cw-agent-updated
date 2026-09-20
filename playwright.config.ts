import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './automation/tests',
  timeout: 30_000,
  use: {
    baseURL: 'https://cwshopgo.github.io',
    headless: true,
    screenshot: 'off',
    trace: 'retain-on-failure',
  },
});
