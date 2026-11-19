---
name: test-case-generation
description: >
  Expands "Giữ" (kept) Test Ideas into 8-field Test Cases in the Jira Xray/TestRail standard. Values and expected
  results are taken only from sources; anything missing is labelled. At large scale it runs Blueprint → batch → merge.
---

# Skill: test-case-generation

> Complies with `qa-system/core/QA_STANDARD.md` (ASK gate §1 · guards §2 · labels §2.1 · FACT §3 · boundary chain §6 ·
> knowledge §8 · IDs §9 · sources §10 · Priority/Automated §11).
>
> The test case format (field names, `### TC_ID:` heading, `Tags` syntax) and the Vietnamese labels are parsed by
> `npm run lint`, `npm run testcases:merge` and `npm run readiness`. Copy them verbatim.

## Purpose
Detail each `Giữ` Test Idea into one or more 8-field Test Cases, traceable back to the `TI`, the rule and the viewpoint.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/04_test_idea_report.md` — only the `Giữ` rows.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — `BR`, `FD` (constraints, `Thông báo khi sai`), `AF`, `RK`.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — `MR` and their statuses.
- `OUTPUT/<task-slug>/03_viewpoint_report.md` — `VP`, `RK`.
- `knowledge/_project.md` (§1 `MODULE` code, §2 date/currency formats) · `knowledge/features/<feature-slug>.md` (§8 decisions, §9 constants).
- Only when `knowledge/_sut.json` has a `domain`: the `vocab` files listed by `npm run domain` — only to use the correct names
  for roles / entities / states in `Title`, `Precondition`, `Test Steps` when the sources use exactly those names. Not
  a source of values (QA_STANDARD §10.3). `_sut.json` has no `domain` ⇒ skip.

> Before writing: `npm run gate <task-slug>` must exit `0` (QA_STANDARD §1).
> `_project.md` §1 has not declared the `MODULE` code ⇒ ask the user, do not set it yourself.

## MUST NOT (specific to this skill)
- Produce test cases for `Bỏ` / `Chờ MR` ideas, or for anything outside 04.
- Invent Test Data values, message texts, HTTP codes, DB states or thresholds.
- Use vague placeholders ("any string", "abc", "TBD", "[email]"). A missing value ⇒ a §2.1 label, not a placeholder.
- Combine several actions into one step; exceed 8 steps.
- Use the `Phương án gợi ý` (suggested option) from 02 as the Expected.

## Value rules
| Cell | Taken from | Not in the sources |
|---|---|---|
| Test Data | `FD` (constraints), knowledge §9, examples in `INPUT/`; boundary points are **computed by machine**: run `npm run boundary -- <slug> [FD-xx]` and copy the values as they are (§6) — never compute them yourself; where the machine writes a label, keep the label | `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` (or without a code if no MR exists yet) |
| Message text in Expected | `FD` column `Thông báo khi sai`, `AF` column `Hệ thống phản hồi`, knowledge §8 — **verbatim** | `Hiển thị thông báo lỗi [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` |
| HTTP code / DB state | Only when the `FD`/`AF` has a `03_dev/` source stating it explicitly | Do not write it |
| Priority | The fixed QA_STANDARD §11 mapping from the highest Risk Level among the `RK`s whose `Nguồn` contains the TC's rule code | `Medium [ĐỀ XUẤT]` |
| Automated/Manual | QA_STANDARD §11 | `Manual` |
| Date | `YYYY-MM-DD` or the format in `_project.md` §2 | — |

## The 8 fields (8 trường)
| Field | Rule |
|---|---|
| `TC_ID` | `<MODULE>-NNN` (§9.1). Next number from `npm run ids -- <task-slug>`; an existing TC keeps its code |
| `Title` | Starts with `Verify` / `Validate` / `Confirm` + action + condition |
| `Precondition` | State, baseline data, permissions — only what is in the sources |
| `Test Steps` | Numbered, one action per step, at most 8 |
| `Test Data` | Per the value rules |
| `Expected Result` | Per the value rules; a Pass/Fail criterion that can be decided, or a label stating exactly which part is still missing |
| `Priority` | `High` / `Medium` / `Low`, optionally followed by ` [ĐỀ XUẤT]` |
| `Tags` | `Rule#` + a `BR`/`FD`/`AF`/`MR` code (one or more, e.g. `Rule#BR-01`) · `Viewpoint#VP-xx` (every VP in the TI's VP column, one tag per VP) · `TI#TI-xx` · `Module#<MODULE>` · `Manual` or `[ĐỀ XUẤT] Automated` |

`Rule#MR-xx` is used only when that MR is `Confirmed`/`Rejected` in knowledge §7. One `BVA` idea ⇒ one TC per point
of the boundary chain present in the sources.

## Steps
1. Run `npm run gate <task-slug>`; exit `1` ⇒ stop and paste the result.
2. Count the expected number of TCs. **≤ 50** ⇒ write `05_test_case_spec.md` directly. **> 50** ⇒ three phases:
   - **Blueprint** — `OUTPUT/<task-slug>/05_test_blueprint.json`, one short line per TC:
     ```json
     [{ "tc_id": "<MODULE>-001", "ti_id": "TI-01", "rule_id": "BR-01", "viewpoint_id": "VP-01", "purpose": "<một câu>", "priority": "High", "batch": 1 }]
     ```
   - **Batch** — about 50 TCs per batch, written to `OUTPUT/<task-slug>/testcases/batch_01.md`, `batch_02.md`… (2 digits).
   - **Merge** — `npm run testcases:merge <task-slug>` merges them into `05_test_case_spec.md`.
3. Write each TC per the value rules.
4. Run `npm run lint -- <task-slug>`; exit `1` ⇒ fix and re-run. Paste the real result.

## Output format
`OUTPUT/<task-slug>/05_test_case_spec.md` (and each `testcases/batch_NN.md`, with the same lines 1–2):

````markdown
# Test Case Spec · <task-slug>
Owner: qa-system/qa-test-design/skills/test-case-generation.md · Nguồn: 04_test_idea_report.md, 01_requirement_risk_summary.md, 03_viewpoint_report.md, knowledge/features/<feature-slug>.md · Verdict: PASS

### TC_ID: <MODULE>-001
- **Title**: Verify <hành động> khi <điều kiện>
- **Precondition**:
  - <điều kiện có nguồn>
- **Test Steps**:
  1. <thao tác 1>
  2. <thao tác 2>
- **Test Data**:
  - <field FD-xx>: <giá trị từ nguồn, hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]>
- **Expected Result**:
  - <kết quả; chữ thông báo nguyên văn hoặc [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]>
- **Priority**: High
- **Tags**: Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#<MODULE>, Manual
````

The `<…>` slots are placeholders (action, condition, data, result) — replace them with content quoted from the sources.

## Acceptance gates (Quality Gates)
- [ ] `npm run gate <slug>` exits `0` before writing; `npm run lint -- <slug>` exits `0`, with the real result pasted.
- [ ] Every `Giữ` TI has at least one TC; no TC comes from a TI other than `Giữ`.
- [ ] Every value, message text and response code can be traced to a source; gaps carry a §2.1 label.
      **Lint checks this by machine**: quoted text in Expected must be in the FD "Thông báo khi sai" / AF / knowledge §8; a number with a unit
      (lần, phút, ký tự, VNĐ, %… — times, minutes, characters, VND, %) must be in the sources (±1 for boundaries, or the middle value); `[GIẢ ĐỊNH]` is forbidden in value cells; a `– MR-xx` label must point to a real MR.
- [ ] Priority follows the §11 mapping; Tags contain `Rule#`, `Viewpoint#`, `TI#`, `Module#`, Manual/Automated.
