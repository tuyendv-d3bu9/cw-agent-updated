import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export type Category = 'Tất cả' | 'Thời trang' | 'Công nghệ' | 'Gia dụng';

/** Màn Cửa hàng (tab `shop`) — danh sách sản phẩm, tìm kiếm, lọc danh mục. */
export class ShopPage extends BasePage {
  readonly searchInput: Locator;
  readonly emptyResultMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByPlaceholder('Tìm theo tên sản phẩm...');
    this.emptyResultMessage = page.getByText('Không có kết quả khớp với từ khóa');
  }

  /** Nút "Thêm vào giỏ" của một sản phẩm. `productId` dạng `prod-001`. */
  addToCartButton(productId: string): Locator {
    return this.page.locator(`#btn-add-${productId}`);
  }

  async addToCart(productId: string, times = 1): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.addToCartButton(productId).click();
    }
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
}
