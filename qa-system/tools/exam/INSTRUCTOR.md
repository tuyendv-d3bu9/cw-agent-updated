# Graduation exam — instructor guide

Exam: `shopgo-refund-v1` · Spec: `docs/plans/graduation-project.md` · Student brief: `EXAM/brief/` on `exams/shopgo-refund-v1`.

Scores: 70 automated (A1–A6) + 30 instructor (I1–I3). Pass = total ≥ 60 **and** pipeline minimum **and** I3 ≥ 4.
`GRADING/results/<student-id>.json` is the only source of truth; HTML and `summary.csv` are generated from it.
`null` means "not assessed yet" — it is never shown or counted as 0.

## 1. One-time setup

1. **Private folder** (never inside a repository): `~/cw-grader-private/shopgo-refund-v1/`
   (`exam.json`, `roster.json`, `benchmark/`, `instructor-tests/`, `reference/`). Use another location with
   `export GRADER_PRIVATE=/path/to/private`. Read its `ACCESS.md` and `BACKUP.md`.
2. **Roster** — edit `roster.json`: `{"exam_id":"shopgo-refund-v1","students":[{"student_id":"nguyen-van-a","display_name":"Nguyen Van A"}]}`.
   Student ids: lowercase kebab-case; the branch is `exams/<student-id>`.
3. **Docker** must be running (`docker info`). Student code runs only in `node:24-alpine` with no network,
   no credentials and no access to your home folder or the private folder. Without Docker the affected checks
   become `PENDING_HUMAN_REVIEW` (null), never 0. Colima users: workspaces live in `~/.cache/cw-exam-grading`
   (override with `GRADING_TMP`).
4. **Hidden instructor tests** (regenerate if needed): `node qa-system/tools/exam/make-instructor-tests.js --exam shopgo-refund-v1`.

## 2. Create each student's branch (before the exam starts)

```bash
git fetch origin --tags
git push origin exam/shopgo-refund-v1/starter^{commit}:refs/heads/exams/nguyen-van-a
```

Students then run `git fetch origin && git switch exams/nguyen-van-a`, work, run `npm run exam:check`, and
`git push origin exams/nguyen-van-a` (unlimited pushes until the deadline, 2026-12-15 Asia/Ho_Chi_Minh).

## 3. Dedicated grading clone (once)

Use a **separate clone** only for grading — never your working clone.

```bash
git clone https://github.com/tuyendv-d3bu9/cw-agent-updated.git cw-grading
cd cw-grading
git switch exams/shopgo-refund-v1          # check out the exam first: the grader needs its package.json
npm install
npm run exam:grading-setup -- --exam shopgo-refund-v1
```

`exam:grading-setup` sets `remote.origin.pushurl = DISABLED`, installs a `pre-push` hook that rejects
`grading/*`, and creates the local branch `grading/shopgo-refund-v1` from the starter tag. `exam:grade` refuses
to run if push is enabled or a `grading/*` branch exists on the remote. **Never push from this clone.**

## 4. Grade

```bash
npm run exam:grade -- --exam shopgo-refund-v1 --student nguyen-van-a    # one student
npm run exam:grade -- --exam shopgo-refund-v1 --all                    # whole class (roster)
```

It fetches `exams/*`, records each SHA in `GRADING/freeze.json` (after the deadline the frozen SHA is reused;
later pushes are ignored), saves a `git bundle` to the private folder, exports with `git archive`, runs preflight,
then the automated rubric with the starter's trusted tools. Add `--no-fetch` to grade what you already fetched.

Post-deadline exception: add an entry to `GRADING/overrides.json`
(`student_id`, `old_sha`, `new_sha`, `approver`, `reason`, `timestamp`) and re-grade that student.

## 5. Instructor scores (I1–I3)

```bash
npm run exam:score -- --exam shopgo-refund-v1 --student nguyen-van-a \
  --criterion I1 --points 8 --level "6-8" \
  --evidence OUTPUT/shopgo-refund/01_requirement_risk_summary.md \
  --comment "Risks prioritised; two lack a stated basis" --reviewer instructor-1
```

Levels: I1/I2 `0-2`, `3-5`, `6-8`, `9-10`; I3 `<points>/10`. A score outside its level is rejected.
Re-running the command updates the score. Close an integrity flag after review with `--resolve-flag <flag-id>`.
Re-grading a student keeps the instructor scores.

## 6. Reports

```bash
npm run exam:report -- --exam shopgo-refund-v1                       # recompute all results, HTML and CSV
npm run exam:report -- --exam shopgo-refund-v1 --student nguyen-van-a
```

| Output | Path (in the grading clone) |
|---|---|
| Result (source of truth) | `GRADING/results/<student-id>.json` |
| Student-facing report | `GRADING/results/<student-id>.html` (no hidden answers or benchmark details) |
| Class summary | `GRADING/summary.csv` |
| Evidence per check | `GRADING/evidence/<student-id>/<sha>/` |
| Your scores | `GRADING/instructor/<student-id>.json` |
| Deadline freeze / overrides | `GRADING/freeze.json`, `GRADING/overrides.json` |

Statuses: `NO_SUBMISSION`, `INVALID_SUBMISSION`, `PENDING`, `NEEDS_HUMAN_REVIEW`, `PASS`, `FAIL`.
For an audit trail, commit `GRADING/` on the local grading branch (`git add -f GRADING && git commit`).

## 7. Appeals and backup

Appeals within 5 working days (`EXAM/brief/APPEALS.md`): re-run `exam:grade` for that student (same frozen SHA,
same grader ⇒ same automated result), record the decision in `GRADING/appeals/<student-id>.md`, regenerate with
`exam:report`. Instructor-criteria appeals go to a second independent reviewer when available.
Back up the private folder and `GRADING/` after every grading run.
