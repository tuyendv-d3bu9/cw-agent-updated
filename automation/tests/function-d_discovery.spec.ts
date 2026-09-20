import { test } from '@playwright/test';

test('discover ShopGo navigation and voucher controls', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  console.log('BUTTONS:', JSON.stringify(await page.getByRole('button').allTextContents()));
  console.log('LINKS:', JSON.stringify(await page.getByRole('link').allTextContents()));
  await page.getByRole('button', { name: /2 Tài khoản có sẵn/ }).click();
  console.log('LOGIN-HELP:', (await page.locator('body').innerText()).match(/[\s\S]{0,200}Tài khoản có sẵn[\s\S]{0,700}/)?.[0]);
  await page.screenshot({ path: 'OUTPUT/function-d/discovery-home.png', fullPage: true });
});
