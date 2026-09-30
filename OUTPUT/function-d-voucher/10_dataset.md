# REALISTIC DATASET — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `dataset-generation.md`
> **Nguồn đối chiếu**: `09_data_class_map.md`, `07b_ui_locator_map.md` §2–§3, `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_02_environment_shipping.md`
> **Phiên bản**: v2 (2026-09-30) — bỏ mã `VOUCHER10` (không tồn tại trên web), tạm đóng record tiền lẻ 333.333 ₫, bổ sung tổ hợp giỏ hàng cho từng record.
> **Quy ước FACT**: Tiền VNĐ ghi đủ số (không viết tắt `k`); phí ship 30.000 ₫, **miễn phí khi tiền hàng từ 200.000 ₫ trở lên**; `Tổng = Tiền hàng + Phí ship − Giảm giá`.

---

## 1. Bảng Dataset Sát Nghiệp Vụ

| Record ID | Tài khoản | Mã nhập | Mã thực tế | Loại mã | Giỏ hàng | Tiền hàng | Phí ship | Giảm giá | Tổng thanh toán | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|---|
| `DS-VAL-01` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | `prod-002` × 1 | 350.000 ₫ | 0 ₫ | 50.000 ₫ | 300.000 ₫ | Happy path mã tiền cố định |
| `DS-VAL-02` | `vip@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | `prod-001` × 2 | 300.000 ₫ | 0 ₫ | 60.000 ₫ | 240.000 ₫ | Đúng mức tối thiểu SALE20 |
| `DS-VAL-03` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | `prod-001` × 3 | 450.000 ₫ | 0 ₫ | 90.000 ₫ | 360.000 ₫ | 20% dưới trần |
| `DS-VAL-04` | `vip@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | `prod-001` × 1 + `prod-002` × 1 | 500.000 ₫ | 0 ₫ | 100.000 ₫ | 400.000 ₫ | Chạm đúng trần 100.000 ₫ |
| `DS-VAL-05` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | `prod-003` × 4 | 800.000 ₫ | 0 ₫ | 100.000 ₫ | 700.000 ₫ | Vượt trần, chặn ở 100.000 ₫ |
| `DS-VAL-06` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | `prod-003` × 1 | 200.000 ₫ | 0 ₫ | 50.000 ₫ | 150.000 ₫ | Đúng mức sàn 200.000 ₫ |
| `DS-VAL-07` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | `prod-004` × 1 | 280.000 ₫ | 0 ₫ | 50.000 ₫ | 230.000 ₫ | Đơn thứ hai của ca 2 tab (`VCHR-036`) |
| `DS-VAL-08` | `khachhang@shopgo.vn` | `giam50k` | `GIAM50K` | `FIXED_AMOUNT` | `prod-003` × 2 | 400.000 ₫ | 0 ₫ | 50.000 ₫ | 350.000 ₫ | Tự chuyển chữ hoa |
| `DS-VAL-09` | `vip@shopgo.vn` | `  SALE20  ` | `SALE20` | `PERCENTAGE` | `prod-002` × 1 | 350.000 ₫ | 0 ₫ | 70.000 ₫ | 280.000 ₫ | Tự bỏ khoảng trắng hai đầu |
| `DS-VAL-10` | — | — | — | — | — | — | — | — | — | ⏸️ **TẠM ĐÓNG** — tiền lẻ để kiểm làm tròn không tạo được trên catalog (`knowledge` Mục 8 #15). Không dùng trong CSV/JSON |
| `DS-VAL-11` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | `prod-001` × 4 | 600.000 ₫ | 0 ₫ | 100.000 ₫ | 500.000 ₫ | Vượt trần (`VCHR-003`) |
| `DS-VAL-12` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | `prod-001` × 2 ➔ × 1 | 300.000 ₫ ➔ 150.000 ₫ | 0 ₫ ➔ 30.000 ₫ | 50.000 ₫ ➔ 0 ₫ | 250.000 ₫ ➔ 180.000 ₫ | Chuyển trạng thái: giảm số lượng sau khi áp mã; mã vẫn giữ, hiện cảnh báo vàng (`VCHR-011`) |

---

## 2. Giả Định Đã Dùng

| # | Nội dung | Căn cứ | Trạng thái |
|---|---|---|---|
| 1 | Tài khoản kiểm thử `khachhang@shopgo.vn`, `vip@shopgo.vn` / `123456` | `knowledge/_project.md` §4 | Confirmed |
| 2 | Miễn phí ship khi tiền hàng từ 200.000 ₫ trở lên | Phụ lục 02 S-02 · `knowledge` Mục 8 #21 | Confirmed |
| 3 | Chỉ có 3 mã: `GIAM50K`, `SALE20`, `HETHAN` | `INPUT/function-d-voucher/03_dev/environment.md` | Confirmed |

---

## 3. Export Dữ Liệu (CSV & JSON)

### 3.1. CSV
```csv
record_id,user_account,voucher_input,voucher_code,discount_type,cart,subtotal,shipping_fee,discount_amount,total_payment
DS-VAL-01,khachhang@shopgo.vn,GIAM50K,GIAM50K,FIXED_AMOUNT,prod-002x1,350000,0,50000,300000
DS-VAL-02,vip@shopgo.vn,SALE20,SALE20,PERCENTAGE,prod-001x2,300000,0,60000,240000
DS-VAL-03,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,prod-001x3,450000,0,90000,360000
DS-VAL-04,vip@shopgo.vn,SALE20,SALE20,PERCENTAGE,prod-001x1+prod-002x1,500000,0,100000,400000
DS-VAL-05,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,prod-003x4,800000,0,100000,700000
DS-VAL-06,khachhang@shopgo.vn,GIAM50K,GIAM50K,FIXED_AMOUNT,prod-003x1,200000,0,50000,150000
DS-VAL-07,khachhang@shopgo.vn,GIAM50K,GIAM50K,FIXED_AMOUNT,prod-004x1,280000,0,50000,230000
DS-VAL-08,khachhang@shopgo.vn,giam50k,GIAM50K,FIXED_AMOUNT,prod-003x2,400000,0,50000,350000
DS-VAL-09,vip@shopgo.vn,"  SALE20  ",SALE20,PERCENTAGE,prod-002x1,350000,0,70000,280000
DS-VAL-11,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,prod-001x4,600000,0,100000,500000
```

### 3.2. JSON
```json
[
  {"record_id": "DS-VAL-01", "user_account": "khachhang@shopgo.vn", "voucher_input": "GIAM50K", "cart": {"prod-002": 1}, "subtotal": 350000, "shipping_fee": 0, "discount_amount": 50000, "total_payment": 300000},
  {"record_id": "DS-VAL-02", "user_account": "vip@shopgo.vn", "voucher_input": "SALE20", "cart": {"prod-001": 2}, "subtotal": 300000, "shipping_fee": 0, "discount_amount": 60000, "total_payment": 240000},
  {"record_id": "DS-VAL-04", "user_account": "vip@shopgo.vn", "voucher_input": "SALE20", "cart": {"prod-001": 1, "prod-002": 1}, "subtotal": 500000, "shipping_fee": 0, "discount_amount": 100000, "total_payment": 400000},
  {"record_id": "DS-VAL-06", "user_account": "khachhang@shopgo.vn", "voucher_input": "GIAM50K", "cart": {"prod-003": 1}, "subtotal": 200000, "shipping_fee": 0, "discount_amount": 50000, "total_payment": 150000},
  {"record_id": "DS-VAL-07", "user_account": "khachhang@shopgo.vn", "voucher_input": "GIAM50K", "cart": {"prod-004": 1}, "subtotal": 280000, "shipping_fee": 0, "discount_amount": 50000, "total_payment": 230000},
  {"record_id": "DS-VAL-09", "user_account": "vip@shopgo.vn", "voucher_input": "  SALE20  ", "cart": {"prod-002": 1}, "subtotal": 350000, "shipping_fee": 0, "discount_amount": 70000, "total_payment": 280000},
  {"record_id": "DS-VAL-12", "user_account": "khachhang@shopgo.vn", "voucher_input": "GIAM50K", "cart_before": {"prod-001": 2}, "cart_after": {"prod-001": 1}, "total_before": 250000, "subtotal_after": 150000, "shipping_fee_after": 30000, "discount_after": 0, "total_after": 180000, "expected_warning": "Mã \"GIAM50K\" chưa đủ điều kiện áp dụng"}
]
```

---

## 4. Tự Soi 5 Bẫy Khi Sinh Dữ Liệu

| # | Bẫy | Kết quả |
|---|---|---|
| 1 | Data lặp đơn điệu | **ĐẠT** — trộn mã tiền cố định / %, đủ các mốc sàn, tối thiểu SALE20, chạm trần, vượt trần, chuyển trạng thái. |
| 2 | Data phi thực tế | **ĐẠT** — chỉ dùng 3 mã có thật; mọi tiền hàng ghép được từ catalog 6 sản phẩm, trong giới hạn tồn kho. |
| 3 | Date logic sai | **ĐẠT** — mã hợp lệ đều còn hạn; `HETHAN` chỉ dùng ở dataset phủ định. |
| 4 | Giá trị bịa theo kiểu | **ĐẠT** — tính lại từng dòng theo công thức Phụ lục 02 S-04. |
| 5 | Thiếu edge tự nhiên | **ĐẠT** — có đơn đúng sàn, đúng tối thiểu SALE20, chạm trần, và đơn đổi số lượng sau khi áp mã. |

---

## 5. Chốt Chặn Nghiệm Thu
- [x] Không còn mã `VOUCHER10` / `FREESHIP` không tồn tại.
- [x] Phí ship đúng quy tắc miễn phí từ 200.000 ₫.
- [x] Số tiền ghi đủ, không viết tắt `k`.
- [x] 11 record dùng được (`DS-VAL-10` tạm đóng).
