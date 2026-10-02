---
name: flow-clustering
description: >
  Phân tích kho Test Cases gốc (05_test_case_spec.md) hoặc danh sách test cases theo Ticket,
  phân cụm các test cases có chung hành trình người dùng (User Journey / Common Flow) để tái sử dụng trạng thái trình duyệt và tối ưu hóa việc chạy Playwright.
---

# Skill: flow-clustering

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Tránh việc mở đi mở lại trình duyệt và lặp lại các bước điều hướng từ đầu cho từng test case đơn lẻ. Skill này nhóm các test case có chung điểm xuất phát, chung ngữ cảnh dữ liệu và chung luồng thao tác.

## Đầu vào
- `OUTPUT/<task-slug>/05_test_case_spec.md` hoặc `OUTPUT/<task-slug>/runs/<run-id>/run_plan.md`.
- `OUTPUT/<task-slug>/07_web_journey_discovery.md` (Kịch bản Gherkin BDD từ khám phá web).

## Các bước thực hiện
1. **Quét Preconditions & Test Steps**:
   - Nhóm theo trang xuất phát (ví dụ: Trang chủ, Trang danh mục, Trang giỏ hàng).
   - Nhóm theo trạng thái xác thực: Khách vãng lai (Guest) vs Người dùng đã đăng nhập (Authenticated User).
2. **Gom thành các cụm hành trình (Journey Clusters / Feature Groups)**:
   - *Cụm Xác thực (Auth Journey)*: Đăng ký $\to$ Đăng nhập $\to$ Quên mật khẩu.
   - *Cụm Tìm kiếm & Chọn hàng (Catalog & Search Journey)*: Tìm từ khóa $\to$ Bộ lọc $\to$ Xem chi tiết $\to$ Thêm vào giỏ.
   - *Cụm Thanh toán & Khuyến mãi (Checkout & Promotion Journey)*: Giỏ hàng $\to$ Áp mã voucher $\to$ Điền địa chỉ $\to$ Chọn thanh toán $\to$ Xác nhận đơn.
3. **Chuẩn hóa thành Gherkin Scenario Outline (Nếu có nhiều bộ data test)**:
   - Thay vì viết lặp nhiều scenario, gộp các test case cùng luồng vào 1 `Scenario Outline` kèm bảng `Examples` (được sinh tự động từ `generate-dataset.js`).
4. **Sắp xếp thứ tự thực thi trong cụm**:
   - Chạy Happy Path trước để làm baseline.
   - Chạy Boundary / Negative / Edge cases sau để cô lập lỗi.

## Format output
Xuất thông tin cụm vào bảng kế hoạch chạy hoặc file kịch bản BDD:

```markdown
### Cụm Hành Trình: [Tên Cụm — ví dụ: Checkout & Voucher Flow]
- **Trang khởi đầu**: `/cart` hoặc `/checkout`
- **Session State**: Đăng nhập bằng tài khoản test `user@example.com`
- **Kịch bản Gherkin BDD cụm**:
```gherkin
Feature: Áp dụng mã Voucher trong giỏ hàng
  Scenario Outline: Kiểm thử áp dụng các loại voucher hợp lệ và không hợp lệ
    Given Người dùng ở trang giỏ hàng với tổng tiền "<initial_total>"
    When Người dùng nhập voucher "<voucher_code>" và bấm "Áp dụng"
    Then Kết quả hiển thị là "<expected_status>"
    And Tổng tiền thanh toán cuối cùng là "<final_total>"

    Examples:
      | voucher_code | initial_total | expected_status | final_total |
      | GIAM50K      | 350.000đ      | Thành công      | 300.000đ    |
      | HETHAN       | 350.000đ      | Hết hạn         | 350.000đ    |
```
- **Danh sách Test Cases trong cụm**:
  1. TC-001 (Happy Path — Áp voucher 10% thành công)
  2. TC-002 (Negative — Áp voucher hết hạn)
  3. TC-005 (Boundary — Áp voucher đạt mức giảm tối đa)
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] 100% Test Case trong phạm vi đợt chạy được phân vào đúng cụm hành trình logic.
- [ ] Tận dụng tối đa Gherkin Scenario Outline để gom các bộ dữ liệu tương đồng, giảm lặp code.
- [ ] Không có test case nào bị bỏ quên hoặc trùng lặp giữa các cụm.
- [ ] Chỉ rõ Precondition và trạng thái Auth để Playwright tái sử dụng Storage State.

