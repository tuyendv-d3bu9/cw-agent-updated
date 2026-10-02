import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type Category = 'Tất cả' | 'Thời trang' | 'Công nghệ' | 'Gia dụng';

/**
 * Màn Cửa hàng (tab `shop`) — danh sách sản phẩm, tìm kiếm, lọc danh mục.
 */
export class ShopPage extends BasePage {
  readonly searchInput: Locator;
  readonly emptyResultMessage: Locator;
  readonly navShopBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.navShopBtn = this.navShop;
    this.searchInput = page.getByPlaceholder('Tìm theo tên sản phẩm...');
    this.emptyResultMessage = page.getByText('Không có kết quả khớp với từ khóa');
  }

  /** Điều hướng tới màn Shop */
  async goto(): Promise<void> {
    if (await this.navShop.isVisible().catch(() => false)) {
      await this.navShop.click();
    } else {
      await this.open();
    }
  }

  /** Nút "Thêm vào giỏ" của một sản phẩm. `productId` dạng `prod-001`. */
  addToCartButton(productId: string): Locator {
    return this.page.locator(`#btn-add-${productId}`);
  }

  /** Thêm sản phẩm vào giỏ hàng `times` lần */
  async addToCart(productId: string, times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.addToCartButton(productId).click();
      if (times > 1) {
        await this.page.waitForTimeout(100);
      }
    }
  }

  /** Alias cho addToCart */
  async addProduct(prodId: string, clicks: number = 1): Promise<void> {
    await this.addToCart(prodId, clicks);
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword);
  }

  async clearSearch(): Promise<void> {
    await this.searchInput.fill('');
  }

  async filterByCategory(category: Category): Promise<void> {
    await this.page.getByRole('button', { name: category, exact: true }).click();
  }

  /** Số sản phẩm đang hiển thị, đếm qua số nút "Thêm vào giỏ" nhìn thấy được. */
  async visibleProductCount(): Promise<number> {
    return this.page.locator('[id^="btn-add-prod-"]').count();
  }

  /**
   * Helper thiết lập giỏ hàng để đạt ngưỡng subtotal mong muốn
   */
  async setupCartForSubtotal(targetAmount: number): Promise<void> {
    await this.goto();
    if (targetAmount === 150000) {
      await this.addToCart('prod-001', 1);
    } else if (targetAmount === 190000) {
      await this.addToCart('prod-005', 1);
    } else if (targetAmount === 200000) {
      await this.addToCart('prod-003', 1);
    } else if (targetAmount === 280000) {
      await this.addToCart('prod-004', 1);
    } else if (targetAmount === 300000) {
      await this.addToCart('prod-001', 2);
    } else if (targetAmount === 350000) {
      await this.addToCart('prod-002', 1);
    } else if (targetAmount === 490000) {
      await this.addToCart('prod-005', 1);
      await this.addToCart('prod-001', 2);
    } else if (targetAmount === 500000) {
      await this.addToCart('prod-001', 2);
      await this.addToCart('prod-003', 1);
    } else if (targetAmount === 600000) {
      await this.addToCart('prod-003', 3);
    } else {
      await this.addToCart('prod-002', 1);
    }
  }
}
