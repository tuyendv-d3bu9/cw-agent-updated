# Từ vựng ngành · ecommerce-retail

> Gợi ý thuật ngữ, không phải định nghĩa của dự án. Skill chép sang `knowledge/_glossary.md` với nhãn `[DOMAIN]`,
> người dự án duyệt lại theo tài liệu thật (QA_STANDARD §10.3). Nghĩa trong tài liệu dự án luôn thắng.
> Chưa có mô hình tham chiếu bán lẻ nào được kiểm, nên cột Nguồn là `Unknown` (trừ PCI SSC đã mở).

## 1. Vai trò (actor)
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| guest | Guest (khách vãng lai) | Mua không cần đăng nhập | Unknown |
| member | Member (thành viên) | Khách có tài khoản đăng nhập | Unknown |
| customer-support | Customer support (chăm sóc khách hàng) | Xử lý huỷ, đổi trả, khiếu nại | Unknown |
| merchandiser | Merchandiser (người quản lý hàng / giá) | Cấu hình sản phẩm, giá, khuyến mãi | Unknown |
| warehouse-staff | Warehouse staff (nhân viên kho) | Soạn hàng, nhập kho, nhận hàng trả | Unknown |
| payment-provider | Payment provider (cổng thanh toán) | Bên ngoài xử lý thanh toán | Unknown |

## 2. Thực thể
| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| sku | SKU (mã hàng tồn kho) | Đơn vị hàng nhỏ nhất theo dõi tồn | Unknown |
| cart | Cart (giỏ hàng) | Tập dòng hàng chưa đặt | Unknown |
| cart-line | Line item (dòng hàng) | Một SKU với số lượng trong giỏ / đơn | Unknown |
| subtotal | Subtotal (tiền hàng) | Tổng tiền hàng, chưa tính phí ship | Unknown |
| shipping-fee | Shipping fee (phí vận chuyển) | Phí giao hàng, tách khỏi tiền hàng | Unknown |
| tax | Tax (thuế) | Thuế tính trên đơn | Unknown |
| voucher | Voucher / coupon (mã giảm giá) | Mã cho quyền lợi giảm giá | Unknown |
| promotion | Promotion (khuyến mãi) | Chương trình giảm giá tự động | Unknown |
| stacking | Stacking (cộng dồn) | Dùng nhiều khuyến mãi trên một đơn | Unknown |
| inventory-reservation | Reservation (giữ chỗ tồn kho) | Giữ hàng tạm cho giỏ / đơn chưa thanh toán | Unknown |
| order | Order (đơn hàng) | Yêu cầu mua đã xác nhận | Unknown |
| payment | Payment (thanh toán) | Giao dịch tiền cho đơn | Unknown |
| fulfilment | Fulfilment (xử lý và giao đơn) | Soạn, đóng gói, giao hàng | Unknown |
| return-request | Return / RMA (yêu cầu trả hàng) | Yêu cầu hoàn hàng sau mua | Unknown |
| refund | Refund (hoàn tiền) | Trả lại tiền cho khách | Unknown |
| benefit-restore | Benefit restoration (hoàn quyền lợi) | Trả lại mã / điểm đã dùng khi huỷ | Unknown |
| card-data | Cardholder data (dữ liệu thẻ) | Dữ liệu thẻ thanh toán chịu chuẩn PCI | https://www.pcisecuritystandards.org/ |
| idempotency | Idempotency (gửi lặp không đổi kết quả) | Gửi lại cùng yêu cầu không tạo bản ghi thứ hai | Unknown |

## 3. Trạng thái & vòng đời
| Mục | Thực thể | Các trạng thái (theo thứ tự) | Nguồn |
|---|---|---|---|
| order-lifecycle | Order | `<trạng thái A>` → `<trạng thái B>` → `<đã giao>` / `<đã huỷ>` | Unknown |
| payment-lifecycle | Payment | `<chờ>` → `<đã thu>` → `<hoàn một phần>` / `<hoàn toàn bộ>` | Unknown |
| fulfilment-lifecycle | Fulfilment | `<chờ soạn>` → `<đang giao>` → `<đã giao>` / `<giao thất bại>` | Unknown |
| return-lifecycle | Return | `<đã yêu cầu>` → `<đã nhận hàng>` → `<đã hoàn tiền>` | Unknown |
| reservation-lifecycle | Reservation | `<đang giữ>` → `<đã chốt>` / `<hết hạn>` / `<đã nhả>` | Unknown |
