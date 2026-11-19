# Graduation exam `shopgo-refund-v1` — student instructions

## 1. Goal

Show that you can **operate, extend and govern** the QA Agent framework in this repository:

| Task | What you do | Brief |
|---|---|---|
| **T1** | Customise an existing agent folder (`qa-test-design`, skill `test-case-generation`) | [T1.md](T1.md) |
| **T2** | Create a new agent folder that audits requirement → test traceability | [T2.md](T2.md) |
| **T3** | Run stages 01 → 06 of the pipeline on the exam feature `shopgo-refund` | [T3.md](T3.md) |

The exam feature is a **refund request** feature for the ShopGo web shop. Its sources are in
`INPUT/shopgo-refund/`. The live ShopGo site (`knowledge/_sut.json`) does **not** contain this feature:
the exam stops at stage 06 and does not include automation.

Grading: [RUBRIC.md](RUBRIC.md) · Self-check: [SELF-CHECK.md](SELF-CHECK.md) · Appeals: [APPEALS.md](APPEALS.md).

## 2. Timeline

| Item | Value |
|---|---|
| Deadline | **2026-12-15 23:59** (time zone `Asia/Ho_Chi_Minh`, UTC+07:00) |
| Pushes before the deadline | Unlimited |
| At the deadline | The instructor records one frozen commit (SHA) of your branch. Only that commit is graded. Pushes after the deadline are ignored unless the instructor approves them in writing |
| Live defense | Scheduled by the instructor after the deadline |

## 3. Branch rules

- You work **only** on your own branch `exams/<student-id>`. The instructor creates it for you from the exam
  starter; your `<student-id>` is given to you by the instructor.
- **Never** push to `exams/shopgo-refund-v1`, `develop`, `main`, or another student's branch. Never
  force-push, rename or delete any branch that is not yours.
- The repository is **public** and every branch is visible to everyone. Do **not** read, copy or adapt
  another student's work. Similarity between submissions is detected and reviewed by the instructor, and
  you must be able to explain every line of your work in the live defense.
- Do **not** change the read-only paths: `INPUT/shopgo-refund/**`, `EXAM/brief/**`, `EXAM/schema/**`,
  `EXAM/selfcheck/**`. Changing them makes the submission invalid.
- Your work is never merged anywhere. It stays on your branch.

## 4. How to start

Ask your AI agent to run these for you (see §8), or run them yourself:

```bash
git fetch origin && git switch exams/<student-id>
npm install
```

Then:

1. Read this file, [T1.md](T1.md), [T2.md](T2.md), [T3.md](T3.md) and [RUBRIC.md](RUBRIC.md).
2. Read `AGENTS.md`, `qa-system/core/QA_STANDARD.md`, `qa-system/workflows/WORKFLOW.md` and
   `qa-system/qa-lead/skills/system-upgrade-governance.md`.
3. Copy the three templates into place and fill them in as you go:
   `EXAM/templates/submission.json` → `EXAM/submission.json`,
   `EXAM/templates/DECISIONS.md` → `EXAM/DECISIONS.md`,
   `EXAM/templates/AI_USE.md` → `EXAM/AI_USE.md`.
   A filled example for a fictional student is in `EXAM/examples/submission.example.json`.

## 5. Deliverables (exact paths)

Exam constants: `exam_id = shopgo-refund-v1`, `task_slug = shopgo-refund`.

| Item | Path |
|---|---|
| Inputs (read-only) | `INPUT/shopgo-refund/{01_business,02_ba,03_dev,04_design,05_communication}/` |
| Feature knowledge | `knowledge/features/shopgo-refund.md` |
| Plan | `OUTPUT/shopgo-refund/00_plan.md` |
| Stage 01–06 | `OUTPUT/shopgo-refund/01_requirement_risk_summary.md`, `02_missing_rule_report.md`, `03_viewpoint_report.md`, `04_test_idea_report.md`, `05_test_case_spec.md` (+ optional `05_test_blueprint.json`, `testcases/batch_NN.md`), `06_coverage_review.md` |
| Gate record (informational, not trusted) | `OUTPUT/shopgo-refund/_gate.log` |
| T1 agent | existing `qa-system/qa-<agent>/` |
| T2 agent | `qa-system/qa-<new-agent>/AGENT.md` + `skills/<skill>.md` |
| T2 example output | `OUTPUT/shopgo-refund/<NN>_<name>.md` (`NN` = next unused per governance §3) |
| Exam files (student) | `EXAM/submission.json`, `EXAM/DECISIONS.md`, `EXAM/AI_USE.md` |
| Exam files (read-only) | `EXAM/brief/**`, `EXAM/schema/**`, `EXAM/selfcheck/**` |

File names are checked exactly. A stage file with another name (for example `01_risk.md`) counts as
missing. If you did not produce an artifact, declare it `null` in `EXAM/submission.json` instead of
pointing to a file that does not exist.

## 6. Self-check

```bash
npm run exam:check
```

It validates your manifest and the public, mechanical parts of the rubric, and tells you how to fix each
problem. It **never shows a score**. Details: [SELF-CHECK.md](SELF-CHECK.md). Run it before every push.

## 7. How to submit

Commit your work on your branch and push it before the deadline:

```bash
git push origin exams/<student-id>
```

You may push as often as you like before the deadline. The last commit on your branch at the deadline is
the one that is frozen and graded. There is no other submission step: no pull request, no upload.

## 8. AI usage policy

- AI assistants **are allowed**, including the AI agent this framework is built for.
- You **must declare** every AI tool you used in `EXAM/AI_USE.md`: which tool, what you used it for, and
  what you checked yourself.
- No AI-content detector is used for grading. Understanding is assessed through your reasoning in
  `EXAM/DECISIONS.md`, your artifacts, and a **live defense** in which you explain your decisions, trace
  a test case back to its source quote, and make a small live change.

## 9. Zero-CLI

The framework follows a Zero-CLI rule (`AGENTS.md` §7): you describe what you want in plain language and
your AI agent runs the commands (`npm run gate`, `npm run lint`, `npm run agent:check`,
`npm run exam:check`, `git push` …) and shows you the real output. You stay responsible for what is
committed: read the output, check it, and only then push.
