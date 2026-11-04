---
name: <ten-skill>
description: >
  <Mô tả ngắn gọn 1-2 câu về nhiệm vụ, đầu vào và deliverable chính mà skill này tạo ra>
---

# Skill: <ten-skill>

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard & nhãn §2 · FACT §3 · I/O §7 · mã §9 · nguồn §10 · <thêm §4 / §5 / §6 / §11 nếu dùng tới>).
> Luật đã có ở QA_STANDARD thì **trỏ số mục**, không chép lại.
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
<Skill dùng để làm gì, sinh deliverable gì. 1–3 câu.>

## Tham số
- `<param>` ∈ `<giá trị hợp lệ>` — <ý nghĩa>

<Không có tham số thì xoá cả mục này.>

## Đầu vào
- `OUTPUT/<task-slug>/<NN>_*.md` — <lấy phần nào từ file này>
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` — <mục nào dùng tới> (luôn nạp, QA_STANDARD §7)

> Thiếu artifact bắt buộc → DỪNG, không tự tưởng tượng nội dung.

## KHÔNG được (riêng skill này)
> Chỉ ghi chốt chặn **riêng**. Guard chung ở `qa-system/core/QA_STANDARD.md` §2 — không lặp lại.

- Không làm việc của bước sau: <ranh giới cụ thể>.
- <Chốt chặn riêng khác — thường là loại lỗi mà skill này hay mắc>

## <Registry / bảng chuẩn của skill này>
> Chỉ đặt ở đây nếu **duy nhất skill này** dùng. Nếu ≥2 skill dùng → đưa vào
> `qa-system/core/QA_STANDARD.md` rồi trỏ tới, đừng copy. Xem `qa-system/core/QA_STANDARD.md` §8.

<Bảng registry, hoặc xoá cả mục này.>

## Các bước
1. <Bước 1 — làm gì, ra cái gì>
2. <Bước 2>
3. <Bước 3>

## Format output
Ghi ra `OUTPUT/<task-slug>/<NN>_<ten_deliverable>.md`:

````markdown
# <TÊN DELIVERABLE> · <task-slug>
Owner: qa-system/qa-<agent>/skills/<ten-skill>.md · Nguồn: <file đã đọc> · Verdict: PASS

## 1. <Mục>
| ID | <cột nội dung> | Nguồn (file §mục / mã) |
|---|---|---|
| <MÃ-01> | <giá trị> | <nguồn> |
````

> Dòng 2 là dòng meta đúng QA_STANDARD §7 (một verdict, không in đậm). Mỗi bảng có cột nguồn hoặc mã trace (§9).
> Mã mới lấy số từ `npm run ids -- <slug>`; mã cũ giữ nguyên (§9.1). Ô thiếu dữ liệu điền nhãn §2.1.
> Ví dụ trong skill dùng chỗ giữ chỗ trung tính — **không** lấy giá trị, thông báo, tên màn hình của một dự án thật.

## Ghi knowledge
<Chỉ có nếu bảng luật ghi QA_STANDARD §8 cho phép. Trỏ tới dòng đó, không viết luật mới. Không thì xoá mục này.>

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] <Điều kiện nghiệm thu deliverable này, diễn đạt kiểm chứng được (FACT — F/A/C/T)>
- [ ] File xuất ra đúng `OUTPUT/<task-slug>/<NN>_<ten_deliverable>.md`, dòng meta đúng §7.

## Nghiệm thu skill (trước khi đưa vào dùng — `system-upgrade-governance` §5.1)
- [ ] (a) Không chép luật QA_STANDARD · (b) Đầu vào khai đủ, gồm knowledge · (c) Output có dòng meta + cột nguồn
- [ ] (d) Chạy 2 lần trên cùng đầu vào mẫu: tập mã và verdict giống nhau, hoặc khác biệt đã giải thích
- [ ] (e) Không ví dụ theo miền nghiệp vụ cụ thể
- [ ] Xoá mục này khỏi skill thật sau khi đạt
