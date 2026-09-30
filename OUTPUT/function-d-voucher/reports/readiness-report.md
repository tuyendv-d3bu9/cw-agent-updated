# QA Design-time Readiness Report: Function D — Áp Dụng Mã Giảm Giá (Voucher) · `function-d-voucher`
Owner: `agents/qa-readiness-evaluator/skills/gen-readiness-report.md` · Nguồn: `knowledge/_project.md`, `knowledge/features/function-d-voucher.md` (Mục 4, 5, 7, 8 #1→#23), `INPUT/.../02_ba/spec_function_d.md`, `spec_function_d_addendum_01_voucher_format.md`, `spec_function_d_addendum_02_environment_shipping.md`, `INPUT/.../03_dev/environment.md`, `05_test_case_spec.md`, `05_test_blueprint.json`, `testcases/batch_01.md`, `06_coverage_review.md`, `07b_ui_locator_map.md`, `09_data_class_map.md`, `10_dataset.md`, `11_boundary_negative_dataset.md`, `12_data_validation_traceability.md`, `dataset_schema.json`, `00_plan.md`, `04_test_idea_report.md` · Phiên bản: **v3.1** (2026-09-30, kiểm chứng lại sau khi QA Lead áp dụng FIX của v3) · **Verdict: `RECOMMEND CONDITIONAL GO`**

## 1. Tổng quan (Overview)
- **Feature / Phạm vi:** Áp dụng mã giảm giá tại màn hình Thanh toán ShopGo — **36 test case** (`VCHR-001` → `VCHR-036`), 06 viewpoint, đối chiếu Web Live `https://cwshopgo.github.io/` (SPA thuần frontend, không backend/API — Phụ lục 02 E-01, E-04).
- **Mục tiêu báo cáo:** Xác nhận lại độ chín test design sau đợt sửa của QA Lead, trước khi viết kịch bản Playwright E2E.
- **Thay đổi so với v3:** Toàn bộ **4 điều kiện tiên quyết** của v3 (`V3-FIX-01`→`05`, `V3-DATA-01`, `02`) đã được **kiểm chứng độc lập là đã xử lý** (Mục 6.1). Còn lại 2 điểm tài liệu lỗi thời mức minor (không chặn) và các câu hỏi mở nghiệp vụ/kỹ thuật.
- **Nguồn dữ liệu đã nạp:**
  - Kế hoạch slot: `04_test_idea_report.md` (**Đã nạp** — dự án không dùng `coverage-plan.json`)
  - Test case: `05_test_case_spec.md` + `testcases/batch_01.md` + `05_test_blueprint.json` (**Đã nạp** — parse theo block `### TC_ID:` bằng field-aware parser, không đếm dòng thô: 36 / 36 / 36 bản ghi)
  - Test data & validation: `09`, `10`, `11`, `12`, `dataset_schema.json` (**Đã nạp**)
  - Spec & rule: `spec_function_d.md`, Phụ lục 01, Phụ lục 02, `environment.md`, `knowledge/features/function-d-voucher.md` (**Đã nạp**)
  - Review: `06_coverage_review.md` (**Đã nạp 1 file**)
  - Hành vi FE thật: `07b_ui_locator_map.md` (**Đã nạp**)

## 2. Coverage (Planned Slots vs. Actual Test Cases)

| Viewpoint ID | Tên Viewpoint | Planned Slots (`04`) | Actual Test Cases (`05`) | Delta | Ghi chú & Nhận diện Drift |
|---|---|---|---|---|---|
| `VP-01` | Happy Path | 5 | 5 | 0 | `VCHR-001`→`005` |
| `VP-02` | Negative | 8 | 8 | 0 | `VCHR-006`→`013` |
| `VP-03` | Boundary | 9 | 9 | 0 | `VCHR-014`→`022` |
| `VP-04` | Security | 5 | 5 | 0 | `VCHR-023`→`027` |
| `VP-05` | UX/Usability | 3 | 3 | 0 | `VCHR-028`→`030` |
| `VP-06` | Integration | 4 | 6 | **+2** | `VCHR-035`, `036` bổ sung theo uỷ quyền QA Lead (`knowledge` Mục 8 #19) |
| **TỔNG** | | **34** | **36** | **+2** | Blueprint 36 ↔ Spec 36 ↔ Batch 36, tập ID trùng khớp 100% |

*Phân tích Delta:*
- Delta +2 ở `VP-06` có căn cứ nghiệp vụ (#19) nhưng `04_test_idea_report.md` vẫn chưa có Test Idea tương ứng (`❓` #7).
- Slot `assumed`: **1** — `VCHR-036` (Expected Result `[GIẢ ĐỊNH – rủi ro MED]`).
- Slot `context_limited`: **4** — `VCHR-019` (tạm đóng), `VCHR-027`, `032`, `033` (ngoài phạm vi).

## 3. Ma trận Truy vết (Traceability)
- **Tỷ lệ Test Case có Trace:** **100%** (36/36) — đủ `Rule#`, `Viewpoint#`, `Module#`.
  - `VCHR-020`→`026` nay gắn thêm `Rule#MR-01` ✅.
  - `VCHR-035` gắn thêm `Spec#PL02-E02`, `Spec#PL02-E03`; `VCHR-036` gắn thêm `Spec#PL02-E02` ✅.
- **Độ phủ rule (theo tag `05`):** `BR-01`:3 · `BR-02`:5 · `BR-03`:2 · `BR-04`:9 · `BR-05`:5 · `BR-06`:7 · `BR-07`:2 · `BR-08`:1 · `BR-09`:1 · `BR-10`:4 · `MR-01`:7 · `MR-02`:1 · `MR-05`:1 · `GAP-H2`/`PL02`:2. Mọi BR còn ≥ 1 TC thuộc phạm vi thực thi; `MR-04`, `MR-06`, `MR-07` không có TC thực thi theo quyết định #15, #16.
- **Cảnh báo Rule chưa Confirm:**
  - `VCHR-036`: Expected Result là `[GIẢ ĐỊNH]` ("không mất đơn giữa 2 tab") — `❓` #1.
  - Không TC nào map vào rule có cờ `needs_clarification`.

### 3.1. Đối soát tiêu đề & ánh xạ dữ liệu (kiểm bằng script, chạy lại v3.1)
- `05_test_blueprint.json` ↔ `05_test_case_spec.md`: **36/36 tiêu đề khớp nguyên văn**.
- Ma trận `12_...` §3 ↔ `05_test_case_spec.md`: **36/36 khớp nguyên văn**.
- `05_test_case_spec.md` ↔ `testcases/batch_01.md`: **nội dung TC trùng khớp** (chỉ khác dấu phân cách cuối file do công cụ merge).
- Record: `10` (12 ID, gồm `DS-VAL-10` tạm đóng) + `11` (27 ID, thêm `DS-NEG-14`) = 39 ID; **0 record mồ côi**, **0 tham chiếu tới record không tồn tại**.

### 3.2. Đối soát thông báo kỳ vọng
| Nhóm | TC | Đối chiếu | Kết quả |
|---|---|---|---|
| Hành vi FE (`07b` §3) | `006`, `007`, `008`, `009`, `010`, `011`, `014`, `016`, `021` | Nguyên văn thông báo rỗng / không tồn tại / hết hạn / chưa đạt tối thiểu / cảnh báo vàng | ✅ Khớp (`008` nay là "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 150.000 ₫)." + tổng 180.000 ₫) |
| Phụ lục 01 | `020`, `023`, `024`, `025`, `026` | "Mã giảm giá không đúng định dạng." | ✅ Khớp |
| Phụ lục 01 F-03 | `022` | Ô nhập dừng ở 20 ký tự đầu | ✅ Khớp |
| Chưa có căn cứ trong `07b` | `005` (badge tự áp dụng), `029` (nhãn "Đang kích hoạt giảm giá") | `07b` §1.3 không mô tả | ⚠️ `❓` #2 |
| Định dạng số trong thông báo | `008`, `009`, `014`, `016`, `DS-BND-01/04`, `DS-NEG-10/13/14` | `07b` §3 chỉ ghi `{min}`, `{subtotal}` | ⚠️ `❓` #3 |

## 4. Sẵn sàng về Dữ liệu Kiểm thử (Data Readiness)

### 4.1. FACT Check — kiểm chứng lại độc lập
| Tiêu chí | Kết luận `12_...` | Kết quả v3.1 |
|---|---|---|
| **F** — Faithful | PASS | ✅ **Đạt** — không còn tên sản phẩm ngoài catalog ở `05`, `batch_01`, `10`, `11`, `12`; chỉ dùng `GIAM50K`, `SALE20`, `HETHAN`, `prod-001`→`006`. |
| **A** — Accurate | PASS | ✅ **Đạt** — tính lại mọi record có tiền và 18 TC có số tiền: 0 sai lệch. `DS-VAL-08` mới: 350.000 + 0 − 50.000 = 300.000 ₫ ✅; `DS-NEG-14`: 200.000 ₫, SALE20 bị từ chối, tổng 200.000 ₫ ✅. |
| **C** — Complete | PASS | ✅ **Đạt** — `VCHR-009` có record riêng `DS-NEG-14`; `VCHR-004` có record có khoảng trắng hai đầu `DS-VAL-08`; JSON `10` §3.2 đủ 11 record dùng được. |
| **T** — Traceable/Testable | PASS | 🟡 **Đạt cơ bản** — 0 mồ côi; lệch giá trị TC ↔ record ở 7 TC đã được **ghi nhận chính thức** trong `12` §4 kèm quy tắc "script dùng giá trị trong TC"; còn 1 record `[GIẢ ĐỊNH]` (`DS-NEG-10`). |

### 4.2. Kiểm tra số học & khả năng tái hiện
- **Tổ hợp giỏ hàng:** mọi mốc tiền trong `05` (trừ `VCHR-019` tạm đóng), `10`, `11` ghép được từ catalog trong tồn kho (`prod-002` tối đa × 1 / tồn 12; `prod-006` tối đa × 2 / tồn 8).
- **`dataset_schema.json`:** `order_subtotal` nay là enum `200.000 / 240.000 / 300.000 / 350.000 / 400.000 / 450.000 / 500.000 / 600.000 / 800.000 ₫` — **cả 9 giá trị đều ghép được** (vd. 240.000 = `prod-006` × 2; 400.000 = `prod-003` × 2; 450.000 = `prod-001` × 3). Ràng buộc SALE20 ≥ 300.000 ₫ ghi ở `_note` (lọc sau khi sinh) ✅.
- **Phí ship / Tổng / SALE20 / GIAM50K:** đúng 100% như v3 (không có record nào đổi giá trị ngoài `DS-VAL-08`, `DS-NEG-14`).
- **API / HTTP / DB:** `VCHR-010` đã bỏ dòng backend ✅. Các chữ "backend"/"request" còn lại chỉ nằm ở `VCHR-026` (ghi chú "app không có backend") và `VCHR-027` (ngoài phạm vi) — không phải kỳ vọng cần kiểm.
- **Viết tắt `k`:** không còn trong `05`, `batch_01`, `09`–`12` ✅. Các chuỗi `giam50k`, `GIAM50K`, `GIAM 50K`, `@GIAM#50K!` là **mã nhập**, không phải số tiền.

### 4.3. Data Issues v3 — trạng thái
| Mã | Nội dung | Trạng thái v3.1 |
|---|---|---|
| `V3-DATA-01` | `VCHR-009` không có record riêng | ✅ **Đã sửa & kiểm chứng** — `DS-NEG-14` (SALE20, `prod-003` × 1 = 200.000 ₫ ➔ từ chối), `12` chỉ map `DS-NEG-14` |
| `V3-DATA-02` | `DS-VAL-08` không có khoảng trắng, giỏ 400.000 ₫ | ✅ **Đã sửa & kiểm chứng** — `"  giam50k  "`, `prod-002` × 1 = 350.000 ➔ 300.000 ₫, đồng bộ bảng, CSV, JSON |
| `V3-DATA-03` | Giá trị TC khác record ở `002`, `007`, `020`, `021`, `022`, `023`, `025` | ✅ **Đã có quyết định** — `12` §4 ghi rõ danh sách và quy tắc "script dùng giá trị trong TC"; không đổi kỳ vọng |
| `V3-DATA-04` | `DS-NEG-10` mang `[GIẢ ĐỊNH – LOW]` | 🟡 **Còn treo** — `❓` #5 |
| `V3-DATA-05` | Schema sinh mốc không ghép được | ✅ **Đã sửa & kiểm chứng** |
| `V3-DATA-06` | Export CSV/JSON không đồng nhất | ✅ **Đã sửa** — JSON đủ 11 record; CSV bỏ `DS-VAL-12` có giải thích (record 2 bước) |

> Không còn data issue làm sai kỳ vọng hay thiếu dữ liệu cho TC trong phạm vi Automation.

## 5. Danh sách Gaps & Giả định (Gaps & Assumptions)

| Gap ID | Mô tả Chi tiết | Status | Quyết định / Giả định hiện tại | Cần BA làm rõ? |
|---|---|---|---|---|
| `GAP-F1a` · `MR-01` | Quy tắc định dạng mã 3–20 ký tự | **Confirmed** (#20) | Theo Phụ lục 01; FE thiếu = bug; 6 ca dự kiến FAIL, `021` dự kiến PASS | No |
| `GAP-F1b` · `MR-02` | FE không tự gỡ mã | **Confirmed** (#12) | Theo web | No |
| `GAP-F1c` · `MR-05` | FE không disable nút | **Confirmed** (#13) | Theo web | No |
| `GAP-F2` · `BR-09` | Freeship trùng mức sàn voucher | **Confirmed** (#14, #21) | Kiểm chứng gián tiếp | No |
| `GAP-F3` · `MR-04` | Không có giá lẻ | **Confirmed** (#15) | `VCHR-019` tạm đóng | No |
| `GAP-S1` · `MR-06/07` | FE không có tính năng | **Confirmed** (#16) | `VCHR-027/032/033` ngoài phạm vi | No |
| `GAP-L2` | Nút +/− thiếu `id` | **Confirmed — chờ Dev** (#17) | Tạm nhập trực tiếp `#input-qty-prod-00X` | No (theo dõi Dev — `❓` #9) |
| `GAP-H1` | Mức nghiêm trọng `VCHR-011` | **Rejected** (#18) | Không còn là bug | No |
| `GAP-H2` | Bổ sung ca Human-Final | **Confirmed** (#19) | Thêm `VCHR-035`, `036` | No |
| `GAP-E1` (bổ sung) | Ca API / HTTP / DB | **Confirmed** (#22) | Loại bỏ toàn bộ | No |
| `VCHR-036` Expected | "Không mất đơn giữa 2 tab" | **Treo** — `[GIẢ ĐỊNH – rủi ro MED]` | FE dự báo lost update | **Yes** — `❓` #1 |
| `DS-NEG-10` | Form voucher khi giỏ trống | **Treo** — `[GIẢ ĐỊNH – LOW]` | Giả định có hiển thị | **Yes** — `❓` #5 |
| `BR-10` vs FE | Mức sàn chung 200.000 ₫ | **Chưa đề cập trong tài liệu** ở tầng FE | FE chỉ kiểm `minSubtotal` từng mã (`07b` §3) | **Yes** — `❓` #4 |

## 6. Kết quả Review Thiết kế (Review Findings)
- **Tally:** `PASS`: **6** | `FIX`: **2** (minor, không chặn — Mục 6.2) | `ASK`: **0 trong review** — 9 điểm cần xác nhận tại "❓ CÂU HỎI MỞ".

### 6.1. Kiểm chứng các FIX của v3
| Mã v3 | Nội dung | Kết quả kiểm chứng v3.1 |
|---|---|---|
| `V3-FIX-01` | Merge lại `05` từ `batch_01` | ✅ `001/003/008/015/017` đúng tên + `prod-id`; `05` ≡ `batch_01` |
| `V3-FIX-02` | `VCHR-010` bỏ kỳ vọng backend | ✅ Nay: thông báo + "Không áp dụng giảm giá, tổng thanh toán giữ nguyên" |
| `V3-FIX-03` | `VCHR-008` thông báo nguyên văn | ✅ Nguyên văn + giảm 0 · ship 30.000 ₫ · tổng 180.000 ₫ |
| `V3-FIX-04` | Bỏ viết tắt `k` | ✅ 0 lần xuất hiện ở số tiền (`009`, `011`, `013`, `014`, `016`, `018`, `031` đã ghi đủ số) |
| `V3-FIX-05` | Tag `013`, `030`; kỳ vọng đo được cho `030` | ✅ Cả hai `Automated`; `030` kiểm `scrollWidth <= innerWidth`, các locator nằm trọn viewport, không chồng lấn ở 375 px |
| `V3-FIX-06` | Trace `MR-01`, `PL02-E02/E03` | ✅ Đúng như mô tả |
| `V3-FIX-07` | `06` §6.2, §6.5 | ✅ §6.2 "6 ca dự kiến FAIL, `021` PASS", ghi nhận sửa tên/`k`/tag; §6.5 ghi giả định `VCHR-036`. ⚠️ §1–§3 vẫn lỗi thời — xem `V31-FIX-01` |
| `V3-FIX-08` | `00_plan.md` | ✅ 5B đã tick; Giai đoạn 6 "32 Test Cases"; "#12→#23" |
| `V3-FIX-09` | Knowledge Mục 4, 5, 8 | ✅ Mục 4 bước 5, Mục 5 E5/E6, Mục 8 #2/#5 (gạch + "thay bởi #12/#13"), #20 ("6 ca … `021` PASS"). ⚠️ Mục 7 bảng MR chưa gắn chú thích — xem `V31-FIX-02` |
| `V3-FIX-10` | `07b` §4 ghi chú `VCHR-031` | ✅ Đã ghi "Đã chốt 2026-09-30 (#14)" |

### 6.2. Điểm còn lại (minor, không chặn Automation)
- **`V31-FIX-01` — `06_coverage_review.md` §1–§3 vẫn lỗi thời, không có chú thích:** §2 `BR-02` "cận biên 299k, và đơn 250k"; `BR-04` "lưu dữ liệu DB"; `BR-07` "cận biên trần 499k"; `BR-10` "cận biên 199k"; §3 "`VCHR-032`/`033` đòi hỏi API Backend có database". Các mục này mâu thuẫn §6 và Phụ lục 02 E-04, đồng thời dùng viết tắt `k`.
- **`V31-FIX-02` — `knowledge/features/function-d-voucher.md` Mục 7 bảng `MR-01`→`MR-07`:** dòng `MR-02` ("Hệ thống tự gỡ và disable voucher") và `MR-05` ("Disable nút khi đang áp dụng") vẫn ghi phản hồi cũ ở trạng thái `Confirmed`, không trỏ tới `GAP-F1b`/`GAP-F1c` hay #12/#13 (Mục 8 đã gắn chú thích). Người đọc chỉ Mục 7 sẽ hiểu sai.
- **Ghi chú:** `00_plan.md` dòng Readiness Gate v3 ghi "Đã xử lý các FIX bắt buộc" — nay đã được v3.1 xác nhận là đúng.

## 7. Khuyến nghị Go / No-Go cho Automation
- **Khuyến nghị của Agent:** **`RECOMMEND CONDITIONAL GO`**
- **Căn cứ khuyến nghị:**
  - ✅ Trace 100% (36/36) · tiêu đề khớp 36/36 giữa blueprint, spec, batch, ma trận `12` · 0 record mồ côi · số học 100% đúng · mọi mốc tiền (kể cả schema) ghép được từ catalog · không còn kỳ vọng API/backend hay viết tắt `k` · toàn bộ điều kiện tiên quyết của v3 đã xử lý · không TC nào map rule `needs_clarification`.
  - 🟡 Chưa đạt `GO` vì theo bảng logic: còn **2 mục `FIX`** (minor, tài liệu) và **1 kỳ vọng `[GIẢ ĐỊNH]`** (`VCHR-036`) + 1 record `[GIẢ ĐỊNH]` (`DS-NEG-10`), cùng Delta +2 chưa phản ánh vào `04`.
  - Không kích hoạt `NO-GO`.

- **Phân loại 36 test case theo mức sẵn sàng Automation:**

| Nhóm | Số lượng | Test Case | Ghi chú |
|---|---|---|---|
| ✅ **Sẵn sàng viết script** (kỳ vọng khớp hành vi FE) | **25** | `VCHR-001`→`018` (18 ca), `021`, `028`, `029`, `030`, `031`, `034`, `035` | `005`, `029`: xác nhận hành vi badge / nhãn khi dựng POM (`❓` #2) |
| 🔴 **Sẵn sàng nhưng dự kiến FAIL** (ca tìm lỗi) | **7** | `VCHR-020`, `022`, `023`, `024`, `025`, `026` (FE chưa hiện thực Phụ lục 01 — #20) · `VCHR-036` (FE dự báo lost update) | FAIL = lập defect, không phải blocker. `025`: phần an ninh dự kiến PASS, phần thông báo dự kiến FAIL (`❓` #6). `036`: cần BA xác nhận kỳ vọng trước khi lập defect (`❓` #1) |
| ⏸️ **Tạm đóng** | **1** | `VCHR-019` | #15 |
| ⛔ **Ngoài phạm vi Automation** | **3** | `VCHR-027`, `032`, `033` | #16 |
| **Tổng** | **36** | | |

> **Phạm vi khuyến nghị mở cổng:** **32/36 test case** (25 ✅ + 7 🔴) có thể chuyển sang `qa-automation` **ngay** — không còn điều kiện tiên quyết chặn cổng.

- **Việc làm song song (không chặn cổng):**
  1. `V31-FIX-01` — `qa-test-design` gắn chú thích lỗi thời hoặc viết lại `06` §1–§3 theo §6.
  2. `V31-FIX-02` — chủ knowledge (skill `01`/`02`) gắn chú thích "thay bởi `GAP-F1b`/#12", "thay bởi `GAP-F1c`/#13" cho dòng `MR-02`, `MR-05` ở Mục 7.
  3. Trả lời "❓ CÂU HỎI MỞ", đặc biệt #1 trước khi lập defect cho `VCHR-036`.
- *(Lưu ý: Đây là khuyến nghị kỹ thuật dựa trên dữ liệu. Quyết định Go/No-Go cuối cùng thuộc về QA Lead / Quản lý dự án).*

---
## ❓ CÂU HỎI MỞ (Cần BA / PO / Tech Lead xác nhận)
1. **`VCHR-036` — Kỳ vọng khi đặt hàng ở 2 tab** (BA): "Cả 2 đơn đều được lưu" là `[GIẢ ĐỊNH]` do QA Lead chốt theo uỷ quyền #19; mã nguồn FE dự báo đơn của Tab A bị ghi đè. Đây là yêu cầu nghiệp vụ (FAIL = bug) hay chấp nhận hành vi hiện tại?
2. **`VCHR-005`, `VCHR-029` — Hành vi chưa được ghi nhận** (Tech Lead / `qa-exploratory`): Bấm badge có tự áp dụng mã không cần bấm "Áp dụng"? Nhãn "Đang kích hoạt giảm giá" có tồn tại? `07b` §1.3 chưa mô tả.
3. **Định dạng số trong thông báo** (Tech Lead / `qa-exploratory`): `07b` §3 chỉ ghi `{min}`, `{subtotal}`, `{...}`. Xác nhận FE hiển thị dạng "200.000 ₫" như các TC và record đang kỳ vọng.
4. **`BR-10` — Mức sàn chung 200.000 ₫** (BA): FE chỉ kiểm `minSubtotal` từng mã (`HETHAN` có min 100.000 ₫); `VCHR-008/014/015` thực chất kiểm `minSubtotal` của `GIAM50K`. Có cần sàn chung độc lập với từng mã không?
5. **`DS-NEG-10` — Giỏ trống** (BA / Tech Lead): Form voucher có hiển thị khi giỏ hàng trống không?
6. **`VCHR-025` — Tách assertion** (QA Lead): Tách phần an ninh (không thực thi script, dự kiến PASS) khỏi phần thông báo định dạng (dự kiến FAIL)?
7. **Delta +2 ở `VP-06`** (QA Lead): Ghi `VCHR-035`, `036` vào `04_test_idea_report.md` thành Test Idea chính thức?
8. **`environment.md` — thông báo `HETHAN`** (BA / Dev): §1 ghi "Mã giảm giá đã hết hạn sử dụng." (không có mã), §2 ghi `Mã giảm giá "<MÃ>" đã hết hạn sử dụng.`; `07b` §3 (mã nguồn) xác nhận dạng có mã, `VCHR-006` theo dạng có mã.
9. **`GAP-L2`** (Dev): Thời điểm bổ sung `id` cho nút +/− (ảnh hưởng độ bền script `VCHR-011`).

---

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|
| `V31-FIX-01` | `06_coverage_review.md` §1 (Góc nhìn 3), §2 (`BR-02`, `BR-04`, `BR-07`, `BR-10`), §3 | Mốc 199k/250k/299k/499k, "lưu dữ liệu DB", "đòi hỏi API Backend có database" lỗi thời, dùng viết tắt `k`, mâu thuẫn §6 và Phụ lục 02 E-04 | Viết lại theo §6.4 (190.000 / 200.000 / 240.000 ₫; 280.000 / 300.000 / 310.000 ₫; 490.000 / 500.000 / 510.000 ₫), đổi "DB" thành `localStorage["shopgo_orders"]`, §3 dẫn quyết định #16 |
| `V31-FIX-02` | `knowledge/features/function-d-voucher.md` Mục 7, dòng `MR-02`, `MR-05` | Phản hồi cũ vẫn `Confirmed`, không trỏ tới quyết định thay thế | Thêm chú thích "thay bởi `GAP-F1b` / Mục 8 #12" và "thay bởi `GAP-F1c` / Mục 8 #13" (không xoá dòng — theo luật ghi knowledge) |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
| 1 | `VCHR-036` | Xác nhận kỳ vọng "không mất đơn giữa 2 tab" | BA |
| 2 | `VCHR-005`, `029` | Xác nhận hành vi badge tự áp dụng và nhãn "Đang kích hoạt giảm giá" | Tech Lead / `qa-exploratory` |
| 3 | `07b` §3 | Định dạng số trong thông báo | Tech Lead / `qa-exploratory` |
| 4 | `BR-10` | Mức sàn chung độc lập với `minSubtotal` từng mã | BA |
| 5 | `DS-NEG-10` | Form voucher khi giỏ trống | BA / Tech Lead |
| 6 | `VCHR-025`; `04` | Tách assertion; ghi Test Idea cho ca mới | QA Lead |
| 7 | `environment.md` | Thống nhất thông báo `HETHAN` | BA / Dev |
| 8 | `GAP-L2` | Thời điểm bổ sung `id` nút +/− | Dev |
