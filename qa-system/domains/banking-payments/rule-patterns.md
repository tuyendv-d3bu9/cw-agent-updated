# Họ quy tắc hay bị thiếu · banking-payments

> Danh sách nhắc cho ma trận 06W (QA_STANDARD §4). Một họ quy tắc ở đây **không phải rule**: thấy tài liệu thiếu ⇒
> câu hỏi `MR` ở 02, không bao giờ thành `BR` (QA_STANDARD §10.3). Chỉ dùng chỗ giữ chỗ trung tính (`<field>`,
> `<trạng thái>`, `<ngưỡng>`) — không ghi giá trị, ngưỡng hay chữ thông báo cụ thể.
> Nguồn `Unknown` = kinh nghiệm chung của ngành, chưa có URL đã kiểm.

| Mục | Họ quy tắc | Nhóm 06W | Câu hỏi khung (trung tính) | Nguồn |
|---|---|---|---|---|
| state-transition-reversal | Chuyển trạng thái ngược / huỷ / hoàn | W2 | Từ `<trạng thái A>`, có được chuyển về `<trạng thái B>` hoặc `<reverse>` không, bởi ai? | Unknown |
| idempotency-duplicate | Chống gửi trùng một lệnh | W2 | Hai lệnh giống nhau trong `<khoảng thời gian>` được coi là một hay hai? | Unknown |
| cut-off-time | Giờ chốt, ngày làm việc, múi giờ | W4 | Lệnh gửi sau `<cut-off>` hoặc vào ngày nghỉ được xử lý khi nào? | Unknown |
| rounding-precision | Làm tròn và độ chính xác của số tiền | W3 | `<amount>` làm tròn theo hướng nào, mấy chữ số thập phân, ở bước nào? | Unknown |
| limits-per-period | Hạn mức theo giao dịch / ngày / kỳ | W1 | `<limit>` áp cho đối tượng nào, tính theo `<kỳ>` nào, vượt thì xử lý ra sao? | Unknown |
| maker-checker | Tạo - duyệt tách vai | W5 | `<action>` nào cần người duyệt khác người tạo, và duyệt nhiều cấp theo `<ngưỡng>` nào? | Unknown |
| reconciliation | Đối soát với đối tác / sao kê | W3 | Khoản lệch trong đối soát với `<partner>` được xử lý theo quy trình và thời hạn nào? | Unknown |
| fee-and-fx | Phí và quy đổi ngoại tệ | W3 | `<fee>` tính trên đối tượng nào, và `<fx-rate>` lấy ở thời điểm nào? | Unknown |
| authentication-step-up | Xác thực bổ sung theo rủi ro | W2 | Khi `<điều kiện>` xảy ra, có yêu cầu xác thực thêm không, và thất bại `<n>` lần thì sao? | Unknown |
| status-visibility-timeout | Trạng thái chưa rõ khi quá thời gian chờ | W4 | Khi không có phản hồi sau `<timeout>`, `<transaction>` hiển thị trạng thái nào cho người dùng? | Unknown |
| data-masking-retention | Che dữ liệu nhạy cảm và thời hạn lưu | W6 | `<field>` được che / lưu bao lâu ở từng nơi (màn hình, log, export)? | https://www.pcisecuritystandards.org/standards/pci-dss/ |
| audit-trace | Truy vết thao tác | W6 | Thao tác `<action>` ghi lại những gì và ai được xem nhật ký? | Unknown |
| aml-kyc-trigger | Điều kiện kích hoạt kiểm tra AML/KYC (local regulation) | W2 | Điều kiện nào đưa `<transaction>` / `<customer>` vào diện xem xét, và trạng thái trong lúc chờ là gì? | Unknown |
| partial-refund | Hoàn một phần / nhiều lần | W2 | Tổng các lần hoàn có bị chặn bởi `<amount>` gốc không, và phí có hoàn theo không? | Unknown |
