# Họ quy tắc hay bị thiếu · healthcare

> Danh sách nhắc cho ma trận 06W (QA_STANDARD §4). Một họ quy tắc ở đây **không phải rule**: thấy tài liệu thiếu ⇒
> câu hỏi `MR` ở 02, không bao giờ thành `BR` (QA_STANDARD §10.3). Chỉ dùng chỗ giữ chỗ trung tính (`<field>`,
> `<trạng thái>`, `<ngưỡng>`) — không ghi giá trị, ngưỡng hay chữ thông báo cụ thể. Tham chiếu: `[DOMAIN] healthcare/rule-patterns.md#<mục>`.

| Mục | Họ quy tắc | Nhóm 06W | Câu hỏi khung (trung tính) | Nguồn |
|---|---|---|---|---|
| consent-capture-withdrawal | Ghi nhận và rút sự đồng ý | W2 | Khi `<consent>` ở `<state-A>`, `<action>` có được thực hiện không? | Unknown |
| record-amend-vs-delete | Đính chính khác với xoá | W6 | `<entity>` ở `<state-A>` được đính chính hay xoá, và vết cũ có giữ không? | Unknown |
| identity-matching | Tiêu chí coi là cùng một người | W3 | Hai `<entity>` trùng `<field>` thì coi là một hay hai người? | Unknown |
| duplicate-merge-unmerge | Gộp hồ sơ trùng và hoàn tác gộp | W6 | Sau khi gộp có hoàn tác được không, dữ liệu liên quan chuyển đi đâu? | Unknown |
| clinical-vs-billing-state | Đối chiếu trạng thái lâm sàng và thanh toán | W3 | Khi `<entity>` sang `<state-A>`, claim liên quan phải ở trạng thái nào? | https://www.hl7.org/fhir/claim.html |
| unit-of-measure | Đơn vị đo và quy đổi | W3 | `<field>` nhận những `<unit>` nào, quy đổi và làm tròn ra sao? | Unknown |
| encounter-timezone | Múi giờ và ranh giới ngày của lượt khám | W4 | `<datetime>` lưu và hiển thị theo múi giờ nào? | Unknown |
| role-based-access | Truy cập theo vai trò | W5 | `<role>` có được `<action>` trên `<field>` của `<entity>` không? | Unknown |
| break-glass-access | Truy cập khẩn cấp có kiểm soát | W5 | Truy cập vượt quyền cần lý do nào và ai soát lại? | Unknown |
| audit-event-coverage | Phạm vi nhật ký truy cập | W6 | Hành động nào trên `<entity>` phải có nhật ký? | Unknown |
| status-transition-reversal | Đảo hoặc huỷ chuyển trạng thái | W2 | Từ `<state-B>` có quay lại `<state-A>` được không, ai được làm? | https://www.hl7.org/fhir/encounter.html |
| external-system-failure | Phản hồi khi hệ thống ngoài lỗi | W5 | Khi `<system>` lỗi, `<entity>` giữ trạng thái nào và thử lại ra sao? | Unknown |
| data-retention-period | Thời hạn lưu và xoá | W6 | `<entity>` giữ bao lâu, hết hạn thì làm gì? | Unknown |
| notification-content-privacy | Nội dung thông báo ra ngoài | W6 | `<field>` nào được xuất hiện trong thông báo gửi `<recipient>`? | Unknown |
