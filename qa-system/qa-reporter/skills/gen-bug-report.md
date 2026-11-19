---
name: gen-bug-report
description: >
  Converts a Tester's raw bug notes into a Jira-ready 7-field technical Bug Report,
  cross-checks the Expected Result against the Business Rules (BR-xx), assesses technical Severity and proposes a Priority.
---

# Skill: gen-bug-report

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT standard · risk matrix §5).
>
> **Skill = HOW.** Procedure + parameters + the 7-field output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints (those are in `qa-system/core/QA_STANDARD.md`).
>
> The output format block and its fixed markers (`(cần bổ sung)` = needs input, `[ĐỀ XUẤT]`, `[GIẢ ĐỊNH]`,
> `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA` = reviewer/PM must confirm before logging to Jira) stay in Vietnamese; copy them verbatim.

## Purpose
Convert a Tester's raw bug notes into a standard Jira-ready 7-field technical Bug Report, cross-check the Expected behaviour against the matching Business Rule (`BR-xx`) from `knowledge/`, assess the technical Severity, propose a Priority and prepare the file for the Human-Final Review before it is logged into Jira.

## Parameters
- `bug_notes_path`: Path of the file containing the tester's raw bug notes (e.g. `INPUT/bug_notes.txt` or any markdown/text file). Mandatory.
- `rules_path`: The Business Rules file used to cross-check the Expected (optional; default `knowledge/features/<feature-slug>.md`).
- `feature_name`: Name of the related feature/module (optional) — used to choose `<feature-slug>`.

## Inputs (Đầu vào)
- The raw bug notes file at `<bug_notes_path>`.
- The business knowledge file: `knowledge/features/<feature-slug>.md` (§3 BR, §3b FD, §5 AF, §8 decisions) or `<rules_path>`.
- `knowledge/_project.md` (time zone, code format and currency conventions).

> If the mandatory bug notes file is missing → STOP and ask for it; never invent content.

## MUST NOT (specific to this skill)
- NEVER invent Steps to Reproduce, Environment parameters, devices, operating systems, test data, accounts or faulty behaviour that the bug notes do not mention. Every missing item must be marked `(cần bổ sung)` (needs input) or tagged `[GIẢ ĐỊNH]` (assumption).
- NEVER speculate about the Root Cause without technical evidence (stack trace, network tab log, console error, DB exception) in the bug notes. Record only the surface symptom and write `(cần Dev kiểm tra Root Cause)` (Dev needs to check the root cause).
- NEVER decide the Priority on behalf of the Team/PM; it may only be proposed as `[ĐỀ XUẤT] P1/P2/P3/P4` with a reason and a clear note that a Reviewer must confirm it.
- NEVER overwrite or modify the input bug notes file.
- NEVER leave any of the 7 mandatory fields empty.

---

## The 7 Mandatory Fields Standard (Jira Bug Specification)

| # | Field name | Standard content | Mandatory rule |
|---|---|---|---|
| **1** | **Title** | Bug summary in the form `[<Module/Function>] <actual faulty behaviour> khi <action/condition>` (`khi` = when) | Short, concise, reflecting the true nature of the bug. Used as the basis for the file slug. |
| **2** | **Environment** | Extract: OS, Browser/Device, Environment (Staging/Dev/UAT), Version/Build, test account | Record only what is in the bug notes. Any missing item is marked `(cần bổ sung)` in that entry. |
| **3** | **Steps to Reproduce** | Preconditions + sequentially numbered steps (1, 2, 3...) with concrete Test Data | Stick to the actual actions in the bug notes. Missing concrete data ⇒ `(cần bổ sung test data)`. |
| **4** | **Actual vs Expected** | Two separate parts:<br>- **Actual**: the faulty symptom observed in the notes.<br>- **Expected**: the system's correct behaviour, **MUST TRACE TO A RULE CODE** | Quote the specific rule code (e.g. `BR-03`, `BR-05` in `knowledge/features/<feature-slug>.md`). If the rule is not in knowledge yet → `[CHƯA CÓ TRONG TÀI LIỆU]`; never write the Expected yourself. |
| **5** | **Severity** | QA_STANDARD §11 scale: `Critical` / `Major` / `Minor` / `Trivial` | **A TECHNICAL REASON IS MANDATORY**: analyse the impact on the main flow, crashes, data leaks, or whether it is only a UI issue. |
| **6** | **Priority** | Format: `[ĐỀ XUẤT] [P1 / P2 / P3 / P4]` + the reason for the proposed urgency | With the explicit warning: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`. |
| **7** | **Evidence** | Logs, response status/body, error message strings on the UI, screenshot/video paths | Extracted verbatim from the bug notes. If the tester attached no evidence → write `(cần bổ sung screenshot/video/log)`. |

---

## Steps

### Step 1: Take in and extract the raw facts from the Bug Notes
1. Read the content of the `<bug_notes_path>` file.
2. Extract every fact available:
   - The faulty module / function.
   - Environment, device, account (if any).
   - The actions performed and the input data exactly as the notes record them.
   - The actual faulty behaviour (Actual result) and the error message.
   - The attached technical evidence (logs, images, status codes).
3. Mark the list of missing information to go into the `(cần bổ sung)` entries.

### Step 2: Look up the Business Rules to build the Expected Result
1. Identify the related business module from the Step 1 facts.
2. Search for business rules in order of priority:
   - The file given in `rules_path`.
   - `knowledge/features/<feature-slug>.md` — §3, §3b (verbatim message text), §5, §8.
3. Identify exactly which rule code (`BR-xx`) defines the correct behaviour in this situation.
4. Write the Expected Result based on that rule with a specific source reference (Traceability). Message text is only copied verbatim from knowledge; none ⇒ `[CHƯA CÓ TRONG TÀI LIỆU]`.

### Step 3: Assess the technical Severity & propose a Priority
1. **Severity (technical seriousness)**:
   - `Critical`: Crash, data loss/corruption, the main flow fully blocked, a security hole.
   - `Major`: A main function behaves differently from the rule (`BR-xx`) with no workaround.
   - `Minor`: A secondary feature is wrong, a message is inaccurate, or there is a workaround.
   - `Trivial`: Display, spelling or alignment issues — no impact on logic.
   - *Write out the technical reasoning behind the assessed level.*
2. **Priority (handling priority)**:
   - Give the proposal `[ĐỀ XUẤT] P1 / P2 / P3 / P4` based on business urgency and the scope of user impact.
   - Lock label: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`.

### Step 4: Self-check accuracy (FACT Self-Audit)
Run this checklist before creating the file:
- **F (Factual)**: Every piece of the bug description comes from the bug notes or the Business Rules. Never speculate about the root cause without evidence.
- **A (Accurate)**: Correct Title syntax, correct `BR-xx` code, a correct distinction between Actual and Expected.
- **C (Complete)**: All 7 mandatory fields + Section 8 (Assumptions & missing information) + Section 9 (Human-Final Review Checklist).
- **T (Testable)**: Steps to reproduce are clear and Pass/Fail can be verified.

Decide the verdict:
- If the reproduction steps and the actual bug are too vague to determine ➔ `Verdict: ASK`; stop and ask the Tester for more.
- If there is enough basic information to reproduce ➔ `Verdict: PASS`.

### Step 5: Create the slug and write the Markdown file
1. Create `<slug>` from the Title field:
   - Convert upper case to lower case.
   - Strip Vietnamese diacritics (e.g. `á` ➔ `a`, `đ` ➔ `d`...).
   - Remove all special characters (keep only `[a-z0-9]`).
   - Replace spaces and runs of characters with a hyphen (`-`).
   - Limit the length to at most 60 characters to keep the file name tidy.
2. Create the `OUTPUT/reports/` folder (if it does not exist).
3. Write the file to `OUTPUT/reports/bug-report-<slug>.md`. Never overwrite the input file.

---

## Output Format
Write `OUTPUT/reports/bug-report-<slug>.md`:

````markdown
# BUG REPORT: <Title>
Owner: qa-system/qa-reporter/skills/gen-bug-report.md · Nguồn: <bug_notes_path>, <rules_path> · Verdict: PASS

---

## 1. Title
[<Module>] <Hành vi lỗi thực tế> khi <Thao tác/Điều kiện>

## 2. Environment
- **Hệ điều hành (OS)**: <Thông tin từ notes hoặc (cần bổ sung)>
- **Trình duyệt / Thiết bị**: <Thông tin từ notes hoặc (cần bổ sung)>
- **Môi trường test**: <Staging / UAT / Dev / Prod hoặc (cần bổ sung)>
- **Phiên bản App / Web**: <Version / Build hoặc (cần bổ sung)>
- **Tài khoản kiểm thử**: <Username / Role hoặc (cần bổ sung)>

## 3. Steps to Reproduce
**Tiền điều kiện (Preconditions):**
- <Điều kiện chuẩn bị trước khi thực hiện test>

**Các bước thực hiện:**
1. Bước 1...
2. Bước 2... (Dữ liệu nhập: `<giá trị>`)
3. Bước 3...

## 4. Actual vs Expected
- **Actual Result (Thực tế)**: <Hành vi lỗi ghi nhận được từ bug notes>
- **Expected Result (Kỳ vọng)**: <Hành vi chuẩn xác của hệ thống>
  - *Traceability*: Căn cứ theo `<Mã Rule>` tại tài liệu `<Tên file rule>`.

## 5. Severity
**[Critical / Major / Minor / Trivial]**
- *Lý do kỹ thuật*: <Phân tích chi tiết impact kỹ thuật đối với hệ thống, dữ liệu, bảo mật hoặc luồng người dùng>

## 6. Priority
**[ĐỀ XUẤT] [P1 / P2 / P3 / P4]**
- *Lý do đề xuất*: <Mức độ cấp bách nghiệp vụ, tần suất ảnh hưởng người dùng>
- *Trạng thái*: `⚠️ CẦN REVIEWER / PM XÁC NHẬN VÀ CHỐT TRƯỚC KHI LOG JIRA`

## 7. Evidence
- **Logs / API Response / Console**:
  ```
  <Nội dung log hoặc (cần bổ sung bằng chứng log/exception)>
  ```
- **Screenshot / Video**: `<Đường dẫn ảnh/video hoặc (cần bổ sung)>`

---

## 8. Giả Định & Thông Tin Còn Thiếu
*(Mục bắt buộc nếu phát hiện thiếu thông tin hoặc có giả định)*
- [ ] **Thông tin còn thiếu**:
  - <Liệt kê các trường đang ghi nhận (cần bổ sung)>
- [ ] **Giả định đã đưa ra**:
  - <Liệt kê các điểm gắn [GIẢ ĐỊNH] kèm căn cứ>

---

## 9. Human-Final Review Checklist (Trước Khi Log Jira)
- [ ] **Priority**: Reviewer xác nhận mức ưu tiên chính thức: `P[...]`
- [ ] **Expected Result Trace**: Đã kiểm tra tính chính xác của Business Rule được trích dẫn
- [ ] **Bổ sung thông tin**: Đã kiểm tra và đính kèm đầy đủ Environment / Evidence
- [ ] **Phê duyệt**: [ ] SẴN SÀNG LOG JIRA / [ ] CẦN CẬP NHẬT THÊM
````

(Section 8 = assumptions & missing information — mandatory whenever information is missing or assumptions were made.
Section 9 = Human-Final Review checklist before logging to Jira: confirmed priority, rule trace checked, information completed, approval.)

---

## Writing knowledge
Writes no knowledge (reads knowledge only, for cross-checking).

---

## Gates
- [ ] The output file is at `OUTPUT/reports/bug-report-<slug>.md`; the input is not overwritten.
- [ ] The file name is kebab-case without diacritics.
- [ ] All 7 mandatory fields are 100% present; none left empty.
- [ ] The Expected Result quotes a `BR-xx` code from knowledge; if none exists, `[CHƯA CÓ TRONG TÀI LIỆU]`.
- [ ] Severity has a technical justification; Priority is in `[ĐỀ XUẤT]` form with a note that a Reviewer must confirm it.
- [ ] No invented information at all; every gap is marked `(cần bổ sung)` and collected in Section 8.
- [ ] The Human-Final Review checklist is present in Section 9.
