# Rủi ro ngành · ecommerce-retail

> Checklist. Mỗi dòng chỉ được thành: câu hỏi `OQ` (01) → `MR` (02), hoặc ứng viên viewpoint (03) khi đã có mã nguồn
> của dự án. Không phải rủi ro `RK` của tính năng (QA_STANDARD §10.3). Tham chiếu một dòng: `[DOMAIN] ecommerce-retail/risks.md#<mục>`.
> Cột đặc tính ghi đúng tên trong ISO/IEC 25010:2023, đối chiếu tại https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (https://www.iso.org/standard/78176.html chưa mở được).
> Rủi ro tuân thủ / truy vết xếp vào Security (Accountability, Integrity theo trang đối chiếu).

| Mục | Rủi ro (một câu) | Đặc tính ISO/IEC 25010:2023 | Dấu hiệu tính năng có chạm tới | Câu hỏi đóng gợi ý cho BA | Nguồn |
|---|---|---|---|---|---|
| promotion-stacking-conflict | Nhiều khuyến mãi áp cùng lúc cho ra giảm sai hoặc vượt `<amount>` | Functional suitability | Mã giảm giá, khuyến mãi tự động | `<promotion-A>` và `<promotion-B>` có được áp cùng một đơn không? | Unknown |
| discount-scope-shipping-vs-subtotal | Giảm giá áp nhầm vào phí ship hay tiền hàng | Functional suitability | Mã giảm, freeship | `<promotion>` giảm trên `<subtotal>`, `<shipping-fee>`, hay cả hai? | Unknown |
| guest-vs-member-eligibility | Khách vãng lai hưởng hoặc mất quyền lợi sai | Functional suitability | Mua không đăng nhập, mã thành viên | `<benefit>` có áp dụng cho khách chưa đăng nhập không? | Unknown |
| benefit-restore-on-cancel | Huỷ đơn không hoàn (hoặc hoàn lặp) mã / điểm đã dùng | Functional suitability | Huỷ, đổi trả, hoàn tiền | Khi `<order>` ở `<state-A>` bị huỷ, `<benefit>` có được hoàn không? | Unknown |
| rounding-and-tax-mismatch | Làm tròn / thuế lệch giữa dòng hàng và tổng đơn | Functional suitability | Giá, thuế, hoá đơn | `<amount>` làm tròn ở từng dòng hay trên tổng, theo quy tắc nào? | Unknown |
| price-change-after-add | Giá đổi sau khi thêm vào giỏ nhưng trước khi thanh toán | Functional suitability | Giỏ hàng, bước thanh toán | Giá chốt ở thời điểm thêm giỏ, vào checkout, hay lúc trả tiền? | Unknown |
| oversell-inventory | Bán vượt tồn khi nhiều người mua cùng lúc | Reliability | Đặt hàng đồng thời, flash sale | Khi `<sku>` còn không đủ, đơn đến sau bị xử lý thế nào? | Unknown |
| reservation-expiry | Giữ chỗ tồn kho không nhả hoặc nhả sớm | Reliability | Giỏ, thanh toán chờ | `<reservation>` hết hạn sau bao lâu và nhả khi nào? | Unknown |
| duplicate-order-submission | Bấm hai lần hoặc gửi lại tạo hai đơn / hai lần thu | Reliability | Nút đặt hàng, callback thanh toán | Gửi lại `<action>` có tạo đơn hay khoản thu thứ hai không? | Unknown |
| payment-state-mismatch | Trạng thái đơn và thanh toán lệch (đã thu nhưng đơn chưa xác nhận) | Reliability | Callback cổng thanh toán | Khi `<payment>` ở `<state-A>` mà `<order>` ở `<state-B>`, hệ thống xử lý ra sao? | Unknown |
| provider-timeout | Cổng thanh toán / vận chuyển không phản hồi | Compatibility | Tích hợp bên ngoài | Khi `<provider>` quá thời gian chờ, `<order>` giữ trạng thái nào? | Unknown |
| card-data-exposure | Dữ liệu thẻ lộ ở log, DB, email | Security | Nhập thẻ, lưu thẻ | `<system>` có được lưu `<field>` của thẻ không, và ở đâu? | https://www.pcisecuritystandards.org/ |
| voucher-abuse | Dò mã, dùng lặp, dùng vượt giới hạn | Security | Nhập mã giảm giá | Hệ thống giới hạn số lần thử / dùng `<voucher>` bằng cách nào? | Unknown |
| order-access-control | Người dùng xem hoặc sửa đơn của người khác | Security | Tra cứu đơn, link theo dõi | `<role>` có được xem `<order>` của người khác không? | Unknown |
| order-audit-trail | Đổi giá, hoàn tiền, huỷ thủ công không có vết | Security | Thao tác của nhân viên | Mỗi lần `<action>` thủ công có ghi người làm và thời điểm không? | Unknown |
| return-refund-eligibility | Hoàn tiền / đổi trả sai điều kiện, sai số tiền | Functional suitability | Đổi trả, hoàn tiền một phần | `<order>` ở `<state-A>` có được trả hàng và hoàn `<amount>` bao nhiêu? | Unknown |
| cart-merge-on-login | Mất hoặc nhân đôi hàng khi khách đăng nhập | Functional suitability | Giỏ khách vãng bị gộp vào tài khoản | Giỏ trước đăng nhập gộp, thay thế, hay giữ riêng với giỏ của tài khoản? | Unknown |
| checkout-error-protection | Khách khó sửa lỗi nhập ở bước thanh toán | Interaction capability | Form địa chỉ, thanh toán | Khi `<field>` sai, khách có sửa được mà không mất giỏ không? | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 |
