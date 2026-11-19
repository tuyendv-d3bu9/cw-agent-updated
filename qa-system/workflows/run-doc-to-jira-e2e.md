---
name: run-doc-to-jira-e2e
title: "End-to-end testing process from documents to Automation and Jira"
description: "From documents to test cases, acceptance, push to Jira, run E2E automation, update Jira and produce the report."
format: v1

triggers:
  - "chạy quy trình kiểm thử trọn gói"
  - "từ tài liệu đến tự động test và jira"
  - "kiểm thử trọn gói đẩy jira và automation"
  - "chạy pipeline testcase automation jira"
  - "run the end-to-end testing package"
  - "from documents to automated tests and jira"
  - "full testing with jira and automation"
  - "run the testcase automation jira pipeline"

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

  - tool: jira:push
    output: jira_testcase_mapping.md
    note: "Push the test case set to Jira to create task/test issues and produce the TC ID ↔ Jira Key mapping table."

  - agent: qa-automation
    skill: test-runner-evidence
    gate:
      - readiness
      - confirm
    output: runs/RUN-01/run_result.md
    note: "Needs readiness GO and user confirmation with the environment URL (AGENTS.md §1.5)."

  - tool: jira:sync
    args: "{slug} RUN-01"
    note: "Sync the test results, attach the evidence screenshots and update the issue statuses in Jira."

  - agent: qa-reporter
    skill: gen-daily-summary
    note: "4-section report, written to OUTPUT/reports/ (per the gen-daily-summary skill)."
---

# End-to-End Testing Process: From Documents to Automation and Jira

## When to use
When you have the initial requirement documents (PRD/SRS/User Story) and want to go through the whole testing cycle:
1. Analyse the requirements, extract the risks and find 06W logic gaps.
2. Design Viewpoints and Test Ideas.
3. Generate detailed 8-field FACT-standard Test Cases and check coverage.
4. Push the Test Case catalogue to Jira (create issues and the mapping table).
5. Execute automatically with Playwright, capturing evidence screenshots.
6. Send the test run results and update the statuses (Transitions) in Jira.
7. Produce the quality summary report (Daily/Run Summary).

## Stop points
- Before step 3: the `ask` gate (`npm run gate <slug>`). Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- Before step 6: the `lint` gate.
- Before step 8: `npm run readiness -- <slug>` must return `GO` **and** the user must confirm with the environment URL
  (`AGENTS.md` §1.5). `CONDITIONAL GO` is not enough.
