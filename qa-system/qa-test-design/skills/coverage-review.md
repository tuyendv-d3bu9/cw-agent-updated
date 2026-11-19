---
name: coverage-review
description: >
  Reconciles test-suite coverage: every BR/FD/AF, confirmed MR and "Giữ" (kept) TI has a test case; balance across
  the viewpoints chosen in Stage 3; the boundary chain is complete. Gives a PASS / FIX / ASK verdict with an end point.
---

# Skill: coverage-review

> Complies with `qa-system/core/QA_STANDARD.md` (**Stage 6 verdict §1** · guards §2 · labels §2.1 · FACT §3 ·
> boundary chain §6 · knowledge §8 · IDs §9 · sources §10).
>
> The output format block (headings, column headers, `CHƯA COVER`, `Đạt`, the `FIX:` / `ASK:` prefixes, the
> `## FIX` / `## ASK` tables) stays in Vietnamese: tools and the readiness check read it. Copy it verbatim.

## Purpose
The final gate of test design: find the items without a test case and state clearly why — not written yet (fixable)
or missing information (must be asked). It does not judge, in place of humans, which level of risk is acceptable.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` and their statuses.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — the chosen VPs.
- `OUTPUT/<task-slug>/04_test_idea_report.md` — TIs marked `Giữ` / `Chờ MR`.
- `OUTPUT/<task-slug>/05_test_case_spec.md` (or `testcases/batch_*.md`).
- `OUTPUT/<task-slug>/12_data_validation_traceability.md` if present.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7 (MR statuses), §8.

## MUST NOT (specific to this skill)
- Renumber / merge the codes of 01–05.
- Leave the `Test Case IDs cover` cell empty — if there is none yet, write `CHƯA COVER` (not covered).
- Propose additions that come with invented values, message texts or expected results. A proposal states only **the scenario + the source code**;
  values point back to the sources or a §2.1 label.
- Compare viewpoints against any list other than the VPs chosen in 03.
- Write test cases yourself — a fixable gap is returned as `FIX` to `test-case-generation`.

## Steps
1. **Lint** — run `npm run lint -- <task-slug>`, paste the real result. Exit `1` ⇒ verdict `FIX`, list the errors, stop.
2. **Matrix** — one row for each `BR`/`FD`/`AF` of 01, each `Confirmed` `MR`, each `Giữ` `TI`. The cover column takes
   the `TC_ID`s carrying the matching `Rule#<code>` or `TI#<code>` tag.
3. **Classify the gap** of each `CHƯA COVER` row:
   - There is a `Giữ` TI or the sources are sufficient to write it ⇒ `FIX: <kịch bản> — dựa trên <mã>` (FIX: <scenario> — based on <code>; hand to `test-case-generation`; if there is no TI yet, hand to `test-idea-design`).
   - Only a `Chờ MR` TI, or information is missing ⇒ `ASK: MR-xx` (the MR exists) or `ASK: cần MR cho <mã> × W<n>` (an MR is needed for <code> × W<n>; hand to Stage 2).
4. **Viewpoint balance** — each VP in 03 §2 has at least one TC tagged `Viewpoint#VP-xx` (one TC may carry several `Viewpoint#` tags); a TC carrying a VP not in 03 ⇒ `FIX`.
5. **Boundary chain** — for each `FD` with min/max/length in the sources: every QA_STANDARD §6 point has a TC. An `FD` without a threshold
   in the sources ⇒ not counted as a gap here (it is already an MR).
6. **Data** — if `12_` exists ⇒ record the TCs marked `CHƯA CÓ DATA` (no data yet) (for reference; does not change the verdict).
7. **Verdict** — per QA_STANDARD §1 (Stage 6): `PASS` when lint is clean and no `CHƯA COVER` is left; FIX-type gaps
   remaining ⇒ `FIX`; only ASK-type gaps remaining ⇒ `ASK`. Both ⇒ `FIX` (fix the fixable part first).

A converging loop: each `FIX` round reduces the number of `CHƯA COVER` rows; no gaps left ⇒ `PASS`. Do not raise vague doubts when there is no gap.

## Output format
Write `OUTPUT/<task-slug>/06_coverage_review.md`:

````markdown
# Coverage Review · <task-slug>
Owner: qa-system/qa-test-design/skills/coverage-review.md · Nguồn: 01–05, knowledge/features/<feature-slug>.md · Verdict: FIX

## 1. KẾT QUẢ LINT
```
<dán nguyên kết quả npm run lint -- <task-slug>>
```

## 2. MA TRẬN ĐỘ PHỦ
| Mã | Loại | Mô tả | Test Case IDs cover | Gap & Đề xuất |
|---|---|---|---|---|
| BR-01 | BR | <mô tả ngắn từ 01> | <MODULE>-001, <MODULE>-002 | Đạt |
| FD-02 | FD | <…> | CHƯA COVER | FIX: kiểm điểm max+1 — dựa trên FD-02 |
| AF-01 | AF | <…> | CHƯA COVER | ASK: MR-04 |
| TI-05 | TI | <…> | <MODULE>-007 | Đạt |

## 3. CÂN BẰNG VIEWPOINT
| VP | Tên | Số TC | Ghi chú |
|---|---|---|---|
| VP-01 | Happy Path | <số> | <…> |

## 4. CHUỖI BIÊN
| FD | min-1 | min | min+1 | Giữa | max-1 | max | max+1 |
|---|---|---|---|---|---|---|---|
| FD-02 | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | <TC_ID> | CHƯA COVER |

## 5. HUMAN-FINAL
- Mức rủi ro chấp nhận được, Priority cuối, Automated/Manual: do QA Lead / PO quyết (không chặn verdict).

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
````

(Sections: 1 lint result · 2 coverage matrix — `Đạt` = covered · 3 viewpoint balance · 4 boundary chain · 5 Human-Final.)

A format/length `FD` uses the matching §6 columns (empty · 1 character · exact length · over length · wrong format · special characters).
A section with no rows ⇒ do not build a table; write the text line `Không có` (none).

## Acceptance gates (Quality Gates)
- [ ] Lint has been run and its real result pasted.
- [ ] The matrix contains every `BR`/`FD`/`AF` of 01, every `Confirmed` `MR`, every `Giữ` `TI`; no empty cells.
- [ ] Every gap carries `FIX:` or `ASK:` with a source code; no invented values.
- [ ] Viewpoints are compared only with the VPs of 03.
- [ ] The verdict follows the Stage 6 rule (QA_STANDARD §1).
