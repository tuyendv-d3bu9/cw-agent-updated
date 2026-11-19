# AGENTS — Constitution & Operations Map

> Applies to every AI agent (Antigravity, Claude Code, Cursor, Codex, Copilot, Gemini CLI…) in this repo.
> **Business rules** (verdict, ASK gate, labels, FACT, 06W, knowledge, identifiers, source priority order)
> live only in [`qa-system/core/QA_STANDARD.md`](qa-system/core/QA_STANDARD.md). This file **points to** them and does not copy them.

---

## 1. Workspace

| Area | Purpose | What the agent may do |
|---|---|---|
| `INPUT/<slug>/` | Source documents, 5 compartments `01_business` · `02_ba` · `03_dev` · `04_design` · `05_communication` | **Read only** (except the intake tool) |
| `OUTPUT/<slug>/` | Deliverables `00`→`15`, `testcases/`, `runs/` | **The only place** results may be written |
| `knowledge/` | Accumulated knowledge (SSOT) | Read/write per QA_STANDARD §8 |
| `qa-system/` | Agents, skills, tools, templates, workflows | Only the QA Leader edits, via `system-upgrade-governance` — **read and strictly follow** `qa-system/templates/skills/LUAT-TAO-SKILL.md` (the skill-authoring rules) before editing any file |

### 1.1. Gate 0 — document intake
- The QA Leader runs `npm run intake` itself (or `intake:bulk` for large batches): converts to `.md`, sorts into the 5 compartments, builds `OUTPUT/<slug>/`, `knowledge/features/<slug>.md`, `00_plan.md`.
- **Missing `02_ba/`** ⇒ stop and ask the user to supply it before planning. Missing any other compartment ⇒ record a risk (`qa-lead/AGENT.md` §3).
- **Priority order when sources disagree**: QA_STANDARD §10.2. If the newer version cannot be determined ⇒ raise an MR (missing-rule question), do not choose yourself.
- Intake extracts comments, tracked changes and "DRAFT" markers into the `## Annotations / Pending changes` section of the `.md` file.
  That section is **not yet truth** ⇒ it becomes an MR (QA_STANDARD §10.2).
- Unsupported files or failed conversions are **left in place and reported** — never deleted. Images (wireframes,
  screenshots) are kept in `INPUT/<slug>/04_design/_assets/`.
- **Task names follow the feature**, not the revision: version/date/document type are dropped (`SRS_Doi_mat_khau_v2` → `doi-mat-khau`).
  A document about to enter a task that **already has** documents ⇒ intake stops, **exit 2**, the file is untouched. The QA Leader asks
  the user in words *"is this a new version / supplementary document of feature X?"* — never decides alone — then re-runs with `--into <slug>`
  (yes) or `--slug <other-name>` (a different feature).
- Older versions of the same document (same name minus version/date, same compartment) are moved to `<compartment>/_superseded/` by
  date → version. **No agent reads `_superseded/`** during analysis. If it cannot be decided which is newer, keep
  both, intake reports it, and the QA Leader asks the user which one is in use.

### 1.2. Execution layer (`OUTPUT/<slug>/runs/`)
The Master Spec `01_`→`06_` is fixed. Running tests for a ticket opens its own session
`runs/RUN-XX_<ticket>/` containing `run_plan.md` · `run_result.md` · `evidence/` · `run_defects.md`
(templates in `qa-system/templates/run/`).

### 1.3. System Map First
When starting work, look up `npm run map -- <keyword>` (the `routing_table` of `knowledge/_system_map.json`) and open **exactly the target file**.
**Never open `.json` files directly** (system map, manifest, metrics, blueprint, sprint-data): use `npm run json -- <file> <dot.path>` to fetch just the branch you need, `--keys` to see which keys exist.
Do not scan/grep blindly across the whole project. If the map drifts from reality ⇒ `npm run map:sync`.

### 1.4. The QA Leader is the only entry point
The user talks only to the QA Leader (`qa-system/qa-lead/AGENT.md`). The QA Leader looks up the map, writes `00_plan.md`,
and delegates to the right specialist agent.

### 1.5. Boundary & readiness gate
- Stage 6 is the **natural stopping point**. Never continue into automation on your own.
- Automation (branch G) runs only when all three hold: the user explicitly asks · an environment URL exists ·
  `npm run readiness -- <slug> --write` returns `GO` (exit `0` GO · `1` CONDITIONAL · `2` NO-GO), then
  `qa-readiness-evaluator` interprets it into `15_readiness_report.md`. Figures are measured by the tool, not counted by eye.

### 1.6. ASK gate
Rule: **QA_STANDARD §1** (the single definition). Enforced by machine in three layers:

| Layer | Mechanism | Effect |
|---|---|---|
| 1 | `npm run gate <slug>` → exit `0` open · `1` closed; writes/removes `OUTPUT/<slug>/_gate.lock` | Every IDE |
| 2 | `PreToolUse` hook (`.claude/settings.json` → `qa-system/tools/system/gate-hook.js`) blocks writes to `03_`→`06_` | Claude Code |
| 3 | `npm run gate:audit <slug>` → exit `2` if any `03_`→`06_` file was produced after the lock time | Every IDE / CI |

Outside Claude Code there is no layer 2 ⇒ calling `npm run gate` yourself before every Stage 3+ deliverable is **mandatory**.

---

## 2. Plan First & per-stage loading

Before analyzing a feature: create `OUTPUT/<slug>/00_plan.md` (or `npm run workflow -- start <name> --slug <slug>`).
This is the **only tracker** — tick `- [x]` here, never create `TODO.md` or any other tracking file. Quick view: `npm run status`.

**Loading rule**: each stage loads **the inputs declared in its skill** + `knowledge/_project.md` + `knowledge/features/<slug>.md`
(QA_STANDARD §7). Do not load deliverables outside that list, do not read across into other tasks.

### 2.1. Stage order

```
01 → 02 →[npm run gate]→ 03 → 04 → 05 →[npm run lint]→ 06   ← natural stopping point
                                    └─(optional) 09 → 10 → 11 → 12 → re-run 06 (with 12)
06 →[readiness GO + request + URL]→ branch G (automation)
```

- `01` has no hard stop: `OQ-xx` do not block, `02` handles them. The only gate of the design pipeline is after `02`.
- The data branch `09`→`12` runs only when a dataset is needed. Once run, `06` must be re-run to collect the `CHƯA CÓ DATA` (no data yet) gaps.
- Identifiers are stable across runs (QA_STANDARD §9.1). Next number per id family: `npm run ids -- <slug>`.
- Full stage table (agent · skill · input · output): `qa-system/workflows/WORKFLOW.md`.

### 2.2. `00_plan.md` skeleton

```markdown
# Kế hoạch · <slug>
Ngày tạo: YYYY-MM-DD · Người lập: <agent/tool> · Mode: <1-4> · Trạng thái: IN-PROGRESS

## Nguồn
- INPUT/<slug>/ (5 ngăn) hoặc OUTPUT/<slug>/00_knowledge_digest.md
- knowledge/_project.md · knowledge/features/<slug>.md

## Lộ trình
- [ ] 01 requirement-risk-summary → 01_requirement_risk_summary.md
- [ ] 02 missing-rule-06w → 02_missing_rule_report.md
- [ ] Cổng ASK: npm run gate <slug>
- [ ] 03 viewpoint-selection → 03_viewpoint_report.md
- [ ] 04 test-idea-design → 04_test_idea_report.md
- [ ] 05 test-case-generation → 05_test_case_spec.md
- [ ] Cổng lint: npm run lint -- <slug>
- [ ] 06 coverage-review → 06_coverage_review.md
```

> The skeleton's headings and labels are kept in Vietnamese on purpose because tools and agents copy them verbatim:
> `Kế hoạch` = plan, `Ngày tạo` = created on, `Người lập` = author, `Trạng thái` = status, `Nguồn` = sources,
> `5 ngăn` = 5 compartments, `hoặc` = or, `Lộ trình` = roadmap, `Cổng ASK` = ASK gate, `Cổng lint` = lint gate.

### 2.3. "Continue" / "How is progress?"
The user does not have to remember paths. The agent plays the QA Leader itself: runs `npm run status`, reads `00_plan.md`,
identifies the unfinished task and the gate that is closed (if any, restates the pending question), proposes the next stage, waits for confirmation, then
loads exactly that stage's inputs — never redoing a finished stage.

---

## 3. Large scale

- **Test cases > 50**: do not generate in one pass. `05_test_blueprint.json` (condensed catalog) → batches
  `OUTPUT/<slug>/testcases/batch_01.md`, `batch_02.md`… (~50 TCs per batch) → `npm run testcases:merge <slug>`.
- **Data > 10 records**: never type by hand. The agent writes `dataset_schema.json`, runs `npm run data:gen`
  (0 LLM tokens), producing `10_dataset.md`.
- **Large document sets**: `npm run knowledge:digest <slug>` splits into batches, the `knowledge-digest` skill distills with source citations.
- **Web journeys** (branch G): normalize to Gherkin `Given/When/Then` with a Step → locator mapping table
  (`getByRole`, `getByTestId`, `getByPlaceholder`). Locators come only from the real app / `knowledge/features/<sut>-ui-map.md`.

---

## 4. Knowledge loop

`OUTPUT/` is the result of one run; `knowledge/` is what accumulates. **Who writes which section**: QA_STANDARD §8 (a single table).
BA/PO answers are human work: the agent copies them verbatim only when the user supplies them, then runs
`npm run knowledge:sync -- <slug> --write`. The next run reads knowledge ⇒ never re-asks what is already settled.
Initialization: `npm run init` (new repo) · `npm run knowledge:new <slug>` (new feature).

---

## 5. Invariant constraints

1. **Only quote or ask, never invent** — guard QA_STANDARD §2, label for missing info §2.1, FACT §3.
2. **Verdict** PASS / FIX / ASK — QA_STANDARD §1. The 10-line meta header — §7.
3. **Machine-check before reporting done**: `npm run lint -- <slug>` before reporting Stage 5/6 done (exit `1` ⇒ not done).
   The linter handles the mechanical part **and value provenance** (notification text, numbers, quotes must exist in the source); business coverage and getting one sentence right remain the job of the agent and humans.
   Lint re-runs at every exit (`export`, Jira push, `readiness`) and before every `git commit` (`npm run hooks:install`, installed by `npm run init`) — applies to every AI tool, not just Claude Code.
4. **Keep the root clean**: no files at root (`TODO.md`, `.cursorrules`…). All results go in `OUTPUT/<slug>/`.

---

## 6. Commands

Full index + "need what → run what" table: [`qa-system/tools/README.md`](qa-system/tools/README.md).
Common: `npm run init` · `npm start` · `npm run intake` · `npm run status` · `npm run gate <slug>` ·
`npm run ids -- <slug>` · `npm run lint -- <slug>` · `npm run readiness -- <slug>` ·
`npm run knowledge:sync -- <slug> --write` · `npm run testcases:merge <slug>` · `npm run workflow -- <list|find|start|validate>` ·
`npm test` · `npm run agent:check`.

---

## 7. Zero-CLI

Users are Testers / BAs / POs / managers — they **do not type terminal commands**. Every script is an internal tool of the agent.
**Forbidden**: telling the user *"open a terminal and type npm run…"*: the agent runs it silently and reports the result in words.

| User says | Agent does itself |
|---|---|
| *"Where do I start?"* · *"What is this folder for?"* | `npm start`, reads the result to them |
| *"There are new documents in INPUT, please process them"* | `npm run intake` |
| *"How is progress?"* | `npm run status` |
| *"Create a workflow: whenever … then …"* | skill `workflow-authoring` in CREATE mode, `validate` green, present then **wait** |
| A short phrase such as *"BA sent a new document"* | `npm run workflow -- find` → `start`, stopping at every gate |

Full mapping table: `qa-system/qa-lead/AGENT.md` §5.
