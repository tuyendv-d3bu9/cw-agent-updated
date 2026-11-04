---
name: run-conflict-check
title: "Rà soát xung đột tri thức chéo"
description: "Phát hiện kẽ hở logic đá nhau giữa tính năng đang phân tích và các tính năng đã có."
format: legacy
triggers:
  - "kiểm tra xung đột tri thức"
  - "tính năng mới có đá logic cũ không"
  - "rà soát mâu thuẫn giữa các tính năng"
---

# Rà soát xung đột tri thức chéo

1. QA Leader chạy `npm run knowledge:conflicts <slug>` → `OUTPUT/<slug>/01_conflict_warning.md`, tóm tắt kết quả cho người dùng.
2. `qa-analyst` (skill `missing-rule-06w`) đọc cảnh báo; mỗi mâu thuẫn thật thành một `MR-xx` — không tự chọn bên đúng
   (`qa-system/core/QA_STANDARD.md` §10.2).

Tool làm hai việc: so hằng số knowledge §9 cùng tên giữa các tính năng (khác số ⇒ xung đột), và dò cặp
cho phép/cấm theo chủ đề (mặc định trong tool, ghi đè được bằng `knowledge/_conflict_topics.json`).
Exit `1` ⇒ có xung đột; exit `0` chỉ nghĩa là heuristic không thấy gì.

> Tool dò theo từ khoá nên có thể bỏ sót hoặc báo nhầm. "Không thấy xung đột" **không** phải bằng chứng hai tính năng
> nhất quán; agent vẫn đối chiếu BR/FD của tính năng với `knowledge/features/*.md` liên quan khi chạy `02`.
