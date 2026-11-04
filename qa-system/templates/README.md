# qa-system/templates/ — khuôn mẫu

| File | Dùng khi |
|---|---|
| `AGENT.md` | Dựng agent mới |
| `skills/ten-skill.md` | Viết skill mới |
| `workflows/workflow.md` | `npm run workflow -- new <tên>` chép khuôn này |
| `run/` | Session chạy test theo ticket (`OUTPUT/<slug>/runs/RUN-XX_<ticket>/`) |
| `automation/` | Khung Playwright cho `npm run init` |
| `knowledge/` | Khuôn `knowledge/` cho dự án mới (do `npm run init` chép) |

Quy trình nâng cấp đầy đủ (cây `[A]/[B]/[C]`, 7 điểm neo, nghiệm thu):
`qa-system/qa-lead/skills/system-upgrade-governance.md`.

---

## 4 tầng — đặt đúng chỗ

| Tầng | File | Chứa gì |
|---|---|---|
| **LÀ AI** | `qa-system/qa-<agent>/AGENT.md` | Danh tính · skill sở hữu · được/không được · Human-Final · bàn giao |
| **LÀM THẾ NÀO** | `qa-system/qa-<agent>/skills/<ten-skill>.md` | Tham số · đầu vào · các bước · format output |
| **LUẬT CHUNG** | `qa-system/core/QA_STANDARD.md` | Verdict · cổng ASK · nhãn · FACT · 06W · rủi ro · chuỗi biên · I/O · knowledge · mã · nguồn · thang đo |
| **TRI THỨC** | `knowledge/` | `_project.md` (cả dự án) · `features/<slug>.md` (một tính năng) |

Ba câu tự kiểm:
- **Mọi** skill phải tuân? → QA_STANDARD, không viết vào skill.
- Bảng chuẩn **≥2 skill** dùng? → QA_STANDARD. Chỉ 1 skill → để trong skill đó.
- **Dữ kiện của một tính năng**? → `knowledge/features/<slug>.md`, không nhét vào skill.

---

## 7 bước dựng agent mới

1. Tạo `qa-system/qa-<tên>/` và `qa-system/qa-<tên>/skills/`.
2. Chép `templates/AGENT.md` → `qa-system/qa-<tên>/AGENT.md`, thay hết `<…>`.
3. Chép `templates/skills/ten-skill.md` → `qa-system/qa-<tên>/skills/<ten-skill>.md` cho từng skill.
4. Khai skill vào `## Skill sở hữu` của `AGENT.md` — **khớp đúng** tên file trong `skills/`.
5. Khai vào `qa-system/workflows/WORKFLOW.md`: bảng §2, và §1 nếu mở nhánh mới. Tên file deliverable
   không trùng tiền tố đang dùng (governance §3).
6. Runbook riêng (nếu cần): `npm run workflow -- new run-<mục-tiêu>`, `validate` xanh.
7. Cập nhật `qa-system/README.md`, `qa-system/qa-lead/AGENT.md` (§2 + §5), rồi `npm run map:sync`.

---

## Kiểm trước khi coi là xong

- [ ] Không còn `<…>` sót lại
- [ ] `## Skill sở hữu` khớp tên file trong `skills/`
- [ ] `AGENT.md` có mục `Human-Final`
- [ ] **Nghiệm thu skill** (bắt buộc với skill mới hoặc đã sửa — chi tiết governance §5.1):
  - [ ] (a) Trỏ tới QA_STANDARD, không chép luật
  - [ ] (b) "Đầu vào" khai đủ, gồm `knowledge/_project.md` + `knowledge/features/<slug>.md`
  - [ ] (c) Output một file, dòng meta QA_STANDARD §7, bảng có cột nguồn / mã trace
  - [ ] (d) Chạy **2 lần** trên cùng đầu vào mẫu rồi `npm run diff-runs -- <OUTPUT/slug-lần-1> <OUTPUT/slug-lần-2>`; khác biệt phải giải thích được
  - [ ] (e) Không ví dụ theo miền nghiệp vụ cụ thể trong skill lõi
- [ ] `npm test` và `npm run agent:check` xanh, dán kết quả thật
