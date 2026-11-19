---
name: missing-rule-06w
description: >
  Scans the closed 06W matrix (each BR/FD/AF × W1–W6) to find rule gaps, and turns every OQ from Stage 1
  into an MR-xx question for the BA/PO. It is the ASK gate of the pipeline.
---

# Skill: missing-rule-06w

> Complies with `qa-system/core/QA_STANDARD.md` (verdict & ASK gate §1 · guards §2 · FACT §3 · **06W §4** ·
> knowledge §8 · question table §9.4 · sources §10 · scales §11).
>
> The output format block, the cell values (`Nguồn: …`, `Không áp dụng`, `MR-xx`) and the text line `Không có`
> stay in Vietnamese: `npm run scaffold`, `npm run lint` and `npm run gate` parse them. Copy them verbatim.

## Purpose
Turn every place the sources **have not answered** into a closed question `MR-xx` for the BA/PO. Same documents + same knowledge
⇒ same set of questions, because the scan is a closed matrix (QA_STANDARD §4), not a free search.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — the list of `BR`, `FD`, `AF` (the matrix rows) and `OQ`.
- `INPUT/<task-slug>/` **or** `OUTPUT/<task-slug>/00_knowledge_digest.md` — to check that a cell is really
  missing from the sources before concluding `Có kẽ hở` (gap found) (01 may have compressed away details).
- `OUTPUT/<task-slug>/01_conflict_warning.md` if present.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7 (questions already asked), §8 (confirmed decisions), §9.
- Only when `knowledge/_sut.json` has a `domain`: the `rule-patterns` files listed by `npm run domain` (QA_STANDARD §10.3).
  `_sut.json` has no `domain` ⇒ skip step 2b.

## MUST NOT (specific to this skill)
- Produce test ideas / test cases / test data / expected results.
- Look for gaps outside the matrix. Once the matrix is scanned, stop.
- Ask again about something the sources or knowledge (§3 Confirmed, §8, §9) already answer.
- Write vague open questions ("how does the system handle it?"). A question must be answerable with Yes/No,
  a number, or a choice between options.
- Treat the `Phương án gợi ý` (suggested option) as a rule, or use it as an expected result in a later stage.
- Fill in `Phản hồi chính thức`, `Người trả lời`, `Ngày` yourself, or change `Trạng thái`, before the user has relayed the BA/PO's words.

## Steps
1. **Build the matrix with the tool**, never by hand: `npm run scaffold -- <task-slug> 02`. The tool writes the frame of `02_missing_rule_report.md` — one
   row per `BR`/`FD`/`AF` of 01 in a fixed order; the not-applicable cells (table §4) are pre-filled with `Không áp dụng` and **must not be edited**;
   the cells needing judgement are `<điền>` (to be filled) (W names and focus per §4). An existing file is never overwritten (use `--stdout` to view the frame).
2. **Score each cell** with exactly one result:
   - `Nguồn: <mã hoặc file §mục>` — the sources/knowledge already answer it (re-check in `INPUT/` or the digest).
   - `Không áp dụng` — this W dimension is not relevant to the object (e.g. `W5` for a field that does not depend on an actor).
   - `MR-xx` — there is a gap. One gap shared by several cells ⇒ the same code.
   A field missing min/max/length ⇒ one `MR` in the `W1` cell of that `FD` (the boundary chain belongs to §6; do not ask about each boundary point).
2b. **Industry rule families** (only when a `domain` is set) — use `rule-patterns` as a prompt when scoring the cell of the matching W group
   of the pack row; do **not** add rows or columns outside the matrix. If the sources have not answered that cell ⇒ `MR-xx`, and `Nguồn phát hiện` (where found)
   additionally records `[DOMAIN] <pack-id>/rule-patterns.md#<section>`. A rule family **never** becomes a `BR`, and is never used
   as the `Phương án gợi ý`.
3. **Reconcile the OQs** — each `OQ-xx` from 01 ⇒ exactly one `MR-xx` (it may be an MR already produced in step 2), or
   `Nguồn: <...>` if the sources/knowledge actually already answer it.
4. **Assign codes** — a gap identical to a question already in knowledge §7 ⇒ **keep the old code** and copy its current status/response.
   A new gap ⇒ write the temporary code `MR-?` then run `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/02_missing_rule_report.md`
   (the same label `MR-?a` ⇒ the same number). Never count yourself, never renumber from `MR-01`.
5. **Detail** each new `MR` (format §2) and record it in the question table §3.
6. **Verdict** (below), FACT Self-Audit, write the file and knowledge.

### MR classification (one of 5 groups)
`Boundary & Edge` · `State & Lifecycle` · `Exception & Error Handling` · `Dependency & Side-Effect` · `Implicit & Authorization`.

## Verdict
- `ASK` — at least one `MR` still has status `New` or `TREO` (pending) (§9.3). The ASK gate closes per QA_STANDARD §1.
- `PASS` — no `MR`, or every `MR` is `Confirmed`/`Rejected`.
- `FIX` — the matrix is missing rows/cells, or OQs are not reconciled ⇒ fix it yourself and re-run.

## Output format
Write `OUTPUT/<task-slug>/02_missing_rule_report.md`:

````markdown
# Missing Rule Report · <task-slug>
Owner: qa-system/qa-analyst/skills/missing-rule-06w.md · Nguồn: 01_requirement_risk_summary.md, <INPUT/digest đã đối chiếu>, knowledge/features/<feature-slug>.md · Verdict: ASK

## 1. MA TRẬN 06W
| Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 |
|---|---|---|---|---|---|---|
| BR-01 | Nguồn: 02_ba/<file> §2.1 | MR-03 | Không áp dụng | MR-04 | Không áp dụng | Nguồn: BR-02 |
| FD-01 | MR-05 | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng |

## 2. CHI TIẾT MISSING RULES
### MR-03 — <tên ngắn>
- Căn cứ: <mã đối tượng × W, trích vị trí trong nguồn — hoặc "nguồn không đề cập">
- W: W2 — What if state lạ
- Nhóm: State & Lifecycle
- Kẽ hở: <tình huống nguồn chưa nói>
- Rủi ro nếu bỏ qua: <hệ quả, chỉ từ điều tài liệu mô tả>
- Ưu tiên: High

## 3. BẢNG CÂU HỎI
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-03 | <kẽ hở> | W2 | BR-01 × W2 | A) <…> · B) <…> | <câu hỏi đóng> |  |  |  | New |

## 4. ĐỐI CHIẾU OQ
| OQ | Xử lý |
|---|---|
| OQ-01 | MR-03 |
| OQ-02 | Nguồn: 05_communication/<file> §<mục> |
````

(Section §2 fields: basis · W · group · gap · risk if ignored · priority. §4 = OQ reconciliation.)

No MR ⇒ §2 and §3 contain the text line `Không có` (none) (no table). No OQ ⇒ §4 contains the text line `Không có`.

## Writing knowledge
Per QA_STANDARD §8: skill `02` only **adds** new rows to §7 of `knowledge/features/<feature-slug>.md`,
with status `New`, in exactly the §9.4 table. Never delete or modify old rows, never write §8.

When the user relays the BA/PO's words: copy them **verbatim** into `Phản hồi chính thức` / `Người trả lời` / `Ngày`
/ `Trạng thái` (official response / answered by / date / status) in §3 of the report, then run:

```bash
npm run knowledge:sync -- <task-slug> --write
npm run gate <task-slug>
```

Paste the real result. Every MR is `Confirmed`/`Rejected` ⇒ change the 02 meta line to `Verdict: PASS`
(do not re-scan the old rows), then re-run Stage `01` to promote the confirmed MRs into `BR`/`FD`/`AF` (source `knowledge §8 #n`)
and update the §9 constants. **New objects from 01 must have a matrix row** (lint checks this): get the frame row with
`npm run scaffold -- <task-slug> 02 --stdout`, insert it into §1 and score it as in step 2 — a cell already settled by the answer records
`Nguồn: knowledge §8 #n`. A cell with a new gap ⇒ an `MR` with the next number, and the verdict goes back to `ASK` (a converging loop: each round only asks about the new part).

The answer must be usable **verbatim**. An answer that still contains variables or templates (`<tên trường>`, `X ký tự`,
"it depends") is not a concrete value yet: keep the status `TREO`, and write a follow-up question stating exactly which text/number is needed.
An answer that lives only in `OUTPUT/` is lost on the next run — that is why the sync step is mandatory.

## Acceptance gates (Quality Gates)
- [ ] The matrix contains every `BR`/`FD`/`AF` of 01; every cell has exactly one valid result.
- [ ] Every `OQ` of 01 has a row in §4.
- [ ] Every `MR` in the matrix has a `###` entry in §2 and a row in §3; the question is a closed question.
- [ ] No MR that duplicates a question already in knowledge §7 carries a new code.
- [ ] The verdict matches the MR statuses (§9.3); `npm run gate <slug>` has been run and its real result pasted.
