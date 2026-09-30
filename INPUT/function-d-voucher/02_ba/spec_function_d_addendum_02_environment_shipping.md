**Hệ thống Thương mại điện tử “ShopGo”**

# **Function D — Phụ lục 02: Môi trường hệ thống & Phí vận chuyển**

- **Bổ sung cho**: `spec_function_d.md`
- **Ngày ban hành**: 2026-09-30
- **Người xác nhận**: BA / User
- **Lý do bổ sung**: Tài liệu gốc không nêu kiến trúc hệ thống và chính sách phí vận chuyển, khiến bộ dữ liệu kiểm thử từng có ca kiểm thử API và phí ship sai.

## 1. Kiến trúc hệ thống

| # | Quy định |
|---|---|
| E-01 | ShopGo (`https://cwshopgo.github.io/`) là ứng dụng web chạy hoàn toàn trên trình duyệt. **Không có backend, không có API.** |
| E-02 | Đơn hàng lưu trong trình duyệt (`localStorage["shopgo_orders"]`); phiên đăng nhập lưu ở `localStorage["shopgo_user"]`. |
| E-03 | Giỏ hàng và mã giảm giá đang áp chỉ tồn tại trong phiên đang mở; tải lại trang sẽ làm mới giỏ hàng. |
| E-04 | Phạm vi kiểm thử chỉ gồm thao tác trên giao diện và dữ liệu lưu trong trình duyệt. **Không kiểm thử API, mã phản hồi HTTP hay cơ sở dữ liệu.** |

## 2. Phí vận chuyển

| # | Quy định |
|---|---|
| S-01 | Phí vận chuyển tiêu chuẩn: **30.000 ₫**. |
| S-02 | **Miễn phí vận chuyển khi tiền hàng từ 200.000 ₫ trở lên** (`subtotal >= 200.000 ₫`), hoặc khi giỏ hàng trống. |
| S-03 | Mã giảm giá chỉ trừ vào tiền hàng, không trừ vào phí vận chuyển. |
| S-04 | Công thức: `Tổng thanh toán = Tiền hàng + Phí vận chuyển − Giảm giá` (không âm). |

## 3. Quy ước ghi số tiền

- Chữ `k` trong số tiền nghĩa là **nghìn đồng**: `200k` = `200.000 ₫`.
- Mọi dữ liệu kiểm thử phải ghi đủ số (`200.000 ₫`), không dùng dạng viết tắt.
