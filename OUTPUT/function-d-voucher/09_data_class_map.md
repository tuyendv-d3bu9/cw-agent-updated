# DATA CLASS MAP — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `data-class-map.md`
> **Nguồn đối chiếu**: `01_requirement_risk_summary.md`, `knowledge/features/function-d-voucher.md`, `07b_ui_locator_map.md`, `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md`, `spec_function_d_addendum_02_environment_shipping.md`
> **Phiên bản**: v2 (2026-09-30) — mốc tiền theo catalog thật, bỏ mã/phí ship/trạng thái không tồn tại trên web, không có trường API.
> **Tuân thủ**: Chuẩn FACT, 5 Data Classes. Số tiền ghi đủ, không viết tắt `k`.

---

## 1. Field Map

| # | Field | Kiểu dữ liệu | Trace | Data Class | Mốc biên & ràng buộc |
|---|---|---|---|---|---|
| 1 | `voucher_code` | String | `BR-01`, `BR-03`, `BR-05`, `BR-06`, `MR-01` | Valid · Boundary · Invalid · Null/Empty · Special | • **Độ dài 3–20** (Phụ lục 01 F-01): 2 (`V1`) · 3 (`V03`) · 4 (`SG10`) · 19 · 20 · 21 ký tự.<br>• **Valid** (chỉ 2 mã còn hạn trên web): `GIAM50K`, `SALE20`; kèm biến thể chữ thường / khoảng trắng hai đầu.<br>• **Invalid**: không tồn tại (`SAI123`), hết hạn (`HETHAN`), khoảng trắng giữa (`GIAM 50K`).<br>• **Null/Empty**: `""`, `"   "`.<br>• **Special**: `VCHR@#$%!`, emoji `SALE🎉`, XSS `<script>alert(1)</script>`, SQLi `' OR '1'='1`. |
| 2 | `order_subtotal` | Tiền VNĐ (do hệ thống tính từ giỏ hàng) | `BR-02`, `BR-07`, `BR-10`, `MR-02`, `MR-03` | Valid · Boundary · Invalid · Null/Empty | Giá sản phẩm là bội số 10.000 ₫ ➔ mốc ±1 là **mốc gần nhất tạo được**.<br>• **Sàn 200.000 ₫**: 190.000 ₫ · 200.000 ₫ · 240.000 ₫.<br>• **Tối thiểu SALE20 300.000 ₫**: 280.000 ₫ · 300.000 ₫ · 310.000 ₫.<br>• **Trần giảm 100.000 ₫ (chạm tại 500.000 ₫)**: 490.000 ₫ · 500.000 ₫ · 510.000 ₫; vượt trần 600.000 ₫, 800.000 ₫.<br>• **Invalid**: 150.000 ₫ (dưới sàn).<br>• **Null/Empty**: giỏ trống 0 ₫.<br>• **Tiền lẻ**: không tạo được ➔ `VCHR-019` tạm đóng. Tiền âm: không tạo được qua giao diện, không có API ➔ không test. |
| 3 | `shipping_fee` | Tiền VNĐ (do hệ thống tính) | `BR-09` | Valid · Boundary | • 30.000 ₫ khi tiền hàng < 200.000 ₫; **0 ₫ khi tiền hàng từ 200.000 ₫ trở lên** hoặc giỏ trống (Phụ lục 02 S-02).<br>• Biên: 190.000 ₫ ➔ 30.000 ₫ · 200.000 ₫ ➔ 0 ₫.<br>• Voucher không trừ vào phí ship (S-03). |
| 4 | `discount_type` | Enum | `BR-01` | Valid | `FIXED_AMOUNT` (`GIAM50K`, `HETHAN`), `PERCENTAGE` (`SALE20`). Không có màn quản trị để tạo loại khác ➔ Invalid/Null: N/A. |
| 5 | `discount_value` | Số | `BR-01`, `BR-07` | Valid · Boundary | `GIAM50K` = 50.000 ₫; `SALE20` = 20%, trần 100.000 ₫; giảm không vượt tiền hàng. Không tạo được mã mới ➔ các giá trị 1% / 100% / âm: N/A. |
| 6 | `customer_account` | Email / phiên | Cổng xác thực | Valid · Null/Empty | • Valid: `khachhang@shopgo.vn`, `vip@shopgo.vn` / `123456`.<br>• Null/Empty: khách chưa đăng nhập ➔ bị chặn khi vào Thanh toán. |
| 7 | `voucher_status` | Suy ra từ cờ `expired` | `BR-03` | Valid · Invalid | Còn hạn (`GIAM50K`, `SALE20`) · hết hạn (`HETHAN`). Web không có hạn mức lượt dùng ➔ trạng thái "hết lượt": N/A (`VCHR-032`, `033` ngoài phạm vi). |

---

## 2. Field Thiếu Rule — Đã Chốt

| Field | Nội dung | Quyết định | Trạng thái |
|---|---|---|---|
| `discount_value` | Có cho phép % thập phân? | Chỉ số nguyên (`knowledge` Mục 8 #8) | `Confirmed` 2026-09-27 |
| `order_subtotal` | Có trần giá trị đơn? | Không giới hạn (`knowledge` Mục 8 #9) | `Confirmed` 2026-09-27 |
| `voucher_code` | Độ dài, bộ ký tự | 3–20, `A–Z` `0–9` (Phụ lục 01, `knowledge` Mục 8 #20) | `Confirmed` 2026-09-30 |
| `shipping_fee` | Ngưỡng miễn phí | Từ 200.000 ₫ trở lên (Phụ lục 02, `knowledge` Mục 8 #21) | `Confirmed` 2026-09-30 |
| Tất cả | Có API / backend? | Không (Phụ lục 02 E-01, `knowledge` Mục 8 #22) | `Confirmed` 2026-09-30 |

---

## 3. Chốt Chặn Chất Lượng
- [x] Chỉ dùng mã, sản phẩm, phí ship có thật trên web.
- [x] Phủ đủ 5 Data Classes ở các field nhập được; field do hệ thống tính ghi rõ lý do `N/A`.
- [x] Chuỗi biên 6 mốc cho độ dài mã và 3 ngưỡng tiền.
- [x] Không còn trường / ca kiểm thử API.
