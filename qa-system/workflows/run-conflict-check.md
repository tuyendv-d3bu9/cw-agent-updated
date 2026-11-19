---
name: run-conflict-check
title: "Cross-feature knowledge conflict review"
description: "Finds clashing logic gaps between the feature under analysis and the existing features."
format: legacy
triggers:
  - "kiểm tra xung đột tri thức"
  - "tính năng mới có đá logic cũ không"
  - "rà soát mâu thuẫn giữa các tính năng"
  - "check knowledge conflicts"
  - "does the new feature break old logic"
  - "review contradictions between features"
---

# Cross-feature knowledge conflict review

1. The QA Leader runs `npm run knowledge:conflicts <slug>` → `OUTPUT/<slug>/01_conflict_warning.md` and summarises the result for the user.
2. `qa-analyst` (skill `missing-rule-06w`) reads the warnings; each real conflict becomes one `MR-xx` — never pick the right side yourself
   (`qa-system/core/QA_STANDARD.md` §10.2).

The tool does two things: compares same-named knowledge §9 constants across features (different numbers ⇒ conflict), and searches for
allow/deny pairs by topic (defaults built into the tool, overridable with `knowledge/_conflict_topics.json`).
Exit `1` ⇒ conflicts found; exit `0` only means the heuristic found nothing.

> The tool searches by keyword, so it may miss things or raise false alarms. "No conflict found" is **not** proof that the two features
> are consistent; the agent still cross-checks the feature's BR/FD against the related `knowledge/features/*.md` when running `02`.
