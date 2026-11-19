# Domain pack · <to be filled: pack-id>

> Pack template. Copy the whole `_template/` folder to `qa-system/domains/<pack-id>/` and fill it in.
> A pack is a **checklist**, not a source of truth (QA_STANDARD §10.3). Never write a numbered `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` code into any file of the pack.

STATUS: <to be filled: draft | reviewed>

## 1. Scope
<to be filled: the industry / sub-industry the pack covers, and what the pack does NOT cover>

## 2. Industry classification (GICS)
| Level | Value | Source |
|---|---|---|
| Sector | <to be filled: sector name> | <to be filled: source URL> |
| Industry group / Industry | <to be filled: name> | <to be filled: source URL> |

## 3. Industry reference models
| Model | Used for | Source |
|---|---|---|
| <to be filled: model name, or `Unknown`> | <to be filled: which part of the pack comes from it> | <to be filled: source URL, or `Unknown`> |

## 4. Regulations / standards that create risk
| Regulation / standard | Scope of application | Source |
|---|---|---|
| <to be filled: name, or `Unknown`> | <to be filled: country / data type> | <to be filled: source URL, or `Unknown`> |

## 5. Sources
**At least one URL** (`http://` / `https://`) is mandatory. Not verified yet ⇒ write `Unknown` — no guessing, no invented links.

- <to be filled: source URL>

## 6. Pack files
| File | Read by | Used for |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Term suggestions for `knowledge/_glossary.md` — reviewed by the project people |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Industry risks ⇒ `OQ` questions, viewpoint candidates |
| `rule-patterns.md` | `missing-rule-06w` | Rule families that are often missing ⇒ `MR` questions, never a `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Topics for detecting conflicts between features |
| `datagen.json` | `npm run data:gen` | Generated data types / enum lists |
| `units.json` | `npm run lint` (origin of numbers) | The industry's units of measure / currencies (additions only) |
