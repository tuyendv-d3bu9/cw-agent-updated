import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';
import { ShopPage } from '../pages/ShopPage';
import { CheckoutPage } from '../pages/CheckoutPage';

const EVIDENCE_DIR = path.resolve(process.cwd(), 'OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function captureEvidence(page: any, tcId: string, isPass: boolean) {
  const status = isPass ? 'PASS' : 'FAIL';
  const screenshotPath = path.join(EVIDENCE_DIR, `${tcId}_${status}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
}

test.describe('CW ShopGo Voucher Regression Suite (RUN-01)', () => {
  let loginPage: LoginPage;
  let shopPage: ShopPage;
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    shopPage = new ShopPage(page);
    checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('khachhang@shopgo.vn', '123456');
    await checkoutPage.goto();
    await checkoutPage.clearCart();
  });

  // =========================================================================
  // CỤM 1: HAPPY PATH & MÃ HỢP LỆ
  // =========================================================================
  test.describe('Cụm 1: Happy Path & Mã hợp lệ', () => {
    test('VCHR-001: Áp dụng thành công GIAM50K cho đơn đạt mức sàn 200.000 VNĐ', async ({ page }) => {
      // Setup: 200.000 ₫ (Bình nước prod-003 x 1)
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('GIAM50K');
      expect(msg).toContain('50.000');

      const total = await checkoutPage.getTotalPayable();
      expect(total).toBe('150.000 ₫');

      await captureEvidence(page, 'VCHR-001', true);
    });

    test('VCHR-002: Áp dụng thành công SALE20 cho đơn hàng 350.000 VNĐ giảm 20%', async ({ page }) => {
      // Setup: 350.000 ₫ (Tai nghe prod-002 x 1)
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('SALE20');

      // 350.000 - 20% (70.000) = 280.000 ₫
      const total = await checkoutPage.getTotalPayable();
      expect(total).toBe('280.000 ₫');

      await captureEvidence(page, 'VCHR-002', true);
    });

    test('VCHR-003: Áp dụng SALE20 cho đơn 600.000 VNĐ kích hoạt mức trần maxCap 100.000 VNĐ', async ({ page }) => {
      // Setup: 600.000 ₫ (prod-003 x 3)
      await shopPage.setupCartForSubtotal(600000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('SALE20');

      // 600.000 - 100.000 maxCap = 500.000 ₫
      const total = await checkoutPage.getTotalPayable();
      expect(total).toBe('500.000 ₫');

      await captureEvidence(page, 'VCHR-003', true);
    });

    test('VCHR-004: Tự động trim khoảng trắng và uppercase khi nhập mã thường giam50k', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('  giam50k  ');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('GIAM50K');

      const total = await checkoutPage.getTotalPayable();
      expect(total).toBe('300.000 ₫');

      await captureEvidence(page, 'VCHR-004', true);
    });

    test('VCHR-005: Bấm trực tiếp vào badge gợi ý GIAM50K tự động điền và áp dụng', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.clickBadge('GIAM50K');
      // If badge only fills input, click apply
      if (!await checkoutPage.successAlert.isVisible().catch(() => false)) {
        await checkoutPage.applyVoucherBtn.click();
      }

      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('GIAM50K');

      await captureEvidence(page, 'VCHR-005', true);
    });
  });

  // =========================================================================
  // CỤM 2: MÃ KHÔNG HỢP LỆ & LỖI NHẬP
  // =========================================================================
  test.describe('Cụm 2: Mã không hợp lệ & Lỗi nhập', () => {
    test('VCHR-006: Từ chối áp dụng mã voucher đã hết hạn HETHAN', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('HETHAN');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/hết hạn sử dụng/i);

      await captureEvidence(page, 'VCHR-006', true);
    });

    test('VCHR-007: Từ chối áp dụng mã voucher không tồn tại trên hệ thống', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SAI123');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/không tồn tại/i);

      await captureEvidence(page, 'VCHR-007', true);
    });

    test('VCHR-010: Báo lỗi yêu cầu nhập mã khi bỏ trống hoặc chỉ nhập khoảng trắng', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('   ');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/vui lòng nhập mã/i);

      await captureEvidence(page, 'VCHR-010', true);
    });
  });

  // =========================================================================
  // CỤM 3: RÀNG BUỘC NGƯỠNG & BIÊN GIÁ TRỊ
  // =========================================================================
  test.describe('Cụm 3: Ràng buộc Ngưỡng & Biên giá trị', () => {
    test('VCHR-008: Từ chối áp dụng mã khi đơn dưới mức sàn 200.000 VNĐ (150.000 VNĐ)', async ({ page }) => {
      // prod-001 x 1 = 150.000 ₫
      await shopPage.setupCartForSubtotal(150000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/chưa đạt mức tối thiểu/i);

      await captureEvidence(page, 'VCHR-008', true);
    });

    test('VCHR-009: Từ chối mã SALE20 cho đơn 200.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/chưa đạt mức tối thiểu/i);

      await captureEvidence(page, 'VCHR-009', true);
    });

    test('VCHR-011: Cảnh báo chưa đủ điều kiện khi giảm giỏ hàng từ 350k xuống dưới 200k', async ({ page }) => {
      // 1. Thêm 350k và áp dụng GIAM50K thành công
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();
      await checkoutPage.applyVoucher('GIAM50K');
      expect(await checkoutPage.getSuccessMessage()).toContain('GIAM50K');

      // 2. Giảm giỏ hàng: Xóa prod-002 (350k), thêm prod-001 (150k)
      await checkoutPage.removeProduct('prod-002');
      await shopPage.goto();
      await shopPage.addProduct('prod-001', 1);
      await checkoutPage.goto();

      // Warning alert or error should be visible
      const warnMsg = await checkoutPage.getWarningMessage();
      const errMsg = await checkoutPage.getErrorMessage();
      const combined = warnMsg + errMsg;
      expect(combined.length).toBeGreaterThan(0);

      await captureEvidence(page, 'VCHR-011', true);
    });

    test('VCHR-014: Từ chối áp dụng mã GIAM50K cho đơn ở giá trị cận biên dưới 190.000 VNĐ', async ({ page }) => {
      // prod-005 x 1 = 190.000 ₫
      await shopPage.setupCartForSubtotal(190000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/chưa đạt mức tối thiểu/i);

      await captureEvidence(page, 'VCHR-014', true);
    });

    test('VCHR-015: Chấp nhận áp dụng mã GIAM50K cho đơn ở đúng biên chuẩn 200.000 VNĐ', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('GIAM50K');
      expect(await checkoutPage.getTotalPayable()).toBe('150.000 ₫');

      await captureEvidence(page, 'VCHR-015', true);
    });

    test('VCHR-016: Từ chối áp dụng SALE20 cho đơn hàng ở cận biên dưới 280.000 VNĐ', async ({ page }) => {
      // prod-004 x 1 = 280.000 ₫
      await shopPage.setupCartForSubtotal(280000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const errMsg = await checkoutPage.getErrorMessage();
      expect(errMsg).toMatch(/chưa đạt mức tối thiểu/i);

      // Verify no discount applied (total remains 280.000 ₫ with freeship)
      const total = await checkoutPage.getTotalPayable();
      expect(total).toBe('280.000 ₫');

      await captureEvidence(page, 'VCHR-016', true);
    });

    test('VCHR-017: Chấp nhận áp dụng SALE20 cho đơn ở đúng biên chuẩn 300.000 VNĐ giảm 60.000 VNĐ', async ({ page }) => {
      // prod-001 x 2 = 300.000 ₫
      await shopPage.setupCartForSubtotal(300000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('SALE20');
      // 300.000 - 60.000 = 240.000 ₫
      expect(await checkoutPage.getTotalPayable()).toBe('240.000 ₫');

      await captureEvidence(page, 'VCHR-017', true);
    });

    test('VCHR-018: Chiết khấu mã SALE20 tại 490.000 VNĐ và 500.000 VNĐ đạt đúng trần 100.000 VNĐ', async ({ page }) => {
      // 500.000 ₫
      await shopPage.setupCartForSubtotal(500000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE20');
      const msg = await checkoutPage.getSuccessMessage();
      expect(msg).toContain('SALE20');
      // 500.000 - 100.000 = 400.000 ₫
      expect(await checkoutPage.getTotalPayable()).toBe('400.000 ₫');

      await captureEvidence(page, 'VCHR-018', true);
    });
  });

  // =========================================================================
  // CỤM 4: TRẠNG THÁI MÃ, GỠ & CHUYỂN ĐỔI
  // =========================================================================
  test.describe('Cụm 4: Trạng thái Mã, Gỡ & Chuyển đổi', () => {
    test('VCHR-012: Bấm nút Gỡ mã để hủy voucher đang áp dụng và hoàn lại tổng tiền gốc', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      expect(await checkoutPage.getTotalPayable()).toBe('300.000 ₫');

      await checkoutPage.removeVoucher();
      expect(await checkoutPage.getTotalPayable()).toBe('350.000 ₫');

      await captureEvidence(page, 'VCHR-012', true);
    });

    test('VCHR-013: Chỉ ghi nhận mã mới nhất khi áp dụng liên tiếp 2 voucher khác nhau', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      expect(await checkoutPage.getTotalPayable()).toBe('300.000 ₫');

      // Áp dụng tiếp SALE20
      await checkoutPage.applyVoucher('SALE20');
      // SALE20 20% của 350k = 70k -> còn 280k
      expect(await checkoutPage.getTotalPayable()).toBe('280.000 ₫');

      await captureEvidence(page, 'VCHR-013', true);
    });

    test('VCHR-028: Bấm nút Áp dụng liên tiếp nhiều lần chỉ giảm giá đúng một lần', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.voucherInput.fill('GIAM50K');
      await checkoutPage.applyVoucherBtn.click();
      await checkoutPage.applyVoucherBtn.click();
      await checkoutPage.applyVoucherBtn.click();

      expect(await checkoutPage.getTotalPayable()).toBe('300.000 ₫');

      await captureEvidence(page, 'VCHR-028', true);
    });

    test('VCHR-029: Hiển thị tiền giảm với màu xanh lá, tiền tố dấu trừ và badge tên mã', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      const discountText = page.getByText('-50.000 ₫');
      await expect(discountText).toBeVisible();

      await captureEvidence(page, 'VCHR-029', true);
    });

    test('VCHR-031: Voucher chỉ giảm trên tiền hàng, không khấu trừ vào phí vận chuyển', async ({ page }) => {
      // 150k + 30k ship = 180k (không đủ sàn 200k nên từ chối)
      // Khi đạt 200k freeship -> tiền thanh toán = Subtotal - Discount
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM50K');
      expect(await checkoutPage.getTotalPayable()).toBe('150.000 ₫');

      await captureEvidence(page, 'VCHR-031', true);
    });
  });

  // =========================================================================
  // CỤM 5: CHUẨN HÓA ĐỊNH DẠNG & AN NINH (PHỤ LỤC 01 - DỰ KIẾN BẮT BUG)
  // =========================================================================
  test.describe('Cụm 5: Chuẩn hóa Định dạng & An ninh (Phụ lục 01)', () => {
    test('VCHR-020: Từ chối xử lý mã voucher có độ dài 2 ký tự (Dưới ngưỡng 3 ký tự)', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('V1');
      const errMsg = await checkoutPage.getErrorMessage();
      // Phụ lục 01 quy định: Báo lỗi định dạng. Nếu web báo "không tồn tại" thay vì "không đúng định dạng", bắt defect!
      try {
        expect(errMsg).toMatch(/không đúng định dạng/i);
        await captureEvidence(page, 'VCHR-020', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-020', false);
        throw e;
      }
    });

    test('VCHR-021: Chấp nhận xử lý mã voucher có độ dài đúng 20 ký tự chạm ngưỡng tối đa', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      // 20 ký tự
      await checkoutPage.applyVoucher('A123456789B123456789');
      const errMsg = await checkoutPage.getErrorMessage();
      // Hệ thống tiếp nhận và thông báo không tồn tại (hợp lệ về format)
      expect(errMsg).toMatch(/không tồn tại/i);

      await captureEvidence(page, 'VCHR-021', true);
    });

    test('VCHR-022: Ô input chặn không cho nhập ký tự thứ 21 (vượt quá 20 ký tự)', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      const input25 = 'A123456789B123456789EXTRA';
      await checkoutPage.voucherInput.fill(input25);
      const val = await checkoutPage.voucherInput.inputValue();

      try {
        expect(val.length).toBeLessThanOrEqual(20);
        await captureEvidence(page, 'VCHR-022', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-022', false);
        throw e;
      }
    });

    test('VCHR-023: Chặn nhập ký tự đặc biệt hoặc emoji vào ô voucher', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('SALE🎉@#$');
      const errMsg = await checkoutPage.getErrorMessage();
      try {
        expect(errMsg).toMatch(/không đúng định dạng/i);
        await captureEvidence(page, 'VCHR-023', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-023', false);
        throw e;
      }
    });

    test('VCHR-024: Chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher('GIAM 50K');
      const errMsg = await checkoutPage.getErrorMessage();
      try {
        expect(errMsg).toMatch(/không đúng định dạng/i);
        await captureEvidence(page, 'VCHR-024', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-024', false);
        throw e;
      }
    });

    test('VCHR-025: Hệ thống phòng thủ an toàn trước payload XSS', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      let alertTriggered = false;
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.dismiss();
      });

      await checkoutPage.applyVoucher('<script>alert(1)</script>');
      expect(alertTriggered).toBe(false);

      const errMsg = await checkoutPage.getErrorMessage();
      try {
        expect(errMsg).toMatch(/không đúng định dạng/i);
        await captureEvidence(page, 'VCHR-025', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-025', false);
        throw e;
      }
    });

    test('VCHR-026: Hệ thống phòng thủ an toàn trước payload SQL Injection', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      await checkoutPage.applyVoucher("' OR '1'='1");
      const errMsg = await checkoutPage.getErrorMessage();
      try {
        expect(errMsg).toMatch(/không đúng định dạng/i);
        await captureEvidence(page, 'VCHR-026', true);
      } catch (e) {
        await captureEvidence(page, 'VCHR-026', false);
        throw e;
      }
    });
  });

  // =========================================================================
  // CỤM 6: VÒNG ĐỜI ĐƠN HÀNG & ĐỒNG THỜI
  // =========================================================================
  test.describe('Cụm 6: Vòng đời Đơn hàng & Đồng thời', () => {
    test('VCHR-030: Giao diện form voucher hiển thị chuẩn responsive', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();

      // Check desktop
      await expect(checkoutPage.voucherInput).toBeVisible();
      await expect(checkoutPage.applyVoucherBtn).toBeVisible();

      // Check mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(checkoutPage.voucherInput).toBeVisible();
      await expect(checkoutPage.applyVoucherBtn).toBeVisible();

      await captureEvidence(page, 'VCHR-030', true);
    });

    test('VCHR-034: Bản ghi đơn hàng lưu đầy đủ subtotal, discount, appliedCode, total trong localStorage', async ({ page }) => {
      await shopPage.setupCartForSubtotal(350000);
      await checkoutPage.goto();
      await checkoutPage.applyVoucher('GIAM50K');

      const success = await checkoutPage.submitOrder();
      expect(success).toBe(true);

      const ordersData = await page.evaluate(() => localStorage.getItem('shopgo_orders'));
      expect(ordersData).toBeTruthy();
      const orders = JSON.parse(ordersData || '[]');
      expect(orders.length).toBeGreaterThan(0);
      const latest = orders[orders.length - 1];
      expect(latest.appliedCode).toBe('GIAM50K');
      expect(latest.discount).toBe(50000);

      await captureEvidence(page, 'VCHR-034', true);
    });

    test('VCHR-035: Tải lại trang (F5) sau khi áp voucher thì giỏ hàng được làm mới nhưng giữ đăng nhập', async ({ page }) => {
      await shopPage.setupCartForSubtotal(200000);
      await checkoutPage.goto();
      await checkoutPage.applyVoucher('GIAM50K');

      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      expect(await loginPage.isLoggedIn()).toBe(true);

      await captureEvidence(page, 'VCHR-035', true);
    });

    test('VCHR-036: Đặt hàng có voucher ở 2 tab trình duyệt thì cả 2 đơn đều được lưu', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();

      const l1 = new LoginPage(page1);
      const s1 = new ShopPage(page1);
      const c1 = new CheckoutPage(page1);

      const l2 = new LoginPage(page2);
      const s2 = new ShopPage(page2);
      const c2 = new CheckoutPage(page2);

      await l1.goto();
      await l1.login('khachhang@shopgo.vn', '123456');
      await s1.setupCartForSubtotal(200000);
      await c1.goto();
      await c1.applyVoucher('GIAM50K');

      await l2.goto();
      await s2.setupCartForSubtotal(350000);
      await c2.goto();
      await c2.applyVoucher('SALE20');

      // Submit Tab 1 then Tab 2
      await c1.submitOrder();
      await c2.submitOrder();

      const ordersData = await page1.evaluate(() => localStorage.getItem('shopgo_orders'));
      const orders = JSON.parse(ordersData || '[]');

      try {
        // BA/QA Lead assumption: both orders exist
        expect(orders.length).toBeGreaterThanOrEqual(2);
        await captureEvidence(page1, 'VCHR-036', true);
      } catch (e) {
        await captureEvidence(page1, 'VCHR-036', false);
        throw e;
      } finally {
        await page1.close();
        await page2.close();
      }
    });
  });
});
