# LUẬT TẠO / SỬA SKILL — BẮT BUỘC CHO MỌI AI AGENT

> **Phạm vi:** mọi lần tạo, sửa, đổi tên hoặc gỡ bất kỳ file nào trong `qa-system/` (skill, `AGENT.md`, workflow,
> template, tool) và `knowledge/_system_map.json`. Áp dụng cho mọi công cụ AI (Claude Code, Antigravity, Codex,
> Cursor, Copilot, Gemini…).
>
> **Đọc hết file này trước khi sửa bất kỳ file nào.** Mỗi mục **PHẢI** / **CẤM** là luật cứng, không có ngoại lệ ngầm.
> Gặp tình huống file này không nói tới ⇒ **DỪNG và hỏi người dùng**, không tự suy luận.
>
> Quy trình chi tiết: `qa-system/qa-lead/skills/system-upgrade-governance.md`. File này là phần **luật**; khi hai file
> có vẻ khác nhau, làm theo điều chặt hơn và báo người dùng chỗ khác nhau đó.

---

## 0. Thứ tự nạp

1. File này.
2. `qa-system/qa-lead/skills/system-upgrade-governance.md` — quy trình PHAN_TICH → THI_CONG → NGHIEM_THU.
3. `qa-system/core/QA_STANDARD.md` — để **trỏ tới** đúng số mục, không chép.
4. `qa-system/templates/skills/ten-skill.md` (skill) hoặc `qa-system/templates/AGENT.md` (agent) — khuôn bắt buộc.
5. `npm run map -- <từ khoá>` để biết hệ thống đang có gì. **CẤM** mở thẳng file `.json`; dùng `npm run json`.

---

## 1. Cổng dừng — phải có người duyệt

**PHẢI** chạy PHAN_TICH trước và **DỪNG** chờ người dùng đồng ý rõ ràng ("đồng ý", "làm đi") rồi mới sửa file.
Câu hỏi của người dùng (kể cả "có nên…?") **không phải** lệnh sửa.

Output PHAN_TICH bắt buộc gồm:

| Mục | Nội dung |
|---|---|
| Yêu cầu gốc | Nguyên văn câu người dùng |
| Cây A/B/C | Trả lời đủ 3 câu (§2), mỗi câu một lý do có tên file đã tra |
| Kết luận | `[A]` / `[B]` / `[C]` + agent đích |
| Đặt tầng | Bảng §3 cho từng nội dung sẽ viết |
| Số deliverable | Nếu sinh file output mới (§5.3) |
| 7 điểm neo | Danh sách file sẽ sửa (§6) |
| Bán kính | Kết quả thật của `npm run agent:check -- --impact <agent>` |

**Luôn hỏi người dùng, không tự quyết** (Human-Final):
- Sửa `qa-system/core/QA_STANDARD.md`.
- Chọn `[B]` (agent mới), hoặc ranh giới A/B mập mờ.
- Gỡ / đổi tên / thay thế skill hoặc agent đang có.
- Đổi thứ tự chặng của pipeline chính, hoặc nới / bỏ một cổng (ASK, lint, readiness, hook, pre-commit).
- Chấp nhận khi nghiệm thu §7 chưa xanh hết.

---

## 2. Phân loại — dừng ở câu đầu tiên có đáp án

1. Chỉ đổi **hành vi** của một skill đang có (thêm trường, siết luật, đổi format, thêm bước)? ⇒ **`[C]` sửa tại chỗ**.
2. Có agent nào đang sở hữu đúng mảng việc (tra `specialized_agents`)? Không ⇒ **`[B]`**.
3. Giao cho agent đó có vượt một vai trò không — phải đọc loại artifact khác hẳn, ghi vào phân vùng khác, hoặc mô tả
   "Là ai" phải thêm "và cũng…"? Có ⇒ **`[B]`**. Không ⇒ **`[A]` thêm skill vào agent đó**.

**CẤM** dựng agent mới khi `[A]` đủ. **CẤM** gộp hai việc khác vai trò vào một skill cho nhanh.

---

## 3. Đặt tầng — mỗi nội dung đúng một chỗ

| Nội dung | Chỗ duy nhất | CẤM |
|---|---|---|
| Luật mọi skill phải theo; bảng chuẩn ≥ 2 skill dùng | `qa-system/core/QA_STANDARD.md` (Human-Final) | Chép lại vào skill / `AGENT.md` / `AGENTS.md` |
| Dữ kiện của một tính năng: giá trị, ngưỡng, chữ thông báo, mã lỗi | `knowledge/features/<slug>.md` | Đưa vào skill, template, ví dụ |
| Quy ước cả dự án | `knowledge/_project.md` (con người khai) | Agent tự điền |
| Cách làm, tham số, format output riêng của một việc | `qa-system/qa-<agent>/skills/<ten-skill>.md` | Nhét danh tính / quyền hạn vào skill |
| Danh tính, quyền hạn, ranh giới, bàn giao, Human-Final | `qa-system/qa-<agent>/AGENT.md` | Nhét quy trình chi tiết vào `AGENT.md` |

---

## 4. Luật viết skill — chống bịa và chống lệch

| # | PHẢI | CẤM |
|---|---|---|
| R1 | Dòng đầu: `> Tuân thủ qa-system/core/QA_STANDARD.md (§…)` và **trỏ số mục** cho mọi luật chung | Chép bảng verdict, nhãn, FACT, 06W, chuỗi biên, luật ghi knowledge, thang đo |
| R2 | Ví dụ dùng chỗ giữ chỗ trung tính: `<field>`, `<ngưỡng>`, `BR-01`, `<MODULE>-001` | Ví dụ của một dự án / miền thật (voucher, đăng nhập, hoàn tiền, số tiền, chữ thông báo thật) — model chép ví dụ thành dữ kiện |
| R3 | Mục "Đầu vào" liệt kê đủ file cần đọc **và** `knowledge/_project.md` + `knowledge/features/<slug>.md`; thiếu đầu vào bắt buộc ⇒ DỪNG | "Nếu thiếu thì tự suy ra / dùng giá trị hợp lý / theo kinh nghiệm ngành" |
| R4 | Thiếu giá trị trong nguồn ⇒ nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` hoặc câu hỏi cho BA (QA_STANDARD §2.1) | Lấp chỗ trống; dùng `[GIẢ ĐỊNH]` trong ô giá trị |
| R5 | Số lượng là hệ quả của nguồn; quét theo bảng / ma trận đóng, quét xong là dừng | Chỉ tiêu "ít nhất N câu hỏi / test case / bản ghi" |
| R6 | Việc máy làm được thì gọi lệnh: mã ⇒ `npm run ids -- <slug> --assign`; khung ⇒ `npm run scaffold`; điểm biên ⇒ `npm run boundary`; dữ liệu > 10 bản ghi ⇒ `npm run data:gen` | Bảo model tự đếm số, tự kẻ khung cố định, tự tính điểm biên |
| R7 | Ghi **đúng một** file output trong `OUTPUT/<slug>/`; dòng 2 là dòng meta `Owner: … · Nguồn: … · Verdict: PASS/FIX/ASK` (QA_STANDARD §7) | Nhiều file output; verdict in đậm hoặc nằm ngoài 10 dòng đầu |
| R8 | Mọi bảng có cột nguồn (`file §mục`) hoặc mã trace (§9); dòng có giá trị cụ thể kèm trích nguyên văn khi skill bóc từ tài liệu | Bảng không truy được nguồn |
| R9 | Câu hỏi cho BA là câu **đóng** (Có/Không, một con số, chọn phương án) | "Hệ thống xử lý thế nào?" |
| R10 | Mục "KHÔNG được (riêng skill này)" nêu ranh giới với bước trước / sau | Skill làm việc của chặng khác (scope creep) |
| R11 | Mục "Chốt chặn nghiệm thu" là checklist **kiểm được bằng lệnh hoặc bằng mắt có tiêu chí** | Checklist mơ hồ ("đảm bảo chất lượng tốt") |
| R12 | Skill và tool **không được nói ngược nhau**: skill yêu cầu format / bước nào thì lint, schema, gate phải chấp nhận đúng format / bước đó | Đổi format output mà không sửa `lint-deliverables.js` / `lib/schema.js` + test trong cùng lần |
| R13 | Chữ trong skill viết một nghĩa; tên verdict, mã, tên mục dùng đúng như QA_STANDARD | Đặt tên mới cho khái niệm đã có |

---

## 5. Khuôn, tên và số

1. Skill mới **PHẢI** copy từ `qa-system/templates/skills/ten-skill.md`; agent mới từ `qa-system/templates/AGENT.md`.
   **CẤM** còn sót placeholder `<…>` của khuôn trong file đã xong.
2. Tên file skill = `name` trong frontmatter = tên ghi ở `## Skill sở hữu` của `AGENT.md` — khớp **từng ký tự**.
   Đường dẫn đúng hoa/thường: `qa-system/qa-*/`, `OUTPUT/`, `INPUT/`, `qa-system/workflows/`.
3. Deliverable mới lấy số **kế tiếp sau số lớn nhất** trong bảng §2 của `qa-system/workflows/WORKFLOW.md`.
   **CẤM** chèn giữa, dùng lại số, hai deliverable chung số. Biến thể của bước có sẵn dùng hậu tố chữ (`06b_`).
4. **CẤM** đổi tên file deliverable mà tool đang đọc (gate, lint, readiness, merge, export) nếu chưa sửa tool + test.

---

## 6. Lan truyền — đủ 7 điểm neo mới tính là xong

| # | File | Cập nhật | `[A]` | `[B]` | `[C]` |
|---|---|---|:-:|:-:|:-:|
| N1 | `qa-system/qa-<agent>/skills/<ten>.md` | Nội dung theo §4–§5 | PHẢI | PHẢI | PHẢI |
| N2 | `qa-system/qa-<agent>/AGENT.md` | `## Skill sở hữu` (+ bảng kỹ năng nếu có) | PHẢI | PHẢI | — |
| N3 | `qa-system/workflows/WORKFLOW.md` | Bảng §2 (agent · skill · vào · ra); §1 nếu mở nhánh | PHẢI | PHẢI | nếu đổi vào/ra |
| N4 | `knowledge/_system_map.json` | `npm run map:sync` (`routing_table`; `specialized_agents` khi `[B]`) | PHẢI | PHẢI | — |
| N5 | `qa-system/qa-lead/AGENT.md` | §2 ma trận điều phối + §5 câu người dùng nói để kích hoạt | PHẢI | PHẢI | nếu đổi đầu ra |
| N6 | `qa-system/tools/system/agent-doctor.js` | `PIPELINE_DEPENDENCIES` (`skill`, `produces`, `consumed_by`) | nếu có deliverable mới | PHẢI | — |
| N7 | `lint-deliverables.js` · `lib/schema.js` · `__tests__/` | Luật kiểm + parser + test cho format mới | nếu tool đọc | nếu tool đọc | nếu đổi format tool đọc |

`[B]` thêm: tạo `qa-system/qa-<tên>/skills/`; `AGENT.md` có mục `Human-Final`; mục `Knowledge` mặc định **không ghi**;
cập nhật bảng thư mục trong `qa-system/README.md`.

Mỗi dòng phải ở trạng thái `ĐÃ XONG` hoặc `KHÔNG ÁP DỤNG` **kèm lý do**. Còn dòng trống ⇒ verdict `FIX`, chưa được báo xong.

---

## 7. Nghiệm thu — "xong" chỉ khi có bằng chứng thật

**PHẢI** chạy và dán **kết quả thật** (không viết "OK" khi chưa chạy):

```bash
npm test                              # toàn bộ xanh; đụng qa-system/tools/ ⇒ thêm test tái hiện thay đổi (đỏ trước, xanh sau)
npm run agent:check                   # INTACT
npm run agent:check -- --impact <agent>
npm run map:sync
npm run workflow -- validate
```

**PHẢI** chạy thật skill mới / skill vừa sửa **hai lần, mỗi lần một phiên mới**, trên bộ đề chuẩn:

```bash
npm run intake -- docs/skill-lab/de-bai --slug <slug-lan-1> --force
npm run intake -- docs/skill-lab/de-bai --slug <slug-lan-2> --force
# … chạy tới chặng skill ảnh hưởng ở từng slug …
npm run diff-runs -- OUTPUT/<slug-lan-1> OUTPUT/<slug-lan-2>
npm run lint -- <slug-lan-1>          # 0 lỗi
```

- Mọi khác biệt giữa hai lần **phải giải thích được bằng một câu trong skill**. Không giải thích được ⇒ skill còn chỗ
  cho model tự sáng tác ⇒ quay lại §4, verdict `FIX`.
- **PHẢI** chạy lại một chặng cũ **không liên quan** để chứng minh luồng cũ vẫn ra như trước.
- **PHẢI** thử định tuyến: gõ một câu tự nhiên của người dùng, QA Leader gọi đúng skill.
- Xong việc, **PHẢI** dọn các task thử (`INPUT/<slug>`, `OUTPUT/<slug>`, `knowledge/features/<slug>.md`).

Lệnh rà đường dẫn sai (không in ra gì là sạch):

```bash
grep -rn "output/\|_shared/\|agents/qa-\|workflow/[a-z]" --include=*.md qa-system knowledge | grep -v "workflows/"
```

---

## 8. Git

1. **PHẢI** làm trên nhánh riêng; **CẤM** sửa thẳng `develop` / `main`.
2. **PHẢI** tách commit: (a) thay đổi `qa-system/` + `knowledge/_system_map.json`; (b) dữ liệu chạy thử
   (`INPUT/`, `OUTPUT/`, `knowledge/features/`). Chỉ (a) được đưa sang `develop`.
3. **CẤM** `git commit --no-verify` để lách pre-commit. **CẤM** commit / push khi người dùng chưa yêu cầu.
4. Biên bản nâng cấp để **ngoài repo** (người dùng chọn nơi lưu), không commit.

---

## 9. Báo cáo cuối — đúng khuôn

```markdown
# BIÊN BẢN NÂNG CẤP · <ten-nang-cap>
Owner: qa-system/qa-lead/skills/system-upgrade-governance.md · Ngày: <YYYY-MM-DD> · Verdict: <PASS/FIX/ASK>

1. Yêu cầu gốc: <nguyên văn>
2. Quyết định: [A]/[B]/[C] vào <agent> — lý do 3 câu
3. Đặt tầng: <bảng>
4. 7 điểm neo: <bảng N1–N7, trạng thái + lý do>
5. Nghiệm thu: <kết quả thật từng lệnh §7; tập mã + verdict hai lần chạy; giải thích từng khác biệt>
6. Việc cần người quyết: <…>
```

---

## 10. Tự kiểm trước khi báo "xong" — một ô chưa tick là chưa xong

- [ ] Người dùng đã duyệt PHAN_TICH bằng lời rõ ràng.
- [ ] Không sửa `QA_STANDARD.md` / không gỡ skill / không nới cổng khi chưa được đồng ý.
- [ ] Skill trỏ QA_STANDARD, không chép luật (R1); không có ví dụ miền thật (R2).
- [ ] Đầu vào có knowledge; thiếu ⇒ DỪNG (R3). Thiếu giá trị ⇒ nhãn, không lấp (R4). Không chỉ tiêu (R5).
- [ ] Mã / khung / điểm biên do lệnh sinh (R6). Một file output, dòng meta đúng (R7). Bảng có cột nguồn (R8).
- [ ] Skill và tool khớp nhau; đổi format ⇒ đã sửa lint/schema + test (R12).
- [ ] Không còn placeholder `<…>`; tên file = `name` = dòng `Skill sở hữu`.
- [ ] 7 điểm neo: mỗi dòng ĐÃ XONG hoặc KHÔNG ÁP DỤNG kèm lý do.
- [ ] `npm test` xanh · `agent:check` INTACT · `map:sync` · `workflow -- validate` — kết quả thật đã dán.
- [ ] Chạy thật hai lần + `diff-runs`, mọi khác biệt giải thích được; chặng cũ không liên quan vẫn ra như trước.
- [ ] Đã thử định tuyến bằng một câu tự nhiên. Đã dọn task thử.
- [ ] Nhánh riêng, commit tách đúng §8, không `--no-verify`.
