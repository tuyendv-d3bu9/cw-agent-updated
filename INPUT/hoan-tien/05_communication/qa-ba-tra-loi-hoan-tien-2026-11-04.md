<!-- SOURCE_METADATA (intake ghi; dùng cho QA_STANDARD §10.2 — bản nào mới hơn)
source_file: QA_BA_tra_loi_hoan_tien_2026-11-04.md
sha256: 215d5dde055e7765c55c6579270aa4c97e41bbef7a52741979384e39d256003d
title: Q&A — BA trả lời câu hỏi QA về tính năng hoàn tiền (trích từ thân tài liệu)
date: 2026-11-04 (trích từ thân tài liệu)
-->

# Q&A — BA trả lời câu hỏi QA về tính năng hoàn tiền

Ngày: 2026-11-04 · Người trả lời: Trần Thị Lan (BA), Nguyễn Minh Đức (PO) · Hỏi bởi: Lê Thu Hà (QA)

> Tài liệu demo lớp học: giảng viên đóng vai BA/PO.

| Câu hỏi | Trả lời | Người trả lời |
|---|---|---|
| MR-01 | A) Ẩn nút Yêu cầu hoàn tiền với đơn COD. | Trần Thị Lan |
| MR-02 | B) HTTP 404 với mã lỗi ORDER_NOT_FOUND, giống đơn hàng không tồn tại. | Trần Thị Lan |
| MR-03 | A) Ngày giao hàng thành công là ngày 0; hạn cuối là 23:59 ngày thứ 10, theo giờ Việt Nam (UTC+7). | Nguyễn Minh Đức |
| MR-04 | A) Trần của yêu cầu thứ hai bằng số tiền đã thanh toán trừ phần đã hoàn. | Nguyễn Minh Đức |
| MR-05 | B) Chỉ lý do Hàng lỗi được tự động duyệt. | Nguyễn Minh Đức |
| MR-06 | B) Nhân viên CSKH thấy yêu cầu trên 5.000.000đ trong danh sách nhưng không có nút Duyệt và Từ chối. | Trần Thị Lan |
| MR-07 | Tuỳ trường hợp, sẽ báo sau. | Trần Thị Lan |
| MR-08 | A) Có, Trưởng nhóm CSKH được duyệt và từ chối mọi yêu cầu. | Nguyễn Minh Đức |
| MR-09 | A) Giữ trạng thái Đã duyệt; CSKH thử lại hoàn tiền thủ công. | Nguyễn Minh Đức |
| MR-10 | Lý do từ chối tối đa 255 ký tự; chuỗi chỉ có khoảng trắng bị chặn; thông báo khi bỏ trống: "Vui lòng nhập lý do từ chối." | Trần Thị Lan |
| MR-11 | B) Chưa có mẫu email; QA chỉ kiểm có gửi email. Email từ chối có kèm lý do từ chối. | Trần Thị Lan |
| MR-12 | A) Thao tác đến trước được ghi nhận; bên sau thấy thông báo "Yêu cầu đã được cập nhật bởi người khác. Vui lòng tải lại trang." | Trần Thị Lan |
| MR-13 | A) Dùng mã REFUND_LIMIT_REACHED với thông báo "Đơn hàng đã hết số lần yêu cầu hoàn tiền."; dòng này sẽ được hiện lại trong bảng mã lỗi. | Trần Thị Lan |
| MR-14 | Số tiền dưới 10.000: "Số tiền yêu cầu tối thiểu là 10.000đ." · Mô tả quá 500 ký tự: "Mô tả tối đa 500 ký tự." · Quá 3 ảnh: "Chỉ được đính kèm tối đa 3 ảnh." · Ảnh quá 5 MB: "Mỗi ảnh tối đa 5 MB." · Ảnh sai định dạng: "Chỉ chấp nhận ảnh JPG hoặc PNG." · Lý do không hợp lệ chỉ xảy ra khi gọi API: HTTP 400 VALIDATION_ERROR, không có chữ hiển thị. | Trần Thị Lan |
| MR-15 | A) paidAmount gồm phí vận chuyển và đã trừ giảm giá voucher. | Nguyễn Minh Đức |
| MR-16 | A) Chấp nhận R9; thiếu ảnh khi lý do là Hàng lỗi dùng thông báo "Vui lòng nhập thông tin này." | Nguyễn Minh Đức |
