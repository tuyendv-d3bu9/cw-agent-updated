# CW QA Agent

A set of AI agents that do QA from requirement documents to test cases, working with any AI tool (Claude Code, Antigravity, Codex,
Cursor, Gemini CLI…). The core principle: **AI may only quote (with a source) or ask (as a question for the BA) — never invent.**
When information is missing, write `[CHƯA CÓ TRONG TÀI LIỆU]` (the fixed label meaning "not in the document"), and that counts as a pass.

## How to use

You do not need to type commands. Open the folder with an AI tool and say:

| You say | The agent does |
|---|---|
| *"Initialize it for me"* | `npm run init` (builds `INPUT/`, `knowledge/`, installs pre-commit) |
| *"I just put documents in INPUT, please process them"* | Receives the documents, sorts them into 5 compartments, builds the task |
| *"Analyze the feature <name>"* | Writes `00_plan.md`, runs 01 → 02, stops at the questions for the BA |
| *"The BA answered: …"* | Copies verbatim (with person + date), opens the gate, continues 03 → 06 |
| *"How is progress?"* · *"Are the test cases up to standard?"* | Runs `status` / `lint` and reads the real result |

## Workflow

```
INPUT/<slug>/ ─► 01 extract rules ─► 02 find gaps ─► [ASK gate: BA answers] ─► 03 viewpoint ─► 04 test idea ─► 05 test case ─► [lint] ─► 06 coverage
                (verbatim quotes)    (06W matrix)                                                                                       stopping point
```

Three gates are checked by machine, not concluded by the AI:

| Gate | Command | Blocks when |
|---|---|---|
| ASK | `npm run gate <slug>` | BA questions remain unsettled (a person and a date must be on the answer; the AI may not settle them itself) |
| Lint | `npm run lint -- <slug>` | Missing citations, notification text / numbers not in the source, wrong format |
| Readiness | `npm run readiness -- <slug>` | Not mature enough to move to automation |

In addition: a hook blocks file writes while the gate is closed (Claude Code), and a **pre-commit** hook lints before every commit (every tool).

## Folders

| Folder | What it is | Who edits |
|---|---|---|
| `INPUT/<slug>/` | Source documents, 5 compartments: `01_business` · `02_ba` (required) · `03_dev` · `04_design` · `05_communication` | You (the agent only reads) |
| `OUTPUT/<slug>/` | Results of each run: `00_plan` → `06`, `testcases/`, `runs/` | Agent |
| `knowledge/` | Accumulated knowledge: `_project.md` (project conventions), `features/<slug>.md` (rules, questions, BA decisions) | Agent + humans per the rules |
| `qa-system/` | Agents, skills, common rules (`core/QA_STANDARD.md`), tools, workflows | Only through the upgrade process |
| `docs/` | The skill-authoring handbook (`so-tay-tao-skill.html`) and the `skill-lab/` practice exercises | Instructors |

## Read next

- Rules for every AI agent: [`AGENTS.md`](AGENTS.md) · Claude Code only: [`CLAUDE.md`](CLAUDE.md)
- Business rules (verdict, ASK gate, labels, FACT, 06W, identifiers): [`qa-system/core/QA_STANDARD.md`](qa-system/core/QA_STANDARD.md)
- All commands: [`qa-system/tools/README.md`](qa-system/tools/README.md)
- Create / edit skills: mandatory rules [`qa-system/templates/skills/LUAT-TAO-SKILL.md`](qa-system/templates/skills/LUAT-TAO-SKILL.md),
  handbook [`docs/so-tay-tao-skill.html`](docs/so-tay-tao-skill.html), practice [`docs/skill-lab/`](docs/skill-lab/)
