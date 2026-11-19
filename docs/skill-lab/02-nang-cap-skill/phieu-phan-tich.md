# Analysis sheet — Exercise 2: upgrade the missing-rule-06w skill

Learner: `<name>` · Branch: `lab/<name>` · Date: `<YYYY-MM-DD>`

> Fill in order. If a cell cannot be answered yet, write the reason — do not leave it blank. The sheet is handed to the instructor, not committed.

## 1. Decision tree A / B / C

| Question | True / False | Reason (one line, name the file you checked) |
|---|---|---|
| (1) Does it only change the behavior of an existing skill? | | |
| (2) Is there already an agent that owns exactly this area? Which agent? | | (skip if question 1 is True) |
| (3) Would giving it to that agent exceed one role? (reads another file type · writes elsewhere · needs "and also…") | | |
| **Conclusion** | **[A] / [B] / [C]** into agent `qa-…` | |

Result of `npm run agent:check -- --impact <agent>` (paste):

```
```

## 2. Layer placement

| Content | Layer (QA_STANDARD / knowledge / skill / AGENT.md) | Reason |
|---|---|---|
| The signal table "seeing which sign means which W cell to examine" | | |
| The definition of the 6 dimensions W1–W6 and the applicability table | | |
| The rule for placing an MR id when one gap touches several cells | | |
| Questions about COD, other people's orders… of the refund feature | | |

## 3. Changes in the skill

- File: `qa-system/qa-analyst/skills/missing-rule-06w.md` — which section was added / edited: …
- Signal table (paste the final version):
- MR placement rule:
- Does the matrix table format change? (Yes ⇒ N7 is mandatory)

## 4. Seven anchor points

| # | Anchor point | File | What was changed | Status (DONE / NOT APPLICABLE + reason) |
|---|---|---|---|---|
| N1 | skill | | | |
| N2 | the agent's AGENT.md | | | |
| N3 | WORKFLOW.md | | | |
| N4 | _system_map.json | | | |
| N5 | qa-lead/AGENT.md (§2 + §5) | | | |
| N6 | agent-doctor.js | | | |
| N7 | lint / schema + test | | | |

## 5. Acceptance (paste the real results)

| Check | Result |
|---|---|
| `npm test` | |
| `npm run agent:check` | |
| `npm run lint -- lab-06w-a` / `lab-06w-b` | |
| Round 1 (before) — `diff-runs`: 06W cells with a gap (`ô 06W có kẽ hở`) · 06W cell verdicts (`phán quyết ô 06W`) | |
| Round 2 (after) — `diff-runs`: 06W cells with a gap · 06W cell verdicts | |
| Are the 5 questions from annotations present in both runs? | |
| Are the 4 previously missed topics present in both "after" runs? | |
| Explanation of each remaining difference | |

## 6. Commits

| Commit | Contains | Goes to develop? |
|---|---|---|
| | | |
