# Industry vocabulary · ecommerce-retail

> Term suggestions, not the project's definitions. Skills copy them to `knowledge/_glossary.md` with the `[DOMAIN]` label,
> and the project people review them against the real documents (QA_STANDARD §10.3). The meaning in the project's documents always wins.
> No retail reference model has been verified yet, so the Source column is `Unknown` (except PCI SSC, which was opened).
> The Term column keeps the Vietnamese equivalent in brackets so the term can be spotted in Vietnamese documents.
> Source column: a `Ref id` registered in `qa-system/domains/SOURCES.md` (its status — VERIFIED / PARTIAL — is recorded there), or `Unknown`.

## 1. Roles (actors)
| Key | Term | Short meaning | Source |
|---|---|---|---|
| guest | Guest (khách vãng lai) | Buys without logging in | Unknown |
| member | Member (thành viên) | A customer with a login account | Unknown |
| customer-support | Customer support (chăm sóc khách hàng) | Handles cancellations, returns, complaints | Unknown |
| merchandiser | Merchandiser (người quản lý hàng / giá) | Configures products, prices, promotions | Unknown |
| warehouse-staff | Warehouse staff (nhân viên kho) | Picks goods, receives stock, receives returned goods | Unknown |
| payment-provider | Payment provider (cổng thanh toán) | External party processing payments | Unknown |
| fraud-analyst | Fraud analyst (nhân viên chống gian lận) | Reviews orders held by a fraud / risk check | Unknown |
| carrier | Carrier (đơn vị vận chuyển) | External party that delivers the parcel and reports delivery status | Unknown |

## 2. Entities
| Key | Term | Short meaning | Source |
|---|---|---|---|
| sku | SKU (mã hàng tồn kho) | The smallest unit of goods whose stock is tracked | Unknown |
| cart | Cart (giỏ hàng) | A set of line items not yet ordered | Unknown |
| cart-line | Line item (dòng hàng) | One SKU with a quantity in a cart / order | Unknown |
| subtotal | Subtotal (tiền hàng) | Total goods amount, before the shipping fee | Unknown |
| shipping-fee | Shipping fee (phí vận chuyển) | Delivery fee, separate from the goods amount | Unknown |
| tax | Tax (thuế) | Tax computed on the order | Unknown |
| voucher | Voucher / coupon (mã giảm giá) | A code granting a discount benefit | Unknown |
| promotion | Promotion (khuyến mãi) | An automatic discount programme | Unknown |
| stacking | Stacking (cộng dồn) | Using several promotions on one order | Unknown |
| inventory-reservation | Reservation (giữ chỗ tồn kho) | Goods temporarily held for an unpaid cart / order | Unknown |
| order | Order (đơn hàng) | A confirmed purchase request | Unknown |
| payment | Payment (thanh toán) | The money transaction for an order | Unknown |
| fulfilment | Fulfilment (xử lý và giao đơn) | Picking, packing, delivering | Unknown |
| return-request | Return / RMA (yêu cầu trả hàng) | A request to return goods after purchase | Unknown |
| refund | Refund (hoàn tiền) | Returning money to the customer | Unknown |
| benefit-restore | Benefit restoration (hoàn quyền lợi) | Returning codes / points used when cancelling | Unknown |
| card-data | Cardholder data (dữ liệu thẻ) | Payment card data subject to the PCI standard | ref-pci-dss |
| idempotency | Idempotency (gửi lặp không đổi kết quả) | Resubmitting the same request does not create a second record | Unknown |
| product-identifier | Product identifier / GTIN (mã định danh sản phẩm) | Globally unique identifier of a trade item; four lengths (GTIN-8/12/13/14); GTIN-14 identifies groupings such as a case | ref-gs1us-gtin |
| variant | Variant (biến thể) | One sellable option of a product (size, flavour, packaging); each distinct sold option has its own GTIN | ref-gs1us-gtin |
| stored-value | Stored value: gift card / store credit / points (giá trị lưu trữ: thẻ quà tặng, ví, điểm) | A balance the customer can spend instead of, or with, a payment | Unknown |
| backorder-preorder | Backorder / pre-order (đặt trước) | An order accepted for an item not yet in stock | Unknown |
| delivery-zone | Delivery zone (khu vực giao hàng) | Area / item combination a carrier can serve | Unknown |
| purchase-limit | Purchase limit (giới hạn mua) | Maximum quantity per customer / order for an item or campaign | Unknown |
| settlement | Settlement (quyết toán với cổng thanh toán) | Amounts the payment provider actually pays out, net of refunds and fees | Unknown |
| chargeback | Chargeback (khiếu nại hoàn tiền qua ngân hàng) | A payment reversed through the card scheme after a customer dispute | Unknown |
| fraud-check | Fraud check (kiểm tra gian lận) | Automatic or manual review that may hold an order before fulfilment | Unknown |

## 3. States & lifecycles
| Key | Entity | States (in order) | Source |
|---|---|---|---|
| order-lifecycle | Order | `<state A>` → `<state B>` → `<delivered>` / `<cancelled>` | Unknown |
| payment-lifecycle | Payment | `<pending>` → `<captured>` → `<partially refunded>` / `<fully refunded>` | Unknown |
| fulfilment-lifecycle | Fulfilment | `<awaiting picking>` → `<in delivery>` → `<delivered>` / `<delivery failed>` | Unknown |
| return-lifecycle | Return | `<requested>` → `<goods received>` → `<refunded>` | Unknown |
| reservation-lifecycle | Reservation | `<held>` → `<committed>` / `<expired>` / `<released>` | Unknown |
| stored-value-lifecycle | Stored value | `<issued>` → `<active>` → `<partially used>` → `<exhausted / expired / voided>` (state set declared by the project) | Unknown |
| fraud-review-lifecycle | Order under fraud check | `<pending review>` → `<released / cancelled>` | Unknown |
