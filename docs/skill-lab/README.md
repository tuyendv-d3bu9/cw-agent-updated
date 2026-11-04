# Skill Lab — tạo và nâng cấp skill qa-system

Hai bài thực hành, làm cùng AI theo quy trình `qa-system/qa-lead/skills/system-upgrade-governance.md`.
Đọc trước: [`docs/so-tay-tao-skill.html`](../so-tay-tao-skill.html) (mở bằng trình duyệt).

| Thư mục | Bài | Dạng nâng cấp | Thời lượng gợi ý |
|---|---|---|---|
| [`01-tao-skill-moi/`](01-tao-skill-moi/) | Tạo skill mới khi **chưa biết** nó thuộc agent `qa-*` nào | `[A]` hoặc `[B]` — học viên tự phân tích | 60–75 phút |
| [`02-nang-cap-skill/`](02-nang-cap-skill/) | Nâng cấp skill `missing-rule-06w` để hai lần chạy ra cùng bộ câu hỏi | `[C]` — sửa tại chỗ | 45–60 phút |

## Chuẩn bị (5 phút, mỗi học viên)

```bash
git switch develop
git switch -c lab/<ten-hoc-vien>      # làm trên nhánh riêng, không sửa thẳng develop
npm install
npm test                              # phải xanh trước khi bắt đầu
```

Mọi dữ liệu của lab nằm ngay trong thư mục này, không phụ thuộc nhánh nào:

| Thư mục | Chứa gì |
|---|---|
| [`de-bai/`](de-bai/) | 8 tài liệu tính năng hoàn tiền có cài bẫy: SRS v1/v2 (docx, có comment và chỉnh sửa chưa duyệt), bảng mã lỗi xlsx có dòng ẩn, API, wireframe, BRD, CR-07, biên bản họp |
| [`tra-loi-ba/`](tra-loi-ba/) | Câu trả lời của BA/PO cho 17 câu hỏi (đóng vai) |
| `01-tao-skill-moi/du-lieu/` | Kết quả chuẩn Chặng 01→06 (51 test case) + knowledge, để Bài 1 phân tích CR |
| `02-nang-cap-skill/du-lieu/` | Bản Chặng 01 cố định, để Bài 2 chỉ đo riêng Chặng 02 |

Nạp đề vào một task mới (dùng `--force` vì có thể đã có task cùng nội dung):

```bash
npm run intake -- docs/skill-lab/de-bai --slug <ten-task> --force
```

## Luật chung của buổi lab

1. Không sửa file trong `qa-system/` bằng tay — giao việc cho AI theo câu mẫu trong từng bài.
2. Bước PHAN_TICH luôn dừng lại để **người** duyệt trước khi sửa.
3. "Xong" nghĩa là: `npm test` xanh · `npm run agent:check` INTACT · chạy thật hai lần và `diff-runs` giải thích được.
4. Phiếu phân tích (`phieu-phan-tich.md`) điền xong mới được commit. Phiếu là biên bản, nộp cho giảng viên, không commit.
