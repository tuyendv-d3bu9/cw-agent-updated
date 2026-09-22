**Hệ thống Thương mại điện tử “ShopGo”**

# **Function D: Áp dụng Mã Giảm Giá (Voucher)**

Chức năng được yêu cầu kiểm thử trong phần thực hành này là Function D: Áp dụng Mã Giảm Giá (Voucher). Lát cắt tính năng này nằm ở bước Thanh toán của nhóm tính năng E.

## **1. Bối cảnh chức năng**

- Hệ thống **ShopGo** là một ứng dụng web bán lẻ trực tuyến có hỗ trợ responsive cho cả desktop và mobile web.
- Đối tượng người dùng cuối là khách mua hàng tại Việt Nam.
- Đơn vị tiền tệ hiển thị và thanh toán là VNĐ, ngôn ngữ giao diện là tiếng Việt.

__Vị trí: __Tại trang Thanh toán, khách hàng có ô nhập “Mã giảm giá” và nút “Áp dụng”.

__Hành động: __Khi khách hàng nhập mã rồi bấm Áp dụng, hệ thống sẽ kiểm tra mã và áp dụng phần giảm vào tổng đơn hàng.

**Các quy tắc đã nêu:**

- Có 2 loại mã: giảm theo phần trăm (%) và giảm số tiền cố định (VND).
- Mã chỉ dùng được khi đơn hàng đạt giá trị tối thiểu quy định của mã.
- Mỗi mã có ngày hết hạn.
- Áp dụng thành công → hiển thị số tiền được giảm và tổng tiền mới.
- Mã không hợp lệ hoặc hết hạn → hiển thị thông báo lỗi.