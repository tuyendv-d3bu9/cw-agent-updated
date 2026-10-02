---
name: <ten-skill>
description: >
  <Mô tả ngắn gọn 1-2 câu về nhiệm vụ, đầu vào và deliverable chính mà skill này tạo ra>
---

# Skill: <ten-skill>

> Tuân thủ `agents/core/QA_STANDARD.md` (verdict · guard · FACT · <thêm §4 06W / §5 risk matrix / §6 chuỗi biên nếu skill dùng tới>).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `agents/core/QA_STANDARD.md`).

## Mục đích
<Skill dùng để làm gì, sinh deliverable gì. 1–3 câu.>

## Tham số
- `<param>` ∈ `<giá trị hợp lệ>` — <ý nghĩa>

<Không có tham số thì xoá cả mục này.>

## Đầu vào
- `OUTPUT/<task-slug>/<NN>_*.md` — <lấy phần nào từ file này>
- `knowledge/_project.md` · `knowledge/features/<feature-slug>.md` (nếu có)

> Thiếu artifact bắt buộc → DỪNG và yêu cầu cung cấp, không tự tưởng tượng nội dung.

## KHÔNG được (riêng skill này)
> Chỉ ghi chốt chặn **riêng**. Guard chung ở `agents/core/QA_STANDARD.md` §2 — không lặp lại.

- Không làm việc của bước sau: <ranh giới cụ thể>.
- <Chốt chặn riêng khác — thường là loại lỗi mà skill này hay mắc>

## <Registry / bảng chuẩn của skill này>
> Chỉ đặt ở đây nếu **duy nhất skill này** dùng. Nếu ≥2 skill dùng → đưa vào
> `agents/core/QA_STANDARD.md` rồi trỏ tới, đừng copy. Xem `agents/core/QA_STANDARD.md` §8.

<Bảng registry, hoặc xoá cả mục này.>

## Các bước
1. <Bước 1 — làm gì, ra cái gì>
2. <Bước 2>
3. <Bước 3>

## Format output
Ghi ra `OUTPUT/<task-slug>/<NN>_<ten_deliverable>.md`:

````markdown
# <TÊN DELIVERABLE> · <task-slug>
Owner: agents/<agent>/skills/<ten-skill>.md · Nguồn: <file đã đọc> · Verdict: <PASS/FIX/ASK>

## 1. <Mục>
<nội dung đúng format của deliverable này>

## 2. <Mục>
| <cột> | <cột> |
|---|---|
| <giá trị> | <giá trị> |
````

> Fence 4 backtick khi bên trong có block code lồng. Ô bảng thiếu dữ liệu phải điền nhãn
> tường minh (`CHƯA COVER`, `[GIẢ ĐỊNH]`…), không để trống — `agents/core/QA_STANDARD.md` §2 luật 7.

## Ghi knowledge
<Chỉ có nếu skill được quyền ghi. Ghi rõ mục nào của `knowledge/features/<feature-slug>.md`. Không thì xoá mục này.>

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] <Điều kiện nghiệm thu deliverable này, diễn đạt kiểm chứng được (FACT — F/A/C/T)>
- [ ] File xuất ra đúng đường dẫn quy định tại `OUTPUT/<task-slug>/<NN>_<ten_deliverable>.md`.
