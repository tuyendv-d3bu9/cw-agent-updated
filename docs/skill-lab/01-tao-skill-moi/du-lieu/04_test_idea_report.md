# Test Idea Report · hoan-tien
Owner: qa-system/qa-analyst/skills/test-idea-design.md · Nguồn: 01_requirement_risk_summary.md, 02_missing_rule_report.md, 03_viewpoint_report.md, knowledge/features/hoan-tien.md · Verdict: PASS

> `npm run gate hoan-tien` exit 0 trước khi ghi. 36 idea: 33 Giữ · 3 Bỏ (2 Trivial, 1 Ngoài scope) · 0 Chờ MR (mọi MR đã chốt).

| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | Khách gửi yêu cầu hợp lệ cho đơn Đã giao thì yêu cầu được tạo ở Chờ duyệt và hiện thông báo thành công. | VP-01, VP-05 | BR-01, BR-09, BR-25 | Use Case | Giữ | Kiểm tra rule có nguồn: BR-01, BR-09, BR-25 |
| TI-02 | Đơn chưa ở trạng thái Đã giao bị từ chối tạo yêu cầu. | VP-02 | BR-01, AF-04 | EP | Giữ | Kiểm tra rule có nguồn: AF-04 |
| TI-03 | Hạn gửi yêu cầu kết thúc lúc 23:59 ngày thứ 10 kể từ ngày giao. | VP-03, VP-02 | BR-02, BR-17, AF-01, MR-03 | BVA | Giữ | Kiểm tra rule có nguồn: BR-02, BR-17 · RK-03 |
| TI-04 | Gửi yêu cầu khi đơn đã quá hạn thì hiện thông báo quá hạn. | VP-02 | AF-01 | EP | Bỏ | Trivial: bao hàm trong TI-03 |
| TI-05 | Đơn đã có yêu cầu Chờ duyệt thì không tạo được yêu cầu thứ hai. | VP-02 | BR-03, AF-02 | EP | Giữ | Kiểm tra rule có nguồn: BR-03 · RK-04 |
| TI-06 | Số tiền yêu cầu vượt số tiền đã thanh toán thì không gửi được. | VP-02 | BR-04, AF-03 | EP | Giữ | Kiểm tra rule có nguồn: BR-04 · RK-02 |
| TI-07 | Trần số tiền bằng paidAmount gồm phí vận chuyển và đã trừ voucher. | VP-01 | BR-23, MR-15 | EP | Giữ | Kiểm tra rule có nguồn: BR-23 · RK-02 |
| TI-08 | Yêu cầu thứ hai sau khi đã hoàn một phần có trần bằng số đã thanh toán trừ phần đã hoàn. | VP-01 | BR-18, MR-04 | BVA | Giữ | Kiểm tra rule có nguồn: BR-18 · RK-02 |
| TI-09 | Số tiền yêu cầu có giới hạn dưới 10.000. | VP-03 | FD-02, AF-12, MR-14 | BVA | Giữ | Kiểm tra rule có nguồn: FD-02 · RK-02 |
| TI-10 | Gửi khi bỏ trống trường bắt buộc Lý do hoặc Số tiền thì hiện thông báo trường bắt buộc. | VP-02 | FD-01, FD-02, AF-05 | EP | Giữ | Kiểm tra rule có nguồn: FD-01, FD-02, AF-05 |
| TI-11 | Gọi API với lý do không thuộc danh sách thì nhận lỗi ràng buộc. | VP-02 | FD-01, AF-06, MR-14 | EP | Giữ | Kiểm tra rule có nguồn: AF-06 |
| TI-12 | Mô tả có độ dài tối đa 500 ký tự. | VP-03 | FD-03, MR-14 | BVA | Giữ | Kiểm tra rule có nguồn: FD-03 |
| TI-13 | Số ảnh minh chứng tối đa là 3. | VP-03 | FD-04, AF-13, MR-14 | BVA | Giữ | Kiểm tra rule có nguồn: FD-04 |
| TI-14 | Mỗi ảnh minh chứng tối đa 5 MB. | VP-02 | FD-04, AF-14, MR-14 | BVA | Giữ | Kiểm tra rule có nguồn: FD-04, AF-14 |
| TI-15 | Ảnh không phải JPG hoặc PNG bị từ chối. | VP-02 | FD-04, MR-14 | EP | Giữ | Kiểm tra rule có nguồn: FD-04 |
| TI-16 | Lý do Hàng lỗi mà không có ảnh minh chứng thì không gửi được. | VP-02 | BR-24, MR-16 | Decision Table | Giữ | Kiểm tra rule có nguồn: BR-24 |
| TI-17 | Tự động duyệt khi số tiền từ 500.000đ trở xuống và lý do Hàng lỗi. | VP-03 | BR-05, MR-05 | Decision Table | Giữ | Kiểm tra rule có nguồn: BR-05 · RK-01 |
| TI-18 | Lý do khác Hàng lỗi thì không được tự động duyệt dù số tiền nhỏ. | VP-02 | BR-19, MR-05 | Decision Table | Giữ | Kiểm tra rule có nguồn: BR-19 · RK-01 |
| TI-19 | Ngưỡng 5.000.000đ phân yêu cầu cho Nhân viên hay Trưởng nhóm CSKH. | VP-03 | BR-06 | BVA | Giữ | Kiểm tra rule có nguồn: BR-06 |
| TI-20 | Nhân viên CSKH thấy yêu cầu trên 5.000.000đ nhưng không có nút Duyệt và Từ chối. | VP-04 | BR-20, MR-06 | EP | Giữ | Kiểm tra rule có nguồn: BR-20 |
| TI-21 | Trưởng nhóm CSKH duyệt được yêu cầu từ 5.000.000đ trở xuống. | VP-01 | BR-21, MR-08 | EP | Giữ | Kiểm tra rule có nguồn: BR-21 |
| TI-22 | Yêu cầu được duyệt chuyển Đã duyệt rồi Đã hoàn tiền, tiền về phương thức thanh toán ban đầu. | VP-01, VP-08 | BR-07, BR-10 | State Transition | Giữ | Kiểm tra rule có nguồn: BR-07, BR-10 · RK-05 |
| TI-23 | Cổng thanh toán hoàn tiền thất bại thì yêu cầu giữ trạng thái Đã duyệt. | VP-08 | AF-09, MR-09 | State Transition | Giữ | Kiểm tra rule có nguồn: AF-09 · RK-05 |
| TI-24 | Người duyệt từ chối có nhập lý do thì yêu cầu chuyển Từ chối. | VP-01 | BR-08, BR-10 | State Transition | Giữ | Kiểm tra rule có nguồn: BR-08, BR-10 · RK-05 |
| TI-25 | Lý do từ chối tối đa 255 ký tự. | VP-03 | FD-05, MR-10 | BVA | Giữ | Kiểm tra rule có nguồn: FD-05 |
| TI-26 | Lý do từ chối để trống hoặc chỉ có khoảng trắng bị chặn. | VP-02 | FD-05, MR-10 | EP | Giữ | Kiểm tra rule có nguồn: FD-05 |
| TI-27 | Khách nhận email khi yêu cầu được duyệt, và email từ chối có kèm lý do. | VP-08 | BR-14, BR-22, MR-11 | Use Case | Giữ | Kiểm tra rule có nguồn: BR-14, BR-22 |
| TI-28 | Khách huỷ yêu cầu Chờ duyệt qua hộp xác nhận thì yêu cầu chuyển Đã huỷ. | VP-01, VP-05 | BR-11, AF-07 | State Transition | Giữ | Kiểm tra rule có nguồn: BR-11, AF-07 |
| TI-29 | Hộp xác nhận huỷ hiển thị đúng chữ và hai nút. | VP-05 | AF-07 | Use Case | Bỏ | Trivial: bao hàm trong TI-28 |
| TI-30 | Nút Huỷ yêu cầu bị ẩn khi yêu cầu không ở Chờ duyệt. | VP-05 | BR-15 | State Transition | Giữ | Kiểm tra rule có nguồn: BR-15 |
| TI-31 | Khách huỷ và người duyệt duyệt cùng lúc thì bên sau nhận thông báo cập nhật. | VP-05 | AF-10, MR-12 | State Transition | Giữ | Kiểm tra rule có nguồn: AF-10 |
| TI-32 | Yêu cầu đã gửi không sửa được. | VP-02 | BR-12 | EP | Giữ | Kiểm tra rule có nguồn: BR-12 |
| TI-33 | Mỗi đơn gửi tối đa 2 lần tính cả lần bị từ chối hoặc đã huỷ. | VP-03 | BR-13, AF-11, MR-13 | BVA | Giữ | Kiểm tra rule có nguồn: BR-13 · RK-04 |
| TI-34 | Gửi yêu cầu cho đơn của tài khoản khác qua API bị chặn. | VP-04 | AF-08, MR-02 | EP | Giữ | Kiểm tra rule có nguồn: AF-08 · RK-08 |
| TI-35 | Đơn COD đã giao không có nút yêu cầu hoàn tiền và API chặn. | VP-04 | BR-16, AF-15, MR-01, MR-17 | EP | Giữ | Kiểm tra rule có nguồn: BR-16, AF-15 · RK-08 |
| TI-36 | Đổi sang sản phẩm khác từ màn yêu cầu hoàn tiền. | VP-01 | BR-01 | Use Case | Bỏ | Ngoài scope: 01 §6 "Đổi sang sản phẩm khác" |
