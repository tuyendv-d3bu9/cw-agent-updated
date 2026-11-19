---
name: boundary-negative-dataset
description: >
  Generates deliberate boundary and negative datasets: each record checks exactly one point of the QA_STANDARD §6
  boundary chain or one Invalid/Null/Special class, tied to a specific test case.
---

# Skill: boundary-negative-dataset

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · labels §2.1 · FACT §3 · **boundary chain §6** · sources §10).
>
> The output format block (headings, column headers, `Không áp dụng` / `CHƯA CÓ DATA` / `Record mồ côi` labels) stays
> in Vietnamese; later stages and tools read it. Copy it verbatim.

## Purpose
Each record checks exactly one edge case; the other fields stay Valid to isolate the variable.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/09_data_class_map.md` — Field Map, boundary points.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR` to determine what counts as a "violation".
- `OUTPUT/<task-slug>/05_test_case_spec.md` — the boundary/negative TCs that need records.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (§9).

## MUST NOT (specific to this skill)
- Compute boundary points yourself: run `npm run boundary -- <task-slug>` and copy the values (computed by machine from the FD constraints).
- Build a boundary chain for a field with no min/max/length in the sources — that cell records `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.
- Generate several records for the same edge case, or add records to reach a count.
- Leave `Test Purpose` or `TC_ID` empty.

## Steps
1. For each field in 09: a field with a range ⇒ the 7 points of §6; a field with a format/length ⇒ the §6 format chain;
   Null/Empty only when `Bắt buộc` (required) has a source.
2. One record per edge case; the other fields take Valid values from `10_dataset.md` or from the sources.
3. Attach `Loại data` (data type), `Test Purpose`, the `FD` code, and the `TC_ID` that uses the record. No TC uses it ⇒ record `Record mồ côi` (orphan record) + the reason.
4. Export CSV/SQL/JSON (NULL and date conventions per `dataset-generation`).

## Output format
Write `OUTPUT/<task-slug>/11_boundary_negative_dataset.md`:

````markdown
# Boundary & Negative Dataset · <task-slug>
Owner: qa-system/qa-test-data/skills/boundary-negative-dataset.md · Nguồn: 09_data_class_map.md, 01_requirement_risk_summary.md, 05_test_case_spec.md · Verdict: PASS

## 1. DATASET
| # | TC_ID | <field 1> | <field 2> | Loại data | Test Purpose | FD |
|---|---|---|---|---|---|---|
| B-01 | <MODULE>-005 | <max+1 tính từ nguồn> | <Valid> | Boundary | <field 1 = max+1> | FD-01 |

## 2. ĐỐI CHIẾU CHUỖI BIÊN
| FD | min-1 | min | min+1 | Giữa | max-1 | max | max+1 |
|---|---|---|---|---|---|---|---|
| FD-01 | B-03 | B-01 | … | … | … | … | B-07 |

Ô không áp dụng ⇒ `Không áp dụng`; chưa có ⇒ `CHƯA CÓ DATA`; thiếu ngưỡng ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.

## 3. EXPORT — <csv | sql | json>
```<csv|sql|json>
<nội dung đúng cú pháp>
```
````

(Section 2 = boundary chain reconciliation; `Giữa` = middle value. Cell rule: not applicable ⇒ `Không áp dụng`; no record yet ⇒
`CHƯA CÓ DATA`; threshold missing ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.)

## Acceptance gates (Quality Gates)
- [ ] All §6 points present for every field with a threshold in the sources; no points for fields without a threshold.
- [ ] Each record has a `TC_ID`, `Test Purpose`, `FD`; no two records cover the same edge case.
- [ ] The reconciliation table has no empty cells.
