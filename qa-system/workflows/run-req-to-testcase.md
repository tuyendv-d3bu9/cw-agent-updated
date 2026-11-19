---
name: run-req-to-testcase
title: "Requirement analysis with the ASK gate, then test cases"
description: "Analyse risks and 06W gaps, pass the ASK gate after Stage 2, then write viewpoints, test ideas, test cases and review coverage."
format: v1

triggers:
  - "cần tạo testcase"
  - "dựa vào thông tin thì tạo testcase đi"
  - "dựa vào thông tin tạo testcase"
  - "cần tạo test case từ thông tin"
  - "need to create test cases"
  - "create test cases from this information"
  - "turn this information into test cases"

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

  - agent: qa-test-design
    skill: coverage-review
    gate: lint
    output: 06_coverage_review.md
---

# Requirement analysis with the ASK gate, then test cases

## When to use
You have the initial documents and need to go from analysis to a coverage-reviewed test case set (Mode 1).

## Stop points
- Before step 3: the `ask` gate (`npm run gate <slug>`). Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- Before step 6: the `lint` gate (`npm run lint -- <slug>`).

Stops at Stage 6. To run the data branch as well, use `run-testcase`.
