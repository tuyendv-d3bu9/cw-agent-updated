import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for ShopGo Checkout & Voucher Application
 */
export class CheckoutPage {
  readonly page: Page;
  readonly navCheckoutBtn: Locator;
  readonly voucherInput: Locator;
  readonly applyVoucherBtn: Locator;
  readonly removeVoucherBtn: Locator;
  readonly badgeGiam50k: Locator;
  readonly badgeSale20: Locator;
  readonly badgeHeThan: Locator;
  readonly successAlert: Locator;
  readonly errorAlert: Locator;
  readonly warningAlert: Locator;
  readonly totalPayableLabel: Locator;
  readonly submitCheckoutBtn: Locator;
  readonly closeReceiptBtn: Locator;
  readonly clearOrdersTriggerBtn: Locator;
  readonly clearOrdersConfirmBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navCheckoutBtn = page.locator('#btn-nav-checkout');
    this.voucherInput = page.locator('#input-voucher-code');
    this.applyVoucherBtn = page.locator('#btn-apply-voucher');
    this.removeVoucherBtn = page.locator('#btn-remove-voucher');
    this.badgeGiam50k = page.locator('#badge-voucher-GIAM50K');
    this.badgeSale20 = page.locator('#badge-voucher-SALE20');
    this.badgeHeThan = page.locator('#badge-voucher-HETHAN');
    this.successAlert = page.locator('div.bg-emerald-50');
    this.errorAlert = page.locator('div.bg-rose-50');
    this.warningAlert = page.locator('div.bg-amber-50');
    this.totalPayableLabel = page.locator('#label-total-payable');
    this.submitCheckoutBtn = page.locator('#btn-submit-checkout');
    this.closeReceiptBtn = page.locator('#btn-close-receipt');
    this.clearOrdersTriggerBtn = page.locator('#btn-trigger-clear-orders');
    this.clearOrdersConfirmBtn = page.locator('#btn-confirm-clear-orders');
  }

  async goto() {
    if (await this.navCheckoutBtn.isVisible().catch(() => false)) {
      await this.navCheckoutBtn.click();
    } else {
      await this.page.goto('/#/checkout');
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async applyVoucher(code: string) {
    await this.voucherInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.voucherInput.fill(code);
    await this.applyVoucherBtn.click();
  }

  async clickBadge(code: 'GIAM50K' | 'SALE20' | 'HETHAN') {
    const badge = this.page.locator(`#badge-voucher-${code}`);
    await badge.waitFor({ state: 'visible', timeout: 5000 });
    await badge.click();
  }

  async removeVoucher() {
    await this.removeVoucherBtn.waitFor({ state: 'visible', timeout: 5000 });
    await this.removeVoucherBtn.click();
  }

  async setProductQuantity(prodId: string, quantity: number) {
    const qtyInput = this.page.locator(`#input-qty-${prodId}`);
    await qtyInput.waitFor({ state: 'visible', timeout: 5000 });
    await qtyInput.fill(String(quantity));
    // Trigger change event if needed
    await qtyInput.press('Enter');
    await this.page.waitForTimeout(200);
  }

  async removeProduct(prodId: string) {
    const removeBtn = this.page.locator(`#btn-remove-${prodId}`);
    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.click();
      await this.page.waitForTimeout(200);
    }
  }

  async clearCart() {
    // Remove all products currently listed
    for (let i = 1; i <= 6; i++) {
      const prodId = `prod-00${i}`;
      const removeBtn = this.page.locator(`#btn-remove-${prodId}`);
      while (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.click();
        await this.page.waitForTimeout(100);
      }
    }
  }

  async getTotalPayable(): Promise<string> {
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
    if (await this.submitCheckoutBtn.isVisible().catch(() => false)) {
      await this.submitCheckoutBtn.click();
      // Wait for modal receipt
      if (await this.closeReceiptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await this.closeReceiptBtn.click();
        return true;
      }
    }
    return false;
  }
}
