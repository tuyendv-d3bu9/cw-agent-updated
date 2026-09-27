# BOUNDARY & NEGATIVE DATASET — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `boundary-negative-dataset.md`  
> **Nguồn đối chiếu**: `OUTPUT/function-d-voucher/09_data_class_map.md` & `05_test_case_spec.md`  
> **Tuân thủ**: Chuỗi biên 6 mốc (`min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`), Record có mục đích rõ ràng, 100% FACT.

---

## 1. Bảng Dataset Biên & Phủ Định (Boundary, Negative, Null, Special)

| Record ID | Voucher Code Input | Tiền hàng (`subtotal`) | Phí ship | Loại Data | Test Purpose (Mục đích kiểm thử cụ thể) | Trace Rule | Kết quả kỳ vọng (Pass Criteria) |
|---|---|---|---|---|---|---|---|
| `DS-BND-01` | `GIAM50K` | 199.000 ₫ | 30.000 ₫ | **Boundary (min-1)** | Kiểm tra đơn hàng dưới mức sàn hệ thống 1 đơn vị | `BR-10`, `MR-03` | Báo lỗi đơn hàng chưa đạt mức tối thiểu 200.000 ₫ |
| `DS-BND-02` | `GIAM50K` | 200.000 ₫ | 30.000 ₫ | **Boundary (min)** | Kiểm tra đơn hàng đạt đúng mức sàn hệ thống 200.000 ₫ | `BR-10` | Áp mã thành công, giảm 50.000 ₫, tổng 180.000 ₫ |
| `DS-BND-03` | `GIAM50K` | 201.000 ₫ | 30.000 ₫ | **Boundary (min+1)** | Kiểm tra đơn hàng trên mức sàn hệ thống 1 đơn vị | `BR-10` | Áp mã thành công, giảm 50.000 ₫, tổng 181.000 ₫ |
| `DS-BND-04` | `SALE20` | 299.000 ₫ | 30.000 ₫ | **Boundary (min-1)** | Kiểm tra đơn hàng dưới điều kiện mã SALE20 đúng 1 đơn vị | `BR-02` | Báo lỗi đơn hàng chưa đạt điều kiện tối thiểu 300.000 ₫ |
| `DS-BND-05` | `SALE20` | 300.000 ₫ | 30.000 ₫ | **Boundary (min)** | Kiểm tra đơn hàng đạt đúng ngưỡng điều kiện mã SALE20 | `BR-02` | Áp mã thành công, giảm 60.000 ₫, tổng 270.000 ₫ |
| `DS-BND-06` | `SALE20` | 301.000 ₫ | 30.000 ₫ | **Boundary (min+1)** | Kiểm tra đơn hàng vượt điều kiện mã SALE20 1 đơn vị | `BR-02` | Áp mã thành công, giảm 60.200 ₫, tổng 270.800 ₫ |
| `DS-BND-07` | `SALE20` | 499.000 ₫ | 30.000 ₫ | **Boundary (max-1)** | Kiểm tra chiết khấu 20% cận kề dưới mức trần maxCap 100k | `BR-07` | Áp mã thành công, giảm 99.800 ₫, tổng 429.200 ₫ |
| `DS-BND-08` | `SALE20` | 500.000 ₫ | 30.000 ₫ | **Boundary (max)** | Kiểm tra chiết khấu 20% chạm đúng trần tối đa maxCap 100k | `BR-07` | Áp mã thành công, giảm đúng 100.000 ₫, tổng 430.000 ₫ |
| `DS-BND-09` | `SALE20` | 501.000 ₫ | 30.000 ₫ | **Boundary (max+1)** | Kiểm tra chiết khấu 20% vượt trần 1 đơn vị (100.200 ₫) | `BR-07` | Chặn trần tại 100.000 ₫, tổng thanh toán 431.000 ₫ |
| `DS-BND-10` | `V1` | 350.000 ₫ | 30.000 ₫ | **Boundary (min-1)** | Độ dài mã ngắn hơn min 1 ký tự (2 ký tự < 3) | `BR-06` | Báo lỗi mã không hợp lệ / không đúng định dạng |
| `DS-BND-11` | `V03` | 350.000 ₫ | 30.000 ₫ | **Boundary (min)** | Độ dài mã đạt đúng biên dưới tối thiểu (3 ký tự) | `BR-06` | Chấp nhận format, xử lý tra cứu mã trên hệ thống |
| `DS-BND-12` | `SG10` | 350.000 ₫ | 30.000 ₫ | **Boundary (min+1)** | Độ dài mã trên biên dưới 1 ký tự (4 ký tự) | `BR-06` | Chấp nhận format hợp lệ |
| `DS-BND-13` | `VOUCHERGIAM20K2026V` | 350.000 ₫ | 30.000 ₫ | **Boundary (max-1)** | Độ dài mã dưới biên trên 1 ký tự (19 ký tự) | `BR-06` | Chấp nhận format hợp lệ |
| `DS-BND-14` | `VOUCHERGIAM20K2026VN` | 350.000 ₫ | 30.000 ₫ | **Boundary (max)** | Độ dài mã đạt đúng biên trên tối đa (20 ký tự) | `BR-06` | Chấp nhận format hợp lệ |
| `DS-BND-15` | `VOUCHERGIAM20K2026VNA` | 350.000 ₫ | 30.000 ₫ | **Boundary (max+1)** | Độ dài mã vượt quá biên trên 1 ký tự (21 ký tự) | `BR-06` | Chặn tại ô nhập hoặc báo lỗi vượt quá 20 ký tự |
| `DS-NEG-01` | `""` (Rỗng) | 350.000 ₫ | 30.000 ₫ | **Null/Empty** | Bấm Áp dụng khi chưa nhập bất kỳ ký tự nào | `BR-06` | Báo lỗi `"Vui lòng nhập mã khuyến mãi."` |
| `DS-NEG-02` | `"   "` (Khoảng trắng) | 350.000 ₫ | 30.000 ₫ | **Null/Empty** | Nhập chuỗi chỉ gồm ký tự trắng rồi bấm Áp dụng | `BR-06` | Cắt trim xong rỗng ➔ Báo `"Vui lòng nhập mã khuyến mãi."` |
| `DS-NEG-03` | `null` | 350.000 ₫ | 30.000 ₫ | **Null/Empty** | Payload API gửi trường voucher_code mang giá trị null | `BR-06` | API phản hồi HTTP 400 Bad Request |
| `DS-NEG-04` | `HETHAN` | 350.000 ₫ | 30.000 ₫ | **Invalid** | Nhập mã giảm giá đã quá thời hạn sử dụng | `BR-03` | Báo lỗi `"Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."` |
| `DS-NEG-05` | `SAI123` | 350.000 ₫ | 30.000 ₫ | **Invalid** | Nhập mã không có trong hệ thống ShopGo | `BR-05` | Báo lỗi `"Mã giảm giá \"SAI123\" không tồn tại trên hệ thống."` |
| `DS-NEG-06` | `GIAM 50K` | 350.000 ₫ | 30.000 ₫ | **Invalid** | Nhập mã chứa khoảng trắng ở giữa chuỗi ký tự | `BR-06`, `MR-01` | Chặn regex format, báo mã không hợp lệ |
| `DS-NEG-07` | `VCHR@#$%!` | 350.000 ₫ | 30.000 ₫ | **Special** | Nhập mã chứa các ký tự đặc biệt | `MR-01` | Chặn ký tự lạ theo rule `^[A-Z0-9]{3,20}$` |
| `DS-NEG-08` | `<script>alert(1)</script>` | 350.000 ₫ | 30.000 ₫ | **Special** | Tấn công chèn mã độc Cross-Site Scripting (XSS) | `BR-05` | Mã độc bị sanitize/escape, không thực thi script |
| `DS-NEG-09` | `' OR '1'='1` | 350.000 ₫ | 30.000 ₫ | **Special** | Tấn công câu lệnh độc hại SQL Injection | `BR-05` | Chặn truy vấn độc hại, hệ thống an toàn |
| `DS-NEG-10` | `GIAM50K` | 0 ₫ | 30.000 ₫ | **Null/Empty** | Giỏ hàng 0 đồng (chưa có sản phẩm) cố tình gọi áp mã | `BR-02`, `BR-10` | Báo lỗi giỏ hàng không đủ điều kiện |
| `DS-NEG-11` | `GIAM50K` | -50.000 ₫ | 30.000 ₫ | **Invalid** | Giá trị đơn hàng âm gửi qua API | `BR-10` | API chặn kiểm thực dữ liệu, HTTP 422 / 400 |

---

## 2. Đối Chiếu Độ Phủ Chuỗi Biên (Boundary Completeness Matrix)

> Tuân thủ quy định: Không để trống bất kỳ ô nào; ghi rõ mã Record, `N/A` kèm lý do hoặc `CHƯA PHỦ`.

| Tên Field | `min-1` | `min` | `min+1` | `max-1` | `max` | `max+1` | Rỗng (`""`) | Sai format | Ký tự lạ / Payload |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **`voucher_code` (Độ dài chuỗi)** | `DS-BND-10` (2 kí tự) | `DS-BND-11` (3 kí tự) | `DS-BND-12` (4 kí tự) | `DS-BND-13` (19 kí tự) | `DS-BND-14` (20 kí tự) | `DS-BND-15` (21 kí tự) | `DS-NEG-01`, `DS-NEG-02` | `DS-NEG-06` (space giữa) | `DS-NEG-07`, `DS-NEG-08`, `DS-NEG-09` |
| **`order_subtotal` (Sàn hệ thống 200k)** | `DS-BND-01` (199.000 ₫) | `DS-BND-02` (200.000 ₫) | `DS-BND-03` (201.000 ₫) | N/A (Áp dụng trần riêng) | N/A (Áp dụng trần riêng) | N/A (Áp dụng trần riêng) | `DS-NEG-10` (0 ₫) | `DS-NEG-11` (âm tiền) | N/A (Field kiểu số) |
| **`order_subtotal` (Ngưỡng riêng mã SALE20 300k)** | `DS-BND-04` (299.000 ₫) | `DS-BND-05` (300.000 ₫) | `DS-BND-06` (301.000 ₫) | N/A | N/A | N/A | N/A (Đã có ở sàn chung) | N/A | N/A |
| **`order_subtotal` (Trần giảm maxCap 100k - chạm tại 500k)** | N/A | N/A | N/A | `DS-BND-07` (499.000 ₫) | `DS-BND-08` (500.000 ₫) | `DS-BND-09` (501.000 ₫) | N/A | N/A | N/A |
| **`shipping_fee` (Phí ship)** | N/A (Phí ship min = 0 ₫) | `DS-VAL-07` (0 ₫) | `DS-VAL-01` (30.000 ₫) | N/A | N/A | N/A | N/A (Hệ thống default 30k) | Âm ship (N/A) | N/A |

---

## 3. Export Dữ Liệu Biên (JSON Format)

```json
[
  {
    "record_id": "DS-BND-01",
    "type": "boundary_min_minus_1",
    "voucher_code": "GIAM50K",
    "subtotal": 199000,
    "expected_status": "REJECTED",
    "expected_message": "Đơn hàng chưa đạt giá trị tối thiểu 200.000 đ"
  },
  {
    "record_id": "DS-BND-02",
    "type": "boundary_min",
    "voucher_code": "GIAM50K",
    "subtotal": 200000,
    "expected_status": "ACCEPTED",
    "discount": 50000,
    "total_payment": 180000
  },
  {
    "record_id": "DS-BND-08",
    "type": "boundary_max_cap",
    "voucher_code": "SALE20",
    "subtotal": 500000,
    "expected_status": "ACCEPTED",
    "discount": 100000,
    "total_payment": 430000
  },
  {
    "record_id": "DS-NEG-01",
    "type": "empty_input",
    "voucher_code": "",
    "subtotal": 350000,
    "expected_status": "VALIDATION_ERROR",
    "expected_message": "Vui lòng nhập mã khuyến mãi."
  },
  {
    "record_id": "DS-NEG-04",
    "type": "expired_voucher",
    "voucher_code": "HETHAN",
    "subtotal": 350000,
    "expected_status": "BUSINESS_ERROR",
    "expected_message": "Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."
  },
  {
    "record_id": "DS-NEG-07",
    "type": "special_characters",
    "voucher_code": "VCHR@#$%",
    "subtotal": 350000,
    "expected_status": "FORMAT_ERROR",
    "expected_message": "Mã không đúng định dạng."
  }
]
```

---

## 4. Chốt Chặn Nghiệm Thu (Quality Gates)
- [x] Phủ trọn vẹn chuỗi biên 6 mốc (`min-1`, `min`, `min+1`, `max-1`, `max`, `max+1`) cho cả giá trị đơn hàng và độ dài ký tự voucher.
- [x] Mỗi bản ghi đều có `Test Purpose` rõ ràng, định rõ điều kiện kiểm tra Pass/Fail.
- [x] Bảng đối chiếu độ phủ chuỗi biên không có ô nào để trống.
- [x] Xuất bản tại `OUTPUT/function-d-voucher/11_boundary_negative_dataset.md`.
