# Danh Mục Giao Diện & Locators UI (ShopGo Function D)
- **URL**: https://cwshopgo.github.io/
- **Phân loại**: `04_design` (Màn hình & phần tử tương tác thực tế)

## 1. Các Phần Tử DOM & Locators (Playwright Ready)
| Phân hệ / Màn hình | Thành phần | Loại UI | ID / Selector DOM | Mô tả chức năng |
|---|---|---|---|---|
| **Xác thực (Auth)** | Modal Đăng nhập | Modal Container | `#modal-auth` | Khung pop-up yêu cầu đăng nhập |
| **Xác thực (Auth)** | Ô nhập Email | Input Text | `#input-login-email`, `input[type="email"]` | Nhập email tài khoản |
| **Xác thực (Auth)** | Ô nhập Password | Input Password | `#input-login-password`, `input[type="password"]` | Nhập mật khẩu |
| **Xác thực (Auth)** | Nút Đăng nhập An | Button | `button:has-text("Đăng nhập")` | Đăng nhập nhanh Nguyễn Văn An (`khachhang@shopgo.vn`) |
| **Xác thực (Auth)** | Nút Đăng nhập Mai | Button | `button:has-text("Đăng nhập")` | Đăng nhập nhanh Trần Thị Mai (`vip@shopgo.vn`) |
| **Điều hướng** | Nút Tab Thanh toán | Tab Button | `button:has-text("Thanh toán")` | Chuyển đến màn hình giỏ hàng & thanh toán |
| **Điều hướng** | Nút Tab Cửa hàng | Tab Button | `button:has-text("Cửa hàng")` | Quay lại danh sách sản phẩm |
| **Sản phẩm** | Nút Thêm SP 001 | Button | `#btn-add-prod-001` | Thêm Áo thun Polo (150.000 ₫) |
| **Sản phẩm** | Nút Thêm SP 002 | Button | `#btn-add-prod-002` | Thêm Tai nghe Bluetooth (350.000 ₫) |
| **Sản phẩm** | Nút Thêm SP 003 | Button | `#btn-add-prod-003` | Thêm Bình giữ nhiệt (200.000 ₫) |
| **Voucher** | Ô nhập mã voucher | Input Text | `#input-voucher-code` | Nhập mã khuyến mãi |
| **Voucher** | Nút Áp dụng | Button | `#btn-apply-voucher` | Submit áp dụng voucher |
| **Voucher** | Nút Gỡ bỏ voucher | Button | `#btn-remove-voucher` | Hủy voucher đã áp dụng |
| **Voucher** | Badge mã GIAM50K | Button | `#badge-voucher-GIAM50K`| Chọn nhanh mã 50k |
| **Voucher** | Badge mã SALE20 | Button | `#badge-voucher-SALE20` | Chọn nhanh mã 20% |
| **Voucher** | Badge mã HETHAN | Button | `#badge-voucher-HETHAN` | Chọn nhanh mã hết hạn |
| **Thanh toán** | Dòng Giảm giá voucher | Text | `generic:has-text("Giảm giá voucher:")` | Hiển thị số tiền chiết khấu |
| **Thanh toán** | Nút Tiến hành Đặt hàng | Button | `#btn-submit-checkout` | Gửi đơn hàng và kích hoạt thanh toán |
| **Xác nhận** | Modal Thành công | Modal Dialog | `heading:has-text("Đặt hàng thành công!")` | Pop-up báo đặt hàng thành công kèm mã đơn |
| **Xác nhận** | Nút Tiếp tục mua sắm | Button | `button:has-text("Hoàn tất & Tiếp tục mua sắm")` | Đóng modal và reset trạng thái |

## 2. Dòng Hiển Thị Giá Trị & Kết Quả
- Số tiền giảm hiển thị với tiền tố dấu trừ (ví dụ `-50.000 ₫`).
- Thông báo lỗi/cảnh báo hiển thị ngay dưới form voucher: class alert / text cảnh báo.
- Tổng thanh toán tự động cập nhật ngay khi áp mã hoặc gỡ mã.

