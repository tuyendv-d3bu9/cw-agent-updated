# FUNCTION-D-VOUCHER — Feature Knowledge Base

> **BỘ NÃO TRI THỨC TÍNH NĂNG (Feature Knowledge Base)**
> Lưu trữ toàn bộ dữ kiện nghiệp vụ ĐÃ XÁC NHẬN của tính năng Áp dụng Mã Giảm Giá (Voucher) - ShopGo.
> Mọi Agent phân tích hay thiết kế kiểm thử đều đọc file này đầu tiên để không phải hỏi lại những gì đã chốt.

Feature slug: `function-d-voucher` · Nguồn tài liệu: `INPUT/function-d-voucher/02_ba/spec_function_d.md` & `01_business/shopgo_overview.md` · Cập nhật lần cuối: `2026-09-30` · Trạng thái tổng thể: `DRAFT`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
Chức năng **Function D: Áp dụng Mã Giảm Giá (Voucher)** nằm ở bước **Thanh toán** thuộc nhóm tính năng E trong hệ thống Thương mại điện tử **ShopGo**. Tính năng cho phép khách hàng nhập mã voucher khuyến mãi để được giảm trừ trực tiếp vào tổng giá trị đơn hàng trước khi tiến hành thanh toán và đặt hàng.

---

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết (Precondition) |
|---|---|---|
| Khách mua hàng (Customer) | Đăng nhập thành công (`khachhang@shopgo.vn` hoặc `vip@shopgo.vn`), vào màn hình Thanh toán, nhập/chọn mã voucher, xem chiết khấu, tiến hành đặt hàng | Đã đăng nhập vào hệ thống, có giỏ hàng với `subtotal >= 200.000 VNĐ` |
| Khách vãng lai (Guest) | Được xem sản phẩm, thêm hàng vào giỏ. Khi bấm "Thanh toán" bị chặn bởi Modal đăng nhập (`#modal-auth`) | Phải hoàn tất đăng nhập mới được vào trang Thanh toán và thực hiện áp mã/đặt hàng |
| Quản trị viên (Admin) | Quản lý mã giảm giá (tạo mã, cấu hình % / VND, min order, hạn dùng) | Nằm ở back-office (ngoài phạm vi test chi tiết) |

---

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)
> Trích xuất chính xác 100% FACT từ `INPUT/function-d-voucher/02_ba/spec_function_d.md`

| ID | Tóm tắt quy tắc | Chi tiết điều kiện & hành vi | Căn cứ nguồn (File/Mục) | Trạng thái |
|---|---|---|---|---|
| BR-01 | Phân loại Voucher | Hệ thống hỗ trợ 2 loại mã giảm giá: giảm theo phần trăm (%) và giảm theo số tiền cố định (VNĐ). | `spec_function_d.md` §1 | Confirmed |
| BR-02 | Điều kiện giá trị tối thiểu | Mã voucher chỉ dùng được khi tổng giá trị đơn hàng đạt giá trị tối thiểu quy định của mã đó. | `spec_function_d.md` §1 | Confirmed |
| BR-03 | Hạn sử dụng của mã | Mỗi mã giảm giá đều có thời hạn sử dụng xác định (ngày hết hạn). | `spec_function_d.md` §1 | Confirmed |
| BR-04 | Áp dụng thành công | Khi nhập mã hợp lệ và thỏa mãn mọi điều kiện, hệ thống hiển thị số tiền được giảm và hiển thị tổng tiền thanh toán mới. | `spec_function_d.md` §1 | Confirmed |
| BR-05 | Xử lý lỗi không hợp lệ/hết hạn | Nếu mã không hợp lệ (không tồn tại, sai định dạng) hoặc mã đã hết hạn → hệ thống hiển thị thông báo lỗi. | `spec_function_d.md` §1 | Confirmed |
| BR-06 | Chuẩn hóa mã nhập | Tự động loại bỏ khoảng trắng hai đầu (`trim`) và chuyển sang chữ hoa (`toUpperCase`). Nhập rỗng báo "Vui lòng nhập mã khuyến mãi." | Web live `cwshopgo.github.io` | Confirmed |
| BR-07 | Trần giảm tối đa (Max Cap) | Hỗ trợ cấu hình mức trần chiết khấu tối đa cho voucher % (ví dụ `SALE20` trần 100.000 VNĐ). Số tiền giảm thực tế = `min(subtotal * %, maxCap)`. | Web live `cwshopgo.github.io` | Confirmed |
| BR-08 | Hỗ trợ hủy / gỡ bỏ mã | Cho phép người dùng bấm gỡ bỏ voucher (`#btn-remove-voucher`) để phục hồi giá trị thanh toán gốc hoặc đổi mã khác. | Web live `cwshopgo.github.io` | Confirmed |
| BR-09 | Phạm vi áp dụng chiết khấu | Voucher chỉ áp dụng trên tiền hàng (`subtotal`), không chiết khấu phí vận chuyển (`shippingFee`). | Web live `cwshopgo.github.io` | Confirmed |
| BR-10 | Mức sàn đơn hàng áp voucher | Mức hóa đơn tối thiểu để được áp dụng mã giảm giá là 200.000 VNĐ (`subtotal >= 200.000 VNĐ`). Đơn hàng dưới 200.000 VNĐ không đủ điều kiện áp mã. | `technical_spec.md` (`spec.txt`) | Confirmed |

---

## 4. LUỒNG CHÍNH (HAPPY PATH)
1. **Bước 1 (Xác thực)**: Khách hàng đăng nhập vào ShopGo bằng tài khoản chuẩn (`khachhang@shopgo.vn` / `123456`) hoặc VIP.
2. **Bước 2 (Chọn hàng)**: Thêm sản phẩm vào giỏ hàng đảm bảo tổng tiền hàng `subtotal >= 200.000 VNĐ` (ví dụ: Tai nghe 350.000 VNĐ).
3. **Bước 3 (Vào thanh toán)**: Bấm tab "Thanh toán" để mở màn hình giỏ hàng và thanh toán.
4. **Bước 4 (Nhập/chọn mã)**: Khách hàng nhập mã giảm giá vào ô input (`#input-voucher-code`) hoặc bấm chọn nhanh từ danh sách mã gợi ý (ví dụ: `GIAM50K`).
5. **Bước 5 (Áp dụng)**: Khách hàng bấm nút “Áp dụng” (`#btn-apply-voucher`). Mã được áp ngay, nút không bị disable (Mục 8 #13).
6. **Bước 6 (Kiểm tra chiết khấu)**: Hệ thống xác thực mã hợp lệ, tính toán giảm trừ (ví dụ giảm 50.000 VNĐ), hiển thị dòng `Giảm giá voucher: -50.000 ₫`, tổng thanh toán cập nhật thành `300.000 ₫`. Nút "Gỡ mã" (`#btn-remove-voucher`) xuất hiện.
7. **Bước 7 (Đặt hàng)**: Bấm nút "Tiến hành Đặt hàng" (`#btn-submit-checkout`). Hệ thống hiển thị modal xử lý giao dịch và xác nhận "Đặt hàng thành công!" kèm mã đơn hàng `SG-XXXXXX`.


---

## 5. LUỒNG NGOẠI LỆ & LỖI ĐÃ NÊU (ALTERNATE & ERROR FLOWS)
- **E1 - Mã hết hạn**: Nhập mã hết hạn (ví dụ `HETHAN`) ➔ Thông báo lỗi `"Mã giảm giá \"<MÃ>\" đã hết hạn sử dụng."`, giữ nguyên tiền đơn hàng.
- **E2 - Mã không tồn tại**: Nhập mã lạ ➔ Thông báo lỗi `"Mã giảm giá \"<MÃ>\" không tồn tại trên hệ thống."`.
- **E3 - Không đạt giá trị đơn tối thiểu**: Đơn hàng có `subtotal < 200.000 VNĐ` (hoặc `< minSubtotal` của mã) ➔ Báo lỗi đơn hàng chưa đạt mức tối thiểu.
- **E4 - Bỏ trống ô nhập**: Bấm áp dụng khi chưa nhập mã ➔ Báo lỗi `"Vui lòng nhập mã khuyến mãi."`.
- **E5 - Ký tự lạ hoặc không đúng format**: Nhập ký tự đặc biệt, khoảng trắng giữa chuỗi ➔ Báo `"Mã giảm giá không đúng định dạng."` (Phụ lục 01; FE Live chưa hiện thực — Mục 8 #20).
- **E6 - Giảm giỏ hàng dưới mức điều kiện**: Đang áp mã mà giảm số lượng sản phẩm khiến `subtotal < 200.000 VNĐ` ➔ Mã vẫn giữ, hiện cảnh báo vàng `Mã "<MÃ>" chưa đủ điều kiện áp dụng`, giảm giá = 0 (Mục 8 #12).

---

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
- Quản lý cấu hình mã tại Back-office Admin (chỉ dùng làm context kiểm thử).
- Áp dụng đồng thời nhiều voucher trên một đơn hàng (hệ thống chỉ kích hoạt 1 voucher tại một thời điểm).

---

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)
> Phát hiện qua kỹ thuật quét phản biện 06W (W1 đến W6). Toàn bộ 7 kẽ hở đã được BA/PO/Dev phản hồi và chốt phương án chính thức.

| ID | Mô tả kẽ hở nghiệp vụ | Nhóm 06W | Mức rủi ro | Đề xuất mặc định của QA | Câu hỏi xác nhận cho BA/PO | Phản hồi chính thức của BA/PO | Trạng thái |
|---|---|---|---|---|---|---|---|
| MR-01 | Kiểm soát format input lạ (ký tự đặc biệt, SQLi, space) | W1 (Input) | MED | Chặn client regex `^[A-Z0-9]{3,20}$` | Chặn tại client với thông báo "Mã không đúng định dạng" hay gửi lên server? | **Chặn ký tự lạ** | `Confirmed` |
| MR-02 | Giảm giỏ hàng sau khi đã áp mã xuống dưới mức sàn | W2 (State) | HIGH | Tự động gỡ voucher ngay khi subtotal < điều kiện | Gỡ voucher ngay lập tức kèm cảnh báo hay chờ đến nút Đặt hàng? | **Hệ thống tự gỡ và disable voucher có kèm thông báo** | `Confirmed` |
| MR-03 | Mức sàn đơn hàng áp mã voucher toàn hệ thống | W3 (Data) | CRITICAL | Mức sàn chung toàn hệ thống | Xác nhận mức sàn là 200k hay 300k? | **Mức sàn là 200k (không phải 300k)** | `Confirmed` |
| MR-04 | Làm tròn số tiền lẻ của voucher % | W3 (Data) | MED | Làm tròn xuống hàng đồng `Math.floor()` | Làm tròn xuống `floor()` hay làm tròn toán học `round()`? | **Đồng ý (Làm tròn xuống hàng đồng)** | `Confirmed` |
| MR-05 | Chống double click / spam nút Áp dụng | W4 (Timing) | MED | Disable nút Áp dụng + hiển thị spinner loading | Có disable nút và khóa click trong lúc chờ response không? | **Disable nút khi đang áp dụng** | `Confirmed` |
| MR-06 | Khóa race condition khi còn 1 lượt dùng voucher | W5 (Who else) | HIGH | Trừ lượt dùng chính thức khi Đặt hàng | Trừ lượt dùng tại bước Áp dụng hay bước Đặt hàng thành công? | **Đồng ý (Trừ khi Đặt hàng thành công)** | `Confirmed` |
| MR-07 | Hoàn lại lượt dùng voucher khi đơn hàng bị hủy | W6 (Side effect) | LOW | Phục hồi lượt dùng nếu mã còn hạn | Khách hủy đơn hàng thì voucher có được hoàn lại lượt dùng không? | **Phục hồi lại quyền dùng voucher** | `Confirmed` |

> **Đợt 2 (2026-09-30)** — Phát sinh từ Readiness Gate v2 (`OUTPUT/function-d-voucher/reports/readiness-report.md` §4.2, §5, "❓ CÂU HỎI MỞ") và `06_coverage_review.md` §4 (Human-Final), sau khi đối chiếu mã nguồn FE Live.

| ID | Mô tả kẽ hở | Nhóm 06W | Mức rủi ro | Đề xuất mặc định | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |
|---|---|---|---|---|---|---|---|
| GAP-F1a | **Đính chính MR-01**: BA chỉ trả lời "chặn ký tự lạ". Độ dài 3–20, regex `^[A-Z0-9]{3,20}$`, `maxlength=20` và thông báo "Mã không đúng định dạng" là **đề xuất mặc định của QA Agent** trong `02_missing_rule_report.md`, **không có căn cứ trong INPUT** nhưng đã bị ghi nhầm như BA chốt. FE Live không có cả 4 điểm này | W1 (Input) | MED | Theo FE: không giới hạn độ dài, mã sai định dạng báo "không tồn tại" | Chấp nhận hành vi FE, hay giữ quy tắc định dạng và coi là bug? Nếu giữ thì độ dài và bộ ký tự do BA quy định là gì? | **Giữ quy tắc 3–20 ký tự** (chữ in hoa + số, `maxlength=20`, báo "Mã giảm giá không đúng định dạng."). BA ban hành `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_01_voucher_format.md` ➔ FE thiếu = **bug** | `Confirmed` |
| GAP-F1b | FE không tự gỡ voucher khi subtotal tụt dưới mức sàn (lệch MR-02) | W2 (State) | HIGH | — | Bug hay hạ kỳ vọng theo FE? | **Theo web** | `Confirmed` |
| GAP-F1c | FE không disable nút Áp dụng, không có loading (lệch MR-05) | W4 (Timing) | MED | — | Bug hay hạ kỳ vọng theo FE? | **Theo web** | `Confirmed` |
| GAP-F2 | Ngưỡng freeship 200k trùng mức sàn voucher 200k ➔ BR-09 không quan sát trực tiếp | W3 (Data) | MED | Kiểm chứng gián tiếp qua công thức tổng tiền | Đổi ngưỡng hay kiểm chứng gián tiếp? | **Theo web** (kiểm chứng gián tiếp) | `Confirmed` |
| GAP-F3 | Mọi giá là bội số 10.000 ₫ ➔ không phát sinh tiền lẻ để kiểm MR-04 | W3 (Data) | LOW | Tạm đóng ca | Thêm sản phẩm giá lẻ hay tạm đóng? | **Tạm đóng** (phương án B) | `Confirmed` |
| GAP-S1 | FE không có rate limiting, hạn mức lượt dùng, hủy từng đơn (MR-06, MR-07) | W5/W6 | LOW | Loại khỏi phạm vi Automation | Đóng khỏi phạm vi đợt này? | **Loại khỏi phạm vi, giữ TC trong kho** | `Confirmed` |
| GAP-L2 | Nút tăng/giảm số lượng không có `id` ổn định | — | LOW | Nhập trực tiếp vào `#input-qty-*` | Dev có bổ sung `id` không? | **Dev sẽ bổ sung `id`** | `Confirmed` |
| GAP-H1 | Human-Final: mức nghiêm trọng `VCHR-011` | — | — | — | Critical/High/Medium/Low? | **Không áp dụng** — GAP-F1b chọn theo web nên không còn là bug | `Rejected` |
| GAP-H2 | Human-Final: bổ sung ca concurrency đa tab / 3G / VAT | W5 (Who else) | MED | Chỉ giữ ca phù hợp app FE-only | Bổ sung ca nào? | **QA Lead quyết theo đặc thù web local, không DB** | `Confirmed` |

---

## 8. GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT (CONFIRMED ASSUMPTIONS LOG)

| # | Mã liên quan | Vấn đề nghiệp vụ | Quyết định chính thức của BA/PO | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
| 1 | MR-01 | Định dạng input ký tự đặc biệt | Chặn ký tự lạ, regex `^[A-Z0-9]{3,20}$`, báo lỗi không đúng format · ⚠️ *Đính chính 2026-09-30: BA chỉ chốt "chặn ký tự lạ"; phần độ dài/regex/thông báo là đề xuất của QA Agent, đã chốt lại tại `GAP-F1a` / Mục 8 #20, căn cứ INPUT: `02_ba/spec_function_d_addendum_01_voucher_format.md`* | BA / User | 2026-09-20 |
| 2 | MR-02 | Thay đổi giỏ hàng sau khi áp mã | ~~Tự động gỡ và disable voucher kèm thông báo cảnh báo~~ ➔ **thay bởi #12** | BA / User | 2026-09-20 |
| 3 | MR-03 | Mức sàn áp mã toàn hệ thống | Mức hóa đơn tối thiểu để áp mã là **200.000 VNĐ** (khớp hoàn toàn với Web Live) | BA / User | 2026-09-20 |
| 4 | MR-04 | Quy tắc làm tròn tiền voucher % | Làm tròn xuống hàng đơn vị đồng `Math.floor()` | BA / User | 2026-09-20 |
| 5 | MR-05 | Chống spam click nút Áp dụng | ~~Disable nút Áp dụng trong thời gian xử lý request~~ ➔ **thay bởi #13** | BA / User | 2026-09-20 |
| 6 | MR-06 | Trừ hạn mức lượt dùng voucher | Trừ lượt dùng tại thời điểm Đặt hàng thành công | BA / User | 2026-09-20 |
| 7 | MR-07 | Hoàn mã khi hủy đơn hàng | Tự động phục hồi lại quyền sử dụng voucher cho khách hàng nếu mã còn hạn | BA / User | 2026-09-20 |
| 8 | GAP-D1 | `discount_value`: có chấp nhận phần trăm thập phân không? | **Chỉ chấp nhận phần trăm số nguyên** (10%, 20%, 30%); không hỗ trợ 7.5% / 12.5% | BA / User | 2026-09-27 |
| 9 | GAP-D2 | `order_subtotal`: có trần giá trị đơn hàng tối đa được áp mã không? | **Không giới hạn trần** — đơn giá trị lớn vẫn áp mã bình thường | BA / User | 2026-09-27 |
| 10 | GAP-E1 | Môi trường Live có backend không? | **Không có backend** — ứng dụng là SPA thuần frontend, dữ liệu đơn hàng lưu ở `localStorage` (`shopgo_orders`). Kỳ vọng kiểm thử chỉ đối chiếu theo hành vi FE | BA / User | 2026-09-27 |
| 11 | GAP-E2 | Sản phẩm "Phụ kiện móc khóa 60.000 ₫" | **Không tồn tại** — catalog thật gồm 6 sản phẩm: 150.000 / 350.000 / 200.000 / 280.000 / 190.000 / 120.000 ₫ | BA / User | 2026-09-27 |
| 12 | GAP-F1b · MR-02 · `VCHR-011` | FE không tự gỡ voucher khi giỏ tụt dưới 200k | **Theo web**: giữ mã, hiện cảnh báo vàng `Mã "X" chưa đủ điều kiện áp dụng`, `discount = 0`. Thay thế kỳ vọng "tự gỡ + disable" của MR-02 | BA / User | 2026-09-30 |
| 13 | GAP-F1c · MR-05 · `VCHR-028` | FE không disable nút Áp dụng | **Theo web**: nút không bị disable, không loading. Kỳ vọng mới: bấm nhiều lần liên tiếp, số tiền chỉ giảm 1 lần | BA / User | 2026-09-30 |
| 14 | GAP-F2 · BR-09 · `VCHR-031` | Freeship 200k trùng mức sàn voucher 200k | **Theo web**: giữ nguyên 2 ngưỡng; kiểm chứng BR-09 gián tiếp qua `Tổng = Subtotal + Ship − Discount` và các trường trong `localStorage["shopgo_orders"]` | BA / User | 2026-09-30 |
| 15 | GAP-F3 · MR-04 · `VCHR-019` | Không có giá lẻ để kiểm làm tròn | **Tạm đóng** `VCHR-019`: "chưa kiểm chứng được trên dữ liệu hiện tại"; mở lại khi catalog có giá lẻ | BA / User | 2026-09-30 |
| 16 | GAP-S1 · `VCHR-027`, `032`, `033` | FE không có tính năng tương ứng | **Loại khỏi phạm vi Automation đợt này**, giữ TC trong Master Spec | BA / User | 2026-09-30 |
| 17 | GAP-L2 | Nút +/− số lượng thiếu `id` | **Dev sẽ bổ sung `id`**. Trong lúc chờ, script nhập trực tiếp vào `#input-qty-prod-00X` | BA / User | 2026-09-30 |
| 18 | GAP-H1 · `VCHR-011` | Mức nghiêm trọng | **Không áp dụng** — đã chọn theo web ở #12 nên không phải bug | QA Lead / User | 2026-09-30 |
| 19 | GAP-H2 | Bổ sung ca Human-Final | **Ủy quyền QA Lead**: app FE-only, không DB ➔ bỏ ca 3G (không có network call) và VAT (không có phân hệ); xem xét ca đa tab/reload vì dữ liệu dùng chung `localStorage` | QA Lead / User | 2026-09-30 |
| 20 | GAP-F1a · MR-01 · `VCHR-020`→`026` | Độ dài & bộ ký tự mã voucher | **Giữ quy tắc định dạng** theo Phụ lục 01: 3–20 ký tự, chỉ `A–Z` `0–9`, `maxlength=20`, khoảng trắng giữa chuỗi là sai, thông báo "Mã giảm giá không đúng định dạng.". FE Live chưa hiện thực ➔ 6 ca dự kiến FAIL (`VCHR-020`, `022`→`026`), lập defect; `VCHR-021` dự kiến PASS | BA / User | 2026-09-30 |
| 21 | BR-09 · Phí vận chuyển | Ngưỡng miễn phí ship | **Miễn phí ship khi tiền hàng từ 200.000 ₫ trở lên** (`>=`), phí chuẩn 30.000 ₫. Ban hành `INPUT/function-d-voucher/02_ba/spec_function_d_addendum_02_environment_shipping.md` §2 | BA / User | 2026-09-30 |
| 22 | GAP-E1 (bổ sung) | Ca kiểm thử API / HTTP / DB | **Không có API** ➔ ghi vào Phụ lục 02 §1 và **loại bỏ** mọi ca/record kiểm thử API (`DS-NEG-03` null payload, `DS-NEG-11` subtotal âm qua API) | BA / User | 2026-09-30 |
| 23 | Quy ước tiền | Viết tắt `k` | `k` = nghìn đồng (`200k` = `200.000 ₫`). Dữ liệu test luôn ghi đủ số. Ghi tại `knowledge/_project.md` §2 | BA / User | 2026-09-30 |

---

## 9. HẰNG SỐ NGHIỆP VỤ & DANH SÁCH MÃ THỰC TẾ (DOMAIN CONSTANTS)
| Tên hằng số / Mã | Kiểu | Giá trị cấu hình | Mô tả / Ý nghĩa |
|---|---|---|---|
| `GLOBAL_MIN_ORDER_VOUCHER`| Tiền tệ | 200.000 VNĐ | Mức hóa đơn tối thiểu để áp mã (Đã chốt chính thức) |
| `GIAM50K` | Mã Fixed | Giảm 50.000 VNĐ, min 200.000 VNĐ | Mã giảm tiền mặt hợp lệ |
| `SALE20` | Mã % | Giảm 20%, min 300.000 VNĐ, trần 100.000 VNĐ | Mã giảm % có trần |
| `HETHAN` | Mã Fixed | Giảm 30.000 VNĐ, min 100.000 VNĐ, `expired: true` | Mã test trường hợp hết hạn |
| `FREESHIP_THRESHOLD` | Tiền tệ | 200.000 VNĐ | Ngưỡng miễn phí vận chuyển |
| `DEFAULT_SHIPPING_FEE`| Tiền tệ | 30.000 VNĐ | Phí vận chuyển tiêu chuẩn |
| `CURRENCY` | Chuỗi | `VNĐ` | Đơn vị tiền tệ hiển thị |

---

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)
| Mã Rule | Căn cứ tài liệu gốc | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|
| BR-01 | `INPUT/function-d-voucher/02_ba/spec_function_d.md` | Sẽ gán tại Chặng 5 | Phân loại voucher % và tiền cố định |
| BR-02 | `INPUT/function-d-voucher/02_ba/spec_function_d.md` | Sẽ gán tại Chặng 5 | Đơn hàng đạt giá trị tối thiểu |
| BR-03 | `INPUT/function-d-voucher/02_ba/spec_function_d.md` | Sẽ gán tại Chặng 5 | Hạn sử dụng mã voucher |
| BR-04 | `INPUT/function-d-voucher/02_ba/spec_function_d.md` | Sẽ gán tại Chặng 5 | Áp dụng thành công, hiển thị tiền giảm |
| BR-05 | `INPUT/function-d-voucher/02_ba/spec_function_d.md` | Sẽ gán tại Chặng 5 | Báo lỗi mã không hợp lệ / hết hạn |
| BR-06 | Web live `cwshopgo.github.io` | Sẽ gán tại Chặng 5 | Chuẩn hóa trim() và toUpperCase() |
| BR-07 | Web live `cwshopgo.github.io` | Sẽ gán tại Chặng 5 | Trần giảm tối đa cho voucher % |
| BR-08 | Web live `cwshopgo.github.io` | Sẽ gán tại Chặng 5 | Nút hủy/gỡ bỏ voucher |
| BR-09 | Web live `cwshopgo.github.io` | Sẽ gán tại Chặng 5 | Không giảm giá trên phí vận chuyển |
| BR-10 | `INPUT/function-d-voucher/03_dev/technical_spec.md` (`spec.txt`) | Sẽ gán tại Chặng 5 | Mức hóa đơn tối thiểu 200.000 VNĐ (Đã chốt chính thức) |

