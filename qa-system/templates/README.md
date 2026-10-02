# _agent_template — dựng agent mới

Mẫu để thêm agent thứ 6 trở đi. Cấu trúc phải giống hệt 5 agent đang có trong `agents/`.

```
_agent_template/
├─ README.md              ← file này
├─ AGENT.md               ← mẫu danh tính
└─ skills/
    └─ NN-ten-skill.md    ← mẫu skill
```

**Không có template cho knowledge.** Knowledge per-feature dùng `knowledge/_template.md`
(copy thành `knowledge/features/<feature-slug>.md`). Quy ước dự án dùng `knowledge/_project.md`.
Xem `qa-system/core/QA_STANDARD.md` §8 để biết loại tri thức nào ở đâu.

---

## 4 tầng — nhớ đúng chỗ đặt

| Tầng | File | Chứa gì |
|---|---|---|
| **LÀ AI** | `agents/<agent>/AGENT.md` | Danh tính · skill sở hữu · được/không được làm · human-final · bàn giao |
| **LÀM THẾ NÀO** | `agents/<agent>/skills/NN-*.md` | Tham số · đầu vào · các bước · format output |
| **LUẬT CHUNG** | `qa-system/core/QA_STANDARD.md` | Verdict · guard · FACT · 06W · risk matrix · chuỗi biên · quy ước output · luật knowledge |
| **TRI THỨC** | `knowledge/` | `_project.md` (cả dự án) · `<feature-slug>.md` (một tính năng) |

Sai tầng là lỗi hay gặp nhất. Ba câu tự kiểm:

- Ràng buộc này **mọi** skill đều phải tuân? → `qa-system/core/QA_STANDARD.md`, không viết vào skill.
- Bảng chuẩn này có **≥2 skill** dùng? → `qa-system/core/QA_STANDARD.md`. Chỉ 1 skill? → để trong skill đó.
- Đây là **dữ kiện của một tính năng cụ thể**? → `knowledge/features/<feature-slug>.md`, không nhét vào skill.

---

## 7 bước dựng agent mới

1. **Tạo thư mục** `agents/qa-<tên>/` và `agents/qa-<tên>/skills/`.
2. **Copy** `_agent_template/AGENT.md` → `agents/qa-<tên>/AGENT.md`, điền hết placeholder `<…>`.
3. **Copy** `_agent_template/skills/NN-ten-skill.md` → `agents/qa-<tên>/skills/<NN>-<ten>.md` cho từng skill.
   Số `NN` tiếp nối dãy đang dùng (hiện đã dùng `01`–`12`), không trùng.
4. **Khai skill** vào mục `## Skill sở hữu` của `AGENT.md`. Danh sách này **phải khớp đúng** tên
   file trong `skills/` — lệch là agent gọi sai skill.
5. **Khai vào bản đồ** `workflows/WORKFLOW.md`: bảng §2 (agent · skill · vào · ra) và §1 nếu
   agent thuộc nhánh mới.
6. **Runbook** — nếu agent cần chạy theo chuỗi riêng, tạo `workflows/run-<mục-tiêu>.md` và khai
   vào bảng §6 của `WORKFLOW.md`.
7. **Cập nhật** `README.md` gốc: bản đồ ở mục 1 và bảng "sửa/mở rộng ở đâu" ở mục 5.

---

## Kiểm trước khi coi là xong

- [ ] Mọi placeholder `<…>` đã thay hết, không sót cái nào
- [ ] `## Skill sở hữu` khớp đúng tên file trong `skills/`
- [ ] Mọi đường dẫn dùng `OUTPUT/` (hoa), `shared/`, `workflows/`, `agents/qa-*/` — không phải
      `output/`, `_shared/`, `workflow/`
- [ ] Không copy lại bảng Verdict, FACT, 06W, chuỗi biên vào skill — chỉ trỏ tới `qa-system/core/QA_STANDARD.md`
- [ ] Mỗi skill ghi **đúng một** file output, có dòng meta `Owner · Nguồn · Verdict`
- [ ] `AGENT.md` có mục `Human-Final` — nêu rõ quyết định nào không giao cho agent
- [ ] Đã khai vào `workflows/WORKFLOW.md`

Lệnh kiểm nhanh đường dẫn sai:

```bash
grep -rn "output/\|_shared/\|workflow/[a-z]" --include=*.md agents shared workflows | grep -v "workflows/"
```

Không in gì là sạch.
