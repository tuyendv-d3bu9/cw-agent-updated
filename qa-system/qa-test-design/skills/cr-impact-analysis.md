---
name: cr-impact-analysis
description: >
  Analyses the impact of a Change Request (CR) or updated documents in the 5 folders of INPUT/<task-slug>/
  on the knowledge base and the current Test Case set: states the Delta (Old → New) on BR/FD/AF/messages, collects
  unclear points into closed MR-xx questions for the BA/PO, and classifies each affected Test Case (Sửa giá trị /
  Viết lại / Chỉ chạy lại / Blocked — update values / rewrite / re-run only / blocked).
---

# Skill: cr-impact-analysis

> Complies with `qa-system/core/QA_STANDARD.md` (verdict §1 · guards & labels §2 · FACT §3 · boundary chain §6 ·
> I/O §7 · knowledge §8 · IDs & schemas §9 · sources & precedence §10 · scales §11).
> Where a rule already exists in QA_STANDARD, **point to the section number**; do not copy it.
>
> **Skill = HOW.** Procedure + parameters + output format. Reusable.
> It does NOT hold identity/permissions (that is `AGENT.md`) and does NOT repeat the shared constraints
> (those are in `qa-system/core/QA_STANDARD.md`).
>
> The output format block, the column names and the action/status labels (`Sửa giá trị`, `Viết lại`, `Chỉ chạy lại`,
> `Blocked — Chờ MR-xx`, `Sẵn sàng cập nhật`, `Sẵn sàng chạy lại`) stay in Vietnamese: they are the closed vocabulary of
> the deliverable and the §3 question table is parsed by the tools. Copy them verbatim.

## Purpose
Assess the impact when a Change Request (CR) or new updated documents (System Design, API Spec, SRS, Wireframe, meeting minutes) are added to a feature that already has a Test Case set. Produce `OUTPUT/<task-slug>/16_cr_impact_analysis.md` containing a Delta table (Old → New) with verbatim quotes, a question table of `MR-xx` for the unclear points, the list of each affected `TC_ID` with a concrete maintenance action, and knowledge synchronisation instructions.

## Inputs (Đầu vào)
- `INPUT/<task-slug>/` — all 5 folders (`01_business/`, `02_ba/`, `03_dev/`, `04_design/`, `05_communication/`). **Do not read** `<folder>/_superseded/`. If the updated documents are still in a separate folder outside, run `npm run intake -- <path> --into <task-slug>` first to sort them automatically into the 5 folders.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — the current `BR`, `FD`, `AF` tables and the list of source files in the meta line.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` (if present) — the feature's existing `MR` list.
- `OUTPUT/<task-slug>/05_test_case_spec.md` (or `OUTPUT/<task-slug>/testcases/batch_*.md`) — the current set of 8-field Test Cases.
- `OUTPUT/<task-slug>/06_coverage_review.md` (if present) — the `BR/FD/AF` ↔ `TC_ID` coverage matrix and the boundary chain table.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` — §3, §7, §8, §9 (always loaded, QA_STANDARD §7).

> `01_requirement_risk_summary.md` missing, `05_test_case_spec.md` (or `testcases/batch_*.md`) missing, or no new updated document in the 5 folders of `INPUT/<task-slug>/` → STOP; never imagine the content.

## MUST NOT (specific to this skill)
> Record only the **specific** gates. The shared guards are in `qa-system/core/QA_STANDARD.md` §2 — not repeated.

- Do not directly modify `01_requirement_risk_summary.md`, `05_test_case_spec.md` or `knowledge/features/<task-slug>.md` in this step — the official update belongs to stages `01`, `02`, `05`, `06` after the user/BA confirms.
- Do not read or quote from the `<folder>/_superseded/` folder (old, replaced versions).
- Do not guess new values, new thresholds or new error message texts when the updated documents leave them open or promise them later — you must attach the label `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` (QA_STANDARD §2.1) and produce a closed question for the BA/PO.
- Do not miss any `TC_ID` in `05_test_case_spec.md` tagged `Rule#<code>` with a `BR`/`FD`/`AF` code that is in the Delta table.
- Do not count `MR-xx` numbers in your head (nor new `BR-xx`, `FD-xx`, `AF-xx`) — use temporary codes, then run `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/16_cr_impact_analysis.md`.

## Rules for classifying the impact on Test Cases (closed matrix)
> Used only in this skill, so that two runs on the same input always produce the same `TC_ID` list and the same action labels.

1. **Rule for selecting rows into the Delta table (§2)**:
   Scan the `BR` (§3), `FD` (§3b) and `AF` (§5) tables of `01_requirement_risk_summary.md` and put into the Delta table every code meeting either condition:
   - **Direct change**: the updated documents directly change that code's condition, threshold, length, format or message text.
   - **Derived change**: that code's row in `01_requirement_risk_summary.md` references a directly changed code **and** repeats the old threshold/value that changed.
2. **Rule for selecting `TC_ID`s into the impact assessment table (§4.2)**:
   The set of `TC_ID`s put into §4.2 (sorted by ascending `TC_ID`) contains, and **only contains**:
   - **Group by Tag**: every `TC_ID` in `05_test_case_spec.md` whose `Rule#<code>` tag matches a `Mã đối tượng` (object code) in the Delta table (§2).
   - **Group linked through Expected Result**: every other `TC_ID` in `05_test_case_spec.md` that does not carry a tag of a code in the Delta table but has a line in `Expected Result` directly asserting the behaviour of a rule in the Delta table.
3. **Rule for labelling each `TC_ID` in §4.2**:
   Each `TC_ID` receives **exactly one** label in the `Hành động` (action) column and **exactly one** label in the `Trạng thái` (status) column:

| Column | Valid value | Applies when (closed matrix) |
|---|---|---|
| `Hành động` | `Sửa giá trị` (update values) | The TC directly contains the old threshold number, an old boundary point (`min`, `max-1`, `max`, `max+1`) or the old message text in `Title`, `Test Steps`, `Test Data` or `Expected Result`, and the structure of the action steps (`Test Steps`) stays the same (only the number/string changes to the new value). |
| `Hành động` | `Viết lại` (rewrite) | A change in a branching condition changes the scenario's business outcome, steps must be added/removed in `Test Steps`, or the scenario must be re-split along the standard boundary chain (QA_STANDARD §6). |
| `Hành động` | `Chỉ chạy lại` (re-run only) | The TC does **not** contain the old threshold number or old message text (all data and expected results in the TC remain verbatim correct under the new rule); it only shares the rule or checks a linked behaviour in `Expected Result`, so a regression run is needed. |
| `Trạng thái` | `Blocked — Chờ MR-xx` (blocked, waiting on MR-xx) | The content to be changed or the expected result of the `TC_ID` depends directly on an unconfirmed unclear point (`MR-xx` with status `New` or `TREO`). |
| `Trạng thái` | `Sẵn sàng cập nhật` (ready to update) | Applies to a TC whose `Hành động` is `Sửa giá trị` or `Viết lại` and every new value it needs is fully available in a valid source. |
| `Trạng thái` | `Sẵn sàng chạy lại` (ready to re-run) | Applies to a TC whose `Hành động` is `Chỉ chạy lại` and which does not depend on any pending `MR-xx`. |

## Steps
1. **Step 1 — Take in & scan the updated documents across the 5 folders (`INPUT/<task-slug>/`)**:
   - If the new documents are still in a separate folder (e.g. `updates/`), run `npm run intake -- <path> --into <task-slug>` to convert them to `.md`, sort them into the right 5 folders (`01_business`, `02_ba`, `03_dev`, `04_design`, `05_communication`) and move the old versions into `<folder>/_superseded/`.
   - Scan the 5 folders of `INPUT/<task-slug>/` (except `_superseded/`), compare against the `Nguồn:` meta line of `01_requirement_risk_summary.md` and `knowledge/features/<task-slug>.md` to list the newly updated files per folder.
   - Check the issue date, the requester, the approval status and apply the source precedence of `QA_STANDARD` §10.2. A `## Annotations / Pending changes` section or an unapproved document is recorded as an unclear point (`MR`).
2. **Step 2 — Cross-check the existing knowledge & Test Suite**:
   - Read `knowledge/_project.md`, `knowledge/features/<task-slug>.md` (§3, §7, §8, §9) and `01_requirement_risk_summary.md` (§3 `BR`, §3b `FD`, §5 `AF`).
   - Read all of `05_test_case_spec.md` (and `06_coverage_review.md` if present) and build a mapping from each `BR-xx`, `FD-xx`, `AF-xx` code to the `TC_ID`s that test it.
3. **Step 3 — Delta analysis (Old → New) & catching unclear points (`MR-xx`)**:
   - Compare each change in the new documents with the existing `BR-xx`, `FD-xx`, `AF-xx` rows (sorted by ascending code: `BR` → `FD` → `AF`).
   - Build the Delta table (§2 of the report): record `Mã đối tượng`, `Loại thay đổi`, `Nội dung cũ (kèm nguồn cũ)`, `Nội dung mới`, `Nguồn mới (file §mục)` and a word-for-word `Trích nguyên văn` from the new document (object code · change type · old content with old source · new content · new source · verbatim quote).
   - Wherever the new documents lack information (e.g. the length changes but the error message is promised later), sources of the same level conflict (`QA_STANDARD` §10.2), or the scope of application is unclear:
     - Put the label `[CHƯA CÓ TRONG TÀI LIỆU – MR-?a]` at the missing part of the `Nội dung mới` cell.
     - Add the matching closed question row to the table `## 3. DANH SÁCH CÂU HỎI CHO BA/PO (ĐIỂM MỜ)` following exactly the `QA_STANDARD` §9.4 schema.
4. **Step 4 — Assess the impact on each Test Case**:
   - Collect every `TC_ID` tagged `Rule#<code>` for the codes in the Delta table (and the `TC_ID`s whose rules depend directly on that code in `01_requirement_risk_summary.md`), sorted by ascending `TC_ID`.
   - Apply the **Rules for classifying the impact on Test Cases** table above to fill `Hành động` (`Sửa giá trị` / `Viết lại` / `Chỉ chạy lại`), `Trạng thái` (`Sẵn sàng cập nhật` / `Sẵn sàng chạy lại` / `Blocked — Chờ MR-xx`) and `Chi tiết thay đổi / Lý do` (change details / reason — state exactly which value changes to which, or which `MR-xx` it waits on).
   - Check the standard boundary chain (`QA_STANDARD` §6) for changed `FD-xx`s or `BR-xx` thresholds: if, after fixing the existing TCs, new boundary points are still missing (you may use `npm run boundary` to compute boundary points from the new threshold), list them in section `## 5. ĐỀ XUẤT TEST CASE BỔ SUNG (NẾU CÓ)` (proposed additional test cases, if any).
5. **Step 5 — Automatic code assignment, knowledge sync instructions & verdict**:
   - Write the file `OUTPUT/<task-slug>/16_cr_impact_analysis.md`, then run `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/16_cr_impact_analysis.md` to turn every temporary code (`MR-?a`, `BR-?a`…) into the next sequence number (QA_STANDARD §9.1).
   - Build the table of sync instructions into `knowledge/features/<task-slug>.md` (following the `QA_STANDARD` §8 writing rule) and the order of stages to re-run after the BA/PO confirms.
   - Decide the verdict per `QA_STANDARD` §1:
     - `ASK`: when any new `MR-xx` question is still `New` / `TREO` (or the updated documents are not yet approved).
     - `PASS`: when the updated documents are approved, no pending `MR-xx` arises, and 100% of the affected `TC_ID`s are listed.
     - `FIX`: when verbatim quotes are missing, table cells are invalidly empty, or a `TC_ID` tagged with a changed code is missed.

## Output format
Write `OUTPUT/<task-slug>/16_cr_impact_analysis.md`:

````markdown
# CR & Update Impact Analysis · <task-slug>
Owner: qa-system/qa-test-design/skills/cr-impact-analysis.md · Nguồn: <danh sách file đã đọc> · Verdict: ASK

## 1. TÀI LIỆU CẬP NHẬT ĐÃ QUÉT
| File cập nhật | Ngăn INPUT | Ngày / Phiên bản | Người yêu cầu / Ban hành | Trạng thái phê duyệt | Ghi chú ưu tiên nguồn (QA_STANDARD §10.2) |
|---|---|---|---|---|---|
| <đường-dẫn-file-trong-INPUT> | <01_business..05_communication> | <YYYY-MM-DD> | <tên/vai trò> | <Đã phê duyệt / Chờ xác nhận> | <ghi chú đối chiếu với spec cũ> |

## 2. PHÂN TÍCH DELTA (CŨ → MỚI)
| Mã đối tượng | Loại thay đổi | Nội dung cũ (Nguồn cũ) | Nội dung mới | Nguồn mới (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|
| BR-01 | Đổi ngưỡng/giá trị | <mô tả giá trị cũ> (<file-cũ §mục>) | <mô tả giá trị mới> | <file-mới §mục> | <câu trích đúng từng chữ từ file mới> |
| FD-01 | Đổi độ dài/định dạng & Đổi thông báo | <ràng buộc cũ>; Thông báo: "<thông-báo-cũ>" (<file-cũ §mục>) | <ràng buộc mới>; Thông báo: [CHƯA CÓ TRONG TÀI LIỆU – MR-01] | <file-mới §mục> | <câu trích đúng từng chữ từ file mới> |

## 3. DANH SÁCH CÂU HỎI CHO BA/PO (ĐIỂM MỜ)
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-01 | <mô tả điểm mờ trong tài liệu cập nhật> | W1 | <FD-01 × file-mới §mục> | <phương án A hoặc B> | <câu hỏi đóng cho BA/PO> |  |  |  | New |

## 4. ĐÁNH GIÁ TÁC ĐỘNG LÊN TEST CASE
### 4.1. Tổng hợp nhanh
| Phân loại hành động | Số lượng TC | Danh sách TC_ID |
|---|---|---|
| Sửa giá trị | <số> | <MODULE>-001, <MODULE>-002 |
| Viết lại | <số> | <MODULE>-003 |
| Chỉ chạy lại | <số> | <MODULE>-004 |

### 4.2. Chi tiết từng Test Case bị ảnh hưởng
| TC_ID | Title hiện tại | Mã liên quan | Hành động | Trạng thái | Chi tiết thay đổi / Lý do |
|---|---|---|---|---|---|
| <MODULE>-001 | <tiêu đề TC> | BR-01 | Sửa giá trị | Sẵn sàng cập nhật | Đổi <ngưỡng-cũ> thành <ngưỡng-mới> ở Test Data và Expected Result theo BR-01 mới |
| <MODULE>-002 | <tiêu đề TC> | FD-01 | Sửa giá trị | Blocked — Chờ MR-01 | Đổi độ dài từ <cũ> lên <mới>; thông báo lỗi trong Expected Result đang chờ chốt MR-01 |
| <MODULE>-003 | <tiêu đề TC> | BR-01 | Viết lại | Sẵn sàng cập nhật | Kịch bản cũ kiểm tại <giá-trị> nay đổi phân vùng nghiệp vụ theo BR-01 mới, cần viết lại bước/kỳ vọng |
| <MODULE>-004 | <tiêu đề TC> | BR-01 | Chỉ chạy lại | Sẵn sàng chạy lại | Điều kiện và dữ liệu của TC không đổi nhưng dùng chung luồng BR-01, cần chạy hồi quy |

## 5. ĐỀ XUẤT TEST CASE BỔ SUNG (NẾU CÓ)
| Kịch bản đề xuất | Mã nguồn liên quan | Viewpoint | Lý do bổ sung |
|---|---|---|---|
| <mô tả kịch bản điểm biên/nhánh mới> | <BR-01 / FD-01> | <VP-xx> | <lý do theo chuỗi biên QA_STANDARD §6> |

## 6. CHỈ DẪN CẬP NHẬT TRI THỨC & PIPELINE (THEO QA_STANDARD §8)
| Hạng mục | Đích cập nhật | Hành động tiếp theo | Điều kiện thực hiện |
|---|---|---|---|
| Câu hỏi điểm mờ (`MR-xx`) | `knowledge/features/<task-slug>.md` (§7, §8) | Chuyển câu hỏi ở §3 cho BA/PO; khi có phản hồi thì chép nguyên văn và chạy `npm run knowledge:sync -- <task-slug> --write` | Con người (BA/PO) trả lời và phê duyệt |
| Quy tắc & Trường thay đổi (`BR-xx`, `FD-xx`, `AF-xx`) | `OUTPUT/<task-slug>/01_requirement_risk_summary.md` & `knowledge/features/<task-slug>.md` (§3) | Chạy lại skill `01` (`requirement-risk-summary`) để cập nhật bảng BR/FD/AF và tự động ghi vào knowledge §3 | Sau khi các `MR-xx` mới đã chốt (hoặc chạy ngay cho phần đã rõ) |
| Bộ Test Case & Độ phủ | `OUTPUT/<task-slug>/05_test_case_spec.md` & `06_coverage_review.md` | Chạy lại `05` (`test-case-generation`) cho các TC `Sửa giá trị` / `Viết lại` → `npm run lint -- <task-slug>` → `06` (`coverage-review`) | Sau khi cổng `npm run gate <task-slug>` mở (`OPEN`) |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
| 1 | §3 MR-01 | <nội dung câu hỏi cần chốt> | BA / PO |
````

(Sections: 1 updated documents scanned · 2 Delta analysis (old → new) · 3 questions for the BA/PO (unclear points) ·
4 impact on test cases — 4.1 quick summary, 4.2 details per affected test case · 5 proposed additional test cases (if any) ·
6 knowledge & pipeline update instructions (per QA_STANDARD §8).)

> Line 2 is the meta line exactly per QA_STANDARD §7 (one verdict, not bold). Every table has a source column or a trace code (§9).
> New codes take their numbers from `npm run ids -- <task-slug> --assign`; old codes stay unchanged (§9.1). A cell with missing data gets a §2.1 label.
> If section §3, §5 or `## ASK` has no rows, write the text line `Không có` (none) instead of leaving an empty table.

## Acceptance gates (Quality Gates)
- [ ] The file is written exactly to `OUTPUT/<task-slug>/16_cr_impact_analysis.md`; line 2 is the meta line exactly per `QA_STANDARD` §7.
- [ ] Every row of `## 2. PHÂN TÍCH DELTA (CŨ → MỚI)` has `Mã đối tượng`, `Nguồn mới (file §mục)` and a word-for-word `Trích nguyên văn` from a file in `INPUT/<task-slug>/` (except `_superseded/`).
- [ ] No invented new value, new threshold or new error message text: every place the updated documents leave open carries the label `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` and has a matching row in `## 3`.
- [ ] Every new `MR-xx` code takes the next number via `npm run ids -- <task-slug> --assign`, without colliding with codes already in `02_missing_rule_report.md` or `knowledge/features/<task-slug>.md`.
- [ ] 100% of the `TC_ID`s in `05_test_case_spec.md` tagged `Rule#<code>` with a code from the Delta table appear in `## 4.2` with exactly one `Hành động` label (`Sửa giá trị` / `Viết lại` / `Chỉ chạy lại`) and one valid `Trạng thái`.
- [ ] No empty cell in any table (except the 3 columns `Phản hồi chính thức`, `Người trả lời`, `Ngày` of the §3 question table); `npm run lint -- <task-slug>` reports 0 errors and 0 empty-cell warnings.
