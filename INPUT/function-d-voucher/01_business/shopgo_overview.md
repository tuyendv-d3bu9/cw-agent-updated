**Hệ thống Thương mại điện tử “ShopGo”**

# **Tổng quan dự án ShopGo**

## **1. Bối cảnh & mục tiêu kinh doanh**

ShopGo là một web bán lẻ trực tuyến (general retail) của một khách hàng SME, bán đa dạng mặt hàng: quần áo, phụ kiện, đồ gia dụng… Khách hàng thuê CO-WELL đảm nhận QA cho phiên bản web.

__Mục tiêu sản phẩm: __khách hàng đặt mua nhanh, thanh toán linh hoạt (COD / thẻ / Ví ShopGo), áp mã giảm giá và theo dõi đơn hàng.

__Vai trò team QA: __đảm bảo các luồng mua hàng và thanh toán chạy đúng business rule trước mỗi đợt release.

## **2. Tổng quan hệ thống (mức không kỹ thuật)**

- __Loại ứng dụng: __Web app responsive (desktop \+ mobile web).
- __Người dùng cuối: __khách mua hàng tại Việt Nam; tiền tệ VND; ngôn ngữ tiếng Việt.
- __Tích hợp ngoài: __cổng thanh toán thẻ (bên thứ ba), dịch vụ Email/SMS, đơn vị vận chuyển (tính phí ship).
- __Back-office (Admin): __quản lý sản phẩm, mã giảm giá, đơn hàng — nằm ngoài phạm vi test chi tiết, chỉ nhắc khi cần context.

## **3. Vai trò người dùng (Actors)**

**Actor**

**Mô tả**

Khách vãng lai (Guest)

Xem sản phẩm, thêm vào giỏ; phải đăng nhập khi thanh toán

Khách hàng (Customer)

Đã đăng ký; có hồ sơ, sổ địa chỉ, Ví ShopGo, lịch sử đơn

Nhân viên CSKH / Admin

Quản lý đơn, mã giảm giá, sản phẩm (back-office)

## **4. Bản đồ tính năng (Feature Map)**

__Lưu ý sư phạm: __*bản đồ này chỉ LIỆT KÊ đủ rộng để cả lớp luôn biết đang đứng ở đâu trong hệ thống. KHÔNG viết spec chi tiết cả 8 nhóm — mỗi module chỉ zoom vào 1 function và viết spec sâu khi đó.*

**Mã**

**Nhóm tính năng**

**Các chức năng chính**

A

Tài khoản & Xác thực

Đăng ký, Đăng nhập, Quên mật khẩu, Xác thực OTP/email, Hồ sơ, Sổ địa chỉ

B

Danh mục & Tìm kiếm

Danh sách sản phẩm, Lọc/Sắp xếp, Chi tiết sản phẩm, Hiển thị tồn kho

C

Giỏ hàng

Thêm/Sửa/Xóa, Cập nhật số lượng, Giữ giỏ khi đăng nhập lại

D

Khuyến mãi & Mã giảm giá

Áp dụng Voucher tại thanh toán  ← function dùng cho buổi Supplementary

E

Thanh toán

Chọn địa chỉ giao, Phương thức (COD / Thẻ / Ví ShopGo), Phí ship, Đặt hàng

F

Ví ShopGo (E-Wallet)

Nạp tiền, Số dư, Lịch sử giao dịch, Hoàn tiền  ← cầu nối Module 3

G

Quản lý đơn hàng

Trạng thái đơn, Hủy đơn, Theo dõi, Trả hàng

H

Thông báo & Đánh giá

Email/SMS xác nhận, Đánh giá sản phẩm

## **5. Nền tảng & môi trường**

- __Trình duyệt hỗ trợ: __Chrome, Edge, Safari (bản mới); mobile web (responsive).
- __Môi trường: __Dev → Staging/Test (nơi tester làm việc) → Production. Quan trọng cho tiêu chí Applicable của FACT: “reproduce được trên môi trường test thật không?”.

## **6. Thuật ngữ domain (Glossary)**

SKU; Tồn kho (stock); COD (thu tiền khi nhận); Voucher (% hoặc số tiền cố định); Giá trị đơn tối thiểu (min order value); Trần giảm tối đa (max discount cap); Ví ShopGo (số dư trả trước); Hoàn tiền (refund về ví); Trạng thái đơn (Chờ xác nhận → Đang giao → Hoàn tất / Đã hủy).

## **7. Ràng buộc & NFR mức cao**

Hiệu năng: trang chính tải < 3s. Bảo mật: mật khẩu mã hóa, OTP có hạn. Tương thích đa trình duyệt \+ responsive. Tiền tệ VND, làm tròn theo quy ước hiển thị.

## **8. Ngoài phạm vi**

Back-office admin chi tiết; tích hợp ERP/kho; load test (hiệu năng tải cao); native mobile app.