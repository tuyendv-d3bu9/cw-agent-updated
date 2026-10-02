# knowledge/ — Bộ nhớ dự án · **DÙNG CHUNG**

Đây là thứ **duy nhất sống lâu hơn `OUTPUT/`**. Xoá `OUTPUT/` rồi chạy lại thì
agent vẫn nhớ; xoá `knowledge/` thì phải đi hỏi lại BA từ đầu.

| File | Ai điền |
|---|---|
| `_project.md` | Con người — quy ước dự án: tiền tệ, timezone, môi trường test |
| `_glossary.md` | Con người — từ điển thuật ngữ nghiệp vụ |
| `_system_map.json` | Agent tự đồng bộ — bản đồ định tuyến, đừng sửa tay |
| `features/<task>.md` | Agent ghi, **bạn duyệt** — quy tắc đã chốt, câu trả lời của BA |

Khi BA trả lời một câu hỏi treo, nói với agent:
*"BA đã chốt: [nội dung]"* — agent tự ghi vào đúng mục.
