# knowledge/ — Bộ nhớ dự án · **DÙNG CHUNG**

Đây là thứ **duy nhất sống lâu hơn `OUTPUT/`**. Xoá `OUTPUT/` rồi chạy lại thì agent vẫn nhớ;
xoá `knowledge/` thì phải đi hỏi lại BA từ đầu.

| File | Là gì |
|---|---|
| `_project.md` | Quy ước dự án — **con người** điền. Dòng còn `<điền>` = chưa khai, agent coi như không có |
| `_glossary.md` | Từ điển thuật ngữ nghiệp vụ — con người điền |
| `_template.md` | Khuôn cho file tính năng |
| `_sut.json` | Hệ thống đang kiểm thử (URL…) cho automation |
| `_system_map.json` | Bản đồ định tuyến — `npm run map:sync` tự đồng bộ, đừng sửa tay |
| `features/<slug>.md` | Tri thức một tính năng — xem [features/README.md](features/README.md) |

Ai được ghi mục nào: một bảng duy nhất ở `qa-system/core/QA_STANDARD.md` §8.
Khi BA trả lời một câu hỏi treo, nói với agent *"BA đã chốt: [nội dung]"* — agent chép nguyên văn vào đúng dòng
câu hỏi (kèm người trả lời, ngày), không tự viết thay BA.
