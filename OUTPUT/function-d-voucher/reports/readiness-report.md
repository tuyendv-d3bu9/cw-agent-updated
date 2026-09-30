# QA Design-time Readiness Report: Function D — Áp Dụng Mã Giảm Giá (Voucher) · `function-d-voucher`
Owner: `agents/qa-readiness-evaluator/skills/gen-readiness-report.md` · Nguồn: `knowledge/_project.md`, `knowledge/features/function-d-voucher.md` (Mục 7, Mục 8 #12→#23), `INPUT/.../02_ba/spec_function_d.md`, `spec_function_d_addendum_01_voucher_format.md`, `spec_function_d_addendum_02_environment_shipping.md`, `INPUT/.../03_dev/environment.md`, `05_test_case_spec.md`, `05_test_blueprint.json`, `testcases/batch_01.md`, `06_coverage_review.md`, `07b_ui_locator_map.md`, `09_data_class_map.md`, `10_dataset.md`, `11_boundary_negative_dataset.md`, `12_data_validation_traceability.md`, `dataset_schema.json`, `00_plan.md`, `04_test_idea_report.md` · Phiên bản: **v3** (2026-09-30, thay thế bản v2 ngày 2026-09-27) · **Verdict: `RECOMMEND CONDITIONAL GO`**

## 1. Tổng quan (Overview)
- **Feature / Phạm vi:** Áp dụng mã giảm giá tại màn hình Thanh toán ShopGo — **36 test case** (`VCHR-001` → `VCHR-036`), 06 viewpoint, đối chiếu Web Live `https://cwshopgo.github.io/` (SPA thuần frontend, không có backend/API — Phụ lục 02 E-01, E-04).
- **Mục tiêu báo cáo:** Đánh giá độ chín test design trước khi viết kịch bản Playwright E2E, sau đợt chốt câu hỏi mở thứ 2 (2026-09-30).
- **Thay đổi so với v2 (đã kiểm chứng lại độc lập, không dựa vào lời tóm tắt):**
  - ✅ `ASK-01` (v2) đã có quyết định: `MR-02`, `MR-05`, `BR-09` **theo web** (`knowledge` Mục 8 #12, #13, #14); quy tắc định dạng 3–20 ký tự **giữ nguyên** và đã có căn cứ INPUT (Phụ lục 01) ➔ các ca định dạng trở thành ca tìm lỗi (#20).
  - ✅ `FIX-02` (v2) đã xong: mốc biên `VCHR-009/014/016/018` đổi sang 200.000 / 190.000 / 280.000 / 490.000 ₫, đều ghép được từ catalog.
  - ✅ `FIX-03`, `FIX-04` (v2) đã xong: Expected Result `VCHR-011/028/031` viết lại theo web; `VCHR-019` tạm đóng (#15); `VCHR-027/032/033` gắn `Scope#OutOfAutomation` (#16).
  - ✅ Lớp dữ liệu `09`→`12` viết lại v2: bỏ `VOUCHER10`, bỏ 2 record API (`DS-NEG-03`, `DS-NEG-11`), phí ship đúng Phụ lục 02 S-02.
  - 🟡 `FIX-01` (v2) **mới xong một nửa**: `testcases/batch_01.md` đã sửa tên sản phẩm, nhưng `05_test_case_spec.md` **chưa được merge lại** (Mục 3.3, `V3-FIX-01`).
  - ➕ Thêm 2 ca mới `VCHR-035` (tải lại trang), `VCHR-036` (2 tab) theo uỷ quyền QA Lead (#19).
- **Nguồn dữ liệu đã nạp:**
  - Kế hoạch slot: `04_test_idea_report.md` (**Đã nạp** — dự án không dùng `coverage-plan.json`; 38 idea, giữ 34)
  - Test case: `05_test_case_spec.md` + `testcases/batch_01.md` + `05_test_blueprint.json` (**Đã nạp** — Markdown có cấu trúc, parse theo block `### TC_ID:` bằng field-aware parser, không đếm dòng thô: 36 / 36 / 36 bản ghi)
  - Test data & validation: `09`, `10`, `11`, `12`, `dataset_schema.json` (**Đã nạp**)
  - Spec & rule: `spec_function_d.md`, Phụ lục 01, Phụ lục 02, `environment.md`, `knowledge/features/function-d-voucher.md` (**Đã nạp**)
  - Review: `06_coverage_review.md` (**Đã nạp 1 file**, gồm §6 mới)
  - Hành vi FE thật: `07b_ui_locator_map.md` (**Đã nạp**)

## 2. Coverage (Planned Slots vs. Actual Test Cases)

| Viewpoint ID | Tên Viewpoint | Planned Slots (`04`) | Actual Test Cases (`05`) | Delta | Ghi chú & Nhận diện Drift |
|---|---|---|---|---|---|
| `VP-01` | Happy Path | 5 | 5 | 0 | `VCHR-001`→`005` |
| `VP-02` | Negative | 8 | 8 | 0 | `VCHR-006`→`013` |
| `VP-03` | Boundary | 9 | 9 | 0 | `VCHR-014`→`022` |
| `VP-04` | Security | 5 | 5 | 0 | `VCHR-023`→`027` |
| `VP-05` | UX/Usability | 3 | 3 | 0 | `VCHR-028`→`030` |
| `VP-06` | Integration | 4 | 6 | **+2** | `VCHR-035`, `036` bổ sung sau Human-Final (#19) |
| **TỔNG** | | **34** | **36** | **+2** | Blueprint 36 ↔ Spec 36 ↔ Batch 36, tập ID trùng khớp 100% |

*Phân tích Delta:*
- Delta +2 ở `VP-06` **có căn cứ**: `knowledge` Mục 8 #19 uỷ quyền QA Lead bổ sung ca đa tab/reload. Tuy nhiên `04_test_idea_report.md` chưa có Test Idea tương ứng (không có `TI` cho `VCHR-035/036`) ➔ drift đã được duyệt về nghiệp vụ nhưng chưa phản ánh vào kế hoạch slot (ghi vào `❓` #8).
- Tỷ lệ viewpoint trong `06_coverage_review.md` §6.3 khớp số đếm thực tế (5/8/9/5/3/6).
- Slot `assumed`: **1** — `VCHR-036` (Expected Result mang nhãn `[GIẢ ĐỊNH – rủi ro MED]`).
- Slot `context_limited`: **4** — `VCHR-019` (không tạo được tiền lẻ), `VCHR-027`, `032`, `033` (FE không có tính năng).

## 3. Ma trận Truy vết (Traceability)
- **Tỷ lệ Test Case có Trace:** **100%** (36/36) — mỗi TC có `Rule#`, `Viewpoint#`, `Module#`.
  - `VCHR-035`, `036` trace tới `Rule#GAP-H2` — đây là quyết định phạm vi (Human-Final), không phải quy tắc nghiệp vụ; căn cứ hành vi đúng là Phụ lục 02 E-02/E-03 (`V3-FIX-06`, không ảnh hưởng tỷ lệ).
- **Độ phủ rule (theo tag trong `05`):** `BR-01`:3 · `BR-02`:5 · `BR-03`:2 · `BR-04`:9 · `BR-05`:5 · `BR-06`:7 · `BR-07`:2 · `BR-08`:1 · `BR-09`:1 · `BR-10`:4 · `MR-02`:1 · `MR-05`:1 · `GAP-H2`:2.
  - Mọi BR còn **≥ 1 TC thuộc phạm vi thực thi**. `BR-03` chỉ còn `VCHR-006` (`033` ngoài phạm vi); `BR-09` chỉ kiểm chứng gián tiếp qua `VCHR-031` (#14).
  - `MR-04` (làm tròn) không còn TC thực thi (`VCHR-019` tạm đóng — #15); `MR-06`, `MR-07` không có TC thực thi (#16). Đã có quyết định, không phải gap mở.
  - `VCHR-020`→`026` chỉ gắn `Rule#BR-06`/`BR-05`, không gắn `MR-01` hay mã `F-0x` của Phụ lục 01 dù Expected Result dẫn Phụ lục 01 (`V3-FIX-06`).
- **Cảnh báo Rule chưa Confirm:**
  - `VCHR-036`: map `GAP-H2` (Status `Confirmed` về phạm vi) nhưng **Expected Result là `[GIẢ ĐỊNH]`** — "không mất đơn" do QA Lead chốt theo uỷ quyền; bản thân TC ghi "cần BA xác nhận nếu FAIL" ➔ `❓` #1.
  - Không TC nào map vào rule có cờ `needs_clarification`.

### 3.1. Đối soát tiêu đề & ánh xạ dữ liệu (kiểm bằng script)
- Tiêu đề `05_test_blueprint.json` (`purpose`) ↔ `05_test_case_spec.md` (`Title`): **36/36 khớp nguyên văn**.
- Tiêu đề ma trận `12_...` §3 ↔ `05_test_case_spec.md`: **36/36 khớp nguyên văn**, không thiếu TC.
- Record tồn tại trong `10` (12 ID, gồm `DS-VAL-10` tạm đóng) + `11` (26 ID) = 38 ID; **0 record mồ côi**, **0 tham chiếu tới record không tồn tại**.

### 3.2. Đối soát thông báo kỳ vọng
| Nhóm | TC | Đối chiếu | Kết quả |
|---|---|---|---|
| Hành vi FE (`07b` §3) | `006`, `007`, `009`, `010`, `011`, `014`, `016`, `021` | Nguyên văn thông báo rỗng / không tồn tại / hết hạn / chưa đạt tối thiểu / cảnh báo vàng | ✅ Khớp |
| Hành vi FE (`07b` §3) | `008` | Chỉ ghi "Hiển thị cảnh báo đơn hàng chưa đạt giá trị tối thiểu 200.000 VNĐ…" — **không nguyên văn** | ❌ `V3-FIX-03` |
| Phụ lục 01 | `020`, `023`, `024`, `025`, `026` | "Mã giảm giá không đúng định dạng." | ✅ Khớp |
| Phụ lục 01 F-03 | `022` | Ô nhập dừng ở 20 ký tự đầu | ✅ Khớp |
| Chưa có căn cứ trong `07b` | `005` (badge tự áp dụng không cần bấm Áp dụng), `029` (text "Đang kích hoạt giảm giá") | `07b` §1.3 chỉ liệt kê locator badge, không mô tả hành vi/nhãn này | ⚠️ `❓` #2 |
| Định dạng số trong thông báo | `009`, `014`, `016`, `DS-BND-01/04`, `DS-NEG-10/13` | `07b` §3 chỉ ghi placeholder `{min}`, `{subtotal}`, `{...}`; cách hiển thị "200.000 ₫" chưa được ghi nhận | ⚠️ `❓` #3 |

### 3.3. ⚠️ `05_test_case_spec.md` lệch với nguồn `testcases/batch_01.md`
So sánh hai file: `batch_01.md` đã sửa tên sản phẩm về catalog kèm `prod-id`, nhưng `05_test_case_spec.md` (bản merge) vẫn là bản cũ ở **5 TC**:

| TC | `05_test_case_spec.md` (hiện tại) | `testcases/batch_01.md` (đã sửa) |
|---|---|---|
| `VCHR-001` | "Bình giữ nhiệt Thông Minh" | "Bình nước giữ nhiệt Kim Loại" (`prod-003`) |
| `VCHR-003` | "Áo thun Polo Thể Thao Nam" × 4 | "Áo thun Trendy Unisex" (`prod-001`) × 4 |
| `VCHR-008` | "Áo thun Polo Thể Thao Nam" | "Áo thun Trendy Unisex" (`prod-001`) |
| `VCHR-015` | "Bình giữ nhiệt Thông Minh" | "Bình nước giữ nhiệt Kim Loại" (`prod-003`) |
| `VCHR-017` | "2 Áo thun Polo x 150.000 VNĐ" | "Áo thun Trendy Unisex" (`prod-001`) × 2 |

`06_coverage_review.md` §6.2 ghi "Sửa tên sản phẩm không tồn tại… về đúng catalog" — đúng với `batch_01.md`, **sai với `05`**. Tiêu đề không bị ảnh hưởng. ➔ `V3-FIX-01`.

## 4. Sẵn sàng về Dữ liệu Kiểm thử (Data Readiness)

### 4.1. FACT Check — kiểm chứng lại độc lập
| Tiêu chí | Kết luận của `12_...` | Kết quả đối soát v3 |
|---|---|---|
| **F** — Faithful | PASS | ✅ **Đạt ở lớp dữ liệu** — chỉ dùng `GIAM50K`, `SALE20`, `HETHAN`, `prod-001`→`006`, phí ship 30.000 / 0 ₫. *(Tên sản phẩm ngoài catalog chỉ còn ở lớp TC `05` — `V3-FIX-01`.)* |
| **A** — Accurate | PASS | ✅ **Đạt** — tính lại toàn bộ 21 record có tiền (`DS-VAL-01`→`12`, `DS-BND-01`→`09`, `DS-NEG-13`) và 18 TC có số tiền: 0 sai lệch. Chi tiết Mục 4.2. |
| **C** — Complete | PASS | 🟡 **Đạt cơ bản** — đủ 5 Data Class; nhưng `VCHR-009` không có record riêng và `VCHR-004` không có record có khoảng trắng hai đầu (`V3-DATA-01`, `02`). |
| **T** — Traceable/Testable | PASS | 🟡 **Đạt cơ bản** — 0 mồ côi; nhưng 7 TC có giá trị Test Data khác record được ánh xạ (`V3-DATA-03`); `DS-NEG-10` còn `[GIẢ ĐỊNH]` (`V3-DATA-04`). |

### 4.2. Kiểm tra số học & khả năng tái hiện
- **Tổ hợp giỏ hàng:** mọi mốc tiền trong `05` (trừ `VCHR-019` tạm đóng), `10`, `11` đều ghép được từ catalog 6 sản phẩm và nằm trong tồn kho (`prod-002` tối đa dùng × 1 / tồn 12; `prod-006` tối đa × 2 / tồn 8; `prod-003` × 4 / tồn 25; `prod-001` × 4 / tồn 50).
- **Phí ship** (`subtotal >= 200.000 ₫ ? 0 : 30.000 ₫`): đúng ở mọi record — 190.000 ₫ ➔ 30.000 ₫ (`DS-BND-01`), 150.000 ₫ ➔ 30.000 ₫ (`DS-NEG-13`, `DS-VAL-12` sau), còn lại 0 ₫.
- **Tổng = Tiền hàng + Ship − Giảm:** đúng 100%, ví dụ 190.000 + 30.000 − 0 = 220.000 ₫; 150.000 + 30.000 − 0 = 180.000 ₫ (`VCHR-011`); 280.000 − 50.000 = 230.000 ₫ (`VCHR-036` Tab B).
- **SALE20** (20%, trần 100.000 ₫, tối thiểu 300.000 ₫): 300.000 ➔ 60.000; 310.000 ➔ 62.000; 350.000 ➔ 70.000; 450.000 ➔ 90.000; 490.000 ➔ 98.000; 500.000 ➔ 100.000; 510.000 / 600.000 / 800.000 ➔ chặn 100.000 ₫; 200.000 / 280.000 ➔ từ chối. ✅
- **GIAM50K** (50.000 ₫, tối thiểu 200.000 ₫): 200.000 / 240.000 / 280.000 / 300.000 / 350.000 / 400.000 ➔ giảm 50.000 ₫; 150.000 / 190.000 / 0 ➔ từ chối. ✅
- **Độ dài mã:** `V1`=2, `V03`=3, `SG10`=4, `VOUCHERGIAM20K2026V`=19, `…VN`=20, `…VNA`=21, `VOUCHERCHINHHANG2026`=20, `ABCDE12345ABCDE12345XXXXX`=25 — đúng như khai báo. ✅
- **API / HTTP / DB:** lớp dữ liệu sạch. Còn **1 kỳ vọng backend sót lại** ở lớp TC: `VCHR-010` "Không gửi request xử lý lên backend." (`V3-FIX-02`). `VCHR-027` (bước "gửi 20 request") đã ngoài phạm vi.
- **Viết tắt `k`:** lớp dữ liệu sạch. Lớp TC `05` còn ở `VCHR-009` ("200k", "300k"), `011` ("< 200k"), `013` ("50k + 70k = 120k"), `014` ("dưới 200k"), `016` ("dưới 300k"), `018` ("maxCap 100k" × 2), `031` ("≥ 200k") (`V3-FIX-04`). Không có chỗ nào đọc sai giá trị.
- **`dataset_schema.json`** chưa được cập nhật theo v2: `order_subtotal` sinh theo bước 10.000 ₫ trong [200.000; 1.000.000] ➔ sinh ra các mốc **không ghép được** từ catalog: 210.000 / 220.000 / 230.000 / 250.000 / 260.000 / 290.000 / 330.000 / 370.000 / 410.000 ₫ (đã kiểm bằng vét cạn tổ hợp trong tồn kho) (`V3-DATA-05`).

### 4.3. Data Issues v2 — trạng thái
| Mã | Nội dung | Trạng thái v3 |
|---|---|---|
| `DATA-04` (v2) | Mốc subtotal không tái hiện được | ✅ **Đã xử lý** — mọi mốc thay bằng giá trị ghép được; 333.333 ₫ đi cùng `VCHR-019` tạm đóng |
| `FIX-01` (v2) | `VCHR-031` dùng sản phẩm "Phụ kiện móc khóa" | ✅ **Đã sửa** — `prod-002` × 1, kiểm chứng gián tiếp (#14) |
| `FIX-02` (v2) | Cập nhật biên `VCHR-009/014/016/018` + `11` + `12` | ✅ **Đã sửa & đồng bộ** |

### 4.4. Data Issues mới phát hiện ở v3 (`12_...` tự đánh giá "0 issue" — không phản ánh các điểm dưới)
| Mã | File / Record | Vấn đề | Mức |
|---|---|---|---|
| `V3-DATA-01` | `12_...` dòng `VCHR-009` | Ánh xạ `DS-BND-04` (SALE20 + **280.000 ₫** — là dữ liệu của `VCHR-016`) và `DS-VAL-06` (GIAM50K áp **thành công**). Không có record nào là "SALE20 + `prod-003` × 1 = 200.000 ₫ ➔ từ chối". Cột "Giá trị tái hiện" được suy ra, không có record gốc | Minor |
| `V3-DATA-02` | `10` `DS-VAL-08` ↔ `VCHR-004` | Record nhập `giam50k` (**không có khoảng trắng**), giỏ `prod-003` × 2 = 400.000 ₫; TC nhập `"  giam50k  "`, giỏ 350.000 ₫ ➔ phần `trim` của TC không có dữ liệu | Minor |
| `V3-DATA-03` | `05` ↔ `10`/`11` | Test Data trong TC khác record ánh xạ: `VCHR-007` (`KHONGCOMA` ↔ `SAI123`), `020` (`AB` ↔ `V1`), `021` (`VOUCHERCHINHHANG2026` ↔ `DS-BND-11…14`, chuỗi 20 ký tự khác), `022` (25 ký tự ↔ 21 ký tự), `023` (`@GIAM#50K!` / `GIAM50K🔥` ↔ `VCHR@#$%!` / `SALE🎉`), `025` (`alert('XSS')` ↔ `alert(1)`), `002` (`SALE20` / `khachhang` ↔ `DS-VAL-09` `"  SALE20  "` / `vip`) | Minor |
| `V3-DATA-04` | `11` `DS-NEG-10` (ánh xạ `VCHR-008`) | Kỳ vọng mang `[GIẢ ĐỊNH – LOW]` "form voucher vẫn hiển thị khi giỏ trống" | Minor — `❓` #5 |
| `V3-DATA-05` | `dataset_schema.json` | Bước 10.000 ₫ sinh mốc không ghép được; `SALE20` trong enum nhưng không ràng buộc tối thiểu 300.000 ₫ | Minor |
| `V3-DATA-06` | `10` §3 | Export không đồng nhất: CSV thiếu `DS-VAL-12`; JSON thiếu `DS-VAL-03`, `05`, `08`, `11` | Minor |

> Không có issue nào làm sai số tiền kỳ vọng hay dẫn tới kịch bản chạy sai; toàn bộ là lỗi đầy đủ / truy vết ➔ xếp **minor**, không kích hoạt `NO-GO`.

## 5. Danh sách Gaps & Giả định (Gaps & Assumptions)

| Gap ID | Mô tả Chi tiết | Status | Quyết định / Giả định hiện tại | Cần BA làm rõ? |
|---|---|---|---|---|
| `GAP-F1a` · `MR-01` | Quy tắc định dạng mã 3–20 ký tự | **Confirmed** 2026-09-30 (#20) | Giữ quy tắc theo Phụ lục 01; FE thiếu = bug | No |
| `GAP-F1b` · `MR-02` | FE không tự gỡ mã khi giỏ tụt dưới sàn | **Confirmed** (#12) | Theo web: giữ mã + cảnh báo vàng, giảm 0 ₫ | No |
| `GAP-F1c` · `MR-05` | FE không disable nút Áp dụng | **Confirmed** (#13) | Theo web: bấm nhiều lần chỉ giảm 1 lần | No |
| `GAP-F2` · `BR-09` | Freeship trùng mức sàn voucher | **Confirmed** (#14, #21) | Kiểm chứng gián tiếp qua công thức + `shopgo_orders` | No |
| `GAP-F3` · `MR-04` | Không có giá lẻ để kiểm làm tròn | **Confirmed** (#15) | `VCHR-019` tạm đóng | No |
| `GAP-S1` · `MR-06/07` | FE không có rate limit, hạn mức, hủy từng đơn | **Confirmed** (#16) | `VCHR-027/032/033` ngoài phạm vi Automation | No |
| `GAP-L2` | Nút +/− thiếu `id` | **Confirmed — chờ Dev** (#17) | Tạm nhập trực tiếp `#input-qty-prod-00X` | No (theo dõi Dev) |
| `GAP-H1` | Mức nghiêm trọng `VCHR-011` | **Rejected** (#18) | Không còn là bug | No |
| `GAP-H2` | Bổ sung ca Human-Final | **Confirmed** (#19) | Thêm `VCHR-035`, `036`; bỏ 3G, VAT | No |
| `GAP-E1` (bổ sung) | Ca API / HTTP / DB | **Confirmed** (#22) | Loại bỏ toàn bộ | No |
| `VCHR-036` Expected | Hai tab đặt hàng: "không mất đơn" | **Treo** — `[GIẢ ĐỊNH – rủi ro MED]` | FE dự báo lost update (đọc đơn 1 lần khi khởi động, ghi đè cả mảng, không nghe sự kiện `storage`) | **Yes** — `❓` #1 |
| `DS-NEG-10` | Form voucher có hiển thị khi giỏ trống? | **Treo** — `[GIẢ ĐỊNH – LOW]` | Giả định có hiển thị | **Yes** — `❓` #5 |
| `BR-10` vs FE | Mức sàn chung 200.000 ₫ | **Chưa đề cập trong tài liệu** ở tầng FE | `07b` §3: FE chỉ kiểm `minSubtotal` từng mã, không có kiểm tra sàn chung | **Yes** — `❓` #4 |

## 6. Kết quả Review Thiết kế (Review Findings)
- **Tally:** `PASS`: **6** (01, 02, 03/04, 05/06, 09–12 tự đánh giá) | `FIX`: **10** (phát hiện ở v3, xem bảng FIX cuối báo cáo) | `ASK`: **0 trong review** — nhưng 10 điểm cần xác nhận tại "❓ CÂU HỎI MỞ".
- **Nhận xét về `06_coverage_review.md` §6:**
  - §6.1 (32 thực thi / 1 tạm đóng / 3 ngoài phạm vi = 36) ✅ khớp; §6.3 ✅ khớp; §6.4 các mốc 240.000 / 310.000 / 510.000 ₫ ✅ có dữ liệu (`DS-BND-03`, `06`, `09`).
  - §6.2 ghi "`VCHR-020`→`026` … dự kiến FAIL" — **sai với `VCHR-021`**: kỳ vọng của `021` (nhận đủ 20 ký tự, báo "không tồn tại") trùng hành vi FE ➔ dự kiến **PASS**. `12_...` §4 và `11` đã loại đúng `021`; `knowledge` Mục 8 #20 cũng ghi "7 ca dự kiến FAIL" (đúng ra là 6 ca định dạng).
  - §6.2 khẳng định đã sửa tên sản phẩm — chưa đúng với `05` (Mục 3.3).
  - §6.5 kết luận "không phát sinh `ASK` mới" trong khi `VCHR-036` mang `[GIẢ ĐỊNH]` chờ BA.
  - §1–§3 còn nội dung lỗi thời không gắn chú thích: `BR-02` "cận biên 299k, đơn 250k"; `BR-07` "499k"; `BR-10` "199k"; `BR-04` "lưu dữ liệu DB"; §3 "đòi hỏi API Backend có database".
- **Nhận xét về `00_plan.md`:** Giai đoạn 5B còn 2 mục `[ ]` đã thực tế hoàn thành (đồng bộ `09`→`12`, cập nhật `06`); Giai đoạn 6 còn ghi "25 Test Cases khả thi"; dòng chốt câu hỏi ghi "Mục 8 (#12→#20)" trong khi knowledge đã tới #23.
- **Nhận xét về `knowledge/features/function-d-voucher.md`** (chỉ báo cáo, không sửa): Mục 4 bước 5 còn "Nút áp dụng được disable" (trái #13); Mục 5 E5 còn thông báo `"Mã không đúng định dạng."` (Phụ lục 01 là "Mã giảm giá không đúng định dạng."); E6 còn "Tự động gỡ bỏ voucher" (trái #12); Mục 8 #2 và #5 chưa gắn chú thích bị thay thế bởi #12, #13 (chỉ #1 có đính chính).
- **Nhận xét về `07b_ui_locator_map.md`:** §4 ghi chú ⚠️ về `VCHR-031` vẫn ghi "Cần BA/Dev quyết định" — đã có quyết định #14.
- **Nhận xét về INPUT** (chỉ báo cáo): `environment.md` §1 ghi thông báo HETHAN là "Mã giảm giá đã hết hạn sử dụng." (không có mã), §2 ghi `Mã giảm giá "<MÃ>" đã hết hạn sử dụng.`; `07b` §3 (mã nguồn) xác nhận dạng có mã — TC `VCHR-006` theo dạng có mã ✅.

## 7. Khuyến nghị Go / No-Go cho Automation
- **Khuyến nghị của Agent:** **`RECOMMEND CONDITIONAL GO`**
- **Căn cứ khuyến nghị:**
  - ✅ Trace 100% (36/36) · tiêu đề 36/36 khớp giữa blueprint, spec, ma trận `12` · 0 record mồ côi · số học 100% đúng · mọi mốc tiền ghép được từ catalog trong tồn kho · không còn record API · toàn bộ gap đợt 2 đã có quyết định (#12→#23) · không TC nào map rule `needs_clarification`.
  - 🟡 Chưa đạt `GO` vì: còn **10 mục `FIX`** (nổi bật `V3-FIX-01`: `05` chưa merge lại từ `batch_01.md`); **6 data issue minor** mà `12_...` chưa ghi nhận; **1 kỳ vọng `[GIẢ ĐỊNH]`** (`VCHR-036`); Delta +2 chưa phản ánh vào `04`.
  - Không kích hoạt `NO-GO`: không có data issue làm sai kỳ vọng, không có rule trọng yếu treo.

- **Phân loại 36 test case theo mức sẵn sàng Automation:**

| Nhóm | Số lượng | Test Case | Ghi chú |
|---|---|---|---|
| ✅ **Sẵn sàng viết script** (kỳ vọng khớp hành vi FE) | **25** | `VCHR-001`→`018` (18 ca), `021`, `028`, `029`, `030`, `031`, `034`, `035` | Kèm điều kiện: `001/003/008/015/017` chờ merge `05` (`V3-FIX-01`); `008` chờ chuẩn hoá thông báo (`V3-FIX-03`); `010` bỏ dòng backend (`V3-FIX-02`); `013`, `030` đang gắn tag `Manual` (`V3-FIX-05`); `005`, `029` có hành vi chưa được `07b` ghi nhận (`❓` #2) |
| 🔴 **Sẵn sàng nhưng dự kiến FAIL** (ca tìm lỗi) | **7** | `VCHR-020`, `022`, `023`, `024`, `025`, `026` (FE chưa hiện thực Phụ lục 01 — #20) · `VCHR-036` (FE dự báo lost update) | FAIL = lập defect, **không phải blocker**. `025`: phần "không thực thi script" dự kiến PASS, phần thông báo dự kiến FAIL — nên tách assertion. `036`: kỳ vọng còn `[GIẢ ĐỊNH]` — cần BA xác nhận trước khi lập defect (`❓` #1) |
| ⏸️ **Tạm đóng** | **1** | `VCHR-019` | Không tạo được tiền lẻ (#15) |
| ⛔ **Ngoài phạm vi Automation** | **3** | `VCHR-027`, `032`, `033` | FE không có tính năng (#16), giữ trong Master Spec |
| **Tổng** | **36** | | |

> **Phạm vi khuyến nghị mở cổng:** **32/36 test case** (25 ✅ + 7 🔴) được chuyển sang `qa-automation` **sau khi hoàn thành điều kiện 1–4 dưới đây**. Nếu QA Lead giữ tag `Manual` cho `VCHR-013`, `030` thì phạm vi Automation là **30/36**.

- **Điều kiện tiên quyết cần hoàn thành:**
  1. **`V3-FIX-01`** — `qa-test-design` chạy lại `npm run testcases:merge` để `05_test_case_spec.md` nhận bản sửa tên sản phẩm của `testcases/batch_01.md` (5 TC).
  2. **`V3-FIX-02`, `V3-FIX-03`, `V3-FIX-04`** — Sửa Expected Result `VCHR-010` (bỏ kỳ vọng backend), `VCHR-008` (thông báo nguyên văn), và ghi đủ số tiền thay cho `k` ở 7 TC.
  3. **`V3-DATA-01`, `V3-DATA-02`** — `qa-test-data` bổ sung record cho `VCHR-009` và sửa record `VCHR-004`; cập nhật lại `12_...` (kèm tự đánh giá lại FACT).
  4. **`V3-FIX-05`** — QA Lead quyết tag `VCHR-013`, `030`; nếu tự động hoá `030` thì viết lại Expected Result đo lường được.
  5. *(Không chặn cổng, làm song song)* `V3-DATA-03`→`06`, `V3-FIX-06`→`10`; giải đáp "❓ CÂU HỎI MỞ".
- *(Lưu ý: Đây là khuyến nghị kỹ thuật dựa trên dữ liệu. Quyết định Go/No-Go cuối cùng thuộc về QA Lead / Quản lý dự án).*

---
## ❓ CÂU HỎI MỞ (Cần BA / PO / Tech Lead xác nhận)
1. **`VCHR-036` — Kỳ vọng khi đặt hàng ở 2 tab** (BA): Kỳ vọng hiện tại "cả 2 đơn đều được lưu" là `[GIẢ ĐỊNH]` do QA Lead chốt theo uỷ quyền #19. Mã nguồn FE dự báo đơn của Tab A bị ghi đè. BA xác nhận "không mất đơn" là yêu cầu nghiệp vụ (FAIL = bug), hay chấp nhận hành vi hiện tại?
2. **`VCHR-005`, `VCHR-029` — Hành vi chưa được ghi nhận** (Tech Lead / `qa-exploratory`): Bấm badge có tự áp dụng mã mà không cần bấm "Áp dụng" không? Nhãn "Đang kích hoạt giảm giá" có tồn tại không? `07b` §1.3 chưa mô tả hai điểm này.
3. **Định dạng số trong thông báo** (Tech Lead / `qa-exploratory`): `07b` §3 chỉ ghi `{min}`, `{subtotal}`, `{...}`. Xác nhận FE hiển thị dạng "200.000 ₫" như các TC `009`, `014`, `016` và record `DS-BND-01/04`, `DS-NEG-10/13` đang kỳ vọng.
4. **`BR-10` — Mức sàn chung 200.000 ₫** (BA): FE không có kiểm tra sàn chung, chỉ kiểm `minSubtotal` từng mã (`HETHAN` có min 100.000 ₫). Các ca `VCHR-008/014/015` thực chất kiểm `minSubtotal` của `GIAM50K`. Có cần sàn chung độc lập với từng mã không (ví dụ khi tạo mã có min < 200.000 ₫)?
5. **`DS-NEG-10` — Giỏ trống** (BA / Tech Lead): Form voucher có hiển thị khi giỏ hàng trống không? Nếu không, bỏ record hoặc đổi kỳ vọng.
6. **`VCHR-013`, `VCHR-030` — Tag `Manual`** (QA Lead): Chuyển sang `Automated` hay giữ Manual? `030` hiện có kỳ vọng cảm tính ("cân đối", "vừa vặn").
7. **`VCHR-025` — Tách assertion** (QA Lead): Tách phần an ninh (không thực thi script, dự kiến PASS) khỏi phần thông báo định dạng (dự kiến FAIL) để defect báo đúng điểm lỗi?
8. **Delta +2 ở `VP-06`** (QA Lead): Ghi `VCHR-035`, `036` vào `04_test_idea_report.md` thành Test Idea chính thức để kế hoạch slot khớp thực tế?
9. **Tài liệu nguồn chưa đồng bộ** (BA / chủ knowledge): `knowledge` Mục 4 bước 5, Mục 5 E5/E6, Mục 8 #2/#5 và #20 ("7 ca") lệch với quyết định #12, #13, #20 và Phụ lục 01; `environment.md` §1 lệch §2 về thông báo `HETHAN`. Xác nhận để skill `01`/`02` cập nhật.
10. **`GAP-L2`** (Dev): Thời điểm bổ sung `id` cho nút +/− (ảnh hưởng độ bền script `VCHR-011`).

---

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|
| `V3-FIX-01` | `05_test_case_spec.md` — `VCHR-001`, `003`, `008`, `015`, `017` | Bản merge chưa nhận bản sửa của `batch_01.md`: còn "Bình giữ nhiệt Thông Minh", "Áo thun Polo Thể Thao Nam", thiếu `prod-id` | Chạy `npm run testcases:merge` |
| `V3-FIX-02` | `05` / `batch_01.md` — `VCHR-010` Expected | "Không gửi request xử lý lên backend." — không kiểm chứng được, trái Phụ lục 02 E-04 | Thay bằng "Không áp dụng giảm giá; tổng thanh toán giữ nguyên 350.000 ₫" |
| `V3-FIX-03` | `VCHR-008` Expected | Thông báo không nguyên văn | "Đơn hàng chưa đạt mức tối thiểu 200.000 ₫ (Hiện có 150.000 ₫)." · phí ship 30.000 ₫ · tổng 180.000 ₫ |
| `V3-FIX-04` | `VCHR-009`, `011`, `013`, `014`, `016`, `018`, `031` | Dùng viết tắt `k` ("200k", "300k", "100k", "50k + 70k = 120k") | Ghi đủ số: 200.000 ₫, 300.000 ₫, 100.000 ₫, 50.000 ₫ + 70.000 ₫ = 120.000 ₫ |
| `V3-FIX-05` | `VCHR-013`, `VCHR-030` Tags / Expected | Tag `Manual` mâu thuẫn phạm vi Automation; `030` kỳ vọng cảm tính | Chốt tag; nếu tự động: "không có thanh cuộn ngang; `#input-voucher-code`, `#btn-apply-voucher`, 3 badge nằm trọn trong viewport 375 px và 1440 px" |
| `V3-FIX-06` | `VCHR-035`, `036` (`Rule#GAP-H2`); `VCHR-020`→`026` | Trace tới quyết định phạm vi thay vì quy tắc; ca định dạng thiếu tag `MR-01` | `035` ➔ Phụ lục 02 E-02/E-03; `036` ➔ E-02; `020`→`026` thêm `Rule#MR-01` |
| `V3-FIX-07` | `06_coverage_review.md` §6.2, §6.5, §1–§3 | `021` bị xếp dự kiến FAIL; khẳng định đã sửa tên sản phẩm; bỏ sót `ASK` cho `VCHR-036`; mốc 199k/299k/499k, "DB", "API Backend" lỗi thời | Sửa thành "`020`, `022`→`026` dự kiến FAIL; `021` dự kiến PASS"; thêm `ASK` `VCHR-036`; chú thích lỗi thời §1–§3 |
| `V3-FIX-08` | `00_plan.md` Giai đoạn 5B, 6 | 2 mục `[ ]` đã hoàn thành; "25 Test Cases"; "#12→#20" | Tick mục đã xong; cập nhật phạm vi theo báo cáo này; "#12→#23" |
| `V3-FIX-09` | `knowledge/features/function-d-voucher.md` Mục 4, 5, 8 | Lệch quyết định #12, #13, #20 và Phụ lục 01 (disable, tự gỡ, thông báo định dạng, "7 ca FAIL") | Skill `01`/`02` cập nhật sau khi BA xác nhận (`❓` #9) |
| `V3-FIX-10` | `07b_ui_locator_map.md` §4 ghi chú ⚠️ | "Cần BA/Dev quyết định" cho `VCHR-031` — đã có #14 | Ghi quyết định #14 |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
| 1 | `VCHR-036` | Xác nhận kỳ vọng "không mất đơn" giữa 2 tab | BA |
| 2 | `VCHR-005`, `029` | Xác nhận hành vi badge tự áp dụng và nhãn "Đang kích hoạt giảm giá" | Tech Lead / `qa-exploratory` |
| 3 | `07b` §3 | Định dạng số trong thông báo `{min}` / `{subtotal}` | Tech Lead / `qa-exploratory` |
| 4 | `BR-10` | Có cần mức sàn chung độc lập với `minSubtotal` từng mã | BA |
| 5 | `DS-NEG-10` | Form voucher khi giỏ trống | BA / Tech Lead |
| 6 | `VCHR-013`, `030`, `025`; `04` | Tag Manual, tách assertion, ghi Test Idea cho ca mới | QA Lead |
