# Quy Trình Đăng Nhập & Thanh Toán Thực Tế (Live Web E2E Flow)

Tài liệu này ghi lại chi tiết luồng nghiệp vụ thực tế trên hệ thống ShopGo Web Live (`https://cwshopgo.github.io/`) được chuyên gia QA rà soát trực tiếp.

---

## 1. Ràng Buộc Tiên Quyết: Cổng Xác Thực (Authentication Gate)
- Người dùng ở trạng thái **Khách vãng lai (Guest - Chưa đăng nhập)** có thể tự do:
  - Xem danh mục sản phẩm tại trang **Cửa hàng**.
  - Bấm thêm sản phẩm vào giỏ hàng (`#btn-add-prod-xxx`). Badge số lượng sản phẩm trên header tự động tăng lên.
- **Điểm chặn xác thực**:
  - Khi người dùng bấm vào tab **Thanh toán** trên Header (`button:has-text("Thanh toán")`) mà chưa đăng nhập:
    - Hệ thống **KHÔNG CHO PHÉP** truy cập trực tiếp màn hình thanh toán.
    - Modal Đăng nhập (`#modal-auth`) tự động bật lên với tiêu đề `Đăng nhập vào ShopGo` và thông báo:
      > *"Vui lòng đăng nhập để tiến hành thanh toán đơn hàng."*
  - Nếu người dùng bấm đóng modal mà không đăng nhập, họ vẫn ở màn hình Cửa hàng.

---

## 2. Thông Tin Tài Khoản Kiểm Thử Cố Định
Hệ thống live cung cấp 2 tài khoản mẫu phục vụ kiểm thử:
| Tên người dùng | Email | Mật khẩu | Loại tài khoản | Đặc điểm giỏ hàng |
|---|---|---|---|---|
| **Nguyễn Văn An** | `khachhang@shopgo.vn` | `123456` | Khách hàng chuẩn | Ban đầu giỏ hàng trống (0 sản phẩm) |
| **Trần Thị Mai** | `vip@shopgo.vn` | `123456` | Khách hàng VIP | Ban đầu giỏ hàng trống (0 sản phẩm) |

*Ghi chú: Tại Modal đăng nhập có sẵn 2 nút "Đăng nhập" tương ứng với 2 tài khoản để kích hoạt đăng nhập nhanh 1-click mà không cần gõ form.*

---

## 3. Luồng Chi Tiết Từ Giỏ Hàng Đến Hoàn Tất Thanh Toán
1. **Bước 1 — Đăng nhập**:
   - Mở modal đăng nhập (hoặc bấm tab Thanh toán khi chưa đăng nhập).
   - Chọn tài khoản `khachhang@shopgo.vn` / `123456`.
   - Header chuyển sang hiển thị Avatar `NA` và email của Nguyễn Văn An.
2. **Bước 2 — Thêm sản phẩm đạt ngưỡng áp voucher**:
   - Quay lại Cửa hàng, thêm sản phẩm để đảm bảo `subtotal >= 200.000 VNĐ`.
   - Ví dụ: Bấm thêm `Tai nghe Bluetooth Không Dây` (350.000 VNĐ) qua nút `#btn-add-prod-002`.
3. **Bước 3 — Vào màn hình Thanh toán**:
   - Bấm tab **Thanh toán 1** trên header.
   - Giao diện gồm 2 phần:
     - Bên trái: Chi tiết giỏ hàng (Danh sách món, đơn giá, ô chỉnh số lượng `+`/`-`, nút xóa sản phẩm).
     - Bên phải: Form Voucher và Chi tiết thanh toán.
4. **Bước 4 — Nhập và Áp dụng mã Voucher**:
   - Nhập mã vào `#input-voucher-code` (ví dụ `GIAM50K`) hoặc bấm badge gợi ý `#badge-voucher-GIAM50K`.
   - Bấm nút `#btn-apply-voucher` (Áp dụng).
   - Hệ thống phản hồi:
     - Thông báo thành công: `Áp dụng thành công mã "GIAM50K": Giảm 50.000 ₫.`
     - Nút Áp dụng chuyển sang trạng thái đã kích hoạt và xuất hiện nút `#btn-remove-voucher` ("Gỡ mã").
     - Bảng thanh toán hiển thị dòng `Giảm giá voucher: GIAM50K: -50.000 ₫`.
     - Phí vận chuyển: `Miễn phí (Freeship)` (do đơn hàng 350k >= 200k).
     - Tổng thanh toán cập nhật: `300.000 ₫`.
5. **Bước 5 — Đặt hàng**:
   - Nút đặt hàng hiển thị: `#btn-submit-checkout` với nhãn `Tiến hành Đặt hàng (300.000 ₫)`.
   - Bấm nút đặt hàng:
     - Hệ thống hiển thị modal hiệu ứng: *"Đang xử lý giao dịch... Vui lòng không đóng trình duyệt..."* (kèm các bước đối soát tồn kho, voucher, khởi tạo hóa đơn).
     - Sau 1 - 2 giây, modal chuyển sang: **"Đặt hàng thành công!"**
     - Hiển thị thông tin đơn: Mã đơn (ví dụ `SG-404090`), chi tiết món, số tiền giảm `-50.000 ₫`, tổng thanh toán `300.000 ₫`.
     - Nút kết thúc: `Hoàn tất & Tiếp tục mua sắm`. Bấm vào sẽ quay lại trang Cửa hàng với giỏ hàng rỗng.
