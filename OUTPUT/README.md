# OUTPUT/ — Results · **YOURS**

One folder `OUTPUT/<slug>/` per feature:

| File | What it is |
|---|---|
| `00_plan.md` | The progress map. The agent ticks `[x]` here after each stage |
| other `00_*` | Intake manifest, plan/result of distilling large document sets |
| `01_` → `06_` | The six test-design stages (natural stop at `06`) |
| `07_` · `08_` | Exploratory charter · UI image analysis (independent) |
| `09_` → `12_` | Test data (when needed; if present, `06` re-runs) |
| `15_readiness_*` | Readiness assessment before automation |
| `G1_` · `G2_` | Web crawl, flow clustering (automation) |
| `testcases/batch_NN.md` | Test case batches before merging into `05_` |
| `runs/RUN-XX_<ticket>/` | Test run results + **evidence screenshots** |

Bug reports and daily summaries go in `OUTPUT/reports/`.
To find out where you are, say: *"How is progress?"*

> ⚠️ `OUTPUT/` is the handover product: `jira:sync`, `lint`, `readiness`, `gate` all re-read these files.
> Rules settled by the BA live in `knowledge/`, not here. No folder starts with `_`:
> templates are in `qa-system/templates/`, draft runs in `.scratch/`, and system upgrade records are kept outside the repo.
