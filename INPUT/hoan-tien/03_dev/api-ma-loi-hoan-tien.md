<!-- SOURCE_METADATA (intake ghi; dùng cho QA_STANDARD §10.2 — bản nào mới hơn)
source_file: API_Ma_loi_hoan_tien.xlsx
sha256: 141e07bc9b4953195a718a867650aa40dbaa725e2209ed920c043ed63fcab5e6
-->

# Data Sheet: API_Ma_loi_hoan_tien

## Sheet: Thong bao loi

| Mã lỗi | HTTP | Thông báo hiển thị cho khách hàng |
| --- | --- | --- |
| ORDER_NOT_DELIVERED | 403 | Chỉ đơn hàng đã giao mới được yêu cầu hoàn tiền. |
| REFUND_WINDOW_EXPIRED | 422 | Đơn hàng đã quá thời hạn yêu cầu hoàn tiền. |
| REFUND_ALREADY_PENDING | 409 | Đơn hàng đang có yêu cầu hoàn tiền chờ xử lý. |
| REFUND_AMOUNT_EXCEEDED | 400 | Số tiền yêu cầu vượt quá số tiền đã thanh toán. |
| REFUND_LIMIT_REACHED | 400 | Đơn hàng đã hết số lần yêu cầu hoàn tiền. |

## Annotations / Pending changes
> Trích tự động khi intake. **Chưa phải sự thật** (QA_STANDARD §10.2): mỗi dòng cần BA/PO xác nhận — sinh MR, không dùng làm rule.

| # | Loại | Vị trí / gần đoạn | Nội dung |
|---|---|---|---|
| 1 | Dòng/cột ẩn | Sheet "Thong bao loi" — dòng 6 | Dòng 6: "REFUND_LIMIT_REACHED / 400 / Đơn hàng đã hết số lần yêu cầu hoàn tiền.". Nội dung này VẪN nằm trong bảng ở trên nhưng bị ẩn trong file gốc; cần xác nhận còn hiệu lực không. |
