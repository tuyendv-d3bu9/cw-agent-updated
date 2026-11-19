---
name: test-idea-design
description: >
  Turns viewpoints into Test Ideas (each idea exactly 1 sentence, tied to a BR/FD/AF/MR source code) and filters
  them into Giữ / Bỏ / Chờ MR (keep / drop / waiting on MR) following a fixed order of precedence.
---

# Skill: test-idea-design

> Complies with `qa-system/core/QA_STANDARD.md` (ASK gate §1 · guards §2 · FACT §3 · boundary chain §6 ·
> knowledge §8 · IDs §9 · sources §10).
>
> The column names (`Kỹ thuật`, `Giữ/Bỏ`, `Lý do filter`), the values `Giữ` · `Bỏ` · `Chờ MR` and the
> `Lý do filter` templates stay in Vietnamese: `npm run lint` and `npm run readiness` read them. Copy them verbatim.

## Purpose
Produce **Test Ideas** — one sentence describing one condition to check, with a source code — and filter them by fixed rules so that
the same input yields the same set of ideas. The full *Test Case* is the job of `qa-system/qa-test-design`.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD`, `AF`, §6 Out of Scope, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` and their statuses.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — viewpoints, the code scope of each VP, the ownership convention.
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` — §7/§8 (confirmed BA answers).

> Before running: `npm run gate <task-slug>` must exit `0` (QA_STANDARD §1).

## MUST NOT (specific to this skill)
- Expand into a Test Case (Precondition, Steps, Test Data, Expected).
- Write an idea longer than one sentence, or an idea without a source code.
- Assign `State Transition` when the sources do not describe states; assign `Decision Table` to a single-condition rule.
- Mark an idea `Bỏ` (drop) because the source is ambiguous — that is `Chờ MR` (waiting on MR).
- Mark `Ngoài scope` (out of scope) when 01 §6 has no matching exclusion row.

## Techniques (column `Kỹ thuật`)
| Technique | Use when (basis in the sources) |
|---|---|
| `Use Case` | The main flow (01 §4) and the alternate `AF` flows |
| `EP` | A field/condition with discrete value groups |
| `BVA` | An `FD` with min/max/length in the sources — chain per QA_STANDARD §6 |
| `Decision Table` | A `BR` with 2 or more combined conditions (AND/OR) |
| `State Transition` | The sources describe states and transition conditions |
| `Error Guessing` | Historical defects (`jira_defects_summary.md`) or a confirmed `MR` about an abnormal situation |

## Filter rules — apply in order, stop at the first rule that holds
| # | Result | When | Column `Lý do filter` |
|---|---|---|---|
| 1 | `Bỏ` | Fully duplicates an idea already marked `Giữ` (same source code, same VP, same condition) | `Trùng lặp: TI-xx` |
| 2 | `Bỏ` | Hits exactly the content of a row in 01 §6 | `Ngoài scope: 01 §6 "<nội dung loại trừ>"` |
| 3 | `Chờ MR` | The behaviour to check depends on information not yet available / an `MR` not yet `Confirmed` | `Chờ MR: MR-xx` |
| 4 | `Bỏ` | **Trivial**: only checks something that is already a precondition or a mandatory step of another `Giữ` idea. **Add the dropped idea's VP to the VP column of that `Giữ` idea** (the VP column takes several codes, comma-separated) | `Trivial: bao hàm trong TI-xx` |
| 5 | `Giữ` | Everything else | `Kiểm tra rule có nguồn: <mã>` (add `· RK-xx` if the Risk Level is `CRITICAL`/`HIGH`) |

(Template meanings: duplicate of TI-xx · out of scope per 01 §6 · waiting on MR-xx · trivial, contained in TI-xx · checks a sourced rule.)

A missing message text or concrete value does **not** make an idea `Chờ MR` — if the behaviour is clear, it is `Giữ`;
Stage 5 writes the label `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` in the value cell.
An idea that needs information no `MR` has asked about yet ⇒ do not record the idea; add a row to `## ASK` ("cần MR cho <mã> × W<n>" — an MR is needed for <code> × W<n>,
hand over to Stage 2) and set the verdict to `ASK`.

## Steps
1. For each VP in 03, go through every code in that VP's scope, choose the technique per the table, and produce ideas (one sentence, one condition).
2. `TI` codes take the next number (`npm run ids -- <task-slug>`); an idea whose content is unchanged from the previous run keeps its code.
3. Filter with the rule table, in exactly that order.
4. Check: every code in a VP's scope has at least one `Giữ` or `Chờ MR` idea.

## Output format
Write `OUTPUT/<task-slug>/04_test_idea_report.md`:

````markdown
# Test Idea Report · <task-slug>
Owner: qa-system/qa-analyst/skills/test-idea-design.md · Nguồn: 01_requirement_risk_summary.md, 02_missing_rule_report.md, 03_viewpoint_report.md, knowledge/features/<feature-slug>.md · Verdict: PASS

| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | <một câu> | VP-01 | BR-01 | Use Case | Giữ | Kiểm tra rule có nguồn: BR-01 · RK-01 |
| TI-02 | <một câu> | VP-03 | FD-02 | BVA | Giữ | Kiểm tra rule có nguồn: FD-02 |
| TI-03 | <một câu> | VP-02 | AF-01 | EP | Chờ MR | Chờ MR: MR-04 |
````

## Acceptance gates (Quality Gates)
- [ ] `npm run gate <slug>` exits `0`; the meta line follows QA_STANDARD §7.
- [ ] Each idea is one sentence, with a source code, a VP from the registry/03, and a `Kỹ thuật` from the table above.
- [ ] `Giữ/Bỏ` ∈ `Giữ` · `Bỏ` · `Chờ MR`; `Lý do filter` follows the template of the rule applied.
- [ ] Every code in the scope of the VPs of 03 has a `Giữ` or `Chờ MR` idea.
