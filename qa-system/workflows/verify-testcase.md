---
name: verify-testcase
title: "Test suite acceptance"
description: "Only the Stage 6 coverage review plus manual checks; nothing new is generated."
format: legacy
triggers:
  - "nghiệm thu test case"
  - "kiểm tra bộ test trước khi bàn giao"
  - "rà soát lại bộ test case"
  - "accept the test cases"
  - "check the test suite before handover"
  - "review the test case set again"
---

# RUNBOOK — Test suite acceptance (nothing new generated)

> Read and assess only. The only newly written file: `06_coverage_review.md`.

## 1. Prerequisites
- [ ] `01`, `02`, `04`, `05` exist in `OUTPUT/<slug>/` — missing ⇒ **stop**; there is no baseline to reconcile against.
- [ ] `npm run gate <slug>` exits `0` and `npm run lint -- <slug>` exits `0`.
- [ ] If `12` exists, include it; if not, state clearly in `06` that the data gaps were not assessed.

## 2. Command block
```
Run qa-system/qa-test-design/skills/coverage-review.md for <slug>.
Verdict per qa-system/core/QA_STANDARD.md §1 (the dedicated rule of coverage-review).
Do not generate new test cases, do not edit 01–05, do not change statuses in knowledge.
Tick 00_plan.md and print the verdict.
```

## 3. Manual checks — done by humans, never delegated to the agent to self-grade

| # | Check | Passes when |
|---|---|---|
| 1 | Trace 3 TCs backwards: `Tags` → `04` → `03` → `01`/knowledge → `INPUT/<slug>/` | No stage is broken |
| 2 | Trace 3 `BR-xx`/`FD-xx` forwards | They have a TC, or `CHƯA COVER` (not covered) in `06` |
| 3 | A field with min/max in the sources | The full QA_STANDARD §6 boundary chain |
| 4 | 3 negative TCs | The Expected is quoted from a source, or labelled `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` |

Any failing check ⇒ record it in the FIX table of `06` and send it back to the matching step.

## 4. Human-Final
The Human-Final section of `06` (accepted risk level, cross-system impact, further exploration) is signed off by the person in charge.
Exploration needed ⇒ `qa-system/qa-automation/skills/exploratory-charter.md`; do not cram it into the scripted set.
