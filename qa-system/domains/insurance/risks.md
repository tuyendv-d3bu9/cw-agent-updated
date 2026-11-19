# Rủi ro ngành · insurance

> Checklist. Mỗi dòng chỉ được thành: câu hỏi `OQ` (01) → `MR` (02), hoặc ứng viên viewpoint (03) khi đã có mã nguồn
> của dự án. Không phải rủi ro `RK` của tính năng (QA_STANDARD §10.3). Tham chiếu một dòng: `[DOMAIN] insurance/risks.md#<mục>`.
> Tên đặc tính khớp trang https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở): Functional Suitability, Reliability, Security, Performance Efficiency, Compatibility, Interaction Capability. Trang ISO gốc trả 403.
> Nguồn `Unknown` = kinh nghiệm chung của ngành, chưa có URL đã kiểm.

| Mục | Rủi ro (một câu) | Đặc tính ISO/IEC 25010:2023 | Dấu hiệu tính năng có chạm tới | Câu hỏi đóng gợi ý cho BA | Nguồn |
|---|---|---|---|---|---|
| premium-calculation | Phí tính sai do thứ tự áp yếu tố (tuổi, phạm vi, giảm giá, thuế) hoặc làm tròn | Functional Suitability | Có báo giá / phí theo nhiều yếu tố | Phí `<premium>` được tính theo thứ tự yếu tố nào, và làm tròn ở bước nào? | Unknown |
| pro-rata-adjustment | Phí hoàn / thu thêm khi sửa đổi hoặc huỷ giữa kỳ tính sai | Functional Suitability | Endorsement, huỷ giữa kỳ | Khi `<policy>` đổi `<field>` giữa kỳ, phí chênh lệch tính theo cách nào? | Unknown |
| effective-date-boundary | Sai biên ngày hiệu lực / hết hạn / thời gian chờ ảnh hưởng quyền lợi | Functional Suitability | Ngày hiệu lực, waiting period, ngày sự kiện | Sự kiện xảy ra đúng ngày `<effective-date>` hoặc `<end-date>` có được bảo hiểm không? | Unknown |
| coverage-eligibility | Chấp nhận / từ chối bồi thường sai do loại trừ, điều kiện, giới hạn phạm vi | Functional Suitability | Có coverage, exclusion, deductible | Khi sự kiện khớp `<exclusion>`, hồ sơ bị từ chối toàn bộ hay chi trả một phần? | Unknown |
| underwriting-bypass | Hợp đồng được phát hành khi chưa qua bước thẩm định bắt buộc | Functional Suitability | Có thẩm định, kết quả thẩm định | Có đường nào phát hành `<policy>` khi `<underwriting-decision>` chưa có không? | Unknown |
| lapse-reinstatement | Xử lý sai khi quá hạn đóng phí, hết ân hạn, khôi phục hiệu lực | Functional Suitability | Grace period, lapse, reinstatement | Khi quá `<grace-period>` mà chưa đóng phí, `<policy>` chuyển trạng thái nào, và khôi phục theo điều kiện nào? | Unknown |
| renewal-auto-process | Tái tục tự động sai phí / sai điều khoản / không thông báo trước | Functional Suitability | Renewal, auto-renew | Điều khoản và phí kỳ mới được xác định thế nào, và thông báo trước bao lâu? | Unknown |
| claim-duplicate | Một sự kiện bị bồi thường hai lần hoặc qua hai hợp đồng | Reliability | Nộp claim, nhiều policy cho một đối tượng | Hệ thống phát hiện claim trùng cho cùng `<event>` bằng tiêu chí nào? | Unknown |
| payout-consistency | Số tiền chi trả lệch với kết quả thẩm định hoặc với sổ cái | Reliability | Payout, phê duyệt claim | Số tiền `<payout>` lấy từ đâu và có kiểm tra lại với quyết định đã duyệt không? | Unknown |
| payment-collection-failure | Thu phí thất bại nhưng hợp đồng vẫn hiệu lực (hoặc ngược lại) | Reliability | Thu phí định kỳ, trích nợ tự động | Khi thu phí `<premium>` thất bại, `<policy>` ở trạng thái nào và thử lại bao nhiêu lần? | Unknown |
| sensitive-data-exposure | Lộ dữ liệu cá nhân / sức khoẻ / tài chính trong hồ sơ, tài liệu đính kèm, log | Security | Hồ sơ y tế, giấy tờ tùy thân, file đính kèm | `<field>` nhạy cảm hiển thị cho vai trò nào và lưu bao lâu (local regulation, chi tiết Unknown)? | Unknown |
| role-based-access | Đại lý / nhân viên xem hoặc sửa hợp đồng ngoài phạm vi phụ trách | Security | Vai trò agent, underwriter, adjuster | Mỗi vai trò chỉ xem / sửa `<policy>` nào, truy cập sai trả về gì? | Unknown |
| audit-of-decisions | Quyết định thẩm định / bồi thường không truy vết được người, thời điểm, lý do | Security | Duyệt, từ chối, ghi đè quyết định | Quyết định `<action>` có lưu người, thời điểm, lý do không, và ai được ghi đè? | Unknown |
| document-evidence-handling | File chứng từ sai định dạng / quá cỡ / thiếu làm hồ sơ bị xử lý sai | Functional Suitability | Tải chứng từ cho claim / application | Chứng từ nào bắt buộc theo `<loại claim>`, và thiếu thì hồ sơ ở trạng thái nào? | Unknown |
| batch-renewal-load | Batch tái tục / thu phí cuối kỳ chạy chậm hoặc chạy sót | Performance Efficiency | Batch tái tục, thu phí hàng loạt | Khi batch `<batch>` lỗi giữa chừng, bản ghi nào được chạy lại và bằng cách nào? | Unknown |
| external-service-dependency | Dịch vụ ngoài (thanh toán, định danh, y tế, giám định) lỗi làm kẹt hồ sơ | Compatibility | Tích hợp bên thứ ba | Khi `<partner>` không phản hồi, hồ sơ chờ hay chuyển xử lý tay, và ai theo dõi? | Unknown |
| customer-notice-correctness | Thư / thông báo (đến hạn phí, từ chối, tái tục) sai nội dung hoặc sai thời điểm | Interaction Capability | Thông báo đến hạn, kết quả claim | Thông báo `<notice>` gửi khi nào, qua kênh nào, gồm trường nào? | Unknown |
