# Test Case Spec · hoan-tien
Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: 04_test_idea_report.md, 01_requirement_risk_summary.md, 03_viewpoint_report.md, knowledge/features/hoan-tien.md · Verdict: PASS

### TC_ID: REFUND-027
- **Title**: Verify yêu cầu 500.001đ lý do Hàng lỗi có ảnh không được tự động duyệt
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng và chọn Yêu cầu hoàn tiền
  2. Chọn lý do Hàng lỗi
  3. Nhập số tiền yêu cầu
  4. Đính kèm ảnh minh chứng
  5. Nhấn Gửi yêu cầu
  6. Mở chi tiết yêu cầu vừa tạo
- **Test Data**:
  - Lý do: Hàng lỗi
  - Số tiền yêu cầu: 500.001đ (ngưỡng 500.000đ + 1)
  - Ảnh minh chứng: 1 ảnh JPG hoặc PNG hợp lệ, [CHƯA CÓ TRONG TÀI LIỆU] tên tệp cụ thể
  - Số tiền đã thanh toán của đơn: phải không nhỏ hơn 500.001đ, [CHƯA CÓ TRONG TÀI LIỆU] giá trị cụ thể
- **Expected Result**:
  - Yêu cầu không được hệ thống tự động duyệt, ở trạng thái Chờ duyệt
  - Yêu cầu do Nhân viên CSKH duyệt (BR-06, số tiền không vượt 5.000.000đ)
- **Priority**: High
- **Tags**: Rule#BR-05, Rule#MR-05, Viewpoint#VP-03, TI#TI-17, Module#REFUND, Manual

### TC_ID: REFUND-028
- **Title**: Verify yêu cầu 500.000đ lý do Giao sai hàng không được tự động duyệt
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng và chọn Yêu cầu hoàn tiền
  2. Chọn lý do Giao sai hàng
  3. Nhập số tiền yêu cầu
  4. Nhấn Gửi yêu cầu
  5. Mở chi tiết yêu cầu vừa tạo
- **Test Data**:
  - Lý do: Giao sai hàng
  - Số tiền yêu cầu: 500.000đ (ngưỡng tự động duyệt)
- **Expected Result**:
  - Yêu cầu không được hệ thống tự động duyệt, ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#BR-19, Rule#MR-05, Viewpoint#VP-02, TI#TI-18, Module#REFUND, Manual

### TC_ID: REFUND-029
- **Title**: Verify yêu cầu 5.000.000đ do Nhân viên CSKH duyệt được
- **Precondition**:
  - Yêu cầu hoàn tiền 5.000.000đ ở trạng thái Chờ duyệt, không thuộc diện tự động duyệt
  - Đã đăng nhập bằng tài khoản Nhân viên CSKH
- **Test Steps**:
  1. Mở danh sách yêu cầu hoàn tiền
  2. Mở yêu cầu 5.000.000đ
  3. Nhấn Duyệt
- **Test Data**:
  - Số tiền yêu cầu: 5.000.000đ (ngưỡng trên 5.000.000đ không áp dụng)
- **Expected Result**:
  - Nhân viên CSKH có nút Duyệt và duyệt được yêu cầu
  - Yêu cầu chuyển sang trạng thái Đã duyệt
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-03, TI#TI-19, Module#REFUND, Manual

### TC_ID: REFUND-030
- **Title**: Verify yêu cầu 5.000.001đ phải do Trưởng nhóm CSKH duyệt
- **Precondition**:
  - Yêu cầu hoàn tiền 5.000.001đ ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản Trưởng nhóm CSKH
- **Test Steps**:
  1. Mở danh sách yêu cầu hoàn tiền
  2. Mở yêu cầu 5.000.001đ
- **Test Data**:
  - Số tiền yêu cầu: 5.000.001đ (ngưỡng 5.000.000đ + 1)
- **Expected Result**:
  - Yêu cầu thuộc diện Trưởng nhóm CSKH duyệt
  - Trưởng nhóm CSKH thấy nút Duyệt và Từ chối
- **Priority**: Medium
- **Tags**: Rule#BR-06, Viewpoint#VP-03, TI#TI-19, Module#REFUND, Manual

### TC_ID: REFUND-031
- **Title**: Verify Nhân viên CSKH thấy yêu cầu 5.000.001đ nhưng không có nút Duyệt và Từ chối
- **Precondition**:
  - Yêu cầu hoàn tiền 5.000.001đ ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản Nhân viên CSKH
- **Test Steps**:
  1. Mở danh sách yêu cầu hoàn tiền
  2. Tìm yêu cầu 5.000.001đ
  3. Mở chi tiết yêu cầu
- **Test Data**:
  - Số tiền yêu cầu: 5.000.001đ
- **Expected Result**:
  - Yêu cầu hiển thị trong danh sách
  - Không có nút Duyệt và Từ chối
- **Priority**: Medium
- **Tags**: Rule#BR-20, Rule#MR-06, Viewpoint#VP-04, TI#TI-20, Module#REFUND, Manual

### TC_ID: REFUND-032
- **Title**: Verify Trưởng nhóm CSKH duyệt được yêu cầu 5.000.000đ
- **Precondition**:
  - Yêu cầu hoàn tiền 5.000.000đ ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản Trưởng nhóm CSKH
- **Test Steps**:
  1. Mở danh sách yêu cầu hoàn tiền
  2. Mở yêu cầu 5.000.000đ
  3. Nhấn Duyệt
- **Test Data**:
  - Số tiền yêu cầu: 5.000.000đ
- **Expected Result**:
  - Duyệt được yêu cầu
  - Yêu cầu chuyển sang trạng thái Đã duyệt
- **Priority**: Medium
- **Tags**: Rule#BR-21, Rule#MR-08, Viewpoint#VP-01, TI#TI-21, Module#REFUND, Manual

### TC_ID: REFUND-033
- **Title**: Verify yêu cầu được duyệt chuyển Đã duyệt rồi Đã hoàn tiền về phương thức thanh toán gốc
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt, đơn đã thanh toán qua cổng thanh toán
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Duyệt
  3. Kiểm tra trạng thái yêu cầu
  4. Cổng thanh toán xác nhận hoàn tiền thành công
  5. Kiểm tra lại trạng thái yêu cầu
  6. Kiểm tra phương thức nhận tiền hoàn
- **Test Data**:
  - Yêu cầu: [CHƯA CÓ TRONG TÀI LIỆU] số tiền và phương thức thanh toán cụ thể
- **Expected Result**:
  - Sau khi duyệt, yêu cầu ở trạng thái Đã duyệt
  - Sau khi cổng thanh toán xác nhận thành công, yêu cầu ở trạng thái Đã hoàn tiền
  - Tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng
- **Priority**: High
- **Tags**: Rule#BR-07, Rule#BR-10, Viewpoint#VP-01, Viewpoint#VP-08, TI#TI-22, Module#REFUND, Manual

### TC_ID: REFUND-034
- **Title**: Verify yêu cầu giữ trạng thái Đã duyệt khi cổng thanh toán hoàn tiền thất bại
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Cổng thanh toán được thiết lập trả lỗi khi hoàn tiền, [CHƯA CÓ TRONG TÀI LIỆU] cách giả lập
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Duyệt
  3. Cổng thanh toán trả kết quả hoàn tiền thất bại
  4. Kiểm tra trạng thái yêu cầu
- **Test Data**:
  - Mã lỗi/thông báo của cổng thanh toán: [CHƯA CÓ TRONG TÀI LIỆU]
- **Expected Result**:
  - Hệ thống phản hồi: Giữ trạng thái Đã duyệt; CSKH thử lại hoàn tiền thủ công.
  - Yêu cầu không chuyển sang Đã hoàn tiền
- **Priority**: High
- **Tags**: Rule#AF-09, Rule#MR-09, Viewpoint#VP-08, TI#TI-23, Module#REFUND, Manual

### TC_ID: REFUND-035
- **Title**: Verify người duyệt từ chối yêu cầu có nhập lý do thì yêu cầu chuyển Từ chối
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Nhập lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi 1 ký tự (ký tự lặp "a" × 1)
- **Expected Result**:
  - Yêu cầu chuyển sang trạng thái Từ chối
- **Priority**: High
- **Tags**: Rule#BR-08, Rule#BR-10, Viewpoint#VP-01, TI#TI-24, Module#REFUND, Manual

### TC_ID: REFUND-036
- **Title**: Verify từ chối thành công khi lý do từ chối 254 ký tự
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Nhập lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi 254 ký tự (ký tự lặp "a" × 254)
- **Expected Result**:
  - Từ chối thành công, yêu cầu chuyển sang trạng thái Từ chối
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-05, Rule#MR-10, Viewpoint#VP-03, TI#TI-25, Module#REFUND, Manual

### TC_ID: REFUND-037
- **Title**: Verify từ chối thành công khi lý do từ chối 255 ký tự
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Nhập lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi 255 ký tự (ký tự lặp "a" × 255)
- **Expected Result**:
  - Từ chối thành công, yêu cầu chuyển sang trạng thái Từ chối
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-05, Rule#MR-10, Viewpoint#VP-03, TI#TI-25, Module#REFUND, Manual

### TC_ID: REFUND-038
- **Title**: Verify không lưu được từ chối khi lý do từ chối 256 ký tự
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Nhập lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi 256 ký tự (ký tự lặp "a" × 256)
- **Expected Result**:
  - Hệ thống không lưu được lý do từ chối
  - Thông báo lỗi quá độ dài: [CHƯA CÓ TRONG TÀI LIỆU]
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-05, Rule#MR-10, Viewpoint#VP-03, TI#TI-25, Module#REFUND, Manual

### TC_ID: REFUND-039
- **Title**: Verify bỏ trống lý do từ chối thì bị chặn
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Để trống lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi rỗng (0 ký tự)
- **Expected Result**:
  - Hiển thị thông báo "Vui lòng nhập lý do từ chối."
  - Yêu cầu vẫn ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-05, Rule#MR-10, Viewpoint#VP-02, TI#TI-26, Module#REFUND, Manual

### TC_ID: REFUND-040
- **Title**: Verify lý do từ chối chỉ có khoảng trắng thì bị chặn
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Đã đăng nhập bằng tài khoản người duyệt có quyền
- **Test Steps**:
  1. Mở yêu cầu ở trạng thái Chờ duyệt
  2. Nhấn Từ chối
  3. Nhập lý do từ chối
  4. Xác nhận từ chối
- **Test Data**:
  - Lý do từ chối: chuỗi chỉ có khoảng trắng, [CHƯA CÓ TRONG TÀI LIỆU] số lượng khoảng trắng
- **Expected Result**:
  - Hiển thị thông báo "Vui lòng nhập lý do từ chối."
  - Yêu cầu vẫn ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-05, Rule#MR-10, Viewpoint#VP-02, TI#TI-26, Module#REFUND, Manual

### TC_ID: REFUND-041
- **Title**: Verify khách hàng nhận email khi yêu cầu được duyệt
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Khách hàng có email hợp lệ trong tài khoản, [CHƯA CÓ TRONG TÀI LIỆU] địa chỉ cụ thể
- **Test Steps**:
  1. Đăng nhập bằng tài khoản người duyệt có quyền
  2. Mở yêu cầu ở trạng thái Chờ duyệt
  3. Nhấn Duyệt
  4. Kiểm tra hộp thư của khách hàng
- **Test Data**:
  - Email: [CHƯA CÓ TRONG TÀI LIỆU] mẫu email, tiêu đề và nội dung
- **Expected Result**:
  - Khách hàng nhận được email thông báo (chỉ kiểm có gửi email, chưa có mẫu nội dung)
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#BR-14, Viewpoint#VP-08, TI#TI-27, Module#REFUND, Manual

### TC_ID: REFUND-042
- **Title**: Verify email từ chối gửi tới khách hàng và có kèm lý do từ chối
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Khách hàng có email hợp lệ trong tài khoản, [CHƯA CÓ TRONG TÀI LIỆU] địa chỉ cụ thể
- **Test Steps**:
  1. Đăng nhập bằng tài khoản người duyệt có quyền
  2. Mở yêu cầu ở trạng thái Chờ duyệt
  3. Nhấn Từ chối
  4. Nhập lý do từ chối
  5. Xác nhận từ chối
  6. Kiểm tra hộp thư của khách hàng
- **Test Data**:
  - Lý do từ chối: chuỗi 1 ký tự (ký tự lặp "a" × 1)
  - Email: [CHƯA CÓ TRONG TÀI LIỆU] mẫu email, tiêu đề và nội dung
- **Expected Result**:
  - Khách hàng nhận được email từ chối
  - Nội dung email có lý do từ chối đã nhập
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#BR-14, Rule#BR-22, Rule#MR-11, Viewpoint#VP-08, TI#TI-27, Module#REFUND, Manual

### TC_ID: REFUND-043
- **Title**: Verify khách hàng huỷ yêu cầu Chờ duyệt sau khi xác nhận thì chuyển Đã huỷ
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Khách hàng có yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Test Steps**:
  1. Mở màn Chi tiết yêu cầu hoàn tiền
  2. Nhấn Huỷ yêu cầu
  3. Kiểm tra hộp xác nhận
  4. Nhấn nút Huỷ yêu cầu trong hộp xác nhận
  5. Kiểm tra trạng thái yêu cầu
- **Test Data**:
  - Yêu cầu: [CHƯA CÓ TRONG TÀI LIỆU] dữ liệu cụ thể
- **Expected Result**:
  - Hộp xác nhận hiển thị "Bạn chắc chắn muốn huỷ yêu cầu hoàn tiền này?" với hai nút "Huỷ yêu cầu" và "Quay lại"
  - Sau khi xác nhận, yêu cầu có trạng thái Đã huỷ
- **Priority**: Medium
- **Tags**: Rule#BR-11, Rule#AF-07, Viewpoint#VP-01, Viewpoint#VP-05, TI#TI-28, Module#REFUND, Manual

### TC_ID: REFUND-044
- **Title**: Verify nút Huỷ yêu cầu không hiển thị ở trạng thái Đã duyệt
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Khách hàng có yêu cầu hoàn tiền ở trạng thái Đã duyệt
- **Test Steps**:
  1. Mở màn Chi tiết yêu cầu hoàn tiền
  2. Quan sát các nút trên màn hình
- **Test Data**:
  - Yêu cầu: trạng thái Đã duyệt
- **Expected Result**:
  - Nút Huỷ yêu cầu không hiển thị
- **Priority**: Medium
- **Tags**: Rule#BR-15, Viewpoint#VP-05, TI#TI-30, Module#REFUND, Manual

### TC_ID: REFUND-045
- **Title**: Verify thao tác đến trước được ghi nhận khi khách huỷ và người duyệt duyệt cùng lúc
- **Precondition**:
  - Yêu cầu hoàn tiền ở trạng thái Chờ duyệt
  - Khách hàng mở Chi tiết yêu cầu trên một phiên; người duyệt mở yêu cầu trên phiên khác
- **Test Steps**:
  1. Khách hàng nhấn Huỷ yêu cầu và xác nhận
  2. Người duyệt nhấn Duyệt gần như đồng thời
  3. Kiểm tra trạng thái cuối của yêu cầu
  4. Kiểm tra thông báo ở phiên đến sau
- **Test Data**:
  - Khoảng cách thời gian giữa hai thao tác: [CHƯA CÓ TRONG TÀI LIỆU]
- **Expected Result**:
  - Thao tác đến trước được ghi nhận
  - Bên đến sau thấy thông báo "Yêu cầu đã được cập nhật bởi người khác. Vui lòng tải lại trang."
- **Priority**: Medium
- **Tags**: Rule#AF-10, Rule#MR-12, Viewpoint#VP-05, TI#TI-31, Module#REFUND, Manual

### TC_ID: REFUND-046
- **Title**: Verify khách hàng không sửa được yêu cầu đã gửi và phải huỷ rồi gửi yêu cầu mới
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Khách hàng có yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Test Steps**:
  1. Mở màn Chi tiết yêu cầu hoàn tiền
  2. Tìm thao tác sửa yêu cầu
- **Test Data**:
  - Yêu cầu: [CHƯA CÓ TRONG TÀI LIỆU] dữ liệu cụ thể
- **Expected Result**:
  - Không có thao tác sửa yêu cầu
  - Muốn thay đổi thì huỷ yêu cầu rồi gửi yêu cầu mới
- **Priority**: Medium
- **Tags**: Rule#BR-12, Viewpoint#VP-02, TI#TI-32, Module#REFUND, Manual

### TC_ID: REFUND-047
- **Title**: Verify lần gửi thứ 2 được tạo sau khi lần 1 bị từ chối
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng Đã giao, còn trong thời hạn gửi, có 1 yêu cầu đã bị từ chối
- **Test Steps**:
  1. Mở chi tiết đơn hàng và chọn Yêu cầu hoàn tiền
  2. Chọn lý do Không còn nhu cầu
  3. Nhập số tiền yêu cầu
  4. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do: Không còn nhu cầu
  - Số tiền yêu cầu: 10.000 (tối thiểu)
- **Expected Result**:
  - Yêu cầu thứ 2 được tạo ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#BR-13, Viewpoint#VP-03, TI#TI-33, Module#REFUND, Manual

### TC_ID: REFUND-048
- **Title**: Verify lần gửi thứ 3 bị chặn khi đơn đã gửi đủ 2 lần
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng Đã giao, còn trong thời hạn gửi, đã gửi 2 yêu cầu (đã bị từ chối hoặc đã huỷ), không có yêu cầu Chờ duyệt
- **Test Steps**:
  1. Mở chi tiết đơn hàng và chọn Yêu cầu hoàn tiền
  2. Chọn lý do Không còn nhu cầu
  3. Nhập số tiền yêu cầu
  4. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do: Không còn nhu cầu
  - Số tiền yêu cầu: 10.000 (tối thiểu)
- **Expected Result**:
  - Hệ thống trả mã REFUND_LIMIT_REACHED
  - Hiển thị "Đơn hàng đã hết số lần yêu cầu hoàn tiền."
  - Không tạo yêu cầu thứ 3
- **Priority**: High
- **Tags**: Rule#BR-13, Rule#AF-11, Rule#MR-13, Viewpoint#VP-03, TI#TI-33, Module#REFUND, Manual

### TC_ID: REFUND-049
- **Title**: Verify API tạo yêu cầu với orderId của tài khoản khác trả HTTP 404
- **Precondition**:
  - Tài khoản A đã đăng nhập, có token hợp lệ
  - Đơn hàng Đã giao thuộc tài khoản B
- **Test Steps**:
  1. Gọi API tạo yêu cầu hoàn tiền bằng token của tài khoản A với orderId của tài khoản B
  2. Kiểm tra phản hồi
- **Test Data**:
  - orderId: [CHƯA CÓ TRONG TÀI LIỆU] giá trị cụ thể
  - Body: lý do Không còn nhu cầu, số tiền 10.000
- **Expected Result**:
  - Phản hồi HTTP 404 với mã lỗi ORDER_NOT_FOUND
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#AF-08, Rule#MR-02, Viewpoint#VP-04, TI#TI-34, Module#REFUND, Manual

### TC_ID: REFUND-050
- **Title**: Verify màn chi tiết đơn COD Đã giao không có nút Yêu cầu hoàn tiền
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng thanh toán khi nhận hàng (COD) ở trạng thái Đã giao
- **Test Steps**:
  1. Mở chi tiết đơn hàng COD
  2. Quan sát các nút trên màn hình
- **Test Data**:
  - Đơn hàng: COD, trạng thái Đã giao
- **Expected Result**:
  - Nút Yêu cầu hoàn tiền không hiển thị
- **Priority**: High
- **Tags**: Rule#BR-16, Rule#MR-01, Viewpoint#VP-04, TI#TI-35, Module#REFUND, Manual

### TC_ID: REFUND-051
- **Title**: Verify API tạo yêu cầu cho đơn COD Đã giao trả HTTP 403
- **Precondition**:
  - Khách hàng đã đăng nhập, có token hợp lệ
  - Đơn hàng COD của chính khách hàng ở trạng thái Đã giao
- **Test Steps**:
  1. Gọi API tạo yêu cầu hoàn tiền với orderId của đơn COD
  2. Kiểm tra phản hồi
- **Test Data**:
  - orderId: [CHƯA CÓ TRONG TÀI LIỆU] giá trị cụ thể
  - Body: lý do Không còn nhu cầu, số tiền 10.000
- **Expected Result**:
  - Phản hồi HTTP 403 với mã lỗi ORDER_NOT_DELIVERED
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#AF-15, Rule#MR-17, Viewpoint#VP-04, TI#TI-35, Module#REFUND, Manual
