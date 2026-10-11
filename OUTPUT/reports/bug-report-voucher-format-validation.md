# BUG REPORT · Không kiểm tra định dạng mã voucher
Owner: qa-system/qa-reporter/gen-bug-report · Nguồn: `runs/RUN-01_voucher-regression/run_result.md` · Verdict: PASS

## 1. Title
[Voucher] Hệ thống không kiểm tra định dạng mã, báo sai loại lỗi cho mọi chuỗi không hợp lệ

## 2. Environment
- **Hệ thống**: ShopGo Web · `https://cwshopgo.github.io`
- **Trình duyệt**: Chromium (Playwright), viewport 1280×800, locale vi-VN
- **Tài khoản**: `khachhang@shopgo.vn`
- **Lượt chạy**: `RUN-01_voucher-regression` · 2026-10-11

## 3. Steps to Reproduce
1. Đăng nhập, thêm sản phẩm vào giỏ cho tới khi đạt mức sàn.
2. Vào màn Thanh toán.
3. Nhập vào ô mã khuyến mãi một trong các chuỗi dưới đây.
4. Bấm **Áp dụng**.

| Ca test | Chuỗi nhập | Loại lỗi đúng ra phải báo |
|---|---|---|
| VCHR-020 | `V1` | Dưới 3 ký tự — sai định dạng |
| VCHR-023 | `SALE🎉@#$` | Chứa emoji và ký tự đặc biệt — sai định dạng |
| VCHR-024 | `GIAM 50K` | Có khoảng trắng ở giữa — sai định dạng |
| VCHR-025 | `<script>alert(1)</script>` | Payload XSS — sai định dạng |
| VCHR-026 | `' OR '1'='1` | Payload SQL Injection — sai định dạng |

## 4. Actual vs Expected

**Thực tế** — cả 5 chuỗi đều nhận cùng một thông báo:

```
Mã giảm giá "<chuỗi vừa nhập>" không tồn tại trên hệ thống.
```

**Kỳ vọng** — chuỗi không khớp `^[A-Z0-9]{3,20}$` phải báo **sai định dạng**:

```
Mã không đúng định dạng. Mã chỉ gồm chữ in hoa và số, dài 3–20 ký tự.
```

**Vì sao đây là lỗi, không phải khác biệt nhỏ về câu chữ**: hai thông báo dẫn người dùng đi hai hướng khắc phục trái ngược.
- *Sai định dạng* → người dùng gõ nhầm, cần **sửa ký tự**.
- *Không tồn tại* → mã sai hẳn, cần **đi xin mã khác**.

Báo nhầm loại khiến người gõ nhầm một ký tự đi liên hệ CSKH xin mã mới, còn lỗi thật thì không ai sửa.

**Trái với quyết định đã chốt**: `knowledge/features/function-d-voucher.md` ghi `MR-01` trạng thái **`Confirmed`**, phản hồi chính thức của BA là **"Chặn ký tự lạ"** kèm thông báo *"Mã không đúng định dạng"*. Sản phẩm chưa làm theo.

## 5. Severity
**Major** — không gây mất dữ liệu hay chặn luồng mua hàng, nhưng sai lệch so với quy tắc nghiệp vụ đã được BA chốt, và gây hiểu nhầm cho mọi người dùng gõ sai mã.

## 6. Priority
**High** — ảnh hưởng mọi người dùng nhập mã sai, là luồng rất thường gặp. Hai ca `VCHR-025` và `VCHR-026` còn thuộc nhóm an ninh: hệ thống hiện **nhận và phản chiếu nguyên văn** payload XSS/SQLi vào thông báo lỗi thay vì chặn từ đầu.

## 7. Evidence
`OUTPUT/function-d-voucher/runs/RUN-01_voucher-regression/evidence/` — mỗi ca một thư mục, ảnh theo từng bước:

| Ca | Thư mục | Ảnh kết quả |
|---|---|---|
| VCHR-020 | `evidence/VCHR-020/` | `..._FAIL_result.png` |
| VCHR-023 | `evidence/VCHR-023/` | `06_FAIL_result.png` |
| VCHR-024 | `evidence/VCHR-024/` | `..._FAIL_result.png` |
| VCHR-025 | `evidence/VCHR-025/` | `..._FAIL_result.png` |
| VCHR-026 | `evidence/VCHR-026/` | `..._FAIL_result.png` |

Ảnh đã được đính kèm vào từng issue Jira tương ứng với tiền tố mã ca.

Chặng 08 cũng bắt được cùng vấn đề này từ ảnh chụp, ghi là `UX-05` trong `08_ui_screenshot_analysis.md`, vi phạm `MSG-01`/`MSG-02` của bản giao thiết kế.

## 8. Giả Định & Thông Tin Còn Thiếu
- `[GIẢ ĐỊNH]` Khuôn dạng `^[A-Z0-9]{3,20}$` lấy từ `BR-01` trong knowledge. Nếu BA đã đổi khuôn này thì cần cập nhật lại test case trước.
- Chưa xác minh được payload XSS/SQLi có bị thực thi ở tầng nào khác không — ảnh chỉ cho thấy nó được hiển thị lại dưới dạng văn bản thuần trong thông báo lỗi, không thấy script chạy.
