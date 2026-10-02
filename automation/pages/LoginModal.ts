import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Tài khoản mẫu có sẵn trên ShopGo (knowledge/features/shopgo-ui-map.md §6.1). */
export const ACCOUNTS = {
  customer: { email: 'khachhang@shopgo.vn', password: '123456', name: 'Nguyễn Văn An' },
  vip: { email: 'vip@shopgo.vn', password: '123456', name: 'Trần Thị Mai (VIP)' },
} as const;

/** Cửa sổ đăng nhập — mở bằng #btn-header-login, hoặc tự bật khi đặt hàng lúc chưa đăng nhập. */
export class LoginModal extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly btnSubmit: Locator;
  readonly btnToggleDemoAccounts: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByPlaceholder('Nhập email...');
    this.passwordInput = page.getByPlaceholder('Nhập mật khẩu...');
    this.btnSubmit = page.getByRole('button', { name: 'Đăng nhập ngay' });
    this.btnToggleDemoAccounts = page.locator('#btn-toggle-demo-accounts');
  }

  async openFromHeader(): Promise<void> {
    await this.btnHeaderLogin.click();
    await this.emailInput.waitFor({ state: 'visible' });
  }

  /** Điền form và bấm đăng nhập. Không tự kiểm tra kết quả — để test tự assert. */
  async submitCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.btnSubmit.click();
  }

  /** Đăng nhập đầy đủ từ header, dùng cho phần chuẩn bị của các ca test khác. */
  async loginAs(account: keyof typeof ACCOUNTS): Promise<void> {
    const { email, password } = ACCOUNTS[account];
    await this.openFromHeader();
    await this.submitCredentials(email, password);
    await this.btnUserProfile.waitFor({ state: 'visible' });
  }

  /**
   * Đăng nhập bằng email/mật khẩu tuỳ ý, bỏ qua nếu đã đăng nhập sẵn.
   *
   * Khác `loginAs()` ở chỗ nhận thẳng thông tin đăng nhập thay vì tên tài khoản
   * mẫu — cần cho các ca kiểm thử tự dựng tài khoản hoặc chạy nhiều tab.
   */
  async login(email: string, password: string): Promise<void> {
    if (await this.btnUserProfile.isVisible().catch(() => false)) return;
    await this.openFromHeader();
    await this.submitCredentials(email, password);
    await this.btnUserProfile.waitFor({ state: 'visible' });
  }

  /** Đã đăng nhập hay chưa — nhận biết qua nút hồ sơ trên header. */
  async isLoggedIn(): Promise<boolean> {
    return this.btnUserProfile.isVisible().catch(() => false);
  }
}
