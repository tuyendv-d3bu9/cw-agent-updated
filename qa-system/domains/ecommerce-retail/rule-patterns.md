# Họ quy tắc hay bị thiếu · ecommerce-retail

> Danh sách nhắc cho ma trận 06W (QA_STANDARD §4). Một họ quy tắc ở đây **không phải rule**: thấy tài liệu thiếu ⇒
> câu hỏi `MR` ở 02, không bao giờ thành `BR` (QA_STANDARD §10.3). Chỉ dùng chỗ giữ chỗ trung tính (`<field>`,
> `<trạng thái>`, `<ngưỡng>`) — không ghi giá trị, ngưỡng hay chữ thông báo cụ thể. Tham chiếu: `[DOMAIN] ecommerce-retail/rule-patterns.md#<mục>`.

| Mục | Họ quy tắc | Nhóm 06W | Câu hỏi khung (trung tính) | Nguồn |
|---|---|---|---|---|
| promotion-stacking | Cộng dồn khuyến mãi và thứ tự áp dụng | W3 | `<promotion-A>` và `<promotion-B>` có cộng dồn không, áp theo thứ tự nào? | Unknown |
| discount-scope | Phạm vi giảm: tiền hàng hay phí ship | W3 | `<promotion>` giảm trên `<subtotal>`, `<shipping-fee>`, hay cả hai? | Unknown |
| guest-vs-member | Quyền lợi theo loại khách | W5 | `<actor>` chưa đăng nhập có được `<action>` không? | Unknown |
| benefit-restore-on-cancel | Hoàn quyền lợi khi huỷ / trả | W6 | Khi `<order>` bị huỷ ở `<state-A>`, `<benefit>` có hoàn không, hoàn khi nào? | Unknown |
| cart-line-validation | Kiểm tra dòng hàng và số lượng | W1 | `<field>` số lượng nằm ngoài `<ngưỡng>` thì xử lý ra sao? | Unknown |
| price-and-tax-rounding | Làm tròn giá, thuế | W3 | `<amount>` làm tròn ở dòng hay tổng, theo quy tắc nào? | Unknown |
| price-revalidation | Kiểm lại giá / khuyến mãi tại thời điểm chốt | W4 | `<promotion>` hết hạn giữa chừng thì giỏ xử lý ra sao? | Unknown |
| inventory-reservation | Giữ chỗ tồn kho và nhả | W4 | `<reservation>` giữ bao lâu và nhả trong tình huống nào? | Unknown |
| concurrent-purchase | Mua đồng thời khi gần hết tồn | W4 | Hai `<actor>` cùng mua `<sku>` cuối cùng thì ai được? | Unknown |
| order-state-transition | Chuyển trạng thái đơn hợp lệ / đảo | W2 | Từ `<state-B>` có quay lại `<state-A>` được không, ai làm? | Unknown |
| payment-fulfilment-coupling | Liên hệ trạng thái thanh toán và giao hàng | W2 | `<order>` có được giao khi `<payment>` ở `<state-A>` không? | Unknown |
| partial-fulfilment-refund | Giao một phần, hoàn một phần | W6 | Khi chỉ một phần `<order>` được giao / trả, hoàn `<amount>` tính thế nào? | Unknown |
| duplicate-request-handling | Xử lý yêu cầu gửi lặp | W2 | Gửi lại `<action>` trên `<state-A>` có tạo bản ghi mới không? | Unknown |
| external-provider-failure | Phản hồi khi cổng thanh toán / vận chuyển lỗi | W5 | Khi `<provider>` lỗi, `<order>` giữ trạng thái nào và thử lại ra sao? | Unknown |
