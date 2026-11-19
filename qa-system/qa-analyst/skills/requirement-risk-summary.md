---
name: requirement-risk-summary
description: >
  Extracts the requirement documents in INPUT/<slug>/ (5 folders) into a 10-part report with quoted sources:
  Business Rules, Fields & constraints, alternate flows, open points (OQ) and the risk matrix. It is the first
  gateway of the QA pipeline.
---

# Skill: requirement-risk-summary

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · FACT §3 · risk §5 · knowledge §8 ·
> IDs & schemas §9 · sources & precedence §10 · scales §11). This skill **quotes**; it does not invent.
>
> The output format block below is kept in Vietnamese on purpose: its headings, column headers and
> labels are parsed by `npm run lint` / `npm run gate` / `npm run boundary`. Copy it verbatim.

## Purpose
Turn the source documents into `01_requirement_risk_summary.md`: every rule, field and alternate flow has
a source + a verbatim quote; anything unclear becomes `OQ-xx` for Stage 2 to handle. This is the input of every later stage.

## Inputs (Đầu vào)
- `INPUT/<task-slug>/` — all 5 folders (table below). An empty folder is recorded, not a reason to stop — except `02_ba/`.
  **Do not read** `<folder>/_superseded/` (replaced versions) and never quote from it.
- **Or** `OUTPUT/<task-slug>/00_knowledge_digest.md` if present (skill `knowledge-digest`). The digest keeps
  the source + the original verbatim quote for each line; reopen the original document when a line needs checking.
- `OUTPUT/<task-slug>/01_conflict_warning.md` if present (`qa-system/tools/knowledge/conflict-detector.js`).
- `OUTPUT/<task-slug>/jira_defects_summary.md` if present — used only to score Likelihood.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (QA_STANDARD §7, §8).
- Only when `knowledge/_sut.json` has a `domain`: the `risks` files listed by `npm run domain` — a checklist, not a
  source (QA_STANDARD §10.3). `_sut.json` has no `domain` ⇒ skip the pack part of step 7.

> `02_ba/` missing and no digest → STOP, report that the business documents are missing (verdict `ASK`).

### Folder → what to take
| Folder | What to take | Written to section |
|---|---|---|
| `01_business/` | Goals, context, users, business figures **that are written down** | §1, §8, §9 |
| `02_ba/` | Rules, main flow, alternate flows, actors, explicit exclusions | §2–§6 |
| `03_dev/` | Field type, length, format, required-ness; API response codes | §3b, §5 |
| `04_design/` | On-screen fields, labels, displayed message text | §3b (`Thông báo khi sai`), §5 |
| `05_communication/` | Dated CRs, Q&A, minutes — they override what they address if newer than the spec | §3, §3b, §5, §7 |

When folders disagree: apply **QA_STANDARD §10.2**. Cannot tell which version wins ⇒ record an `OQ`, do not choose yourself.
The `## Annotations / Pending changes` section (comments, tracked changes, "DRAFT") **is not yet fact** ⇒ one `OQ` per item.

## MUST NOT (specific to this skill)
- Produce 06W questions, viewpoints, test ideas or test cases — that is the work of `02`→`05`.
- Record a rule/field/message that cannot be quoted verbatim. Cannot be quoted ⇒ it is an `OQ`, not a `BR`.
- Split a rule with combined conditions (AND/OR, "unless…" exceptions) into several rows in a way that loses the condition.
  One `BR` = one complete **combination of conditions → behaviour**, exactly as the source writes it.
- Put into Out of Scope something the documents **do not mention** (QA_STANDARD §2 rule 8).
- Estimate revenue, usage or SLA figures (QA_STANDARD §5).
- Stop the pipeline because of an `OQ` — the gate is at Stage 2, not here.

## Identifiers
- **Never count numbers yourself.** Write temporary codes in the order you read the sources (`BR-?`, `FD-?`, `AF-?`, `OQ-?`, `RK-?`; the same label such as `BR-?a` ⇒ the same number), write the file, then run `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/01_requirement_risk_summary.md`. The tool assigns the real numbers, continuing from the existing ones.
- A rule/field already in knowledge §3/§3b (same source, same content) ⇒ **keep the old code**. New ⇒ the next number.
- A confirmed MR in knowledge §8 that produces a new rule ⇒ assign the next `BR` number, `Nguồn` (source) = `knowledge §8 #n`, leave `Trích nguyên văn` (verbatim quote) empty.
- An old `BR` in knowledge whose quote can no longer be found in the current `INPUT/` ⇒ keep the code and add an `OQ`
  "Rule `BR-xx` is no longer in the current documents — is it still in force?".

## Steps
| # | Step | Requirement |
|---|---|---|
| 0 | Load sources | Read knowledge, then each folder per the table above. Record the list of files read in the meta line |
| 1 | Feature Overview | 1–2 sentences, with source |
| 2 | Actor & Role | Only actors present in the sources, with source |
| 3 | Business Rules | Table §9.6, every row has a word-for-word `Trích nguyên văn` |
| 3b | Fields & constraints | Table §9.6. A cell not present in the source ⇒ `[CHƯA CÓ TRONG TÀI LIỆU]`. Fill `Thông báo khi sai` (message when invalid) only when the source has the verbatim message text |
| 4 | Happy Path | The steps present in the sources, with source |
| 5 | Alternate Flows | Alternate / error flows **present in the sources**, with the verbatim response if any |
| 6 | Out of Scope | Only explicit exclusions, with a quote. None ⇒ do not build the table; write the text line `Không có loại trừ tường minh` (no explicit exclusions) |
| 7 | Open points | `OQ-xx` from: ambiguities, §10.2 conflicts that cannot be resolved, Annotations, `01_conflict_warning.md`, old BRs that lost their source, and (when a `domain` is set) `risks` items that the documents **do touch** (the pack's "Signal that a feature touches it" column matches an object/behaviour in the sources) but **do not say** how to handle — `Vị trí trong nguồn` (location in source) records `[DOMAIN] <pack-id>/risks.md#<section>` plus the file §section where the feature touches it. A pack item never becomes a `BR`/`RK`. No quota; may be empty |
| 8 | Business Criticality | Quoted from `01_business/` or `_project.md` (declared lines). None ⇒ `[CONTEXT_MISSING]` |
| 9 | Missing Risk Context | 5 aspects (table below): what is there / what is missing, with source |
| 10 | Risk Analysis | QA_STANDARD §5 matrix. `Nguồn` = the related `BR`/`FD`/`AF`/`OQ` codes |
| 11 | FACT Self-Audit | QA_STANDARD §3, then write the file + knowledge |

### Step 9 — 5 aspects
`User` (user groups) · `Usage` (frequency, load, peaks) · `Financial` (transaction value) ·
`Operational` (operations, SLA) · `Criticality` (the feature's role). Missing ⇒ `[CONTEXT_MISSING]`.

### Step 10 — scoring risk
- Likelihood: from the number of combined conditions, number of branches, number of related `OQ`s, defect history in `jira_defects_summary.md`.
- Impact: from the impact **the documents describe**. Severity on the §11 scale (`Critical`/`Major`/`Minor`/`Trivial`).
- Context in §8/§9 missing ⇒ still score, `Cờ tin cậy` (confidence flag) = `SEVERITY_CONFIDENCE_LOW`; complete ⇒ `SEVERITY_CONFIDENCE_HIGH`.

## Verdict
- `PASS` — all 10 parts in the correct format. `OQ` does **not** block (Stage 2 handles it).
- `FIX` — wrong format / missing quotes that can be fixed from the sources at hand ⇒ fix it yourself and re-run.
- `ASK` — only when there are no business documents to read (`02_ba/` missing and no digest).

## Output format
Write `OUTPUT/<task-slug>/01_requirement_risk_summary.md`, in exactly this order of 10 parts:

````markdown
# Requirement & Risk Summary · <task-slug>
Owner: qa-system/qa-analyst/skills/requirement-risk-summary.md · Nguồn: <các file đã đọc> · Verdict: PASS

## 1. FEATURE OVERVIEW
<1–2 câu> — Nguồn: <file §mục>

## 2. ACTOR & USER ROLE
| Actor | Vai trò / quyền hạn | Nguồn (file §mục) |
|---|---|---|

## 3. BUSINESS RULES
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| BR-01 | <điều kiện đầy đủ, giữ AND/OR> | <hành vi> | 02_ba/<file> §<mục> | <đoạn chép đúng từng chữ> |

## 3b. FIELD & RÀNG BUỘC
| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | <tên field> | <kiểu> | <Có/Không/[CHƯA CÓ TRONG TÀI LIỆU]> | <ràng buộc hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | <nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | 03_dev/<file> §<mục> | <đoạn chép đúng từng chữ> |

## 4. HAPPY PATH
1. <bước> — Nguồn: <file §mục>

## 5. ALTERNATE FLOWS
| ID | Tình huống | Hệ thống phản hồi | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| AF-01 | <tình huống> | <nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU]> | <file §mục> | <đoạn chép đúng từng chữ> |

## 6. OUT OF SCOPE
| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|

## 7. ĐIỂM CHƯA RÕ
| ID | Điểm chưa rõ | Vị trí trong nguồn |
|---|---|---|
| OQ-01 | <điều chưa rõ / mâu thuẫn / annotation> | <file §mục> |

## 8. BUSINESS CRITICALITY ASSESSMENT
- Bối cảnh ghi nhận: <trích kèm nguồn, hoặc [CONTEXT_MISSING]>

## 9. MISSING RISK CONTEXT INFORMATION
| Khía cạnh | Có trong nguồn | Thiếu | Ảnh hưởng tới chấm rủi ro |
|---|---|---|---|
| User | <trích + nguồn, hoặc Không> | <…, hoặc [CONTEXT_MISSING]> | <…> |
| Usage | | | |
| Financial | | | |
| Operational | | | |
| Criticality | | | |

## 10. RISK ANALYSIS
| ID | Rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Nguồn |
|---|---|---|---|---|---|---|---|
| RK-01 | <rủi ro> | HIGH | MEDIUM | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-01, OQ-02 |
````

A section with no rows ⇒ do **not** build a table; write a single text line `Không có` (none) right under the heading. A missing cell ⇒ a QA_STANDARD §2.1 label.
The `<…>` slots are placeholders to replace with quoted content; the cell values themselves may be in the source documents' language.

## Writing knowledge
Per QA_STANDARD §8 (skill `01` writes §1–§6, §9, §10 of `knowledge/features/<feature-slug>.md`; create it from
`knowledge/_template.md` if it does not exist). Write only facts with a §10.1 source. Do **not** write §7 or §8, and do not write `OQ`s.
Never delete old rows — a rule that lost its source stays as is; the report already has an `OQ` for it.

| Knowledge section | Taken from |
|---|---|
| §1 · §2 · §4 | parts 1, 2, 4 |
| §3 · §3b | parts 3, 3b (status `Confirmed` when there is a verbatim quote or the source `knowledge §8 #n`) |
| §5 · §6 | parts 5, 6 |
| §9 | constants present in the sources (min/max, format, unit) — with source |
| §10 | `BR`/`FD`/`AF` codes + source |

## Acceptance gates (Quality Gates)
- [ ] Lines 1–2 follow QA_STANDARD §7; all 10 parts present (plus §3b), with the headings and columns exactly as in the format.
- [ ] Every `BR`/`FD`/`AF` has a `Nguồn` and a `Trích nguyên văn` that can be found in `INPUT/` (or the source `knowledge §8 #n`) — checked by `npm run lint -- <slug>`.
- [ ] All 5 folders read; conflicts and Annotations turned into `OQ`s or resolved per §10.2 (stating which source wins).
- [ ] Codes stable against knowledge; new codes taken from `npm run ids`.
- [ ] Out of Scope contains only explicit exclusions.
- [ ] No business figure that cannot be quoted from a source.
