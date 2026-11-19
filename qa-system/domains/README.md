# qa-system/domains — Domain pack catalogue

> A domain pack is the **checklist** of an industry (common risks, rule families that are often missing, vocabulary, sample data),
> **not a source of truth**. The single rule: `qa-system/core/QA_STANDARD.md` §10.3.
> This folder belongs to the **framework** (shared by every project, read-only for projects). Projects choose packs; they do not edit them.

## 1. Catalogue

| Pack id | Industry (GICS) | Status |
|---|---|---|
| `ecommerce-retail` | Consumer Discretionary · Distribution & Retail | draft — the 3 JSON files are compatible copies of the old defaults (byte-locked by tests) |
| `banking-payments` | Financials · Banks / Financial Services | draft — the BIAN and GICS pages could not be opened ⇒ the dependent parts record `Unknown` |
| `insurance` | Financials · Insurance | draft — the ACORD page could not be opened ⇒ the dependent parts record `Unknown` |
| `healthcare` | Health Care · Health Care Equipment & Services | draft — HIPAA could not be verified (hhs.gov 403) ⇒ `Unknown` |

Phase 2/3 (telecom, saas-b2b, logistics-transport, edtech, gaming, automotive) only after a separate review — see `docs/plans/domain-packs.md`.

Industry classification per GICS: https://www.msci.com/index/methodology/latest/GICS

## 2. Choosing the industry for a project

`knowledge/_sut.json`:

```json
{ "domain": "" }                                   // empty = no industry chosen — every tool runs as before
{ "domain": "ecommerce-retail" }                   // one pack
{ "domain": ["ecommerce-retail", "<pack-id>"] }    // several packs, merged in order
```

- An id not in this folder ⇒ the tool stops and lists the available ids. It never picks the closest pack by itself.
- See what the project has chosen and which files the pack contains: `npm run domain`.
- Project-specific additions: `knowledge/_domain.md` (template created by `npm run init`). The sections `## vocab`, `## risks`,
  `## rule-patterns` are markdown; `## datagen`, `## units` are one ` ```json ` block in the same format as the pack's files.
  Same name as in the pack ⇒ `_domain.md` wins. Project-specific conflict topics are still declared in `knowledge/_conflict_topics.json`.

## 3. Where packs are used

| Used by | Reads | Produces |
|---|---|---|
| `knowledge-digest` | `vocab.md` | `[DOMAIN]` term suggestions for `knowledge/_glossary.md` |
| `requirement-risk-summary` (01) | `risks.md` | `OQ`s for industry risks the documents do not address yet |
| `missing-rule-06w` (02) | `rule-patterns.md` | `MR` questions — never `BR` |
| `viewpoint-selection` (03) | `risks.md` | Viewpoint candidates — chosen only when the project has a source code |
| `test-case-generation` (05) · `dataset-generation` (10) | `vocab.md`, `datagen.json` | Vocabulary, generated data types |
| `npm run knowledge:conflicts` | `conflict_topics.json` | Industry chosen: the pack's topics replace the default topics. None chosen: the old default topics |
| `npm run data:gen` | `datagen.json` | Adds types / enums. The old types (`voucher_code`, `bank_vn`, `currency_vnd`…) still work when no industry is chosen |
| `npm run lint` | `units.json` | Adds units for recognising business numbers. Existing units are never removed |

## 4. A checklist, not truth

- A pack row may only become: a question (`OQ` → `MR`), a viewpoint candidate, or vocabulary / generated data.
- `BR`/`FD` are always quoted from the project's documents. Writing `[DOMAIN]` in the `Nguồn` (source) column of a `BR`/`FD` ⇒ `npm run lint` reports an error.
- A pack contains no codes like `BR-01`, `FD-02`… (the project's fact codes) — `npm run agent:check` reports an error if it does.

## 5. Adding a pack

1. Copy `_template/` to `qa-system/domains/<pack-id>/` (lower case, digits, hyphens).
2. Fill in all 7 files. Every row has a source column: a verified URL, or `Unknown`. The README needs **at least one URL**
   (`http://`/`https://`) or an explicit `Unknown`. No guessing, no invented links, no example values from a real project.
   Prefer a `Ref id` from [`SOURCES.md`](SOURCES.md) in the source column: register the reference there first with its URL,
   what was read, status (VERIFIED / PARTIAL / UNKNOWN), date and access limitation.
   Optional, not read by tools: `coverage-matrix.md` — capability × risk × ISO 25010 × question × reference, with gaps left
   open for a domain expert (see the four phase-1 packs).
3. Add a row to table §1 of this file.
4. `npm run agent:check` — the pack must appear in the *domain packs* section with no errors.
5. This is a system upgrade: follow `qa-system/qa-lead/skills/system-upgrade-governance.md`.
