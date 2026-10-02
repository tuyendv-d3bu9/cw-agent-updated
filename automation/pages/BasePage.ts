import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — phần dùng chung cho mọi màn của ShopGo.
 *
 * Quy tắc bắt buộc (knowledge/_project.md §6):
 *  1. CẤM page.goto(<path>) để chuyển màn — ShopGo không có router.
 *     Chỉ open() được gọi goto, và chỉ gọi tới trang chủ.
 *  2. Locator ưu tiên: #id có sẵn -> getByRole -> getByPlaceholder -> getByText.
 *     Bản đồ id đầy đủ: knowledge/features/shopgo-ui-map.md
 */
export class BasePage {
  readonly page: Page;

  // Thanh điều hướng — luôn hiển thị ở mọi màn
  readonly navShop: Locator;
  readonly navCheckout: Locator;
  readonly navOrders: Locator;
  readonly btnHeaderLogin: Locator;
  readonly btnUserProfile: Locator;
  readonly btnMenuProfile: Locator;
  readonly btnMenuOrders: Locator;
  readonly btnLogout: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navShop = page.locator('#btn-nav-shop');
    this.navCheckout = page.locator('#btn-nav-checkout');
    this.navOrders = page.locator('#btn-nav-orders');
    this.btnHeaderLogin = page.locator('#btn-header-login');
    this.btnUserProfile = page.locator('#btn-user-profile');
    this.btnMenuProfile = page.locator('#btn-menu-profile');
    this.btnMenuOrders = page.locator('#btn-menu-orders');
    this.btnLogout = page.locator('#btn-logout');
  }

  /** Mở trang chủ. Đây là nơi DUY NHẤT được phép gọi goto. */
  async open(): Promise<void> {
    await this.page.goto('/');
    await expect(this.navShop).toBeVisible();
  }

  /**
   * Dọn sạch trạng thái trình duyệt (4 khoá localStorage của ShopGo) rồi tải lại trang.
   * Phải gọi SAU open(), vì localStorage chỉ truy cập được khi đã ở đúng origin.
   */
  async resetState(): Promise<void> {
    await this.page.evaluate(() => {
      ['shopgo_user', 'shopgo_orders', 'shopgo_sqlite_orders_v1', 'shopgo_sqlite_queries_log']
        .forEach((key) => localStorage.removeItem(key));
    });
    await this.page.reload();
    await expect(this.navShop).toBeVisible();
  }

  async gotoShop(): Promise<void> {
    await this.navShop.click();
  }

  /**
   * Sang màn Thanh toán.
   *
   * CẢNH BÁO — hành vi thật của ShopGo: tab này bị chặn bởi đăng nhập **ngay từ lúc bấm nav**,
   * không phải lúc bấm đặt hàng. Chưa đăng nhập thì cửa sổ đăng nhập bật lên kèm thông báo
   * "Vui lòng đăng nhập để tiến hành thanh toán đơn hàng." và trang vẫn ở màn Cửa hàng.
   * Đăng nhập xong hệ thống mới tự chuyển sang Thanh toán.
   *
   * => Ca test cần thao tác trong giỏ hàng phải đăng nhập TRƯỚC.
   */
  async gotoCheckout(): Promise<void> {
    await this.navCheckout.click();
  }

  /** Sang màn Đơn hàng. Cũng yêu cầu đăng nhập, xem ghi chú ở gotoCheckout(). */
  async gotoOrders(): Promise<void> {
    await this.navOrders.click();
  }

  async logout(): Promise<void> {
    await this.btnUserProfile.click();
    await this.btnLogout.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.btnUserProfile.isVisible();
  }

  /**
   * Đổi chuỗi tiền của ShopGo thành số nguyên để so sánh.
   * Ví dụ: "1.234.567 ₫" -> 1234567
   * Dùng hàm này thay vì so sánh chuỗi thô — tránh vỡ vì khoảng trắng hẹp (U+00A0) và ký tự ₫.
   */
  static parseMoney(text: string): number {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') {
      throw new Error(`Không tìm thấy chữ số nào trong chuỗi tiền: "${text}"`);
    }
    return Number(digits);
  }
}
