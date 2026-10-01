import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for ShopGo Product Catalog & Storefront
 */
export class ShopPage {
  readonly page: Page;
  readonly navShopBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navShopBtn = page.locator('#btn-nav-shop');
  }

  async goto() {
    if (await this.navShopBtn.isVisible().catch(() => false)) {
      await this.navShopBtn.click();
    } else {
      await this.page.goto('/');
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async addProduct(prodId: string, clicks: number = 1) {
    const addBtn = this.page.locator(`#btn-add-${prodId}`);
    await addBtn.waitFor({ state: 'visible', timeout: 5000 });
    for (let i = 0; i < clicks; i++) {
      await addBtn.click();
      await this.page.waitForTimeout(100);
    }
  }

  /**
   * Helper to set up a specific cart subtotal
   * Examples:
   * - 190.000 ₫: prod-005 x 1
   * - 200.000 ₫: prod-003 x 1
   * - 280.000 ₫: prod-004 x 1
   * - 300.000 ₫: prod-001 x 2 (150k x 2)
   * - 350.000 ₫: prod-002 x 1
   * - 490.000 ₫: prod-005 x 1 + prod-003 x 1 + prod-006 x 1 (190k + 200k + 120k = 510k, or prod-004 x 1 + prod-005 x 1 + prod-006 x 0...)
   * - 500.000 ₫: prod-001 x 2 + prod-003 x 1 (300k + 200k)
   * - 600.000 ₫: prod-003 x 3 (200k x 3)
   */
  async setupCartForSubtotal(targetAmount: number) {
    await this.goto();
    if (targetAmount === 150000) {
      await this.addProduct('prod-001', 1);
    } else if (targetAmount === 190000) {
      await this.addProduct('prod-005', 1);
    } else if (targetAmount === 200000) {
      await this.addProduct('prod-003', 1);
    } else if (targetAmount === 280000) {
      await this.addProduct('prod-004', 1);
    } else if (targetAmount === 300000) {
      await this.addProduct('prod-001', 2);
    } else if (targetAmount === 350000) {
      await this.addProduct('prod-002', 1);
    } else if (targetAmount === 490000) {
      // 200.000 (prod-003) + 150.000 (prod-001) + 140.000...
      // Or prod-004 (280k) + prod-005 (190k) = 470k...
      // Let's use prod-005 (190k) + prod-001 (150k) x 2 (300k) = 490.000 ₫!
      await this.addProduct('prod-005', 1);
      await this.addProduct('prod-001', 2);
    } else if (targetAmount === 500000) {
      await this.addProduct('prod-001', 2); // 300k
      await this.addProduct('prod-003', 1); // 200k
    } else if (targetAmount === 600000) {
      await this.addProduct('prod-003', 3); // 200k x 3
    } else {
      // Default: 350.000 ₫
      await this.addProduct('prod-002', 1);
    }
  }
}
