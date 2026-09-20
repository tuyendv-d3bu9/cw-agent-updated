import { expect, Locator, Page } from '@playwright/test';

export class CheckoutVoucherPage {
  readonly voucherInput: Locator;
  readonly applyButton: Locator;
  readonly voucherError: Locator;

  constructor(private readonly page: Page) {
    this.voucherInput = page.locator('#input-voucher-code');
    this.applyButton = page.locator('#btn-apply-voucher');
    this.voucherError = page.locator('[role="alert"]');
  }

  async addItemAndOpenCheckout(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'networkidle' });
    await this.page.getByRole('button', { name: 'Thêm vào giỏ' }).nth(1).click();
    await this.page.getByRole('button', { name: 'Thanh toán' }).click();
  }

  async loginAndOpenVoucher(): Promise<void> {
    await this.page.getByPlaceholder('Nhập email...').fill('khachhang@shopgo.vn');
    await this.page.getByPlaceholder('Nhập mật khẩu...').fill('123456');
    await this.page.getByRole('button', { name: 'Đăng nhập ngay' }).click();
    await expect(this.voucherInput).toBeVisible();
  }

  async apply(code: string): Promise<void> {
    await this.voucherInput.fill(code);
    await this.applyButton.click();
  }
}
