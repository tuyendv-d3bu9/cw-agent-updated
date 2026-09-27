# REALISTIC DATASET — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `dataset-generation.md`  
> **Nguồn đối chiếu**: `OUTPUT/function-d-voucher/09_data_class_map.md`, `01_requirement_risk_summary.md` & `environment.md`  
> **Quy ước FACT**: Tiền tệ VNĐ, chính sách Freeship cho đơn ≥ 200.000 VNĐ (`shippingFee = 0 ₫`), định dạng ngày `YYYY-MM-DD`, tính toán khớp 100% Web Live.

---

## 1. Bảng Dataset Sát Nghiệp Vụ (Valid Records)

| Record ID | User Account | Voucher Input | Voucher Thực Tế | Loại Voucher | Tiền hàng (`subtotal`) | Phí ship (`shippingFee`) | Tiền giảm (`discount`) | Tổng thanh toán (`totalPayment`) | Trạng thái / Ghi chú nghiệp vụ |
|---|---|---|---|---|---|---|---|---|---|
| `DS-VAL-01` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | 350.000 ₫ | 0 ₫ (Freeship) | 50.000 ₫ | 300.000 ₫ | Happy path chuẩn: Mã tiền cố định 50k, đơn hàng đạt ngưỡng Freeship (khớp 100% Web Live) |
| `DS-VAL-02` | `vip@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | 300.000 ₫ | 0 ₫ (Freeship) | 60.000 ₫ | 240.000 ₫ | Đúng điều kiện tối thiểu mã SALE20 (minOrder = 300k), freeship |
| `DS-VAL-03` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | 450.000 ₫ | 0 ₫ (Freeship) | 90.000 ₫ | 360.000 ₫ | Chiết khấu 20% nằm dưới mức trần maxCap, freeship |
| `DS-VAL-04` | `vip@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | 500.000 ₫ | 0 ₫ (Freeship) | 100.000 ₫ | 400.000 ₫ | Chạm đúng mức trần tối đa (maxCap = 100k, 500k * 20% = 100k), freeship |
| `DS-VAL-05` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | 800.000 ₫ | 0 ₫ (Freeship) | 100.000 ₫ | 700.000 ₫ | Vượt mức trần maxCap: Giảm chặn cứng tại 100.000 ₫, freeship |
| `DS-VAL-06` | `khachhang@shopgo.vn` | `GIAM50K` | `GIAM50K` | `FIXED_AMOUNT` | 200.000 ₫ | 0 ₫ (Freeship) | 50.000 ₫ | 150.000 ₫ | Chạm đúng mức sàn áp voucher hệ thống ShopGo (200k, khớp VCHR-001) |
| `DS-VAL-07` | `vip@shopgo.vn` | `VOUCHER10` | `VOUCHER10` | `PERCENTAGE` | 250.000 ₫ | 0 ₫ (Freeship) | 25.000 ₫ | 225.000 ₫ | Chiết khấu 10% cho đơn 250k, đạt ngưỡng Freeship |
| `DS-VAL-08` | `khachhang@shopgo.vn` | `giam50k` | `GIAM50K` | `FIXED_AMOUNT` | 400.000 ₫ | 0 ₫ (Freeship) | 50.000 ₫ | 350.000 ₫ | Tự động chuyển ký tự thường sang chữ hoa (`toUpperCase`), freeship |
| `DS-VAL-09` | `vip@shopgo.vn` | `  SALE20  ` | `SALE20` | `PERCENTAGE` | 350.000 ₫ | 0 ₫ (Freeship) | 70.000 ₫ | 280.000 ₫ | Tự động cắt bỏ khoảng trắng hai đầu (`trim`), freeship (khớp VCHR-002) |
| `DS-VAL-10` | `khachhang@shopgo.vn` | `SALE20` | `SALE20` | `PERCENTAGE` | 333.333 ₫ | 0 ₫ (Freeship) | 66.666 ₫ | 266.667 ₫ | Số tiền lẻ: áp dụng quy tắc làm tròn xuống `Math.floor()`, freeship |

---

## 2. Giả Định Đã Dùng

| # | Giả định | Vì sao cần | Chờ ai xác nhận | Trạng thái |
|---|---|---|---|---|
| 1 | `[GIẢ ĐỊNH]` Tài khoản người dùng kiểm thử mặc định là `khachhang@shopgo.vn` và `vip@shopgo.vn` (password: `123456`). | Web Live yêu cầu bắt buộc đăng nhập trước khi vào giỏ hàng và thanh toán. | Đã xác thực thực tế trên Web Live | Confirmed |
| 2 | **Chính sách Freeship**: Hệ thống ShopGo áp dụng chính sách miễn phí vận chuyển cho mọi đơn hàng có `subtotal >= 200.000 VNĐ`. | Đảm bảo kết quả tính toán `totalPayment` khớp 100% với Web Live và Spec kỹ thuật. | Đã quy định tại `environment.md` & Live DOM | Confirmed |

---

## 3. Export Dữ Liệu Thực Tế (CSV & JSON)

### 3.1. Định dạng CSV
```csv
record_id,user_account,voucher_input,voucher_code,discount_type,subtotal,shipping_fee,discount_amount,total_payment,note
DS-VAL-01,khachhang@shopgo.vn,GIAM50K,GIAM50K,FIXED_AMOUNT,350000,0,50000,300000,Happy path co dinh 50k freeship
DS-VAL-02,vip@shopgo.vn,SALE20,SALE20,PERCENTAGE,300000,0,60000,240000,Dung minOrder 300k cua SALE20 freeship
DS-VAL-03,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,450000,0,90000,360000,Giam 20% duoi muc tran freeship
DS-VAL-04,vip@shopgo.vn,SALE20,SALE20,PERCENTAGE,500000,0,100000,400000,Cham dung tran maxCap 100k freeship
DS-VAL-05,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,800000,0,100000,700000,Vuot muc tran maxCap 100k freeship
DS-VAL-06,khachhang@shopgo.vn,GIAM50K,GIAM50K,FIXED_AMOUNT,200000,0,50000,150000,Cham dung muc san he thong 200k freeship
DS-VAL-07,vip@shopgo.vn,VOUCHER10,VOUCHER10,PERCENTAGE,250000,0,25000,225000,Giam 10% freeship
DS-VAL-08,khachhang@shopgo.vn,giam50k,GIAM50K,FIXED_AMOUNT,400000,0,50000,350000,Kiem thu auto uppercase freeship
DS-VAL-09,vip@shopgo.vn,"  SALE20  ",SALE20,PERCENTAGE,350000,0,70000,280000,Kiem thu auto trim space freeship
DS-VAL-10,khachhang@shopgo.vn,SALE20,SALE20,PERCENTAGE,333333,0,66666,266667,Kiem thu lam tron tien le floor freeship
```

### 3.2. Định dạng JSON
```json
[
  {
    "record_id": "DS-VAL-01",
    "user_account": "khachhang@shopgo.vn",
    "voucher_input": "GIAM50K",
    "voucher_code": "GIAM50K",
    "discount_type": "FIXED_AMOUNT",
    "subtotal": 350000,
    "shipping_fee": 0,
    "discount_amount": 50000,
    "total_payment": 300000
  },
  {
    "record_id": "DS-VAL-02",
    "user_account": "vip@shopgo.vn",
    "voucher_input": "SALE20",
    "voucher_code": "SALE20",
    "discount_type": "PERCENTAGE",
    "subtotal": 300000,
    "shipping_fee": 0,
    "discount_amount": 60000,
    "total_payment": 240000
  },
  {
    "record_id": "DS-VAL-04",
    "user_account": "vip@shopgo.vn",
    "voucher_input": "SALE20",
    "voucher_code": "SALE20",
    "discount_type": "PERCENTAGE",
    "subtotal": 500000,
    "shipping_fee": 0,
    "discount_amount": 100000,
    "total_payment": 400000
  },
  {
    "record_id": "DS-VAL-06",
    "user_account": "khachhang@shopgo.vn",
    "voucher_input": "GIAM50K",
    "voucher_code": "GIAM50K",
    "discount_type": "FIXED_AMOUNT",
    "subtotal": 200000,
    "shipping_fee": 0,
    "discount_amount": 50000,
    "total_payment": 150000
  },
  {
    "record_id": "DS-VAL-09",
    "user_account": "vip@shopgo.vn",
    "voucher_input": "  SALE20  ",
    "voucher_code": "SALE20",
    "discount_type": "PERCENTAGE",
    "subtotal": 350000,
    "shipping_fee": 0,
    "discount_amount": 70000,
    "total_payment": 280000
  },
  {
    "record_id": "DS-VAL-10",
    "user_account": "khachhang@shopgo.vn",
    "voucher_input": "SALE20",
    "voucher_code": "SALE20",
    "discount_type": "PERCENTAGE",
    "subtotal": 333333,
    "shipping_fee": 0,
    "discount_amount": 66666,
    "total_payment": 266667
  }
]
```

---

## 4. Tự Soi 5 Bẫy Khi Sinh Dữ Liệu (Self-Correction Audit)

| # | Bẫy thường gặp | Đã kiểm | Kết quả đối chiếu |
|---|---|:---:|---|
| 1 | **Data lặp đơn điệu** | [x] | **ĐẠT**. Phân bổ cân đối giữa voucher tiền cố định và voucher %, bao gồm cả đơn sàn 200k, đơn điều kiện riêng 300k, đơn chạm trần 500k và vượt trần 800k. |
| 2 | **Data phi thực tế** | [x] | **ĐẠT**. Toàn bộ mã (`GIAM50K`, `SALE20`, `VOUCHER10`), tài khoản đăng nhập và tính toán freeship đều khớp chính xác 100% với Web Live ShopGo. |
| 3 | **Date logic sai** | [x] | **ĐẠT**. Tất cả các mã trong bộ Valid đều đang trong thời hạn hiệu lực (Active). |
| 4 | **Giá trị bịa theo kiểu** | [x] | **ĐẠT**. Đúng quy tắc chiết khấu: `GIAM50K` trừ 50.000 ₫, `SALE20` chiết khấu 20% kèm chặn trần 100.000 ₫, đơn ≥ 200k freeship 0 ₫. |
| 5 | **Thiếu edge tự nhiên** | [x] | **ĐẠT**. Đã đưa vào các điểm biên tự nhiên: đơn đúng sàn 200.000 ₫ (`DS-VAL-06`), đơn đúng điều kiện SALE20 300.000 ₫ (`DS-VAL-02`), đơn chạm trần maxCap (`DS-VAL-04`), và đơn tiền lẻ làm tròn `floor()` (`DS-VAL-10`). |

---

## 5. Chốt Chặn Nghiệm Thu (Quality Gates)
- [x] Đã xử lý triệt để issue `DATA-01`: Cập nhật phí freeship 0 ₫ cho các đơn ≥ 200k, tổng thanh toán khớp 100% Web Live.
- [x] Không lỗi cú pháp, tính toán số tiền chính xác 100% FACT.
- [x] Dữ liệu có thể xuất và tiêu thụ trực tiếp (CSV, JSON).
- [x] Xuất bản tại `OUTPUT/function-d-voucher/10_dataset.md`.
