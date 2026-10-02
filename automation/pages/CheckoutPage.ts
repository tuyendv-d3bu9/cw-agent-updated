import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Màn Thanh toán (tab `checkout`) — giỏ hàng, số lượng, voucher, tổng tiền, đặt hàng.
 */
export class CheckoutPage extends BasePage {
  readonly navCheckoutBtn: Locator;
  readonly voucherInput: Locator;
  readonly btnApplyVoucher: Locator;
  readonly btnRemoveVoucher: Locator;
  readonly applyVoucherBtn: Locator;
  readonly removeVoucherBtn: Locator;
  readonly badgeGiam50k: Locator;
  readonly badgeSale20: Locator;
  readonly badgeHeThan: Locator;
  readonly successAlert: Locator;
  readonly errorAlert: Locator;
  readonly warningAlert: Locator;
  readonly totalPayable: Locator;
  readonly totalPayableLabel: Locator;
  readonly btnSubmit: Locator;
  readonly submitCheckoutBtn: Locator;
  readonly btnCloseReceipt: Locator;
  readonly closeReceiptBtn: Locator;
  readonly clearOrdersTriggerBtn: Locator;
  readonly clearOrdersConfirmBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.navCheckoutBtn = this.navCheckout;
    this.voucherInput = page.locator('#input-voucher-code');
    this.btnApplyVoucher = page.locator('#btn-apply-voucher');
    this.applyVoucherBtn = this.btnApplyVoucher;
    this.btnRemoveVoucher = page.locator('#btn-remove-voucher');
    this.removeVoucherBtn = this.btnRemoveVoucher;
    this.badgeGiam50k = page.locator('#badge-voucher-GIAM50K');
    this.badgeSale20 = page.locator('#badge-voucher-SALE20');
    this.badgeHeThan = page.locator('#badge-voucher-HETHAN');
    this.successAlert = page.locator('div.bg-emerald-50');
    this.errorAlert = page.locator('div.bg-rose-50');
    this.warningAlert = page.locator('div.bg-amber-50');
    this.totalPayable = page.locator('#label-total-payable');
    this.totalPayableLabel = this.totalPayable;
    this.btnSubmit = page.locator('#btn-submit-checkout');
    this.submitCheckoutBtn = this.btnSubmit;
    this.btnCloseReceipt = page.locator('#btn-close-receipt');
    this.closeReceiptBtn = this.btnCloseReceipt;
    this.clearOrdersTriggerBtn = page.locator('#btn-trigger-clear-orders');
    this.clearOrdersConfirmBtn = page.locator('#btn-confirm-clear-orders');
  }

  async goto(): Promise<void> {
    await this.gotoCheckout();
  }

  qtyInput(productId: string): Locator {
    return this.page.locator(`#input-qty-${productId}`);
  }

  removeItemButton(productId: string): Locator {
    return this.page.locator(`#btn-remove-${productId}`);
  }

  voucherBadge(code: string): Locator {
    return this.page.locator(`#badge-voucher-${code}`);
  }

  /**
   * Đặt số lượng cho một dòng hàng.
   * Nhận `string` chứ không phải `number` — ô này nhận chuỗi tự do,
   * nên phải truyền được cả "abc", "-5", "" để kiểm thử ca âm tính.
   */
  async setQuantity(productId: string, value: string): Promise<void> {
    await this.qtyInput(productId).fill(value);
    await this.qtyInput(productId).blur();
  }

  async setProductQuantity(prodId: string, quantity: number): Promise<void> {
    await this.setQuantity(prodId, String(quantity));
  }

  async applyVoucher(code: string): Promise<void> {
    await this.voucherInput.fill(code);
    await this.btnApplyVoucher.click();
  }

  async clickBadge(code: 'GIAM50K' | 'SALE20' | 'HETHAN'): Promise<void> {
    const badge = this.page.locator(`#badge-voucher-${code}`);
    await badge.waitFor({ state: 'visible', timeout: 5000 });
    await badge.click();
  }

  async removeVoucher(): Promise<void> {
    await this.btnRemoveVoucher.click();
  }

  async removeProduct(prodId: string): Promise<void> {
    const removeBtn = this.removeItemButton(prodId);
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await this.page.waitForTimeout(200);
    }
  }

  async clearCart(): Promise<void> {
    for (let i = 1; i <= 6; i++) {
      const prodId = `prod-00${i}`;
      const removeBtn = this.removeItemButton(prodId);
      while (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.click();
        await this.page.waitForTimeout(100);
      }
    }
  }

  /** Tổng thanh toán dưới dạng số nguyên, ví dụ 330000. */
  async getTotalPayable(): Promise<number> {
    const text = await this.totalPayable.innerText();
    return BasePage.parseMoney(text);
  }

  /** Tổng thanh toán dưới dạng chuỗi hiển thị, ví dụ "330.000 ₫" */
  async getTotalPayableText(): Promise<string> {
    await this.totalPayableLabel.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.totalPayableLabel.textContent();
    return text ? text.replace(/\u00A0/g, ' ').trim() : '';
  }

  async getSuccessMessage(): Promise<string> {
    if (await this.successAlert.isVisible().catch(() => false)) {
      return (await this.successAlert.textContent())?.replace(/\u00A0/g, ' ').trim() || '';
    }
    return '';
  }

  async getErrorMessage(): Promise<string> {
    if (await this.errorAlert.isVisible().catch(() => false)) {
      return (await this.errorAlert.textContent())?.replace(/\u00A0/g, ' ').trim() || '';
    }
    if (await this.warningAlert.isVisible().catch(() => false)) {
      return (await this.warningAlert.textContent())?.replace(/\u00A0/g, ' ').trim() || '';
    }
    return '';
  }

  async getWarningMessage(): Promise<string> {
    if (await this.warningAlert.isVisible().catch(() => false)) {
      return (await this.warningAlert.textContent())?.replace(/\u00A0/g, ' ').trim() || '';
    }
    return '';
  }

  async submitOrder(): Promise<boolean> {
    if (await this.btnSubmit.isVisible().catch(() => false)) {
      await this.btnSubmit.click();
      if (await this.btnCloseReceipt.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.btnCloseReceipt.click();
        return true;
      }
      return true;
    }
    return false;
  }

  /**
   * Đợi hoá đơn điện tử hiện ra rồi đóng lại.
   * Tiến trình 4 giai đoạn của ShopGo mất khoảng 3,2 giây nên timeout phải rộng tay.
   */
  async waitForReceiptAndClose(timeout = 15_000): Promise<void> {
    await this.btnCloseReceipt.waitFor({ state: 'visible', timeout });
    await this.btnCloseReceipt.click();
  }
}
