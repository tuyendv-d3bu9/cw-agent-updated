# Domain pack · ecommerce-retail

> A pack is a **checklist**, not a source of truth (QA_STANDARD §10.3). Never write a numbered `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` code into any file of the pack.

STATUS: draft

## 1. Scope
Covers: online retail — cart, pricing / tax, promotions (stacking, discount scope), guest and member customers, inventory reservation, the order / payment / delivery lifecycle, cancellation, returns, refunds and benefit restoration.
Does not cover: in-store retail (POS), multi-vendor marketplaces, the specific tax regulations of each country. Every concrete value (thresholds, rates, time limits) must come from the project's documents.
The pack's three JSON files are as-is copies of the tool's old defaults (tests keep both sides in sync) — do not edit them.

## 2. Industry classification (GICS)
| Level | Value | Source |
|---|---|---|
| Sector | Consumer Discretionary | https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Consumer Discretionary Distribution & Retail | https://www.msci.com/index/methodology/latest/GICS |

The level names follow the domain-packs plan §3; the MSCI page was not reopened while writing this pack: Unknown (not verified first-hand).

## 3. Industry reference models
| Model | Used for | Source |
|---|---|---|
| Unknown (no retail reference model verified yet) | No part of the pack comes from this model | Unknown |

## 4. Regulations / standards that create risk
| Regulation / standard | Scope of application | Source |
|---|---|---|
| PCI DSS | Payment card data; the PCI SSC home page confirms the PCI Data Security Standard exists, the specific requirements were not read | https://www.pcisecuritystandards.org/ (opened) |
| Consumer protection law, tax | Depends on the country of deployment | Unknown |
| ISO/IEC 25010:2023 (9 characteristics) | The characteristic column in `risks.md` | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (opened, third-party page; iso.org returned 403) |

## 5. Sources
- GICS: https://www.msci.com/index/methodology/latest/GICS
- PCI Security Standards Council: https://www.pcisecuritystandards.org/
- ISO/IEC 25010 characteristic names: https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
- ISO/IEC 25010:2023 (official page, could not be opened): https://www.iso.org/standard/78176.html
- Retail reference model: Unknown

## 6. Pack files
| File | Read by | Used for |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Term suggestions for `knowledge/_glossary.md` — reviewed by the project people |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Industry risks ⇒ `OQ` questions, viewpoint candidates |
| `rule-patterns.md` | `missing-rule-06w` | Rule families that are often missing ⇒ `MR` questions, never a `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Moved from `DEFAULT_TOPICS` of `conflict-detector.js` |
| `datagen.json` | `npm run data:gen` | Moved from the `voucher_code`, `currency_vnd`, `bank_vn` types of `generate-dataset.js` |
| `units.json` | `npm run lint` (origin of numbers) | The currency units `vnđ`, `vnd`, `đồng`, `đ` from `provenance.js` |
