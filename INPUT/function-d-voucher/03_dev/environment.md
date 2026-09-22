# Đặc Tả Môi Trường Kiểm Thử Trực Tiếp (Live Web Environment)
- **URL Ứng Dụng**: https://cwshopgo.github.io/
- **Nguồn tiếp nhận**: `INPUT/URL.txt`
- **Loại ứng dụng**: Single Page Application (React / Vite) responsive Desktop & Mobile Web.

## 1. Cấu Hình Voucher Thực Tế Trên Web
Hệ thống live hiện cấu hình sẵn 3 mã voucher trong module thanh toán:
1. **`GIAM50K`**:
   - Loại: Giảm số tiền cố định (`fixed`)
   - Giá trị giảm: `50.000 VNĐ`
   - Đơn tối thiểu (`minSubtotal`): `200.000 VNĐ`
   - Mô tả: "Giảm ngay 50.000 ₫ cho đơn hàng tối thiểu từ 200.000 ₫."
2. **`SALE20`**:
   - Loại: Giảm theo tỷ lệ phần trăm (`percentage`)
   - Giá trị: `20%`
   - Đơn tối thiểu: `300.000 VNĐ`
   - Mức trần giảm tối đa (`maxCap`): `100.000 VNĐ`
   - Mô tả: "Giảm 20% giá trị đơn hàng cho đơn từ 300.000 ₫ (Giảm tối đa 100.000 ₫)."
3. **`HETHAN`**:
   - Trạng thái: Hết hạn (`expired: true`)
   - Loại: Giảm số tiền cố định (`fixed` - 30.000 VNĐ, min 100.000 VNĐ)
   - Thông báo: "Mã giảm giá đã hết hạn sử dụng."

## 2. Quy Tắc Xử Lý Input & Thông Báo Lỗi Thực Tế
- **Chuẩn hóa input**: Tự động `.trim()` khoảng trắng hai đầu và chuyển sang chữ hoa `.toUpperCase()`.
- **Bỏ trống**: Báo lỗi `"Vui lòng nhập mã khuyến mãi."`.
- **Mã không tồn tại**: Báo lỗi `Mã giảm giá "<MÃ>" không tồn tại trên hệ thống.`.
- **Mã hết hạn**: Báo lỗi `Mã giảm giá "<MÃ>" đã hết hạn sử dụng.`.
- **Chưa đủ minSubtotal**: Báo lỗi / warning yêu cầu đạt giá trị đơn tối thiểu.
- **Quy tắc phí vận chuyển**: Phí ship tiêu chuẩn `30.000 VNĐ`, miễn phí vận chuyển (Freeship) khi đơn hàng từ `200.000 VNĐ` trở lên.

## 3. Cổng Xác Thực (Authentication Gate) & Tài Khoản Kiểm Thử
Khách vãng lai (chưa đăng nhập) khi bấm nút **Thanh toán** hoặc thực hiện thanh toán sẽ bị chặn bởi Modal đăng nhập (`#modal-auth`) với thông báo:
> *"Vui lòng đăng nhập để tiến hành thanh toán đơn hàng."*

Hệ thống cung cấp sẵn 2 tài khoản mẫu (hỗ trợ nút Đăng nhập nhanh 1-click):
1. **Tài khoản Khách hàng Tiêu chuẩn**:
   - Email: `khachhang@shopgo.vn`
   - Mật khẩu: `123456`
   - Tên hiển thị: `Nguyễn Văn An`
   - Vai trò: Khách mua hàng thông thường
2. **Tài khoản Khách hàng VIP**:
   - Email: `vip@shopgo.vn`
   - Mật khẩu: `123456`
   - Tên hiển thị: `Trần Thị Mai`
   - Vai trò: Khách hàng VIP

