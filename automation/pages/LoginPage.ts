import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object Model for ShopGo Authentication & Header
 */
export class LoginPage extends BasePage {
  readonly headerLoginBtn: Locator;
  readonly toggleDemoBtn: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitLoginBtn: Locator;
  readonly userProfileBtn: Locator;
  readonly logoutBtn: Locator;
  readonly authModal: Locator;

  constructor(page: Page) {
    super(page);
    this.headerLoginBtn = page.locator('#btn-header-login');
    this.toggleDemoBtn = page.locator('#btn-toggle-demo-accounts');
    this.emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitLoginBtn = page.locator('button:has-text("Đăng nhập")').last();
    this.userProfileBtn = page.locator('#btn-user-profile');
    this.logoutBtn = page.locator('#btn-logout');
    this.authModal = page.locator('#modal-auth');
  }

  async goto(): Promise<void> {
    await this.open();
  }

  async login(email: string = 'khachhang@shopgo.vn', password: string = '123456'): Promise<void> {
    // If already logged in, skip
    if (await this.userProfileBtn.isVisible().catch(() => false)) {
      return;
    }

    if (await this.headerLoginBtn.isVisible().catch(() => false)) {
      await this.headerLoginBtn.click();
      await this.page.waitForTimeout(300);
    }

    const emailBox = this.page.getByPlaceholder('Nhập email...');
    const passBox = this.page.getByPlaceholder('Nhập mật khẩu...');
    const loginNowBtn = this.page.getByRole('button', { name: 'Đăng nhập ngay' });

    if (await emailBox.isVisible().catch(() => false)) {
      await emailBox.fill(email);
      await passBox.fill(password);
      await loginNowBtn.click();
    } else {
      // If demo accounts are shown, click quick login button for first demo account
      const quickLoginBtn = this.page.locator('button:has-text("Đăng nhập")').nth(1);
      if (await quickLoginBtn.isVisible().catch(() => false)) {
        await quickLoginBtn.click();
      }
    }

    // Wait for login to complete and user profile button to become visible
    await this.userProfileBtn.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
  }

  async logout(): Promise<void> {
    if (await this.userProfileBtn.isVisible().catch(() => false)) {
      await this.userProfileBtn.click();
      if (await this.logoutBtn.isVisible().catch(() => false)) {
        await this.logoutBtn.click();
      }
    }
  }

  async isLoggedIn(): Promise<boolean> {
    return await this.userProfileBtn.isVisible().catch(() => false);
  }
}
