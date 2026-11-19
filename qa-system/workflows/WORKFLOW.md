# WORKFLOW — QA Agent pipeline map

> This file is for **READING**: which stages exist, in what order they run, who does them, which file each produces.
> To **RUN** a sequence ⇒ the runbooks `qa-system/workflows/run-*.md` (§5).
> The rules (verdict, ASK gate, labels, knowledge, IDs) are in `qa-system/core/QA_STANDARD.md` — this file does not repeat them.

```
qa-system/
  core/QA_STANDARD.md
  qa-lead/  qa-analyst/  qa-test-design/  qa-test-data/  qa-ui-review/
  qa-reporter/  qa-automation/  qa-readiness-evaluator/
  tools/  templates/  workflows/  domains/
knowledge/  _project.md · _glossary.md · _template.md · _system_map.json · features/<slug>.md
INPUT/<slug>/   01_business · 02_ba · 03_dev · 04_design · 05_communication
OUTPUT/<slug>/  00_plan.md · 01_…16_ · testcases/ · runs/
```

---

## 1. Order & branches

```
01 → 02 →[gate]→ 03 → 04 → 05 →[lint]→ 06        ← natural stopping point
                               └─(optional) 09 → 10 → 11 → 12 → re-run 06 (collects the gaps from 12)
06 →[readiness GO + request + URL]→ G1 → G2 → G3 → G4
```

| Branch | Contains | When |
|---|---|---|
| **A · Main pipeline** | `01`→`06` | Always runs. `01` has no hard stop; the ASK gate sits **after `02`** (`npm run gate`) |
| **B · Data** | `09`→`12` | Optional, after `05`. Once run, re-run `06` |
| **C · Independent** | `07` exploratory charter · `08` UI screenshot · `16` CR impact analysis | At any time. `07` needs `03`; `08` needs attached images; `16` needs `01` + `05` + updated documents in `INPUT/<slug>/` |
| **D · Reporting** | bug report · daily summary | When there are bug notes / sprint data. Writes to `OUTPUT/reports/` |
| **E · Readiness** | `15` | Before branch G. The figures are measured by `npm run readiness` |
| **G · Automation** | `G1`→`G4` | Only when the conditions of `AGENTS.md` §1.5 are met |
| **F · System governance** | `workflow-authoring` · `system-upgrade-governance` | Outside the testing pipeline. Afterwards, smoke-test one stage of branch A again |

**File naming**: an `NN_` number for branches A–C, E; a `G<n>_` prefix for branch G (never sharing `07_`/`08_` with branch C).

---

## 2. Dispatch table

The **In** column lists only deliverables; every stage also loads `knowledge/_project.md` + `knowledge/features/<slug>.md`
(QA_STANDARD §7). The exact input list is in each skill's "Đầu vào" (inputs) section.
`+ pack:<file>` = a domain pack file, **only when** `knowledge/_sut.json` has a `domain` (`npm run domain`); otherwise skip it.
A pack is a checklist, not a source (QA_STANDARD §10.3).

### Branch A

| # | Agent | Skill | In | Out |
|---|---|---|---|---|
| 0 | `qa-analyst` | `knowledge-digest` *(only when there are too many documents)* | `00_digest_plan.md` + the documents in the batch + pack:`vocab` | `knowledge_digest/batch_NN.md` · `00_knowledge_digest.md` |
| 1 | `qa-analyst` | `requirement-risk-summary` | `INPUT/<slug>/` (5 folders) or `00_knowledge_digest.md` + pack:`risks` | `01_requirement_risk_summary.md` |
| 2 | `qa-analyst` | `missing-rule-06w` | `01` + sources `INPUT/<slug>/` / digest + `01_conflict_warning.md` (if present) + pack:`rule-patterns` | `02_missing_rule_report.md` |
| — | *gate* | `npm run gate <slug>` | | only exit `0` moves on to 3 |
| 3 | `qa-analyst` | `viewpoint-selection` | `01` + `02` + pack:`risks` | `03_viewpoint_report.md` |
| 4 | `qa-analyst` | `test-idea-design` | `01` + `02` + `03` | `04_test_idea_report.md` |
| 5 | `qa-test-design` | `test-case-generation` | `01` + `03` + `04` + pack:`vocab` | `05_test_case_spec.md` (large: `05_test_blueprint.json` + `testcases/batch_NN.md`) |
| — | *gate* | `npm run lint -- <slug>` | | only exit `0` lets 5 be reported done |
| 6 | `qa-test-design` | `coverage-review` | `01` + `02` + `04` + `05` + `12` (if present) + lint result | `06_coverage_review.md` |

### Branch B

| # | Agent | Skill | In | Out |
|---|---|---|---|---|
| 9 | `qa-test-data` | `data-class-map` | `01` (FD section) | `09_data_class_map.md` |
| 10 | `qa-test-data` | `dataset-generation` | `09` + pack:`datagen`, `vocab` | `10_dataset.md` |
| 11 | `qa-test-data` | `boundary-negative-dataset` | `09` | `11_boundary_negative_dataset.md` |
| 12 | `qa-test-data` | `data-validation-traceability` | `10` + `11` + `05` | `12_data_validation_traceability.md` |

### Branches C, D, E

| # | Agent | Skill | In | Out |
|---|---|---|---|---|
| 7 | `qa-automation` | `exploratory-charter` | Risks in `03` | `07_exploratory_charter.md` |
| 8 | `qa-ui-review` | `ui-screenshot-review` | Attached images + `INPUT/<slug>/04_design/` | `08_ui_screenshot_analysis.md` |
| D | `qa-reporter` | `gen-bug-report` | Bug notes + `knowledge/` | `OUTPUT/reports/bug-report-<slug>.md` |
| D | `qa-reporter` | `gen-daily-summary` | Sprint data JSON + audience | `OUTPUT/reports/daily-summary-<audience>.md` |
| 15 | `qa-readiness-evaluator` | `gen-readiness-report` | `15_readiness_metrics.json` + `01` `02` `03` `05` `06` `12` | `15_readiness_report.md` |
| 16 | `qa-test-design` | `cr-impact-analysis` | `INPUT/<slug>/` (5 folders) + `01` + `02` (if present) + `05` + `06` (if present) | `16_cr_impact_analysis.md` |

### Branch G — never runs automatically after Stage 6

| # | Agent | Skill | In | Out |
|---|---|---|---|---|
| G1 | `qa-automation` | `web-journey-discovery` | Environment URL + `05` | `G1_web_journey_discovery.md` |
| G2 | `qa-automation` | `flow-clustering` | `G1_…` + `05` | `G2_flow_clusters.md` |
| G3 | `qa-automation` | `pom-generator` | `G2_…` + `knowledge/features/<sut>-ui-map.md` | `automation/pages/*.ts` |
| G4 | `qa-automation` | `test-runner-evidence` | `automation/tests/*.spec.ts` + `runs/<run-id>/run_plan.md` | `runs/<run-id>/run_result.md` · `evidence/` · `run_defects.md` |

Push run results to Jira: `npm run jira:sync <slug> <run-id>`.

### Branch F

| Agent | Skill | In | Out |
|---|---|---|---|
| `qa-lead` | `workflow-authoring` | A description in words or a short phrase + `_system_map.json` + `qa-system/templates/workflows/` | `qa-system/workflows/run-<name>.md` · checklist in `00_plan.md` |
| `qa-lead` | `system-upgrade-governance` | Upgrade request + `_system_map.json` + `qa-system/templates/` | Changes in `qa-system/`, `_system_map.json`; the upgrade record kept outside the repo |

---

## 3. Where to stop

Verdicts and gate rules: QA_STANDARD §1 (including the dedicated rule of `coverage-review`). Besides the verdict, the §2.1
labels (`[GIẢ ĐỊNH]`, `[CONTEXT_MISSING]`, `[ĐỀ XUẤT]`, `CHƯA COVER`, `CHƯA CÓ DATA`) mark the places a human must look at.

## 4. Running conventions

| Item | Convention |
|---|---|
| `slug` | Same as the feature knowledge file name (`auth-login`, `order-checkout`) |
| One skill | Writes **exactly one** file, with the meta line per QA_STANDARD §7 |
| After each step | Tick `00_plan.md` |
| Re-running | Old IDs stay unchanged; new IDs come from `npm run ids -- <slug>` (QA_STANDARD §9.1) |
| Never | Modify `INPUT/` · modify another agent's deliverables · run a step before the previous step has produced its output |

## 5. Runbooks — created in words, run with a short phrase

Each workflow is one file `qa-system/workflows/<name>.md`; its frontmatter declares the **triggers** and the **steps**.
Triggers are given in both Vietnamese and English — either language matches `npm run workflow -- find`.

```bash
npm run workflow -- list        # which workflows exist, which phrase runs each
npm run workflow -- validate    # check them all (agent:check also checks them)
```

| `format` | What it is | `validate` checks |
|---|---|---|
| `v1` | Machine-readable `steps` | Agents/skills really exist; no bypassing the `ask` gate (before Stages 3→6) or `readiness` + `confirm` (before automation); `output` stays inside `OUTPUT/<slug>/` |
| `legacy` | Prose, with triggers only | Triggers are not duplicated |

| Runbook | Format | What it does |
|---|---|---|
| `run-req-to-testcase` · `run-ba-spec-to-testcase` | v1 | `01`→`06` with gates |
| `run-to-testcase` | v1 | `01`→`05`, no review yet |
| `run-testcase` | v1 | `01`→`06` + `09`→`12` + re-run `06` |
| `re-run-testcase` | legacy | Re-run after the BA answers / after a `FIX` |
| `verify-testcase` | legacy | Run only `06` on an existing set + manual check |
| `flow` | legacy | Old index, points to `run-req-to-testcase` |
| `run-bulk-doc-intake` | v1 | Large-batch intake → digest → `01` → `02` → gate |
| `run-conflict-check` · `run-jira-sync` | legacy | Conflict check · Jira export/push/pull |
| `run-doc-to-jira-e2e` | v1 | `01`→`06` → Jira → automation (with gates) → report |
