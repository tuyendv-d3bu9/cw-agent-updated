---
name: data-validation-traceability
description: >
  Validates the integrity and logic of the datasets before they are seeded/used,
  and builds a Traceability Matrix linking each data record to its Test Case.
---

# Skill: data-validation-traceability

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · labels §2.1 · FACT §3 · boundary chain §6 · sources §10).
>
> The output format block (headings, column headers, `CHƯA CÓ DATA`, the `## FIX` / `## ASK` tables) stays in Vietnamese;
> `coverage-review` and `npm run readiness` read it. Copy it verbatim.

## Purpose
The two final gating jobs of `qa-system/qa-test-data`:
1. **Validate** the datasets BEFORE they are seeded/used — catch logic/business/format errors.
2. **Traceability Matrix** — link each data record to the test case that uses it.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/10_dataset.md` + `11_boundary_negative_dataset.md` — the datasets to validate.
- `OUTPUT/<task-slug>/05_test_case_spec.md` — the test suite to trace.
- `OUTPUT/<task-slug>/09_data_class_map.md` — the sourced constraints of each field.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `FD`, `BR` for cross-checking.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (§8, §9).

## MUST NOT (specific to this skill)
- "Silently fix" the source dataset — only **propose** a fix.
- Decide by yourself when a rule is unclear (e.g. "does the system accept decimals?") → `ASK`.
- Leave cells empty: a test case without data yet → `CHƯA CÓ DATA` (no data yet).
- Create "orphan" records (serving no test case) unless the reason is stated.
- Trace a test case to data that does not exist in the dataset.

## Part A — Validation

### FACT applied to datasets
| | Criterion | Typical error |
|---|---|---|
| **F** | The value can be traced to a sourced constraint | A value outside the `FD` range, or a range with no source |
| **A** | Correct format/range | An identifier in the wrong conventional format → INSERT fails on a constraint |
| **C** | No required field missing | A NOT NULL column is missing → SQL fails |
| **T** | Clear enough to decide pass/fail | A decimal value, but it is unclear whether the system accepts it |

### 5 common error types in AI-generated data
1. **Logic inconsistency** — two fields are each valid on their own but meaningless together.
2. **Business rule violation** — a value exceeds the range the rule allows for that type.
3. **Date/time logic error** — a timestamp in the past while the status is still "active".
4. **Format inconsistency** — several date/number formats mixed in the same dataset.
5. **Misplaced null** — NULL in a required field in a record that is not deliberately testing NULL.

### How to run it
For each issue record: `Record #` (or code) · faulty field · concrete description · error type ·
suggested fix. Wrong format/logic → `FIX`. A rule is missing to judge it → `ASK`.

## Part B — Traceability Matrix

The agent's overall workflow:
`Requirement → Data Class Map → Realistic Dataset → Export → Boundary/Negative Dataset → Validation → Traceability Matrix → Test Execution`

Principles:
- Each test case that needs data must trace to **one specific record** (code or `#`).
- A boundary/invalid record must link to exactly the matching boundary/negative test case.
- A test case without data yet → `CHƯA CÓ DATA`.

## Output format
Write `OUTPUT/<task-slug>/12_data_validation_traceability.md`:

```markdown
# Data Validation & Traceability · <task-slug>
Owner: qa-system/qa-test-data/skills/data-validation-traceability.md · Nguồn: 10_dataset.md, 11_boundary_negative_dataset.md, 05_test_case_spec.md · Verdict: FIX

## 1. Kết quả Validation
- **Tổng quan**: [số issue theo từng loại lỗi]

| # | Record | Field lỗi | Mô tả lỗi | Loại lỗi | Gợi ý sửa | Verdict |
|---|---|---|---|---|---|---|
| 1 | [mã/#] | [field] | [mô tả cụ thể] | [1 trong 5 loại] | [bản sửa đề xuất] | FIX |
| 2 | [mã/#] | [field] | [rule chưa rõ] | — | — | ASK |

## 2. FACT Check dataset
| | Tiêu chí | Kết quả | Ghi chú |
|---|---|---|---|
| F | Giá trị đúng thực tế/rule | PASS/FAIL | … |
| A | Đúng định dạng/khoảng | PASS/FAIL | … |
| C | Không thiếu trường bắt buộc | PASS/FAIL | … |
| T | Đủ rõ để biết pass/fail | PASS/FAIL | … |

## 3. Traceability Matrix
| Test Case ID | Test Case Title | Test Data Record | Data Type | Notes |
|---|---|---|---|---|
| <MODULE>-001 | [title] | D-01 | Valid | [ghi chú] |
| <MODULE>-005 | [title] | B-01 | Boundary | [điểm §6] |
| <MODULE>-0xx | [title] | CHƯA CÓ DATA | — | [cần sinh thêm] |

## 4. Record mồ côi (nếu có)
| Record | Vì sao chưa nối test case nào | Đề xuất |
|---|---|---|
| [mã] | […] | [bổ sung TC / xoá record] |

## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
```

(Sections: 1 validation result · 2 FACT check of the dataset · 3 traceability matrix · 4 orphan records (if any).)

## Acceptance gates (Quality Gates)
- [ ] 100% of the Test Cases that need data are linked to a specific record in the Traceability Matrix (FACT — C).
- [ ] Each mapped record states its values clearly enough to reproduce the exact test (FACT — T).
- [ ] No FIX/ASK-level issue is skipped without a matching solution or question.
- [ ] The file is written to `OUTPUT/<task-slug>/12_data_validation_traceability.md`.
