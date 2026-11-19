# Domain pack · insurance

> A pack is a **checklist**, not a source of truth (QA_STANDARD §10.3). Never write a numbered `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` code into any file of the pack.

STATUS: draft

## 1. Scope
Insurance (life / non-life at the policy-lifecycle level): quotes, policy issuance, endorsements, premium collection, claims, renewal / lapse.
Does NOT cover: reinsurance, actuarial pricing, solvency regulations and supervisory reporting specific to each country (recorded as "local regulation", details `Unknown`),
the concrete premium / limit / waiting-period values of any product.

## 2. Industry classification (GICS)
| Level | Value | Source |
|---|---|---|
| Sector | Financials (name taken from plan §3) | Unknown — the MSCI page returns a PDF that could not be read. Reference page: https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Insurance (name taken from plan §3) | Unknown (as above) |

## 3. Industry reference models
| Model | Used for | Source |
|---|---|---|
| ACORD Reference Architecture (Capability, Process, Product, Data models — per plan §3) | Suggests vocabulary groups and risk areas by insurance capability / process / product / data. The page content is `Unknown` because it could not be opened | https://www.acord.org/standards-architecture/reference-architecture (WebFetch returned 403) |

## 4. Regulations / standards that create risk
| Regulation / standard | Scope of application | Source |
|---|---|---|
| Solvency / technical reserves (local regulation) | Per country; details `Unknown` | Unknown |
| Consumer protection / pre-sale disclosure (local regulation) | Per country; details `Unknown` | Unknown |
| Protection of personal data and health data (local regulation) | Per country; details `Unknown` | Unknown |
| ISO/IEC 25010:2023 (characteristics in risks.md) | Characteristic names checked against the iso25000.com summary page, not the ISO page (which returns 403) | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (opened) |

## 5. Sources
- https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 — opened
- https://www.acord.org/standards-architecture/reference-architecture — URL from plan §8, returns 403, could not be opened
- https://www.msci.com/index/methodology/latest/GICS — URL from plan §8, the PDF could not be read
- https://www.iso.org/standard/78176.html — URL from plan §8, returns 403

## 6. Pack files
| File | Read by | Used for |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Term suggestions for `knowledge/_glossary.md` — reviewed by the project people |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Industry risks ⇒ `OQ` questions, viewpoint candidates |
| `rule-patterns.md` | `missing-rule-06w` | Rule families that are often missing ⇒ `MR` questions, never a `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Topics for detecting conflicts between features |
| `datagen.json` | `npm run data:gen` | Generated data types |
| `units.json` | `npm run lint` (origin of numbers) | Units of measure / currencies (additions only) |
