---
name: knowledge-digest
description: >
  Distils a large body of documents (tens to hundreds of files in INPUT/<slug>/) in context-sized
  batches: each document yields a rule card with quoted sources, which are then merged into 00_knowledge_digest.md
  for skill 01 to read instead of the raw documents. A re-run only processes new or changed documents.
---

# Skill: knowledge-digest

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards §2 · FACT §3 · knowledge rules §8 · sources & precedence §10).
>
> The output format blocks, the `### DOC:` / `Phiên bản:` lines and the `Loại` (type) values stay in Vietnamese:
> `npm run knowledge:digest` reads the stamp lines back, and skill `01` copies the rest. Copy them verbatim.

## Purpose
Skill `requirement-risk-summary` reads all the raw documents in one pass. That is fine for a few files; with 100–200
files it overflows the context or the agent only skims and misses rules. This skill splits the work into two phases:

- **Extract (per batch):** read exactly the documents in one batch; each document yields a short card of rules,
  constants, flows and ambiguities. Every line records the source location **and the verbatim quote** — skill `01` copies
  this passage into its `Trích nguyên văn` (verbatim quote) column, and `npm run lint` searches for it again in `INPUT/`.
- **Merge:** read every card still in force and consolidate them into `00_knowledge_digest.md`: merge duplicate points and expose
  conflicts between documents.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/00_digest_plan.md` — produced by `npm run knowledge:digest <slug>`: which batches need to run,
  which documents are in each batch, which old cards must be dropped.
- The documents listed in the batch being run, **only those documents** (the tool already excludes `_superseded/` — old versions never enter a batch).
- `OUTPUT/<task-slug>/knowledge_digest/batch_*.md` — the cards from previous runs (Merge phase).
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` if present.
- Merge phase, only when `knowledge/_sut.json` has a `domain`: the `vocab` files listed by `npm run domain` (QA_STANDARD §10.3).
  `_sut.json` has no `domain` ⇒ skip step 9 and section §5.

> No `00_digest_plan.md` yet → run `npm run knowledge:digest <slug>` first. Never split batches by eye.
> A document that is too large has already been cut by heading by the tool: the batch note reads `phần k/n: dòng a–b (§ heading)` (part k/n: lines a–b) —
> read exactly that line range, do not re-cut it yourself.

## MUST NOT (specific to this skill)
- **Never write `knowledge/`.** Per §8 only skills `01` and `02` may write it. This skill hands the digest over to `01`.
- Never read documents outside the batch being run in the Extract phase. Loading more defeats exactly what this skill exists to avoid.
- Never write a line without a source location and a verbatim quote. Cannot find the section/passage → do not write it.
- Never paraphrase in the `Trích nguyên văn` column — copy word for word, including the source's spelling mistakes.
- Never treat the `## Annotations / Pending changes` section (comments, tracked changes, "DRAFT") as a rule —
  record `Loại` = `Chưa chốt` (not confirmed). A tracked change in the body appears as `{--old--}{++new++}`: record **both** values,
  `Loại` = `Chưa chốt` — do not pick either value.
- Never arbitrate by feel when two documents disagree — only per QA_STANDARD §10.2 (step 7).
- Never score risks, never produce viewpoints or test ideas. That is the work of `01`→`04`.

## Steps

### Extract phase — repeat for each batch in `00_digest_plan.md` §2
1. Read the documents of the batch. A document noted *"quá ngân sách, tách theo mục"* (over budget, split by section) → read it one
   major section at a time, never load the whole file at once.
2. Each document yields **one card block**, opened by a stamp line that copies the path and sha256 **verbatim**
   from the plan. The tool reads this line back to know the document is done:
   `### DOC: <đường dẫn> · sha256:<12 ký tự>`
   Right below, a line `Phiên bản: <version/ngày ghi trong tài liệu, hoặc [CHƯA CÓ TRONG TÀI LIỆU]>` (the version/date written in the document) —
   used to decide which version is newer in the Merge phase.
3. A document with no business content (off-topic meeting minutes, a blank image…) still gets a card block with the single line
   `Không có nội dung nghiệp vụ` (no business content), so that it is not put into a batch again next time.
4. Write `OUTPUT/<task-slug>/knowledge_digest/<batch name>.md`, using exactly the batch name in the plan.

### Merge phase — once, after every batch is done
5. Read every `batch_*.md`. **Drop** the card blocks listed in `00_digest_plan.md` §3 (old versions of changed
   documents, or removed documents).
6. Consolidate: the same point from several documents → one line, with the source column listing all the documents.
7. Same topic with different values (thresholds, messages, permissions…) → put it in §3 Conflicts and apply
   QA_STANDARD §10.2: resolvable (different priority level, or same level with a clear version/date) ⇒ record
   the winner + reason; not resolvable ⇒ `Chưa phân xử` (unresolved). Skill `01` turns each `Chưa phân xử` line into an `OQ`.
8. The cards are too large in total to read in one pass → merge per folder (`01_business`…`05_communication`) first,
   then merge the folder versions.
9. **Industry terminology** (only when a `domain` is set) — a `vocab` term that **does appear** in the cards ⇒ one §5 line,
   with where it appears. This is a hint for the project people filling in `knowledge/_glossary.md`, not a rule; terms
   that do not appear in the documents are not recorded.

## Output format

Cards of one batch — `OUTPUT/<task-slug>/knowledge_digest/batch_NN.md`:

````markdown
# THẺ CHƯNG CẤT · <task-slug> · batch_NN
Owner: qa-system/qa-analyst/skills/knowledge-digest.md · Nguồn: 00_digest_plan.md §2 batch_NN · Verdict: PASS

### DOC: INPUT/<slug>/02_ba/<file>.md · sha256:<12 ký tự>
Phiên bản: <version/ngày, hoặc [CHƯA CÓ TRONG TÀI LIỆU]>
| # | Loại | Nội dung | Vị trí nguồn | Trích nguyên văn |
|---|---|---|---|---|
| 1 | Quy tắc | <một câu tóm tắt> | §<mục> | <đoạn chép đúng từng chữ> |
| 2 | Mơ hồ | <điều tài liệu không nói rõ> | §<mục> | <đoạn liên quan> |
````

`Loại` ∈ `Quy tắc` · `Field` · `Hằng số` · `Luồng` · `Tác nhân` · `Ngoài phạm vi` · `Mơ hồ` · `Chưa chốt`
(rule · field · constant · flow · actor · out of scope · ambiguous · not confirmed).
`Ngoài phạm vi` is used only when the document **explicitly states** that something is not done.

Merged version — `OUTPUT/<task-slug>/00_knowledge_digest.md`:

````markdown
# BẢN CHƯNG CẤT TRI THỨC · <task-slug>
Owner: qa-system/qa-analyst/skills/knowledge-digest.md · Nguồn: knowledge_digest/batch_01…batch_NN · Verdict: <PASS/ASK>

## 1. Phạm vi
| Chỉ số | Giá trị |
|---|---|
| Tài liệu đã chưng cất | <số> |
| Lô đã đọc | batch_01 → batch_NN |
| Khối thẻ cũ đã bỏ | <số, hoặc 0> |

## 2. Quy tắc & hằng số hợp nhất
| ID | Loại | Nội dung | Nguồn | Trích nguyên văn |
|---|---|---|---|---|
| D-01 | Quy tắc | <một câu> | `02_ba/<file>` §<mục> · `01_business/<file>` §<mục> | <đoạn chép đúng từng chữ, từ nguồn đầu tiên> |

## 3. Mâu thuẫn giữa tài liệu
| ID | Chủ đề | Tài liệu A nói | Tài liệu B nói | Phân xử (QA_STANDARD §10.2) |
|---|---|---|---|---|
| X-01 | <chủ đề> | <giá trị> — `<file>` <mục> | <giá trị> — `<file>` <mục> | <Bên thắng + lý do, hoặc `Chưa phân xử`> |

## 4. Điểm mơ hồ & chưa chốt chuyển cho skill 01
| ID | Điểm mơ hồ | Nguồn |
|---|---|---|
| A-01 | <câu> | `<file>` <mục> |

## 5. Thuật ngữ ngành gặp trong tài liệu (chỉ khi có `domain`)
| Thuật ngữ | Mục pack | Xuất hiện ở |
|---|---|---|
| <thuật ngữ> | `[DOMAIN] <pack-id>/vocab.md#<mục>` | `<file>` <mục> |
````

(Sections: 1 scope · 2 merged rules & constants · 3 conflicts between documents · 4 ambiguities & unconfirmed points for skill 01 · 5 industry terms found in the documents.)

An empty section contains `Không có` (none); never leave an empty table. **Verdict**: `PASS` when every batch has been fully merged and every line has a source +
quote; `FIX` when something is still missing. Conflicts do **not** turn the digest into `ASK` — they carry on as `OQ` in 01 and then `MR` in 02.

## Handover
- `00_knowledge_digest.md` → `requirement-risk-summary` reads it instead of the raw documents, keeping the source and verbatim-quote columns as they are.
- §3 lines marked `Chưa phân xử` + §4 → `requirement-risk-summary` records them as `OQ-xx`.

## Acceptance gates (Quality Gates)
- [ ] Every document in the batches of `00_digest_plan.md` §2 has exactly one `### DOC:` line with a sha256 matching the plan. Re-running `npm run knowledge:digest <slug>` must report `0` batches.
- [ ] Every card line and every merged line has a specific source location (file + section/table/paragraph) and a verbatim quote that really exists in the document.
- [ ] No card block listed in `00_digest_plan.md` §3 slips into the merged version.
- [ ] Conflicts are recorded in §3 with both sides and the arbitration column per §10.2.
- [ ] This skill made no change in `knowledge/`.
- [ ] The files are written exactly to `OUTPUT/<task-slug>/knowledge_digest/batch_NN.md` and `OUTPUT/<task-slug>/00_knowledge_digest.md`.
