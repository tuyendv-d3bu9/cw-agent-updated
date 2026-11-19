# Domain pack · healthcare

> A pack is a **checklist**, not a source of truth (QA_STANDARD §10.3). Never write a numbered `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` code into any file of the pack.

STATUS: draft

## 1. Scope
Covers: healthcare software holding patient data — registration / identification, encounters, observation results, medication orders, scheduling, billing / reimbursement (claims), access control on records.
Does not cover: embedded medical devices, specific clinical procedures, clinical thresholds / doses / reference values, the health laws of each country. Every concrete value must come from the project's documents.
Test data in the pack is always **fake and easy to recognise** (prefix `SYN-`); real patient identifiers are never used.

## 2. Industry classification (GICS)
| Level | Value | Source |
|---|---|---|
| Sector | Health Care | https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Health Care Equipment & Services | https://www.msci.com/index/methodology/latest/GICS |

The level names follow the domain-packs plan §3; the MSCI page was not reopened while writing this pack: Unknown (not verified first-hand).

## 3. Industry reference models
| Model | Used for | Source |
|---|---|---|
| HL7 FHIR (R5) — the Administration, Clinical, Medications, Diagnostics, Workflow, Financial, Security & Privacy modules | Entity vocabulary (Patient, Encounter, Observation, Claim…) in `vocab.md`, `datagen.json` | https://www.hl7.org/fhir/overview.html (opened; the page lists 14 modules) |
| Encounter status codes (9 codes), Claim (4 codes) | The `encounter_status`, `claim_status` enums in `datagen.json` | https://www.hl7.org/fhir/encounter.html · https://www.hl7.org/fhir/claim.html (opened; only the first 100000 characters of each page were read) |
| The full set of Observation status codes | Not used as an enum | Unknown (only the first 4 codes were seen) |
| FHIR R5 Appointment, ObservationStatus, Consent, MedicationRequest status, Patient / LinkType, AuditEvent, Coverage, ClaimResponse, Security labels — VERIFIED code lists | `vocab.md` §3 states, the added enums in `datagen.json`, the risks citing `ref-fhir-*` | See `qa-system/domains/SOURCES.md` (one URL per resource) |

## 4. Regulations / standards that create risk
| Regulation / standard | Scope of application | Source |
|---|---|---|
| HIPAA (United States) | Identifiable health data; the hhs.gov page returned HTTP 403, not verified | Unknown |
| Local health data laws | Depends on the country of deployment | Unknown |
| ISO/IEC 25010:2023 (9 characteristics) | The characteristic column in `risks.md` | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (opened, third-party page; iso.org returned 403) |

## 5. Sources
- GICS: https://www.msci.com/index/methodology/latest/GICS
- HL7 FHIR overview: https://www.hl7.org/fhir/overview.html
- FHIR Encounter: https://www.hl7.org/fhir/encounter.html
- FHIR Claim: https://www.hl7.org/fhir/claim.html
- ISO/IEC 25010 characteristic names: https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
- ISO/IEC 25010:2023 (official page, could not be opened): https://www.iso.org/standard/78176.html
- FHIR resources read in the 2026-11-19 audit: https://www.hl7.org/fhir/appointment.html · https://www.hl7.org/fhir/valueset-observation-status.html · https://www.hl7.org/fhir/consent.html · https://www.hl7.org/fhir/valueset-medicationrequest-status.html · https://www.hl7.org/fhir/patient.html · https://www.hl7.org/fhir/valueset-link-type.html · https://www.hl7.org/fhir/auditevent.html · https://www.hl7.org/fhir/coverage.html · https://www.hl7.org/fhir/claimresponse.html · https://www.hl7.org/fhir/security-labels.html
- HIPAA (hhs.gov) retried 2026-11-19: HTTP 403 — still Unknown
- Reference register for every row of this pack (status VERIFIED / PARTIAL / UNKNOWN, access limitations, date 2026-11-19): `qa-system/domains/SOURCES.md`

## 6. Pack files
| File | Read by | Used for |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Term suggestions for `knowledge/_glossary.md` — reviewed by the project people |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Industry risks ⇒ `OQ` questions, viewpoint candidates |
| `rule-patterns.md` | `missing-rule-06w` | Rule families that are often missing ⇒ `MR` questions, never a `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Topics for detecting conflicts between features |
| `datagen.json` | `npm run data:gen` | Fake generated data types / enum lists |
| `units.json` | `npm run lint` (origin of numbers) | Units of measure (additions only) |
| `coverage-matrix.md` | Pack authors and reviewers; not read by tools | Capability × risk × ISO 25010 × question × reference audit, with open gaps for a domain expert |
