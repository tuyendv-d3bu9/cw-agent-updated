---
name: gen-daily-summary
description: >
  Converts raw sprint data in JSON form into a normalised Daily QA Summary with 4 fixed sections
  (Tiến độ hôm nay / today's progress, Outstanding Issues, Blocker, Next Action) for a Dev or PM audience.
---

# Skill: gen-daily-summary

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT standard).
>
> **Skill = HOW.** Procedure + parameters + the 4-section output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints (those are in `qa-system/core/QA_STANDARD.md`).
>
> The section names (`Tiến độ hôm nay`, `Outstanding Issues`, `Blocker`, `⏭ Next Action`) and the output format block stay
> as written; copy them verbatim.

## Purpose
Convert raw sprint data in JSON form into a normalised Daily QA Summary with exactly 4 fixed sections, presented to suit the target audience (`dev` or `pm`), with 100% of the figures reconciled directly against the source and strict compliance with the FACT standard (no invented figures, no subjective judgements, no inferred blockers or tasks).

## Parameters
- `sprint_data_path`: Path of the sprint data JSON file. Mandatory.
  **The mandatory shape of this file**: [`qa-system/templates/sprint-data.example.json`](../../templates/sprint-data.example.json).
  No file yet ⇒ copy the template to `OUTPUT/<slug>/reports/sprint_data_<YYYY-MM-DD>.json` and fill it in
  from `runs/<RUN-ID>/run_result.md` + `jira_defects_summary.md`. **Never invent a structure.**
- `audience`: The report's readers; takes one of two valid values:
  - `dev`: Technical presentation; keep Bug IDs, Test Case IDs, bug details and specific parameters.
  - `pm`: Focus on progress, overall risks and issues needing a decision; aggregate technical details at the feature level, minimise technical jargon while preserving the substance of the data.
  - **SPECIAL CONSTRAINT**: This parameter is MANDATORY. If the user does not pass it, or passes a value other than `dev` / `pm`, the skill **MUST STOP AND ASK THE USER (Verdict: `ASK`)**, and must never silently choose one.

## Inputs (Đầu vào)
- A valid sprint data JSON file at `<sprint_data_path>`.
- An explicitly confirmed `audience` parameter (`dev` or `pm`).

> JSON data file missing or `audience` not passed → STOP with `Verdict: ASK` and ask for the complete information; never imagine content or choose the audience yourself.

## MUST NOT (specific to this skill)
- **NEVER invent or change any number**: Every figure such as `executed`, `passed`, `failed`, `blocked`, the number of bugs and the pass rate must be traceable 100% directly back to the source JSON file.
- **NEVER give subjective judgements beyond the data**: Absolutely no judgements like "sprint quality is very good", "the system is unstable", "progress looks promising". Only describe the figures, statuses and the risks directly observable in the data.
- **NEVER create or infer Blockers**: Record an issue as a Blocker only when the JSON has data that clearly identifies it as a blocker (e.g. an `is_blocker: true` flag, a `blockers` property, or a blocked status directly described as a blocker). If the JSON does not provide enough data to tell → write `Không có blocker được ghi nhận trong dữ liệu sprint` (no blocker recorded in the sprint data).
- **NEVER add tasks, assignees or plans that do not exist in the JSON**: In the `⏭ Next Action` section, list only the tasks and assignees explicitly given in the JSON data. If there is no assignee information → record only the task and set the assignee to `(chưa phân công trong dữ liệu)` (not assigned in the data).
- **NEVER choose the `audience` yourself**: When the user does not pass the `audience` parameter, never default it to `dev` or `pm`.
- **NEVER change the substance of the data when adapting it for `pm`**: When aggregating bug details at the feature level for the PM, keep the exact number of bugs, the severity levels and the core causes from the original data.

---

## The Mandatory 4-Section Structure

The Daily QA Summary must contain exactly the following 4 sections, in this order:

### 1. `Tiến độ hôm nay` (today's progress)
- Shows the execution metrics: `Executed`, `Passed`, `Failed`, `Blocked`.
- Lists the features (`Features` / `Modules`) covered during the day.
- **Pass Rate**: computed automatically with the mandatory formula:
  $$\text{Pass Rate} = \frac{\text{passed}}{\text{executed}} \times 100\%$$
  - The calculation and its concrete arithmetic must be written out: `Pass Rate = passed / executed = <passed> / <executed> = <rate>%`.
  - Division-by-zero guard: if `executed == 0`, write `0% (0/0 test cases executed)` to avoid dividing by zero.
- Every figure must match the JSON exactly.

### 2. `Outstanding Issues`
- Lists the unfixed bugs (Open, In Progress, Reopened), those being verified (Ready for QA, In QA) or blocked issues, with `Severity` (if the information is in the JSON).
- **Differentiated by Audience**:
  - **For `audience = dev`**:
    - Keep the Bug IDs (e.g. `BUG-102`, `JIRA-405`) and the related Test Case IDs (`TC-012`).
    - Record the technical bug details: error message, endpoint, the step causing the bug, the specific environment if any.
  - **For `audience = pm`**:
    - Aggregate technical details into feature/module level or general issues.
    - Turn specialist terms (technical jargon such as stack trace, memory leak, null pointer) into easy-to-understand descriptions of the functional impact.
    - Never lose the bug count or distort the substance of the data.

### 3. `Blocker`
- State clearly the issues directly halting test or development progress, with the `Action` needed immediately to clear the bottleneck.
- If the JSON has no blocker data: write clearly `Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.` (no blocker recorded in the current sprint data). Never turn an ordinary bug into a blocker by inference.

### 4. `⏭ Next Action`
- Shows the plan for the next working day.
- Includes: who will do what (`Task` + `Người phụ trách / Assignee`) if assignee information is in the JSON.
- If the JSON has no assignee information: write `(chưa chỉ định người phụ trách trong dữ liệu)` (no assignee specified in the data). Never invent staff names or make up tasks outside the JSON.

---

## Steps

### Step 1: Take in and validate the input (Input Validation & Audience Gate)
1. Check the `sprint_data_path` parameter: read the JSON file. If the file does not exist or has a JSON syntax error ➔ return `Verdict: ASK` asking for a valid file.
2. Check the `audience` parameter:
   - If `audience` is empty or not in `['dev', 'pm']`:
     - **STOP IMMEDIATELY**.
     - Reply asking the user to confirm the audience: *"Please choose the report's audience: `dev` (technical/detailed) or `pm` (progress/risk overview)."*
     - Set `Verdict: ASK`.
3. Extract the data fields from the JSON:
   - Sprint information: sprint name, report date, project.
   - Test execution statistics: `executed`, `passed`, `failed`, `blocked`, the list of features.
   - The defect/issue list: ID, title, status, severity, feature/module, technical details, related test cases.
   - The blocker list (if any): description, impact, required action.
   - The next plan (if any): task, assignee, target date.

### Step 2: Compute the metrics & apply the logic
1. Compute the `Pass Rate`:
   - Take `passed` and `executed` from the JSON.
   - Check `executed > 0`: `pass_rate_percent = ((passed / executed) * 100).toFixed(2)` (or round to 1 decimal place if it divides evenly).
   - Build the explanation string: `pass_rate_formula = passed / executed = ${passed} / ${executed} = ${pass_rate_percent}%`.
   - If `executed === 0`: the explanation string is `0% (0 / 0 test cases executed)`.
2. Classify the Outstanding Issues:
   - Filter the issues whose status is not finished (`Open`, `In Progress`, `Reopened`, `In QA`, `Blocked`...).
   - If `audience == 'dev'`: keep the detailed table structure with the columns `Bug ID`, `Feature`, `Severity`, `Trạng thái` (status), `Chi tiết kỹ thuật / Test Case ID` (technical details / test case ID).
   - If `audience == 'pm'`: group the issues by `Feature / Nhóm chức năng` (feature / functional group), summarise the business impact, and keep the bug counts and the corresponding severity levels.
3. Identify Blockers:
   - Extract only the items identified as blockers in the JSON.
   - If the blocker array is empty or missing: mark `Không có blocker` (no blocker).
4. Extract the Next Action:
   - Extract the list of next tasks from the matching JSON field.
   - Map Task ↔ Assignee explicitly (if available).

### Step 3: FACT Self-Audit (self-reconciliation before writing the file)
Run a checklist reconciling 100% against the JSON:
- [ ] **Factual (truthful figures)**:
  - Does the `executed` value in the report equal the JSON exactly?
  - Do `passed`, `failed`, `blocked` match to the unit?
  - Does the total number of bugs in Outstanding Issues equal the number of unfinished bugs in the JSON?
  - No blocker or task inferred and added?
- [ ] **Accurate (precision)**:
  - Does the Pass Rate formula state `passed / executed` with its component values?
  - Is the percentage arithmetically correct?
  - Are the identifiers (`Bug ID`, `TC-xx`) and feature names written verbatim?
- [ ] **Complete (full structure)**:
  - Exactly the 4 fixed sections: `Tiến độ hôm nay`, `Outstanding Issues`, `Blocker`, `⏭ Next Action`?
  - Is there a Human-Final Review Checklist at the end of the file?
- [ ] **Testable (objective & verifiable)**:
  - Has any subjective judgement ("good quality", "bad quality") slipped into the text? If so, remove it immediately.

### Step 4: Publish the Markdown file
1. Create the `OUTPUT/reports/` folder (if it does not exist).
2. Write the report file to the path:
   ```
   OUTPUT/reports/daily-summary-<audience>.md
   ```
   *(where `<audience>` is `dev` or `pm`)*.
3. Report the result with a short summary and remind the Human-Final reviewer to pay special attention to the `Blocker` section.

---

## Standard Output Format

Write the file `OUTPUT/reports/daily-summary-<audience>.md`:

````markdown
# DAILY QA SUMMARY · <Tên Sprint / Ngày>
Owner: qa-system/qa-reporter/skills/gen-daily-summary.md · Nguồn: <sprint_data_path> · Verdict: PASS
Audience: <dev | pm>

---

## 1. Tiến độ hôm nay

### Chỉ số thực thi kiểm thử:
| Chỉ số | Số lượng | Ghi chú |
|---|---|---|
| **Executed** | <số lượng executed> | Test case đã thực hiện |
| **Passed** | <số lượng passed> | Test case đạt yêu cầu |
| **Failed** | <số lượng failed> | Test case phát hiện lỗi |
| **Blocked** | <số lượng blocked> | Test case bị chặn |

- **Pass Rate**: `<passed>/<executed>` = **<tỷ_lệ>%**  
  *(Công thức: `Pass Rate = (passed / executed) * 100% = <passed> / <executed> = <tỷ_lệ>%`)*
- **Phạm vi tính năng đã cover**: <Liệt kê các feature/module đã test từ JSON>

---

## 2. Outstanding Issues

<!-- NẾU AUDIENCE LÀ DEV: -->
| Bug ID | Test Case ID | Feature | Severity | Trạng thái | Chi tiết kỹ thuật |
|---|---|---|---|---|---|
| <ID> | <TC-ID> | <Feature> | <Severity> | <Status> | <Mô tả kỹ thuật/endpoint/log> |

<!-- NẾU AUDIENCE LÀ PM: -->
| Feature / Nhóm chức năng | Số lượng bug | Mức độ nghiêm trọng | Trạng thái tổng quát | Tác động tiến độ / nghiệp vụ |
|---|---|---|---|---|
| <Feature> | <Số lượng> | <Liệt kê severity: Critical, Major...> | <Status> | <Mô tả ảnh hưởng chức năng (không dùng jargon)> |

---

## 3. Blocker

<!-- Trường hợp CÓ blocker trong JSON: -->
- **Vấn đề chặn**: <Mô tả trực tiếp vấn đề blocker từ JSON>
- **Tác động**: <Mô tả tác động đến tiến độ kiểm thử/phát hành>
- **Action cần xử lý ngay**: <Hành động giải tỏa blocker từ JSON>

<!-- Trường hợp KHÔNG có blocker trong JSON: -->
*Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.*

> ⚠️ **LƯU Ý HUMAN-FINAL REVIEW**: Section Blocker có thể kích hoạt các quyết định và hành động can thiệp tức thì từ phía PM / Lead. Đề nghị người duyệt đối chiếu kỹ lưỡng trước khi phát hành.

---

## 4. ⏭ Next Action

| Nhiệm vụ tiếp theo | Người phụ trách | Thời hạn / Ghi chú |
|---|---|---|
| <Task cụ thể từ JSON> | <Tên người phụ trách từ JSON hoặc "(chưa phân công trong dữ liệu)"> | <Ghi chú từ JSON> |

---

## 5. Human-Final Review Checklist (Trước khi gửi cho Team)
- [ ] **Số liệu thực thi**: Xác nhận đã đối chiếu các số Executed, Passed, Failed, Blocked với dashboard thực tế.
- [ ] **Công thức Pass Rate**: Xác nhận phép tính `passed / executed` chính xác.
- [ ] **Blocker (ĐẶC BIỆT QUAN TRỌNG)**: PM / QA Lead đã duyệt tính chính xác của các điểm chặn và hành động đề xuất.
- [ ] **Next Action**: Đã xác nhận người phụ trách các đầu việc tiếp theo.
- [ ] **Phê duyệt phát hành**: [ ] SẴN SÀNG GỬI / [ ] CẦN CẬP NHẬT
````

(Use the DEV table or the PM table according to `audience`; use the blocker block or the "no blocker" line according to the JSON.
The ⚠️ Human-Final note on the Blocker section and the section 5 checklist — figures, pass-rate formula, blockers, next actions,
release approval — must always be kept.)

---

## Writing knowledge
Writes no knowledge (reads only the raw sprint data to compile the report).

---

## Acceptance gates (Quality Gates)
- [ ] The output file must be written at `OUTPUT/reports/daily-summary-<audience>.md`.
- [ ] Without an `audience` parameter, the skill must stop and ask the user (Verdict: `ASK`), never choose by itself.
- [ ] Exactly the 4 fixed sections: `Tiến độ hôm nay`, `Outstanding Issues`, `Blocker`, `⏭ Next Action`.
- [ ] The Pass Rate states the formula `passed / executed` and a correct result, with a guard for a zero denominator.
- [ ] The content is correctly differentiated for `dev` (IDs and technical details kept) and `pm` (feature level, minimal jargon, substance preserved).
- [ ] The Blocker section is not inferred; it states clearly when the JSON has no blocker.
- [ ] The Next Action section contains no invented tasks or staff outside the JSON.
- [ ] 100% of the figures reconcile exactly with the source JSON file.
- [ ] Absolutely no subjective judgements ("good/bad").
