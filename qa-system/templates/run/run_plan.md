# RUN PLAN — [RUN-ID] · [TÊN TÍNH NĂNG]
Ngày tạo: YYYY-MM-DD · Người thực hiện: [qa-automation / Tester] · Môi trường: [Staging / Dev / Local]

## 1. Mục Tiêu & Phạm Vi Đợt Chạy (Run Scope)
- **Ticket / Nhiệm vụ liên quan**: [Ví dụ: PROJ-101 / Hotfix-02 / Regression-Sprint-10]
- **Mục tiêu**: [Kiểm tra tính năng áp mã voucher % sau khi Dev fix bug #101]
- **Tài liệu nguồn gốc**: `OUTPUT/<task-slug>/05_test_case_spec.md`

## 2. Danh Sách Test Cases Được Chọn Thực Thi (Filtered Subset)
> Chỉ chọn các test cases liên quan trực tiếp đến phạm vi ticket, không chạy toàn bộ.

| # | Test Case ID | Tiêu đề Test Case | Tags / Module | Priority | Lý do chọn |
|---|---|---|---|---|---|
| 1 | TC-001 | Verify áp mã voucher % hợp lệ | Rule#BR-01, Module#Voucher | High | Kiểm tra Happy Path của ticket |
| 2 | TC-005 | Validate áp mã vượt quá mức giảm tối đa | Rule#BR-02, Module#Voucher | High | Kiểm tra boundary bug #101 |
| 3 | TC-012 | Verify thông báo khi mã hết hạn | Rule#BR-05, Module#Voucher | Medium | Regression liên quan |

**Tổng số test cases đợt này**: [X] / [Tổng số test case trong spec gốc]
