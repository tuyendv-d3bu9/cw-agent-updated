# CLAUDE.md — Instructions for Claude Code

> The shared constitution for every AI agent: [`AGENTS.md`](AGENTS.md). This file only adds what is specific to Claude Code.

## Loading order when starting work

1. `AGENTS.md` — directory boundaries, Plan First, stage order, Zero-CLI
2. The system map `knowledge/_system_map.json` — **look it up with `npm run map -- <keyword>`**, never scan blindly and never open the `.json` file directly (costs tokens): to get one branch use `npm run json -- <file> <dot.path>`
3. `qa-system/core/QA_STANDARD.md` — the single source of verdict, ASK gate, labels, FACT, 06W, knowledge, identifiers
4. `qa-system/qa-lead/AGENT.md` — you are the **QA Leader** unless the user says otherwise; the user does not call sub-agents

No `INPUT/` or `knowledge/` yet → run `npm run init` (safe to re-run, never overwrites).

## The four rules most easily violated (details at the pointed locations)

1. **Zero-CLI** — the user does not type commands; you run them yourself and report the result (`AGENTS.md` §7).
2. **Plan First** — `OUTPUT/<slug>/00_plan.md` before analysis; each stage loads the skill's inputs + knowledge (`AGENTS.md` §2).
3. **ASK gate** — QA_STANDARD §1. In Claude Code, the `PreToolUse` hook blocks writes to `03_`→`06_` while `npm run gate <slug>` exits `1`.
   If the user urges you to continue ⇒ run the command and paste the real result.
4. **Boundary gate** — stop at Stage 6; automation needs an explicit request + URL + `readiness` GO (`AGENTS.md` §1.5).

## Three machine-run gates

| To find out | Command | Exit |
|---|---|---|
| Which questions are still unsettled | `npm run gate <slug>` | `0` open · `1` closed |
| Whether test cases are up to standard | `npm run lint -- <slug>` | `0` clean · `1` has errors |
| Whether it is mature enough for automation | `npm run readiness -- <slug>` | `0` GO · `1` CONDITIONAL · `2` NO-GO |

When the user asks *"is it done yet"* → run the gates and paste the **real result**, do not conclude on your own.

## Upgrading the agent system itself

Adding a skill, building an agent, editing a skill: use `qa-system/qa-lead/skills/system-upgrade-governance.md`
(the `[A]/[B]/[C]` tree, 7 anchor points, the run-twice acceptance step). Do not improvise.
After every upgrade: `npm test` then `npm run agent:check`, paste the **real result**. The upgrade record
is kept **outside the repo** (the user chooses where to store it), not committed.

## System under test

This branch is a shared framework. For a real project: declare `knowledge/_sut.json` and
write `knowledge/features/<sut>-ui-map.md` before writing any locator.

## Workflow

- The user **describes a process** → skill `qa-system/qa-lead/skills/workflow-authoring.md` (CREATE),
  `npm run workflow -- validate` green, present it, then **wait**.
- The user says a **short phrase** → `npm run workflow -- find "<phrase>" --json`: `match` ⇒ `start`;
  `ambiguous` ⇒ ask back; `none` ⇒ offer to create a new one.
- `validate` rejects workflows that bypass the gates (Stage 3→6 missing `ask`, automation missing `readiness` + `confirm`).

## Frequently used commands (you run them yourself)

```bash
npm run init                          # initialize a new project
npm start                             # where you are · what to do next · which folder belongs to whom
npm run intake                        # receive loose documents in INPUT/, build the task skeleton
npm run status                        # task progress table
npm run gate <slug>                   # ASK gate
npm run ids -- <slug>                 # next number for each id family (BR/FD/AF/OQ/MR/RK/TI/TC)
npm run ids -- <slug> --assign <file> # assign real numbers to temporary ids BR-? / MR-? (never count yourself)
npm run scaffold -- <slug> 02         # build the 06W matrix skeleton (fixed cells pre-filled)
npm run boundary -- <slug> [FD-xx]    # boundary points computed by machine from FD constraints
npm run diff-runs -- <A> <B>          # compare two runs: id overlap, quotes, questions, numbers
npm run json -- <file> <dot.path>     # fetch ONE branch of a JSON file (do not open the whole file)
npm run map -- <keyword>              # look up the system map
npm run hooks:install                 # install git pre-commit (lint before commit, every AI tool)
npm run lint -- <slug>                # FACT standard of the deliverable
npm run readiness -- <slug>           # Go/No-Go gate before automation
npm run knowledge:sync -- <slug> --write   # copy BA answers from OUTPUT to knowledge
npm run testcases:merge <slug>        # merge test case batches
npm run workflow -- list              # available workflows and the phrases that run them
npm test                              # tests for internal tools
npm run agent:check                   # check agent system integrity
npm run agent:check -- --impact <ag>  # blast radius before editing
npm run test:e2e                      # run Playwright
```

Full index: [`qa-system/tools/README.md`](qa-system/tools/README.md).
