import { expect, test } from '@playwright/test';
import { CheckoutVoucherPage } from '../pages/CheckoutVoucherPage';

const evidence = 'OUTPUT/function-d/runs/RUN-01_function-d/evidence';

test.afterEach(async ({ page }, testInfo) => {
  const outcome = testInfo.status === testInfo.expectedStatus ? 'pass' : 'fail';
  const id = testInfo.title.match(/(VCHR-\d+)/)?.[1] ?? 'unknown';
  await page.screenshot({ path: `${evidence}/${id}_${outcome}.png`, fullPage: true });
});

test('VCHR-001: Validate unauthenticated user is blocked before voucher application', async ({ page }) => {
  const checkout = new CheckoutVoucherPage(page);
  await checkout.addItemAndOpenCheckout();
  await expect(page.getByText('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.')).toBeVisible();
  await expect(checkout.voucherInput).toHaveCount(0);
});

test('VCHR-002: Verify GIAM50K is applied to an eligible order', async ({ page }) => {
  const checkout = new CheckoutVoucherPage(page);
  await checkout.addItemAndOpenCheckout();
  await checkout.loginAndOpenVoucher();
  await checkout.apply('GIAM50K');
  await expect(page.getByText(/Áp dụng thành công mã "GIAM50K"/i)).toBeVisible();
  await expect(page.getByText(/-50\.000\s*₫/)).toBeVisible();
});

test('VCHR-003: Verify a current voucher is not rejected as expired', async ({ page }) => {
  const checkout = new CheckoutVoucherPage(page);
  await checkout.addItemAndOpenCheckout();
  await checkout.loginAndOpenVoucher();
  await checkout.apply('HETHAN');
  await expect(page.getByText(/Mã giảm giá "HETHAN" đã hết hạn sử dụng/i)).toHaveCount(0);
});

test('VCHR-004: Verify unknown voucher message', async ({ page }) => {
  const checkout = new CheckoutVoucherPage(page);
  await checkout.addItemAndOpenCheckout();
  await checkout.loginAndOpenVoucher();
  await checkout.apply('INVALID');
  await expect(page.getByText(/Mã giảm giá "INVALID" không tồn tại trên hệ thống/i)).toBeVisible();
});
