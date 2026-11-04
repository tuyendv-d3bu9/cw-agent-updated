# Bài 1 — Tạo skill mới: "Change Request tác động tới test case nào?"

## Đề bài (yêu cầu nguyên văn của trưởng nhóm QA)

> Mỗi lần BA gửi Change Request, team mất nửa ngày dò xem test case nào phải sửa, test case nào phải chạy lại.
> Tôi muốn hệ thống tự làm việc này: đọc CR mới, chỉ ra CR đổi quy tắc / trường / thông báo nào,
> rồi liệt kê test case bị ảnh hưởng và phải làm gì với từng cái (sửa giá trị, viết lại, chỉ chạy lại).
> Chỗ nào CR nói chưa rõ thì phải thành câu hỏi cho BA, không được tự đoán giá trị mới.

Bạn **chưa biết** skill này thuộc agent nào. Đó là việc của bước 1.

## Dữ liệu thử

Dựng một task đã chạy xong 01→06 (51 test case, mọi câu hỏi BA đã chốt) từ dữ liệu trong `du-lieu/`:

```bash
S=lab-cr; D=docs/skill-lab
npm run intake -- $D/de-bai --slug $S --force
npm run intake -- $D/tra-loi-ba --into $S --force
for f in $D/01-tao-skill-moi/du-lieu/0*.md; do sed "1s/· hoan-tien$/· $S/" "$f" > OUTPUT/$S/$(basename "$f"); done
sed -e "s/\`hoan-tien\`/\`$S\`/g" -e "s#INPUT/hoan-tien/#INPUT/$S/#g" $D/01-tao-skill-moi/du-lieu/knowledge.md > knowledge/features/$S.md
npm run lint -- $S        # phải: Clean
npm run gate $S           # phải: OPEN
```

CR mới để thử skill: [`CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md`](CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md). Khi nghiệm thu, nạp nó vào task:

```bash
npm run intake -- docs/skill-lab/01-tao-skill-moi/CR-08_Thay_doi_nguong_hoan_tien_2026-11-05.md --into lab-cr --force
```

## Làm theo 6 bước (điền dần vào `phieu-phan-tich.md`)

| Bước | Việc | Câu hỏi phải tự trả lời được |
|---|---|---|
| 1 · Phân tích | Cây A/B/C, `npm run agent:check -- --impact <agent>` | Agent nào đang sở hữu "test case"? Giao thêm việc này có làm agent đó kiêm vai trò khác không? |
| 2 · Đặt tầng | Bảng 4 tầng | Luật "CR mới hơn thì thắng spec" đã có ở đâu? (gợi ý: QA_STANDARD §10.2 — trỏ tới, không chép) |
| 3 · Viết skill | Khuôn `qa-system/templates/skills/ten-skill.md` | Đầu vào gồm những file nào? Output số mấy (`npm` không cấp số này — tra `WORKFLOW.md`)? |
| 4 · Lan truyền | 7 điểm neo | Skill sinh deliverable mới ⇒ N6 có áp dụng không? Tool có cần đọc file này không (N7)? |
| 5 · Nghiệm thu | 4 lệnh + chạy thật hai lần | Hai lần chạy ra cùng danh sách test case bị ảnh hưởng chưa? |
| 6 · Commit | Tách commit | Commit nào được đưa sang develop? |

## Câu giao việc cho AI (chép nguyên, điền phần `<…>`)

```text
QA Leader, tôi muốn thêm năng lực mới: <dán đề bài ở trên>.
Làm theo qa-system/qa-lead/skills/system-upgrade-governance.md, chế độ PHAN_TICH trước:
bảng quyết định A/B/C (trả lời đủ 3 câu), đặt tầng, số thứ tự deliverable, danh sách 7 điểm neo,
kết quả `npm run agent:check -- --impact <agent>`. Dừng để tôi duyệt, chưa sửa file nào.
```

Sau khi duyệt:

```text
Đồng ý phương án <A/B> vào <agent>. THI_CONG trên nhánh hiện tại, đủ 7 điểm neo.
Rồi NGHIEM_THU: npm test, npm run agent:check, npm run map:sync, npm run workflow -- validate.
Chạy skill mới 2 lần (mỗi lần một phiên mới) trên task lab-cr với CR-08, lưu 2 kết quả,
so bằng npm run diff-runs, dán kết quả thật và giải thích từng khác biệt.
```

## Tiêu chí đạt

- [ ] Bảng A/B/C có lý do cho **cả 3 câu**, kết luận khớp với lý do.
- [ ] Skill trỏ QA_STANDARD (§1, §2, §7, §9, §10.2…), không chép bảng luật nào.
- [ ] Đầu vào có `knowledge/_project.md` và `knowledge/features/<slug>.md`; thiếu đầu vào thì DỪNG.
- [ ] Mỗi dòng output có mã nguồn: CR (file §mục + trích nguyên văn) → `BR/FD/AF` → `TC_ID`.
- [ ] Giá trị mới mà CR không nói rõ ⇒ nhãn `[CHƯA CÓ TRONG TÀI LIỆU]` / câu hỏi cho BA, không tự điền.
- [ ] Không có ví dụ hoàn tiền / voucher trong file skill (chỉ `<field>`, `BR-01`, `<MODULE>-001`).
- [ ] `npm test` xanh, `agent:check` INTACT, AI định tuyến đúng khi bạn nói *"BA vừa gửi CR, test case nào bị ảnh hưởng?"*.
- [ ] Hai lần chạy trên CR-08 ra **cùng danh sách** test case bị ảnh hưởng.
