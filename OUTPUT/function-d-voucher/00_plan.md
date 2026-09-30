# Kế Hoạch Phân Tích & Kiểm Thử · function-d-voucher
Ngày tạo: 2026-09-20 · Người lập: QA Leader · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn
- **Tài liệu kinh doanh**: `INPUT/function-d-voucher/01_business/shopgo_overview.md`
- **Tài liệu yêu cầu (BA)**: `INPUT/function-d-voucher/02_ba/spec_function_d.md` + Phụ lục 01 `spec_function_d_addendum_01_voucher_format.md` (quy tắc định dạng mã, ban hành 2026-09-30)
- **Đặc tả kỹ thuật (Dev)**: `INPUT/function-d-voucher/03_dev/technical_spec.md` (`spec.txt`)
- **Đặc tả môi trường & API/State**: `INPUT/function-d-voucher/03_dev/environment.md`
- **Giao diện & UI Locators**: `INPUT/function-d-voucher/04_design/live_ui_locators.md` (`https://cwshopgo.github.io/`)
- **Tri thức dự án**: `knowledge/_project.md`, `knowledge/_glossary.md`
- **Tri thức tính năng**: `knowledge/features/function-d-voucher.md`
- **Mode làm việc**: Mode 1 (Manual Test Spec Chặng 1-6) + Mode 2 (Test Data Generation) + Sẵn sàng cho Mode 4 (Playwright Automation khi có yêu cầu)

---

## 2. Tiến Độ & Lộ Trình Từng Chặng (Milestones)

### Giai đoạn 0: Tiếp nhận Cổng 0 & Tri Thức Nền (Gate 0)
- [x] **Task 0.1**: Chuyển đổi và phân loại tài liệu vào 5 ngăn chuẩn `INPUT/function-d-voucher/` (Hoàn thành 2026-09-20).
- [x] **Task 0.2**: Đồng bộ tri thức dự án vào `knowledge/_project.md` (Hoàn thành 2026-09-20).
- [x] **Task 0.3**: Khởi tạo tri thức tính năng `knowledge/features/function-d-voucher.md` và trích xuất confirmed rules (Hoàn thành 2026-09-20).
- [x] **Task 0.4**: Lập file điều hành `OUTPUT/function-d-voucher/00_plan.md` (Hoàn thành 2026-09-20).
- [x] **Task 0.5**: Đồng bộ `knowledge/_system_map.json` ghi nhận task mới và tích hợp Live Environment `https://cwshopgo.github.io/` (Hoàn thành 2026-09-20).

### Giai đoạn 1: Phân Tích Yêu Cầu & Quét Kẽ Hở (qa-analyst) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [`qa-analyst/skills/requirement-risk-summary.md`] ➔ Ra `01_requirement_risk_summary.md` (Hoàn thành 2026-09-20 · **Verdict: PASS** sau khi BA chốt các câu hỏi mở).
- [x] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [`qa-analyst/skills/missing-rule-06w.md`] ➔ Ra `02_missing_rule_report.md` (Hoàn thành 2026-09-20 · **Verdict: PASS** · Đã chốt 7/7 Missing Rules `MR-01`->`MR-07`, mức sàn thống nhất là 200.000 VNĐ).

### Giai đoạn 2: Thiết Kế Góc Nhìn & Ý Tưởng Kiểm Thử (qa-analyst) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Chặng 3**: Chọn Risk Area & Viewpoints [`qa-analyst/skills/viewpoint-selection.md`] ➔ Ra `03_viewpoint_report.md` (Hoàn thành 2026-09-20 · Chọn 06 Viewpoints chuẩn Registry, Ma trận Zero-Overlap).
- [x] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [`qa-analyst/skills/test-idea-design.md`] ➔ Ra `04_test_idea_report.md` (Hoàn thành 2026-09-20 · Thiết kế 38 Test Ideas, Giữ 34 ideas, Bỏ 04 ideas).

### Giai đoạn 3: Sinh Bộ Test Case Chi Tiết 8 Trường (qa-test-design) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Chặng 5A**: Tạo bản thiết kế khung Blueprint JSON ➔ `05_test_blueprint.json` (Hoàn thành 34 TCs).
- [x] **Chặng 5B**: Chia lô sinh chi tiết 8 trường [`qa-test-design/skills/test-case-generation.md`] ➔ `testcases/batch_01.md` (Hoàn thành 34 TCs chuẩn Jira Xray).
- [x] **Chặng 5C**: Ghép lô hoàn chỉnh bằng tiện ích nội bộ `npm run testcases:merge` ➔ `05_test_case_spec.md` (Hoàn thành 34 TCs assembled).
- [x] **Chặng 6**: Rà soát độ phủ 3 góc nhìn & Nghiệm thu [`qa-test-design/skills/coverage-review.md`] ➔ Ra `06_coverage_review.md` (Hoàn thành · **Verdict: PASS** · Nghiệm thu bởi QA Lead / PO ngày 2026-09-27).


### Giai đoạn 4: Bộ Dữ Liệu Kiểm Thử & Kiểm Soát Truy Vết (qa-test-data - Tùy chọn Mode 2) — [HOÀN THÀNH · VERDICT: PASS]
- [x] **Data Class**: Lập bản đồ lớp dữ liệu [`qa-test-data/skills/data-class-map.md`] ➔ Ra `09_data_class_map.md` (Hoàn thành · Chuẩn hóa 5 Data Classes và chuỗi biên 6 mốc).
- [x] **Dataset Engine**: Cấu hình `dataset_schema.json` và sinh Realistic Dataset [`qa-test-data/skills/dataset-generation.md`] ➔ Ra `10_dataset.md` (Hoàn thành · Đã hiệu chỉnh Freeship 0 ₫ cho đơn ≥ 200k khớp Web Live).
- [x] **Boundary & Negative**: Sinh tập dữ liệu biên và phủ định [`qa-test-data/skills/boundary-negative-dataset.md`] ➔ Ra `11_boundary_negative_dataset.md` (Hoàn thành · 26 records phủ trọn vẹn chuỗi biên, null, space, format, XSS, SQLi).
- [x] **Traceability**: Ma trận đối soát dữ liệu ↔ ca kiểm thử [`qa-test-data/skills/data-validation-traceability.md`] ➔ Ra `12_data_validation_traceability.md` (Hoàn thành · Ánh xạ 100% 34 Test Cases khớp tiêu đề Spec, Zero Orphan Records).

### Giai đoạn 5: Chốt Chặn Sẵn Sàng (Readiness Gate - Khi sang Automation) — [HOÀN THÀNH · VERDICT: CONDITIONAL GO]
- [x] **Readiness Gate**: Đánh giá độ chín test design [`qa-readiness-evaluator/skills/gen-readiness-report.md`] ➔ Ra `OUTPUT/function-d-voucher/reports/readiness-report.md` (Hoàn thành 2026-09-27 · Ban đầu `RECOMMEND NO-GO` do lỗi dữ liệu).
- [x] **Khắc phục Data Issues**: QA Lead đã trực tiếp xử lý dứt điểm 3 điểm nghẽn:
  - `DATA-01`: Cập nhật phí freeship 0 ₫ trong `10_dataset.md` cho đơn ≥ 200k.
  - `DATA-02` + `DATA-05`: Đồng bộ chuẩn xác 100% tiêu đề của 34 Test Cases trong `12_data_validation_traceability.md`.
  - `DATA-03`: Ánh xạ toàn bộ 36/36 record dữ liệu, triệt tiêu 100% bản ghi mồ côi.
  - Nâng mức khuyến nghị lên **`RECOMMEND CONDITIONAL GO`** — bản v2 chốt phạm vi **20/34 Test Cases** *(con số 25/34 ở bản ghi trước đã lỗi thời, đính chính 2026-09-30)*.

### Giai đoạn 5B: Chốt Câu Hỏi Mở Đợt 2 & Cập Nhật Thiết Kế — [HOÀN THÀNH · CONDITIONAL GO]
- [x] **Chốt câu hỏi mở**: 10 câu (Readiness v2 + Human-Final) ghi vào `knowledge/features/function-d-voucher.md` Mục 7 (`GAP-F1a`→`GAP-H2`) và Mục 8 (#12→#23) (2026-09-30).
- [x] **Bổ sung INPUT**: Phụ lục 01 quy tắc định dạng mã 3–20 ký tự (đóng `GAP-F1a`); Phụ lục 02 môi trường không có API + freeship từ 200.000 ₫. Quy ước `k` = nghìn đồng ghi vào `knowledge/_project.md`.
- [x] **FIX-01/02/03/04 phần Test Case**: Sửa `testcases/batch_01.md` — đổi mốc biên `VCHR-009/014/016/018` theo catalog thật; viết lại `VCHR-011/028/031` theo web; chuẩn hoá thông báo định dạng `VCHR-020`→`026` theo Phụ lục 01; tạm đóng `VCHR-019`; đánh dấu `VCHR-027/032/033` ngoài phạm vi Automation; bỏ trường `status` không tồn tại ở `VCHR-034`; **thêm `VCHR-035` (reload) và `VCHR-036` (2 tab)**. Blueprint + merge ➔ `05_test_case_spec.md` **36 TCs**.
- [x] **Đồng bộ lớp dữ liệu (qa-test-data)**: Viết lại `09`→`12` v2 — mốc tiền theo catalog, freeship đúng, bỏ `VOUCHER10`, bỏ 2 record API, thêm `DS-VAL-11/12`, `DS-NEG-12/13/14`; ma trận `12` phủ 36/36, 0 record mồ côi. Schema chỉ còn tiền hàng tạo được.
- [x] **Cập nhật `06_coverage_review.md`** §6: phạm vi 36 TCs, viewpoint, biên mới.
- [x] **Readiness Gate v3** (2026-09-30): `RECOMMEND CONDITIONAL GO` — phạm vi Automation **32/36** (25 ✅ + 7 🔴 dự kiến FAIL để bắt defect). Đã xử lý các FIX bắt buộc: merge lại spec, bỏ "backend" ở `VCHR-010`, thông báo đúng ở `VCHR-008`, bỏ viết tắt `k`, `VCHR-013/030` sang Automated, tag `MR-01` cho `020`→`026`, thêm `DS-NEG-14` cho `VCHR-009`, sửa `DS-VAL-08` cho `VCHR-004`.
- [ ] **Chờ BA**: kỳ vọng "không mất đơn giữa 2 tab" của `VCHR-036` (`[GIẢ ĐỊNH]`) và các câu hỏi mở còn lại trong `reports/readiness-report.md`.

### Giai đoạn 6: Thực Thi Kiểm Thử & Tự Động Hóa (Execution / Automation)
- [ ] **Mode 3 / 4 (Automation Playwright)**: Thiết lập Page Object Model (POM) và kịch bản Playwright E2E cho **32 Test Cases** (Readiness v3) trên `https://cwshopgo.github.io/`: 25 ca kỳ vọng PASS + 7 ca dự kiến FAIL (`VCHR-020`, `022`→`026`, `036`).
- [ ] **Mode 1 (Tầng thực thi Manual `runs/`)**: Tạo phiên chạy `runs/RUN-01_voucher-regression/` bắt evidence màn hình. `run_plan.md` ghi `Jira Ticket: TBD` — điền sau buổi kết nối Jira, **không đổi tên thư mục**.

---

## 3. Nhật Ký Điều Phối QA Leader (Orchestration Log)
- **2026-09-20 (Tiếp nhận & Chặng 1-2)**: Hoàn thành Giai đoạn 0, Chặng 1 & Chặng 2. Toàn bộ 7 kẽ hở MR-01 -> MR-07 được BA xác nhận chính thức, Verdict đạt `PASS`.
- **2026-09-20 (Chặng 3-4)**: Hoàn thành Chặng 3 (06 Viewpoints) và Chặng 4 (38 Test Ideas, giữ 34 ideas).
- **2026-09-20 (Khám phá Web Live & Cổng Xác Thực)**: Điều phối `qa-exploratory` rà soát Web Live `https://cwshopgo.github.io/`. Xác nhận ràng buộc tiên quyết: Khách vãng lai bắt buộc phải đăng nhập mới truy cập được trang Thanh toán. Cập nhật 2 tài khoản test cố định (`khachhang@shopgo.vn`, `vip@shopgo.vn`) vào `INPUT` và `knowledge/`. Xuất bản tài liệu `07_web_journey_discovery.md` và bằng chứng chụp màn hình thanh toán.
- **2026-09-27 (Nghiệm thu Chặng 6 & Hoàn tất Giai đoạn 4 - Test Data)**: PO / QA Lead chính thức nghiệm thu bộ 34 Test Cases, chuyển Verdict sang `PASS`. Kích hoạt chuyên gia `qa-test-data` hoàn thành trọn vẹn Giai đoạn 4 (Mode 2): xuất bản `09_data_class_map.md`, `10_dataset.md`, `11_boundary_negative_dataset.md`, và ma trận truy vết `12_data_validation_traceability.md`.
- **2026-09-27 (Readiness Gate & Quality Guard Self-Healing)**: Ghi nhận báo cáo từ `qa-readiness-evaluator` (`readiness-report.md`). QA Lead đã chỉ đạo xử lý dứt điểm 3 lỗi chặn dữ liệu (`DATA-01`, `DATA-02`, `DATA-03`), nâng mức sẵn sàng lên **`CONDITIONAL GO`** cho 25 ca kiểm thử Live, sẵn sàng chuyển sang Automation hoặc Test Runs.
- **2026-09-27 (Chốt chặn Sẵn sàng - Readiness Gate)**: Kích hoạt `qa-readiness-evaluator` đối soát chéo 06 nhóm artifact thiết kế. Kết quả: Trace 100% (34/34), Delta coverage = 0, 10/10 BR + 7/7 MR đã `Confirmed`, 0 mục `FIX`. Tuy nhiên phát hiện 06 Data Issue chưa giải quyết (nổi bật: 09/10 bản ghi `DS-VAL-*` cộng phí ship 30.000 ₫ cho đơn đã đạt ngưỡng freeship 200k; ma trận truy vết gán sai ngữ nghĩa cho 07 TC ID; 14 record mồ côi trái với khẳng định Zero Orphan) và 09/34 test case chưa thực thi trọn vẹn được trên Web Live. **Verdict: `RECOMMEND NO-GO`** — chưa mở cổng sang `qa-automation` cho tới khi khắc phục xong các điều kiện tiên quyết. Báo cáo đầy đủ: `OUTPUT/function-d-voucher/reports/readiness-report.md`.
- **2026-09-27 (Readiness Gate v2 — Đóng GAP-L1 & Đối soát mã nguồn FE)**: Phát hành lại `reports/readiness-report.md` ở mức **`RECOMMEND CONDITIONAL GO`**. Đã kiểm chứng độc lập: `DATA-01`/`DATA-02`/`DATA-03` khắc phục triệt để (0 vi phạm freeship, 0 lệch ánh xạ, 0 record mồ côi). BA/PO chốt thêm `GAP-D1` (chỉ số nguyên phần trăm), `GAP-D2` (không giới hạn trần đơn hàng), `GAP-E1` (không có backend, chỉ đối chiếu FE), `GAP-E2` (không có sản phẩm móc khóa). Đóng `GAP-L1` bằng `07b_ui_locator_map.md` — bóc tách trực tiếp bundle ứng dụng Live, thu được đầy đủ locator (gồm `#input-qty-prod-00X`, `#btn-remove-prod-00X`, `#label-total-payable`, các vùng thông báo `bg-emerald-50`/`bg-rose-50`/`bg-amber-50`) và phát hiện catalog thật có **6 sản phẩm** (không phải 3), cho phép thay thế các mốc biên bất khả thi. Phát sinh nhóm vấn đề mới `GAP-F1`/`GAP-F2`: FE chưa hiện thực `MR-01`, `MR-02`, `MR-05`, và ngưỡng freeship trùng mức sàn voucher khiến `BR-09` không quan sát trực tiếp được. **Phạm vi mở cổng Automation: 20/34 test case** (16 sẵn sàng ngay + 4 sau khi đổi giá trị biên); 11 ca chờ BA/Dev phân định; 3 ca (`VCHR-027`, `032`, `033`) đóng khỏi phạm vi do FE không có tính năng.
- **2026-09-30 (Chốt câu hỏi mở đợt 2 & cập nhật Test Case)**: User (thay BA/PO) chốt 10 câu hỏi: `MR-02`, `MR-05`, `BR-09` theo hành vi web; `VCHR-019` tạm đóng; `VCHR-027/032/033` loại khỏi Automation; Dev sẽ bổ sung `id` nút +/−; QA Lead tự quyết ca bổ sung (thêm reload + 2 tab, bỏ 3G/VAT). Phát hiện **lỗi FACT**: quy tắc 3–20 ký tự của `MR-01` là đề xuất của QA Agent nhưng bị ghi như BA chốt ➔ đã đính chính; User quyết giữ quy tắc và ban hành Phụ lục 01 trong `INPUT/.../02_ba/`, FE thiếu = bug. Cập nhật 36 TCs. Tên phiên chạy: `RUN-01_voucher-regression`.
- **2026-09-30 (Phụ lục 02, lớp dữ liệu v2 & Readiness v3)**: User chốt freeship từ 200.000 ₫, không có API (ghi Phụ lục 02, loại record API), quy ước `k` = nghìn đồng. Viết lại `09`→`12`, cập nhật `06` §6. `qa-readiness-evaluator` ra v3: `CONDITIONAL GO` 32/36; QA Lead xử lý các FIX bắt buộc ngay sau đó.
