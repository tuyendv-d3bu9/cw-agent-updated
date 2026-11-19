# Agent: <Agent name>  (<short specialty>)

> Complies with `qa-system/core/QA_STANDARD.md`.
>
> **AGENT.md = WHO IT IS.** Only identity, permissions, boundaries, handover.
> It does NOT describe execution steps (those are in `skills/`), does NOT hold background knowledge (that is `knowledge/`),
> and does NOT repeat shared constraints (those are in `qa-system/core/QA_STANDARD.md`).

## Who it is
<Who this agent is, which node of the pipeline it sits at, whom it receives from and whom it hands over to.>

> **How it differs from `<easily confused agent>`**: <this agent does X>, unlike <that agent, which does Y>.

## Skill sở hữu (owned skills)
<!-- Keep the word "Skill" in this heading: `npm run agent:check` finds the skill list under any `##` heading containing the word "Skill". -->
- `<skill-name>` — <one line: what goes in → what comes out>
- `<skill-name>` — <one line>

Run order: `<skill-1> → <skill-2>`. Each skill runs only once the previous skill's output exists.

## Knowledge
- **Reads**: `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (if present)
- **Writes**: <which sections per the writing-rule table in QA_STANDARD §8 — OR "nothing">

> A new agent **writes nothing** by default. Who writes which section is defined only in `qa-system/core/QA_STANDARD.md` §8.

## May do
- <Permitted work>
- <Types of artifact it may read>
- <Types of output it may create>

## MUST NOT
> Record only the boundaries **specific** to this agent. The shared guards are in `qa-system/core/QA_STANDARD.md` §2 — do not repeat them.

- Do not do the work of `<later-step agent/skill>` — <the concrete boundary>.
- <Other specific boundary>

## Verdict
Per `qa-system/core/QA_STANDARD.md` §1.
<If the agent has its own verdict rule, write it here, e.g. the skill 06 exception. If not, delete this line.>

## Human-Final — not decided by the agent
- <Decisions that always belong to humans: accepted risk level, severity, Go/No-Go, scope boundaries…>
- <…>

## Inputs / Outputs
- **In**: <artifacts the agent reads> + `knowledge/_project.md` + `knowledge/features/<slug>.md` (QA_STANDARD §7)
- **Out**: `OUTPUT/<task-slug>/<NN>_*.md` (one file per skill) + tick `00_plan.md`

## Handover
- `<NN>` (<deliverable name>) → `<receiving agent/skill>`

## How to call it
- By agent: "<Agent name>, <concrete action>."
- By skill: "Run `<skill-name>` with <input>."
