# Analysis sheet — Exercise 1: create a new skill

Learner: `<name>` · Branch: `lab/<name>` · Date: `<YYYY-MM-DD>`

> Fill in order. If a cell cannot be answered yet, write the reason — do not leave it blank. The sheet is handed to the instructor, not committed.

## 1. Decision tree A / B / C

| Question | True / False | Reason (one line, name the file you checked) |
|---|---|---|
| (1) Does it only change the behavior of an existing skill? | | |
| (2) Is there already an agent that owns exactly this area? Which agent? | | |
| (3) Would giving it to that agent exceed one role? (reads another file type · writes elsewhere · needs "and also…") | | |
| **Conclusion** | **[A] / [B] / [C]** into agent `qa-…` | |

Result of `npm run agent:check -- --impact <agent>` (paste):

```
```

## 2. Layer placement

| Content | Layer (QA_STANDARD / knowledge / skill / AGENT.md) | Reason |
|---|---|---|
| The rule "a newer, approved CR wins over the spec" | | |
| The new threshold value of a feature | | |
| How to trace CR → BR/FD/AF → TC and the result table format | | |
| What extra work this agent now does, and who it hands back to | | |

## 3. Skill

- File name: `qa-system/qa-…/skills/<ten-skill>.md`
- Deliverable sequence number: `__` (look in table §2 of `qa-system/workflows/WORKFLOW.md`; take the next number after the largest)
- Inputs: …
- The "MUST NOT" section: …

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
| `npm run map:sync` | |
| `npm run workflow -- validate` | |
| Routing: does the sentence *"The BA just sent a CR, which test cases are affected?"* call the right skill? | |
| Run 1 — list of affected TCs | |
| Run 2 — list of affected TCs | |
| `npm run diff-runs` + explanation of each difference | |

## 6. Commits

| Commit | Contains | Goes to develop? |
|---|---|---|
| | | |
