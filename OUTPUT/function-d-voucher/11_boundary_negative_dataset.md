# BOUNDARY & NEGATIVE DATASET — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `boundary-negative-dataset.md`
> **Nguồn đối chiếu**: `09_data_class_map.md`, `05_test_case_spec.md`, `07b_ui_locator_map.md` §2–§4, `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md`, `spec_function_d_addendum_02_environment_shipping.md`
> **Phiên bản**: v2 (2026-09-30) — thay thế bản cũ có mốc tiền không tạo được (199.000 / 201.000 / 299.000 / 301.000 / 499.000 / 501.000 ₫), phí ship 30.000 ₫ sai cho đơn ≥ 200.000 ₫ và 2 record kiểm thử API.

**Quy ước áp dụng**
- Số tiền ghi đủ, không viết tắt `k` (`knowledge/_project.md` §2).
- Phí ship: `30.000 ₫`, **miễn phí khi tiền hàng từ `200.000 ₫` trở lên** (Phụ lục 02 S-02).
- Mọi giá sản phẩm là bội số `10.000 ₫` ➔ `min-1` / `min+1` của biên tiền là **mốc gần nhất tạo được** (bước `10.000 ₫`), kèm tổ hợp giỏ hàng để tái hiện.
- **Không có API** (Phụ lục 02 E-04) ➔ đã loại `DS-NEG-03` (payload `null`) và `DS-NEG-11` (tiền hàng âm qua API). Không tái sử dụng 2 mã này.

---

## 1. Bảng Dataset Biên & Phủ Định

### 1.1. Biên tiền hàng

| Record ID | Mã nhập | Giỏ hàng | Tiền hàng | Phí ship | Mốc | Mục đích | Trace | Kết quả kỳ vọng |
|---|---|---|---|---|---|---|---|---|
| `DS-BND-01` | `GIAM50K` | `prod-005` × 1 | 190.000 ₫ | 30.000 ₫ | min-1 (sàn 200.000 ₫) | Dưới mức sàn voucher, cũng dưới ngưỡng freeship | `BR-10`, `MR-03`, `BR-09` | Từ chối: "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 190.000 ₫)." · Giảm 0 ₫ · Tổng 220.000 ₫ |
| `DS-BND-02` | `GIAM50K` | `prod-003` × 1 | 200.000 ₫ | 0 ₫ | min (sàn) | Đúng mức sàn voucher = đúng ngưỡng freeship | `BR-10`, `BR-09` | Áp thành công · Giảm 50.000 ₫ · Tổng 150.000 ₫ |
| `DS-BND-03` | `GIAM50K` | `prod-006` × 2 | 240.000 ₫ | 0 ₫ | min+1 (sàn) | Trên mức sàn, mốc gần nhất tạo được | `BR-10` | Áp thành công · Giảm 50.000 ₫ · Tổng 190.000 ₫ |
| `DS-BND-04` | `SALE20` | `prod-004` × 1 | 280.000 ₫ | 0 ₫ | min-1 (SALE20 300.000 ₫) | Đạt sàn chung nhưng dưới mức riêng của SALE20 | `BR-02` | Từ chối: "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 280.000 ₫)." · Tổng 280.000 ₫ |
| `DS-BND-05` | `SALE20` | `prod-001` × 2 | 300.000 ₫ | 0 ₫ | min (SALE20) | Đúng mức tối thiểu SALE20 | `BR-02` | Giảm 60.000 ₫ · Tổng 240.000 ₫ |
| `DS-BND-06` | `SALE20` | `prod-005` × 1 + `prod-006` × 1 | 310.000 ₫ | 0 ₫ | min+1 (SALE20) | Trên mức tối thiểu SALE20 | `BR-02` | Giảm 62.000 ₫ · Tổng 248.000 ₫ |
| `DS-BND-07` | `SALE20` | `prod-001` × 2 + `prod-005` × 1 | 490.000 ₫ | 0 ₫ | max-1 (trần 100.000 ₫ chạm tại 500.000 ₫) | Dưới điểm chạm trần | `BR-07` | Giảm 98.000 ₫ · Tổng 392.000 ₫ |
| `DS-BND-08` | `SALE20` | `prod-001` × 1 + `prod-002` × 1 | 500.000 ₫ | 0 ₫ | max | Đúng điểm chạm trần | `BR-07` | Giảm 100.000 ₫ · Tổng 400.000 ₫ |
| `DS-BND-09` | `SALE20` | `prod-003` × 1 + `prod-005` × 1 + `prod-006` × 1 | 510.000 ₫ | 0 ₫ | max+1 | Vượt điểm chạm trần (20% = 102.000 ₫) | `BR-07` | Giảm bị chặn 100.000 ₫ · Tổng 410.000 ₫ |

### 1.2. Biên độ dài mã (giỏ hàng `prod-002` × 1 = 350.000 ₫, phí ship 0 ₫)

| Record ID | Mã nhập | Độ dài | Mốc | Trace | Kết quả kỳ vọng (Phụ lục 01) |
|---|---|:---:|---|---|---|
| `DS-BND-10` | `V1` | 2 | min-1 | `BR-06`, `MR-01` | "Mã giảm giá không đúng định dạng." |
| `DS-BND-11` | `V03` | 3 | min | `BR-06`, `MR-01` | Qua kiểm tra định dạng ➔ "Mã giảm giá \"V03\" không tồn tại trên hệ thống." |
| `DS-BND-12` | `SG10` | 4 | min+1 | `BR-06`, `MR-01` | Qua kiểm tra định dạng ➔ "... \"SG10\" không tồn tại trên hệ thống." |
| `DS-BND-13` | `VOUCHERGIAM20K2026V` | 19 | max-1 | `BR-06`, `MR-01` | Qua kiểm tra định dạng ➔ báo không tồn tại |
| `DS-BND-14` | `VOUCHERGIAM20K2026VN` | 20 | max | `BR-06`, `MR-01` | Qua kiểm tra định dạng ➔ báo không tồn tại |
| `DS-BND-15` | `VOUCHERGIAM20K2026VNA` | 21 | max+1 | `BR-06`, `MR-01` | Ô nhập chỉ nhận 20 ký tự đầu `VOUCHERGIAM20K2026VN` |

### 1.3. Phủ định, rỗng, ký tự đặc biệt (giỏ hàng `prod-002` × 1 = 350.000 ₫, phí ship 0 ₫, trừ khi ghi khác)

| Record ID | Mã nhập | Loại | Mục đích | Trace | Kết quả kỳ vọng |
|---|---|---|---|---|---|
| `DS-NEG-01` | `""` | Null/Empty | Bấm Áp dụng khi chưa nhập | `BR-06` | "Vui lòng nhập mã khuyến mãi." |
| `DS-NEG-02` | `"   "` | Null/Empty | Chỉ nhập khoảng trắng | `BR-06` | Sau khi bỏ khoảng trắng còn rỗng ➔ "Vui lòng nhập mã khuyến mãi." |
| `DS-NEG-04` | `HETHAN` | Invalid | Mã đã hết hạn | `BR-03` | "Mã giảm giá \"HETHAN\" đã hết hạn sử dụng." |
| `DS-NEG-05` | `SAI123` | Invalid | Mã không có trong hệ thống | `BR-05` | "Mã giảm giá \"SAI123\" không tồn tại trên hệ thống." |
| `DS-NEG-06` | `GIAM 50K` | Invalid format | Khoảng trắng giữa chuỗi | `BR-06`, `MR-01` | "Mã giảm giá không đúng định dạng." |
| `DS-NEG-07` | `VCHR@#$%!` | Special | Ký tự đặc biệt | `MR-01` | "Mã giảm giá không đúng định dạng." |
| `DS-NEG-08` | `<script>alert(1)</script>` | Special (XSS) | Chèn script | `BR-05`, `MR-01` | Không bật hộp thoại, không render thẻ HTML · "Mã giảm giá không đúng định dạng." |
| `DS-NEG-09` | `' OR '1'='1` | Special (SQLi) | Chuỗi SQL độc hại | `BR-05`, `MR-01` | Giao diện không lỗi · "Mã giảm giá không đúng định dạng." |
| `DS-NEG-10` | `GIAM50K` | Null/Empty | Giỏ hàng trống (tiền hàng 0 ₫, phí ship 0 ₫) | `BR-10` | [GIẢ ĐỊNH – LOW: form voucher vẫn hiển thị khi giỏ trống] "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 0 ₫)." |
| `DS-NEG-12` | `SALE🎉` | Special (emoji) | Emoji trong mã | `MR-01` | "Mã giảm giá không đúng định dạng." |
| `DS-NEG-13` | `GIAM50K` | Invalid | Giỏ `prod-001` × 1 = 150.000 ₫, phí ship 30.000 ₫ | `BR-10` | Từ chối: "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 150.000 ₫)." · Tổng 180.000 ₫ |

> ⚠️ Các record `DS-BND-10`, `DS-NEG-06`, `07`, `08`, `09`, `12` và `DS-BND-15` kỳ vọng theo Phụ lục 01. FE Live hiện **chưa** kiểm tra định dạng (`knowledge` Mục 8 #20) ➔ dự kiến FAIL và lập defect.

---

## 2. Đối Chiếu Độ Phủ Chuỗi Biên

| Tên Field | `min-1` | `min` | `min+1` | `max-1` | `max` | `max+1` | Rỗng | Sai format | Ký tự lạ / Payload |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`voucher_code` (độ dài 3–20)** | `DS-BND-10` | `DS-BND-11` | `DS-BND-12` | `DS-BND-13` | `DS-BND-14` | `DS-BND-15` | `DS-NEG-01`, `DS-NEG-02` | `DS-NEG-06` | `DS-NEG-07`, `08`, `09`, `12` |
| **`order_subtotal` (sàn 200.000 ₫)** | `DS-BND-01` (190.000 ₫) | `DS-BND-02` | `DS-BND-03` (240.000 ₫) | N/A — không có trần đơn (`GAP-D2`) | N/A | N/A | `DS-NEG-10` (0 ₫) | N/A — tiền hàng do hệ thống tính, không nhập tay | N/A |
| **`order_subtotal` (SALE20 300.000 ₫)** | `DS-BND-04` (280.000 ₫) | `DS-BND-05` | `DS-BND-06` (310.000 ₫) | N/A | N/A | N/A | N/A — đã phủ ở sàn chung | N/A | N/A |
| **`order_subtotal` (trần giảm 100.000 ₫)** | N/A | N/A | N/A | `DS-BND-07` (490.000 ₫) | `DS-BND-08` | `DS-BND-09` (510.000 ₫) | N/A | N/A | N/A |
| **`shipping_fee` (freeship từ 200.000 ₫)** | `DS-BND-01` (190.000 ₫ ➔ 30.000 ₫) | `DS-BND-02` (200.000 ₫ ➔ 0 ₫) | `DS-BND-03` (240.000 ₫ ➔ 0 ₫) | N/A | N/A | N/A | `DS-NEG-10` (giỏ trống ➔ 0 ₫) | N/A — không nhập tay | N/A |

---

## 3. Export Dữ Liệu Biên (JSON)

```json
[
  {"record_id": "DS-BND-01", "voucher_code": "GIAM50K", "cart": {"prod-005": 1}, "subtotal": 190000, "shipping_fee": 30000, "expected_status": "REJECTED", "discount": 0, "total_payment": 220000, "expected_message": "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 190.000 ₫)."},
  {"record_id": "DS-BND-02", "voucher_code": "GIAM50K", "cart": {"prod-003": 1}, "subtotal": 200000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 50000, "total_payment": 150000},
  {"record_id": "DS-BND-03", "voucher_code": "GIAM50K", "cart": {"prod-006": 2}, "subtotal": 240000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 50000, "total_payment": 190000},
  {"record_id": "DS-BND-04", "voucher_code": "SALE20", "cart": {"prod-004": 1}, "subtotal": 280000, "shipping_fee": 0, "expected_status": "REJECTED", "discount": 0, "total_payment": 280000, "expected_message": "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 280.000 ₫)."},
  {"record_id": "DS-BND-05", "voucher_code": "SALE20", "cart": {"prod-001": 2}, "subtotal": 300000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 60000, "total_payment": 240000},
  {"record_id": "DS-BND-06", "voucher_code": "SALE20", "cart": {"prod-005": 1, "prod-006": 1}, "subtotal": 310000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 62000, "total_payment": 248000},
  {"record_id": "DS-BND-07", "voucher_code": "SALE20", "cart": {"prod-001": 2, "prod-005": 1}, "subtotal": 490000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 98000, "total_payment": 392000},
  {"record_id": "DS-BND-08", "voucher_code": "SALE20", "cart": {"prod-001": 1, "prod-002": 1}, "subtotal": 500000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 100000, "total_payment": 400000},
  {"record_id": "DS-BND-09", "voucher_code": "SALE20", "cart": {"prod-003": 1, "prod-005": 1, "prod-006": 1}, "subtotal": 510000, "shipping_fee": 0, "expected_status": "ACCEPTED", "discount": 100000, "total_payment": 410000},
  {"record_id": "DS-BND-10", "voucher_code": "V1", "expected_status": "FORMAT_ERROR", "expected_message": "Mã giảm giá không đúng định dạng."},
  {"record_id": "DS-BND-15", "voucher_code": "VOUCHERGIAM20K2026VNA", "expected_status": "TRUNCATED", "expected_input_value": "VOUCHERGIAM20K2026VN"},
  {"record_id": "DS-NEG-01", "voucher_code": "", "expected_status": "VALIDATION_ERROR", "expected_message": "Vui lòng nhập mã khuyến mãi."},
  {"record_id": "DS-NEG-04", "voucher_code": "HETHAN", "expected_status": "BUSINESS_ERROR", "expected_message": "Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."},
  {"record_id": "DS-NEG-07", "voucher_code": "VCHR@#$%!", "expected_status": "FORMAT_ERROR", "expected_message": "Mã giảm giá không đúng định dạng."},
  {"record_id": "DS-NEG-13", "voucher_code": "GIAM50K", "cart": {"prod-001": 1}, "subtotal": 150000, "shipping_fee": 30000, "expected_status": "REJECTED", "discount": 0, "total_payment": 180000}
]
```

---

## 4. Chốt Chặn Nghiệm Thu
- [x] Mọi mốc tiền tạo được từ catalog thật, có tổ hợp giỏ hàng đi kèm.
- [x] Phí ship tính đúng Phụ lục 02 S-02 (miễn phí từ 200.000 ₫).
- [x] Không còn record kiểm thử API/HTTP (Phụ lục 02 E-04).
- [x] Số tiền ghi đủ, không viết tắt `k`.
- [x] Bảng đối chiếu độ phủ không có ô trống, mỗi `N/A` có lý do.
- [x] Tổng: **15 record biên** + **11 record phủ định** = 26 record.
