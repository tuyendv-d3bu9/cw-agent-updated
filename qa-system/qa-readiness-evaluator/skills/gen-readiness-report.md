---
name: gen-readiness-report
description: >
  Cross-checks a task's test design deliverables (01→06, 09→12, the ASK gate) to produce the
  Design-time QA Readiness Report and a Go / No-Go recommendation
  before the Automation branch is triggered.
---

# Skill: gen-readiness-report

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).
>
> **Skill = HOW.** Procedure + parameters + output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints
> (those are in `qa-system/core/QA_STANDARD.md`).
>
> The output format block (headings, the meta line, the `Khuyến nghị:` line 3, labels) stays in Vietnamese; copy it verbatim.

## Purpose
Assess how mature the test design is before the Automation branch (Branch G in
`WORKFLOW.md`) is triggered. Produce a single deliverable at `OUTPUT/<task-slug>/15_readiness_report.md`.

## Parameters
- `task_slug`: Mandatory. The task to assess. The report is **per task**, not a shared report —
  two different tasks must never overwrite each other's report.

## Core principle: THE TOOL MEASURES THE FIGURES, THE SKILL ONLY INTERPRETS

> This skill used to count test cases and compute the trace rate by eye — counting by hand
> across hundreds of test cases is a source of error, and an error at the Go/No-Go gate leads to allowing
> automation on top of a design that is not yet mature.

**Mandatory Step 0** — run the measuring tool before writing a single line:

```bash
npm run readiness -- <task-slug> --write
```

This command reads the real deliverables, computes the figures by machine, and writes
`OUTPUT/<task-slug>/15_readiness_metrics.json`. Exit code: `0` = GO · `1` = CONDITIONAL GO · `2` = NO-GO.

The skill **takes every number from that JSON file** and never counts again by itself.
The skill's job is to interpret the meaning, trace the causes, and write the prerequisites.

## Inputs (Đầu vào)

The measuring tool reads the following deliverables. The skill re-reads them **only when it needs a verbatim quote**
(e.g. to take the exact sentence describing a gap), never to count:

| Source | Used for |
|---|---|
| `OUTPUT/<slug>/15_readiness_metrics.json` | **The single source of figures.** Every number in the report comes from here. |
| `OUTPUT/<slug>/01_requirement_risk_summary.md` | `BR`/`FD`/`AF` and `RK` risks — quoted when explaining uncovered items. |
| `OUTPUT/<slug>/02_missing_rule_report.md` | `MR-xx` gaps, Stage 2 verdict — quote the pending questions verbatim. |
| `OUTPUT/<slug>/03_viewpoint_report.md` | Risk areas and `VP-xx` — explain why a viewpoint has no test case yet. |
| `OUTPUT/<slug>/04_test_idea_report.md` | TIs marked `Giữ` / `Chờ MR` — explain ideas that have not become test cases. |
| `OUTPUT/<slug>/05_test_case_spec.md` *(or `testcases/batch_*.md`)* | 8-field test cases — quote specific `TC_ID`s when an example is needed. |
| `OUTPUT/<slug>/06_coverage_review.md` | Stage 6 verdict and coverage matrix (`CHƯA COVER`, `FIX:`/`ASK:`). |
| `OUTPUT/<slug>/12_data_validation_traceability.md` *(if present)* | Outstanding data issues — **kept verbatim**, never fixed by the skill. |
| `knowledge/features/<slug>.md` | Confirmed rule status (Section 3), pending questions (Section 7), confirmed assumptions (Section 8). |

> Neither `05_test_case_spec.md` nor `testcases/batch_*.md` present → the tool returns `NO-GO` with the reason
> "no test cases yet". The skill records exactly that and never imagines content.

## MUST NOT (specific to this skill)
- **NEVER count or compute ratios yourself.** Every number must match `15_readiness_metrics.json` 100%.
  If a figure looks wrong → report the suspicion, do not change the number.
- **NEVER do the next step's work**: never mention execution data (Pass/Fail rate,
  execution bugs, run duration). This is a *design* assessment; nothing has been run yet.
- **NEVER modify source artifacts**: do not add test cases, do not modify test data, do not modify the spec.
- **NEVER approve pending assumptions or close gaps.** Every unclear point goes into the "CÂU HỎI MỞ" (open questions) section.
- **NEVER decide the official Go/No-Go.** The recommendation is only technical advice;
  the final decision belongs to the QA Lead / the person in charge.
- **NEVER proceed to Automation on your own**, even when the result is `GO`. The boundary gate (`AGENTS.md` §1.5)
  requires two more independent conditions: an explicit user request **and** a specific environment URL.

## Go / No-Go logic table

The measuring tool has already applied this table — the skill **cross-checks** it to make sure it understands correctly, without recomputing.

| Recommendation | Condition |
|---|---|
| `NO-GO` | ASK gate CLOSED · OR no test cases at all · OR Trace rate < 80% · OR a test case attached to an unconfirmed rule/gap · OR unresolved data issues remain |
| `CONDITIONAL GO` | Trace 80–99% · OR some viewpoints/rules still uncovered · OR Stage 6 not `PASS` · OR no `12_` yet · OR knowledge at risk of being lost (BA answers not yet recorded in `knowledge/`) |
| `GO` | Trace 100% · ASK gate open · viewpoints and rules fully covered · Stage 6 `PASS` · no data issues left · knowledge recorded in `knowledge/` |

## Steps

1. **Measure by machine**: run `npm run readiness -- <slug> --write`, read `15_readiness_metrics.json`.
2. **Interpret coverage**: for each `VP-xx` and `BR-xx` in `coverage.viewpointsUncovered` /
   `coverage.rulesUncovered`, open `03_` or `01_` to state **specifically** which risk is exposed.
   Do not just list codes — say what is exposed.
3. **Trace the missing traces**: for each `TC_ID` in `testCases.untraced`, state whether it lacks
   `Rule#` or `Viewpoint#`, and propose the code to attach.
4. **Cross-check pending rules**: for each `TC_ID` in `riskyCases`, show which unconfirmed `MR-xx` it relies on
   — these are the test cases at the highest risk of hallucination.
5. **Test data**: quote each issue in `data.issues` **verbatim**. Do not rephrase.
6. **Accumulated knowledge**: if `askGate.advisories` is not empty, state the consequence — the next run will
   have to ask the BA again exactly the questions that were already answered.
7. **Self-check before writing**: every number in the report can be traced back to
   `15_readiness_metrics.json`. No number is made up by the skill.
8. **Write the report** to `OUTPUT/<task-slug>/15_readiness_report.md`.

## Output format

Write `OUTPUT/<task-slug>/15_readiness_report.md`:

````markdown
# Báo Cáo Độ Sẵn Sàng Kiểm Thử · <task-slug>
Owner: qa-system/qa-readiness-evaluator/skills/gen-readiness-report.md · Nguồn: 15_readiness_metrics.json · Verdict: PASS
Khuyến nghị: <GO | CONDITIONAL GO | NO-GO>

## 1. Tổng quan
- **Phạm vi**: <tóm tắt tính năng đang đánh giá>
- **Mục tiêu**: Đánh giá độ chín của test design trước khi kích hoạt Nhánh G (Automation).
- **Nguồn dữ liệu đã nạp** *(lấy từ `sources` trong metrics)*:
  | Deliverable | Trạng thái |
  |---|---|
  | `01_requirement_risk_summary.md` | <Đã nạp / Không có> |
  | `02_missing_rule_report.md` | <Đã nạp / Không có> |
  | `03_viewpoint_report.md` | <Đã nạp / Không có> |
  | Test case | <nguồn: 05_test_case_spec.md hoặc N batch / Không có> |
  | `06_coverage_review.md` | <Đã nạp / Không có> |
  | `12_data_validation_traceability.md` | <Đã nạp / Không có> |
  | `knowledge/features/<slug>.md` | <Đã nạp / Không có> |

## 2. Độ phủ (Coverage)
| Chỉ số | Số liệu | Đánh giá |
|---|---|---|
| Tổng test case | <testCases.total> | |
| Viewpoint đã phủ | <đã phủ>/<kế hoạch> | <VP-xx còn hở + rủi ro tương ứng> |
| Business rule đã phủ | <đã phủ>/<tổng> | <BR-xx còn hở + hệ quả> |

*Rule bị trích dẫn nhưng không tồn tại ở Chặng 1*: <coverage.rulesReferencedButUndefined, hoặc "Không có">

## 3. Ma trận truy vết (Traceability)
- **Tỷ lệ Trace**: <tracePct>% (<traced>/<total>)
- **Test case chưa trace được**: <liệt kê TC_ID + thiếu Rule# hay Viewpoint# + mã đề xuất gắn>
- **Test case dựa trên rule/gap CHƯA CHỐT** *(nguy cơ ảo giác cao nhất)*: <riskyCases + MR-xx tương ứng>

## 4. Cổng ASK
- **Trạng thái**: <MỞ / ĐÓNG>
- **Câu hỏi còn treo**: <từ askGate.pending, nguyên văn>
- **Tri thức có nguy cơ mất**: <từ askGate.advisories, hoặc "Không">

## 5. Sẵn sàng về dữ liệu kiểm thử
- **Trạng thái `12_data_validation_traceability.md`**: <Đã có / Chưa có>
- **Vấn đề tồn đọng** *(trích nguyên văn, không diễn đạt lại)*:
  - <issue 1>

## 6. Kết quả rà soát thiết kế
- **Verdict Chặng 6**: <PASS / FIX / ASK / chưa chạy>
- **Điểm cần can thiệp**: <trích từ 06_coverage_review.md>

## 7. Khuyến nghị Go / No-Go
- **Khuyến nghị**: `<GO | CONDITIONAL GO | NO-GO>`
- **Căn cứ**: <dẫn số liệu cụ thể từ metrics>
- **Điểm chặn phải xử lý xong** *(nếu NO-GO)*:
  1. <từ recommendation.blockers>
- **Điều kiện kèm theo** *(nếu CONDITIONAL GO)*:
  1. <từ recommendation.conditions>

> ⚠️ Kể cả khi khuyến nghị là `GO`, Nhánh G vẫn **KHÔNG** được tự động kích hoạt.
> Cổng biên giới (`AGENTS.md` §1.5) đòi thêm: người dùng yêu cầu rõ ràng **và** URL môi trường cụ thể.
> Quyết định Go/No-Go cuối cùng thuộc về QA Lead / người phụ trách, không thuộc về Agent.

---
## ❓ CÂU HỎI MỞ (cần BA / PO / Tech Lead xác nhận)
- <toàn bộ ambiguity, gap chưa chốt, điểm ASK từ Chặng 6>
````

(Sections: 1 overview · 2 coverage · 3 traceability · 4 ASK gate · 5 test data readiness · 6 design review result ·
7 Go / No-Go recommendation · open questions for BA / PO / Tech Lead. The ⚠️ disclaimer must be kept: even with `GO`,
Branch G is NOT triggered automatically and the final decision belongs to a human.)

> A table cell lacking data must carry an explicit label (`CHƯA XÁC ĐỊNH` (not determined), `[GIẢ ĐỊNH]`, `N/A`); never leave it empty.

## Acceptance gates (Quality Gates)
- [ ] `npm run readiness -- <slug> --write` was run **before** writing the report.
- [ ] The file is written exactly to `OUTPUT/<task-slug>/15_readiness_report.md` (per task, never overwriting another task).
- [ ] **Every number** in the report traces back 100% to `15_readiness_metrics.json`.
- [ ] The meta line follows QA_STANDARD §7 (`Verdict: PASS` when the report matches the metrics; `FIX` when some numbers differ). Line 3 `Khuyến nghị:` (recommendation) matches `recommendation.verdict` in the metrics exactly.
- [ ] Each uncovered `VP-xx` / `BR-xx` is explained in terms of **which risk is exposed**, not just listed as a code.
- [ ] Data issues are kept verbatim from `12_`, never rephrased.
- [ ] The report contains absolutely no execution data (Pass/Fail rate, bugs, run duration).
- [ ] The disclaimer is kept: the boundary gate + the final decision belongs to humans.
