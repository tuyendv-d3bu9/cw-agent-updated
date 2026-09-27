# QA Design-time Readiness Report: Function D — Áp Dụng Mã Giảm Giá (Voucher) · `function-d-voucher`
Owner: `agents/qa-readiness-evaluator/skills/gen-readiness-report.md` · Nguồn: `03_viewpoint_report.md`, `04_test_idea_report.md`, `05_test_blueprint.json`, `05_test_case_spec.md`, `testcases/batch_01.md`, `10_dataset.md`, `11_boundary_negative_dataset.md`, `12_data_validation_traceability.md`, `06_coverage_review.md`, `07_web_journey_discovery.md`, `INPUT/.../03_dev/environment.md`, `04_design/live_ui_locators.md` · Ngày lập: 2026-09-27 · **Verdict: `RECOMMEND NO-GO`**

## 1. Tổng quan (Overview)
- **Feature / Phạm vi:** Áp dụng mã giảm giá (voucher) tại màn hình Thanh toán của ShopGo — 34 test case (`VCHR-001` → `VCHR-034`) trải trên 06 viewpoint, đối chiếu môi trường Web Live `https://cwshopgo.github.io/`.
- **Mục tiêu báo cáo:** Đánh giá độ chín của test design trước khi tiến hành Execution / Automation (Playwright E2E).
- **Nguồn dữ liệu đã nạp:**
  - `outputs/coverage-plan.json` (Trạng thái: **Không tìm thấy** — thay thế bằng `03_viewpoint_report.md` + `04_test_idea_report.md`, là kế hoạch slot chính thức của dự án này)
  - `outputs/testcases/*.csv` (Trạng thái: **Không tìm thấy file CSV** — test case lưu dạng Markdown có cấu trúc; đã parse bằng **field-aware record parser** theo block `### TC_ID:` trên `05_test_case_spec.md` và `testcases/batch_01.md`, không dùng đếm dòng thô)
  - `outputs/testdata/validation-report.md` (Trạng thái: **Đã nạp** dưới tên `12_data_validation_traceability.md`)
  - `outputs/specs/voucher-spec.json` (Trạng thái: **Không tìm thấy** — thay thế bằng `01_requirement_risk_summary.md`, `02_missing_rule_report.md`, `knowledge/features/function-d-voucher.md`)
  - `outputs/reviews/` (Trạng thái: **Đã nạp 1 file review**: `06_coverage_review.md`; kèm các verdict gate tại `01`, `02`, `03`, `04`, `12`)

> **Ghi chú tên file:** Dự án dùng bộ tên chuẩn `01_` → `12_` theo `AGENTS.md` thay cho bộ tên mặc định của skill. Ánh xạ nguồn đã nêu tường minh ở trên để bảo toàn khả năng truy vết.

## 2. Coverage (Planned Slots vs. Actual Test Cases)

| Viewpoint ID | Tên Viewpoint | Planned Slots | Actual Test Cases | Delta (Actual - Plan) | Ghi chú & Nhận diện Drift |
|---|---|---|---|---|---|
| `VP-01` | Happy Path | 5 | 5 | 0 | Khớp tuyệt đối (TI-01→TI-05). Không có drift. |
| `VP-02` | Negative | 8 | 8 | 0 | Khớp tuyệt đối (TI-06→TI-13). Không có drift. |
| `VP-03` | Boundary | 9 | 9 | 0 | Khớp tuyệt đối (TI-14→TI-22). Không có drift. |
| `VP-04` | Security | 5 | 5 | 0 | Khớp tuyệt đối (TI-23→TI-27). Không có drift. |
| `VP-05` | UX/Usability | 3 | 3 | 0 | Khớp tuyệt đối (TI-28→TI-30). Không có drift. |
| `VP-06` | Integration | 4 | 4 | 0 | Khớp tuyệt đối (TI-31→TI-34). Không có drift. |
| **TỔNG** | | **34** | **34** | **0** | Blueprint 34 mục ↔ Spec 34 bản ghi ↔ Batch 34 bản ghi, không thiếu, không trùng ID. |

*Phân tích Delta:*
- Delta = 0 trên toàn bộ 06 viewpoint. Không phát hiện coverage drift. Mỗi Test Idea được giữ (34/38) chuyển thành đúng 01 test case, 04 ý tưởng bị loại đều có lý do giải trình trong `04_test_idea_report.md`.
- Đối soát định danh: `05_test_blueprint.json` (34) ↔ `05_test_case_spec.md` (34) ↔ `testcases/batch_01.md` (34); tập ID trùng khớp 100%, không có ID thừa/thiếu ở cả hai chiều.
- Thống kê slot có trạng thái `assumed`: **0** slot ở tầng viewpoint. *(Ghi nhận riêng: 02 trường dữ liệu mang nhãn `[GIẢ ĐỊNH]` chưa chốt tại `09_data_class_map.md` §2 — xem Mục 5.)*
- Thống kê slot có trạng thái `context_limited`: **CHƯA XÁC ĐỊNH** (kế hoạch slot của dự án không dùng cờ này). Tuy nhiên đối soát môi trường phát hiện **09 test case bị giới hạn khả năng thực thi trên Web Live** — xem Mục 4 và Mục 7.

## 3. Ma trận Truy vết (Traceability)
- **Tỷ lệ Test Case có Trace:** **100%** (34 / 34) — mỗi bản ghi đều mang đủ `Rule#`, `Viewpoint#`, `Module#` trong trường `Tags`; 0 bản ghi thiếu trace.
- **Kiểm tra cấu trúc 8 trường:** 34/34 test case đủ 8 trường (`TC_ID`, `Title`, `Precondition`, `Test Steps`, `Test Data`, `Expected Result`, `Priority`, `Tags`), không trường rỗng.
- **Độ phủ rule (đếm từ tag):** `BR-01`:3 · `BR-02`:5 · `BR-03`:2 · `BR-04`:9 · `BR-05`:5 · `BR-06`:7 · `BR-07`:2 · `BR-08`:1 · `BR-09`:1 · `BR-10`:4 → 10/10 Business Rule đều có ≥ 1 test case.
- **Cảnh báo Rule chưa Confirm:** **Không có.** Toàn bộ `BR-01`→`BR-10` và 07 Missing Rule `MR-01`→`MR-07` đã ở trạng thái `Confirmed` (có phản hồi chính thức của BA/PO ghi tại `02_missing_rule_report.md` §3 và `knowledge/features/function-d-voucher.md` §7–§8). Không test case nào map vào rule mang cờ `needs_clarification`.
- **⚠️ Lệch ánh xạ Test Case ↔ Dữ liệu (phát hiện khi đối soát chéo):** Ma trận tại `12_data_validation_traceability.md` §3 gán **sai ngữ nghĩa test case cho ít nhất 07 ID** so với `05_test_case_spec.md`:

| TC ID | Tên trong `12_..._traceability.md` | Tên thực tế trong `05_test_case_spec.md` |
|---|---|---|
| `VCHR-005` | Áp mã viết thường (auto uppercase) | Bấm trực tiếp badge gợi ý `GIAM50K` để tự điền và áp mã |
| `VCHR-013` | Chọn nhanh voucher từ danh sách gợi ý | Chỉ ghi nhận mã mới nhất khi áp liên tiếp 2 voucher khác nhau |
| `VCHR-023` | Nhập mã có khoảng trắng ở giữa chuỗi | Chặn ký tự đặc biệt hoặc emoji |
| `VCHR-024` | Nhập toàn bộ chuỗi là khoảng trắng | Chặn submit mã có khoảng trắng ở giữa (`GIAM 50K`) |
| `VCHR-029` | Khách vãng lai bấm thanh toán bị chặn bởi login | Hiển thị tiền giảm màu xanh lá, dấu trừ và badge mã |
| `VCHR-030` | Phản hồi nhanh giao diện khi áp mã (< 500ms) | Giao diện responsive Desktop & Mobile |
| `VCHR-034` | Luồng E2E hoàn chỉnh từ đăng nhập đến đặt hàng | Bản ghi đơn hàng lưu đủ `subtotal`, `discount`, `appliedCode`, `shippingFee`, `total` |

  ➔ Hệ quả: nếu tầng Automation nạp dữ liệu theo ma trận này, script sẽ được cấp **sai bộ dữ liệu cho 7 kịch bản**. Con số "truy vết 100%" trong `12_...` vì vậy **chưa đáng tin ở cấp nội dung**, dù đạt 100% ở cấp định danh.

## 4. Sẵn sàng về Dữ liệu Kiểm thử (Data Readiness)
- **Tóm tắt FACT trên Test Data** *(nguyên văn kết luận của `12_data_validation_traceability.md` §2, kèm kết quả đối soát độc lập của báo cáo này)*:
  - **Faithful (Factual):** Báo cáo dữ liệu tự đánh giá **PASS**. ➔ **Đối soát độc lập: KHÔNG ĐẠT** — `VCHR-031` dùng sản phẩm *"Phụ kiện móc khóa" 60.000 ₫* không tồn tại trong catalog Web Live (chỉ có 3 sản phẩm: 150.000 ₫ / 200.000 ₫ / 350.000 ₫ theo `live_ui_locators.md`).
  - **Accurate:** Báo cáo dữ liệu tự đánh giá **PASS**. ➔ **Đối soát độc lập: KHÔNG ĐẠT** — 09/10 bản ghi `DS-VAL-*` tính phí ship 30.000 ₫ cho đơn ≥ 200.000 ₫, trái với `FREESHIP_THRESHOLD = 200.000 VNĐ` (`environment.md` §2, `knowledge/features/function-d-voucher.md` §9) và trái với hành vi Live đã chụp bằng chứng tại `07_web_journey_discovery.md` (đơn 350.000 ₫ + `GIAM50K` ➔ *"Miễn phí (Freeship)"*, tổng **300.000 ₫**, không phải 330.000 ₫).
  - **Complete:** **PASS** — phủ đủ 5 Data Class (Valid, Boundary, Invalid, Null/Empty, Special) và chuỗi biên 6 mốc độ dài mã `[3, 20]`.
  - **Testable:** **PASS** — mỗi record có `Test Purpose` và kỳ vọng nhị phân (mã lỗi / số tiền giảm / tổng thanh toán).
- **Danh sách Data Issues còn tồn đọng** *(phát hiện qua đối soát chéo; báo cáo này không sửa dữ liệu)*:
  1. **[DATA-01 · Blocking]** Mâu thuẫn phí vận chuyển: `DS-VAL-01` (350.000 ₫ → total 330.000 ₫), `DS-VAL-02`, `DS-VAL-03`, `DS-VAL-04`, `DS-VAL-05`, `DS-VAL-06`, `DS-VAL-08`, `DS-VAL-09`, `DS-VAL-10` đều cộng 30.000 ₫ ship cho đơn đã đạt ngưỡng freeship 200.000 ₫. Mọi assertion `total_payment` sinh từ tập này sẽ sai lệch 30.000 ₫ so với hệ thống thật.
  2. **[DATA-02 · Blocking]** Ma trận truy vết gán sai test case cho ≥ 07 ID (bảng tại Mục 3).
  3. **[DATA-03 · Major]** `12_..._traceability.md` §4 khẳng định *"Không có record mồ côi (Zero Orphan Data Records)"*, nhưng đối soát thực tế cho thấy **14/36 record chưa từng được ma trận tham chiếu**: `DS-VAL-03`, `DS-VAL-04`, `DS-VAL-07`, `DS-BND-03`, `DS-BND-06`, `DS-BND-07`, `DS-BND-09`, `DS-BND-11`, `DS-BND-12`, `DS-BND-13`, `DS-NEG-03`, `DS-NEG-07`, `DS-NEG-10`, `DS-NEG-11`.
  4. **[DATA-04 · Major]** Dữ liệu không tái hiện được trên Web Live: catalog chỉ có 3 mức giá (150.000 / 200.000 / 350.000 ₫), nên các subtotal yêu cầu **199.000 ₫** (`VCHR-014`), **250.000 ₫** (`VCHR-009`, `VCHR-011`), **299.000 ₫** (`VCHR-016`), **333.333 ₫** (`VCHR-019`), **499.000 ₫** (`VCHR-018`), **210.000 ₫** (`VCHR-031`) đều **không tổ hợp được** qua UI. *(Mốc 200.000 / 300.000 / 500.000 ₫ thì tái hiện được.)*
  5. **[DATA-05 · Major]** Lệch dữ liệu nội bộ: `VCHR-011` trong `05_test_case_spec.md` mô tả 2 × Áo Polo = 300.000 ₫ → giảm còn 150.000 ₫, trong khi ma trận `12_...` mô tả cùng ca này là 200.000 ₫ → 150.000 ₫.
  6. **[DATA-06 · Minor]** 02 trường dữ liệu vẫn treo nhãn `[GIẢ ĐỊNH]` chưa có phản hồi BA/PO (`09_data_class_map.md` §2): `discount_value` (có chấp nhận % thập phân?) và `order_subtotal` (có trần đơn hàng tối đa?).

## 5. Danh sách Gaps & Giả định (Gaps & Assumptions)

| Gap ID | Mô tả Chi tiết | Status (Confirmed / Treo) | Giả định hiện tại (Working Assumption) | Cần BA làm rõ? (Yes/No) |
|---|---|---|---|---|
| `MR-01` | Kiểm soát format input lạ (ký tự đặc biệt, SQLi, space giữa) | **Confirmed** (BA/PO 2026-09-20) | Chặn tại client theo regex `^[A-Z0-9]{3,20}$`, báo "Mã không đúng định dạng" | No |
| `MR-02` | Giỏ hàng tụt dưới mức sàn sau khi đã áp mã | **Confirmed** | Tự động gỡ + disable voucher kèm toast cảnh báo | No |
| `MR-03` | Mức sàn áp mã toàn hệ thống | **Confirmed** | `200.000 VNĐ` (bác bỏ mốc 300k trong `spec.txt`) | No |
| `MR-04` | Làm tròn tiền lẻ voucher % | **Confirmed** | `Math.floor()` xuống hàng đồng | No |
| `MR-05` | Chống double-click nút Áp dụng | **Confirmed** | Disable nút + trạng thái loading khi submit | No |
| `MR-06` | Thời điểm trừ lượt dùng voucher | **Confirmed** | Trừ khi Đặt hàng thành công, không trừ khi Áp dụng | No |
| `MR-07` | Hoàn lượt dùng khi hủy đơn | **Confirmed** | Phục hồi lượt dùng nếu mã còn hạn | No |
| `GAP-D1` | `discount_value`: hệ thống có chấp nhận % thập phân (7.5%, 12.5%)? | **Treo** | `[GIẢ ĐỊNH]` Chỉ áp dụng % số nguyên | **Yes** |
| `GAP-D2` | `order_subtotal`: có trần giá trị đơn hàng tối đa được áp mã? | **Treo** | `[GIẢ ĐỊNH]` Không giới hạn trần | **Yes** |
| `GAP-E1` | Web Live là SPA frontend (React state), chưa có backend lưu lượt dùng / quản lý đơn | **Treo** | `[GIẢ ĐỊNH]` `VCHR-027`, `VCHR-032`, `VCHR-033` chưa kiểm chứng được end-to-end trên môi trường hiện tại | **Yes** (cần Dev/PO xác nhận môi trường có backend) |
| `GAP-E2` | Catalog Live chỉ có 3 sản phẩm cố định, không có cơ chế đặt subtotal tùy ý | **Treo** | `[GIẢ ĐỊNH]` Cần seed dữ liệu / sản phẩm phụ trợ hoặc can thiệp state để tái hiện biên | **Yes** |
| `GAP-L1` | Chưa có locator cho: nút tăng/giảm số lượng trong giỏ, vùng thông báo lỗi/toast, màn hình Quản lý đơn hàng & nút Hủy đơn | **Treo** | `[GIẢ ĐỊNH]` Phải bổ sung khi xây Page Object Model | **Yes** (Dev bổ sung `data-testid`) |

## 6. Kết quả Review Thiết kế (Review Findings)
- **Tally Kết quả Review:** `PASS`: **6** (Chặng 1, 2, 3, 4, 6 và Data Validation) | `FIX`: **0** | `ASK`: **0 đang mở** *(Chặng 1 từng ở `ASK`, đã đóng sau phản hồi BA/PO ngày 2026-09-20)*.
- **Danh sách điểm ASK / Điểm cần can thiệp:**
  - `06_coverage_review.md` §3 (Practical Observation): *"Test case `VCHR-032` (trừ lượt dùng) và `VCHR-033` (hoàn lượt dùng khi hủy đơn) đòi hỏi API Backend có database lưu trữ session người dùng để kiểm chứng toàn vẹn."* — điểm này **chưa được đóng**.
  - `06_coverage_review.md` §4 (Human-Final Decision Scope) còn **04 mục chờ QA Lead / PO thẩm định**: mức nghiêm trọng của `VCHR-011`; 34 TC đã đủ sâu chưa (có cần bổ sung concurrency đa tab?); tác động chéo sang VAT / báo cáo doanh thu; kịch bản network throttling 3G.
  - **Sai lệch trạng thái điều hành:** `00_plan.md` dòng tiêu đề Giai đoạn 3 vẫn ghi `VERDICT: ASK` trong khi nội dung bên dưới và `06_coverage_review.md` đều ghi nhận đã nghiệm thu `PASS` ngày 2026-09-27. Cần QA Lead thống nhất nhãn.

## 7. Khuyến nghị Go / No-Go cho Automation
- **Khuyến nghị của Agent:** **`RECOMMEND NO-GO`**
- **Căn cứ khuyến nghị:**
  - ✅ **Đạt:** Tỷ lệ Trace 100% (34/34); Delta coverage = 0; 10/10 BR và 7/7 MR đã `Confirmed`; 34/34 test case đủ 8 trường; không tồn đọng mục `FIX`.
  - ❌ **Không đạt (yếu tố kích hoạt NO-GO):** Tồn tại **Data Issue chưa giải quyết** ở mức chặn — `DATA-01` (09/10 bản ghi valid sai phí ship so với quy tắc freeship 200k và so với hành vi Live đã có bằng chứng) và `DATA-02` (ma trận dữ liệu gán sai test case cho ≥ 07 ID). Viết script Playwright trên nền dữ liệu này sẽ tạo ra assertion sai ngay từ happy path, gây hàng loạt false-fail và phải làm lại.
  - ⚠️ **Rủi ro kèm theo:** 09/34 test case (~26%) hiện **không thực thi trọn vẹn được** trên môi trường Live — 06 ca do subtotal không tái hiện được (`DATA-04`), 03 ca do phụ thuộc backend chưa có (`VCHR-027`, `VCHR-032`, `VCHR-033`).
- **Điều kiện tiên quyết cần hoàn thành trước khi chuyển sang Automation:**
  1. **[DATA-01]** `qa-test-data` hiệu chỉnh lại toàn bộ bản ghi `DS-VAL-*`: đơn ≥ 200.000 ₫ phải là freeship (`shipping_fee = 0`), tính lại `total_payment` tương ứng; hoặc BA xác nhận chính thức rằng quy tắc freeship không áp dụng cho Function D.
  2. **[DATA-02 + DATA-05]** Dựng lại ma trận truy vết `12_...` bám đúng tiêu đề trong `05_test_case_spec.md` cho 07 ID lệch và thống nhất dữ liệu `VCHR-011`.
  3. **[DATA-03]** Xử lý 14 record mồ côi: gắn vào test case tương ứng hoặc loại bỏ, đồng thời chỉnh lại khẳng định "Zero Orphan Data Records".
  4. **[DATA-04 / GAP-E2]** QA Lead + Dev chốt cách tái hiện subtotal biên (199.000 / 250.000 / 299.000 / 333.333 / 499.000 / 210.000 ₫): bổ sung sản phẩm vào catalog, seed giỏ hàng qua state, hay chuyển các ca này sang Manual / API-level.
  5. **[GAP-E1]** Xác nhận môi trường backend cho `VCHR-027`, `VCHR-032`, `VCHR-033`; nếu chưa có, chính thức khoanh 03 ca này ra khỏi phạm vi Automation đợt này.
  6. **[GAP-L1]** Dev bổ sung locator ổn định (`data-testid`) cho nút tăng/giảm số lượng, vùng toast/thông báo lỗi, màn hình Quản lý đơn hàng & nút Hủy đơn — hiện chỉ 10/34 test case có selector cụ thể.
  7. **[GAP-D1 / GAP-D2]** BA/PO trả lời 02 giả định treo trong `09_data_class_map.md` §2.
  8. QA Lead thống nhất nhãn verdict Giai đoạn 3 trong `00_plan.md` và đóng 04 mục Human-Final tại `06_coverage_review.md` §4.
- *(Lưu ý: Đây là khuyến nghị kỹ thuật dựa trên dữ liệu. Quyết định Go/No-Go cuối cùng thuộc về QA Lead / Quản lý dự án).*

> **Lộ trình rút gọn:** Nếu chỉ hoàn thành điều kiện **1, 2, 3, 6**, mức khuyến nghị có thể nâng lên `RECOMMEND CONDITIONAL GO` cho **25/34 test case** khả thi trên Live (loại trừ 06 ca subtotal không tái hiện được và 03 ca phụ thuộc backend).

---
## ❓ CÂU HỎI MỞ (Cần BA / PO / Tech Lead xác nhận)
1. **Phí vận chuyển & freeship:** Với đơn ≥ 200.000 ₫ đã áp voucher, tổng thanh toán là `subtotal − discount` (freeship, đúng như Web Live) hay vẫn cộng 30.000 ₫ phí ship như bộ dữ liệu `10_dataset.md` đang giả định? *(Chặn `DATA-01`.)*
2. **Tái hiện giá trị biên:** Hệ thống sẽ bổ sung sản phẩm/cơ chế nào để tạo được subtotal 199.000 / 250.000 / 299.000 / 333.333 / 499.000 / 210.000 ₫? Nếu không có, các ca biên này chuyển sang kiểm thử tầng API hay chấp nhận bỏ? *(Chặn `DATA-04`.)*
3. **Sản phẩm không tồn tại:** `VCHR-031` dùng *"Phụ kiện móc khóa" 60.000 ₫* — sản phẩm này sẽ được thêm vào catalog hay test case cần thiết kế lại theo 3 sản phẩm hiện có?
4. **Môi trường backend:** Có môi trường nào có API + database để kiểm chứng trừ/hoàn lượt dùng voucher (`VCHR-032`, `VCHR-033`) và rate limiting chống brute-force (`VCHR-027`) không? Nếu không, 03 ca này xử lý thế nào trong đợt Automation này?
5. **Màn hình Quản lý đơn hàng:** `VCHR-033` yêu cầu thao tác "Hủy đơn hàng" nhưng danh mục locator hiện chưa có màn hình này. Chức năng đã tồn tại trên Live chưa?
6. **`discount_value`:** ShopGo có cho phép tạo mã giảm giá với phần trăm thập phân (7.5%, 12.5%) tại Back-office không? *(`GAP-D1`, đang mang nhãn `[GIẢ ĐỊNH]`.)*
7. **`order_subtotal`:** Có trần giá trị đơn hàng tối đa được phép áp voucher (ví dụ đơn mua sỉ > 100 triệu ₫) không? *(`GAP-D2`, đang mang nhãn `[GIẢ ĐỊNH]`.)*
8. **Ngưỡng phản hồi UI:** `VCHR-030` theo ma trận dữ liệu yêu cầu phản hồi "< 500ms" — đây có phải tiêu chí nghiệm thu chính thức của PO, hay chỉ là kỳ vọng nội bộ của QA?
9. **Human-Final tồn đọng từ `06_coverage_review.md` §4:** (a) mức nghiêm trọng nghiệp vụ của `VCHR-011`; (b) 34 test case đã đủ sâu chưa hay cần bổ sung ca concurrency đa tab; (c) tác động chéo sang VAT / báo cáo doanh thu; (d) có cần ca kiểm thử mạng chập chờn (3G throttling) khi bấm Áp dụng không?
