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
- **Title**: Verify từ chối mã SALE20 cho đơn hàng 250.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ của mã
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có sản phẩm với tổng tiền 250.000 VNĐ (đạt mức sàn chung 200k nhưng chưa đạt mức riêng 300k của SALE20).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20" vào ô nhập mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã voucher: "SALE20" (minSubtotal = 300.000 VNĐ)
  - Tạm tính đơn hàng (Subtotal): 250.000 VNĐ
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã "SALE20".
  - Thông báo hiển thị yêu cầu đơn hàng phải từ 300.000 VNĐ trở lên để sử dụng mã này.
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
- **Title**: Verify hệ thống tự động gỡ voucher và disable kèm thông báo khi giảm giỏ hàng xuống dưới 200.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có 2 sản phẩm "Áo thun Polo" (150.000 VNĐ x 2 = 300.000 VNĐ).
  - Đã áp dụng thành công mã "GIAM50K", tổng thanh toán là 250.000 VNĐ.
- **Test Steps**:
  1. Tại chi tiết giỏ hàng, bấm nút giảm số lượng sản phẩm từ 2 xuống 1 (tổng tiền tụt xuống 150.000 VNĐ < 200.000 VNĐ).
  2. Quan sát phản ứng của module voucher và tổng thanh toán.
- **Test Data**:
  - Số lượng ban đầu: 2 cái (300.000 VNĐ)
  - Số lượng sau khi giảm: 1 cái (150.000 VNĐ)
- **Expected Result**:
  - Hệ thống tự động gỡ bỏ mã "GIAM50K".
  - Hiển thị thông báo cảnh báo: "Đơn hàng không còn đủ điều kiện áp dụng mã giảm giá."
  - Form voucher chuyển sang trạng thái disable cho đến khi đơn hàng đạt lại mức tối thiểu.
  - Chiết khấu trả về 0 VNĐ, tổng thanh toán là 150.000 VNĐ + 30.000 VNĐ (phí ship do < 200k) = 180.000 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-10, Viewpoint#VP-02, Module#VCHR, Automated

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
- **Title**: Verify từ chối áp dụng mã GIAM50K cho đơn hàng ở giá trị cận biên dưới 199.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng được thiết lập có giá trị tạm tính đúng 199.000 VNĐ (sát biên dưới 200k).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K" vào ô mã khuyến mãi.
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "GIAM50K"
  - Tạm tính đơn hàng (Subtotal): 199.000 VNĐ
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo đơn hàng chưa đạt giá trị tối thiểu từ 200.000 VNĐ.
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
- **Title**: Verify từ chối áp dụng mã SALE20 cho đơn hàng ở giá trị cận biên dưới 299.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập.
  - Giỏ hàng có giá trị tạm tính đúng 299.000 VNĐ (sát biên dưới 300k của SALE20).
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "SALE20".
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Mã: "SALE20"
  - Tạm tính đơn hàng (Subtotal): 299.000 VNĐ
- **Expected Result**:
  - Hệ thống từ chối áp dụng mã.
  - Hiển thị thông báo yêu cầu đơn hàng đạt tối thiểu 300.000 VNĐ.
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
- **Title**: Verify chiết khấu mã SALE20 tại đơn hàng 499.000 VNĐ giảm 99.800 VNĐ và 500.000 VNĐ giảm đúng trần 100.000 VNĐ
- **Precondition**:
  - Khách hàng đã đăng nhập, đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Tạo đơn hàng với subtotal 499.000 VNĐ, nhập mã SALE20, bấm Áp dụng và ghi nhận số tiền giảm.
  2. Điều chỉnh giỏ hàng lên subtotal 500.000 VNĐ, nhập mã SALE20, bấm Áp dụng và ghi nhận số tiền giảm.
- **Test Data**:
  - Đơn 1: Subtotal 499.000 VNĐ
  - Đơn 2: Subtotal 500.000 VNĐ
- **Expected Result**:
  - Tại đơn 499.000 VNĐ: Giảm 20% * 499.000 = 99.800 VNĐ (< maxCap 100k).
  - Tại đơn 500.000 VNĐ: Giảm đúng 100.000 VNĐ (chạm ngưỡng maxCap 100k).
- **Priority**: High
- **Tags**: Rule#BR-07, Viewpoint#VP-03, Module#VCHR, Manual

### TC_ID: VCHR-019
- **Title**: Verify làm tròn số tiền chiết khấu lẻ của voucher % bằng hàm Math.floor() với đơn hàng lẻ 333.333 VNĐ
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
- **Tags**: Rule#BR-01, Viewpoint#VP-03, Module#VCHR, Automated

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
  - Hệ thống chặn submit hoặc báo lỗi định dạng: độ dài mã không hợp lệ (phải từ 3 đến 20 ký tự).
  - Không kích hoạt logic áp dụng mã.
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
  - Hệ thống tiếp nhận và xử lý kiểm tra mã hợp lệ trong hệ thống.
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
  - Thuộc tính `maxlength="20"` ngăn chặn người dùng gõ ký tự thứ 21.
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
  - Client-side validation kiểm tra regex `^[A-Z0-9]{3,20}$` phát hiện ký tự lạ.
  - Hệ thống chặn lại ngay lập tức và hiển thị cảnh báo: "Mã không đúng định dạng."
  - Không gửi request không hợp lệ lên backend.
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
  - Hiển thị thông báo lỗi mã không đúng định dạng.
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
  - Chuỗi được sanitize / escape an toàn hoặc bị chặn bởi bộ lọc regex.
  - Hiển thị thông báo mã không hợp lệ bình thường.
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
  - Hệ thống xử lý tham số an toàn (Parameterization / Sanitization).
  - Không xảy ra lỗi 500 Internal Server Error, không rò rỉ thông tin cấu trúc Database.
  - Hiển thị lỗi định dạng hoặc mã không tồn tại an toàn.
- **Priority**: High
- **Tags**: Rule#BR-05, Viewpoint#VP-04, Module#VCHR, Automated

### TC_ID: VCHR-027
- **Title**: Verify cơ chế phòng thủ khi người dùng nhập sai mã liên tục 20 lần trong 10 giây
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
- **Tags**: Rule#BR-05, Viewpoint#VP-04, Module#VCHR, Manual

### TC_ID: VCHR-028
- **Title**: Verify disable nút Áp dụng và hiển thị trạng thái loading khi bấm submit để chống spam double click
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng 350.000 VNĐ.
  - Đang ở màn hình Thanh toán.
- **Test Steps**:
  1. Nhập mã "GIAM50K".
  2. Bấm liên tiếp 3 lần cực nhanh vào nút "Áp dụng".
- **Test Data**:
  - Mã: "GIAM50K"
  - Thao tác: Click 3 lần < 200ms
- **Expected Result**:
  - Ngay từ cú click đầu tiên, nút `#btn-apply-voucher` lập tức chuyển sang trạng thái disabled (`disabled="true"`) và hiển thị biểu tượng loading.
  - Chỉ có duy nhất 01 request được gửi đi xử lý.
  - Không xảy ra race-condition hay double request lên hệ thống.
- **Priority**: High
- **Tags**: Rule#BR-04, Viewpoint#VP-05, Module#VCHR, Automated

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
- **Title**: Verify voucher chỉ giảm trên tiền hàng và không khấu trừ vào phí vận chuyển
- **Precondition**:
  - Khách hàng đã đăng nhập, giỏ hàng có 1 sản phẩm "Áo thun Polo" trị giá 150.000 VNĐ + "Phụ kiện móc khóa" 60.000 VNĐ = 210.000 VNĐ (đạt sàn 200k).
  - Giả lập đơn hàng thuộc khu vực áp dụng phí ship tiêu chuẩn 30.000 VNĐ.
- **Test Steps**:
  1. Nhập mã "GIAM50K".
  2. Bấm nút "Áp dụng".
- **Test Data**:
  - Tạm tính hàng (Subtotal): 210.000 VNĐ
  - Phí vận chuyển (Shipping): 30.000 VNĐ
  - Mã voucher: GIAM50K
- **Expected Result**:
  - Giảm giá 50.000 VNĐ chỉ khấu trừ vào tiền hàng: 210.000 - 50.000 = 160.000 VNĐ.
  - Phí vận chuyển 30.000 VNĐ giữ nguyên vẹn.
  - Tổng thanh toán là: 160.000 + 30.000 = 190.000 VNĐ.
- **Priority**: High
- **Tags**: Rule#BR-09, Viewpoint#VP-06, Module#VCHR, Automated

### TC_ID: VCHR-032
- **Title**: Verify hạn mức lượt dùng voucher chỉ bị trừ chính thức tại thời điểm Đặt hàng thành công
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
- **Tags**: Rule#BR-04, Viewpoint#VP-06, Module#VCHR, Manual

### TC_ID: VCHR-033
- **Title**: Verify tự động hoàn lại lượt dùng voucher cho khách hàng khi đơn hàng bị hủy
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
- **Tags**: Rule#BR-03, Viewpoint#VP-06, Module#VCHR, Manual

### TC_ID: VCHR-034
- **Title**: Verify bản ghi đơn hàng lưu đầy đủ các trường subtotal, discount, appliedCode, shippingFee và total
- **Precondition**:
  - Khách hàng đã đăng nhập tài khoản "khachhang@shopgo.vn".
  - Giỏ hàng có sản phẩm "Tai nghe Bluetooth Không Dây" 350.000 VNĐ.
  - Đã áp dụng mã "GIAM50K", tổng tiền là 300.000 VNĐ.
- **Test Steps**:
  1. Bấm nút "Tiến hành Đặt hàng (300.000 ₫)" (`#btn-submit-checkout`).
  2. Chờ modal "Đặt hàng thành công!" xuất hiện kèm mã đơn hàng `SG-XXXXXX`.
  3. Kiểm tra thông tin đơn hàng được lưu trong hệ thống (LocalStorage / Database Order Record).
- **Test Data**:
  - Mã đơn sinh ra: `SG-XXXXXX`
- **Expected Result**:
  - Bản ghi đơn hàng chứa đầy đủ:
    - `subtotal`: 350000
    - `discount`: 50000
    - `appliedCode`: "GIAM50K"
    - `shippingFee`: 0
    - `total`: 300000
    - `status`: "Processing" hoặc "Confirmed"
- **Priority**: High
- **Tags**: Rule#BR-04, Viewpoint#VP-06, Module#VCHR, Automated
