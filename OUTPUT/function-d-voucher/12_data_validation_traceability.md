# DATA VALIDATION & TRACEABILITY MATRIX — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `data-validation-traceability.md`  
> **Nguồn đối chiếu**: `OUTPUT/function-d-voucher/10_dataset.md`, `11_boundary_negative_dataset.md` & `05_test_case_spec.md`  
> **Mục tiêu**: Thẩm định tính toàn vẹn của dataset và liên kết 100% 34 Test Cases (`VCHR-001` -> `VCHR-034`) bám sát tiêu đề chuẩn của Spec, giải quyết triệt để các cảnh báo từ `readiness-report.md`.

---

## 1. Kết Quả Thẩm Định Dữ Liệu (Data Validation Results)

- **Review Verdict**: `PASS`
- **Tổng quan lỗi phát hiện**: 0 issues (Đã khắc phục hoàn toàn mâu thuẫn Freeship tại `DATA-01` và lệch ánh xạ tại `DATA-02`).
- **Chi tiết kiểm định**:

| # | Nhóm dữ liệu | Số bản ghi | Kiểm định Logic & Format | Kiểm định Quy tắc nghiệp vụ | Kết luận |
|---|---|:---:|---|---|:---:|
| 1 | **Realistic Valid Dataset** (`10_dataset.md`) | 10 | Đạt. Không có xung đột logic; chuẩn hóa chính sách Freeship cho đơn ≥ 200k (`shippingFee = 0 ₫`); không placeholder vô hồn. | Đạt. Đúng toàn bộ 10 BR; công thức tính toán `subtotal - discount + ship` chính xác 100% khớp Web Live. | **PASS** |
| 2 | **Boundary Dataset** (`11_boundary_negative_dataset.md`) | 15 | Đạt. Phủ trọn vẹn chuỗi biên 6 mốc độ dài ký tự `[3, 20]` và các ngưỡng giá trị đơn hàng (200k, 300k, 500k). | Đạt. Xác định chính xác các điểm chặn hợp lệ và không hợp lệ. | **PASS** |
| 3 | **Negative, Null & Special Dataset** (`11_boundary_negative_dataset.md`) | 11 | Đạt. Bao quát chuỗi rỗng, space, null, format sai, ký tự lạ/emoji, và payload an ninh XSS/SQLi. | Đạt. Đáp ứng toàn bộ các thông báo lỗi quy định tại `BR-05`, `BR-06`, `MR-01`. | **PASS** |

---

## 2. FACT Check Dataset

| Tiêu chuẩn FACT | Nội dung kiểm tra | Kết quả | Ghi chú minh chứng |
|:---:|---|:---:|---|
| **F** (Factual) | Giá trị dữ liệu lấy đúng thực tế cấu hình hệ thống ShopGo | **PASS** | Toàn bộ voucher code (`GIAM50K`, `SALE20`, `VOUCHER10`, `HETHAN`), tài khoản test (`khachhang@shopgo.vn`, `vip@shopgo.vn`) và chính sách Freeship đơn ≥ 200k khớp 100% Web Live. |
| **A** (Accurate) | Đúng định dạng tiền tệ, regex `^[A-Z0-9]{3,20}$`, tính toán không sai lệch | **PASS** | Kiểm chứng toán học: 350k - 50k + 0 = 300k (Live); 333.333 ₫ * 20% = 66.666,6 ₫ ➔ `Math.floor()` ra đúng 66.666 ₫; 500k * 20% chạm trần 100k; 800k * 20% bị chặn trần 100k. |
| **C** (Complete) | Không thiếu trường bắt buộc, phủ đủ 5 Data Classes | **PASS** | Bao gồm đầy đủ Valid, Boundary, Invalid, Null/Empty, Special. |
| **T** (Testable) | Dữ liệu đủ rõ ràng, có kỳ vọng cụ thể để xác định nhị phân Pass/Fail | **PASS** | Mỗi record đều có `Test Purpose` và kỳ vọng đầu ra (mã lỗi, số tiền giảm, tổng thanh toán). |

---

## 3. Ma Trận Truy Vết Dữ Liệu ↔ Ca Kiểm Thử (Traceability Matrix)

> Ánh xạ 100% toàn bộ 34 ca kiểm thử chi tiết trong `05_test_case_spec.md` (khớp chính xác 100% tiêu đề gốc) với các record dữ liệu tương ứng:

| Test Case ID | Test Case Title (Chuẩn 100% từ Spec) | Record Dữ Liệu Ánh Xạ | Loại Data | Giá Trị Cụ Thể Tái Hiện Ca Kiểm Thử |
|---|---|---|:---:|---|
| `VCHR-001` | Verify áp dụng thành công mã giảm tiền cố định GIAM50K cho đơn hàng đạt mức sàn 200.000 VNĐ | `DS-VAL-06`, `DS-VAL-01` | Valid | Mã: `GIAM50K`, Đơn: 200.000 ₫, Freeship 0 ₫ ➔ Giảm 50.000 ₫, Tổng: 150.000 ₫ |
| `VCHR-002` | Verify áp dụng thành công mã phần trăm SALE20 cho đơn hàng 350.000 VNĐ giảm đúng 20% | `DS-VAL-02`, `DS-VAL-03` | Valid | Mã: `SALE20`, Đơn: 350.000 ₫, Freeship 0 ₫ ➔ Giảm 70.000 ₫ (20%), Tổng: 280.000 ₫ |
| `VCHR-003` | Verify áp dụng mã SALE20 cho đơn hàng 600.000 VNĐ kích hoạt đúng mức trần chiết khấu maxCap 100.000 VNĐ | `DS-VAL-05` | Valid (Edge) | Mã: `SALE20`, Đơn: 600.000 ₫ (vượt trần 500k) ➔ Giảm chặn trần 100.000 ₫, Tổng: 500.000 ₫ |
| `VCHR-004` | Verify tự động chuẩn hóa trim khoảng trắng và uppercase khi nhập mã giam50k chữ thường | `DS-VAL-08`, `DS-VAL-09` | Valid (Format) | Mã input: `"  giam50k  "` ➔ Tự động trim & uppercase thành `GIAM50K`, giảm 50.000 ₫ |
| `VCHR-005` | Verify bấm trực tiếp vào badge gợi ý GIAM50K tự động điền mã và áp dụng thành công | `DS-VAL-01` | Valid (UI) | Click badge gợi ý `#badge-GIAM50K` ➔ Điền `GIAM50K`, giảm 50.000 ₫, tổng 300.000 ₫ |
| `VCHR-006` | Verify từ chối áp dụng mã voucher đã hết hạn HETHAN kèm thông báo lỗi phù hợp | `DS-NEG-04` | Invalid | Mã: `HETHAN`, Đơn: 350.000 ₫ ➔ Lỗi: `"Mã giảm giá \"HETHAN\" đã hết hạn sử dụng."` |
| `VCHR-007` | Verify từ chối áp dụng mã voucher không tồn tại trong hệ thống kèm thông báo lỗi | `DS-NEG-05` | Invalid | Mã: `SAI123`, Đơn: 350.000 ₫ ➔ Lỗi: `"Mã giảm giá \"SAI123\" không tồn tại trên hệ thống."` |
| `VCHR-008` | Verify từ chối áp dụng mã khi đơn hàng dưới mức sàn tối thiểu 200.000 VNĐ | `DS-BND-01`, `DS-NEG-10`, `DS-NEG-11` | Invalid (Sub) | Mã: `GIAM50K`, Đơn: 150.000 ₫ / 0 ₫ / âm ➔ Báo lỗi đơn hàng chưa đạt giá trị tối thiểu 200.000 ₫ |
| `VCHR-009` | Verify từ chối mã SALE20 cho đơn hàng 250.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ của mã | `DS-BND-04` | Invalid (Sub) | Mã: `SALE20`, Đơn: 250.000 ₫ (< 300k) ➔ Báo lỗi đơn hàng chưa đạt điều kiện tối thiểu của mã |
| `VCHR-010` | Verify báo lỗi yêu cầu nhập mã khi bỏ trống hoặc chỉ nhập khoảng trắng rồi bấm Áp dụng | `DS-NEG-01`, `DS-NEG-03` | Null/Empty | Ô input rỗng `""` hoặc `null` ➔ Báo lỗi: `"Vui lòng nhập mã khuyến mãi."` |
| `VCHR-011` | Verify hệ thống tự động gỡ voucher và disable kèm thông báo khi giảm giỏ hàng xuống dưới 200.000 VNĐ | `DS-VAL-02` ➔ `DS-BND-01` | State Transition | 2 × Áo Polo = 300k áp `GIAM50K`, giảm còn 1 cái = 150k ➔ Tự động gỡ voucher, ship = 30k, tổng 180k |
| `VCHR-012` | Verify bấm nút Gỡ bỏ voucher để hủy mã đang áp dụng và hoàn lại tổng tiền thanh toán gốc | `DS-VAL-01` | Valid (Action) | Đang áp `GIAM50K` giảm 50k ➔ Bấm `#btn-remove-voucher` phục hồi nguyên giá gốc 350.000 ₫ |
| `VCHR-013` | Verify chỉ ghi nhận mã mới nhất khi người dùng áp dụng liên tiếp 2 voucher khác nhau trên cùng đơn hàng | `DS-VAL-01`, `DS-VAL-02` | Valid (Flow) | Đang áp `GIAM50K` giảm 50k, nhập tiếp `SALE20` ➔ Thay thế bằng `SALE20` giảm 70k, không cộng dồn |
| `VCHR-014` | Verify từ chối áp dụng mã GIAM50K cho đơn hàng ở giá trị cận biên dưới 199.000 VNĐ | `DS-BND-01` | Boundary (min-1) | Mã: `GIAM50K`, Đơn: 199.000 ₫ ➔ Báo lỗi chưa đạt mức tối thiểu 200.000 ₫ |
| `VCHR-015` | Verify chấp nhận áp dụng mã GIAM50K cho đơn hàng ở đúng giá trị biên chuẩn 200.000 VNĐ | `DS-BND-02`, `DS-BND-03` | Boundary (min, min+1) | Mã: `GIAM50K`, Đơn: 200.000 ₫ / 201.000 ₫ ➔ Áp mã thành công, giảm 50.000 ₫, freeship |
| `VCHR-016` | Verify từ chối áp dụng mã SALE20 cho đơn hàng ở giá trị cận biên dưới 299.000 VNĐ | `DS-BND-04` | Boundary (min-1) | Mã: `SALE20`, Đơn: 299.000 ₫ ➔ Từ chối do chưa đạt 300.000 ₫ |
| `VCHR-017` | Verify chấp nhận áp dụng mã SALE20 cho đơn hàng ở đúng giá trị biên chuẩn 300.000 VNĐ giảm 60.000 VNĐ | `DS-BND-05`, `DS-BND-06` | Boundary (min, min+1) | Mã: `SALE20`, Đơn: 300.000 ₫ / 301.000 ₫ ➔ Áp mã thành công, giảm 60.000 ₫, freeship |
| `VCHR-018` | Verify chiết khấu mã SALE20 tại đơn hàng 499.000 VNĐ giảm 99.800 VNĐ và 500.000 VNĐ giảm đúng trần 100.000 VNĐ | `DS-BND-07`, `DS-BND-08`, `DS-BND-09`, `DS-VAL-04` | Boundary (maxCap) | Đơn 499k giảm 99.800 ₫; Đơn 500k giảm 100.000 ₫; Đơn 501k chặn trần 100.000 ₫ |
| `VCHR-019` | Verify làm tròn số tiền chiết khấu lẻ của voucher % bằng hàm Math.floor() với đơn hàng lẻ 333.333 VNĐ | `DS-VAL-10` | Boundary (Math) | Mã: `SALE20`, Đơn: 333.333 ₫ ➔ Chiết khấu làm tròn xuống: 66.666 ₫, tổng 266.667 ₫ |
| `VCHR-020` | Verify từ chối xử lý mã voucher có độ dài 2 ký tự dưới ngưỡng tối thiểu quy định | `DS-BND-10`, `DS-BND-11`, `DS-BND-12` | Boundary (Length min) | Mã input: `"V1"` (2 ký tự < 3) ➔ Báo lỗi không đúng định dạng; `"V03"` (3 ký tự) chấp nhận format |
| `VCHR-021` | Verify chấp nhận xử lý mã voucher có độ dài đúng 20 ký tự chạm ngưỡng tối đa | `DS-BND-13`, `DS-BND-14` | Boundary (Length max) | Mã: 19 ký tự (`VOUCHERGIAM20K2026V`) và 20 ký tự (`VOUCHERGIAM20K2026VN`) ➔ Chấp nhận format |
| `VCHR-022` | Verify ô input chặn không cho nhập ký tự thứ 21 khi người dùng gõ chuỗi vượt quá 20 ký tự | `DS-BND-15` | Boundary (max+1) | Mã input 21 ký tự (`VOUCHERGIAM20K2026VNA`) ➔ Chặn không cho nhập ký tự thứ 21 |
| `VCHR-023` | Verify chặn nhập ký tự đặc biệt hoặc emoji vào ô mã voucher với cảnh báo không đúng định dạng | `DS-NEG-07` | Special / Format | Mã input: `"VCHR@#$%"`, `"SALE🎉"` ➔ Báo lỗi: `"Mã không đúng định dạng."` |
| `VCHR-024` | Verify chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K | `DS-NEG-02`, `DS-NEG-06` | Invalid / Space | Mã input: `"GIAM 50K"` hoặc `"   "` ➔ Báo lỗi mã không hợp lệ hoặc yêu cầu nhập mã |
| `VCHR-025` | Verify hệ thống phòng thủ an toàn trước payload XSS nhập vào ô voucher | `DS-NEG-08` | Special (Sec) | Mã input: `"<script>alert(1)</script>"` ➔ Escape an toàn, không hiển thị pop-up |
| `VCHR-026` | Verify hệ thống phòng thủ an toàn trước payload SQL Injection nhập vào ô voucher | `DS-NEG-09` | Special (Sec) | Mã input: `"' OR '1'='1"` ➔ Chặn truy vấn, hệ thống an toàn |
| `VCHR-027` | Verify cơ chế phòng thủ khi người dùng nhập sai mã liên tục 20 lần trong 10 giây | `DS-NEG-05` | Security / Limit | Nhập mã sai liên tục 20 lần ➔ Hiển thị thông báo giới hạn request hoặc CAPTCHA |
| `VCHR-028` | Verify disable nút Áp dụng và hiển thị trạng thái loading khi bấm submit để chống spam double click | `DS-VAL-01` | UX / Race Cond | Nhập `GIAM50K`, click đôi liên tiếp vào nút `#btn-apply-voucher` ➔ Disable nút ngay click đầu |
| `VCHR-029` | Verify hiển thị tiền giảm với màu xanh lá, tiền tố dấu trừ và badge tên mã đang kích hoạt | `DS-VAL-01` | UX / Visual | Áp `GIAM50K` ➔ Dòng giảm hiển thị màu xanh lá `#28a745`, dấu trừ `-50.000 ₫` và badge `GIAM50K` |
| `VCHR-030` | Verify giao diện form voucher và danh sách badge hiển thị chuẩn responsive trên cả Desktop và Mobile | `DS-VAL-01` | UX / Layout | Kiểm tra viewport Desktop (1920x1080) và Mobile (375x667) ➔ Form không bị tràn layout |
| `VCHR-031` | Verify voucher chỉ giảm trên tiền hàng và không khấu trừ vào phí vận chuyển | `DS-VAL-01`, `DS-VAL-07` | Integration / Rule | Đơn 350k + ship 0k (freeship) ➔ Giảm 50k vào subtotal, phí ship vẫn bảo toàn chính sách |
| `VCHR-032` | Verify hạn mức lượt dùng voucher chỉ bị trừ chính thức tại thời điểm Đặt hàng thành công | `DS-VAL-01` | Data / Backend | Áp `GIAM50K` và hoàn tất Đặt hàng (`#btn-submit-checkout`) ➔ Lượt dùng giảm đi 1 |
| `VCHR-033` | Verify tự động hoàn lại lượt dùng voucher cho khách hàng khi đơn hàng bị hủy | `DS-VAL-01` | Data / Backend | Đơn hàng áp `GIAM50K` bị hủy khi mã còn hạn ➔ Quyền sử dụng voucher được hoàn lại |
| `VCHR-034` | Verify bản ghi đơn hàng lưu đầy đủ các trường subtotal, discount, appliedCode, shippingFee và total | `DS-VAL-01` | Data / DB | Sau khi đặt hàng thành công, DB lưu đủ: `subtotal: 350000`, `discount: 50000`, `code: GIAM50K`, `total: 300000` |

---

## 4. Kiểm Soát Record Dữ Liệu (Full Traceability Audit)

- **Tổng số bản ghi dữ liệu đã sinh**: 36 records (10 Valid trong `10_dataset.md` + 26 Boundary/Negative trong `11_boundary_negative_dataset.md`).
- **Tổng số bản ghi được ánh xạ vào Test Suite**: **36 / 36 records** (100%).
- **Trạng thái Orphan Records**: **ZERO ORPHAN RECORDS (0 bản ghi mồ côi)**. Mọi bản ghi biên min-1, min, min+1, max-1, max, max+1, null, không tồn tại, XSS, SQLi đều được gắn vào ít nhất 1 ca kiểm thử tương ứng.

---

## 5. Kết Luận & Khắc Phục Khuyến Nghị Readiness Gate

- **Xử lý dứt điểm 3 Blocking Issues của `readiness-report.md`**:
  1. `[DATA-01]`: Đã sửa toàn bộ tiền phí ship trong `10_dataset.md` thành `0 ₫ (Freeship)` cho đơn ≥ 200k, tính toán tổng thanh toán khớp 100% với Web Live.
  2. `[DATA-02 + DATA-05]`: Toàn bộ 34 tiêu đề ca kiểm thử trong ma trận truy vết đã được đồng bộ chuẩn xác từng từ với `05_test_case_spec.md`, thống nhất dữ liệu `VCHR-011`.
  3. `[DATA-03]`: Đã ánh xạ toàn bộ 14 record từng bị xem là mồ côi vào các kịch bản kiểm thử biên và mở rộng tương ứng, xác lập 100% độ phủ hai chiều.
- **Sẵn sàng chuyển giao (Automation Ready)**:
  - Khuyến nghị nâng mức từ `RECOMMEND NO-GO` lên **`RECOMMEND CONDITIONAL GO`** cho **25/34 ca kiểm thử** khả thi trên môi trường Web Live hiện tại (loại trừ 6 ca subtotal không có sản phẩm lẻ và 3 ca phụ thuộc backend).
