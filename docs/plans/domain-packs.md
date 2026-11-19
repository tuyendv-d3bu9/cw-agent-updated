# Upgrade plan — Industry domain packs (decouple skills from one business domain)

Date: 2026-11-19 · Branch: `feat/domain-packs` from `develop` (`e56360e`) · Governance: `qa-system/qa-lead/skills/system-upgrade-governance.md`
Status: APPROVED 2026-11-19 — Step A (THI_CONG) in progress. Phase 1 only.

## 0. Approved constraints (non-negotiable)

1. Packs are **checklists and sources of QA questions**, never authoritative business requirements.
2. Every BR/FD produced by the pipeline stays traceable to a **project-specific source** (QA_STANDARD §10); a pack
   item can only become an OQ/ASK question, a viewpoint candidate, or test-data vocabulary.
3. Unverified standards and references stay marked **Unknown**. Nothing is invented.
4. **Backward compatible:** a project with no `domain` in `_sut.json` behaves exactly as before
   (same conflict topics, same dataset types, same provenance units, same lint result).
5. Framework and integration points (Step A) land **before** any pack content (Step B).
6. All existing tests and `agent:check` pass before merge. Phase 2 and 3 need a separate review.

## 1. Problem (from learners + audit)

Skills work well for e-commerce, worse for other domains. Audit (2026-11-19) found core skills are already
mostly neutral; the coupling is in **tools** and a few examples:

| Sev | Where | Coupling |
|---|---|---|
| HIGH | `qa-system/tools/knowledge/conflict-detector.js:33` | Default conflict topics are e-commerce only (stacking, guest, voucher refund, shipping) |
| HIGH | `qa-system/tools/testdata/generate-dataset.js:274-296` | Built-in `voucher_code`, `bank_vn`, `currency_vnd` generators |
| MED | `qa-system/tools/lib/provenance.js:18` | Currency units (VND) hardcoded into the FACT lint |
| LOW | ~11 files | ShopGo / cart / voucher examples in automation skills, Jira mock, comments |

Missing today: any notion of *which industry* the SUT belongs to, so analysis cannot load the risks,
regulations and vocabulary typical of that industry.

## 2. Decision (governance §1–§2)

| Item | Value |
|---|---|
| Classification | **[C] refine in place** for skills/tools + a new **framework catalogue** (no new agent) |
| Why not [B] | No new role: analysts and designers keep their jobs; they just get a domain checklist as input |
| Layer — catalogue | `qa-system/domains/<id>/` (framework, versioned on `develop`, read-only for projects) |
| Layer — project choice | `knowledge/_sut.json` → `"domain": "<id>"` (one or more ids, e.g. `["banking-payments"]`) |
| Layer — project overrides | `knowledge/_domain.md` (optional local additions; same sections as a pack) |
| Layer — rule | QA_STANDARD §10 (valid sources) gets one rule, because ≥2 skills use it: **a domain pack is a checklist, never a source of fact.** Pack items may raise questions (OQ/ASK) or viewpoints, never become a BR/FD without a project source. This keeps the anti-fabrication guarantees intact. |

## 3. Domain catalogue — industry-standard anchors

Taxonomy for naming/grouping: **GICS** sectors and industry groups (11 sectors, 25 groups, 74 industries,
163 sub-industries — MSCI). Each pack also cites the industry's own reference model where one exists.

| Pack id | GICS anchor | Industry reference model | Typical regulation / standard (risk drivers) | Phase |
|---|---|---|---|---|
| `ecommerce-retail` | Consumer Discretionary Distribution & Retail | — (Unknown: ARTS/NRF model not verified) | PCI DSS (card data), consumer-protection, tax | 1 (migrate current defaults) |
| `banking-payments` | Financials → Banks / Financial Services | BIAN Service Landscape (business areas → domains → service domains) | PCI DSS, AML/KYC, ISTQB CT-FT syllabus | 1 |
| `insurance` | Financials → Insurance | ACORD Reference Architecture (Capability, Process, Product, Data models) | Solvency/actuarial rules (local) | 1 |
| `healthcare` | Health Care → Equipment & Services | HL7 FHIR modules (Administration, Clinical, Financial…) | HIPAA (US) / local health-data law | 1 |
| `telecom` | Communication Services → Telecommunication Services | TM Forum Business Process Framework (eTOM, GB921) | Lawful intercept, number portability (local) | 2 |
| `saas-b2b` | Information Technology → Software & Services | — | GDPR/privacy, SOC 2 (Unknown: not verified here) | 2 |
| `logistics-transport` | Industrials → Transportation | — (Unknown) | — | 2 |
| `edtech` | Consumer Discretionary → Consumer Services | — (Unknown) | Child privacy (local) | 2 |
| `gaming` | Communication Services → Media & Entertainment | ISTQB CT-GaMe syllabus | Age rating, gambling law if applicable | 3 |
| `automotive` | Consumer Discretionary → Automobiles & Components | ISTQB CT-AuT syllabus | ISO 26262, Automotive SPICE | 3 |

Cross-cutting baseline (loaded for every domain, not per pack): ISO/IEC 25010:2023 quality characteristics
(9 characteristics; 2023 edition renamed Usability → Interaction capability, added Safety), WCAG, OWASP.

> "Unknown" cells are not guessed: the pack ships with `<to be filled: source>` until a verified source is added
> (memory rule: no invented values in learning material).

## 4. Pack structure (same for every domain)

```
qa-system/domains/
  README.md                 # catalogue index + how selection works + source list
  _template/                # copied by authors when adding a domain
  <id>/
    README.md               # scope, GICS mapping, reference models, sources (URLs) — required
    vocab.md                # roles, entities, states, lifecycle → seeds knowledge/_glossary.md
    risks.md                # domain risk checklist, each item tagged with ISO 25010 characteristic
    rule-patterns.md        # rule FAMILIES that are often missing (e.g. "state transition reversal"),
                            #   neutral placeholders only, used as a 06W prompt list
    conflict_topics.json    # format already supported by conflict-detector (allow/deny phrases)
    datagen.json            # extra generator types/enums for generate-dataset
    units.json              # currency/unit words for provenance (locale-aware)
```

`agent:check` validates every pack: required files, valid JSON, README has ≥1 source URL, no BR-xx/FACT ids inside.

## 5. Where packs plug into the pipeline

| Stage / tool | Change | Reads |
|---|---|---|
| `knowledge-digest` | seed `_glossary.md` from `vocab.md` (marked as `[DOMAIN]`, not `[FACT]`) | vocab |
| 01 `requirement-risk-summary` | add "domain risks not addressed by the input" section | risks |
| 02 `missing-rule-06w` | use rule-patterns as extra prompts → produce OQ/ASK, never BR | rule-patterns |
| 03 `viewpoint-selection` | candidate viewpoints from risks, mapped to ISO 25010 | risks |
| 05 `test-case-generation` / `dataset-generation` | domain data types and vocabulary | datagen, vocab |
| `conflict-detector.js` | domain selected → topics from selected packs + `_conflict_topics.json`; **no domain → today's built-in topics unchanged** (legacy fallback = content of `ecommerce-retail`) | conflict_topics |
| `generate-dataset.js` | neutral types built in; `voucher_code`, `bank_vn`, `currency_vnd` **still resolve when no domain is selected** (legacy), and are provided by packs when one is | datagen |
| `provenance.js` | built-in units unchanged; selected packs can only **add** units | units |
| `init.js` | ask/record `domain` in `_sut.json`; create empty `_domain.md` | — |
| Helper `qa-system/tools/lib/domain.js` | one loader used by all tools above (`loadDomain()`) | all |

## 6. Anchor propagation (governance §4)

N1 skills above (C) · N3 `WORKFLOW.md` input columns for 01/02/03/05 · N4 `_system_map.json` gets `domains` index
(via `npm run map:sync`) · N5 qa-lead NL mapping: "which domain is this project / add a domain" · N6 agent-doctor
pack validation · N7 tests: conflict-detector (inject fixture), dataset, provenance, new domain loader tests.
LOW example clean-ups (11 files) replaced with neutral placeholders.

## 7. Execution & delegation

| Step | Work | Model | Gate |
|---|---|---|---|
| A | Loader, tool refactor, QA_STANDARD rule, skill hooks, init, agent-doctor, tests | Opus | `npm test` + `agent:check` green |
| B | Author phase-1 packs (4) from `_template`, every claim with a source URL; `ecommerce-retail` = migrated current defaults | Sonnet ×2 (2 packs each) | pack validation + my review |
| C | LOW example clean-ups (fixed list of 11 files) | Haiku | grep shows no ShopGo/voucher in `qa-system/**` outside packs and skill-lab |
| D | Run-twice acceptance (governance §5): old e-commerce flow still produces same conflicts/datasets with `domain: ecommerce-retail` | Opus (me) | diff-runs |
| E | Merge to `develop` after tests (user pushes) | me | — |

Phase 2/3 packs only after phase 1 is accepted. Translation to English (#1) runs **after** this lands.

## 8. Sources

- GICS methodology & structure — https://www.msci.com/index/methodology/latest/GICS ; overview PDF https://www.msci.com/downloads/documents/indexes/gics/MSCI%20GICS%20Overview.pdf
- BIAN Service Landscape — https://digital-portfolio.opengroup.org/archimate-bian/latest/01-doc/chap03.html
- ACORD Reference Architecture — https://www.acord.org/standards-architecture/reference-architecture
- HL7 FHIR overview (modules) — https://www.hl7.org/fhir/overview.html
- TM Forum Business Process Framework (eTOM) — https://www.tmforum.org/?p=1074832
- ISTQB specialist certifications (Finance, Game, Automotive, Mobile) — https://istqb.org/certifications/certification-list
- ISO/IEC 25010:2023 — https://www.iso.org/standard/78176.html
- Unverified in this pass (Unknown): exact GICS sector list text (fetched PDF unreadable; names consistent across secondary sources), PCI DSS v4 / HIPAA / GDPR / WCAG 2.2 pages, retail and logistics reference models.
