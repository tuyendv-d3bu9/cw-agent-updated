---
name: data-class-map
description: >
  Builds the Data Class map (Valid, Boundary, Invalid, Null/Empty, Special) for each field taken from
  the Stage 1 FD table, with boundary points when the sources give min/max/length.
---

# Skill: data-class-map

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · labels §2.1 · FACT §3 · **boundary chain §6** ·
> knowledge §8 · sources §10).
>
> The output format block (headings, column headers, labels) stays in Vietnamese; later stages and tools read it. Copy it verbatim.

## Purpose
Normalise the classification of test data for **each field** before datasets are generated — to stop "Garbage data → Garbage testing".

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — **§3b FIELD & RÀNG BUỘC** (`FD-xx`) and the related `BR`s.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — which TCs need data for which fields.
- `knowledge/_project.md` (§2 date/currency formats, NULL vs empty) · `knowledge/features/<feature-slug>.md` (§3b, §8, §9).

## MUST NOT (specific to this skill)
- Generate datasets in this step.
- Add fields that are not in the `FD`s of 01.
- Set value ranges, lengths or formats yourself. Not in the `FD`/knowledge §9 ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.

## Registry of 5 Data Classes (fixed)
| Data Class | Description |
|---|---|
| **Valid** | Meets every sourced constraint |
| **Boundary** | A point of the QA_STANDARD §6 boundary chain |
| **Invalid** | Violates a sourced constraint (wrong type, wrong format, out of range) |
| **Null/Empty** | No value — only when `Bắt buộc` (required) has a source |
| **Special** | Special characters, extra whitespace, upper/lower case |

## Steps
1. One row per `FD-xx` of 01; type, required-ness and constraints are copied from the `FD` (or knowledge §9 with its source).
2. Choose the applicable Data Classes according to the **sourced** constraints.
3. An `FD` with min/max/length in the sources ⇒ record the boundary points per §6. None ⇒ `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`.
4. A field lacking information ⇒ record it in table §2; if an MR exists, point to its code; if not, add a `## ASK` row (hand over to Stage 2).

## Verdict
`PASS` when every `FD` has a row and every gap in information already has an MR or an ASK row. A field still lacking information with no MR ⇒ `ASK`.

## Output format
Write `OUTPUT/<task-slug>/09_data_class_map.md`:

````markdown
# Data Class Map · <task-slug>
Owner: qa-system/qa-test-data/skills/data-class-map.md · Nguồn: 01_requirement_risk_summary.md §3b, knowledge/features/<feature-slug>.md · Verdict: PASS

## 1. FIELD MAP
| FD | Field | Kiểu | Ràng buộc (có nguồn) | Data Class cần test | Mốc biên (§6) |
|---|---|---|---|---|---|
| FD-01 | <tên> | <kiểu> | <chép từ FD> | Valid, Boundary, Invalid, Null/Empty | <min-1 … max+1 tính từ nguồn, hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]> |

## 2. FIELD THIẾU THÔNG TIN
| FD | Thiếu gì | MR |
|---|---|---|
| FD-02 | <min/max, định dạng…> | <MR-xx, hoặc "chưa có — xem ASK"> |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
````

(Sections: 1 field map — type, sourced constraint, data classes to test, boundary points · 2 fields lacking information — what is missing, MR.)

## Acceptance gates (Quality Gates)
- [ ] Every `FD` of 01 has exactly one row; no field outside the `FD`s.
- [ ] No threshold/format that cannot be traced back to an `FD` or knowledge §9.
- [ ] Boundary points follow §6 for fields with a threshold in the sources.
