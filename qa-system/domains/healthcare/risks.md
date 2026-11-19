# Rủi ro ngành · healthcare

> Checklist. Mỗi dòng chỉ được thành: câu hỏi `OQ` (01) → `MR` (02), hoặc ứng viên viewpoint (03) khi đã có mã nguồn
> của dự án. Không phải rủi ro `RK` của tính năng (QA_STANDARD §10.3). Tham chiếu một dòng: `[DOMAIN] healthcare/risks.md#<mục>`.
> Cột đặc tính ghi đúng tên trong ISO/IEC 25010:2023, đối chiếu tại https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (https://www.iso.org/standard/78176.html chưa mở được).
> Rủi ro tuân thủ / truy vết xếp vào Security (Accountability, Non-repudiation, Integrity theo trang đối chiếu).

| Mục | Rủi ro (một câu) | Đặc tính ISO/IEC 25010:2023 | Dấu hiệu tính năng có chạm tới | Câu hỏi đóng gợi ý cho BA | Nguồn |
|---|---|---|---|---|---|
| unauthorized-record-access | Người không đúng vai trò xem được hồ sơ `<entity>` | Security | Phân vai, màn hình xem hồ sơ | `<role>` có được xem `<field>` của `<entity>` không? | Unknown |
| access-audit-trail | Truy cập / sửa dữ liệu không để lại vết truy được | Security | Nhật ký, báo cáo kiểm toán | Mọi lần `<action>` trên `<entity>` có ghi nhật ký (ai, khi nào) không? | Unknown |
| break-glass-abuse | Truy cập khẩn cấp bị lạm dụng hoặc không bị soát | Security | Chức năng vượt quyền | Truy cập khẩn cấp có bắt buộc nhập lý do và bị soát lại không? | Unknown |
| consent-not-enforced | Hệ thống bỏ qua việc người bệnh từ chối / rút `<consent>` | Security | Chia sẻ dữ liệu, thông báo | Khi `<consent>` ở `<state-A>`, `<action>` có bị chặn không? | Unknown |
| phi-in-logs-or-exports | Dữ liệu định danh lộ ở log, email, tệp xuất | Security | Xuất tệp, thông báo, log | `<field>` có bị che / loại khỏi `<output>` không? | Unknown |
| record-integrity-after-amend | Đính chính làm mất bản gốc hoặc không truy được | Security | Lịch sử phiên bản | Bản gốc của `<entity>` có còn xem được sau đính chính không? | Unknown |
| data-retention-disposal | Giữ hoặc xoá dữ liệu sai thời hạn quy định | Security | Lưu trữ, xoá, ẩn danh | `<entity>` giữ bao lâu và xử lý thế nào khi hết hạn? | Unknown |
| wrong-patient-match | Gộp nhầm hoặc tách nhầm hồ sơ người bệnh | Functional suitability | Đăng ký, tìm kiếm, gộp hồ sơ | Hai hồ sơ trùng `<field>` có bị coi là một người không? | Unknown |
| record-deletion-vs-amend | Xoá làm mất lịch sử thay vì đính chính | Functional suitability | Nút xoá / sửa hồ sơ | `<entity>` đã `<state-A>` thì đính chính, xoá, hay không cho sửa? | Unknown |
| clinical-billing-state-drift | Trạng thái lâm sàng và thanh toán lệch nhau | Functional suitability | Encounter có claim | Khi `<entity>` sang `<state-A>`, claim liên quan có đổi trạng thái không? | https://www.hl7.org/fhir/claim.html |
| unit-conversion-error | Nhầm đơn vị hoặc làm tròn giá trị đo | Functional suitability | Giá trị đo, liều, nhập tay | `<field>` nhận những đơn vị nào và có tự quy đổi không? | Unknown |
| timezone-misplacement | Thời điểm lượt khám lệch múi giờ hoặc ngày | Functional suitability | Ngày giờ hẹn, khám, báo cáo | `<datetime>` lưu theo múi giờ nào, hiển thị theo múi giờ nào? | Unknown |
| duplicate-submission | Gửi lặp một yêu cầu tạo ra bản ghi đôi | Reliability | Đặt lịch, gửi claim, bấm nhiều lần | Gửi lại `<action>` có tạo bản ghi thứ hai không? | Unknown |
| concurrent-edit-conflict | Hai người sửa cùng hồ sơ, bản sau ghi đè bản trước | Reliability | Sửa đồng thời | Hai người sửa `<entity>` cùng lúc thì xử lý ra sao? | Unknown |
| downtime-continuity | Không truy cập được hồ sơ khi hệ thống ngừng | Reliability | Chức năng cần dùng ngay khi khám | Có phương án dùng `<function>` khi hệ thống ngừng không? | Unknown |
| interface-message-loss | Mất hoặc lặp thông điệp với hệ thống ngoài | Compatibility | Tích hợp lab, bên chi trả | Khi `<system>` không phản hồi, `<entity>` ở trạng thái nào? | Unknown |
| order-entry-error-protection | Giao diện dễ nhập nhầm `<field>` quan trọng | Interaction capability | Form chỉ định, nhập liều | Thao tác `<action>` có bước xác nhận trước khi lưu không? | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 |
