---
name: web-journey-discovery
description: >
  Sử dụng Playwright Browser MCP để tự động truy cập URL mục tiêu, "mò web" (khám phá cây DOM, Accessibility Snapshot),
  nhận diện các phần tử tương tác và ghi nhận luồng chuyển trang thực tế để phục vụ sinh Page Object Model (POM).
---

# Skill: web-journey-discovery

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Khám phá trực tiếp ứng dụng web đang chạy (Staging / Dev / Production), tự động quét cấu trúc trang để xác định:
1. Thứ tự chuyển trang (Page transitions).
2. Các phần tử tương tác chính (Buttons, Input fields, Forms, Modals).
3. Đề xuất các selector / locator chuẩn nhất cho `qa-automation` đưa vào POM.

## Tham số
- `url`: Địa chỉ trang web mục tiêu (ví dụ: `https://cwshopo.github.io` hoặc `http://localhost:3000`).
- `scope`: Hành trình cần khám phá (ví dụ: `checkout`, `cart`, `login`).

## Các bước thực hiện
1. **Khởi tạo & Điều hướng**:
   - Sử dụng Playwright mở URL được chỉ định.
   - Chờ trang tải hoàn tất mạng (`networkidle` hoặc `domcontentloaded`).
2. **Quét Accessibility Snapshot & DOM**:
   - Trích xuất cây Accessibility Tree để phát hiện các `role`, `name`, `placeholder`, `aria-label`.
   - Tìm kiếm các phần tử có thuộc tính `data-testid` hoặc `id` ổn định.
3. **Thử nghiệm tương tác (Exploration Probe)**:
   - Thử click hoặc nhập dữ liệu mẫu để kích hoạt hành vi chuyển trang hoặc mở popup.
   - Ghi nhận trạng thái URL trước và sau hành động.
4. **Tổng hợp báo cáo khám phá**:
   - Ghi lại danh sách các locator bền vững kèm ảnh chụp màn hình hiện trạng trang.

## Format output
Ghi ra `OUTPUT/<task-slug>/07_web_journey_discovery.md` (kèm file Gherkin riêng `OUTPUT/<task-slug>/exploratory/journeys.feature` nếu cần import vào Jira Xray/Zephyr):

```markdown
# WEB JOURNEY DISCOVERY & GHERKIN SPEC — [TÊN ỨNG DỤNG / DOMAIN]
URL khảo sát: [URL] · Thời gian: YYYY-MM-DD · Người thực hiện: qa-exploratory

## 1. Kịch Bản Gherkin BDD (Chuẩn Hóa Từ Thực Tế Khám Phá)

```gherkin
Feature: [Tên tính năng được khám phá trên web]

  Background:
    Given Người dùng truy cập "[URL]"
    And Đã đăng nhập hoặc chuẩn bị trạng thái ban đầu

  @smoke @happy-path
  Scenario: [Tên hành trình chính thành công]
    Given [Tiền điều kiện màn hình / dữ liệu]
    When Người dùng [Hành động: click / input / chọn]
    And [Hành động tiếp theo]
    Then Hệ thống phản hồi [Kết quả mong đợi trên giao diện]
    And [Kiểm chứng trạng thái URL / Tiền / Thông báo]

  @negative
  Scenario: [Hành trình lỗi / ngoại lệ thực tế phát hiện]
    When Người dùng thực hiện thao tác sai
    Then Hệ thống hiển thị thông báo lỗi phù hợp
```

## 2. Bản Đồ Ánh Xạ Step Gherkin ➔ Locator Khuyến Nghị Cho POM
| Step Gherkin | Tên phần tử | Action | Recommended Locator (Playwright) | Ghi chú |
|---|---|---|---|---|
| When Nhập mã voucher "GIAM50K" | Input Voucher | fill | `page.getByPlaceholder('Nhập mã voucher')` hoặc `#input-voucher` | Ổn định |
| And Bấm nút "Áp dụng" | Nút Áp dụng | click | `page.getByRole('button', { name: 'Áp dụng' })` | Accessible |
| Then Tổng tiền giảm còn "300.000đ" | Nhãn Tổng tiền | text | `page.locator('#order-total')` | Cần chờ update |

## 3. Nhật Ký Hành Trình Khám Phá (Timeline)
| Bước | URL | Thao tác thử nghiệm | Kết quả chuyển trang / Popup / Toast | Ảnh bằng chứng |
|---|---|---|---|---|
| 1 | `/` | Bấm vào sản phẩm đầu tiên | Mở chi tiết sản phẩm | `evidence/step1.png` |
| 2 | `/cart` | Nhập mã "GIAM50K" & click Áp dụng | Thành công, trừ tiền | `evidence/step2.png` |
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Kịch bản được viết theo đúng chuẩn **Gherkin BDD** (`Given - When - Then`), không viết văn xuôi tùy tiện.
- [ ] 100% các step trong Gherkin đều có locator ánh xạ tương ứng trong bảng Khuyến Nghị Cho POM.
- [ ] Ưu tiên locator theo thứ tự: `getByTestId` ➔ `getByRole` ➔ `getByPlaceholder` ➔ CSS ID `#...` (CẤM dùng XPath tuyệt đối dễ gãy).
- [ ] Báo cáo ghi rõ URL môi trường và bằng chứng ảnh chụp màn hình tương ứng.

