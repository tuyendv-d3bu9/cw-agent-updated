---
name: pom-generator
description: >
  Tự động sinh cấu trúc Page Object Model (POM) chuẩn TypeScript cho Playwright dựa trên kết quả khảo sát DOM và Accessibility Snapshot từ luồng khám phá web.
---

# Skill: pom-generator

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Tạo ra các class Page Object Model (POM) chuyên nghiệp, module hóa, bảo trì dễ dàng, phân tách tuyệt đối giữa cấu trúc phần tử (Locators) và hành động người dùng (Actions).

## Đầu vào
- Snapshot DOM / Accessibility Tree từ web exploration (Playwright MCP hoặc `qa-exploratory`).
- Danh sách hành động trong Test Cases (Steps).

## Nguyên tắc sinh Locator chuẩn Playwright (Bắt Buộc)
1. Ưu tiên 1: `page.getByRole(...)` (ví dụ: `page.getByRole('button', { name: 'Áp dụng' })`)
2. Ưu tiên 2: `page.getByTestId(...)` (ví dụ: `page.getByTestId('voucher-input')`)
3. Ưu tiên 3: `page.getByLabel(...)` hoặc `page.getByPlaceholder(...)`
4. Ưu tiên 4: `page.getByText(...)`
5. **CẤM**: Tuyệt đối không dùng XPath tuyệt đối hoặc class ngẫu nhiên dễ đổi.

## Cấu trúc file chuẩn sinh ra:
Ghi vào thư mục `automation/pages/<PageName>.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly voucherInput: Locator;
  readonly applyButton: Locator;
  readonly discountMessage: Locator;
  readonly orderTotal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.voucherInput = page.getByPlaceholder('Nhập mã voucher');
    this.applyButton = page.getByRole('button', { name: 'Áp dụng' });
    this.discountMessage = page.getByTestId('voucher-discount-msg');
    this.orderTotal = page.getByTestId('order-total');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async applyVoucher(code: string) {
    await this.voucherInput.fill(code);
    await this.applyButton.click();
  }

  async verifyDiscountApplied(expectedDiscount: string) {
    await expect(this.discountMessage).toContainText(expectedDiscount);
  }
}
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] 100% Page Object tuân thủ đúng chuẩn TypeScript, không có cú pháp lỗi.
- [ ] Mọi locator đều tuân thủ thứ tự ưu tiên robust locator (getByRole / getByTestId).
- [ ] Các action method đều có kiểu dữ liệu rõ ràng (`async ...: Promise<void>`).
