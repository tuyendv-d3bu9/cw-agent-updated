---
name: run-ba-spec-to-testcase
title: "New BA documents to test cases, with gates"
description: "When the BA sends new documents: analyse, ask the BA about any remaining gaps, and only then generate and check test cases."
format: v1

triggers:
  - "BA gửi tài liệu mới"
  - "có tài liệu mới cần làm test case"
  - "làm test case cho tài liệu BA vừa gửi"
  - "the BA sent new documents"
  - "new documents need test cases"
  - "write test cases for the new BA documents"

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

# New BA documents to test cases, with gates

## When to use
The BA has just sent new requirement documents and you want to go from analysis to a checked test case set,
without ever generating test cases on top of business logic that is still ambiguous.

## Stop points
- Before step 3: the `ask` gate (`npm run gate <slug>`). Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- Before step 6: the `lint` gate.

Stops at Stage 6. Moving on to automation needs `readiness` and a separate confirmation (`AGENTS.md` §1.5).
