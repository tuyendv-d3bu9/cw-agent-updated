import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Màn Thanh toán (tab `checkout`) — giỏ hàng, số lượng, voucher, tổng tiền, đặt hàng. */
export class CheckoutPage extends BasePage {
  readonly voucherInput: Locator;
  readonly btnApplyVoucher: Locator;
  readonly btnRemoveVoucher: Locator;
  readonly totalPayable: Locator;
  readonly btnSubmit: Locator;
  readonly btnCloseReceipt: Locator;

  constructor(page: Page) {
    super(page);
    this.voucherInput = page.locator('#input-voucher-code');
    this.btnApplyVoucher = page.locator('#btn-apply-voucher');
    this.btnRemoveVoucher = page.locator('#btn-remove-voucher');
    this.totalPayable = page.locator('#label-total-payable');
    this.btnSubmit = page.locator('#btn-submit-checkout');
    this.btnCloseReceipt = page.locator('#btn-close-receipt');
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

  async applyVoucher(code: string): Promise<void> {
    await this.voucherInput.fill(code);
    await this.btnApplyVoucher.click();
  }

  async removeVoucher(): Promise<void> {
    await this.btnRemoveVoucher.click();
  }

  /** Tổng thanh toán dưới dạng số nguyên, ví dụ 330000. */
  async getTotalPayable(): Promise<number> {
    const text = await this.totalPayable.innerText();
    return BasePage.parseMoney(text);
  }

  async submitOrder(): Promise<void> {
    await this.btnSubmit.click();
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
