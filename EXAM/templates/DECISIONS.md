# Decisions — `shopgo-refund-v1` · `<student-id>`

> Copy this file to `EXAM/DECISIONS.md` and replace every `<…>`. Paste **real** command output
> (shortened), never a prediction. Keep the three section headings exactly as they are: the manifest
> points to `EXAM/DECISIONS.md#t1`, `#t2` and `#t3`.

## t1

### Decision table (governance §1, tree A/B/C)

| Item | Content |
|---|---|
| Original request | <the T1 requirement in one or two sentences> |
| Expertise area | <…> |
| Candidate agent | <closest agent, or `NONE`> |
| Question (1) | <True/False — one-line reason> |
| Question (2) | <True/False — one-line reason> |
| Question (3) | <True/False — one-line reason> |
| **Conclusion** | **<[A] / [B] / [C]>** |
| Final reason | <1–2 sentences> |

### Layer placement (governance §2)

| Content | Layer | Reason |
|---|---|---|
| <…> | <AGENT.md / skills/ / QA_STANDARD.md / knowledge/ / tools> | <…> |

### Anchors N1–N7 (governance §4)

| # | Anchor | `done` / `n/a` | File(s) changed | Change, or reason for `n/a` |
|---|---|---|---|---|
| N1 | `skills/<skill>.md` | <…> | <…> | <…> |
| N2 | `AGENT.md` | <…> | <…> | <…> |
| N3 | `WORKFLOW.md` | <…> | <…> | <…> |
| N4 | `_system_map.json` | <…> | <…> | <…> |
| N5 | `qa-lead/AGENT.md` | <…> | <…> | <…> |
| N6 | `agent-doctor.js` | <…> | <…> | <…> |
| N7 | `lint-deliverables.js` / `schema.js` + tests | <…> | <…> | <…> |

### Acceptance gate (real results)

| # | Check | Command | Real result |
|---|---|---|---|
| G1 | Structure | `npm run agent:check` | <…> |
| G2 | Impact | `npm run agent:check -- --impact <agent>` | <…> |
| G3b | Tool tests | `npm test` | <…> |
| G4 | Old flow smoke | <stage re-run> | <…> |
| — | Lint accepts valid / rejects invalid `Risk Ref` | `npm run lint -- <slug>` | <…> |

### Remaining risks

- <…>

## t2

### Decision table (governance §1, tree A/B/C)

| Item | Content |
|---|---|
| Original request | <the T2 requirement in one or two sentences> |
| Expertise area | <…> |
| Candidate agent | <closest agent, or `NONE`> |
| Question (1) | <True/False — one-line reason> |
| Question (2) | <True/False — one-line reason> |
| Question (3) | <True/False — one-line reason> |
| **Conclusion** | **<[A] / [B] / [C]>** |
| Final reason | <1–2 sentences> |

### Layer placement (governance §2)

| Content | Layer | Reason |
|---|---|---|
| <…> | <…> | <…> |

### Anchors N1–N7 and `[B]` items (governance §4)

| # | Anchor / item | `done` / `n/a` | File(s) changed | Change, or reason for `n/a` |
|---|---|---|---|---|
| N1 | `skills/<skill>.md` | <…> | <…> | <…> |
| N2 | `AGENT.md` | <…> | <…> | <…> |
| N3 | `WORKFLOW.md` | <…> | <…> | <…> |
| N4 | `_system_map.json` (`specialized_agents` + `routing_table`) | <…> | <…> | <…> |
| N5 | `qa-lead/AGENT.md` (§2 matrix + §5 mapping) | <…> | <…> | <…> |
| N6 | `agent-doctor.js` | <…> | <…> | <…> |
| N7 | `lint-deliverables.js` / `schema.js` | <…> | <…> | <…> |
| B-a | Agent folder + `skills/` | <…> | <…> | <…> |
| B-b | `AGENT.md` from template, no placeholders | <…> | <…> | <…> |
| B-c | `Human-Final` section | <…> | <…> | <…> |
| B-d | `Knowledge` section | <…> | <…> | <…> |
| B-e | `qa-system/README.md` | <…> | <…> | <…> |
| B-f | `WORKFLOW.md` §1 (new branch only) | <…> | <…> | <…> |

### Deliverable prefix (governance §3)

| Prefixes in use (`WORKFLOW.md` §2) | Assigned | Output file |
|---|---|---|
| <…> | `17` | `OUTPUT/shopgo-refund/17_<snake_name>.md` |

### Acceptance gate (real results)

| # | Check | Command | Real result |
|---|---|---|---|
| G1 | Structure | `npm run agent:check` | <…> |
| G2 | Impact | `npm run agent:check -- --impact <agent>` | <…> |
| G3 | Map sync | `npm run map:sync` | <…> |
| G3b | Tool tests | `npm test` | <…> |
| G4 | Old flow smoke | <stage re-run> | <…> |
| G5 | Skill acceptance §5.1 a–e (incl. two runs + `npm run diff-runs`) | <…> | <…> |

### Remaining risks

- <…>

## t3

### Source conflicts and how they were resolved (QA_STANDARD §10.2)

| Topic | Sources in conflict | Decision | Basis (file + section) |
|---|---|---|---|
| <…> | <…> | <…> | <…> |

### Questions raised (the INPUT cannot answer them)

| ID | Question | Why the INPUT does not settle it (file + section) | What I did not assume |
|---|---|---|---|
| <OQ-xx / MR-xx> | <…> | <…> | <…> |

### Highest risks and how they are covered

| RK | Risk level | Viewpoint / test idea / test cases |
|---|---|---|
| <RK-xx> | <…> | <…> |

### Real results

| Check | Command | Real result |
|---|---|---|
| ASK gate | `npm run gate shopgo-refund` | <…> |
| Lint | `npm run lint -- shopgo-refund` | <…> |
| Self-check | `npm run exam:check` | <…> |
