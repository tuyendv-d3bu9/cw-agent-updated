# FUNCTION-D — Feature Knowledge

Feature slug: `function-d` · Nguồn: `INPUT/function-d/02_ba/spec-function-d.md`, `INPUT/function-d/05_communication/h-thng-thng-mi-in-t-shopgo.md` · Cập nhật: `2026-09-20` · Trạng thái: `IN-REVIEW`

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)

Function D cho phép khách hàng nhập voucher tại trang Thanh toán ShopGo để hệ thống xác minh và áp dụng giảm giá vào tổng đơn hàng.

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân | Quyền hạn trong tính năng | Điều kiện tiên quyết |
|---|---|---|
| Khách hàng tại Việt Nam | Nhập và yêu cầu áp dụng voucher tại trang Thanh toán | Có đơn hàng ở trang Thanh toán; đăng nhập/eligibility chưa xác nhận |
| Hệ thống ShopGo | Kiểm tra voucher và cập nhật/hiển thị kết quả | Có dữ liệu voucher và đơn hàng |
| CSKH / Admin | Được nêu là quản lý voucher ở back-office; chi tiết không thuộc Function D | [CONTEXT_MISSING] |

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)

| ID | Tóm tắt quy tắc | Chi tiết điều kiện & hành vi | Căn cứ nguồn | Trạng thái |
|---|---|---|---|---|
| BR-01 | Điểm thao tác voucher | Tại Thanh toán có ô “Mã giảm giá” và nút “Áp dụng”; bấm để kiểm tra và áp dụng giảm giá vào tổng đơn hàng. | `spec-function-d.md`, Vị trí/Hành động | Confirmed |
| BR-02 | Loại voucher | Có voucher giảm theo % và giảm số tiền cố định VND. | `spec-function-d.md`, Các quy tắc đã nêu | Confirmed |
| BR-03 | Giá trị đơn tối thiểu | Chỉ dùng voucher khi đơn hàng đạt giá trị tối thiểu được quy định bởi mã. | `spec-function-d.md`, Các quy tắc đã nêu | Confirmed |
| BR-04 | Thời hạn | Mỗi voucher có ngày hết hạn. | `spec-function-d.md`, Các quy tắc đã nêu | Confirmed |
| BR-05 | Kết quả thành công | Hiển thị số tiền được giảm và tổng tiền mới. | `spec-function-d.md`, Các quy tắc đã nêu | Confirmed |
| BR-06 | Kết quả mã lỗi | Voucher không hợp lệ hoặc hết hạn phải hiển thị thông báo lỗi. | `spec-function-d.md`, Các quy tắc đã nêu | Confirmed |
| BR-07 | Ngữ cảnh hiển thị | ShopGo hỗ trợ desktop/mobile web, tiếng Việt và VNĐ. | `spec-function-d.md`, Bối cảnh chức năng | Confirmed |
| BR-08 | Trần giảm tối đa | Trần giảm tối đa là 50.000 VNĐ; số tiền giảm làm tròn đến số VNĐ gần nhất. | User clarification, 2026-09-20 | Confirmed |
| BR-09 | Min order | Giá trị đơn tối thiểu để áp voucher là 200.000 VNĐ. | User clarification, 2026-09-20 | Confirmed |
| BR-10 | Số voucher mỗi đơn | Mỗi đơn hàng chỉ dùng một voucher. | User clarification, 2026-09-20 | Confirmed |
| BR-11 | Xác thực | Người dùng phải đăng nhập để truy cập giỏ hàng, áp mã và mua hàng. | User clarification, 2026-09-20 | Confirmed |
| BR-12 | Hiệu lực voucher | Voucher hết hiệu lực khi hết lượt dùng; thời gian đánh giá theo giờ Việt Nam; voucher hiện tại chưa hết lượt. | User clarification, 2026-09-20 | Confirmed |
| BR-13 | Thông điệp lỗi | Thông điệp lỗi là hành vi lấy từ website; website có 3 mã cố định để kiểm thử. | User clarification, 2026-09-20 | Confirmed |

## 4. LUỒNG CHÍNH (HAPPY PATH)

1. Khách ở trang Thanh toán có tổng đơn hàng.
2. Khách nhập mã vào ô “Mã giảm giá” và bấm “Áp dụng”.
3. Hệ thống kiểm tra voucher, điều kiện đơn hàng và thời hạn.
4. Nếu hợp lệ, hệ thống hiển thị tiền giảm và tổng tiền mới.

## 5. LUỒNG NGOẠI LỆ & LỖI (ALTERNATE & ERROR FLOWS)

- Voucher không hợp lệ: hiển thị thông báo lỗi.
- Voucher hết hạn: hiển thị thông báo lỗi.
- Đơn chưa đạt giá trị tối thiểu: hành vi/thông báo cụ thể chưa được tài liệu nêu (MR-03).

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)

- Chi tiết back-office quản trị voucher, native mobile app, load test và chi tiết ERP/kho theo tài liệu tổng quan ShopGo.
- Các rule voucher chưa có trong spec là **chưa xác định**, không mặc định out-of-scope.

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)

| ID | Mô tả kẽ hở | Nhóm 06W | Rủi ro | Câu hỏi cho BA/PO | Trạng thái |
|---|---|---|---|---|---|
| MR-01 | Định dạng/normalize input voucher | W1 | MED | Độ dài, ký tự, rỗng, trim, hoa/thường? | Treo — website sẽ được dùng làm baseline hiện tại, chưa có rule BA |
| MR-02 | Thông điệp và trạng thái UI cho mã lỗi | W1 | MED | Nội dung lỗi, giữ/xóa input? | Confirmed cho website hiện tại — User clarification, 2026-09-20 |
| MR-03 | Hành vi khi chưa đạt min order | W2 | HIGH | Thông báo và tổng tiền có giữ nguyên? | Confirmed cho min order 200.000 VNĐ; thông điệp lấy từ website — User clarification, 2026-09-20 |
| MR-04 | Thay/gỡ hoặc áp lại voucher | W2 | HIGH | Một đơn áp bao nhiêu mã; thay thế/gỡ thế nào? | Confirmed: một đơn dùng một voucher — User clarification, 2026-09-20 |
| MR-05 | Công thức %, VND, trần và làm tròn | W3 | HIGH | Công thức, cap và làm tròn VNĐ? | Confirmed: cap 50.000 VNĐ, rounding nearest VND — User clarification, 2026-09-20 |
| MR-06 | Cơ sở tính min order/phạm vi áp dụng | W3 | HIGH | Subtotal/ship/tax/discount khác và eligible items? | Confirmed một phần: min order 200.000 VNĐ; cơ sở tính/phạm vi hàng còn treo |
| MR-07 | Expiry/re-validation theo thời điểm | W4 | HIGH | Timezone, cutoff và recheck trước đặt hàng? | Confirmed một phần: hết lượt dùng, giờ Việt Nam, voucher hiện tại chưa hết; re-validation còn treo |
| MR-08 | Eligibility theo actor/usage limit | W5 | HIGH | Guest/Customer, per-user và total-use rules? | Confirmed một phần: phải đăng nhập; limit cụ thể còn treo |
| MR-09 | Side-effect/rollback sau áp voucher | W6 | HIGH | Thành phần cập nhật và cách gỡ/rollback? | Treo — website sẽ được quan sát làm baseline, chưa có rule BA |
| MR-10 | Voucher bị đổi/thu hồi khi checkout | W5/W6 | MED | Lần áp/đặt hàng xử lý thế nào? | Treo |

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)

Chưa có giả định nào được BA/PO xác nhận.

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)

| Hằng số | Kiểu | Giá trị | Phạm vi | Ghi chú |
|---|---|---|---|---|
| Currency | Tiền tệ | VNĐ | Hiển thị/thanh toán ShopGo | Theo spec và `knowledge/_project.md` |
| UI language | Chuỗi | Tiếng Việt | Function D | Theo spec |
| Voucher type | Enum | `%`, `VND` | Voucher | Theo BR-02 |
| Min order | Tiền tệ | 200.000 VNĐ | Áp voucher | Theo BR-09 |
| Max discount cap | Tiền tệ | 50.000 VNĐ | Voucher | Theo BR-08 |
| Timezone | Timezone | Asia/Ho_Chi_Minh (GMT+7) | Hiệu lực voucher | Theo BR-12 |

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| Mã Rule | Căn cứ tài liệu gốc | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|
| BR-01 | `INPUT/function-d/02_ba/spec-function-d.md`, Vị trí/Hành động | CHƯA COVER | Cập nhật sau Test Case Generation |
| BR-02 | `INPUT/function-d/02_ba/spec-function-d.md`, Các quy tắc đã nêu | CHƯA COVER |  |
| BR-03 | `INPUT/function-d/02_ba/spec-function-d.md`, Các quy tắc đã nêu | CHƯA COVER |  |
| BR-04 | `INPUT/function-d/02_ba/spec-function-d.md`, Các quy tắc đã nêu | CHƯA COVER |  |
| BR-05 | `INPUT/function-d/02_ba/spec-function-d.md`, Các quy tắc đã nêu | CHƯA COVER |  |
| BR-06 | `INPUT/function-d/02_ba/spec-function-d.md`, Các quy tắc đã nêu | CHƯA COVER |  |
| BR-07 | `INPUT/function-d/02_ba/spec-function-d.md`, Bối cảnh chức năng | CHƯA COVER |  |
