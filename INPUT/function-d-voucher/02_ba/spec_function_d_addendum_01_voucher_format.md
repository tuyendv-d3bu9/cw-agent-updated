**Hệ thống Thương mại điện tử “ShopGo”**

# **Function D — Phụ lục 01: Quy tắc định dạng Mã Giảm Giá**

- **Bổ sung cho**: `spec_function_d.md` §1 (ô nhập "Mã giảm giá" và nút "Áp dụng")
- **Ngày ban hành**: 2026-09-30
- **Người xác nhận**: BA / User
- **Lý do bổ sung**: Tài liệu gốc chỉ nêu *"Mã không hợp lệ hoặc hết hạn → hiển thị thông báo lỗi"*, chưa quy định độ dài và bộ ký tự hợp lệ của mã. Phụ lục này chốt chính thức nội dung đó (đóng `GAP-F1a`, hoàn thiện `MR-01`).

## 1. Quy tắc định dạng

| # | Quy tắc | Giá trị |
|---|---|---|
| F-01 | Độ dài mã | Tối thiểu **3** ký tự, tối đa **20** ký tự |
| F-02 | Bộ ký tự hợp lệ | Chỉ chữ cái in hoa không dấu `A–Z` và chữ số `0–9` (regex `^[A-Z0-9]{3,20}$`) |
| F-03 | Giới hạn ô nhập | Ô "Mã giảm giá" không cho nhập quá 20 ký tự (`maxlength="20"`) |
| F-04 | Chuẩn hoá trước khi kiểm tra | Tự động bỏ khoảng trắng hai đầu và chuyển thành chữ in hoa |
| F-05 | Khoảng trắng ở giữa chuỗi | Coi là sai định dạng (ví dụ `GIAM 50K`) |

## 2. Thứ tự kiểm tra và thông báo

1. Chuẩn hoá theo F-04.
2. Sai định dạng (vi phạm F-01, F-02 hoặc F-05) → hiển thị **"Mã giảm giá không đúng định dạng."**, không tra cứu mã.
3. Đúng định dạng nhưng không có trong hệ thống → hiển thị thông báo mã không tồn tại.
4. Các bước kiểm tra hết hạn và giá trị đơn tối thiểu giữ nguyên như `spec_function_d.md`.

## 3. Ví dụ

| Mã nhập | Kết quả |
|---|---|
| `GIAM50K` | Đúng định dạng → tra cứu mã |
| ` sale20 ` | Chuẩn hoá thành `SALE20` → tra cứu mã |
| `V1` | Sai định dạng (dưới 3 ký tự) |
| `VOUCHERCHINHHANG2026` (20 ký tự) | Đúng định dạng → tra cứu mã |
| Chuỗi 21 ký tự | Ô nhập chỉ nhận 20 ký tự đầu |
| `GIAM 50K` · `SALE@20` · `<script>` · `' OR 1=1` | Sai định dạng |
