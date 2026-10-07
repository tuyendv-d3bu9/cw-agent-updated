# KẾT QUẢ THỰC THI KIỂM THỬ — RUN-01 · FUNCTION-A
Thời điểm chạy: 2026-10-04 · Người thực hiện: qa-automation · Môi trường: Production/Staging Demo (`https://cwshopgo.github.io`)
Framework: Playwright Test · Tổng số cases: 18 · PASS: 18 · FAIL: 0 · BLOCKED: 0

## 1. Tóm Tắt Kết Quả (Executive Summary)
- **Tổng số test cases**: 18
- **Passed**: 18 (100%)
- **Failed**: 0 (0%)
- **Thời lượng thực thi**: ~50.3s
- **Tình trạng chất lượng**: Toàn bộ luồng đăng nhập và xử lý ngoại lệ hoạt động hoàn hảo theo đặc tả kinh doanh.

## 2. Bảng Chi Tiết Kết Quả Thực Thi (Execution Results)

| # | TC ID | Tiêu đề Test Case | Trạng thái | Actual Result (Thực tế) | Bằng chứng (Evidence) | Ghi chú / Jira |
|---|---|---|:---:|---|---|:---:|
| 1 | `AUTH-001` | Verify đăng nhập thành công với tài khoản Khách thường | **PASS** | Đăng nhập thành công, hiển thị Chào mừng John Doe | [evidence/AUTH-001_PASS.png](evidence/AUTH-001_PASS.png) | SG-38 |
| 2 | `AUTH-002` | Verify đăng nhập thành công với tài khoản VIP và hiển thị nhãn VIP | **PASS** | Đăng nhập thành công với VIP Jane Smith, hiển thị badge VIP | [evidence/AUTH-002_PASS.png](evidence/AUTH-002_PASS.png) | SG-39 |
| 3 | `AUTH-003` | Verify đăng nhập tự động điền bằng nút Demo Accounts | **PASS** | Nút demo tự động điền và đăng nhập thành công | [evidence/AUTH-003_PASS.png](evidence/AUTH-003_PASS.png) | SG-40 |
| 4 | `AUTH-004` | Verify chuyển hướng sang màn Thanh toán sau khi đăng nhập từ nút Checkout | **PASS** | Chuyển hướng chính xác sang view checkout thanh toán | [evidence/AUTH-004_PASS.png](evidence/AUTH-004_PASS.png) | SG-41 |
| 5 | `AUTH-005` | Validate hiển thị thông báo lỗi khi nhập sai mật khẩu | **PASS** | Hiển thị thông báo Mật khẩu không chính xác | [evidence/AUTH-005_PASS.png](evidence/AUTH-005_PASS.png) | SG-42 |
| 6 | `AUTH-006` | Validate hiển thị thông báo lỗi khi nhập email không tồn tại trong hệ thống | **PASS** | Hiển thị thông báo Tài khoản không tồn tại | [evidence/AUTH-006_PASS.png](evidence/AUTH-006_PASS.png) | SG-43 |
| 7 | `AUTH-007` | Validate chặn submit và hiển thị thông báo khi để trống trường Email | **PASS** | Chặn submit HTML5 form validation trường Email | [evidence/AUTH-007_PASS.png](evidence/AUTH-007_PASS.png) | SG-44 |
| 8 | `AUTH-008` | Validate chặn submit và hiển thị thông báo khi để trống trường Mật khẩu | **PASS** | Chặn submit HTML5 form validation trường Mật khẩu | [evidence/AUTH-008_PASS.png](evidence/AUTH-008_PASS.png) | SG-45 |
| 9 | `AUTH-009` | Validate chặn submit và hiển thị thông báo khi để trống cả hai trường | **PASS** | Chặn submit khi để trống cả 2 trường | [evidence/AUTH-009_PASS.png](evidence/AUTH-009_PASS.png) | SG-46 |
| 10 | `AUTH-010` | Validate chặn submit khi nhập email sai định dạng cú pháp thiếu @ | **PASS** | Chặn submit với định dạng email không hợp lệ | [evidence/AUTH-010_PASS.png](evidence/AUTH-010_PASS.png) | SG-47 |
| 11 | `AUTH-011` | Confirm tự động trim khoảng trắng thừa ở hai đầu email khi đăng nhập | **PASS** | Trim whitespace hai đầu và đăng nhập thành công | [evidence/AUTH-011_PASS.png](evidence/AUTH-011_PASS.png) | SG-48 |
| 12 | `AUTH-012` | Confirm không phân biệt chữ hoa thường trong email khi đăng nhập | **PASS** | Chấp nhận email chữ hoa thường không phân biệt | [evidence/AUTH-012_PASS.png](evidence/AUTH-012_PASS.png) | SG-49 |
| 13 | `AUTH-013` | Verify trường Mật khẩu được che giấu ký tự trên modal đăng nhập | **PASS** | Trường password có type="password" che giấu ký tự | [evidence/AUTH-013_PASS.png](evidence/AUTH-013_PASS.png) | SG-50 |
| 14 | `AUTH-014` | Verify chuyển đổi giữa hai tài khoản không bị lẫn lộn danh tính người dùng | **PASS** | Đăng xuất và đăng nhập tài khoản khác cập nhật đúng danh tính | [evidence/AUTH-014_PASS.png](evidence/AUTH-014_PASS.png) | SG-51 |
| 15 | `AUTH-015` | Confirm hệ thống duy trì hoạt động ổn định khi nhập sai mật khẩu nhiều lần liên tiếp | **PASS** | Hệ thống phản hồi ổn định sau 5 lần nhập sai liên tiếp | [evidence/AUTH-015_PASS.png](evidence/AUTH-015_PASS.png) | SG-52 |
| 16 | `AUTH-016` | Confirm submit form đăng nhập bằng phím Enter tại ô Mật khẩu | **PASS** | Nhấn phím Enter submit form và đăng nhập thành công | [evidence/AUTH-016_PASS.png](evidence/AUTH-016_PASS.png) | SG-53 |
| 17 | `AUTH-017` | Verify đóng modal đăng nhập mà không làm thay đổi trạng thái trang | **PASS** | Nút đóng modal hoạt động đúng, không đổi URL/state | [evidence/AUTH-017_PASS.png](evidence/AUTH-017_PASS.png) | SG-54 |
| 18 | `AUTH-018` | Verify khôi phục phiên đăng nhập khi làm mới trang (F5) và điều hướng về trang chủ khi đăng xuất | **PASS** | F5 duy trì session, đăng xuất xóa session về trang chủ | [evidence/AUTH-018_PASS.png](evidence/AUTH-018_PASS.png) | SG-55 |
