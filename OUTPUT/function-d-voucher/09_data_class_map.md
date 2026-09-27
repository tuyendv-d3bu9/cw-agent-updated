# DATA CLASS MAP — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `data-class-map.md`  
> **Nguồn đối chiếu**: `OUTPUT/function-d-voucher/01_requirement_risk_summary.md` & `knowledge/features/function-d-voucher.md`  
> **Tuân thủ**: Chuẩn FACT, Registry 5 Data Classes, Chặn rủi ro "Garbage Data -> Garbage Testing".

---

## 1. Field Map (Bản đồ phân loại dữ liệu theo Field)

| # | Field Name | Kiểu dữ liệu | Business Rule (Trace) | Data Class cần test | Mốc biên cần phủ & Ràng buộc cụ thể |
|---|---|---|---|---|---|
| 1 | `voucher_code` | String (Alphanumeric) | `BR-01`, `BR-03`, `BR-05`, `BR-06`, `MR-01` | **Valid**<br>**Boundary**<br>**Invalid**<br>**Null/Empty**<br>**Special** | • **Chuỗi biên độ dài `[3, 20]`**: min-1 = 2 ký tự (`V1`), min = 3 ký tự (`V03`), min+1 = 4 ký tự (`SG10`), max-1 = 19 ký tự (`VOUCHERGIAM20K2026V`), max = 20 ký tự (`VOUCHERGIAM20K2026VN`), max+1 = 21 ký tự (`VOUCHERGIAM20K2026VNA`).<br>• **Valid**: `GIAM50K`, `SALE20`, `VOUCHER10`, `FREESHIP`.<br>• **Invalid**: Không tồn tại (`SAI123`), hết hạn (`HETHAN`), có khoảng trắng giữa (`GIAM 50K`).<br>• **Null/Empty**: `""` (rỗng), `"   "` (chỉ có khoảng trắng).<br>• **Special**: Ký tự đặc biệt (`VCHR@#$`), XSS (`<script>alert(1)</script>`), SQLi (`' OR '1'='1`). |
| 2 | `order_subtotal` | Integer / Currency (VNĐ) | `BR-02`, `BR-10`, `MR-02`, `MR-03`, `MR-04` | **Valid**<br>**Boundary**<br>**Invalid**<br>**Null/Empty**<br>**Special** | • **Mức sàn toàn hệ thống (200.000 VNĐ)**:<br>  - min-1: 199.000 ₫ (Invalid)<br>  - min: 200.000 ₫ (Valid)<br>  - min+1: 201.000 ₫ (Valid)<br>• **Ngưỡng riêng voucher SALE20 (300.000 VNĐ)**:<br>  - min-1: 299.000 ₫ (Invalid cho SALE20)<br>  - min: 300.000 ₫ (Valid)<br>  - min+1: 301.000 ₫ (Valid)<br>• **Ngưỡng trần maxCap 100.000 VNĐ (với voucher 20%, điểm chạm 500.000 VNĐ)**:<br>  - max-1: 499.000 ₫ (giảm 99.800 ₫ - dưới trần)<br>  - max: 500.000 ₫ (giảm 100.000 ₫ - đúng trần)<br>  - max+1: 501.000 ₫ (giảm 100.000 ₫ - chạm trần)<br>  - max vượt: 600.000 ₫ (giảm 100.000 ₫ - vượt trần)<br>• **Làm tròn số lẻ**: 333.333 ₫ áp 20% giảm 66.666 ₫ (`floor`).<br>• **Invalid**: Âm (-50.000 ₫), 150.000 ₫ (dưới sàn).<br>• **Null/Empty**: 0 ₫. |
| 3 | `shipping_fee` | Integer / Currency (VNĐ) | `BR-09` | **Valid**<br>**Boundary**<br>**Invalid** | • **Valid**: 30.000 ₫ (phí giao hàng tiêu chuẩn), 50.000 ₫ (giao hỏa tốc), 0 ₫ (đơn freeship).<br>• **Boundary**: 0 ₫ (min), 30.000 ₫ (chuẩn).<br>• **Invalid**: Âm tiền (-10.000 ₫).<br>• **Ràng buộc**: Voucher tiền hàng KHÔNG chiết khấu trên `shipping_fee`. |
| 4 | `discount_type` | Enum (`FIXED_AMOUNT`, `PERCENTAGE`) | `BR-01` | **Valid**<br>**Invalid**<br>**Null/Empty** | • **Valid**: `FIXED_AMOUNT` (giảm tiền cố định), `PERCENTAGE` (giảm theo %).<br>• **Boundary**: Không áp dụng (Enum).<br>• **Invalid**: `TIERED`, `BUY_1_GET_1`, `GIFT`.<br>• **Null/Empty**: null. |
| 5 | `discount_value` | Number / Integer | `BR-01`, `BR-07` | **Valid**<br>**Boundary**<br>**Invalid** | • **Với FIXED_AMOUNT**: 20.000 ₫, 50.000 ₫.<br>• **Với PERCENTAGE**: 10%, 20%.<br>• **Boundary**: min % = 1%, max % = 100%; trần maxCap = 100.000 ₫.<br>• **Invalid**: -10%, 120%, -50.000 ₫. |
| 6 | `customer_account` | String (Email / Session) | Tiền điều kiện Web Live / Auth | **Valid**<br>**Invalid**<br>**Null/Empty** | • **Valid**: `khachhang@shopgo.vn`, `vip@shopgo.vn` (password: `123456`).<br>• **Invalid**: `guest_unregistered@shopgo.vn`.<br>• **Null/Empty**: Khách vãng lai (Guest - chưa đăng nhập) ➔ Chặn tại modal `#modal-auth`. |
| 7 | `voucher_status` | Enum (`ACTIVE`, `EXPIRED`, `DEPLETED`) | `BR-03`, `MR-06` | **Valid**<br>**Invalid** | • **Valid**: `ACTIVE` (đang có hiệu lực và còn lượt), `EXPIRED` (hết hạn `HETHAN`), `DEPLETED` (hết lượt dùng).<br>• **Invalid**: `DELETED`, `DRAFT`. |

---

## 2. Field thiếu rule — Cần Clarify

| Field | Thiếu gì | Giả định tạm | Câu hỏi cho BA/PO | Trạng thái |
|---|---|---|---|---|
| `discount_value` | Hệ thống có chấp nhận số % lẻ (ví dụ: 12.5%) không? | `[GIẢ ĐỊNH]` Hệ thống ShopGo chỉ áp dụng số nguyên phần trăm (Integer: 10%, 20%, 30%). | Xác nhận ShopGo có cho phép tạo mã giảm giá với số thập phân (vd: 7.5%, 12.5%) tại Back-office không? | Đã gắn nhãn `[GIẢ ĐỊNH]` |
| `order_subtotal` | Giới hạn đơn hàng tối đa (Max Order Amount) | `[GIẢ ĐỊNH]` Không giới hạn trần đơn hàng (hoặc max 500.000.000 VNĐ). | Đơn hàng mua sỉ trên 100 triệu VNĐ có được áp dụng mã voucher thông thường không? | Đã gắn nhãn `[GIẢ ĐỊNH]` |

---

## 3. Chốt chặn chất lượng (Quality Gates)
- [x] Kiểu dữ liệu & rule bám sát 100% FACT từ `01_requirement_risk_summary.md` và `knowledge/features/function-d-voucher.md`.
- [x] Phủ đủ 5 Data Classes: Valid, Boundary, Invalid, Null/Empty, Special.
- [x] Xác lập chi tiết chuỗi biên 6 mốc (`min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`) cho độ dài mã voucher và ngưỡng tiền đơn hàng.
- [x] Xuất bản file tại `OUTPUT/function-d-voucher/09_data_class_map.md`.
