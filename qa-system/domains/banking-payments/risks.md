# Rủi ro ngành · banking-payments

> Checklist. Mỗi dòng chỉ được thành: câu hỏi `OQ` (01) → `MR` (02), hoặc ứng viên viewpoint (03) khi đã có mã nguồn
> của dự án. Không phải rủi ro `RK` của tính năng (QA_STANDARD §10.3). Tham chiếu một dòng: `[DOMAIN] banking-payments/risks.md#<mục>`.
> Tên đặc tính khớp trang https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở): Functional Suitability, Reliability, Security, Performance Efficiency, Compatibility, Interaction Capability. Trang ISO gốc trả 403.
> Nguồn `Unknown` = kinh nghiệm chung của ngành, chưa có URL đã kiểm.

| Mục | Rủi ro (một câu) | Đặc tính ISO/IEC 25010:2023 | Dấu hiệu tính năng có chạm tới | Câu hỏi đóng gợi ý cho BA | Nguồn |
|---|---|---|---|---|---|
| duplicate-submission | Một lệnh bị gửi hai lần (bấm đúp, thử lại do timeout) tạo hai giao dịch | Reliability | Nút gửi lệnh, retry, mạng chậm | Khi `<transfer>` bị gửi lại với cùng nội dung, hệ thống có chặn bản thứ hai không? | Unknown |
| partial-failure-consistency | Ghi nợ thành công nhưng ghi có thất bại, hai bên lệch số dư | Reliability | Chuyển tiền gồm nhiều bước / nhiều hệ thống | Nếu bước `<credit>` lỗi sau bước `<debit>`, hệ thống tự hoàn bước `<debit>` hay chờ xử lý tay? | Unknown |
| concurrent-balance-update | Hai giao dịch đồng thời cùng đọc một số dư, dẫn tới âm hoặc vượt hạn mức | Reliability | Nhiều kênh dùng chung `<account>` | Hai giao dịch cùng lúc trên `<account>`, giao dịch nào được ưu tiên, giao dịch kia xử lý ra sao? | Unknown |
| limit-enforcement | Hạn mức theo giao dịch / ngày bị bỏ qua hoặc tính sai kỳ | Functional Suitability | Có `<limit>` theo `<period>` | `<limit>` tính theo ngày lịch hay 24 giờ trượt, và có tính giao dịch thất bại không? | Unknown |
| rounding-currency | Làm tròn / số chữ số thập phân sai ở phí, tỷ giá, lãi | Functional Suitability | `<amount>` có phí, quy đổi, chia tỷ lệ | Quy tắc làm tròn của `<amount>` là gì (hướng, số lẻ, làm tròn ở bước nào)? | Unknown |
| cut-off-time | Giao dịch sát giờ chốt rơi sang ngày làm việc sau bị xử lý sai | Functional Suitability | Có giờ chốt, ngày nghỉ, múi giờ | Giao dịch gửi sau `<cut-off>` được xử lý ngày nào, theo múi giờ nào? | Unknown |
| status-reversal | Hoàn / huỷ giao dịch từ trạng thái không cho phép, hoặc hoàn hai lần | Functional Suitability | Có hoàn tiền, huỷ, chargeback | Từ `<state-A>` có được `<reverse>` không, và hoàn một phần được mấy lần? | Unknown |
| card-data-exposure | Số thẻ đầy đủ lộ trong log, màn hình, export, thông báo | Security | Nhập / hiển thị / lưu `<card-number>` | `<card-number>` hiển thị che bao nhiêu ký tự ở từng màn hình, và có được ghi vào log không? | https://www.pcisecuritystandards.org/standards/pci-dss/ |
| strong-auth-bypass | Bỏ qua OTP / xác thực bổ sung bằng cách gọi thẳng bước sau | Security | Bước xác thực giữa các bước giao dịch | Giao dịch nào bắt buộc xác thực bổ sung, và có đường nào bỏ qua được không? | Unknown |
| maker-checker-bypass | Maker tự duyệt giao dịch của mình hoặc duyệt khi đã hết quyền | Security | Có luồng tạo - duyệt | Một người có được vừa tạo vừa duyệt `<transaction>` không? | Unknown |
| access-control-per-account | Người dùng xem / thao tác tài khoản không phải của mình | Security | Mã `<account>` trong URL / tham số | Người dùng chỉ thấy `<account>` thuộc quyền nào, và truy cập sai trả về gì? | Unknown |
| audit-trail-gap | Thao tác tiền / thay đổi cấu hình không để lại dấu vết truy vết (Accountability) | Security | Thao tác nhạy cảm, sửa tay, điều chỉnh số dư | Thao tác `<action>` có ghi nhật ký (ai, khi nào, giá trị trước / sau) không? | Unknown |
| aml-kyc-screening | Giao dịch / khách hàng đáng ngờ không bị kiểm tra theo quy định địa phương | Security | Onboarding, giao dịch lớn, người nhận mới | Điều kiện nào kích hoạt kiểm tra AML/KYC cho `<transaction>` (local regulation, chi tiết Unknown)? | Unknown |
| reconciliation-mismatch | Số liệu hệ thống và đối tác / sao kê không khớp mà không ai biết | Functional Suitability | Có đối tác, file sao kê, settlement | Khoản lệch giữa hai nguồn được phát hiện và xử lý theo quy trình nào? | Unknown |
| peak-load-batch-window | Giờ cao điểm / batch cuối ngày làm chậm hoặc chặn giao dịch | Performance Efficiency | Batch cuối ngày, lương, khuyến mãi | Trong thời gian chạy `<batch>`, giao dịch online có bị chặn / chậm không? | Unknown |
| third-party-timeout | Đối tác thanh toán không phản hồi, trạng thái giao dịch không rõ | Compatibility | Gọi cổng thanh toán / ngân hàng khác | Khi `<partner>` không phản hồi trong `<timeout>`, giao dịch ở trạng thái nào và ai kiểm tra lại? | Unknown |
| notification-correctness | Thông báo / biên lai sai số tiền, sai trạng thái, hoặc lộ dữ liệu | Interaction Capability | SMS / email / biên lai sau giao dịch | Nội dung thông báo gồm những trường nào, và gửi khi giao dịch ở trạng thái nào? | Unknown |
