# BUG REPORT · Ô nhập mã không giới hạn 20 ký tự
Owner: qa-system/qa-reporter/gen-bug-report · Nguồn: `runs/RUN-01_voucher-regression/run_result.md` · Verdict: PASS

## 1. Title
[Voucher] Ô nhập mã khuyến mãi nhận quá 20 ký tự, không có `maxlength`

## 2. Environment
- **Hệ thống**: ShopGo Web · `https://cwshopgo.github.io`
- **Trình duyệt**: Chromium (Playwright), viewport 1280×800
- **Lượt chạy**: `RUN-01_voucher-regression` · 2026-10-11 · ca `VCHR-022`

## 3. Steps to Reproduce
1. Đăng nhập, vào màn Thanh toán.
2. Gõ vào ô mã khuyến mãi một chuỗi dài 25 ký tự.
3. Đọc lại độ dài giá trị thực tế trong ô.

## 4. Actual vs Expected
- **Thực tế**: ô nhận đủ **25 ký tự**.
- **Kỳ vọng**: ô chặn ở **20 ký tự** (`BR-01`: mã dài 3–20 ký tự).

Assertion thất bại: `expect(received).toBeLessThanOrEqual(20)` · nhận `25`.

## 5. Severity
**Minor** — không hỏng dữ liệu, nhưng để người dùng gõ tiếp vào khoảng chắc chắn vô hiệu rồi mới báo lỗi sau khi bấm.

## 6. Priority
**Medium** — sửa rẻ (thêm `maxlength="20"`), và nó dọn trước một phần đường cho bug định dạng ở báo cáo kia.

## 7. Evidence
`evidence/VCHR-022/` — ảnh theo từng bước, đã đính kèm vào `SG-23`.

## 8. Giả Định & Thông Tin Còn Thiếu
- `[GIẢ ĐỊNH]` Giới hạn 20 ký tự lấy từ `BR-01`. Chưa rõ sản phẩm muốn chặn cứng ở tầng input hay chỉ báo lỗi sau khi submit — cần BA chốt. Nếu chọn phương án báo lỗi sau submit thì ca `VCHR-022` phải viết lại.
