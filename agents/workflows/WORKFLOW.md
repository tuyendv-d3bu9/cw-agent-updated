# WORKFLOW — Bản đồ pipeline QA Agent

> File này để **ĐỌC**: hệ thống có gì, chạy theo thứ tự nào, dừng ở đâu.
> Muốn **CHẠY** một chuỗi cụ thể => dùng runbook trong `workflows/run-*.md`.
> Ràng buộc chung nằm ở `agents/core/QA_STANDARD.md` — file này không nhắc lại.

Cấu trúc thư mục file (sau khi đã gom agent):

```
agents/
    qa-lead/
    qa-analyst/
    qa-test-design/
    qa-test-data/
    qa-exploratory/
    qa-ui-review/
    qa-reporter/
    qa-automation/
    qa-readiness-evaluator/

agents/
    core/QA_STANDARD.md

knowledge/
    _project.md
    _template.md
    <task-slug>.md

INPUT/
OUTPUT/
workflows/
```

---

## 1. Các nhánh

| Nhánh | Gồm | Khi nào chạy |
|---|---|---|
| **A · Pipeline chính** | `01 => 02 => 03 => 04 => 05 => 06` | Luôn chạy. Đây là xương sống requirement => test case. |
| **B · Nhánh dữ liệu** | `09 => 10 => 11 => 12` | Chạy **sau** `05`, khi cần dataset để execute. |
| **C · Độc lập** | `07` (exploratory) · `08` (UI screenshot) | Gọi bất cứ lúc nào, không chặn nhánh A/B. |
| **D · Báo cáo lỗi** | `13` (gen-bug-report) · `14` (gen-daily-summary) | Chạy khi Tester có bug notes thô cần chuẩn hóa hoặc tổng kết sprint. |
| **E · Chốt chặn Automation** | `15` (gen-readiness-report) | Chạy sau thiết kế/data, trước khi viết Playwright Automation để đánh giá Go/No-Go. |

`07` cần risk area từ `03`. `08` cần ảnh đính kèm, không cần bước nào trước. `13` cần file bug notes thô và file rules. `15` cần các design-time artifacts (specs, coverage plan, test cases CSV, data validation report, reviews).

---

## 2. Bảng điều phối đầy đủ

### Nhánh A — Pipeline chính

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 1 | `qa-analyst` | `requirement-risk-summary` | `INPUT/*.md` | `01_requirement_risk_summary.md` |
| 2 | `qa-analyst` | `missing-rule-06w` | `01` + `knowledge/<slug>.md` | `02_missing_rule_report.md` |
| 3 | `qa-analyst` | `viewpoint-selection` | `01` + `02` | `03_viewpoint_report.md` |
| 4 | `qa-analyst` | `test-idea-design` | `01` + `03` | `04_test_idea_report.md` |
| 5 | `qa-test-design` | `test-case-generation` | `01` + `03` + `04` | `05_test_case_spec.md` |
| 6 | `qa-test-design` | `coverage-review` | `01` + `03` + `05` | `06_coverage_review.md` |

### Nhánh B — Dữ liệu

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 9 | `qa-test-data` | `data-class-map` | `01` | `09_data_class_map.md` |
| 10 | `qa-test-data` | `dataset-generation` | `09` | `10_dataset.md` |
| 11 | `qa-test-data` | `boundary-negative-dataset` | `09` | `11_boundary_negative_dataset.md` |
| 12 | `qa-test-data` | `data-validation-traceability` | `10` + `11` + `05` | `12_data_validation_traceability.md` |

### Nhánh C — Độc lập

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 7 | `qa-exploratory` | `exploratory-charter` | Risk area ở `03` | `07_exploratory_charter.md` |
| 8 | `qa-ui-review` | `ui-screenshot-review` | Ảnh đính kèm | `08_ui_screenshot_analysis.md` |

### Nhánh D — Báo cáo lỗi & Tổng kết Sprint (Defect Reporting & Summary)

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 13 | `qa-reporter` | `gen-bug-report` | File bug notes + `knowledge/` | `OUTPUT/reports/bug-report-<slug>.md` |
| 14 | `qa-reporter` | `gen-daily-summary` | Sprint data JSON + audience | `outputs/reports/daily-summary-<audience>.md` |

### Nhánh E — Đánh giá độ sẵn sàng kiểm thử (Design-time QA Readiness Gate)

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 15 | `qa-readiness-evaluator` | `gen-readiness-report` | `coverage-plan.json` + `testcases/*.csv` + `validation-report.md` + `specs` + `reviews/` | `outputs/reports/readiness-report.md` |

Mọi output nhánh A-C nằm trong `OUTPUT/<task-slug>/`, kèm `_index.md`. Nhánh D & E ghi tại `OUTPUT/reports/` hoặc `outputs/reports/`.

---

## 3. Luật khi nào dừng

Mỗi bước đều ra một **Verdict**:
- `PASS` → chạy tiếp bước sau (hoặc người test nhận output).
- `FIX`  → agent tự sửa lại deliverable theo format chuẩn, không gọi bước tiếp cho tới khi đạt.
- `ASK`  → **DỪNG PIPELINE**. Đây là chủ ý, không phải bug. Thường vì:
  - Thiếu tài liệu nguồn (bước 1).
  - Lộ ra kẽ hở logic / quy tắc mâu thuẫn cần BA/PO chốt (bước 2).
  - Thiếu ảnh màn hình (bước 8).
  - Người dùng hỏi ngoài phạm vi.

**Ngoại lệ có chủ ý** — skill `coverage-review`: rà đủ 3 góc nhìn mà không thấy gap nào thì kết luận `ASK`,
không phải `PASS`. `PASS` chỉ khi có người phụ trách ký chấp nhận rủi ro. Đây không phải lỗi.

Các nhãn khác cũng là điểm dừng cần người: `[GIẢ ĐỊNH]` · `[CONTEXT_MISSING]` ·
`[SEVERITY_CONFIDENCE_LOW]` · `CHƯA COVER` · `CHƯA CÓ DATA` · `[GAP — chuyển coverage-review bổ sung]`.

---

## 4. Vòng knowledge — thứ làm workflow nhanh dần

```
Chạy lần 1  =>  02 sinh MR-01…MR-nn (trạng thái New)  =>  hỏi BA
            =>  ghi câu trả lời vào knowledge/<slug>.md (mục 7 => Confirmed, mục 8)
Chạy lần 2  =>  01/02 đọc knowledge trước  =>  ít [GIẢ ĐỊNH] hơn, ít ASK hơn
```

- Chỉ skill `01` và `02` được ghi `knowledge/<slug>.md`.
- Không xoá dòng cũ — chỉ đổi `Trạng thái`.
- `OUTPUT/` vứt được và chạy lại. `knowledge/` mất là mất công hỏi BA lần nữa.

---

## 5. Quy ước chạy

| Mục | Quy ước |
|---|---|
| `task-slug` | Trùng `feature-slug` (ví dụ: `auth-login`, `order-checkout`). Một feature một thư mục output. |
| Nạp trước mọi bước | `agents/core/QA_STANDARD.md` · `knowledge/_project.md` · `knowledge/<slug>.md` (nếu có) |
| Một skill | Ghi **đúng một** file output. Không dồn nhiều bước vào một file. |
| Sau mỗi bước | Cập nhật `OUTPUT/<task-slug>/_index.md`: tên file + verdict |
| Không được | Ghi đè `INPUT/` · sửa deliverable của agent khác · chạy bước sau khi bước trước chưa có output |

---

## 6. Runbook có sẵn

| File | Chạy gì | Dùng khi |
|---|---|---|
| `workflows/run-to-testcase.md` | Nhánh A `01 => 05` | Từ requirement thô ra test case spec. Dừng trước chốt chặn. |
| `workflows/run-testcase.md` | Nhánh A `01 => 05`, nhánh B `09 => 12`, rồi `06` | Chạy trọn bộ, cần test suite kèm dataset sẵn sàng execute. |
| `workflows/re-run-testcase.md` | Chạy lại từ bước bị ảnh hưởng | Đã chạy 1 lần, dừng ở `ASK`/`FIX`, nay đã có câu trả lời BA. Vòng 2 của vòng knowledge (§4). |
| `workflows/verify-testcase.md` | Chỉ `06` + kiểm tay 4 mũi | Đã có `05`, cần nghiệm thu trước khi bàn giao. Không sinh mới. |
| `workflows/flow.md` | Kịch bản luồng tự động | Trỏ file để agent tự xác định bước đang kích hoạt. |

Thêm runbook mới: tạo `workflows/run-<mục-tiêu>.md`, khai vào bảng này. Không sửa bản đồ.

**Thứ tự `06` trong `run-testcase.md`**: `06` chạy **sau** `12`, không phải ngay sau `05`.
Skill `12` phát hiện test case `CHƯA CÓ DATA` và record mồ côi — đó là đầu vào thật cho gap
analysis của `06`. Chạy `06` trước `12` thì mất mảng gap dữ liệu.
