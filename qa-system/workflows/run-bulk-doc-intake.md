---
name: run-bulk-doc-intake
title: "Bulk document intake, distillation and knowledge update"
description: "Converts documents to Markdown in bulk, distils knowledge in sourced batches, checks conflicts, then updates knowledge/."
format: v1

triggers:
  - "xử lý tài liệu số lượng lớn"
  - "nạp tài liệu hàng loạt"
  - "tiếp nhận hơn 100 file"
  - "chuẩn hoá tài liệu dự án"
  - "cập nhật tri thức hàng loạt"
  - "phân tích hàng trăm tài liệu"
  - "process a large volume of documents"
  - "bulk load documents"
  - "take in more than 100 files"
  - "normalise the project documents"
  - "bulk update the knowledge"
  - "analyse hundreds of documents"

steps:
  - tool: "intake:bulk"
    args: "--slug {slug}"
    output: 00_intake_manifest.md
    note: "Bulk-convert (.docx, .doc, .xlsx, .pdf, .pptx, .txt) to .md, drop duplicates, sort into the 5 folders. Broken/unsupported files stay in place and are listed in the manifest — report them to the user."

  - tool: "knowledge:digest"
    output: 00_digest_plan.md
    note: "Split into context-sized batches, taking only new or changed documents. 0 batches ⇒ skip the next step."

  - agent: qa-analyst
    skill: knowledge-digest
    output: 00_knowledge_digest.md
    note: "Extract each batch into knowledge_digest/batch_NN.md, then merge, keeping the original quotes. Two documents that disagree: record it and let Stage 2 produce an MR."

  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md
    note: "Read 00_knowledge_digest.md instead of the raw documents, keeping the source column."

  - tool: "knowledge:conflicts"
    output: 01_conflict_warning.md
    note: "Check conflicts with existing features. The tool searches by keyword: finding no conflict is not proof that there is none."

  - agent: qa-analyst
    skill: missing-rule-06w
    output: 02_missing_rule_report.md
    note: "Conflicts between documents, Annotations / Pending changes items and conflict warnings all become MRs."

  - tool: "gate"
    note: "On exit 1, stop and present the questions for the BA/PO."

  - tool: "knowledge:sync"
    args: "{slug} --write"
    output: 00_knowledge_sync_log.md
    note: "Run once the user has provided the BA/PO answers, then run the gate again."
---

# Bulk document intake, distillation and knowledge update

## When to use
The project receives a large body of documents (tens to hundreds of files, many formats) and needs to turn them into
knowledge in `knowledge/`. Reading the whole body in one pass overflows the context, so the analysis goes through
a batch distillation step (`knowledge-digest`). Every knowledge line keeps its source file + section.

When the BA sends more documents or revises them, re-run this workflow: `knowledge:digest` only puts new or
changed documents into batches; the cards of unchanged documents are reused.

## Stop points
- **After step 7 (ASK gate)**: `npm run gate <slug>` exits `1` ⇒ stop. Gate rules: `qa-system/core/QA_STANDARD.md` §1.
- **After the BA answers**: step 8 syncs into `knowledge/features/<slug>.md`; once the gate opens, move on to Stage 3 with
  `run-req-to-testcase` or `re-run-testcase`.
