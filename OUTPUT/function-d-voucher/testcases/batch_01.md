### TC_ID: VCHR-001
- **Title**: Verify áp dụng thành công mã giảm tiền cố định GIAM50K cho đơn hàng đạt mức sàn 200.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn" / "123456" (Nguyễn Văn An).
  - Giỏ hàng có 1 sản phẩm "Bình giữ nhiệt Thông Minh" trị giá 200.000 VNĐ (đạt mức sàn 200.000 VNĐ).
  - Người dùng đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng" (`#btn-apply-voucher`).
- **Test Data**:
  - Mã voucher: "GIAM50K"
  - Tạm tính đơn hàng (Subtotal): 200.000 VNĐ
- **Expected Result**:
  - Hệ thống hiển thị thông báo thành công: "Áp dụng thành công mã \"GIAM50K\": Giảm 50.000 ₫."
  - Dòng "Giảm giá voucher" hiển thị "-50.000 ₫" kèm badge mã GIAM50K.
  - Phí vận chuyển hiển thị "Miễn phí (Freeship)".
  - Tổng thanh toán cập nhật chính xác thành: 150.000 VNĐ (200.000 - 50.000).
- **Priority**: High
- **Tags**: Rule#BR-01, Rule#BR-02, Rule#BR-04, Viewpoint#VP-01, Module#VCHR, Automated

### TC_ID: VCHR-002
- **Title**: Verify áp dụng thành công mã phần trăm SALE20 cho đơn hàng 350.000 VNĐ giảm đúng 20%
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn" / "123456".
  - Giỏ hàng có 1 sản phẩm "Tai nghe Bluetooth Không Dây" trị giá 350.000 VNĐ (thỏa mãn minSubtotal 300.000 VNĐ của mã SALE20).
  - Người dùng đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng" (`#btn-apply-voucher`).
- **Test Data**:
  - Mã voucher: "SALE20"
  - Tạm tính đơn hàng (Subtotal): 350.000 VNĐ
- **Expected Result**:
  - Hệ thống hiển thị thông báo áp dụng thành công mã "SALE20".
  - Số tiền giảm được tính chính xác: 350.000 * 20% = 70.000 VNĐ.
  - Dòng "Giảm giá voucher" hiển thị "-70.000 ₫".
  - Tổng thanh toán cập nhật chính xác thành: 280.000 VNĐ (350.000 - 70.000).
- **Priority**: High
- **Tags**: Rule#BR-01, Rule#BR-02, Rule#BR-04, Viewpoint#VP-01, Module#VCHR, Automated

### TC_ID: VCHR-003
- **Title**: Verify áp dụng mã SALE20 cho đơn hàng 600.000 VNĐ kích hoạt đúng mức trần chiết khấu maxCap 100.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn" / "123456".
  - Giỏ hàng có 4 sản phẩm "Áo thun Polo Thể Thao Nam" (150.000 VNĐ x 4 = 600.000 VNĐ).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20" vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "SALE20"
  - Tạm tính đơn hàng (Subtotal): 600.000 VNĐ
- **Expected Result**:
  - Mức chiết khấu lý thuyết là 20% * 600.000 = 120.000 VNĐ.
  - Hệ thống áp dụng mức trần tối đa maxCap: số tiền giảm thực tế là 100.000 VNĐ.
  - Dòng "Giảm giá voucher" hiển thị "-100.000 ₫".
  - Tổng thanh toán cập nhật chính xác thành: 500.000 VNĐ (600.000 - 100.000).
- **Priority**: High
- **Tags**: Rule#BR-07, Viewpoint#VP-01, Module#VCHR, Automated

### TC_ID: VCHR-004
- **Title**: Verify tự động chuẩn hóa trim khoảng trắng và uppercase khi nhập mã giam50k chữ thường
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm trị giá 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập chuỗi "  giam50k  " (có 2 khoảng trắng đầu, 2 khoảng trắng cuối, chữ thường) vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Chuỗi nhập thô: "  giam50k  "
- **Expected Result**:
  - Hệ thống tự động trim khoảng trắng và convert thành "GIAM50K".
  - Áp dụng thành công và giảm trừ 50.000 VNĐ vào đơn hàng.
  - Không phát sinh lỗi mã không hợp lệ.
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-01, Module#VCHR, Automated

### TC_ID: VCHR-005
- **Title**: Verify bấm trực tiếp vào badge gợi ý GIAM50K tự động điền mã và áp dụng thành công
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm 350.000 VNĐ.
  - Đang ở màn hình Thanh toán, danh sách mã giảm giá có sẵn hiển thị badge `#badge-voucher-GIAM50K`.
- **Test Steps**:
  1. Bấm vào badge mã "GIAM50K" trên giao diện gợi ý.
- **Test Data**:
  - Nút bấm: `#badge-voucher-GIAM50K`
- **Expected Result**:
  - Mã "GIAM50K" tự động được điền vào ô `#input-voucher-code`.
  - Hệ thống tự động kích hoạt áp dụng mã thành công mà người dùng không cần bấm nút Áp dụng.
  - Giảm giá voucher hiển thị "-50.000 ₫", tổng thanh toán cập nhật thành 300.000 VNĐ.
- **Priority**: Medium
- **Tags**: Rule#BR-04, Viewpoint#VP-01, Module#VCHR, Automated

### TC_ID: VCHR-006
- **Title**: Verify từ chối áp dụng mã voucher đã hết hạn HETHAN kèm thông báo lỗi phù hợp
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "HETHAN" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "HETHAN" (mã có thuộc tính expired: true)
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo lỗi màu đỏ: "Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."
  - Số tiền giảm giá voucher giữ nguyên "0 ₫".
  - Tổng thanh toán không thay đổi (350.000 VNĐ).
- **Priority**: High
- **Tags**: Rule#BR-03, Rule#BR-05, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-007
- **Title**: Verify từ chối áp dụng mã voucher không tồn tại trong hệ thống kèm thông báo lỗi
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã không tồn tại "KHONGCOMA" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "KHONGCOMA"
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo lỗi: "Mã giảm giá \"KHONGCOMA\" không tồn tại trên hệ thống."
  - Không có chiết khấu nào được áp dụng vào đơn hàng.
- **Priority**: High
- **Tags**: Rule#BR-05, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-008
- **Title**: Verify từ chối áp dụng mã khi đơn hàng dưới mức sàn tối thiểu 200.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn".
  - Giỏ hàng chỉ có 1 sản phẩm "Áo thun Polo Thể Thao Nam" trị giá 150.000 VNĐ (subtotal < 200.000 VNĐ).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "GIAM50K" (yêu cầu minSubtotal 200.000 VNĐ)
  - Tạm tính đơn hàng (Subtotal): 150.000 VNĐ
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị cảnh báo đơn hàng chưa đạt giá trị tối thiểu 200.000 VNĐ để áp dụng mã giảm giá.
  - Chiết khấu giữ nguyên 0 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-10, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-009
- **Title**: Verify từ chối mã SALE20 cho đơn hàng 200.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ của mã
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có "Bình nước giữ nhiệt Kim Loại" (`prod-003`) × 1 = 200.000 VNĐ (đạt mức sàn chung 200k nhưng chưa đạt mức riêng 300k của SALE20).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "SALE20" (minSubtotal = 300.000 VNĐ)
  - Tạm tính đơn hàng (Subtotal): 200.000 VNĐ *(thay 250.000 VNĐ — không tạo được trên catalog thật, `07b_ui_locator_map.md` §4)*
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã "SALE20".
  - Hiển thị thông báo: "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 200.000 ₫)."
  - Số tiền giảm là 0 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-02, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-010
- **Title**: Verify báo lỗi yêu cầu nhập mã khi bỏ trống hoặc chỉ nhập khoảng trắng rồi bấm Áp dụng
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Để trống ô `#input-voucher-code` (hoặc chỉ nhập các ký tự khoảng trắng "   ").
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Input: "" (chuỗi rỗng)
- **Expected Result**:
  - Hệ thống chặn submit và hiển thị thông báo lỗi: "Vui lòng nhập mã khuyến mãi."
  - Không gửi request xử lý lên backend.
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-011
- **Title**: Verify giữ mã GIAM50K kèm cảnh báo chưa đủ điều kiện và không giảm tiền khi giảm giỏ hàng xuống dưới 200.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có "Áo thun Trendy Unisex" (`prod-001`) × 2 = 300.000 VNĐ.
  - Đã áp dụng thành công mã "GIAM50K", tổng thanh toán là 250.000 VNĐ.
- **Test Steps**:
  1. Tại giỏ hàng, nhập số lượng "1" vào ô `#input-qty-prod-001` (tổng tiền tụt xuống 150.000 VNĐ < 200.000 VNĐ).
  2. Quan sát khu vực voucher và tổng thanh toán.
- **Test Data**:
  - Số lượng ban đầu: 2 (300.000 VNĐ)
  - Số lượng sau khi giảm: 1 (150.000 VNĐ)
- **Expected Result**:
  - Mã "GIAM50K" vẫn được giữ trong form voucher (không tự gỡ) — theo quyết định `knowledge` Mục 8 #12.
  - Hiển thị cảnh báo vàng: "Mã \"GIAM50K\" chưa đủ điều kiện áp dụng".
  - Giảm giá = 0 VNĐ; phí ship = 30.000 VNĐ (do < 200k); tổng thanh toán `#label-total-payable` = 180.000 ₫.
- **Priority**: High
- **Tags**: Rule#BR-10, Rule#MR-02, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-012
- **Title**: Verify bấm nút Gỡ bỏ voucher để hủy mã đang áp dụng và hoàn lại tổng tiền thanh toán gốc
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đã áp dụng thành công mã "GIAM50K", nút `#btn-remove-voucher` đang hiển thị.
- **Test Steps**:
  1. Bấm nút "Gỡ mã" (`#btn-remove-voucher`).
- **Test Data**:
  - Hành động: Click nút Gỡ mã
- **Expected Result**:
  - Mã "GIAM50K" bị hủy áp dụng ngay lập tức.
  - Badge mã và nút "Gỡ mã" biến mất, nút "Áp dụng" quay lại trạng thái bình thường.
  - Dòng "Giảm giá voucher" trở về "0 ₫".
  - Tổng thanh toán được hoàn lại mức gốc: 350.000 VNĐ.
- **Priority**: Medium
- **Tags**: Rule#BR-08, Viewpoint#VP-02, Module#VCHR, Automated

### TC_ID: VCHR-013
- **Title**: Verify chỉ ghi nhận mã mới nhất khi người dùng áp dụng liên tiếp 2 voucher khác nhau trên cùng đơn hàng
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có sản phẩm trị giá 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K" và bấm Áp dụng (giảm 50.000 VNĐ).
  2. Nhập tiếp mã "SALE20" vào ô input và bấm Áp dụng.
- **Test Data**:
  - Mã lần 1: "GIAM50K"
  - Mã lần 2: "SALE20"
- **Expected Result**:
  - Mã "GIAM50K" cũ bị thay thế bởi mã mới "SALE20".
  - Hệ thống chỉ áp dụng duy nhất 1 voucher chiết khấu: 20% của 350.000 VNĐ = 70.000 VNĐ.
  - Không xảy ra tình trạng cộng dồn 2 mã (50k + 70k = 120k).
  - Tổng thanh toán hiển thị: 280.000 VNĐ.
- **Priority**: Medium
- **Tags**: Rule#BR-04, Viewpoint#VP-02, Module#VCHR, Manual

### TC_ID: VCHR-014
- **Title**: Verify từ chối áp dụng mã GIAM50K cho đơn hàng ở giá trị cận biên dưới 190.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng được thiết lập có "Sạc dự phòng Siêu Nhanh 20W" (`prod-005`) × 1 = 190.000 VNĐ (mốc gần nhất dưới 200k tạo được trên catalog thật).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K" vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "GIAM50K"
  - Tạm tính đơn hàng (Subtotal): 190.000 VNĐ *(thay 199.000 VNĐ — không tạo được, `07b` §4)*
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo: "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 190.000 ₫)."
  - Không có chiết khấu nào được áp dụng.
- **Priority**: High
- **Tags**: Rule#BR-10, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-015
- **Title**: Verify chấp nhận áp dụng mã GIAM50K cho đơn hàng ở đúng giá trị biên chuẩn 200.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có 1 sản phẩm đúng giá trị biên chuẩn 200.000 VNĐ ("Bình giữ nhiệt Thông Minh").
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K".
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "GIAM50K"
  - Tạm tính đơn hàng (Subtotal): 200.000 VNĐ
- **Expected Result**:
  - Hệ thống chấp nhận áp dụng mã thành công.
  - Số tiền giảm: 50.000 VNĐ.
  - Tổng thanh toán: 150.000 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-10, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-016
- **Title**: Verify từ chối áp dụng mã SALE20 cho đơn hàng ở giá trị cận biên dưới 280.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có "Balo Chống Nước Oxford" (`prod-004`) × 1 = 280.000 VNĐ (mốc gần nhất dưới 300k tạo được trên catalog thật).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20".
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "SALE20"
  - Tạm tính đơn hàng (Subtotal): 280.000 VNĐ *(thay 299.000 VNĐ — không tạo được, `07b` §4)*
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo: "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 280.000 ₫)."
  - Tiền giảm là 0 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-02, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-017
- **Title**: Verify chấp nhận áp dụng mã SALE20 cho đơn hàng ở đúng giá trị biên chuẩn 300.000 VNĐ giảm 60.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có giá trị tạm tính đúng 300.000 VNĐ (2 Áo thun Polo x 150.000 VNĐ).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20".
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "SALE20"
  - Tạm tính đơn hàng (Subtotal): 300.000 VNĐ
- **Expected Result**:
  - Hệ thống chấp nhận áp dụng mã thành công.
  - Giảm giá chính xác: 20% * 300.000 = 60.000 VNĐ.
  - Tổng thanh toán cập nhật: 240.000 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-02, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-018
- **Title**: Verify chiết khấu mã SALE20 tại đơn hàng 490.000 VNĐ giảm 98.000 VNĐ và 500.000 VNĐ giảm đúng trần 100.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập, đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Tạo giỏ hàng "Áo thun Trendy Unisex" (`prod-001`) × 2 + "Sạc dự phòng Siêu Nhanh 20W" (`prod-005`) × 1 = 490.000 VNĐ, nhập mã SALE20, bấm Áp dụng và ghi nhận số tiền giảm.
  2. Đổi giỏ hàng thành `prod-001` × 1 + "Tai nghe Bluetooth Không Dây" (`prod-002`) × 1 = 500.000 VNĐ, áp lại mã SALE20 và ghi nhận số tiền giảm.
- **Test Data**:
  - Đơn 1: Subtotal 490.000 VNĐ *(thay 499.000 VNĐ — không tạo được, `07b` §4)*
  - Đơn 2: Subtotal 500.000 VNĐ
- **Expected Result**:
  - Tại đơn 490.000 VNĐ: giảm 20% × 490.000 = 98.000 VNĐ (< maxCap 100k); tổng = 392.000 ₫.
  - Tại đơn 500.000 VNĐ: giảm đúng 100.000 VNĐ (chạm ngưỡng maxCap 100k); tổng = 400.000 ₫.
- **Priority**: High
- **Tags**: Rule#BR-07, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-019
- **Title**: Verify làm tròn số tiền chiết khấu lẻ của voucher % bằng hàm Math.floor() với đơn hàng lẻ 333.333 VNĐ
- **Trạng thái**: ⏸️ **TẠM ĐÓNG** — chưa kiểm chứng được trên dữ liệu hiện tại (mọi giá là bội số 10.000 ₫). Mở lại khi catalog có giá lẻ. Căn cứ: `knowledge` Mục 8 #15.
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có giá trị tiền lẻ 333.333 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20" (chiết khấu 20%).
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "SALE20"
  - Tạm tính đơn hàng: 333.333 VNĐ
- **Expected Result**:
  - Phép tính lý thuyết: 333.333 * 0.2 = 66.666,6 VNĐ.
  - Hệ thống áp dụng hàm `Math.floor()` làm tròn xuống hàng đơn vị đồng: 66.666 VNĐ (không làm tròn lên 66.667 VNĐ).
  - Dòng "Giảm giá voucher" hiển thị "-66.666 ₫".
  - Tổng thanh toán cập nhật: 266.667 VNĐ.
- **Priority**: Medium
- **Tags**: Rule#BR-01, Viewpoint#VP-03, Module#VCHR, Scope#Deferred

### TC_ID: VCHR-020
- **Title**: Verify từ chối xử lý mã voucher có độ dài 2 ký tự dưới ngưỡng tối thiểu quy định
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập chuỗi 2 ký tự "AB" vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã nhập: "AB" (độ dài = 2 < minLength 3)
- **Expected Result**:
  - Hiển thị thông báo lỗi "Mã giảm giá không đúng định dạng." (vi phạm F-01: tối thiểu 3 ký tự — `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md`).
  - Không tra cứu mã, không áp dụng giảm giá.
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-021
- **Title**: Verify chấp nhận xử lý mã voucher có độ dài đúng 20 ký tự chạm ngưỡng tối đa
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập chuỗi 20 ký tự hợp lệ "VOUCHERCHINHHANG2026" vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã nhập: "VOUCHERCHINHHANG2026" (độ dài = 20 ký tự)
- **Expected Result**:
  - Ô input cho phép nhập đủ 20 ký tự, không bị cắt cụt.
  - Mã qua được kiểm tra định dạng (F-01, F-02) và được tra cứu: hiển thị "Mã giảm giá \"VOUCHERCHINHHANG2026\" không tồn tại trên hệ thống."
  - Không hiển thị lỗi "không đúng định dạng".
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-022
- **Title**: Verify ô input chặn không cho nhập ký tự thứ 21 khi người dùng gõ chuỗi vượt quá 20 ký tự
- **Precondition**:
  - Khách hàng đang ở màn hình Thanh toán, ô `#input-voucher-code` đang active.
- **Test Steps**:
  1. Nhập chuỗi 25 ký tự "ABCDE12345ABCDE12345XXXXX" vào ô `#input-voucher-code`.
- **Test Data**:
  - Chuỗi gõ vào: 25 ký tự
- **Expected Result**:
  - Ô nhập không nhận ký tự thứ 21 (F-03 — `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md`).
  - Giá trị lưu trong input chỉ dừng lại ở đúng 20 ký tự đầu tiên: "ABCDE12345ABCDE12345".
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-03, Module#VCHR, Automated

### TC_ID: VCHR-023
- **Title**: Verify chặn nhập ký tự đặc biệt hoặc emoji vào ô mã voucher với cảnh báo không đúng định dạng
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập chuỗi chứa ký tự đặc biệt "@GIAM#50K!" hoặc emoji "GIAM50K🔥" vào ô mã voucher.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Input: "@GIAM#50K!"
- **Expected Result**:
  - Hiển thị thông báo lỗi "Mã giảm giá không đúng định dạng." (vi phạm F-02 — `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md`).
  - Không tra cứu mã, không áp dụng giảm giá.
- **Priority**: High
- **Tags**: Rule#BR-06, Viewpoint#VP-04, Module#VCHR, Automated

### TC_ID: VCHR-024
- **Title**: Verify chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập chuỗi có khoảng trắng ở giữa "GIAM 50K" vào ô mã voucher.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Input: "GIAM 50K"
- **Expected Result**:
  - Hệ thống không cho phép áp dụng mã có chứa khoảng trắng bên trong chuỗi.
  - Hiển thị thông báo lỗi "Mã giảm giá không đúng định dạng." (vi phạm F-05).
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-04, Module#VCHR, Automated

### TC_ID: VCHR-025
- **Title**: Verify hệ thống phòng thủ an toàn trước payload XSS nhập vào ô voucher
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập payload XSS `<script>alert('XSS')</script>` vào ô `#input-voucher-code`.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Input payload: `<script>alert('XSS')</script>`
- **Expected Result**:
  - Trình duyệt KHÔNG xuất hiện hộp thoại alert hay thực thi mã script JavaScript.
  - Chuỗi hiển thị lại (nếu có) được escape, không render thành thẻ HTML.
  - Hiển thị thông báo lỗi "Mã giảm giá không đúng định dạng." (vi phạm F-02).
- **Priority**: High
- **Tags**: Rule#BR-05, Viewpoint#VP-04, Module#VCHR, Automated

### TC_ID: VCHR-026
- **Title**: Verify hệ thống phòng thủ an toàn trước payload SQL Injection nhập vào ô voucher
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập payload SQL Injection `' OR '1'='1` vào ô `#input-voucher-code`.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Input payload: `' OR '1'='1`
- **Expected Result**:
  - Không áp dụng giảm giá, giao diện không lỗi, không lộ thông tin kỹ thuật (app không có backend — `knowledge` Mục 8 #10).
  - Hiển thị thông báo lỗi "Mã giảm giá không đúng định dạng." (vi phạm F-02).
- **Priority**: High
- **Tags**: Rule#BR-05, Viewpoint#VP-04, Module#VCHR, Automated

### TC_ID: VCHR-027
- **Title**: Verify cơ chế phòng thủ khi người dùng nhập sai mã liên tục 20 lần trong 10 giây
- **Trạng thái**: ⛔ **NGOÀI PHẠM VI AUTOMATION ĐỢT NÀY** — FE không có tính năng tương ứng. Giữ trong Master Spec để dùng khi có tính năng. Căn cứ: `knowledge` Mục 8 #16.
- **Precondition**:
  - Khách hàng đã đăng nhập, đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Viết script gửi liên tiếp 20 request nhập mã sai khác nhau ("SAI01", "SAI02"...) trong vòng 10 giây.
- **Test Data**:
  - 20 chuỗi mã sai ngẫu nhiên trong 10 giây
- **Expected Result**:
  - Hệ thống kích hoạt cơ chế Rate Limiting hoặc hiển thị thông báo: "Bạn đã thử quá nhiều lần. Vui lòng thử lại sau ít phút."
  - Khóa tạm thời nút áp dụng voucher trong 60 giây để chống brute-force quét mã khuyến mãi.
- **Priority**: Medium
- **Tags**: Rule#BR-05, Viewpoint#VP-04, Module#VCHR, Manual, Scope#OutOfAutomation

### TC_ID: VCHR-028
- **Title**: Verify bấm nút Áp dụng liên tiếp nhiều lần chỉ giảm giá đúng một lần
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng "Tai nghe Bluetooth Không Dây" (`prod-002`) × 1 = 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K".
  2. Bấm liên tiếp 5 lần thật nhanh vào nút `#btn-apply-voucher`.
- **Test Data**:
  - Mã: "GIAM50K"
  - Thao tác: 5 click liên tiếp
- **Expected Result**:
  - Giảm giá chỉ được tính một lần: dòng giảm giá = -50.000 ₫; tổng `#label-total-payable` = 300.000 ₫.
  - Không kiểm tra trạng thái disable/loading của nút — FE xử lý tức thời, theo quyết định `knowledge` Mục 8 #13.
- **Priority**: High
- **Tags**: Rule#BR-04, Rule#MR-05, Viewpoint#VP-05, Module#VCHR, Automated

### TC_ID: VCHR-029
- **Title**: Verify hiển thị tiền giảm với màu xanh lá, tiền tố dấu trừ và badge tên mã đang kích hoạt
- **Precondition**:
  - Khách hàng đã áp dụng thành công mã "GIAM50K" cho đơn hàng 350.000 VNĐ.
- **Test Steps**:
  1. Quan sát khu vực "Chi tiết thanh toán" và form voucher.
- **Test Data**:
  - Mã đã áp dụng: "GIAM50K"
- **Expected Result**:
  - Dòng "Giảm giá voucher" hiển thị giá trị "-50.000 ₫" với màu xanh lá cây (text-emerald hoặc green) nổi bật.
  - Kèm theo badge nhỏ hiển thị chữ "GIAM50K".
  - Hiển thị badge trạng thái "Đang kích hoạt giảm giá" và nút "Gỡ mã".
- **Priority**: Medium
- **Tags**: Rule#BR-04, Viewpoint#VP-05, Module#VCHR, Automated

### TC_ID: VCHR-030
- **Title**: Verify giao diện form voucher và danh sách badge hiển thị chuẩn responsive trên cả Desktop và Mobile
- **Precondition**:
  - Đang mở màn hình Thanh toán trên trình duyệt web.
- **Test Steps**:
  1. Kiểm tra hiển thị tại viewport Desktop (1920x1080 hoặc 1440x900).
  2. Đổi viewport sang Mobile Web (375x812 - iPhone X / 390x844 - iPhone 14).
- **Test Data**:
  - Viewports: Desktop 1440px vs Mobile 375px
- **Expected Result**:
  - Trên Desktop: Form voucher và bảng thanh toán nằm ở cột bên phải cân đối, không tràn màn hình.
  - Trên Mobile: Giao diện tự động co dãn 1 cột, ô input và nút Áp dụng hiển thị vừa vặn, danh sách badge không bị che khuất chữ.
- **Priority**: Medium
- **Tags**: Rule#BR-04, Viewpoint#VP-05, Module#VCHR, Manual

### TC_ID: VCHR-031
- **Title**: Verify voucher chỉ giảm trên tiền hàng, không khấu trừ vào phí vận chuyển (kiểm chứng gián tiếp qua công thức tổng tiền)
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng "Tai nghe Bluetooth Không Dây" (`prod-002`) × 1 = 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K", bấm "Áp dụng".
  2. Ghi nhận Tạm tính, Phí vận chuyển, Giảm giá và Tổng thanh toán.
  3. Bấm `#btn-submit-checkout`, đọc bản ghi đơn mới nhất trong `localStorage["shopgo_orders"]`.
- **Test Data**:
  - Subtotal: 350.000 VNĐ · Mã: GIAM50K
- **Expected Result**:
  - Hiển thị: Tạm tính 350.000 ₫ · Phí vận chuyển 0 ₫ (freeship ≥ 200k) · Giảm giá -50.000 ₫ · Tổng 300.000 ₫.
  - Bản ghi đơn: `subtotal = 350000`, `shippingFee = 0`, `discount = 50000`, `total = 300000`, thoả `total = subtotal + shippingFee − discount`.
  - `discount` không vượt quá `subtotal` (giảm giá chỉ tính trên tiền hàng).
  - Ghi chú: ngưỡng freeship trùng mức sàn voucher nên không có trạng thái "có phí ship và áp được mã" — theo quyết định `knowledge` Mục 8 #14.
- **Priority**: High
- **Tags**: Rule#BR-09, Viewpoint#VP-06, Module#VCHR, Automated

### TC_ID: VCHR-032
- **Title**: Verify hạn mức lượt dùng voucher chỉ bị trừ chính thức tại thời điểm Đặt hàng thành công
- **Trạng thái**: ⛔ **NGOÀI PHẠM VI AUTOMATION ĐỢT NÀY** — FE không có tính năng tương ứng. Giữ trong Master Spec để dùng khi có tính năng. Căn cứ: `knowledge` Mục 8 #16.
- **Precondition**:
  - Voucher cấu hình có giới hạn lượt dùng còn lại = 1 lượt.
  - Khách hàng đã đăng nhập và thêm hàng vào giỏ.
- **Test Steps**:
  1. Nhập mã voucher và bấm Áp dụng thành công (chưa bấm Đặt hàng).
  2. Kiểm tra trạng thái lượt dùng của mã trong hệ thống.
  3. Bấm nút "Tiến hành Đặt hàng" và hoàn tất đơn hàng.
  4. Kiểm tra lại trạng thái lượt dùng của mã.
- **Test Data**:
  - Voucher: Mã có lượt dùng còn lại = 1
- **Expected Result**:
  - Tại bước 1-2 (mới chỉ Áp dụng): Lượt dùng chưa bị trừ chính thức (vẫn còn 1 lượt).
  - Tại bước 3-4 (Đặt hàng thành công): Lượt dùng bị trừ chính thức về 0. Lần sau nhập mã này sẽ báo lỗi hết lượt sử dụng.
- **Priority**: High
- **Tags**: Rule#BR-04, Viewpoint#VP-06, Module#VCHR, Manual, Scope#OutOfAutomation

### TC_ID: VCHR-033
- **Title**: Verify tự động hoàn lại lượt dùng voucher cho khách hàng khi đơn hàng bị hủy
- **Trạng thái**: ⛔ **NGOÀI PHẠM VI AUTOMATION ĐỢT NÀY** — FE không có tính năng tương ứng. Giữ trong Master Spec để dùng khi có tính năng. Căn cứ: `knowledge` Mục 8 #16.
- **Precondition**:
  - Khách hàng đã đặt hàng thành công đơn hàng có áp mã voucher giới hạn 1 lượt dùng.
  - Mã voucher vẫn còn trong thời hạn sử dụng.
- **Test Steps**:
  1. Khách hàng vào mục Quản lý Đơn hàng, bấm "Hủy đơn hàng" trước khi đơn được giao.
  2. Xác nhận hủy đơn thành công.
  3. Tạo đơn hàng mới và thử nhập lại mã voucher vừa dùng.
- **Test Data**:
  - Mã voucher: Mã hoàn lại sau hủy đơn
- **Expected Result**:
  - Hệ thống tự động phục hồi lại quyền sử dụng voucher cho tài khoản khách hàng.
  - Khách hàng áp dụng lại mã trên đơn hàng mới thành công.
- **Priority**: Medium
- **Tags**: Rule#BR-03, Viewpoint#VP-06, Module#VCHR, Manual, Scope#OutOfAutomation

### TC_ID: VCHR-034
- **Title**: Verify bản ghi đơn hàng lưu đầy đủ các trường subtotal, discount, appliedCode, shippingFee và total
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn".
  - Giỏ hàng có sản phẩm "Tai nghe Bluetooth Không Dây" 350.000 VNĐ.
  - Đã áp dụng mã "GIAM50K", tổng tiền là 300.000 VNĐ.
- **Test Steps**:
  1. Bấm nút "Tiến hành Đặt hàng (300.000 ₫)" (`#btn-submit-checkout`).
  2. Chờ modal "Đặt hàng thành công!" xuất hiện kèm mã đơn hàng `SG-XXXXXX`.
  3. Kiểm tra thông tin đơn hàng được lưu trong hệ thống (`localStorage["shopgo_orders"]`).
- **Test Data**:
  - Mã đơn sinh ra: `SG-XXXXXX`
- **Expected Result**:
  - Bản ghi đơn hàng chứa đầy đủ:
    - `subtotal`: 350000
    - `discount`: 50000
    - `appliedCode`: "GIAM50K"
    - `shippingFee`: 0
    - `total`: 300000
    - `orderId` dạng `SG-XXXXXX`; `userId`, `date`, `items`, `createdAt` có giá trị
- **Priority**: High
- **Tags**: Rule#BR-04, Viewpoint#VP-06, Module#VCHR, Automated

### TC_ID: VCHR-035
- **Title**: Verify tải lại trang sau khi áp voucher thì giỏ hàng và mã giảm giá được làm mới nhưng vẫn giữ trạng thái đăng nhập
- **Precondition**:
  - Khách hàng đã đăng nhập "khachhang@shopgo.vn", giỏ hàng `prod-002` × 1 = 350.000 VNĐ, đã áp mã "GIAM50K".
- **Test Steps**:
  1. Tải lại trang (F5).
  2. Quan sát trạng thái đăng nhập, giỏ hàng và form voucher.
- **Test Data**:
  - Mã: "GIAM50K" · Subtotal: 350.000 VNĐ
- **Expected Result**:
  - Vẫn ở trạng thái đăng nhập (`localStorage["shopgo_user"]` còn tồn tại).
  - Giỏ hàng trống, không còn mã "GIAM50K" được áp — giỏ hàng và voucher chỉ lưu trong bộ nhớ phiên, không ghi `localStorage` (đối chiếu mã nguồn FE Live 2026-09-30).
- **Priority**: Medium
- **Tags**: Rule#GAP-H2, Viewpoint#VP-06, Module#VCHR, Automated

### TC_ID: VCHR-036
- **Title**: Verify đặt hàng có voucher ở hai tab trình duyệt thì cả hai đơn đều được lưu, không ghi đè nhau
- **Precondition**:
  - Khách hàng đã đăng nhập "khachhang@shopgo.vn"; lịch sử đơn hàng đã xoá sạch.
  - Mở 2 tab ShopGo (Tab A, Tab B) **trước khi** đặt đơn nào.
- **Test Steps**:
  1. Tab A: thêm `prod-002` × 1, áp mã "GIAM50K", bấm Đặt hàng.
  2. Tab B (không tải lại): thêm `prod-004` × 1, áp mã "GIAM50K", bấm Đặt hàng.
  3. Tải lại một tab, mở tab Đơn hàng và đọc `localStorage["shopgo_orders"]`.
- **Test Data**:
  - Tab A: 350.000 − 50.000 = 300.000 ₫ · Tab B: 280.000 − 50.000 = 230.000 ₫
- **Expected Result**:
  - [GIẢ ĐỊNH – rủi ro MED] Lịch sử có đủ **2 đơn** (300.000 ₫ và 230.000 ₫), mỗi đơn `appliedCode = "GIAM50K"`; không đơn nào bị mất.
  - Ghi chú: mã nguồn FE chỉ đọc danh sách đơn một lần khi khởi động, khi lưu thì ghi đè cả mảng và không lắng nghe sự kiện `storage` ➔ dự báo đơn của Tab A bị mất (lost update). Kỳ vọng "không mất đơn" do QA Lead chốt theo uỷ quyền (`knowledge` Mục 8 #19); cần BA xác nhận nếu FAIL.
- **Priority**: High
- **Tags**: Rule#GAP-H2, Viewpoint#VP-06, Module#VCHR, Automated
