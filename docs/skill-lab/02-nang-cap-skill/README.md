# Exercise 2 — Upgrade the `missing-rule-06w` skill: two runs must ask the same set of questions

## Which skill, what upgrade

- **Skill:** `qa-system/qa-analyst/skills/missing-rule-06w.md` (Stage 02: scan the 06W matrix, generate MR questions for the BA).
- **Upgrade type:** `[C]` — edit in place, no new agent, no new deliverable.
- **Problem:** running twice on the same refund documents, the questions anchored in the source (comments, hidden text, "being updated")
  overlap 100%, but the **gap positions in the matrix overlap only 34%**, and the second run **misses 4 real questions**.
  Details: [`bang-chung-do-lech.md`](bang-chung-do-lech.md) (the "evidence of divergence").
- **Cause:** the skill only says "score each cell with exactly one result" but does not say *when* a W cell must be examined closely.
  The model decides on its own ⇒ differently each time.

## Upgrade goal

Add a **fixed signal table** to the skill: seeing which sign in `BR/FD/AF` makes which W cell **mandatory** to examine
and into which cell the question goes. Example shape of the signals (learners complete it themselves, do not copy verbatim):

| Sign in the object | Cell that must be examined | Gap often missed |
|---|---|---|
| Mentions "one's own", a role, an approver | W5 | What if someone else / another role does it |
| Has a money / quantity cap or threshold | W3 | What that figure includes and excludes |
| Has a deadline, date/time | W4 | The starting point, cut-off time, time zone |
| Has states, state transitions | W2 | The action while in another state / both sides acting at once |
| Excluded from scope but still passes through the main flow | W2 | Does the system block or hide it, and what response |

Plus a **placement rule**: a gap that touches several cells ⇒ put the MR id in the first cell in the order W1→W6 of the object
with the smallest id; the remaining cells carry the same id.

## Constraints (this is the part learners most often get wrong)

1. The signal table is **used only by skill 02** ⇒ put it in the skill, **do not** edit `QA_STANDARD.md` §4.
   If you think §4 (the definition of 06W) must change ⇒ stop and ask the instructor — that is a human decision (Human-Final).
2. The signal table uses neutral words (`<role>`, `<threshold>`), **never** "COD", "500.000", "refund".
3. Do not add a target number of questions. A signal only decides which cell must be examined; the result of examining may be `Nguồn: …` (source: …), it need not produce an MR.
4. The fixed `Không áp dụng` (not applicable) cells of the scaffold (QA_STANDARD §4) must not be changed.
5. Changing the matrix table format ⇒ you must edit `lint-deliverables.js` + tests (N7). If the format does not change, N7 = NOT APPLICABLE.

## How to measure before / after

Use **the same fixed 01** (`du-lieu/01_requirement_risk_summary.md`) for every run, so only the divergence caused by skill 02 is measured.

```bash
# Build two identical tasks
for s in lab-06w-a lab-06w-b; do
  npm run intake -- docs/skill-lab/de-bai --slug $s --force
  sed "s/^# Requirement & Risk Summary · hoan-tien$/# Requirement \& Risk Summary · $s/" \
    docs/skill-lab/02-nang-cap-skill/du-lieu/01_requirement_risk_summary.md > OUTPUT/$s/01_requirement_risk_summary.md
done
```

Then **one fresh AI session per task**:

```text
Run Stage 02 (missing-rule-06w) for the task <lab-06w-a | lab-06w-b>. Use npm run scaffold, npm run ids --assign,
lint until 0 errors, knowledge:sync --write, paste the result of npm run gate. Do not read the OUTPUT of the other task.
```

Compare:

```bash
npm run diff-runs -- OUTPUT/lab-06w-a OUTPUT/lab-06w-b
```

Do **two rounds**: round 1 with the current skill (the "before" numbers), round 2 after the upgrade (the "after" numbers) — before round 2, delete
`OUTPUT/lab-06w-*/02_*`, `_gate.*` and the §7 rows in `knowledge/features/lab-06w-*.md`, or build two new slugs.

## Upgrade assignment sentence

```text
QA Leader, upgrade the missing-rule-06w skill: add a signal table that makes examining certain W cells mandatory and a rule for placing MR ids,
so two runs on the same documents give the same set of questions. Evidence: docs/skill-lab/02-nang-cap-skill/bang-chung-do-lech.md.
Follow system-upgrade-governance: ANALYSIS (PHAN_TICH) first (A/B/C, layer placement — must QA_STANDARD change?, 7 anchor points),
stop for me to approve. Examples in the skill must be neutral, with no words from the refund feature.
```

## Pass criteria

- [ ] The analysis sheet concludes `[C]` and places layers correctly (the signal table lives in the skill, QA_STANDARD unchanged).
- [ ] `npm test` green · `npm run agent:check` INTACT · `npm run lint` 0 errors on both tasks.
- [ ] The "after" numbers of `ô 06W có kẽ hở` (06W cells with a gap) and `phán quyết ô 06W` (06W cell verdicts) are **higher** than the "before" numbers.
- [ ] The 5 questions generated from comment / tracked change / hidden row / "being updated" / open item **are still present** in both runs.
- [ ] The 4 previously missed topics (see the evidence) appear in **both** "after" runs.
- [ ] Each remaining difference can be explained by a sentence in the skill.

## Advanced exercise (if time remains)

**Skill `test-case-generation` + lint: block invented error codes.** Lint currently catches text in quotation marks and numbers with units,
but `Mã lỗi E-REFUND-429` (Error code E-REFUND-429) in Expected still slips through. A `[C]` upgrade with **N7**: add a rule to
`qa-system/tools/lib/provenance.js` (an uppercase-style code / HTTP code in Expected must exist in AF or knowledge),
with a red-then-green test in `qa-system/tools/__tests__/provenance.test.js`. Acceptance: the sample invented test case
in [`bang-chung-do-lech.md`](bang-chung-do-lech.md) is blocked with 5 errors instead of 4, and the 51 test cases of the `lab-cr` task (Exercise 1) are still clean.
