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

> **This is an open-book, AI-assisted practical assessment.** You may read all repository documentation,
> study previous examples and published solutions (including the refund material and BA answers used in
> `docs/skill-lab/`), and use AI tools. What is assessed is whether you can **apply** the framework: valid,
> traceable artifacts built from this exam's `INPUT/shopgo-refund/`, and your own explanation of every
> decision in the live defense. See §8.

## 2. Timeline

| Item | Value |
|---|---|
| Deadline | **2026-12-15 23:59** (time zone `Asia/Ho_Chi_Minh`, UTC+07:00) |
| Pushes before the deadline | Unlimited |
| At the deadline | The instructor records one frozen commit (SHA) of your branch. Only that commit is graded. Pushes after the deadline are ignored unless the instructor approves them in writing |
| Live defense | Scheduled by the instructor after the deadline |

## 3. Branch rules

- You work **only** on your own branch `exams/<student-id>`, created from the frozen starter tag
  `exam/shopgo-refund-v1/starter` (§4). Your `<student-id>` is given to you by the instructor.
- **Never** push to `exams/shopgo-refund-v1`, `develop`, `main`, or another student's branch. Never
  force-push, rename or delete any branch that is not yours.
- The repository is **public** and every branch is visible to everyone. Submitting another student's work
  as your own is not allowed. Near-identical submissions are reviewed by the instructor (not penalised
  automatically), and you must be able to explain every line of your work in the live defense.
- Do **not** change the read-only paths: `INPUT/shopgo-refund/**`, `EXAM/brief/**`, `EXAM/schema/**`,
  `EXAM/selfcheck/**`. Changing them makes the submission invalid.
- Your work is never merged anywhere. It stays on your branch.

## 4. How to start

Ask your AI agent to run these for you (see §8), or run them yourself:

```bash
git clone https://github.com/tuyendv-d3bu9/cw-agent-updated.git && cd cw-agent-updated
git fetch origin --tags
# if the instructor already created your branch:
git switch exams/<student-id>
# otherwise create it from the frozen starter and publish it once:
git switch -c exams/<student-id> exam/shopgo-refund-v1/starter && git push -u origin exams/<student-id>
npm install
```

Your branch must start from the starter tag — the self-check and the grader verify it.

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

## 8. Open-book and AI usage policy

- **Open book.** You may read anything in the repository, previous examples and published solutions,
  including the refund scenario and BA answers in `docs/skill-lab/` and other branches. Using them as
  learning material is not cheating.
- **One source of truth for this exam.** Business rules (`BR`/`FD`/`AF`) and every value in your artifacts
  must come from `INPUT/shopgo-refund/` (QA_STANDARD §10). An answer that exists only in other material —
  for example a published BA answer that is not in this exam's INPUT — is **not** a source here: raise it
  as a question (`OQ`/`MR`) and, if you continue, record a proceed decision (T3 §2). Writing such a value
  into a business rule counts as an invented value (A5).
- **Copying earns nothing by itself.** Points come only from artifacts that pass the checks: quotes that
  exist verbatim in this exam's INPUT, ids that trace, a clean lint, a closed gate. A copied reference
  output that does not trace to this INPUT scores accordingly.
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
