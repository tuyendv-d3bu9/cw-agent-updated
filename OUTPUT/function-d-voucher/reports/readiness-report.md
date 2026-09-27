# QA Design-time Readiness Report: Function D — Áp Dụng Mã Giảm Giá (Voucher) · `function-d-voucher`
Owner: `agents/qa-readiness-evaluator/skills/gen-readiness-report.md` · Nguồn: `03_viewpoint_report.md`, `04_test_idea_report.md`, `05_test_blueprint.json`, `05_test_case_spec.md`, `testcases/batch_01.md`, `07_web_journey_discovery.md`, `07b_ui_locator_map.md`, `09_data_class_map.md`, `10_dataset.md`, `11_boundary_negative_dataset.md`, `12_data_validation_traceability.md`, `06_coverage_review.md`, `INPUT/.../03_dev/environment.md`, bundle FE Live · Phiên bản: **v2** (2026-09-27, thay thế bản v1 `RECOMMEND NO-GO`) · **Verdict: `RECOMMEND CONDITIONAL GO`**

## 1. Tổng quan (Overview)
- **Feature / Phạm vi:** Áp dụng mã giảm giá tại màn hình Thanh toán ShopGo — 34 test case (`VCHR-001` → `VCHR-034`), 06 viewpoint, đối chiếu Web Live `https://cwshopgo.github.io/`.
- **Mục tiêu báo cáo:** Đánh giá độ chín test design trước khi viết kịch bản Playwright E2E.
- **Thay đổi so với bản v1:** Toàn bộ 03 Data Issue mức chặn đã được khắc phục và **đã kiểm chứng lại độc lập**; 04 giả định treo đã được BA/PO chốt; `GAP-L1` đã đóng bằng bản đồ locator trích từ mã nguồn ứng dụng thật. Đổi lại, việc bóc tách mã nguồn FE làm lộ **một nhóm lệch mới giữa kỳ vọng thiết kế và hành vi FE** (Mục 4.2) — đây là lý do vẫn ở mức `CONDITIONAL GO` thay vì `GO`.
- **Nguồn dữ liệu đã nạp:**
  - Kế hoạch slot: `03_viewpoint_report.md` + `04_test_idea_report.md` (**Đã nạp** — dự án không dùng `coverage-plan.json`)
  - Test case: `05_test_case_spec.md`, `testcases/batch_01.md` (**Đã nạp** — định dạng Markdown có cấu trúc, parse bằng field-aware record parser theo block `### TC_ID:`, không đếm dòng thô)
  - Test data & validation: `10_dataset.md`, `11_boundary_negative_dataset.md`, `12_data_validation_traceability.md` (**Đã nạp**)
  - Spec & rule: `01_requirement_risk_summary.md`, `02_missing_rule_report.md`, `knowledge/features/function-d-voucher.md` (**Đã nạp**)
  - Review: `06_coverage_review.md` (**Đã nạp 1 file**)
  - Môi trường: `environment.md`, `live_ui_locators.md`, `07b_ui_locator_map.md` (**Đã nạp**)

## 2. Coverage (Planned Slots vs. Actual Test Cases)

| Viewpoint ID | Tên Viewpoint | Planned Slots | Actual Test Cases | Delta | Ghi chú & Nhận diện Drift |
|---|---|---|---|---|---|
| `VP-01` | Happy Path | 5 | 5 | 0 | Khớp tuyệt đối (TI-01→TI-05) |
| `VP-02` | Negative | 8 | 8 | 0 | Khớp tuyệt đối (TI-06→TI-13) |
| `VP-03` | Boundary | 9 | 9 | 0 | Khớp tuyệt đối (TI-14→TI-22) |
| `VP-04` | Security | 5 | 5 | 0 | Khớp tuyệt đối (TI-23→TI-27) |
| `VP-05` | UX/Usability | 3 | 3 | 0 | Khớp tuyệt đối (TI-28→TI-30) |
| `VP-06` | Integration | 4 | 4 | 0 | Khớp tuyệt đối (TI-31→TI-34) |
| **TỔNG** | | **34** | **34** | **0** | Blueprint 34 ↔ Spec 34 ↔ Batch 34, tập ID trùng khớp 100% |

*Phân tích Delta:* Không có coverage drift. Slot `assumed`: 0. Slot `context_limited`: **14 test case** bị giới hạn bởi năng lực thực tế của môi trường FE (chi tiết Mục 4.2 và Mục 7).

## 3. Ma trận Truy vết (Traceability)
- **Tỷ lệ Test Case có Trace:** **100%** (34/34) — đủ `Rule#`, `Viewpoint#`, `Module#`; 0 bản ghi thiếu trace.
- **Cấu trúc 8 trường:** 34/34 đầy đủ, không trường rỗng.
- **Độ phủ rule:** `BR-01`:3 · `BR-02`:5 · `BR-03`:2 · `BR-04`:9 · `BR-05`:5 · `BR-06`:7 · `BR-07`:2 · `BR-08`:1 · `BR-09`:1 · `BR-10`:4 → 10/10 BR có ≥ 1 test case.
- **Cảnh báo Rule chưa Confirm:** **Không có.** `BR-01`→`BR-10`, `MR-01`→`MR-07` và 04 gap mới (`GAP-D1`, `GAP-D2`, `GAP-E1`, `GAP-E2`) đều ở trạng thái `Confirmed`. Không test case nào map vào rule có cờ `needs_clarification`.
- **Ánh xạ Test Case ↔ Dữ liệu:** **Đã khắc phục.** Kiểm chứng lại 34/34 dòng ma trận `12_...` khớp đúng tiêu đề trong `05_test_case_spec.md`; `VCHR-011` đã đồng bộ (300.000 ₫ → 150.000 ₫).

## 4. Sẵn sàng về Dữ liệu Kiểm thử (Data Readiness)

### 4.1. FACT Check — đã kiểm chứng lại độc lập
| Tiêu chí | Kết quả v1 | Kết quả v2 (đối soát lại 2026-09-27) |
|---|---|---|
| **F** — Factual | ❌ Không đạt | ✅ **Đạt** — mã voucher, tài khoản, ngưỡng đều khớp mã nguồn FE. *(Còn 1 tồn đọng: `VCHR-031` vẫn dùng sản phẩm "Phụ kiện móc khóa" không tồn tại — xem `FIX-01`.)* |
| **A** — Accurate | ❌ Không đạt | ✅ **Đạt** — 0/10 bản ghi `DS-VAL-*` còn vi phạm freeship; công thức `total = subtotal − discount + ship` đúng 100%. Khớp logic FE: `shippingFee = subtotal >= 200.000 ? 0 : 30.000`. |
| **C** — Complete | ✅ Đạt | ✅ **Đạt** — phủ đủ 5 Data Class và chuỗi biên 6 mốc. |
| **T** — Testable | ✅ Đạt | ✅ **Đạt** — mỗi record có mục đích và kỳ vọng nhị phân. |

**Data Issues v1 — trạng thái xử lý:**
| Mã | Nội dung | Trạng thái |
|---|---|---|
| `DATA-01` | 9/10 bản ghi `DS-VAL-*` cộng phí ship cho đơn đã freeship | ✅ **Đã sửa & kiểm chứng** (0 vi phạm) |
| `DATA-02` | Ma trận truy vết gán sai ngữ nghĩa 7 TC ID | ✅ **Đã sửa & kiểm chứng** |
| `DATA-03` | 14 record mồ côi trái khẳng định "Zero Orphan" | ✅ **Đã sửa & kiểm chứng** (0 record mồ côi) |
| `DATA-05` | Lệch dữ liệu `VCHR-011` giữa spec và ma trận | ✅ **Đã sửa** |
| `DATA-06` | 02 trường treo nhãn `[GIẢ ĐỊNH]` | ✅ **Đã chốt** — `GAP-D1`: chỉ số nguyên phần trăm · `GAP-D2`: không giới hạn trần đơn hàng |
| `DATA-04` | 06 mốc subtotal không tái hiện được | 🟡 **Đã có phương án** — catalog thật có **6 sản phẩm** (không phải 3), cho phép thay bằng cặp biên khả thi (Mục 4.3). Còn 1 mốc không thay được: 333.333 ₫. |

### 4.2. ⚠️ Phát hiện mới: Lệch giữa kỳ vọng thiết kế và hành vi Frontend thật
Bóc tách mã nguồn ứng dụng Live cho thấy **FE chưa hiện thực một số quy tắc mà BA/PO đã chốt**. Đây **không phải lỗi thiết kế test** — mà là các điểm sẽ FAIL khi chạy, cần BA/Dev quyết định là *bug cần sửa* hay *hạ kỳ vọng theo FE*:

| TC ID | Kỳ vọng theo rule đã chốt | Hành vi FE thật | Rule liên quan |
|---|---|---|---|
| `VCHR-011` | Tự động **gỡ** voucher + disable form + toast cảnh báo | FE **giữ nguyên mã**, chỉ hiện cảnh báo vàng `Mã "X" chưa đủ điều kiện áp dụng` và đặt `discount = 0` | `MR-02` |
| `VCHR-028` | Nút Áp dụng bị `disabled` + spinner khi submit | FE **không có** thuộc tính `disabled`, không có trạng thái loading | `MR-05` |
| `VCHR-020` | Mã 2 ký tự ➔ lỗi "quá ngắn / sai định dạng" | FE báo `Mã giảm giá "V1" không tồn tại trên hệ thống.` | `MR-01` |
| `VCHR-022` | Ô input chặn không cho gõ ký tự thứ 21 | FE **không có `maxlength`** — gõ được không giới hạn | `MR-01` |
| `VCHR-023` | Ký tự đặc biệt / emoji ➔ `"Mã không đúng định dạng."` | FE **không có regex** `^[A-Z0-9]{3,20}$`, báo "không tồn tại" | `MR-01` |
| `VCHR-024` | `GIAM 50K` ➔ `"Mã không đúng định dạng."` | FE chỉ `trim()` hai đầu, báo "không tồn tại" | `MR-01` |
| `VCHR-025` / `VCHR-026` | Chặn XSS / SQLi kèm cảnh báo định dạng | FE an toàn (React tự escape) nhưng thông báo là "không tồn tại" | `BR-05`, `MR-01` |
| `VCHR-031` | Giảm 50.000 ₫ trên tiền hàng, **giữ nguyên phí ship 30.000 ₫** | **Không quan sát được**: ngưỡng freeship (200k) trùng mức sàn voucher (200k) ➔ mọi đơn áp được mã đều đã freeship | `BR-09` |
| `VCHR-019` | Chiết khấu % làm tròn xuống `Math.floor()` | FE **không gọi `Math.floor()`**; và giá lẻ 333.333 ₫ không tạo được (mọi giá là bội số 10.000 ₫) | `MR-04` |

**Tính năng không tồn tại trên FE (không có backend):**
| TC ID | Tính năng cần có | Hiện trạng |
|---|---|---|
| `VCHR-027` | Rate limiting chống brute-force | Không có cơ chế nào |
| `VCHR-032` | Trừ lượt dùng voucher khi đặt hàng | Voucher **không có trường `usageLimit`/`usageCount`** |
| `VCHR-033` | Hoàn lượt dùng khi hủy đơn | **Không có thao tác hủy từng đơn** — chỉ có "xóa sạch toàn bộ lịch sử" |

> ✅ **Tin tốt cho `VCHR-034`**: đơn hàng lưu ở `localStorage["shopgo_orders"]` với đủ trường `orderId`, `userId`, `date`, `items`, `subtotal`, `shippingFee`, `discount`, `total`, `appliedCode` ➔ Playwright **kiểm chứng được** bằng `page.evaluate(() => localStorage.getItem('shopgo_orders'))`.

### 4.3. Mốc biên thay thế (tái hiện được trên catalog thật)
| Mục tiêu | Giá trị cũ | Giá trị thay thế | Giỏ hàng |
|---|---|---|---|
| Cận dưới sàn 200k (`VCHR-014`) | 199.000 ₫ | **190.000 ₫** | `prod-005` × 1 |
| Dưới min SALE20 (`VCHR-009`) | 250.000 ₫ | **200.000 ₫** | `prod-003` × 1 |
| Cận dưới min SALE20 (`VCHR-016`) | 299.000 ₫ | **280.000 ₫** | `prod-004` × 1 |
| Cận dưới trần maxCap (`VCHR-018`) | 499.000 ₫ | **490.000 ₫** (giảm 98.000 ₫) | `prod-001` × 2 + `prod-005` × 1 |
| Chạm trần maxCap (`VCHR-018`) | 500.000 ₫ | 500.000 ₫ (giữ nguyên) | `prod-001` × 1 + `prod-002` × 1 |
| Tiền lẻ `Math.floor()` (`VCHR-019`) | 333.333 ₫ | **Không thay thế được** | — |

## 5. Danh sách Gaps & Giả định (Gaps & Assumptions)

| Gap ID | Mô tả | Status | Quyết định / Giả định hiện tại | Cần BA làm rõ? |
|---|---|---|---|---|
| `MR-01` → `MR-07` | 07 kẽ hở 06W | **Confirmed** (2026-09-20) | Đã chốt đầy đủ phương án | No |
| `GAP-D1` | `discount_value` có chấp nhận % thập phân? | **Confirmed** (2026-09-27) | **Chỉ số nguyên phần trăm** | No |
| `GAP-D2` | Trần giá trị đơn hàng tối đa? | **Confirmed** (2026-09-27) | **Không giới hạn** — đơn lớn vẫn áp mã bình thường | No |
| `GAP-E1` | Môi trường có backend không? | **Confirmed** (2026-09-27) | **Không có backend** — SPA thuần FE, dữ liệu ở `localStorage`; kỳ vọng đối chiếu theo FE | No |
| `GAP-E2` | Sản phẩm "Phụ kiện móc khóa 60.000 ₫" | **Confirmed** (2026-09-27) | **Không tồn tại** — catalog thật 6 sản phẩm (150k/350k/200k/280k/190k/120k) | No |
| `GAP-L1` | Thiếu locator cho giỏ hàng, toast, hủy đơn | **Đã đóng** (2026-09-27) | Bản đồ locator đầy đủ tại `07b_ui_locator_map.md`, trích từ mã nguồn Live | No |
| `GAP-F1` | FE chưa hiện thực `MR-01` (regex format), `MR-02` (tự gỡ mã), `MR-05` (disable nút) | **Treo** | Chưa rõ là *bug cần Dev sửa* hay *hạ kỳ vọng theo FE* | **Yes** |
| `GAP-F2` | Ngưỡng freeship (200k) trùng mức sàn voucher (200k) khiến `BR-09` không quan sát được | **Treo** | Chỉ khẳng định gián tiếp qua công thức tổng tiền | **Yes** |

## 6. Kết quả Review Thiết kế (Review Findings)
- **Tally:** `PASS`: **6** | `FIX`: **0** | `ASK`: **0 đang mở**.
- **Điểm đã đóng từ v1:** 03 Data Issue chặn; nhãn verdict Giai đoạn 3 trong `00_plan.md` đã thống nhất về `PASS`; ghi chú backend tại `06_coverage_review.md` §3 nay đã có kết luận chính thức (không có backend).
- **Còn chờ Human-Final** (`06_coverage_review.md` §4): mức nghiêm trọng nghiệp vụ của `VCHR-011`; 34 TC đã đủ sâu chưa (có cần ca concurrency đa tab?); tác động chéo sang VAT / báo cáo doanh thu; ca network throttling 3G.

## 7. Khuyến nghị Go / No-Go cho Automation
- **Khuyến nghị của Agent:** **`RECOMMEND CONDITIONAL GO`**
- **Căn cứ:**
  - ✅ Trace 100% (34/34) · Delta coverage 0 · 34/34 đủ 8 trường · 10/10 BR + 7/7 MR + 4 GAP mới đều `Confirmed` · 0 mục `FIX` · Dữ liệu đạt đủ 4 tiêu chí FACT sau khắc phục · Locator đã đầy đủ và trích từ mã nguồn thật.
  - 🟡 Chưa đạt `GO` vì: **11 test case** có kỳ vọng lệch hành vi FE (`GAP-F1`, `GAP-F2`) cần BA/Dev phân định bug-hay-hạ-kỳ-vọng, và **03 test case** không có tính năng tương ứng trên FE.

- **Phân loại 34 test case theo mức sẵn sàng Automation:**

| Nhóm | Số lượng | Test Case | Hành động |
|---|---|---|---|
| ✅ **Sẵn sàng viết script ngay** | **16** | `VCHR-001`→`008`, `010`, `012`, `013`, `015`, `017`, `029`, `030`, `034` | Triển khai POM + script |
| 🔵 **Sẵn sàng sau khi đổi giá trị biên** | **4** | `VCHR-009`, `014`, `016`, `018` | Áp bảng thay thế Mục 4.3 |
| 🟡 **Chờ BA/Dev phân định trước khi code** | **11** | `VCHR-011`, `019`, `020`, `021`, `022`, `023`, `024`, `025`, `026`, `028`, `031` | Xem Mục 4.2 |
| ⛔ **Ngoài phạm vi Automation đợt này** | **3** | `VCHR-027`, `032`, `033` | Tính năng không tồn tại trên FE |

> **Phạm vi khuyến nghị mở cổng:** **20/34 test case** (nhóm ✅ và 🔵) được phép chuyển sang `qa-automation` ngay. 11 ca nhóm 🟡 chờ quyết định, 3 ca nhóm ⛔ đóng lại đợt này.

- **Điều kiện tiên quyết còn lại:**
  1. **`FIX-01`** — `qa-test-design` sửa `VCHR-031`: bỏ sản phẩm "Phụ kiện móc khóa", và xử lý xung đột ngưỡng freeship ↔ mức sàn voucher (`GAP-F2`).
  2. **`FIX-02`** — Cập nhật giá trị biên cho `VCHR-009`, `014`, `016`, `018` theo bảng Mục 4.3, đồng bộ lại `11_boundary_negative_dataset.md` và ma trận truy vết.
  3. **`ASK-01`** — BA/Dev phân định nhóm 🟡: FE thiếu `MR-01`/`MR-02`/`MR-05` là bug cần sửa (giữ nguyên kỳ vọng, chấp nhận FAIL để báo lỗi) hay hạ kỳ vọng theo FE hiện tại?
  4. **`FIX-03`** — Sau khi có `ASK-01`, cập nhật Expected Result của 11 test case nhóm 🟡.
  5. **`FIX-04`** — Loại `VCHR-027`, `032`, `033` khỏi phạm vi Automation, ghi chú lý do vào `06_coverage_review.md`.
- *(Lưu ý: Đây là khuyến nghị kỹ thuật dựa trên dữ liệu. Quyết định Go/No-Go cuối cùng thuộc về QA Lead / Quản lý dự án).*

---
## ❓ CÂU HỎI MỞ (Cần BA / PO / Tech Lead xác nhận)
1. **`GAP-F1` — FE thiếu 3 quy tắc đã chốt:** Không có regex chặn định dạng (`MR-01`), không tự gỡ voucher khi giỏ tụt dưới mức sàn (`MR-02`), không disable nút Áp dụng (`MR-05`). Đây là **bug cần Dev sửa**, hay chấp nhận hành vi FE hiện tại và hạ kỳ vọng test case?
2. **`GAP-F2` — Xung đột ngưỡng:** Miễn phí vận chuyển từ 200.000 ₫ trùng đúng mức sàn voucher 200.000 ₫, khiến `BR-09` (voucher không giảm phí ship) không thể quan sát trực tiếp. Có điều chỉnh một trong hai ngưỡng, hay chấp nhận kiểm chứng gián tiếp qua công thức tổng tiền?
3. **`VCHR-019` — Làm tròn `Math.floor()`:** Mọi giá sản phẩm đều là bội số 10.000 ₫ nên không bao giờ phát sinh tiền lẻ; FE cũng không gọi `Math.floor()`. Có cần thêm sản phẩm giá lẻ để kiểm chứng `MR-04`, hay đóng test case này?
4. **`VCHR-027` / `032` / `033`:** Xác nhận chính thức đóng 03 ca này khỏi phạm vi đợt hiện tại (không có rate limiting, không có hạn mức lượt dùng, không có chức năng hủy từng đơn)?
5. **Bổ sung `id` cho nút tăng/giảm số lượng:** Hiện phải định vị gián tiếp qua DOM cha của `#input-qty-prod-00X`. Dev có bổ sung `id` ổn định không (ảnh hưởng độ bền script `VCHR-011`)?
6. **Human-Final tồn đọng** (`06_coverage_review.md` §4): (a) mức nghiêm trọng nghiệp vụ của `VCHR-011`; (b) có cần bổ sung ca concurrency đa tab; (c) tác động chéo sang VAT / báo cáo doanh thu; (d) có cần ca network throttling 3G?
