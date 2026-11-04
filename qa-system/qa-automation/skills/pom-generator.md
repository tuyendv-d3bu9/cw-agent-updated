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
- Snapshot DOM / Accessibility Tree từ web exploration (Playwright MCP hoặc skill `web-journey-discovery` cùng agent).
- Danh sách hành động trong Test Cases (Steps).
- `knowledge/features/<sut>-ui-map.md` — locator đã trích từ app thật. Không có ⇒ chạy `web-journey-discovery` trước, không đoán.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (luôn nạp, QA_STANDARD §7)

## Nguyên tắc sinh Locator chuẩn Playwright (Bắt Buộc)
1. Ưu tiên 1: `page.getByRole(...)` (ví dụ: `page.getByRole('button', { name: '<nhãn nút trong ui-map>' })`)
2. Ưu tiên 2: `page.getByTestId(...)` (ví dụ: `page.getByTestId('<data-testid trong ui-map>')`)
3. Ưu tiên 3: `page.getByLabel(...)` hoặc `page.getByPlaceholder(...)`
4. Ưu tiên 4: `page.getByText(...)`
5. **CẤM**: Tuyệt đối không dùng XPath tuyệt đối hoặc class ngẫu nhiên dễ đổi.

## Cấu trúc file chuẩn sinh ra:
> Ví dụ dưới chỉ minh hoạ cấu trúc; tên trang, nhãn, placeholder phải lấy từ app thật / ui-map.
Ghi vào thư mục `automation/pages/<PageName>.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class <PageName>Page {
  readonly page: Page;
  readonly <field>Input: Locator;
  readonly submitButton: Locator;
  readonly resultMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Mọi nhãn / placeholder / test-id lấy NGUYÊN VĂN từ knowledge/features/<sut>-ui-map.md
    this.<field>Input = page.getByLabel('<nhãn field trong ui-map>');
    this.submitButton = page.getByRole('button', { name: '<nhãn nút trong ui-map>' });
    this.resultMessage = page.getByTestId('<data-testid trong ui-map>');
  }

  async goto() {
    await this.page.goto('<đường dẫn trang trong ui-map>');
  }

  async submit<Field>(value: string) {
    await this.<field>Input.fill(value);
    await this.submitButton.click();
  }

  async verifyResult(expectedText: string) {
    // expectedText lấy từ Expected Result của test case, không tự đặt
    await expect(this.resultMessage).toContainText(expectedText);
  }
}
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] 100% Page Object tuân thủ đúng chuẩn TypeScript, không có cú pháp lỗi.
- [ ] Mọi locator đều tuân thủ thứ tự ưu tiên robust locator (getByRole / getByTestId).
- [ ] Các action method đều có kiểu dữ liệu rõ ràng (`async ...: Promise<void>`).
