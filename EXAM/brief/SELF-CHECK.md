# Self-check — `npm run exam:check`

## How to run

From the repository root, on your branch `exams/<student-id>` (or ask your AI agent to run it):

```bash
npm run exam:check
```

Run it before every push. It is local, read-only and deterministic: the same tree always gives the same
output. It does not contact the network and does not read any hidden data.

## What it checks

| Group | Checks |
|---|---|
| Manifest | `EXAM/submission.json` exists, is UTF-8 JSON and is valid against `EXAM/schema/submission.schema.json` |
| Blocking errors (B-01 … B-05) | B-01 manifest missing / unreadable / schema-invalid · B-02 `exam_id`, `student_id`, `branch` do not match the exam and your branch · B-03 a declared path is absolute, contains `..`, leaves the workspace or is a symlink · B-04 your branch does not descend from the exam starter, or `starter_commit` is not the starter commit · B-05 a read-only path was changed (`INPUT/shopgo-refund/**`, `EXAM/brief/**`, `EXAM/schema/**`, `EXAM/selfcheck/**`) or the tree is too large |
| Gradable gaps (G-01 … G-08) | G-01 stage artifact declared `null` or missing · G-02 wrong file name for a stage · G-03 T1 incomplete (anchor `done` without a matching change, `n/a` without reason) · G-04 T2 incomplete (skill, example output or registrations missing) · G-05 tools changed without new tests · G-06 `EXAM/DECISIONS.md` or `EXAM/AI_USE.md` missing · G-07 stage 05 spec and batches inconsistent · G-08 feature knowledge file missing |
| Public parts of the rubric | A1a `agent:check` INTACT · A3a–d T2 structure, `Human-Final` / `Knowledge`, five registrations, `--impact` edge · A4a stage files present with official names · A4b lint · A5a–d verbatim quotes, trace to existing ids, numeric provenance, no `[DOMAIN]` source |

A **blocking** error (B-xx) would make the submission `INVALID_SUBMISSION`: automated grading would not
run. A **gradable** gap (G-xx) lets grading continue, with partial or zero points on the affected checks.

## Output

- One line per check: `PASS` or `FAIL`, the file concerned, and a fix hint.
- A JSON report in `.scratch/exam-check.json`. That folder is git-ignored and is never graded.

## What it does not do

- It **never computes or shows a score**.
- It does not run the hidden benchmark, the ambiguous-rule check, the hidden fixtures or the instructor
  tests.
- It does not repair, create or rename any of your files.

A clean self-check means your submission is **well-formed and gradable**. It does not mean a pass.
