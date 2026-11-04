# WORKFLOW — Bản đồ pipeline QA Agent

> File này để **ĐỌC**: có chặng nào, chạy theo thứ tự nào, ai làm, ra file gì.
> Muốn **CHẠY** một chuỗi ⇒ runbook `qa-system/workflows/run-*.md` (§5).
> Luật (verdict, cổng ASK, nhãn, knowledge, mã) ở `qa-system/core/QA_STANDARD.md` — file này không nhắc lại.

```
qa-system/
  core/QA_STANDARD.md
  qa-lead/  qa-analyst/  qa-test-design/  qa-test-data/  qa-ui-review/
  qa-reporter/  qa-automation/  qa-readiness-evaluator/
  tools/  templates/  workflows/
knowledge/  _project.md · _glossary.md · _template.md · _system_map.json · features/<slug>.md
INPUT/<slug>/   01_business · 02_ba · 03_dev · 04_design · 05_communication
OUTPUT/<slug>/  00_plan.md · 01_…15_ · testcases/ · runs/
```

---

## 1. Thứ tự & các nhánh

```
01 → 02 →[gate]→ 03 → 04 → 05 →[lint]→ 06        ← điểm dừng tự nhiên
                               └─(tuỳ chọn) 09 → 10 → 11 → 12 → chạy lại 06 (gom gap của 12)
06 →[readiness GO + yêu cầu + URL]→ G1 → G2 → G3 → G4
```

| Nhánh | Gồm | Khi nào |
|---|---|---|
| **A · Pipeline chính** | `01`→`06` | Luôn chạy. `01` không có điểm dừng cứng; cổng ASK nằm **sau `02`** (`npm run gate`) |
| **B · Dữ liệu** | `09`→`12` | Tuỳ chọn, sau `05`. Đã chạy thì chạy lại `06` |
| **C · Độc lập** | `07` exploratory charter · `08` UI screenshot | Bất cứ lúc nào. `07` cần `03`; `08` cần ảnh đính kèm |
| **D · Báo cáo** | bug report · daily summary | Khi có bug notes / sprint data. Ghi `OUTPUT/reports/` |
| **E · Sẵn sàng** | `15` | Trước nhánh G. Số liệu do `npm run readiness` đo |
| **G · Automation** | `G1`→`G4` | Chỉ khi đủ điều kiện `AGENTS.md` §1.5 |
| **F · Quản trị hệ thống** | `workflow-authoring` · `system-upgrade-governance` | Ngoài pipeline kiểm thử. Xong phải smoke lại một chặng nhánh A |

**Đặt tên file**: số `NN_` cho nhánh A–C, E; tiền tố `G<n>_` cho nhánh G (không dùng chung `07_`/`08_` với nhánh C).

---

## 2. Bảng điều phối

Cột **Vào** chỉ liệt kê deliverable; mọi chặng còn nạp `knowledge/_project.md` + `knowledge/features/<slug>.md`
(QA_STANDARD §7). Danh sách đầu vào chính xác nằm ở mục "Đầu vào" của từng skill.

### Nhánh A

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 0 | `qa-analyst` | `knowledge-digest` *(chỉ khi tài liệu quá nhiều)* | `00_digest_plan.md` + tài liệu trong lô | `knowledge_digest/batch_NN.md` · `00_knowledge_digest.md` |
| 1 | `qa-analyst` | `requirement-risk-summary` | `INPUT/<slug>/` (5 ngăn) hoặc `00_knowledge_digest.md` | `01_requirement_risk_summary.md` |
| 2 | `qa-analyst` | `missing-rule-06w` | `01` + nguồn `INPUT/<slug>/` / digest + `01_conflict_warning.md` (nếu có) | `02_missing_rule_report.md` |
| — | *cổng* | `npm run gate <slug>` | | exit `0` mới sang 3 |
| 3 | `qa-analyst` | `viewpoint-selection` | `01` + `02` | `03_viewpoint_report.md` |
| 4 | `qa-analyst` | `test-idea-design` | `01` + `02` + `03` | `04_test_idea_report.md` |
| 5 | `qa-test-design` | `test-case-generation` | `01` + `03` + `04` | `05_test_case_spec.md` (lớn: `05_test_blueprint.json` + `testcases/batch_NN.md`) |
| — | *cổng* | `npm run lint -- <slug>` | | exit `0` mới báo xong 5 |
| 6 | `qa-test-design` | `coverage-review` | `01` + `02` + `04` + `05` + `12` (nếu có) + kết quả lint | `06_coverage_review.md` |

### Nhánh B

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 9 | `qa-test-data` | `data-class-map` | `01` (mục FD) | `09_data_class_map.md` |
| 10 | `qa-test-data` | `dataset-generation` | `09` | `10_dataset.md` |
| 11 | `qa-test-data` | `boundary-negative-dataset` | `09` | `11_boundary_negative_dataset.md` |
| 12 | `qa-test-data` | `data-validation-traceability` | `10` + `11` + `05` | `12_data_validation_traceability.md` |

### Nhánh C, D, E

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| 7 | `qa-automation` | `exploratory-charter` | Rủi ro ở `03` | `07_exploratory_charter.md` |
| 8 | `qa-ui-review` | `ui-screenshot-review` | Ảnh đính kèm + `INPUT/<slug>/04_design/` | `08_ui_screenshot_analysis.md` |
| D | `qa-reporter` | `gen-bug-report` | Bug notes + `knowledge/` | `OUTPUT/reports/bug-report-<slug>.md` |
| D | `qa-reporter` | `gen-daily-summary` | Sprint data JSON + audience | `OUTPUT/reports/daily-summary-<audience>.md` |
| 15 | `qa-readiness-evaluator` | `gen-readiness-report` | `15_readiness_metrics.json` + `01` `02` `03` `05` `06` `12` | `15_readiness_report.md` |

### Nhánh G — không tự chạy sau Chặng 6

| # | Agent | Skill | Vào | Ra |
|---|---|---|---|---|
| G1 | `qa-automation` | `web-journey-discovery` | URL môi trường + `05` | `G1_web_journey_discovery.md` |
| G2 | `qa-automation` | `flow-clustering` | `G1_…` + `05` | `G2_flow_clusters.md` |
| G3 | `qa-automation` | `pom-generator` | `G2_…` + `knowledge/features/<sut>-ui-map.md` | `automation/pages/*.ts` |
| G4 | `qa-automation` | `test-runner-evidence` | `automation/tests/*.spec.ts` + `runs/<run-id>/run_plan.md` | `runs/<run-id>/run_result.md` · `evidence/` · `run_defects.md` |

Kết quả chạy đẩy lên Jira: `npm run jira:sync <slug> <run-id>`.

### Nhánh F

| Agent | Skill | Vào | Ra |
|---|---|---|---|
| `qa-lead` | `workflow-authoring` | Mô tả bằng lời hoặc câu ngắn + `_system_map.json` + `qa-system/templates/workflows/` | `qa-system/workflows/run-<tên>.md` · checklist `00_plan.md` |
| `qa-lead` | `system-upgrade-governance` | Yêu cầu nâng cấp + `_system_map.json` + `qa-system/templates/` | Thay đổi trong `qa-system/`, `_system_map.json`; biên bản để ngoài repo |

---

## 3. Dừng ở đâu

Verdict và luật cổng: QA_STANDARD §1 (kể cả luật riêng của `coverage-review`). Ngoài verdict, các nhãn
§2.1 (`[GIẢ ĐỊNH]`, `[CONTEXT_MISSING]`, `[ĐỀ XUẤT]`, `CHƯA COVER`, `CHƯA CÓ DATA`) là chỗ cần người xem.

## 4. Quy ước chạy

| Mục | Quy ước |
|---|---|
| `slug` | Trùng tên file knowledge tính năng (`auth-login`, `order-checkout`) |
| Một skill | Ghi **đúng một** file, dòng meta theo QA_STANDARD §7 |
| Sau mỗi bước | Tick `00_plan.md` |
| Chạy lại | Mã cũ giữ nguyên, mã mới lấy từ `npm run ids -- <slug>` (QA_STANDARD §9.1) |
| Không được | Sửa `INPUT/` · sửa deliverable của agent khác · chạy bước khi bước trước chưa có output |

## 5. Runbook — tạo bằng lời, chạy bằng câu ngắn

Mỗi workflow là một file `qa-system/workflows/<tên>.md`, frontmatter khai **cụm kích hoạt** và **bước**.

```bash
npm run workflow -- list        # có workflow nào, nói câu nào để chạy
npm run workflow -- validate    # kiểm toàn bộ (agent:check cũng tự kiểm)
```

| `format` | Là gì | `validate` kiểm |
|---|---|---|
| `v1` | `steps` máy đọc được | Agent/skill có thật; không lách cổng `ask` (trước Chặng 3→6) và `readiness` + `confirm` (trước automation); `output` nằm trong `OUTPUT/<slug>/` |
| `legacy` | Văn xuôi, chỉ có cụm kích hoạt | Cụm kích hoạt không trùng |

| Runbook | Format | Làm gì |
|---|---|---|
| `run-req-to-testcase` · `run-ba-spec-to-testcase` | v1 | `01`→`06` có cổng |
| `run-to-testcase` | v1 | `01`→`05`, chưa rà soát |
| `run-testcase` | v1 | `01`→`06` + `09`→`12` + chạy lại `06` |
| `re-run-testcase` | legacy | Chạy lại sau khi BA trả lời / sau `FIX` |
| `verify-testcase` | legacy | Chỉ chạy `06` trên bộ có sẵn + kiểm tay |
| `flow` | legacy | Chỉ mục cũ, trỏ sang `run-req-to-testcase` |
| `run-bulk-doc-intake` | v1 | Intake khối lớn → digest → `01` → `02` → cổng |
| `run-conflict-check` · `run-jira-sync` | legacy | Soát xung đột · Jira export/push/pull |
| `run-doc-to-jira-e2e` | v1 | `01`→`06` → Jira → automation (có cổng) → báo cáo |
