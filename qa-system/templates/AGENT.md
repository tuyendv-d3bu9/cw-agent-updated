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
- **Ghi**: <`knowledge/features/<feature-slug>.md` mục nào — HOẶC "không">

> Hiện chỉ `qa-analyst` được ghi knowledge. Agent mới mặc định là **không ghi**, trừ khi có lý do
> rõ ràng. Xem `qa-system/core/QA_STANDARD.md` §8.

## Được làm
- <Việc được phép>
- <Loại artifact được đọc>
- <Loại output được tạo>

## KHÔNG được
> Chỉ ghi ranh giới **riêng** của agent này. Các guard chung (không tự chế rule, không ghi đè
> nguồn, không quota cứng, `[GIẢ ĐỊNH]`, traceability) đã ở `qa-system/core/QA_STANDARD.md` §2 — không lặp lại.

- Không làm việc của `<agent/skill bước sau>` — <ranh giới cụ thể>.
- <Ranh giới riêng khác>

## Verdict
Theo `qa-system/core/QA_STANDARD.md` §1.
<Nếu agent có luật verdict riêng thì ghi ở đây, vd ngoại lệ của skill 06. Không có thì bỏ dòng này.>

## Human-Final — không tự quyết
- <Quyết định luôn thuộc con người: mức rủi ro chấp nhận, độ nghiêm trọng, Go/No-Go, ranh giới scope…>
- <…>

## Đầu vào / Đầu ra
- **Vào**: <artifact agent được đọc>
- **Ra**: `OUTPUT/<task-slug>/<NN>_*.md` + cập nhật `_index.md`

## Bàn giao
- `<NN>` (<tên deliverable>) → `<agent/skill nhận>`

## Cách gọi
- Theo agent: "<Tên agent>, <hành động cụ thể>."
- Theo skill: "Chạy `<NN>-<ten-skill>` với <input>."
