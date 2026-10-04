---
name: workflow-authoring
description: >
  Biến một mô tả quy trình bằng lời thành file workflow chuẩn (có cụm kích hoạt, các bước,
  cổng kiểm), kiểm hợp lệ bằng máy; và khi người dùng nói một câu ngắn thì tìm đúng workflow rồi chạy.
---

# Skill: workflow-authoring

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
Người dùng không viết file. Họ **mô tả** một quy trình bằng lời; skill này dựng ra workflow chuẩn.
Sau đó họ chỉ cần **một câu ngắn** là workflow chạy. Hai chế độ:

| Chế độ | Người dùng nói | Kết quả |
|---|---|---|
| **TẠO** | *"Mỗi khi BA gửi tài liệu mới tôi muốn: phân tích, hỏi BA, rồi mới viết test case"* | File `qa-system/workflows/run-<tên>.md`, đã `validate` xanh |
| **CHẠY** | *"BA gửi tài liệu mới"* | Workflow được tìm ra, ghi checklist vào `00_plan.md`, chạy từng bước |

## Công cụ (agent tự chạy ngầm, người dùng không gõ)
```bash
npm run workflow -- list                       # có những workflow nào
npm run workflow -- new run-<tên>              # dựng bản nháp từ khuôn
npm run workflow -- validate [run-<tên>]       # kiểm hợp lệ, exit 1 nếu có lỗi
npm run workflow -- find "<câu người dùng>"    # câu ngắn -> workflow nào
npm run workflow -- show run-<tên> --slug <slug>
npm run workflow -- start run-<tên> --slug <slug>   # ghi checklist vào 00_plan.md
```

## Đầu vào
- Chế độ TẠO: mô tả bằng lời của người dùng.
- Chế độ CHẠY: câu ngắn của người dùng, và `task-slug` (tự suy từ `OUTPUT/` nếu chỉ có một task).
- `knowledge/_system_map.json` — danh sách agent và skill có thật. **Không quét mò thư mục.**
- Khuôn: `qa-system/templates/workflows/workflow.md`.

> Mô tả quá mơ hồ để dựng được bước nào → hỏi lại **tối đa 3 câu**, mỗi câu một ý
> (đầu ra mong muốn là gì · có chỗ nào phải dừng chờ con người không · có chạm tới automation không).
> Đủ để dựng thì **dựng luôn**, nêu rõ phần đã tự giả định, đừng hỏi thừa.

## KHÔNG được (riêng skill này)
- **KHÔNG bịa** agent hay skill. Chỉ dùng cái có trong `_system_map.json`; `validate` sẽ bắt nếu bịa.
- **KHÔNG bỏ cổng.** Bước từ Chặng 3 trở đi bắt buộc có cổng `ask` ở trước. Bước `qa-automation` bắt buộc
  có `readiness` **và** `confirm` ở trước. Người dùng yêu cầu bỏ → giải thích rồi từ chối (`AGENTS.md` §1.5, §1.6).
- **KHÔNG tự chạy ngay sau khi tạo.** Tạo xong chỉ trình bày, chờ người dùng nói cụm kích hoạt hoặc xác nhận.
- **KHÔNG ghi đè** workflow đã có. Trùng tên hoặc trùng cụm kích hoạt → đổi tên hoặc hỏi người dùng.
- **KHÔNG đặt cụm kích hoạt chung chung** (ví dụ "chạy đi", "làm test"). Mỗi cụm tối thiểu 2 từ có nghĩa, gắn với mục tiêu riêng.
- **KHÔNG đoán khi `find` trả `AMBIGUOUS`.** Nêu các ứng viên và hỏi người dùng chọn một.
- **KHÔNG tự sửa thân của runbook `format: legacy`** khi chỉ được yêu cầu chạy nó.

## Các bước — chế độ TẠO
1. **Đọc mô tả**, gạch ra: mục tiêu · các việc theo thứ tự · chỗ phải dừng chờ con người.
2. **Đối chiếu tài nguyên**: với mỗi việc, tìm agent + skill tương ứng trong `_system_map.json`.
   Việc nào chưa có skill → ghi vào mục "Chưa có sẵn" và báo người dùng, **không** bịa.
3. **Chọn tên** `run-<từ-khoá>` ngắn, rồi `npm run workflow -- list` để chắc chưa trùng.
4. **Dựng nháp**: `npm run workflow -- new run-<tên>`.
5. **Điền file**: `title`, `description`, `triggers` (2–4 câu người dùng thật sự sẽ nói), `steps`.
   - Mỗi bước là `agent`+`skill` **hoặc** `tool`. Dùng `output` để chỉ file kết quả.
   - Đặt `gate` đúng chỗ: `ask` trước Chặng 3 · `lint` trước khi nghiệm thu · `readiness` + `confirm` trước automation.
   - **Luôn bọc giá trị chữ trong dấu nháy kép** — dấu `:` không bọc làm hỏng cả file.
6. **Kiểm**: `npm run workflow -- validate run-<tên>`. Đỏ → đọc thông báo, sửa, kiểm lại. Không dừng khi còn đỏ.
7. **Trình bày** cho người dùng bảng bước + cụm kích hoạt (xem Format output) và hỏi họ có muốn chỉnh không.
8. **Nghiệm thu hệ thống**: `npm run agent:check` phải xanh (nó kiểm toàn bộ workflow).

## Các bước — chế độ CHẠY
1. `npm run workflow -- find "<câu>" --json` → đọc `status`.
   - `match` → sang bước 2.
   - `ambiguous` → nêu ứng viên, hỏi người dùng chọn.
   - `none` → nói thẳng không có workflow khớp, đề nghị tạo mới từ một mô tả.
2. Xác định `task-slug`: chỉ có một task trong `OUTPUT/` thì dùng nó, nhiều thì hỏi.
3. Workflow `format: legacy` → đọc file và làm theo, kết thúc tại đây.
4. `npm run workflow -- start <tên> --slug <slug>` → checklist vào `00_plan.md`.
5. **Làm từng bước theo thứ tự**. Với mỗi bước:
   - Có `gate` → chạy lệnh cổng **trước**. Exit khác `0` → **DỪNG**, dán kết quả thật, không đi tiếp.
   - `confirm` → hỏi người dùng xác nhận rõ ràng; với automation phải kèm URL môi trường.
   - Chạy skill, ghi file kết quả, tick `[x]` trong `00_plan.md`.
6. Dừng ở bất kỳ `ASK` / `FIX` nào theo `QA_STANDARD` §1, không tự vượt.

## Format output (chế độ TẠO)
```markdown
**Đã tạo workflow `run-<tên>`** — <title>

| # | Việc | Chuyên gia / skill | Cổng trước bước | Ra |
|---|---|---|---|---|
| 1 | … | qa-analyst / requirement-risk-summary | — | 01_… |

**Nói câu nào để chạy**: "<cụm 1>" · "<cụm 2>"
**Tự giả định**: <những chỗ mô tả không nói rõ mà bạn đã chọn>
**Chưa có sẵn**: <việc nào chưa có skill, hoặc "không">
**Kiểm hợp lệ**: <dán kết quả thật của validate>
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] `npm run workflow -- validate run-<tên>` trả exit `0`, kết quả thật được dán vào báo cáo.
- [ ] Không còn dấu giữ chỗ `<...>` nào trong file.
- [ ] Mọi `agent`/`skill` có trong `_system_map.json`, không bịa.
- [ ] Bước từ Chặng 3 có cổng `ask` trước; bước automation có `readiness` + `confirm` trước.
- [ ] Có ít nhất 2 cụm kích hoạt, không trùng workflow khác.
- [ ] `npm run agent:check` vẫn xanh.
- [ ] Chưa tự chạy workflow vừa tạo.
