# qa-system/ — The 9-agent QA system · **MACHINERY**

> **Normally you do not need to open this folder.** The agents read it themselves.
> Come here only when you **deliberately upgrade the system**: add a skill, build a new agent, edit an existing skill.

| Folder | What it is |
|---|---|
| `core/QA_STANDARD.md` | The **single** source of common rules: verdict & ASK gate, labels, FACT, 06W, risk, knowledge, identifiers, source priority, scales |
| `qa-lead/` | The commander — the only gateway between you and the system |
| `qa-analyst/` `qa-test-design/` `qa-test-data/` `qa-ui-review/` `qa-reporter/` `qa-automation/` `qa-readiness-evaluator/` | 8 specialists, one per stage |
| `tools/` | Internal tools — see [tools/README.md](tools/README.md) |
| `templates/` | Agent/skill/workflow templates — see [templates/README.md](templates/README.md) |
| `workflows/` | The pipeline map (`WORKFLOW.md`) and runbooks |
| `domains/` | Domain packs — per-industry checklists, the project chooses in `knowledge/_sut.json` → `domain` (QA_STANDARD §10.3) — see [domains/README.md](domains/README.md) |
| `integrations/` | Use on Antigravity / Cursor / Claude Code, Jira MCP |

To upgrade, just say it in words: *"I want the test-case-generation skill to have an extra field X"*.
The QA Leader runs `qa-lead/skills/system-upgrade-governance.md`: decision tree, 7 anchor points, acceptance
(including running the skill twice on the same input to compare results). After every edit: `npm test` and `npm run agent:check` must be green.

---

This folder is designed to be split out as an npm package reusable in other projects.
In the learners' repo it is an ordinary folder — editable, committable, submittable as homework.
