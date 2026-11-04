# INPUT/ — Tài liệu nguồn · **CỦA BẠN**

Kéo thả tài liệu của BA vào đây (`.docx` `.pdf` `.xlsx` `.md`…), rồi nói với agent:

> *"Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"*

Agent tự chuyển sang Markdown, xếp vào `INPUT/<slug>/` 5 ngăn và dựng sẵn khung làm việc.
**Bạn không cần tự tạo thư mục.**

| Ngăn | Chứa gì |
|---|---|
| `01_business/` | Định hướng, chính sách, bài toán kinh doanh |
| `02_ba/` | **Bắt buộc có.** PRD, SRS, User Story, Use Case |
| `03_dev/` | API Swagger/OpenAPI, DB schema, tech spec, mã lỗi |
| `04_design/` | Figma, wireframe, ảnh màn hình (ảnh giữ ở `04_design/_assets/`) |
| `05_communication/` | Q&A với BA, biên bản họp, Change Request |

- Comment, tracked changes, dấu "DRAFT" trong tài liệu được tách ra mục `## Annotations / Pending changes` —
  agent coi đó là **chưa chốt** và hỏi lại BA, không dùng làm sự thật.
- File không đọc được hoặc định dạng chưa hỗ trợ được **giữ nguyên tại chỗ** và báo lại cho bạn — không bị xoá.
- Hai tài liệu nói khác nhau: thứ tự ưu tiên ở `qa-system/core/QA_STANDARD.md` §10.2; không rõ bản nào mới hơn thì agent hỏi BA.
  Đặt version/ngày trong tên file (`spec_v2_2026-10-01.docx`) giúp agent biết bản nào mới.
- Gửi bản mới của một tài liệu đã có: agent hỏi bạn xác nhận *"đây là bản mới của tính năng X?"* trước khi nhận.
  Bản cũ được cất vào `<ngăn>/_superseded/` (kèm lý do) — vẫn còn đó để đối chiếu, nhưng agent không dùng nữa.

> Agent **chỉ đọc** thư mục này, không sửa nội dung tài liệu gốc.
