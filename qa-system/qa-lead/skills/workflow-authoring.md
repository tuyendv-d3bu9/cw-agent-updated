---
name: workflow-authoring
description: >
  Turns a process described in words into a standard workflow file (with triggers, steps
  and gates), validated by machine; and when the user says a short phrase, finds the right workflow and runs it.
---

# Skill: workflow-authoring

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).
>
> **Skill = HOW.** Procedure + parameters + output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints
> (those are in `qa-system/core/QA_STANDARD.md`).

## Purpose
The user does not write files. They **describe** a process in words; this skill builds a standard workflow from it.
After that, **one short phrase** is enough to run the workflow. Two modes:

| Mode | The user says | Result |
|---|---|---|
| **CREATE** | *"Whenever the BA sends new documents I want to: analyse, ask the BA, and only then write test cases"* | File `qa-system/workflows/run-<name>.md`, `validate` green |
| **RUN** | *"The BA sent new documents"* | The workflow is found, a checklist is written into `00_plan.md`, each step is run |

## Tools (the agent runs them silently; the user does not type them)
```bash
npm run workflow -- list                       # which workflows exist
npm run workflow -- new run-<name>             # build a draft from the template
npm run workflow -- validate [run-<name>]      # validate, exit 1 on errors
npm run workflow -- find "<user phrase>"       # short phrase -> which workflow
npm run workflow -- show run-<name> --slug <slug>
npm run workflow -- start run-<name> --slug <slug>   # write the checklist into 00_plan.md
```

## Inputs (Đầu vào)
- CREATE mode: the user's description in words.
- RUN mode: the user's short phrase, and the `task-slug` (inferred from `OUTPUT/` if there is only one task).
- `knowledge/_system_map.json` — the list of agents and skills that really exist. **Never scan folders blindly.**
- Template: `qa-system/templates/workflows/workflow.md`.

> The description is too vague to build any step → ask back **at most 3 questions**, one point each
> (what is the desired output · is there any point where it must stop and wait for a human · does it touch automation).
> If there is enough to build, **build it right away**, state clearly what you assumed, and do not ask unnecessary questions.

## MUST NOT (specific to this skill)
- **NEVER invent** agents or skills. Use only those in `_system_map.json`; `validate` catches invented ones.
- **NEVER drop a gate.** Any step from Stage 3 onwards must have an `ask` gate before it. A `qa-automation` step must
  have `readiness` **and** `confirm` before it. If the user asks to drop one → explain and refuse (`AGENTS.md` §1.5, §1.6).
- **NEVER run it right after creating it.** Once created, only present it and wait for the user to say a trigger or confirm.
- **NEVER overwrite** an existing workflow. Same name or same trigger → rename it or ask the user.
- **NEVER use generic triggers** (e.g. "run it", "do testing"). Each trigger has at least 2 meaningful words, tied to a specific goal.
  Users may speak Vietnamese or English: give **both** a Vietnamese and an English phrasing of each trigger (both must stay unique).
- **NEVER guess when `find` returns `AMBIGUOUS`.** List the candidates and ask the user to choose one.
- **NEVER edit the body of a `format: legacy` runbook** when you were only asked to run it.

## Steps — CREATE mode
1. **Read the description** and pick out: the goal · the tasks in order · the points where it must stop and wait for a human.
2. **Match resources**: for each task, find the matching agent + skill in `_system_map.json`.
   A task with no skill yet → record it under "Not available yet" and tell the user; do **not** invent one.
3. **Choose a short name** `run-<keyword>`, then `npm run workflow -- list` to make sure it is not taken.
4. **Build the draft**: `npm run workflow -- new run-<name>`.
5. **Fill in the file**: `title`, `description`, `triggers` (2–4 phrases users will really say), `steps`.
   - Each step is `agent`+`skill` **or** `tool`. Use `output` to point at the result file.
   - Put each `gate` in the right place: `ask` before Stage 3 · `lint` before acceptance · `readiness` + `confirm` before automation.
   - **Always wrap text values in double quotes** — an unwrapped `:` breaks the whole file.
6. **Check**: `npm run workflow -- validate run-<name>`. Red → read the message, fix, check again. Never stop while it is still red.
7. **Present** the step table + triggers to the user (see Output format) and ask whether they want any changes.
8. **System acceptance**: `npm run agent:check` must be green (it checks every workflow).

## Steps — RUN mode
1. `npm run workflow -- find "<phrase>" --json` → read `status`.
   - `match` → go to step 2.
   - `ambiguous` → list the candidates, ask the user to choose.
   - `none` → say plainly that no workflow matches, and offer to create one from a description.
2. Determine the `task-slug`: if there is only one task in `OUTPUT/`, use it; if several, ask.
3. A `format: legacy` workflow → read the file and follow it; stop here.
4. `npm run workflow -- start <name> --slug <slug>` → checklist into `00_plan.md`.
5. **Do each step in order**. For each step:
   - Has a `gate` → run the gate command **first**. Exit other than `0` → **STOP**, paste the real result, do not continue.
   - `confirm` → ask the user for explicit confirmation; for automation it must come with the environment URL.
   - Run the skill, write the result file, tick `[x]` in `00_plan.md`.
6. Stop at any `ASK` / `FIX` per `QA_STANDARD` §1; never push past it yourself.

## Output format (CREATE mode)
```markdown
**Created workflow `run-<name>`** — <title>

| # | Task | Specialist / skill | Gate before the step | Output |
|---|---|---|---|---|
| 1 | … | qa-analyst / requirement-risk-summary | — | 01_… |

**Say this to run it**: "<trigger 1>" · "<trigger 2>"
**Assumed**: <the points the description left open that you chose>
**Not available yet**: <tasks with no skill yet, or "none">
**Validation**: <paste the real result of validate>
```

## Acceptance gates (Quality Gates)
- [ ] `npm run workflow -- validate run-<name>` exits `0`, with the real result pasted into the report.
- [ ] No `<...>` placeholder is left in the file.
- [ ] Every `agent`/`skill` is in `_system_map.json`; nothing invented.
- [ ] Steps from Stage 3 onwards have an `ask` gate before them; automation steps have `readiness` + `confirm` before them.
- [ ] At least 2 triggers, not shared with another workflow.
- [ ] `npm run agent:check` is still green.
- [ ] The newly created workflow has not been run automatically.
