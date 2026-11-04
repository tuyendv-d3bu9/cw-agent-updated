# Test Case Spec · hoan-tien
Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: 04_test_idea_report.md, 01_requirement_risk_summary.md, 03_viewpoint_report.md, knowledge/features/hoan-tien.md · Verdict: PASS

### TC_ID: REFUND-001
- **Title**: Verify khách gửi được yêu cầu hoàn tiền hợp lệ cho đơn Đã giao
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền yêu cầu hợp lệ
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Yêu cầu được tạo ở trạng thái Chờ duyệt (BR-09)
  - Hiển thị thông báo "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc."
  - Yêu cầu không được tự động duyệt
- **Priority**: Medium
- **Tags**: Rule#BR-01, Rule#BR-09, Rule#BR-25, Viewpoint#VP-01, Viewpoint#VP-05, TI#TI-01, Module#REFUND, Manual

### TC_ID: REFUND-002
- **Title**: Verify API từ chối tạo yêu cầu khi đơn chưa ở trạng thái Đã giao
- **Precondition**:
  - Có token của khách hàng sở hữu đơn
  - Đơn hàng của khách chưa ở trạng thái Đã giao
- **Test Steps**:
  1. Gọi API tạo yêu cầu hoàn tiền cho đơn đó với body hợp lệ
  2. Quan sát phản hồi
- **Test Data**:
  - orderId: đơn chưa Đã giao của chính khách
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Mã lỗi ORDER_NOT_DELIVERED
  - Thông báo "Chỉ đơn hàng đã giao mới được yêu cầu hoàn tiền."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#BR-01, Rule#AF-04, Viewpoint#VP-02, TI#TI-02, Module#REFUND, Manual

### TC_ID: REFUND-003
- **Title**: Verify tạo được yêu cầu khi gửi lúc 23:59 ngày thứ 10 kể từ ngày giao
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng Đã giao, không phải COD, chưa có yêu cầu
  - Ngày giao hàng thành công là ngày 0, tính theo giờ Việt Nam (UTC+7)
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền yêu cầu hợp lệ
  5. Nhấn Gửi yêu cầu lúc 23:59 ngày thứ 10 (UTC+7)
- **Test Data**:
  - Thời điểm gửi: 23:59 ngày thứ 10 kể từ ngày giao (ngày giao = ngày 0, UTC+7)
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Yêu cầu được tạo ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#BR-02, Rule#BR-17, Rule#MR-03, Viewpoint#VP-03, Viewpoint#VP-02, TI#TI-03, Module#REFUND, Manual

### TC_ID: REFUND-004
- **Title**: Verify hệ thống từ chối yêu cầu khi gửi lúc 00:00 ngày thứ 11
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng Đã giao, không phải COD, chưa có yêu cầu
  - Ngày giao hàng thành công là ngày 0, tính theo giờ Việt Nam (UTC+7)
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền yêu cầu hợp lệ
  5. Nhấn Gửi yêu cầu lúc 00:00 ngày thứ 11 (UTC+7)
- **Test Data**:
  - Thời điểm gửi: 00:00 ngày thứ 11 kể từ ngày giao (ngày giao = ngày 0, UTC+7)
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Hiển thị thông báo "Đơn hàng đã quá thời hạn yêu cầu hoàn tiền."
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#BR-02, Rule#BR-17, Rule#AF-01, Rule#MR-03, Viewpoint#VP-03, Viewpoint#VP-02, TI#TI-03, Module#REFUND, Manual

### TC_ID: REFUND-005
- **Title**: Verify hệ thống chặn yêu cầu thứ hai khi đơn đã có yêu cầu Chờ duyệt
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng Đã giao, còn trong thời hạn
  - Đơn đã có một yêu cầu ở trạng thái Chờ duyệt
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền yêu cầu hợp lệ
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Hiển thị thông báo "Đơn hàng đang có yêu cầu hoàn tiền chờ xử lý."
  - Không tạo yêu cầu thứ hai
- **Priority**: High
- **Tags**: Rule#BR-03, Rule#AF-02, Viewpoint#VP-02, TI#TI-05, Module#REFUND, Manual

### TC_ID: REFUND-006
- **Title**: Verify hệ thống chặn khi số tiền yêu cầu lớn hơn paidAmount 1 đơn vị
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền bằng paidAmount cộng 1
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): paidAmount + 1
- **Expected Result**:
  - Hiển thị thông báo "Số tiền yêu cầu vượt quá số tiền đã thanh toán."
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#BR-04, Rule#AF-03, Viewpoint#VP-02, TI#TI-06, Module#REFUND, Manual

### TC_ID: REFUND-007
- **Title**: Verify tạo được yêu cầu khi số tiền bằng paidAmount gồm phí vận chuyển đã trừ voucher
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
  - paidAmount gồm phí vận chuyển và đã trừ giảm giá voucher
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền bằng paidAmount
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): paidAmount của đơn (gồm phí vận chuyển, đã trừ voucher)
- **Expected Result**:
  - Yêu cầu được tạo ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#BR-23, Rule#MR-15, Viewpoint#VP-01, TI#TI-07, Module#REFUND, Manual

### TC_ID: REFUND-008
- **Title**: Verify tạo được yêu cầu thứ hai bằng paidAmount trừ phần đã hoàn
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn Đã giao, còn trong thời hạn
  - Yêu cầu thứ nhất của đơn ở trạng thái Đã hoàn tiền một phần
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền bằng paidAmount trừ phần đã hoàn
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): paidAmount trừ phần đã hoàn của yêu cầu thứ nhất
- **Expected Result**:
  - Yêu cầu thứ hai được tạo ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#BR-18, Rule#MR-04, Viewpoint#VP-01, TI#TI-08, Module#REFUND, Manual

### TC_ID: REFUND-009
- **Title**: Verify hệ thống không cho gửi yêu cầu thứ hai vượt paidAmount trừ phần đã hoàn 1 đơn vị
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn Đã giao, còn trong thời hạn
  - Yêu cầu thứ nhất của đơn ở trạng thái Đã hoàn tiền một phần
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền bằng (paidAmount trừ phần đã hoàn) cộng 1
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): (paidAmount trừ phần đã hoàn) + 1
- **Expected Result**:
  - Hệ thống không cho gửi yêu cầu
  - Chữ thông báo cho trường hợp này: [CHƯA CÓ TRONG TÀI LIỆU]
- **Priority**: High
- **Tags**: Rule#BR-18, Rule#MR-04, Viewpoint#VP-01, TI#TI-08, Module#REFUND, Manual

### TC_ID: REFUND-010
- **Title**: Verify hệ thống chặn khi số tiền dưới min
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền 9999
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): 9999 (dưới min, do npm run boundary)
- **Expected Result**:
  - Hiển thị thông báo "Số tiền yêu cầu tối thiểu là 10.000đ."
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#FD-02, Rule#AF-12, Rule#MR-14, Viewpoint#VP-03, TI#TI-09, Module#REFUND, Manual

### TC_ID: REFUND-011
- **Title**: Verify tạo được yêu cầu khi số tiền bằng min
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền 10000
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): 10000 (bằng min, do npm run boundary)
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#FD-02, Rule#MR-14, Viewpoint#VP-03, TI#TI-09, Module#REFUND, Manual

### TC_ID: REFUND-012
- **Title**: Verify tạo được yêu cầu khi số tiền min+1
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền 10001
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): 10001 (min+1, do npm run boundary)
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: High
- **Tags**: Rule#FD-02, Rule#MR-14, Viewpoint#VP-03, TI#TI-09, Module#REFUND, Manual

### TC_ID: REFUND-013
- **Title**: Verify hệ thống báo lỗi khi bỏ trống Lý do
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Để trống Lý do
  4. Nhập số tiền hợp lệ
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): để trống
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Trường Lý do viền đỏ và hiển thị dòng chữ "Vui lòng nhập thông tin này."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-01, Rule#AF-05, Viewpoint#VP-02, TI#TI-10, Module#REFUND, Manual

### TC_ID: REFUND-014
- **Title**: Verify hệ thống báo lỗi khi bỏ trống Số tiền
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Để trống Số tiền
  5. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): để trống
- **Expected Result**:
  - Trường Số tiền viền đỏ và hiển thị dòng chữ "Vui lòng nhập thông tin này."
  - Không tạo yêu cầu
- **Priority**: High
- **Tags**: Rule#FD-02, Rule#AF-05, Viewpoint#VP-02, TI#TI-10, Module#REFUND, Manual

### TC_ID: REFUND-015
- **Title**: Verify API từ chối reason viết thường defective
- **Precondition**:
  - Có token của khách hàng sở hữu đơn
  - Đơn Đã giao, không phải COD, còn trong thời hạn
- **Test Steps**:
  1. Gọi API tạo yêu cầu hoàn tiền với reason viết thường
  2. Quan sát phản hồi
- **Test Data**:
  - orderId: đơn Đã giao của chính khách
  - Lý do (FD-01): defective (chữ thường)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
- **Expected Result**:
  - Phản hồi: HTTP 400 VALIDATION_ERROR, không có chữ hiển thị.
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-01, Rule#AF-06, Rule#MR-14, Viewpoint#VP-02, TI#TI-11, Module#REFUND, Manual

### TC_ID: REFUND-016
- **Title**: Verify tạo được yêu cầu khi Mô tả 499 ký tự
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Nhập Mô tả 499 ký tự
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Mô tả (FD-03): chuỗi 499 ký tự (ký tự lặp "a" × 499) — max-1, do npm run boundary
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-03, Rule#MR-14, Viewpoint#VP-03, TI#TI-12, Module#REFUND, Manual

### TC_ID: REFUND-017
- **Title**: Verify tạo được yêu cầu khi Mô tả 500 ký tự
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Nhập Mô tả 500 ký tự
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Mô tả (FD-03): chuỗi 500 ký tự (ký tự lặp "a" × 500) — max, do npm run boundary
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-03, Rule#MR-14, Viewpoint#VP-03, TI#TI-12, Module#REFUND, Manual

### TC_ID: REFUND-018
- **Title**: Verify hệ thống chặn khi Mô tả 501 ký tự
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Nhập Mô tả 501 ký tự
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Mô tả (FD-03): chuỗi 501 ký tự (ký tự lặp "a" × 501) — max+1, do npm run boundary
- **Expected Result**:
  - Hiển thị thông báo "Mô tả tối đa 500 ký tự."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-03, Rule#MR-14, Viewpoint#VP-03, TI#TI-12, Module#REFUND, Manual

### TC_ID: REFUND-019
- **Title**: Verify tạo được yêu cầu khi đính kèm 2 ảnh
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm 2 ảnh JPG hoặc PNG, mỗi ảnh không quá 5 MB
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 2 tệp (max-1, do npm run boundary), định dạng JPG hoặc PNG
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#MR-14, Viewpoint#VP-03, TI#TI-13, Module#REFUND, Manual

### TC_ID: REFUND-020
- **Title**: Verify tạo được yêu cầu khi đính kèm 3 ảnh
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm 3 ảnh JPG hoặc PNG, mỗi ảnh không quá 5 MB
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 3 tệp (max, do npm run boundary), định dạng JPG hoặc PNG
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#MR-14, Viewpoint#VP-03, TI#TI-13, Module#REFUND, Manual

### TC_ID: REFUND-021
- **Title**: Verify hệ thống chặn khi đính kèm 4 ảnh
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm 4 ảnh JPG hoặc PNG, mỗi ảnh không quá 5 MB
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 4 tệp (max+1, do npm run boundary), định dạng JPG hoặc PNG
- **Expected Result**:
  - Hiển thị thông báo "Chỉ được đính kèm tối đa 3 ảnh."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#AF-13, Rule#MR-14, Viewpoint#VP-03, TI#TI-13, Module#REFUND, Manual

### TC_ID: REFUND-022
- **Title**: Verify tạo được yêu cầu khi ảnh có dung lượng đúng 5 MB
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm một ảnh JPG dung lượng đúng 5 MB
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 1 tệp JPG dung lượng 5 MB
- **Expected Result**:
  - Hệ thống tạo yêu cầu hoàn tiền ở trạng thái Chờ duyệt
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#MR-14, Viewpoint#VP-02, TI#TI-14, Module#REFUND, Manual

### TC_ID: REFUND-023
- **Title**: Verify hệ thống chặn khi ảnh có dung lượng lớn hơn 5 MB
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm một ảnh JPG dung lượng lớn hơn 5 MB
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 1 tệp JPG dung lượng lớn hơn 5 MB [CHƯA CÓ TRONG TÀI LIỆU] giá trị cụ thể vượt 5 MB
- **Expected Result**:
  - Hiển thị thông báo "Mỗi ảnh tối đa 5 MB."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#AF-14, Rule#MR-14, Viewpoint#VP-02, TI#TI-14, Module#REFUND, Manual

### TC_ID: REFUND-024
- **Title**: Verify hệ thống chặn khi đính kèm ảnh định dạng GIF
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Không còn nhu cầu
  4. Nhập số tiền hợp lệ
  5. Đính kèm một ảnh định dạng GIF
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Không còn nhu cầu (NO_LONGER_NEEDED)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): 1 tệp định dạng GIF
- **Expected Result**:
  - Hiển thị thông báo "Chỉ chấp nhận ảnh JPG hoặc PNG."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#FD-04, Rule#MR-14, Viewpoint#VP-02, TI#TI-15, Module#REFUND, Manual

### TC_ID: REFUND-025
- **Title**: Verify hệ thống chặn khi lý do Hàng lỗi và không đính kèm ảnh
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Hàng lỗi
  4. Nhập số tiền hợp lệ
  5. Không đính kèm ảnh
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Hàng lỗi (DEFECTIVE)
  - Số tiền (FD-02): giá trị trong khoảng từ 10.000 đến paidAmount của đơn
  - Ảnh (FD-04): không đính kèm
- **Expected Result**:
  - Hiển thị dòng chữ "Vui lòng nhập thông tin này."
  - Không tạo yêu cầu
- **Priority**: Medium [ĐỀ XUẤT]
- **Tags**: Rule#BR-24, Rule#MR-16, Viewpoint#VP-02, TI#TI-16, Module#REFUND, Manual

### TC_ID: REFUND-026
- **Title**: Verify hệ thống tự động duyệt khi Hàng lỗi, 500.000đ và có ảnh
- **Precondition**:
  - Khách hàng đã đăng nhập
  - Đơn hàng của chính khách ở trạng thái Đã giao, thanh toán không phải COD, còn trong thời hạn gửi yêu cầu
- **Test Steps**:
  1. Mở chi tiết đơn hàng
  2. Chọn Yêu cầu hoàn tiền
  3. Chọn lý do Hàng lỗi
  4. Nhập số tiền 500.000
  5. Đính kèm một ảnh JPG hoặc PNG
  6. Nhấn Gửi yêu cầu
- **Test Data**:
  - Lý do (FD-01): Hàng lỗi (DEFECTIVE)
  - Số tiền (FD-02): 500.000 (đơn có paidAmount từ 500.000 trở lên)
  - Ảnh (FD-04): 1 tệp JPG hoặc PNG
- **Expected Result**:
  - Yêu cầu được hệ thống tự động duyệt, ở trạng thái Đã duyệt, không qua người duyệt
- **Priority**: High
- **Tags**: Rule#BR-05, Rule#MR-05, Viewpoint#VP-03, TI#TI-17, Module#REFUND, Manual
