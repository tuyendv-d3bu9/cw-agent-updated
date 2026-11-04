# Agent: <Tên agent>  (<chuyên môn ngắn>)

> Tuân thủ `qa-system/core/QA_STANDARD.md`.
>
> **AGENT.md = LÀ AI.** Chỉ danh tính, quyền hạn, ranh giới, bàn giao.
> KHÔNG viết các bước thực thi (đó là `skills/`), KHÔNG chứa tri thức nền (đó là `knowledge/`),
> KHÔNG nhắc lại ràng buộc chung (đó là `qa-system/core/QA_STANDARD.md`).

## Là ai
<Agent này là ai, đứng ở node nào trong pipeline, nhận từ ai và bàn giao cho ai.>

> **Phân biệt với `<agent dễ nhầm>`**: <agent này làm X> khác <agent kia làm Y>.

## Skill sở hữu
- `<ten-skill>` — <một dòng: vào gì → ra gì>
- `<ten-skill>` — <một dòng>

Chuỗi chạy: `<skill-1> → <skill-2>`. Mỗi skill chỉ chạy khi output của skill trước đã có.

## Knowledge
- **Đọc**: `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (nếu có)
- **Ghi**: <mục nào theo bảng luật ghi QA_STANDARD §8 — HOẶC "không">

> Agent mới mặc định **không ghi**. Ai ghi mục nào chỉ định nghĩa ở `qa-system/core/QA_STANDARD.md` §8.

## Được làm
- <Việc được phép>
- <Loại artifact được đọc>
- <Loại output được tạo>

## KHÔNG được
> Chỉ ghi ranh giới **riêng** của agent này. Guard chung ở `qa-system/core/QA_STANDARD.md` §2 — không lặp lại.

- Không làm việc của `<agent/skill bước sau>` — <ranh giới cụ thể>.
- <Ranh giới riêng khác>

## Verdict
Theo `qa-system/core/QA_STANDARD.md` §1.
<Nếu agent có luật verdict riêng thì ghi ở đây, vd ngoại lệ của skill 06. Không có thì bỏ dòng này.>

## Human-Final — không tự quyết
- <Quyết định luôn thuộc con người: mức rủi ro chấp nhận, độ nghiêm trọng, Go/No-Go, ranh giới scope…>
- <…>

## Đầu vào / Đầu ra
- **Vào**: <artifact agent được đọc> + `knowledge/_project.md` + `knowledge/features/<slug>.md` (QA_STANDARD §7)
- **Ra**: `OUTPUT/<task-slug>/<NN>_*.md` (một file mỗi skill) + tick `00_plan.md`

## Bàn giao
- `<NN>` (<tên deliverable>) → `<agent/skill nhận>`

## Cách gọi
- Theo agent: "<Tên agent>, <hành động cụ thể>."
- Theo skill: "Chạy `<ten-skill>` với <input>."
