# Bắt đầu bài thi cuối khóa với Antigravity — `shopgo-refund-v1`

> **File này dành cho học viên VÀ cho trợ lý AI (Antigravity).**
> Học viên chỉ cần đọc **Phần A**. Phần B và C là hướng dẫn để trợ lý AI tự làm thay bạn.

---

## Phần A — Dành cho học viên (đọc 2 phút)

### Bạn cần chuẩn bị (một lần)

1. **Mã học viên** do giảng viên cấp (ví dụ `hv001`).
2. **Tài khoản GitHub** đã được giảng viên thêm vào repository bài thi
   (bạn gửi tên tài khoản GitHub cho giảng viên → mở email/thông báo GitHub → bấm **Accept invitation**).
3. Máy đã cài **Git** (https://git-scm.com/downloads) và **Node.js** bản 20 trở lên
   (khuyên dùng bản LTS mới nhất từ https://nodejs.org).
4. Máy đã **đăng nhập GitHub cho Git**:
   - **Windows:** Git for Windows có sẵn Git Credential Manager — lần push đầu tiên sẽ mở cửa sổ trình duyệt
     để bạn đăng nhập GitHub. Chỉ cần bấm đăng nhập.
   - **macOS / Linux (hoặc nếu cách trên không hiện):** cài GitHub CLI (https://cli.github.com), rồi chạy
     `gh auth login` và `gh auth setup-git` — tự bạn đăng nhập trên trình duyệt.

   **Không bao giờ gửi mật khẩu hay token vào khung chat.**

Bạn không cần biết lệnh Git, nhánh (branch) hay JSON. Trợ lý AI sẽ làm và báo lại kết quả thật.

### Bắt đầu (START)

Kéo file này vào Antigravity rồi gửi (thay `hv001` bằng mã của bạn):

> Tôi là học viên hv001. Hãy đọc file đính kèm và tự động chuẩn bị môi trường thi cuối khóa cho tôi. Sau khi thiết lập xong, hãy hướng dẫn tôi bắt đầu làm bài.

hoặc ngắn hơn:

> Tôi là học viên hv001. Hãy thiết lập bài thi cuối khóa cho tôi theo file hướng dẫn.

Chạy lại câu này bao nhiêu lần cũng được: bài đã làm **không bị xoá hay ghi đè**. START chỉ commit các file
nộp bài chưa từng được commit (lần tạo đầu tiên); phần bạn đang làm dở được giữ nguyên trên máy và chỉ được đưa lên GitHub khi
bạn dùng lệnh SUBMIT.

### Nộp bài (SUBMIT)

Khi làm xong (hoặc muốn lưu tiến độ lên GitHub), gửi:

> Tôi đã hoàn thành bài thi. Hãy kiểm tra toàn bộ kết quả, cập nhật submission.json theo các file thực tế, chạy self-check, commit và push bài lên nhánh của tôi.

Bạn nộp được nhiều lần trước hạn chót **2026-12-15 23:59 (giờ Việt Nam)**. Lần push cuối cùng trước hạn
chót là bài được chấm.

### Kết quả thường gặp

| Bạn thấy | Nghĩa là |
|---|---|
| `SUCCESS` + `VALID_WITH_GAPS` | **Bình thường khi mới bắt đầu.** "GAP" = phần bài bạn chưa làm. |
| `SUCCESS` + `VALID` | Bài đầy đủ về hình thức (chưa phải là điểm đạt). |
| `NOT_AUTHENTICATED` | Máy chưa đăng nhập GitHub → làm bước 4 ở trên, rồi START lại. |
| `NO_WRITE_ACCESS` | Tài khoản chưa được thêm vào repository → báo giảng viên, chấp nhận lời mời, rồi START lại. |
| `GIT_IDENTITY` | Trợ lý sẽ hỏi họ tên + email GitHub của bạn (không phải mật khẩu). |
| `BAD_STUDENT_ID` | Mã học viên sai dạng (chỉ chữ thường, số, dấu gạch ngang, không dấu cách) → gửi lại đúng mã. |
| `NETWORK` | Mất mạng hoặc bị chặn GitHub → kiểm tra Wi-Fi/VPN rồi chạy lại. |
| `SELF_CHECK_INVALID` | Bài có lỗi chặn (ví dụ sửa nhầm file trong `INPUT/` hoặc `EXAM/brief/`). Chưa có gì được push. Trợ lý sẽ chỉ lệnh khôi phục — đồng ý thì nó chạy. |
| `NOT_ON_STUDENT_BRANCH` | Thư mục đang không ở nhánh bài thi → gửi lại câu lệnh START. |
| `DIRTY_OTHER_BRANCH`, `BEHIND_WITH_CHANGES`, `DIVERGED`, `STARTER_MISMATCH`, `NOT_FROM_STARTER`, `PUSH_FAILED` | Dừng lại, gửi thông báo cho giảng viên. **Không xoá thư mục, không làm lại từ đầu.** |

---

## Phần B — Instructions for the AI agent (Antigravity)

You are setting up and later submitting a graduation exam for a **beginner**. Talk to the student in
**Vietnamese**, simply, without Git jargon. Use your terminal and file tools to do the work yourself.

### B.0 Fixed facts — never change them

| Item | Value |
|---|---|
| Repository | `https://github.com/tuyendv-d3bu9/cw-agent-updated.git` |
| Exam id | `shopgo-refund-v1` (task slug `shopgo-refund`) |
| Frozen starter tag | `exam/shopgo-refund-v1/starter` → commit `50c2a7fb690699a5bedfc13f5e296ecf9b9a5fc6` |
| Student branch | `exams/<student-id>` |
| Helper script | `docs/exam/student-setup.js` on branch `origin/develop` (copied into the git-ignored `.scratch/` folder) |
| Workspace | `<HOME>/cw-exam/cw-agent-updated` (`<HOME>` = output of `node -p "require('os').homedir()"`) |

### B.1 Hard rules

1. **Never** force-push, rebase, reset, stash, `git clean`, delete files or delete branches.
2. **Never** push anything except `exams/<student-id>` (the helper pushes only that ref).
   Never commit to or push `exams/shopgo-refund-v1`, `develop`, `main`, a tag, or another student's branch.
3. **Never** overwrite existing student work or existing files in `EXAM/`.
4. **Never** ask for, type, store or print passwords, tokens or keys. The student logs in themselves.
5. **Never** invent exam content: no business rules, values, test cases, evidence, command output, decisions,
   anchor reasons, approver names or AI-use statements. Only the student's real files count.
6. Report **SUCCESS only when the helper's final `RESULT` line says `"status":"SUCCESS"`** — it is printed
   only after `git ls-remote` confirms the pushed commit on GitHub.
7. `npm run exam:check` exits `1` while work is incomplete. That is expected: judge it by its
   **Preflight** status. `VALID_WITH_GAPS` is the **normal** result at the start.
8. Show real output. If something fails, explain it in Vietnamese and give the next action from the
   `next_vi` field. Do not improvise a workaround that breaks rules 1–5.

### B.2 START workflow

Run every command yourself; replace `<WS>` with the absolute workspace path and `<ID>` with the id.

1. **Student id.** Take it from the student's message. Lower-case it. It must match
   `^[a-z0-9]+(-[a-z0-9]+)*$` (for example `hv001`). If it is missing or invalid, ask the student for it and stop.
2. **Tools.** Run `git --version`, `node --version`, `npm --version`. Node must be ≥ 20.
   Never use `sudo`, and do not install software yourself unless the student asks you to. If one is missing,
   tell the student what to install (Phần A, item 3) and stop.
3. **Workspace.**
   - If `<WS>` does not exist: `git clone https://github.com/tuyendv-d3bu9/cw-agent-updated.git "<WS>"`
   - If it exists: `git -C "<WS>" remote get-url origin` must be the repository above. If it is something
     else, **do not touch it**: use `<HOME>/cw-exam/cw-agent-updated-2` instead and tell the student.
4. **Helper (refresh every run).**
   ```
   git -C "<WS>" fetch origin develop
   node -e "const cp=require('child_process'),fs=require('fs'),p=require('path');const ws=process.argv[1];const src=cp.execFileSync('git',['-C',ws,'show','origin/develop:docs/exam/student-setup.js']);fs.mkdirSync(p.join(ws,'.scratch'),{recursive:true});fs.writeFileSync(p.join(ws,'.scratch','student-setup.js'),src);console.log('helper ready')" "<WS>"
   ```
5. **Run the setup** (from `<WS>`), with the id in double quotes: `node .scratch/student-setup.js start "<ID>"`
   (`.scratch/` is excluded from git locally by the helper; it is never committed).

   It does, in order, and stops with a clear Vietnamese message at the first problem:
   validate the id → check tools → verify the origin is the official repository → fetch and verify the
   starter tag commit → dry-run push to check GitHub write access (changes nothing) → create
   `exams/<ID>` from the starter, **or** resume it (local or GitHub) without losing work → create
   `EXAM/submission.json`, `EXAM/DECISIONS.md`, `EXAM/AI_USE.md` from the official templates **only if they
   are missing** (student id, branch and starter commit filled in) → `npm ci` → `npm run exam:check` →
   commit **only those of the three files that were never committed** (never edits to committed files) → push `exams/<ID>` →
   confirm it on GitHub with `git ls-remote`.
6. **Read the last line** `RESULT {...}`:
   - `"status":"SUCCESS"` → tell the student (in Vietnamese) the branch, the GitHub link (`facts.web`), the
     self-check status, then do **B.4** (explain the three tasks) and B.5.
   - `"status":"ACTION_REQUIRED"` → explain `message_vi` and `next_vi`. For `GIT_IDENTITY`, ask the student
     for their name and the email of their GitHub account, run
     `git -C "<WS>" config user.name "<name>"` and `git -C "<WS>" config user.email "<email>"`, then re-run step 5.
     For `NOT_AUTHENTICATED` / `NO_WRITE_ACCESS`, the student must act (log in / accept the invitation);
     re-run step 5 after they confirm.
   - `"status":"FAILED"` → explain, show the helper's message, and tell the student to contact the instructor.
7. Open `<WS>` as the workspace in Antigravity so later work happens on the exam branch.

**What the initial manifest contains.** Only facts are filled in. Fields the schema forces to a fixed
choice get a neutral default that the student must replace: `decision_class` = `"A"` (the first allowed
value, **not** a recommendation), every anchor `"n/a"` without a reason, and T2 paths
`qa-system/qa-your-new-agent/...`. The self-check reports these as gaps (G-03, G-04) until the student
fills them in. Say this to the student.

### B.3 SUBMIT workflow

1. Refresh the helper (B.2 step 4), then in `<WS>`: `node .scratch/student-setup.js inventory`.
   It changes nothing and writes `.scratch/exam-inventory.json` (changed files vs the starter, stage files
   present, batches, new agent folders, tests changed, placeholders left in `DECISIONS.md` / `AI_USE.md`,
   read-only paths changed).
2. Update **only the judgment fields** of `EXAM/submission.json`, and **only from evidence**:

   | Field | Fill from | If the evidence is missing |
   |---|---|---|
   | `t1_customized_agent.decision_class` | The **Conclusion** row of `## t1` in `EXAM/DECISIONS.md` | Leave it; report "T1 decision not recorded" |
   | `t1_customized_agent.changed_files` | Files in `t1_candidates` that the student changed **for T1** (ask if a file could belong to T2) | `[]` |
   | `t1_customized_agent.anchors` | `done` only if a matching file is in `changed_files` (N1 `qa-test-design/skills/*.md`, N2 `qa-test-design/AGENT.md`, N3 `WORKFLOW.md`, N4 `_system_map.json`, N5 `qa-lead/AGENT.md`, N6 `agent-doctor.js`, N7 `lint-deliverables.js` or `lib/schema.js`); otherwise `n/a` | — |
   | `t1_customized_agent.anchor_reasons` | The reason the student wrote for that anchor in the `## t1` anchor table | Leave it out; report the gap. **Never write a reason yourself** |
   | `t1_customized_agent.tests_added`, `t2_new_agent.tests_added` | `tests_changed`, split by which task each test covers | `[]` |
   | `t2_new_agent.agent_folder`, `agent_file`, `skills` | `new_agent_folders` (exactly one) and its `AGENT.md` / `skills/*.md` | Keep the placeholder; report "T2 agent not created" |
   | `t2_new_agent.example_output` | The new `OUTPUT/shopgo-refund/17_*.md` file | Keep the placeholder |
   | `t2_new_agent.registrations` | Those of the five registration files (T2 brief §2 + `qa-system/README.md`) that the student actually changed for T2 | `[]` |

   Do not touch any other field. Do not create or edit exam artifacts, `DECISIONS.md` or `AI_USE.md` in this
   workflow. If `read_only_changed` is not empty, `submit` stops with `SELF_CHECK_INVALID` and its `next_vi`
   lists the exact per-file commands: `git restore` for starter files that were edited or deleted, and
   "move out of the read-only folder" for files the student added there. Run them only after the student
   says yes; never delete a file.
3. Run `node .scratch/student-setup.js submit`. It re-verifies the branch and starter, syncs the factual
   fields (identity, starter commit, stage paths or `null`, batches, blueprint, gate log), runs
   `npm run exam:check`, **refuses to commit if the result is `INVALID`**, otherwise commits everything on
   the branch, pushes `exams/<ID>` and confirms it on GitHub.
4. Report truthfully in Vietnamese: the pushed commit, the Preflight status, **every remaining GAP**, the
   public checks that FAIL, and any `<…>` placeholders still in `DECISIONS.md` / `AI_USE.md`. Never call an
   incomplete submission complete. A clean self-check means "well-formed", not "passed".

### B.4 Explain the three tasks (in Vietnamese)

After a successful START, explain the following to the student, then point to the files in `EXAM/brief/`.
Do not add requirements that are not in the brief.

---

## Phần C — Ba nhiệm vụ của bài thi (trợ lý AI giải thích lại cho học viên)

Đề đầy đủ: `EXAM/brief/README.md`, `T1.md`, `T2.md`, `T3.md`, `RUBRIC.md` trong thư mục bài thi.
Bài thi **mở tài liệu, được dùng AI**, nhưng mọi quy tắc nghiệp vụ và giá trị phải lấy từ
`INPUT/shopgo-refund/` (không lấy từ bài mẫu hay đáp án ở nơi khác).

| Nhiệm vụ | Bạn làm gì | Điểm tự động |
|---|---|---|
| **T1** — Tuỳ biến agent có sẵn | Sửa agent `qa-test-design` (skill `test-case-generation`) để **mọi test case có thêm trường bắt buộc `Risk Ref`**: một hoặc nhiều mã `RK-xx` từ bảng rủi ro của file `01`, hoặc `N/A — <lý do>`. Sửa lint để báo lỗi khi thiếu/sai, thêm test chứng minh. Làm theo quy trình nâng cấp hệ thống (phân loại A/B/C, 7 điểm neo N1–N7). | A2: 12 |
| **T2** — Tạo agent mới | Tạo thư mục agent mới `qa-system/qa-<tên>/` có skill **kiểm tra truy vết yêu cầu → test case** (yêu cầu nào chưa có test case, test case nào trỏ tới mã không tồn tại). Đăng ký agent ở 5 nơi, chạy skill một lần để tạo `OUTPUT/shopgo-refund/17_<tên>.md`. | A3: 14 |
| **T3** — Chạy pipeline 01 → 06 | Chạy quy trình QA từ giai đoạn 01 đến 06 cho tính năng **yêu cầu hoàn tiền** của ShopGo, chỉ dựa trên `INPUT/shopgo-refund/`. Viết `00_plan.md` trước. Câu hỏi nào INPUT không trả lời được thì **ghi thành câu hỏi (OQ/MR), không tự đoán**; để đi tiếp khi cổng ASK đóng, ghi một "proceed decision" ở mục §8 theo `T3.md` §2. | A4: 14, A5: 14 |

Thêm vào đó: **A1** (8) tuân thủ framework, **A6** (8) test cho phần sửa công cụ, và **30 điểm giảng viên**
(I1 phân tích rủi ro, I2 thiết kế test, I3 bảo vệ trực tiếp). Đạt khi tổng ≥ 60, đạt mức tối thiểu
pipeline và I3 ≥ 4 (chi tiết trong `RUBRIC.md`).

Ngoài các file bài làm, bạn tự điền:

- `EXAM/DECISIONS.md` — lý do các quyết định của bạn và **kết quả lệnh thật** (không đoán).
- `EXAM/AI_USE.md` — bạn đã dùng công cụ AI nào, cho việc gì, và bạn tự kiểm tra gì.

**Gợi ý thứ tự:** đọc `EXAM/brief/README.md` → làm **T3** (pipeline, vì T2 cần file `01` và `05`) →
**T1** → **T2** → điền `DECISIONS.md`, `AI_USE.md` → gửi câu lệnh SUBMIT. Hãy nhờ trợ lý AI chạy lệnh và
dán kết quả thật; bạn phải hiểu và giải thích được mọi thứ trong buổi bảo vệ.

### B.5 Close the START conversation with

- the GitHub link to the branch (`facts.web`);
- "Trạng thái `VALID_WITH_GAPS` là bình thường lúc bắt đầu";
- the SUBMIT sentence from Phần A, and the deadline 2026-12-15 23:59 (UTC+07:00).
