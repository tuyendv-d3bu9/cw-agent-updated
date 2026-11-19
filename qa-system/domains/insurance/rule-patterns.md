# Họ quy tắc hay bị thiếu · insurance

> Danh sách nhắc cho ma trận 06W (QA_STANDARD §4). Một họ quy tắc ở đây **không phải rule**: thấy tài liệu thiếu ⇒
> câu hỏi `MR` ở 02, không bao giờ thành `BR` (QA_STANDARD §10.3). Chỉ dùng chỗ giữ chỗ trung tính (`<field>`,
> `<trạng thái>`, `<ngưỡng>`) — không ghi giá trị, ngưỡng hay chữ thông báo cụ thể.
> Nguồn `Unknown` = kinh nghiệm chung của ngành, chưa có URL đã kiểm.

| Mục | Họ quy tắc | Nhóm 06W | Câu hỏi khung (trung tính) | Nguồn |
|---|---|---|---|---|
| policy-lifecycle-transition | Chuyển trạng thái hợp đồng | W2 | Từ `<trạng thái A>`, `<policy>` được chuyển sang `<trạng thái B>` khi nào, bởi ai? | Unknown |
| endorsement-rules | Sửa đổi hợp đồng đang hiệu lực | W2 | `<field>` nào được sửa khi `<policy>` đang hiệu lực, cần duyệt không, và hiệu lực từ ngày nào? | Unknown |
| premium-calculation-order | Thứ tự và công thức tính phí | W3 | Các yếu tố của `<premium>` áp theo thứ tự nào, thuế / giảm giá nằm ở bước nào? | Unknown |
| rounding-premium | Làm tròn phí và quyền lợi | W3 | `<amount>` làm tròn theo hướng nào, mấy chữ số thập phân, ở bước nào? | Unknown |
| pro-rata-refund | Hoàn / thu phí theo thời gian còn lại | W4 | Phí hoàn khi huỷ giữa kỳ tính theo ngày hay tháng, có khấu trừ `<phí>` nào không? | Unknown |
| effective-expiry-boundary | Biên ngày hiệu lực / hết hạn | W4 | Giờ bắt đầu / kết thúc của `<policy>` tính theo múi giờ nào, ngày biên có thuộc kỳ bảo hiểm không? | Unknown |
| waiting-grace-period | Thời gian chờ và ân hạn | W4 | `<waiting-period>` và `<grace-period>` tính từ mốc nào, tính ngày lịch hay ngày làm việc? | Unknown |
| renewal-lapse | Tái tục, mất hiệu lực, khôi phục | W2 | Điều kiện nào chuyển `<policy>` sang lapse, và khôi phục cần những bước gì? | Unknown |
| claim-eligibility | Điều kiện được bồi thường | W3 | Hồ sơ cần đáp ứng `<điều kiện>` nào, loại trừ `<exclusion>` xử lý toàn bộ hay một phần? | Unknown |
| claim-limits-deductible | Giới hạn và mức miễn thường | W1 | `<sum-insured>` và `<deductible>` áp lên từng sự kiện hay cả kỳ, và thứ tự trừ ra sao? | Unknown |
| claim-duplicate-detection | Phát hiện claim trùng | W2 | Hai claim cùng `<event>` được coi là trùng theo tiêu chí nào, trạng thái sau khi phát hiện? | Unknown |
| claim-reopen-appeal | Mở lại / khiếu nại claim | W2 | Claim đã `<paid>` hoặc `<rejected>` có được mở lại không, trong thời hạn nào? | Unknown |
| underwriting-authority | Quyền thẩm định theo mức rủi ro | W5 | `<action>` nào cần underwriter cấp cao hơn khi vượt `<ngưỡng>`? | Unknown |
| beneficiary-change | Đổi người thụ hưởng | W5 | Ai được đổi `<beneficiary>`, cần xác nhận của ai, và có hiệu lực sau khi claim đã nộp không? | Unknown |
| notice-timing | Thời điểm và kênh thông báo | W6 | Sau `<sự kiện>`, thông báo gửi cho vai trò nào, qua kênh nào, khi nào? | Unknown |
