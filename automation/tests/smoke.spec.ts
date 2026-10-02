import { test, expect } from '@playwright/test';
import { ShopPage } from '../pages/ShopPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginModal, ACCOUNTS } from '../pages/LoginModal';

/**
 * SMOKE — bộ kiểm thử mồi, dùng để xác nhận môi trường đã sẵn sàng.
 *
 * Bộ này KHÔNG phải bài nộp. Học viên viết bài của mình vào file riêng
 * theo scope của đề, ví dụ: automation/tests/voucher.spec.ts
 *
 * Chạy:  npm run test:e2e
 * Xem báo cáo:  npm run test:report
 */

test.beforeEach(async ({ page }) => {
  const shop = new ShopPage(page);
  await shop.open();
  await shop.resetState();
});

test('SMOKE-01 Mở được trang chủ và thấy đủ 6 sản phẩm', async ({ page }) => {
  const shop = new ShopPage(page);
  await expect(shop.navShop).toBeVisible();
  expect(await shop.visibleProductCount()).toBe(6);
});

test('SMOKE-02 Chưa đăng nhập thì không vào được màn Thanh toán', async ({ page }) => {
  const shop = new ShopPage(page);
  const login = new LoginModal(page);

  await shop.addToCart('prod-001');
  await shop.gotoCheckout();

  // Hệ thống chặn ngay tại bước điều hướng, mở cửa sổ đăng nhập kèm thông báo.
  await expect(page.getByText('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.')).toBeVisible();
  await expect(login.emailInput).toBeVisible();
});

test('SMOKE-03 Đăng nhập bằng tài khoản mẫu thì vào được menu người dùng', async ({ page }) => {
  const login = new LoginModal(page);

  await login.loginAs('customer');

  await expect(login.btnUserProfile).toBeVisible();
  await expect(page.getByText(ACCOUNTS.customer.name).first()).toBeVisible();
});

test('SMOKE-04 Thêm sản phẩm vào giỏ thì tổng thanh toán đúng đơn giá', async ({ page }) => {
  const shop = new ShopPage(page);
  const login = new LoginModal(page);
  const checkout = new CheckoutPage(page);

  await login.loginAs('customer');
  // prod-003 giá 200.000 đ -> vừa chạm ngưỡng miễn phí vận chuyển thực tế của hệ thống
  await shop.addToCart('prod-003');
  await shop.gotoCheckout();

  await expect(checkout.qtyInput('prod-003')).toHaveValue('1');
  expect(await checkout.getTotalPayable()).toBe(200_000);
});

test('SMOKE-05 Áp mã GIAM50K cho đơn đủ điều kiện thì giảm đúng 50.000 đ', async ({ page }) => {
  const shop = new ShopPage(page);
  const login = new LoginModal(page);
  const checkout = new CheckoutPage(page);

  await login.loginAs('customer');
  // 2 x prod-001 (150.000) = 300.000 -> vượt mức tối thiểu 200.000 của GIAM50K
  await shop.addToCart('prod-001', 2);
  await shop.gotoCheckout();

  const truocKhiApMa = await checkout.getTotalPayable();
  await checkout.applyVoucher('GIAM50K');

  await expect(page.getByText('Áp dụng thành công mã')).toBeVisible();
  expect(await checkout.getTotalPayable()).toBe(truocKhiApMa - 50_000);
});
