# RUN PLAN — RUN-01 · FUNCTION-A (ĐĂNG NHẬP / AUTHENTICATION)
Ngày tạo: 2026-10-04 · Người thực hiện: qa-automation · Môi trường: Production/Staging Demo (`https://cwshopgo.github.io`)

## 1. Mục Tiêu & Phạm Vi Đợt Chạy (Run Scope)
- **Ticket / Nhiệm vụ liên quan**: [SG-38 đến SG-55](https://shopgo.atlassian.net/jira/software/projects/SG/boards/3)
- **Mục tiêu**: Thực thi toàn bộ bộ kiểm thử tự động 18 test cases cho tính năng Xác thực / Đăng nhập ShopGo, thu thập ảnh chụp màn hình bằng chứng và đồng bộ kết quả lên Jira.
- **Tài liệu nguồn gốc**: `OUTPUT/function-a/05_test_case_spec.md`

## 2. Danh Sách Test Cases Được Chọn Thực Thi (Filtered Subset)

| # | Test Case ID | Tiêu đề Test Case | Jira Key | Tags / Module | Priority |
|---|---|---|:---:|---|:---:|
| 1 | `AUTH-001` | Verify đăng nhập thành công với tài khoản Khách thường | SG-38 | Rule#BR-AUTH-01, Viewpoint#VP-01, Module#AUTH | High |
| 2 | `AUTH-002` | Verify đăng nhập thành công với tài khoản VIP và hiển thị nhãn VIP | SG-39 | Rule#BR-AUTH-01, Viewpoint#VP-01, Module#AUTH | High |
| 3 | `AUTH-003` | Verify đăng nhập tự động điền bằng nút Demo Accounts | SG-40 | Rule#BR-AUTH-01, Viewpoint#VP-01, Module#AUTH | Medium |
| 4 | `AUTH-004` | Verify chuyển hướng sang màn Thanh toán sau khi đăng nhập từ nút Checkout | SG-41 | Rule#BR-AUTH-03, Viewpoint#VP-01, Module#AUTH | High |
| 5 | `AUTH-005` | Validate hiển thị thông báo lỗi khi nhập sai mật khẩu | SG-42 | Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH | High |
| 6 | `AUTH-006` | Validate hiển thị thông báo lỗi khi nhập email không tồn tại trong hệ thống | SG-43 | Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH | High |
| 7 | `AUTH-007` | Validate chặn submit và hiển thị thông báo khi để trống trường Email | SG-44 | Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH | High |
| 8 | `AUTH-008` | Validate chặn submit và hiển thị thông báo khi để trống trường Mật khẩu | SG-45 | Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH | High |
| 9 | `AUTH-009` | Validate chặn submit và hiển thị thông báo khi để trống cả hai trường | SG-46 | Rule#BR-AUTH-05, Viewpoint#VP-02, Module#AUTH | High |
| 10 | `AUTH-010` | Validate chặn submit khi nhập email sai định dạng cú pháp thiếu @ | SG-47 | Rule#BR-AUTH-04, Viewpoint#VP-02, Module#AUTH | Medium |
| 11 | `AUTH-011` | Confirm tự động trim khoảng trắng thừa ở hai đầu email khi đăng nhập | SG-48 | Rule#BR-AUTH-01, Viewpoint#VP-03, Module#AUTH | Medium |
| 12 | `AUTH-012` | Confirm không phân biệt chữ hoa thường trong email khi đăng nhập | SG-49 | Rule#BR-AUTH-01, Viewpoint#VP-03, Module#AUTH | Medium |
| 13 | `AUTH-013` | Verify trường Mật khẩu được che giấu ký tự trên modal đăng nhập | SG-50 | Rule#BR-AUTH-01, Viewpoint#VP-04, Module#AUTH | High |
| 14 | `AUTH-014` | Verify chuyển đổi giữa hai tài khoản không bị lẫn lộn danh tính người dùng | SG-51 | Rule#BR-AUTH-02, Viewpoint#VP-04, Module#AUTH | High |
| 15 | `AUTH-015` | Confirm hệ thống duy trì hoạt động ổn định khi nhập sai mật khẩu nhiều lần liên tiếp | SG-52 | Rule#BR-AUTH-06, Viewpoint#VP-04, Module#AUTH | Medium |
| 16 | `AUTH-016` | Confirm submit form đăng nhập bằng phím Enter tại ô Mật khẩu | SG-53 | Rule#BR-AUTH-01, Viewpoint#VP-05, Module#AUTH | Low |
| 17 | `AUTH-017` | Verify đóng modal đăng nhập mà không làm thay đổi trạng thái trang | SG-54 | Rule#BR-AUTH-01, Viewpoint#VP-05, Module#AUTH | Low |
| 18 | `AUTH-018` | Verify khôi phục phiên đăng nhập khi làm mới trang (F5) và điều hướng về trang chủ khi đăng xuất | SG-55 | Rule#BR-AUTH-03, Viewpoint#VP-06, Module#AUTH | High |

**Tổng số test cases đợt này**: 18 / 18 (100% phạm vi tính năng)
