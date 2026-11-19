---
name: re-run-testcase
title: "Re-run after the BA answers"
description: "Re-runs from the affected step after the BA settles the questions or after a FIX verdict."
format: legacy
triggers:
  - "BA đã trả lời chạy lại"
  - "chạy lại sau khi BA chốt"
  - "làm lại sau khi có câu trả lời"
  - "the BA answered, re-run"
  - "re-run after the BA confirmed"
  - "redo after getting the answers"
---

# RUNBOOK — Re-run after the BA answers / after a FIX verdict

> Who writes which knowledge section: `qa-system/core/QA_STANDARD.md` §8. Identifiers stay unchanged: §9.1.

## 1. Put the answers into knowledge

The answers belong to **humans**. The agent only copies **verbatim** what the user provides:

- [ ] §7 of `knowledge/features/<slug>.md`: on the right `MR-xx` row, fill in `Phản hồi chính thức`, `Người trả lời`, `Ngày`
      (official response, answered by, date), and change `Trạng thái` (status) → `Confirmed` / `Rejected` / `TREO`. Never delete old rows.
- [ ] A business decision not tied to an MR → §8, **must** have an approver + date (QA_STANDARD §9.5).
- [ ] A project-wide convention → tell the user to edit `knowledge/_project.md`.
- [ ] `npm run knowledge:sync -- <slug> --write` (collects answers still stuck in `OUTPUT/`), then `npm run gate <slug>`.

Do not add `BR-xx` to §3 yourself: skill `01` on its next run turns confirmed MRs into BRs (source `knowledge §8 #n` / §7).

## 2. Where to re-run from

| Change | Re-run from |
|---|---|
| The BA answers an MR / adds a §8 decision / `_project.md` changes | `01` (so confirmed MRs become BRs and risks are recomputed) |
| Documents in `INPUT/<slug>/` changed | intake, then `01` |
| A `FIX` verdict at one step | That exact step |

Every step **after** the starting step is re-run. The `ask` gate still applies before `03`.

## 3. Command block

```
Before running: copy OUTPUT/<slug>/ to OUTPUT/<slug>.bak/ (never delete old files before copying).
Run from the chosen step to the end of branch A; tick 00_plan.md after each step and print the verdict.
Existing IDs stay unchanged; new IDs come from `npm run ids -- <slug>`.
Stop and report if: a Confirmed/Rejected MR is asked again · a §8 decision is tagged [GIẢ ĐỊNH] again ·
a value already declared in knowledge is tagged [CONTEXT_MISSING]. Those are signs the agent did not read knowledge.
```

## 4. Compare run 1 and run 2

| Criterion | Passes when |
|---|---|
| `New`/`TREO` MRs in `02` | Only unanswered questions remain; no confirmed question is asked again |
| Verdict of `02` | `PASS` when every MR is `Confirmed`/`Rejected` |
| Old `BR`/`MR`/`TI`/TC codes | Numbers unchanged; every difference must be explained by the new answers |
| `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` cells | For every confirmed MR, the cell now holds a value quoted from knowledge |

The number of test cases is **not** a criterion (QA_STANDARD §2 — no quotas).
