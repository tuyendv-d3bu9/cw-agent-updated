# DATA VALIDATION & TRACEABILITY MATRIX — FUNCTION-D-VOUCHER (ÁP DỤNG MÃ GIẢM GIÁ)

> **Bộ phận**: `agents/qa-test-data` · **Kỹ năng**: `data-validation-traceability.md`
> **Nguồn đối chiếu**: `10_dataset.md` v2, `11_boundary_negative_dataset.md` v2, `05_test_case_spec.md` (36 TCs)
> **Phiên bản**: v2 (2026-09-30) — đồng bộ sau khi chốt câu hỏi mở đợt 2 và ban hành Phụ lục 01, 02.

---

## 1. Kết Quả Thẩm Định Dữ Liệu

- **Review Verdict**: `PASS`
- **Thay đổi so với v1**: bỏ mã `VOUCHER10`; bỏ 2 record API (`DS-NEG-03`, `DS-NEG-11`); thay 6 mốc tiền không tạo được; sửa phí ship 30.000 ₫ ➔ 0 ₫ cho đơn từ 200.000 ₫; thêm `DS-VAL-11`, `DS-VAL-12`, `DS-NEG-12`, `DS-NEG-13`; tạm đóng `DS-VAL-10`.

| # | Nhóm dữ liệu | Số record | Logic & format | Quy tắc nghiệp vụ | Kết luận |
|---|---|:---:|---|---|:---:|
| 1 | Valid (`10_dataset.md`) | 11 (+1 tạm đóng) | Mọi tiền hàng ghép được từ catalog, có tổ hợp giỏ hàng | Đúng công thức `Tiền hàng + Phí ship − Giảm giá`, freeship từ 200.000 ₫ | **PASS** |
| 2 | Boundary (`11_...`) | 15 | 6 mốc độ dài 3–20; 3 ngưỡng tiền với mốc ±1 gần nhất tạo được | Khớp Phụ lục 01 và 02 | **PASS** |
| 3 | Negative / Null / Special (`11_...`) | 11 | Không còn record API | Thông báo lỗi khớp mã nguồn FE hoặc Phụ lục 01 | **PASS** |

---

## 2. FACT Check

| Tiêu chuẩn | Nội dung | Kết quả | Minh chứng |
|:---:|---|:---:|---|
| **F** | Giá trị lấy đúng cấu hình thật | **PASS** | Chỉ dùng `GIAM50K`, `SALE20`, `HETHAN`; 6 sản phẩm `prod-001`…`006`; phí ship 30.000 ₫ / 0 ₫ |
| **A** | Tính toán và định dạng | **PASS** | Ví dụ: 490.000 ₫ × 20% = 98.000 ₫; 510.000 ₫ × 20% = 102.000 ₫ ➔ chặn 100.000 ₫; 190.000 ₫ + 30.000 ₫ = 220.000 ₫. Số tiền ghi đủ, không viết tắt `k` |
| **C** | Đủ 5 Data Classes | **PASS** | Valid, Boundary, Invalid, Null/Empty, Special |
| **T** | Kỳ vọng nhị phân | **PASS** | Mỗi record có thông báo hoặc số tiền cụ thể |

---

## 3. Ma Trận Truy Vết Dữ Liệu ↔ Ca Kiểm Thử

> 36/36 test case, tiêu đề lấy nguyên văn từ `05_test_case_spec.md`.

| Test Case ID | Test Case Title | Record | Loại Data | Giá trị tái hiện |
|---|---|---|:---:|---|
| `VCHR-001` | Verify áp dụng thành công mã giảm tiền cố định GIAM50K cho đơn hàng đạt mức sàn 200.000 VNĐ | `DS-VAL-06`, `DS-BND-02` | Valid | `prod-003` × 1 = 200.000 ₫, `GIAM50K` ➔ giảm 50.000 ₫, ship 0 ₫, tổng 150.000 ₫ |
| `VCHR-002` | Verify áp dụng thành công mã phần trăm SALE20 cho đơn hàng 350.000 VNĐ giảm đúng 20% | `DS-VAL-09`, `DS-VAL-03` | Valid | `prod-002` × 1 = 350.000 ₫, `SALE20` ➔ giảm 70.000 ₫, tổng 280.000 ₫ (thêm `DS-VAL-03`: 450.000 ₫ ➔ giảm 90.000 ₫) |
| `VCHR-003` | Verify áp dụng mã SALE20 cho đơn hàng 600.000 VNĐ kích hoạt đúng mức trần chiết khấu maxCap 100.000 VNĐ | `DS-VAL-11`, `DS-VAL-05` | Valid (Edge) | `prod-001` × 4 = 600.000 ₫, `SALE20` ➔ giảm chặn trần 100.000 ₫, tổng 500.000 ₫ (thêm `DS-VAL-05`: 800.000 ₫ ➔ 100.000 ₫) |
| `VCHR-004` | Verify tự động chuẩn hóa trim khoảng trắng và uppercase khi nhập mã giam50k chữ thường | `DS-VAL-08` | Valid (Format) | Nhập `giam50k` ➔ chuẩn hoá `GIAM50K`, giảm 50.000 ₫ |
| `VCHR-005` | Verify bấm trực tiếp vào badge gợi ý GIAM50K tự động điền mã và áp dụng thành công | `DS-VAL-01` | Valid (UI) | Bấm `#badge-voucher-GIAM50K` ➔ giảm 50.000 ₫, tổng 300.000 ₫ |
| `VCHR-006` | Verify từ chối áp dụng mã voucher đã hết hạn HETHAN kèm thông báo lỗi phù hợp | `DS-NEG-04` | Invalid | `HETHAN` ➔ "Mã giảm giá \"HETHAN\" đã hết hạn sử dụng." |
| `VCHR-007` | Verify từ chối áp dụng mã voucher không tồn tại trong hệ thống kèm thông báo lỗi | `DS-NEG-05` | Invalid | Mã không tồn tại (TC dùng `KHONGCOMA`, record dùng `SAI123`) ➔ "... không tồn tại trên hệ thống." |
| `VCHR-008` | Verify từ chối áp dụng mã khi đơn hàng dưới mức sàn tối thiểu 200.000 VNĐ | `DS-NEG-13`, `DS-BND-01`, `DS-NEG-10` | Invalid (Sub) | `prod-001` × 1 = 150.000 ₫ + ship 30.000 ₫ ➔ từ chối, tổng 180.000 ₫; giỏ trống 0 ₫ ➔ từ chối |
| `VCHR-009` | Verify từ chối mã SALE20 cho đơn hàng 200.000 VNĐ do chưa đạt điều kiện tối thiểu 300.000 VNĐ của mã | `DS-VAL-06` (giỏ hàng), `DS-BND-04` | Invalid (Sub) | `prod-003` × 1 = 200.000 ₫, `SALE20` ➔ "Đơn hàng chưa đạt mức tối thiểu 300.000 ₫ (Hiện có 200.000 ₫)." |
| `VCHR-010` | Verify báo lỗi yêu cầu nhập mã khi bỏ trống hoặc chỉ nhập khoảng trắng rồi bấm Áp dụng | `DS-NEG-01`, `DS-NEG-02` | Null/Empty | `""` / `"   "` ➔ "Vui lòng nhập mã khuyến mãi." |
| `VCHR-011` | Verify giữ mã GIAM50K kèm cảnh báo chưa đủ điều kiện và không giảm tiền khi giảm giỏ hàng xuống dưới 200.000 VNĐ | `DS-VAL-12` | State Transition | `prod-001` × 2 ➔ × 1: tổng 250.000 ₫ ➔ 180.000 ₫ (ship 30.000 ₫, giảm 0 ₫), mã giữ nguyên, cảnh báo vàng |
| `VCHR-012` | Verify bấm nút Gỡ bỏ voucher để hủy mã đang áp dụng và hoàn lại tổng tiền thanh toán gốc | `DS-VAL-01` | Valid (Action) | Đang giảm 50.000 ₫ ➔ bấm `#btn-remove-voucher` ➔ tổng về 350.000 ₫ |
| `VCHR-013` | Verify chỉ ghi nhận mã mới nhất khi người dùng áp dụng liên tiếp 2 voucher khác nhau trên cùng đơn hàng | `DS-VAL-01`, `DS-VAL-09` | Valid (Flow) | `GIAM50K` rồi `SALE20` trên 350.000 ₫ ➔ chỉ còn `SALE20` giảm 70.000 ₫ |
| `VCHR-014` | Verify từ chối áp dụng mã GIAM50K cho đơn hàng ở giá trị cận biên dưới 190.000 VNĐ | `DS-BND-01` | Boundary (min-1) | `prod-005` × 1 = 190.000 ₫ ➔ từ chối, ship 30.000 ₫ |
| `VCHR-015` | Verify chấp nhận áp dụng mã GIAM50K cho đơn hàng ở đúng giá trị biên chuẩn 200.000 VNĐ | `DS-BND-02`, `DS-BND-03` | Boundary (min, min+1) | 200.000 ₫ / 240.000 ₫ ➔ giảm 50.000 ₫, ship 0 ₫ |
| `VCHR-016` | Verify từ chối áp dụng mã SALE20 cho đơn hàng ở giá trị cận biên dưới 280.000 VNĐ | `DS-BND-04` | Boundary (min-1) | `prod-004` × 1 = 280.000 ₫, `SALE20` ➔ từ chối |
| `VCHR-017` | Verify chấp nhận áp dụng mã SALE20 cho đơn hàng ở đúng giá trị biên chuẩn 300.000 VNĐ giảm 60.000 VNĐ | `DS-BND-05`, `DS-BND-06`, `DS-VAL-02` | Boundary (min, min+1) | 300.000 ₫ ➔ giảm 60.000 ₫ · 310.000 ₫ ➔ giảm 62.000 ₫ |
| `VCHR-018` | Verify chiết khấu mã SALE20 tại đơn hàng 490.000 VNĐ giảm 98.000 VNĐ và 500.000 VNĐ giảm đúng trần 100.000 VNĐ | `DS-BND-07`, `DS-BND-08`, `DS-BND-09`, `DS-VAL-04` | Boundary (maxCap) | 490.000 ₫ ➔ 98.000 ₫ · 500.000 ₫ ➔ 100.000 ₫ · 510.000 ₫ ➔ chặn 100.000 ₫ |
| `VCHR-019` | Verify làm tròn số tiền chiết khấu lẻ của voucher % bằng hàm Math.floor() với đơn hàng lẻ 333.333 VNĐ | `DS-VAL-10` (tạm đóng) | Deferred | ⏸️ Không tạo được tiền lẻ trên catalog |
| `VCHR-020` | Verify từ chối xử lý mã voucher có độ dài 2 ký tự dưới ngưỡng tối thiểu quy định | `DS-BND-10` | Boundary (độ dài min-1) | `V1` ➔ "Mã giảm giá không đúng định dạng." |
| `VCHR-021` | Verify chấp nhận xử lý mã voucher có độ dài đúng 20 ký tự chạm ngưỡng tối đa | `DS-BND-11`…`DS-BND-14` | Boundary (độ dài min…max) | 3 / 4 / 19 / 20 ký tự ➔ qua định dạng, báo không tồn tại |
| `VCHR-022` | Verify ô input chặn không cho nhập ký tự thứ 21 khi người dùng gõ chuỗi vượt quá 20 ký tự | `DS-BND-15` | Boundary (độ dài max+1) | 21 ký tự ➔ ô chỉ nhận 20 ký tự đầu |
| `VCHR-023` | Verify chặn nhập ký tự đặc biệt hoặc emoji vào ô mã voucher với cảnh báo không đúng định dạng | `DS-NEG-07`, `DS-NEG-12` | Special | `VCHR@#$%!` / `SALE🎉` ➔ "Mã giảm giá không đúng định dạng." |
| `VCHR-024` | Verify chặn không cho submit mã có khoảng trắng ở giữa chuỗi như GIAM 50K | `DS-NEG-06` | Invalid format | `GIAM 50K` ➔ "Mã giảm giá không đúng định dạng." |
| `VCHR-025` | Verify hệ thống phòng thủ an toàn trước payload XSS nhập vào ô voucher | `DS-NEG-08` | Special (XSS) | Không bật hộp thoại, không render HTML ➔ lỗi định dạng |
| `VCHR-026` | Verify hệ thống phòng thủ an toàn trước payload SQL Injection nhập vào ô voucher | `DS-NEG-09` | Special (SQLi) | Giao diện không lỗi ➔ lỗi định dạng |
| `VCHR-027` | Verify cơ chế phòng thủ khi người dùng nhập sai mã liên tục 20 lần trong 10 giây | `DS-NEG-05` | Ngoài phạm vi | ⛔ Web không có giới hạn số lần thử |
| `VCHR-028` | Verify bấm nút Áp dụng liên tiếp nhiều lần chỉ giảm giá đúng một lần | `DS-VAL-01` | UX / Lặp thao tác | Bấm Áp dụng 5 lần ➔ giảm đúng 50.000 ₫ một lần, tổng 300.000 ₫ |
| `VCHR-029` | Verify hiển thị tiền giảm với màu xanh lá, tiền tố dấu trừ và badge tên mã đang kích hoạt | `DS-VAL-01` | UX / Visual | Dòng giảm "-50.000 ₫" màu xanh lá, badge `GIAM50K` |
| `VCHR-030` | Verify giao diện form voucher và danh sách badge hiển thị chuẩn responsive trên cả Desktop và Mobile | `DS-VAL-01` | UX / Layout | Viewport Desktop 1440px và Mobile 375px |
| `VCHR-031` | Verify voucher chỉ giảm trên tiền hàng, không khấu trừ vào phí vận chuyển (kiểm chứng gián tiếp qua công thức tổng tiền) | `DS-VAL-01` | Integration / Rule | 350.000 ₫ + 0 ₫ − 50.000 ₫ = 300.000 ₫, đối chiếu `shopgo_orders` |
| `VCHR-032` | Verify hạn mức lượt dùng voucher chỉ bị trừ chính thức tại thời điểm Đặt hàng thành công | `DS-VAL-01` | Ngoài phạm vi | ⛔ Voucher không có hạn mức lượt dùng |
| `VCHR-033` | Verify tự động hoàn lại lượt dùng voucher cho khách hàng khi đơn hàng bị hủy | `DS-VAL-01` | Ngoài phạm vi | ⛔ Không có thao tác hủy từng đơn |
| `VCHR-034` | Verify bản ghi đơn hàng lưu đầy đủ các trường subtotal, discount, appliedCode, shippingFee và total | `DS-VAL-01` | Data / localStorage | `subtotal: 350000`, `shippingFee: 0`, `discount: 50000`, `appliedCode: "GIAM50K"`, `total: 300000` |
| `VCHR-035` | Verify tải lại trang sau khi áp voucher thì giỏ hàng và mã giảm giá được làm mới nhưng vẫn giữ trạng thái đăng nhập | `DS-VAL-01` | State / Reload | Tải lại trang ➔ vẫn đăng nhập, giỏ trống, không còn mã |
| `VCHR-036` | Verify đặt hàng có voucher ở hai tab trình duyệt thì cả hai đơn đều được lưu, không ghi đè nhau | `DS-VAL-01`, `DS-VAL-07` | Concurrency (2 tab) | Tab A 300.000 ₫ + Tab B 230.000 ₫ ➔ đủ 2 đơn trong `shopgo_orders` |

---

## 4. Kiểm Tra Hai Chiều

- **Test case không có dữ liệu**: 0.
- **Record mồ côi (không test case nào dùng)**: 0.
- **Ca ngoài phạm vi Automation**: `VCHR-027`, `032`, `033` (⛔) · **tạm đóng**: `VCHR-019` (⏸️).
- **Ca dự kiến FAIL do FE thiếu quy tắc định dạng** (Phụ lục 01): `VCHR-020`, `022`, `023`, `024`, `025`, `026`. Dự báo FAIL do ghi đè đơn giữa 2 tab: `VCHR-036`.

---

## 5. Kết Luận
- Lớp dữ liệu đã đồng bộ với 36 test case và 2 phụ lục spec mới.
- Sẵn sàng chạy lại Readiness Gate (v3).
