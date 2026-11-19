---
name: run-jira-sync
title: "Jira and Redmine sync"
description: "Export CSV, push test cases to Jira, or pull the bug list for analysis."
format: legacy
triggers:
  - "đồng bộ Jira"
  - "đẩy test case lên Jira"
  - "kéo bug từ Jira về"
  - "sync with Jira"
  - "push test cases to Jira"
  - "pull bugs from Jira"
---

# Jira & Redmine sync

| The user says | Agent | Command | Output |
|---|---|---|---|
| *"Export the test cases to a file for Jira Xray / Redmine"* | `qa-test-design` | `npm run testcases:export <slug>` | `OUTPUT/<slug>/export_jira_xray.csv` · `export_redmine.csv` (UTF-8 BOM) |
| *"Push the test cases to Jira"* | `qa-test-design` | `npm run jira:push <slug>` | With `.env` ⇒ pushed via the REST API; without ⇒ report where the CSV file is for import |
| *"Pull the bugs from Jira/Redmine"* | `qa-reporter` | `npm run jira:pull <slug>` | `OUTPUT/<slug>/jira_defects_summary.md` |
| *"Push the run results to Jira"* | `qa-automation` | `npm run jira:sync <slug> <run-id>` | Results + evidence images attached to the issues |

Before export/push: `npm run lint -- <slug>` must exit `0`.
Pulled bugs are **reference data** for risks; they are not a source of rules (`qa-system/core/QA_STANDARD.md` §10.1) —
anything a bug suggests that the documents do not yet say becomes a question in `02`.
MCP configuration: `qa-system/integrations/jira-mcp-guide.md`.
