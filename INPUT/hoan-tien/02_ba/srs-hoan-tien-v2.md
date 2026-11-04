<!-- SOURCE_METADATA (intake ghi; dùng cho QA_STANDARD §10.2 — bản nào mới hơn)
source_file: SRS_Hoan_tien_v2.docx
sha256: 01c433d92b563351abfa73ac89e95591727cf58658b560004c344a8e275593a7
title: Đặc tả yêu cầu — Hoàn tiền đơn hàng
version: 2.0
date: 2026-10-10T08:00:00Z
last_modified: 2026-10-10T17:00:00Z
last_modified_by: Trần Thị Lan
-->

# Đặc tả yêu cầu — Yêu cầu hoàn tiền đơn hàng

Phiên bản: 2.0

Ngày: 2026-10-10

Người soạn: Trần Thị Lan (BA)

## 1. Phạm vi

Tính năng cho phép khách hàng gửi yêu cầu hoàn tiền cho đơn hàng đã mua trên ShopGo và cho phép bộ phận CSKH duyệt hoặc từ chối yêu cầu.

Hoàn tiền cho đơn hàng thanh toán khi nhận hàng (COD) không thuộc phạm vi phiên bản này.

Đổi sang sản phẩm khác không thuộc phạm vi tài liệu này.

## 2. Tác nhân

Khách hàng: tạo, xem và huỷ yêu cầu hoàn tiền của đơn hàng của chính mình.

Nhân viên CSKH: duyệt hoặc từ chối yêu cầu hoàn tiền.

Trưởng nhóm CSKH: duyệt hoặc từ chối yêu cầu hoàn tiền có giá trị lớn.

## 3. Quy tắc nghiệp vụ

R1. Chỉ đơn hàng ở trạng thái Đã giao mới được gửi yêu cầu hoàn tiền.

R2. Yêu cầu phải được gửi trong vòng 7 ngày kể từ ngày giao hàng thành công.

R3. Mỗi đơn hàng chỉ có tối đa 1 yêu cầu hoàn tiền ở trạng thái Chờ duyệt tại một thời điểm.

R4. Số tiền yêu cầu hoàn không được vượt quá số tiền khách đã thanh toán cho đơn hàng.

R5. Yêu cầu có số tiền từ 500.000đ trở xuống và lý do là Hàng lỗi được hệ thống tự động duyệt.

R6. Yêu cầu có số tiền trên 5.000.000đ phải do Trưởng nhóm CSKH duyệt. Các yêu cầu còn lại do Nhân viên CSKH duyệt.

R7. Khi yêu cầu được duyệt, tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng.

R8. Khi từ chối yêu cầu, người duyệt phải nhập lý do từ chối.

{++R9. Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi.++}

## 4. Trạng thái yêu cầu

Yêu cầu mới tạo có trạng thái Chờ duyệt.

Chờ duyệt chuyển sang Đã duyệt khi người duyệt chấp nhận; Chờ duyệt chuyển sang Từ chối khi người duyệt từ chối; Đã duyệt chuyển sang Đã hoàn tiền khi cổng thanh toán xác nhận hoàn tiền thành công.

Khách hàng được huỷ yêu cầu khi yêu cầu còn ở trạng thái Chờ duyệt. Yêu cầu đã huỷ có trạng thái Đã huỷ.

## 5. Thông tin trên form

| Trường | Kiểu | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Lý do | Danh sách chọn | Có | Hàng lỗi; Giao sai hàng; Không còn nhu cầu |
| Số tiền yêu cầu | Số | Có | Không vượt quá số tiền đã thanh toán |
| Mô tả | Văn bản | Không | Tối đa 500 ký tự |
| Ảnh minh chứng | Tệp ảnh | Không | Tối đa 3 ảnh |

## 6. Luồng chính

Bước 1. Khách hàng mở chi tiết đơn hàng ở trạng thái Đã giao và chọn Yêu cầu hoàn tiền.

Bước 2. Khách hàng chọn lý do, nhập số tiền yêu cầu, mô tả và đính kèm ảnh minh chứng (nếu có).

Bước 3. Khách hàng nhấn Gửi yêu cầu.

Bước 4. Hệ thống kiểm tra các quy tắc R1 đến R4 và tạo yêu cầu ở trạng thái Chờ duyệt.

Bước 5. Hệ thống áp dụng R5 hoặc chuyển yêu cầu cho người duyệt theo R6.

## 7. Luồng lỗi

Đơn hàng quá thời hạn ở R2: hệ thống từ chối tạo yêu cầu và hiển thị thông báo lỗi.

Đơn hàng đã có yêu cầu Chờ duyệt: hệ thống từ chối tạo yêu cầu mới.

Số tiền vượt quá số tiền đã thanh toán: hệ thống không cho gửi yêu cầu.

Hoàn tiền qua cổng thanh toán thất bại: [ĐANG CẬP NHẬT]

## Annotations / Pending changes
> Trích tự động khi intake. **Chưa phải sự thật** (QA_STANDARD §10.2): mỗi dòng cần BA/PO xác nhận — sinh MR, không dùng làm rule.

| # | Loại | Vị trí / gần đoạn | Nội dung |
|---|---|---|---|
| 1 | Tracked change (chưa duyệt) · Trần Thị Lan · 2026-10-11 | R9. Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi. | chèn "R9. Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi.". Bản TRƯỚC: "" → Bản SAU nếu chấp nhận: "R9. Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi." |
| 2 | Comment · Nguyễn Minh Đức · 2026-10-12 | "R5. Yêu cầu có số tiền từ 500.000đ trở xuống và lý do là Hàng lỗi được hệ thống…" trong đoạn: R5. Yêu cầu có số tiền từ 500.000đ trở xuống và lý do là Hàng lỗi được hệ thống tự động duyệt. | Lý do Giao sai hàng có được tự động duyệt giống Hàng lỗi không? Cần chốt trước khi phát triển. |
| 3 | Header | header1.xml | ShopGo — Tài liệu nội bộ |
