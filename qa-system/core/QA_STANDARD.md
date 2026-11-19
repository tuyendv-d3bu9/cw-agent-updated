# QA STANDARD — Shared spine

> Every `AGENT.md` and `skills/*.md` under `qa-system/qa-*/` complies with this file.
> Shared constraints live ONLY here — skills and AGENT.md files **point to** them, they do not copy them.
> Frameworks: RCTFC (Role-Context-Task-Format-Constraint) · FACT (Factual-Accurate-Complete-Testable).
>
> **Root principle**: an agent may only **quote** (with a source) or **ask** (as a question for the BA/PO).
> It must not **invent** values, rules, messages or thresholds. If something is missing, say it is missing — saying so meets the standard.
>
> Vietnamese literals kept on purpose: labels, status words, column headers and cell values below
> (e.g. `[CHƯA CÓ TRONG TÀI LIỆU]`, `TREO`, `Phản hồi chính thức`, `Không áp dụng`) are read by the tools in
> `qa-system/tools/` — copy them **verbatim** into deliverables; English glosses are given in brackets only.

---

## 1. Verdict — PASS / FIX / ASK

| Verdict | When | How to handle | Pipeline state |
|---|---|---|---|
| **PASS** | Enough information and the checklist is met | Record as passed | Next stage opens |
| **FIX** | Enough information, but wrong format / trace / missing coverage that **can be fixed from the sources at hand** | Write the concrete fix | The agent fixes it immediately and re-runs |
| **ASK** | Business information is missing that only a person (BA/PO) can answer | Write the question in the §9.4 schema, state who is needed | **Stop the pipeline** — jumping to a later stage is forbidden |

`ASK` gate rules (the single definition — everywhere else only points here):

1. Stage 2 returns `ASK` ⇒ **do not** produce Stage 3→6 deliverables. Even if the user pushes *"just keep going"*
   the gate does not open: explain that test cases built on unconfirmed logic would have to guess, then list the pending questions.
2. The gate opens only when every question in knowledge §7 has status `Confirmed` or `Rejected` (§9.3)
   or has a decision in knowledge §8 with an approver and a date.
3. The gate is **enforced by machine**: before producing any deliverable from Stage 3 onwards, run `npm run gate <slug>`
   (exit `1` ⇒ stop). A missing `02` file or an unreadable verdict ⇒ the gate is **closed** (fail-closed).
   When the user pushes to continue, run the command and paste the real result — do not argue in the abstract.
4. The agent **never** fills in an answer, a `Confirmed` status, or a §8 decision on behalf of the BA/PO.

**Verdict of `coverage-review` (Stage 6)** — its own rule, with an end point:
- `PASS` — every item in the coverage matrix (BR, confirmed MR, AF, TI marked "Giữ" (keep)) has a test case and
  `npm run lint` is clean. The human decision part is still recorded in the Human-Final section and does not block the verdict.
- `FIX` — some items are not covered yet but the sources are **sufficient** to write the test cases.
- `ASK` — some items are not covered because information is **missing** (with questions per §9.4).

---

## 2. Shared guards — apply to every skill

1. **Factual** — draw conclusions only from valid sources (§10.1). Do not invent rules, values, error messages,
   response codes, thresholds or formats. General knowledge of "what this industry usually does" **is not a source**.
2. **No quotas** — never force a count ("≥5 questions", "≥X test cases", "≥1 NULL"). Quantity is a
   consequence of the sources, not a target.
3. **Labels when something is missing** — use exactly the label set of §2.1. An explicit label is always better than filling a gap.
4. **Traceability** — every item (rule, question, viewpoint, test idea, test case, data record) has a source
   column or tag per §9. If no source can be attached ⇒ the item is a question, not a fact.
5. **No scope creep** — do not do a later step's work (see each skill's "MUST NOT" section).
6. **Never overwrite sources** — do not modify `INPUT/` or another agent's deliverables.
7. **Never leave a table cell empty** — fill it with a §2.1 label.
8. **Out of Scope = explicit exclusion** — only what the source **explicitly states** is not done, with a quote
   of the source. Something the documents **do not mention** is a **question**, not out of scope.

### 2.1. Standard label set

The label strings are kept in Vietnamese because `npm run lint` matches them literally.

| Label | Use when | Example |
|---|---|---|
| `[CHƯA CÓ TRONG TÀI LIỆU]` (not in the documents) | A concrete value is needed (message text, number, error code, format) that the source does not have. If a question already exists, attach its code: `[CHƯA CÓ TRONG TÀI LIỆU – MR-03]` — the MR code must be a real question in 02 §3 or knowledge §7 (lint checks this) | Expected: `Hiển thị thông báo lỗi [CHƯA CÓ TRONG TÀI LIỆU – MR-03]` |
| `[GIẢ ĐỊNH]` (assumption) | An inference by the agent, with its reason. **Not** for inventing concrete values, and **forbidden** in value cells (Precondition, Test Steps, Test Data, Expected Result) — lint reports an error; there use `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` | `[GIẢ ĐỊNH] Field này không có vòng đời trạng thái vì tài liệu chỉ mô tả nhập liệu` |
| `[CONTEXT_MISSING]` | Business context is missing (users, load, revenue, SLA) | The Usage Context cell of skill 01 |
| `[ĐỀ XUẤT]` (proposal) | The agent proposes, awaiting human approval (Human-Final) | `[ĐỀ XUẤT] Automated` |
| `CHƯA COVER` / `CHƯA CÓ DATA` (not covered / no data yet) | A matrix cell with no test case / no data yet | Stage 6 matrix, Stage 12 |

---

## 3. FACT Self-Audit — run before releasing output

| | Criterion | Self-check question |
|---|---|---|
| **F** | Factual | Does every value/rule have a §10.1 source? Are the places without one labelled per §2.1? Is there any value that "sounds reasonable" but cannot be quoted? |
| **A** | Accurate | Is each statement unambiguous? Are codes/names/message texts taken **verbatim** from the source? |
| **C** | Complete | Are the structure and required fields complete? Is no business branch **present in the source** left out? |
| **T** | Testable | Does every item have a Pass/Fail criterion, or a label stating which part of the criterion is still missing? |

**Missing sources that are explicitly labelled ⇒ F and C still PASS.** Filling a gap with an invented value ⇒
F **FAILS** even if it looks complete. Fix any failing criterion before releasing.

---

## 4. The 06W technique

> The single definition of 06W. The codes `W1…W6` are used for tracing; the **names** must not change.

| # | Name (standard — do not change) | Focus of the check |
|---|---|---|
| **W1** | What if input lạ | Wrong format · too long · special characters · empty/null · upper/lower case · extra whitespace · outside the allowed range |
| **W2** | What if state lạ | Unprocessed state · missing precondition · session/permission changing midway · repeated action on an existing state |
| **W3** | What if data lạ | Edge-case baseline data · dirty data · conflicts between sources · rounding/type-casting rules |
| **W4** | What when timing | Expiry midway · concurrency · timeout · timezone · before–after ordering · re-validation at commit time |
| **W5** | Who else actor | Other actors in the same flow · permissions · dependency on modules/services/third parties · cross-data impact |
| **W6** | What happens after | Side effects · state changes · rollback/undo · implicit expectations about security and data integrity |

**How to scan — a closed matrix** (so the same documents yield the same set of questions):
scan **each object** (every `BR-xx`, every `FD-xx`, every `AF-xx`) × **W1→W6**. Each cell takes exactly one
result: `Có kẽ hở` (gap found ⇒ produces one `MR-xx`) · `Nguồn đã trả lời` (the source already answers it; record the source code) · `Không áp dụng` (not applicable).
Questions are produced only from `Có kẽ hở` cells. Once the matrix is scanned, **stop** — do not look for more outside the matrix.

**Applicability table** (fixed, so the number of cells needing judgement is not decided by the model). Cells outside the table default to `Không áp dụng` and
**must not be edited**; `npm run scaffold -- <slug> 02` builds the frame from this table.

| Object | W needing judgement | W fixed as `Không áp dụng` |
|---|---|---|
| `BR-xx` | W1 W2 W3 W4 W5 W6 | — |
| `FD-xx` | W1 W3 | W2 W4 W5 W6 (gaps about state/timing/actor/consequence belong to the related `BR`/`AF`) |
| `AF-xx` | W2 W6 | W1 W3 W4 W5 |

> The min/max boundary chain of a field belongs to §6; do not repeat it as a separate W question.

---

## 5. 3x3 risk matrix

**Risk Level = Likelihood × Impact**, each axis `HIGH / MEDIUM / LOW`.

| | Impact HIGH | Impact MEDIUM | Impact LOW |
|---|---|---|---|
| **Likelihood HIGH** | CRITICAL | HIGH | MEDIUM |
| **Likelihood MEDIUM** | HIGH | MEDIUM | LOW |
| **Likelihood LOW** | MEDIUM | LOW | LOW |

- **Likelihood** is scored from the documents themselves: number of combined conditions, number of branches, number of related `MR` gaps.
- **Impact** is scored from the impact **the documents describe** (money lost, wrong data, main flow blocked…).
- Business context (revenue, scale, SLA) is used only when it is in the sources or declared in `_project.md`.
  If absent ⇒ still score from the documents, attach `[SEVERITY_CONFIDENCE_LOW]` + record the missing aspect as `[CONTEXT_MISSING]`.
  **Never** estimate revenue or usage figures.

---

## 6. Standard boundary chain (Boundary Completeness)

> The single definition — data skills and coverage-review use exactly this chain.

A field with a **value range (min/max)** → 7 points: `min-1` · `min` · `min+1` · a middle value ·
`max-1` · `max` · `max+1`.

A field with a **format / length rule** → empty · 1 character · exact length · over length · wrong format · special characters.

Plus Equivalence Partitions: valid · below range · above range · wrong format · empty/null · special characters.

**Build the boundary chain only when min/max/length is in the sources.** If not ⇒ do not set a threshold yourself:
write `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` and let Stage 2 ask.

---

## 7. Input / Output conventions

**Input** — each skill declares its "Đầu vào" (inputs). Besides that list, **every skill always loads**:
`knowledge/_project.md` and `knowledge/features/<slug>.md` (§8). A required artifact is missing → STOP.

**Output** — each skill writes **exactly one** file in `OUTPUT/<task-slug>/`. Line 2 of every file
is the **meta line**, written plain (no bold, no backticks), with exactly one verdict:

```md
# <Tên deliverable> · <task-slug>
Owner: <agent/skill> · Nguồn: <file đã đọc> · Verdict: PASS
```

(`Nguồn:` = sources read. Keep the meta line exactly in this shape — the tools parse it.)

Once the deliverable is written, tick `- [x]` for exactly that stage in `OUTPUT/<task-slug>/00_plan.md`.

Tools read the verdict only from this meta line (within the first 10 lines). Written any other way ⇒ the tool treats it as **unreadable**
and closes the gate. At the end of the file, if needed, add the `## FIX` and `## ASK` tables (headers kept verbatim):

```md
## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
```

(FIX columns: location · problem · proposed fix. ASK columns: location · what is needed · forward to whom.)

---

## 8. Knowledge — background knowledge

| Type | Content | Where | Who writes |
|---|---|---|---|
| **Registry / technique** | 06W · 3x3 risk · boundary chain · 8 viewpoints · labels · IDs · scales | This file (used by ≥2 skills) or inside the skill (used by 1 skill) | System maintainer |
| **Project knowledge** | Project-wide conventions | `knowledge/_project.md` | Humans |
| **Feature knowledge** | Facts about one feature | `knowledge/features/<slug>.md` (from `knowledge/_template.md`) | See the writing rule |

### Reading rule
- Every skill reads `_project.md` and `features/<slug>.md` before running.
- A line that still contains `<điền>` (to be filled) or an empty cell = **not declared** ⇒ treat as absent (`[CONTEXT_MISSING]`).
- Facts already in knowledge (§3 Confirmed, §8, §9 with a source) **win over** the agent's inference and
  are not asked again.
- Domain packs (`qa-system/domains/`, `knowledge/_domain.md`) are not project knowledge: see §10.3.

### Writing rule (one single rule)
| Knowledge section | Who writes | Condition |
|---|---|---|
| §1–§6, §9, §10 | skill `01` | Only facts with a §10.1 source |
| §7 (questions) | skill `02` | Add new rows with status `New`. Never delete old rows |
| The answer column of §7 + §8 | **Humans** (the BA/PO answers, the user relays it) — the agent only copies verbatim when the user provides the answer, then runs `npm run knowledge:sync -- <slug> --write` | Must have an approver + date |
| New rules arising from a confirmed MR | skill `01` on its next run → §3, assigned the next `BR` number, source = `knowledge §8 #n` | — |

Never delete old rows — change the `Trạng thái` (status). `OUTPUT/` is the result of one run; `knowledge/` is what accumulates.

---

## 9. Identifiers & shared schemas

> Tools (`gate`, `lint`, `knowledge:sync`, `readiness`, `merge`, `export`) read exactly these schemas
> through one shared module `qa-system/tools/lib/schema.js`. A skill that deviates from the schema ⇒ the tools cannot read it.

### 9.1. ID families

| Code | What it is | Assigned in | Notes |
|---|---|---|---|
| `BR-xx` | Business rule with a source | 01 | Source: documents, or `knowledge §8 #n` |
| `FD-xx` | Field & constraints (type, required, min/max, format, message text) | 01 | Input for 06W, the boundary chain, the data branch |
| `AF-xx` | Alternative / error flow present in the sources | 01 | |
| `OQ-xx` | Unclear point found while reading the documents | 01 | Not a gate. Every OQ must be turned by 02 into an MR or recorded as "nguồn đã trả lời" (source already answers it) |
| `MR-xx` | Formal question sent to the BA/PO (a gap) | 02 | **The only ID family the ASK gate tracks** |
| `RK-xx` | Risk | 01 | 03 inherits them, and only assigns new numbers for risks arising from MRs |
| `VP-01…VP-08` | Viewpoint registry | Fixed (table §9.2) | Outside the registry: `VP-9x` + `[GIẢ ĐỊNH]` |
| `TI-xx` | Test idea | 04 | |
| `<MODULE>-NNN` | Test case, e.g. `AUTH-001` | 05 | `MODULE` is 2–6 uppercase characters taken from `_project.md` §1 |

**Stable across runs**: IDs already in knowledge **stay unchanged**. New IDs take the **next number**
after the highest existing one (in knowledge and the task's OUTPUT). Never renumber from 01.
At least 2 digits (`BR-01`, `MR-12`).

### 9.2. Viewpoint registry (fixed codes)
`VP-01` Happy Path · `VP-02` Negative · `VP-03` Boundary · `VP-04` Security · `VP-05` UX/Usability ·
`VP-06` Performance · `VP-07` Accessibility · `VP-08` Integration.

### 9.3. Question statuses

| Standard | Also accepted by the tools | Meaning | Gate |
|---|---|---|---|
| `New` | Mới, Chờ trả lời | Not asked yet / no answer yet | Closed |
| `TREO` | Pending, Treo | Asked, the BA has not confirmed yet | Closed |
| `Confirmed` | Đã xác nhận, Đã chốt | The BA/PO answered; the `Phản hồi chính thức` (official response) cell has content | Open |
| `Rejected` | Loại, Không xử lý | The BA/PO decided no action is needed | Open |

### 9.4. Question table (shared by 02 §3 and knowledge §7)

```md
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-01 | ... | W2 | BR-03 × W2 | ... | ... |  |  |  | New |
```

(Columns, in English: ID · gap · 06W group · where found · suggested option (not yet a rule) · question for BA/PO ·
official response · answered by · date · status. The header row must stay in Vietnamese exactly as above.)

Tools read columns **by header name**, not by position. Required: `ID`, `Câu hỏi cho BA/PO`,
`Phản hồi chính thức`, `Trạng thái`. The "Phương án gợi ý" (suggested option) exists only to let the BA answer quickly; it **becomes a rule only**
when the BA picks it and the answer is recorded in `Phản hồi chính thức`.

### 9.5. Decision table (knowledge §8)
```md
| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
```
(Columns: related code · question · official decision · approver · date decided.)
Missing `Người phê duyệt` (approver) or `Ngày chốt` (date decided) ⇒ the tool treats it as not confirmed.

### 9.6. BR and FD tables (01 §3, §3b) — with verbatim quotes
```md
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
```
(BR columns: condition · behaviour / result · source (file §section) · verbatim quote. FD columns: field · type ·
required · constraint (min/max/format) · message when invalid · source (file §section) · verbatim quote.)

`Trích nguyên văn` (verbatim quote) is a passage copied **word for word** from a source file in `INPUT/<slug>/`.
`npm run lint` searches for this passage in `INPUT/`; not found ⇒ error. If the source is knowledge §8 ⇒ write
`knowledge §8 #n` and leave the quote empty. A cell not present in the source ⇒ a §2.1 label.

---

## 10. Valid sources & order of precedence

### 10.1. Valid sources
1. `INPUT/<slug>/` — the 5 folders that went through intake (or `00_knowledge_digest.md`, which keeps the source column).
2. `knowledge/features/<slug>.md` — §3 Confirmed, §8 with an approver, §9 with a source.
3. `knowledge/_project.md` — only declared lines (no `<điền>` left).
4. Deliverables of earlier stages **in the same task** (they already trace back to 1–3).

Not sources: general industry knowledge, domain packs (§10.3), examples in skills/templates, output
of other tasks, output from other people supplied as a model.

### 10.2. When sources differ
| Priority | Source | Wins on |
|---|---|---|
| 1 | knowledge §8 (with approver + date) | Everything |
| 2 | `05_communication/` — dated CRs, Q&A, minutes | What it addresses, if newer than the spec |
| 3 | `02_ba/` — the version with the latest version number/date | Business logic |
| 4 | `03_dev/` | Technical constraints of fields, APIs, response codes |
| 5 | `04_design/` | Layout, text displayed on screen |
| 6 | `01_business/` | Goals, context |

- Cannot tell which version is newer, or two sources at the same level conflict ⇒ **produce an MR**, do not choose yourself.
- The `## Annotations / Pending changes` section extracted by intake (comments, tracked changes, "DRAFT") **is not yet
  fact** ⇒ produce an MR for the BA to confirm.

### 10.3. Domain packs — a checklist, not a source
A domain pack (`qa-system/domains/<id>/`, selected in `knowledge/_sut.json` → `domain`; project additions in
`knowledge/_domain.md`) is a **checklist**. If the project has not selected a domain ⇒ skip every step that uses a pack.
- A pack item may only become: a question (`OQ` → `MR`), a viewpoint candidate (chosen only once a §10.1 source code
  exists), or vocabulary / a data type for generating test data.
- Tag it with the provenance label `[DOMAIN] <id>/<file>#<section>`. `[DOMAIN]` is not a §2.1 gap-filling label, and is **never**
  the `Nguồn` (source) of a `BR`/`FD`/`AF` — `npm run lint` reports an error. `BR`/`FD` are always quoted from a §10.1 source.

---

## 11. Shared scales

| Quantity | Valid values | Notes |
|---|---|---|
| Likelihood / Impact | `HIGH` / `MEDIUM` / `LOW` | §5 |
| Risk Level | `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` | §5 |
| Severity (bug, risk) | `Critical` / `Major` / `Minor` / `Trivial` | |
| MR question priority | `High` / `Medium` / `Low` | |
| Test case Priority | `High` / `Medium` / `Low` | **Fixed mapping** from the highest Risk Level of the related RKs: CRITICAL/HIGH → `High`, MEDIUM → `Medium`, LOW → `Low`. No RK ⇒ `Medium` + `[ĐỀ XUẤT]`. The owner may change it (Human-Final) |
| Automated/Manual | Tag `Manual` by default; `[ĐỀ XUẤT] Automated` when the step can be checked entirely through UI/API without human judgement | Human-Final |
| Date | `YYYY-MM-DD` unless `_project.md` §2 declares otherwise | |
