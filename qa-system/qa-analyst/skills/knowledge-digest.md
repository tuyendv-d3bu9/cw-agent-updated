---
name: knowledge-digest
description: >
  Chưng cất khối tài liệu lớn (hàng chục tới hàng trăm file trong INPUT/<slug>/) theo từng lô vừa
  context: mỗi tài liệu ra một thẻ quy tắc có trích nguồn, rồi gộp thành 00_knowledge_digest.md
  để skill 01 đọc thay cho tài liệu thô. Chạy lại chỉ xử lý tài liệu mới hoặc đã đổi.
---

# Skill: knowledge-digest

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard §2 · FACT §3 · luật knowledge §8 · nguồn & ưu tiên §10).

## Mục đích
Skill `requirement-risk-summary` đọc một lượt toàn bộ tài liệu thô. Với vài file thì ổn, với 100–200
file thì tràn context hoặc agent chỉ đọc lướt và bỏ sót quy tắc. Skill này chia việc thành hai pha:

- **Trích (từng lô):** đọc đúng các tài liệu trong một lô, mỗi tài liệu ra một thẻ ngắn gồm quy tắc,
  hằng số, luồng, điểm mơ hồ. Mỗi dòng ghi vị trí nguồn **và đoạn trích nguyên văn** — skill `01` chép
  đoạn này vào cột `Trích nguyên văn`, `npm run lint` dò lại nó trong `INPUT/`.
- **Gộp:** đọc mọi thẻ còn hiệu lực rồi hợp nhất thành `00_knowledge_digest.md`: gộp ý trùng, phơi
  mâu thuẫn giữa các tài liệu.

## Đầu vào
- `OUTPUT/<task-slug>/00_digest_plan.md` — do `npm run knowledge:digest <slug>` sinh ra: lô nào cần chạy,
  tài liệu nào trong lô, thẻ cũ nào phải bỏ.
- Các tài liệu liệt kê trong lô đang chạy, **chỉ những tài liệu đó** (tool đã bỏ `_superseded/` — bản cũ không vào lô).
- `OUTPUT/<task-slug>/knowledge_digest/batch_*.md` — thẻ của các lần chạy trước (pha Gộp).
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` nếu có.

> Chưa có `00_digest_plan.md` → chạy `npm run knowledge:digest <slug>` trước. Không tự chia lô bằng mắt.
> Tài liệu quá lớn đã được tool cắt sẵn theo heading: ghi chú lô dạng `phần k/n: dòng a–b (§ heading)` —
> chỉ đọc đúng khoảng dòng đó, không tự cắt lại.

## KHÔNG được (riêng skill này)
- **Không ghi `knowledge/`.** Theo §8 chỉ skill `01` và `02` được ghi. Skill này bàn giao digest cho `01`.
- Không đọc tài liệu ngoài lô đang chạy trong pha Trích. Nạp thêm là phá đúng thứ skill này sinh ra để tránh.
- Không ghi một dòng nào không có vị trí nguồn và trích nguyên văn. Không tìm được mục/đoạn → không ghi.
- Không diễn đạt lại ở cột `Trích nguyên văn` — chép đúng từng chữ, kể cả lỗi chính tả của nguồn.
- Không coi phần `## Annotations / Pending changes` (comment, tracked changes, "DRAFT") là quy tắc —
  ghi `Loại` = `Chưa chốt`. Tracked change trong thân bài hiện dạng `{--cũ--}{++mới++}`: ghi **cả hai** giá trị,
  `Loại` = `Chưa chốt` — không chọn giá trị nào.
- Không tự phân xử theo cảm tính khi hai tài liệu nói khác nhau — chỉ theo QA_STANDARD §10.2 (bước 7).
- Không đánh rủi ro, không sinh viewpoint hay test idea. Đó là việc của `01`→`04`.

## Các bước

### Pha Trích — lặp cho từng lô trong `00_digest_plan.md` §2
1. Đọc các tài liệu của lô. Tài liệu ghi chú *"quá ngân sách, tách theo mục"* → đọc lần lượt từng
   mục lớn, không nạp cả file một lần.
2. Mỗi tài liệu ra **một khối thẻ**, mở đầu bằng dòng đóng dấu chép **nguyên văn** đường dẫn và sha256
   từ kế hoạch. Tool đọc lại dòng này để biết tài liệu đã xong:
   `### DOC: <đường dẫn> · sha256:<12 ký tự>`
   Ngay dưới, một dòng `Phiên bản: <version/ngày ghi trong tài liệu, hoặc [CHƯA CÓ TRONG TÀI LIỆU]>` —
   dùng để phân xử bản mới hơn ở pha Gộp.
3. Tài liệu không có nội dung nghiệp vụ (biên bản họp lạc đề, ảnh trống…) vẫn ghi khối thẻ với một dòng
   `Không có nội dung nghiệp vụ`, để lần sau không bị đưa vào lô nữa.
4. Ghi ra `OUTPUT/<task-slug>/knowledge_digest/<tên lô>.md`, đúng tên lô trong kế hoạch.

### Pha Gộp — một lần, sau khi mọi lô đã xong
5. Đọc mọi `batch_*.md`. **Bỏ** các khối thẻ được liệt kê ở `00_digest_plan.md` §3 (bản cũ của tài liệu
   đã đổi, hoặc tài liệu đã gỡ).
6. Hợp nhất: cùng một ý từ nhiều tài liệu → một dòng, cột nguồn liệt kê đủ các tài liệu.
7. Cùng một chủ đề mà giá trị khác nhau (ngưỡng, thông báo, quyền…) → đưa vào §3 Mâu thuẫn và áp
   QA_STANDARD §10.2: phân xử được (khác mức ưu tiên, hoặc cùng mức nhưng phiên bản/ngày rõ ràng) ⇒ ghi
   bên thắng + lý do; không phân xử được ⇒ `Chưa phân xử`. Skill `01` biến dòng `Chưa phân xử` thành `OQ`.
8. Tổng thẻ quá lớn để đọc một lượt → gộp theo từng ngăn (`01_business`…`05_communication`) trước,
   rồi gộp các bản ngăn.

## Format output

Thẻ của một lô — `OUTPUT/<task-slug>/knowledge_digest/batch_NN.md`:

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

`Loại` ∈ `Quy tắc` · `Field` · `Hằng số` · `Luồng` · `Tác nhân` · `Ngoài phạm vi` · `Mơ hồ` · `Chưa chốt`.
`Ngoài phạm vi` chỉ dùng khi tài liệu **nói rõ** là không làm.

Bản gộp — `OUTPUT/<task-slug>/00_knowledge_digest.md`:

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
````

Mục trống ghi `Không có`, không để bảng rỗng. **Verdict**: `PASS` khi mọi lô đã gộp đủ và mọi dòng có nguồn +
trích; `FIX` khi còn thiếu. Mâu thuẫn **không** làm digest thành `ASK` — chúng đi tiếp thành `OQ` ở 01 rồi `MR` ở 02.

## Bàn giao
- `00_knowledge_digest.md` → `requirement-risk-summary` đọc thay cho tài liệu thô, giữ nguyên cột nguồn và trích nguyên văn.
- §3 dòng `Chưa phân xử` + §4 → `requirement-risk-summary` ghi thành `OQ-xx`.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mọi tài liệu trong các lô của `00_digest_plan.md` §2 đều có đúng một dòng `### DOC:` với sha256 khớp kế hoạch. Chạy lại `npm run knowledge:digest <slug>` phải ra `0` lô.
- [ ] Mỗi dòng thẻ và mỗi dòng bản gộp có vị trí nguồn cụ thể (file + mục/bảng/đoạn) và trích nguyên văn có thật trong tài liệu.
- [ ] Không khối thẻ nào ở `00_digest_plan.md` §3 lọt vào bản gộp.
- [ ] Mâu thuẫn được ghi ở §3 với cả hai phía và cột phân xử theo §10.2.
- [ ] Không có thay đổi nào trong `knowledge/` do skill này tạo ra.
- [ ] File xuất đúng `OUTPUT/<task-slug>/knowledge_digest/batch_NN.md` và `OUTPUT/<task-slug>/00_knowledge_digest.md`.
