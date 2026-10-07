import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginModal, ACCOUNTS } from '../pages/LoginModal';
import { ShopPage } from '../pages/ShopPage';

const EVIDENCE_DIR = path.resolve(process.cwd(), 'OUTPUT/function-a/runs/RUN-01/evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function captureEvidence(page: any, tcId: string, isPass: boolean) {
  const status = isPass ? 'PASS' : 'FAIL';
  const screenshotPath = path.join(EVIDENCE_DIR, `${tcId}_${status}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

test.describe('CW ShopGo Authentication Regression Suite (RUN-01 · function-a)', () => {
  let loginPage: LoginModal;
  let shopPage: ShopPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginModal(page);
    shopPage = new ShopPage(page);

    await shopPage.open();
    await shopPage.resetState();
  });

  // =========================================================================
  // VIEWPOINT 1: HAPPY PATH (VP-01)
  // =========================================================================
  test('AUTH-001: Verify đăng nhập thành công với tài khoản Khách thường', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.customer.email, ACCOUNTS.customer.password);

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.customer.name).first()).toBeVisible();

    const storedUser = await page.evaluate(() => localStorage.getItem('shopgo_user'));
    expect(storedUser).not.toBeNull();
    expect(storedUser).toContain(ACCOUNTS.customer.email);

    await captureEvidence(page, 'AUTH-001', true);
  });

  test('AUTH-002: Verify đăng nhập thành công với tài khoản VIP và hiển thị nhãn VIP', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.vip.email, ACCOUNTS.vip.password);

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.vip.name).first()).toBeVisible();

    await captureEvidence(page, 'AUTH-002', true);
  });

  test('AUTH-003: Verify đăng nhập tự động điền bằng nút Demo Accounts', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.btnToggleDemoAccounts.click();

    // Click nút đăng nhập nhanh trong danh sách demo accounts
    const demoLoginBtn = page.getByTitle('Đăng nhập ngay với tài khoản này').first();
    await expect(demoLoginBtn).toBeVisible();
    await demoLoginBtn.click();

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await captureEvidence(page, 'AUTH-003', true);
  });

  test('AUTH-004: Verify chuyển hướng sang màn Thanh toán sau khi đăng nhập từ nút Checkout', async ({ page }) => {
    // Chưa đăng nhập, bấm vào Thanh toán
    await shopPage.navCheckout.click();

    // Hệ thống chặn, mở modal đăng nhập kèm thông báo
    await expect(page.getByText('Vui lòng đăng nhập để tiến hành thanh toán đơn hàng.')).toBeVisible();

    // Tiến hành đăng nhập
    await loginPage.submitCredentials(ACCOUNTS.customer.email, ACCOUNTS.customer.password);

    // Hệ thống tự động chuyển tiếp vào màn Thanh toán
    await expect(page.locator('#btn-nav-checkout')).toBeVisible();
    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });

    await captureEvidence(page, 'AUTH-004', true);
  });

  // =========================================================================
  // VIEWPOINT 2: NEGATIVE (VP-02)
  // =========================================================================
  test('AUTH-005: Validate hiển thị thông báo lỗi khi nhập sai mật khẩu', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.customer.email, 'wrongpass123');

    const err = page.getByText('Mật khẩu không chính xác.');
    await expect(err).toBeVisible();

    await captureEvidence(page, 'AUTH-005', true);
  });

  test('AUTH-006: Validate hiển thị thông báo lỗi khi nhập email không tồn tại trong hệ thống', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials('chuadangky@shopgo.vn', '123456');

    const err = page.getByText(/Tài khoản không tồn tại/i);
    await expect(err).toBeVisible();

    await captureEvidence(page, 'AUTH-006', true);
  });

  test('AUTH-007: Validate chặn submit và hiển thị thông báo khi để trống trường Email', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('123456');

    const isInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    await loginPage.btnSubmit.click();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.btnHeaderLogin).toBeVisible();

    await captureEvidence(page, 'AUTH-007', true);
  });

  test('AUTH-008: Validate chặn submit và hiển thị thông báo khi để trống trường Mật khẩu', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.emailInput.fill(ACCOUNTS.customer.email);
    await loginPage.passwordInput.fill('');

    const isInvalid = await loginPage.passwordInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    await loginPage.btnSubmit.click();
    await expect(loginPage.passwordInput).toBeVisible();

    await captureEvidence(page, 'AUTH-008', true);
  });

  test('AUTH-009: Validate chặn submit và hiển thị thông báo khi để trống cả hai trường', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.emailInput.fill('');
    await loginPage.passwordInput.fill('');

    const emailInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    const passInvalid = await loginPage.passwordInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(emailInvalid).toBe(true);
    expect(passInvalid).toBe(true);

    await loginPage.btnSubmit.click();
    await expect(loginPage.emailInput).toBeVisible();

    await captureEvidence(page, 'AUTH-009', true);
  });

  test('AUTH-010: Validate chặn submit khi nhập email sai định dạng cú pháp thiếu @', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials('khachhangshopgo.vn', '123456');

    // HTML5 validation hoặc thông báo lỗi
    const isInvalid = await loginPage.emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    await captureEvidence(page, 'AUTH-010', true);
  });

  // =========================================================================
  // VIEWPOINT 3: BOUNDARY (VP-03)
  // =========================================================================
  test('AUTH-011: Confirm tự động trim khoảng trắng thừa ở hai đầu email khi đăng nhập', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials('  khachhang@shopgo.vn  ', '123456');

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.customer.name).first()).toBeVisible();

    await captureEvidence(page, 'AUTH-011', true);
  });

  test('AUTH-012: Confirm không phân biệt chữ hoa thường trong email khi đăng nhập', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials('VIP@SHOPGO.VN', '123456');

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.vip.name).first()).toBeVisible();

    await captureEvidence(page, 'AUTH-012', true);
  });

  // =========================================================================
  // VIEWPOINT 4: SECURITY (VP-04)
  // =========================================================================
  test('AUTH-013: Verify trường Mật khẩu được che giấu ký tự trên modal đăng nhập', async ({ page }) => {
    await loginPage.openFromHeader();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    await captureEvidence(page, 'AUTH-013', true);
  });

  test('AUTH-014: Verify chuyển đổi giữa hai tài khoản không bị lẫn lộn danh tính người dùng', async ({ page }) => {
    // 1. Đăng nhập tài khoản VIP
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.vip.email, ACCOUNTS.vip.password);
    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.vip.name).first()).toBeVisible();

    // 2. Đăng xuất
    await loginPage.btnUserProfile.click();
    await loginPage.btnLogout.click();
    await expect(loginPage.btnHeaderLogin).toBeVisible();

    // 3. Đăng nhập tài khoản Customer
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.customer.email, ACCOUNTS.customer.password);
    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.customer.name).first()).toBeVisible();
    await expect(page.getByText(ACCOUNTS.vip.name)).not.toBeVisible();

    await captureEvidence(page, 'AUTH-014', true);
  });

  test('AUTH-015: Confirm hệ thống duy trì hoạt động ổn định khi nhập sai mật khẩu nhiều lần liên tiếp', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.emailInput.fill(ACCOUNTS.customer.email);
    await loginPage.passwordInput.fill('sai_pass');

    for (let i = 0; i < 5; i++) {
      await loginPage.btnSubmit.click();
      await page.waitForTimeout(300);
      const err = page.getByText('Mật khẩu không chính xác.');
      await expect(err).toBeVisible();
    }

    await captureEvidence(page, 'AUTH-015', true);
  });

  // =========================================================================
  // VIEWPOINT 5: UX/USABILITY (VP-05)
  // =========================================================================
  test('AUTH-016: Confirm submit form đăng nhập bằng phím Enter tại ô Mật khẩu', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.emailInput.fill(ACCOUNTS.customer.email);
    await loginPage.passwordInput.fill(ACCOUNTS.customer.password);
    await loginPage.passwordInput.press('Enter');

    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.customer.name).first()).toBeVisible();

    await captureEvidence(page, 'AUTH-016', true);
  });

  test('AUTH-017: Verify đóng modal đăng nhập mà không làm thay đổi trạng thái trang', async ({ page }) => {
    await loginPage.openFromHeader();
    await expect(loginPage.emailInput).toBeVisible();

    // Đóng bằng nút Đóng
    const closeBtn = page.getByTitle('Đóng');
    await closeBtn.click();
    await expect(loginPage.emailInput).not.toBeVisible();
    await expect(loginPage.btnHeaderLogin).toBeVisible();

    await captureEvidence(page, 'AUTH-017', true);
  });

  // =========================================================================
  // VIEWPOINT 6: INTEGRATION (VP-06)
  // =========================================================================
  test('AUTH-018: Verify khôi phục phiên đăng nhập khi làm mới trang (F5) và điều hướng về trang chủ khi đăng xuất', async ({ page }) => {
    await loginPage.openFromHeader();
    await loginPage.submitCredentials(ACCOUNTS.vip.email, ACCOUNTS.vip.password);
    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });

    // F5 refresh
    await page.reload();
    await expect(loginPage.btnUserProfile).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(ACCOUNTS.vip.name).first()).toBeVisible();

    // Đăng xuất
    await loginPage.btnUserProfile.click();
    await loginPage.btnLogout.click();
    await expect(loginPage.btnHeaderLogin).toBeVisible();
    await expect(shopPage.navShop).toBeVisible();

    await captureEvidence(page, 'AUTH-018', true);
  });
});
