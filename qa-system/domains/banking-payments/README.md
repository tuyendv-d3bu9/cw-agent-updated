# Domain pack · banking-payments

> A pack is a **checklist**, not a source of truth (QA_STANDARD §10.3). Never write a numbered `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` code into any file of the pack.

STATUS: draft

## 1. Scope
Retail banking / payments: accounts, money transfers, card payments, reconciliation.
Does NOT cover: securities, insurance (see the `insurance` pack), the specific regulations of each country (recorded as "local regulation", details `Unknown`),
the concrete limit / fee / cut-off values of any bank.

## 2. Industry classification (GICS)
| Level | Value | Source |
|---|---|---|
| Sector | Financials (name taken from plan §3) | Unknown — the MSCI page returns a PDF that could not be read. Reference page: https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Banks / Financial Services (name taken from plan §3) | Unknown (as above) |

## 3. Industry reference models
| Model | Used for | Source |
|---|---|---|
| BIAN Service Landscape (business areas → business domains → service domains) | Suggests vocabulary groups / risk areas by banking service domain. The three-level structure is taken from plan §3; the page content is `Unknown` because it could not be opened | https://digital-portfolio.opengroup.org/archimate-bian/latest/01-doc/chap03.html (WebFetch was redirected to a login page) |
| ISTQB Certified Tester Finance Testing (CT-FT) | A reminder that testing financial systems is a specialism of its own. The page only says CT-FT focuses on testing knowledge for systems in the financial services sector; the syllabus content is `Unknown` | https://istqb.org/certifications/certification-list (opened) |

## 4. Regulations / standards that create risk
| Regulation / standard | Scope of application | Source |
|---|---|---|
| PCI DSS | Payment card account data; issued by the PCI Security Standards Council. Version, clause numbers: `Unknown` | https://www.pcisecuritystandards.org/standards/pci-dss/ (opened) |
| AML/KYC (local regulation) | Per country; thresholds, retention periods, watch lists: `Unknown` | Unknown |
| Payment / central bank regulations (local regulation) | Per country: `Unknown` | Unknown |
| ISO/IEC 25010:2023 (characteristics in risks.md) | Characteristic names checked against the iso25000.com summary page, not the ISO page (which returns 403) | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (opened) |

## 5. Sources
- https://www.pcisecuritystandards.org/standards/pci-dss/ — opened
- https://istqb.org/certifications/certification-list — opened
- https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 — opened
- https://docs.stripe.com/testing — opened. **TEST ONLY**: `card_pan_test` in `datagen.json` contains only Stripe's published sandbox card numbers, not real card data
- https://digital-portfolio.opengroup.org/archimate-bian/latest/01-doc/chap03.html — URL from plan §8, could not be opened
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
