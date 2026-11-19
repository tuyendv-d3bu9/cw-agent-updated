---
name: run-to-testcase
title: "From raw requirements to a test case spec"
description: "Runs Stages 1 to 5 with the ASK gate after Stage 2 and produces a lint-checked test case spec; no coverage review yet."
format: v1

triggers:
  - "từ tài liệu ra test case"
  - "sinh test case từ yêu cầu"
  - "phân tích và viết test case"
  - "from documents to test cases"
  - "generate test cases from requirements"
  - "analyse and write test cases"

steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Stage 1 has no hard stop: OQ-xx items are handed to Stage 2."

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

  - tool: lint
    note: "On exit 1, fix 05 before reporting done."
---

# From raw requirements to a test case spec (`01 → 05`)

## When to use
You need a test case set quickly and no coverage review yet. To get `06`, use `run-req-to-testcase`.

## Stop points
- Before step 3: the `ask` gate (`npm run gate <slug>`). Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- After step 5: `npm run lint -- <slug>` must exit `0`.

## Acceptance — trace one test case backwards
`Tags` (`Rule#…`, `Viewpoint#VP-xx`, `TI#TI-xx`) → `04` (which idea, why it is `Giữ` (kept)) → `03` (viewpoint, risk)
→ `01` or `knowledge/features/<slug>.md` (rule, source) → `INPUT/<slug>/` (the original wording).
A break at any stage is a traceability error.
