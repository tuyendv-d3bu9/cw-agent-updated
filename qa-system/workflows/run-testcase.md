---
name: run-testcase
title: "Full test design and data run"
description: "Runs Stages 1 to 5, the data branch 09 to 12, then Stage 6 including the data gaps found by 12."
format: v1

triggers:
  - "chạy trọn bộ test case"
  - "làm đầy đủ test case kèm dữ liệu"
  - "chạy toàn bộ quy trình kiểm thử"
  - "run the complete test suite with data"
  - "full test cases plus datasets"
  - "run every testing stage including data"

steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md

  - agent: qa-analyst
    skill: viewpoint-selection
    gate: ask
    output: 03_viewpoint_report.md

  - agent: qa-analyst
    skill: test-idea-design
    output: 04_test_idea_report.md

  - agent: qa-test-design
    skill: test-case-generation
    output: 05_test_case_spec.md

  - agent: qa-test-data
    skill: data-class-map
    output: 09_data_class_map.md

  - agent: qa-test-data
    skill: dataset-generation
    output: 10_dataset.md

  - agent: qa-test-data
    skill: boundary-negative-dataset
    output: 11_boundary_negative_dataset.md

  - agent: qa-test-data
    skill: data-validation-traceability
    output: 12_data_validation_traceability.md

  - agent: qa-test-design
    skill: coverage-review
    gate: lint
    output: 06_coverage_review.md
    note: "Also read 12 to collect the CHƯA CÓ DATA (no data yet) gaps and orphan records."
---

# Full run (`01 → 05` + `09 → 12` + `06`)

## When to use
You need a test suite with data, ready to execute (Mode 2).

## Stop points
- Before step 3: the `ask` gate (`npm run gate <slug>`). Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- Before step 10 (`06`): the `lint` gate.
- `06` runs **after** `12` because `12` finds the test cases marked `CHƯA CÓ DATA` (no data yet) and the orphan records — input for the gaps of `06`.
  If `06` already exists, re-run it.

## Acceptance — trace back one test case that needs data
`12` (which record supplies the data) → `Tags` → `04` → `03` → `01` / `knowledge/features/<slug>.md` → `INPUT/<slug>/`.

## Common problems
| Symptom | Handling |
|---|---|
| Branch B full of `[CONTEXT_MISSING]` | `knowledge/_project.md` still contains `<điền>` (to be filled) — that is genuinely missing, do not fill it yourself; ask the user |
| `12` reports many `CHƯA CÓ DATA` | Check the boundary reconciliation table in `11` before re-running `12` |
| The agent crams several steps into 1 file | One skill, one file — QA_STANDARD §7 |
