---
name: dataset-generation
description: >
  Generates Valid datasets for the test cases that need data, with values inside sourced constraints,
  reproducible by seed, exported as CSV / SQL INSERT / JSON.
---

# Skill: dataset-generation

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · labels §2.1 · FACT §3 · sources §10 · dates §11).
>
> The output format block (headings, column headers, the `Seed:` line) stays in Vietnamese where it already is; later stages
> and tools read it. Copy it verbatim.

## Purpose
Generate **Valid** records for each test case that needs data, exported in a ready-to-use format. Same schema + same seed ⇒ same dataset.

## Parameters
- `format` ∈ `csv` · `sql` · `json`.
- `seed` — an integer, **mandatory** when the engine is used. Record it in the output.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/09_data_class_map.md` — Field Map and sourced constraints.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — TCs that need data (`Test Data`).
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR`.
- `knowledge/_project.md` (§2 date/currency formats, NULL vs empty, whether production-like data may be used) ·
  `knowledge/features/<feature-slug>.md` (§9 constants).
- Only when `knowledge/_sut.json` has a `domain`: the pack's data types / enums (listed by `npm run domain`) and `vocab`
  (QA_STANDARD §10.3). `_sut.json` has no `domain` ⇒ skip; every existing generator works as before.

## MUST NOT (specific to this skill)
- Set value ranges, code formats, units or "common industry" levels that are not in the `FD`/knowledge §9.
  A field whose constraint has no source ⇒ value cell `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`, do not generate.
- Generate boundary/negative records — that is the job of `boundary-negative-dataset`.
- Rename fields relative to the Field Map.
- Run the engine without `--seed`.
- Mix date formats within one dataset.

A field with **no business constraint** (e.g. a free-text full name) may use a generator to get a realistic-looking value — that value
asserts no rule.

## Engine (>10 records)
Never type records one by one. Write a schema and run:
```bash
npm run data:gen -- --slug <task-slug> --schema OUTPUT/<task-slug>/dataset_schema.json --count <n> --seed <number> --output OUTPUT/<task-slug>/10_dataset.md
```
Schema template and list of generators: `qa-system/templates/dataset-schema.example.json`. Keys starting with `_`
are comments. Constraints in the schema (min/max, enum, format) must be copied from the Field Map; dates use `YYYY-MM-DD`
(or the format in `_project.md` §2).
With a `domain`: the engine recognises the pack's types (`"type": "<pack type>"`) and the pack's enums (`"type": "enum", "enum": "<name>"`) —
use them only for fields **with no business constraint** in the Field Map; fields with constraints are still copied from the Field Map.

## Choosing the format
| Format | Use when | Notes |
|---|---|---|
| CSV | Import into Excel/TestRail, data provider | Header uses the exact field names; values with commas/quotes ⇒ wrap in quotes |
| SQL INSERT | Seed the test DB | Escape special characters; one statement per record |
| JSON | API tests | Keys match the field names |

NULL: empty CSV cell · SQL `NULL` · JSON `null` (unless `_project.md` declares otherwise).

## Steps
1. Take the list of TCs that need data from 05; one or more records per TC.
2. For each field, take the constraint from the Field Map. Missing ⇒ a label, do not generate.
3. ≤ 10 records: write them by hand per the constraints. > 10: schema + engine with `--seed`.
4. Self-check: values sit inside the sourced constraints; dates are consistent with states; no pointless duplicates.

## Output format
Write `OUTPUT/<task-slug>/10_dataset.md`:

````markdown
# Dataset · <task-slug>
Owner: qa-system/qa-test-data/skills/dataset-generation.md · Nguồn: 09_data_class_map.md, 05_test_case_spec.md · Verdict: PASS
Seed: <số> · Schema: OUTPUT/<task-slug>/dataset_schema.json

## 1. DATASET (VALID)
| # | TC_ID | <field 1> | <field 2> | Ghi chú |
|---|---|---|---|---|
| D-01 | <MODULE>-001 | <giá trị trong ràng buộc FD-xx> | <…> | <…> |

## 2. FIELD CHƯA SINH ĐƯỢC
| Field | FD | Thiếu gì | MR |
|---|---|---|---|

## 3. EXPORT — <csv | sql | json>
```<csv|sql|json>
<nội dung đúng cú pháp>
```
````

(Section 2 = fields that could not be generated: what is missing, MR.)

## Acceptance gates (Quality Gates)
- [ ] Each record is tied to a `TC_ID`; every TC that needs data has a record or a reason in §2.
- [ ] Every constrained value sits inside a sourced constraint; the seed is recorded.
- [ ] No syntax errors in the export; dates in a single format.
