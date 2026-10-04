---
# Khuôn workflow. `npm run workflow -- new <tên>` chép khuôn này ra qa-system/workflows/.
# Điền hết mọi chỗ có dấu <...>. Còn sót chỗ giữ chỗ là `validate` báo lỗi.
# LUÔN bọc giá trị chữ trong dấu nháy kép "...": dấu hai chấm `:` không bọc sẽ làm hỏng cả file.

name: __NAME__                  # phải trùng tên file (không kể .md)
title: "<tên ngắn của workflow>"
description: "<một câu: workflow này làm gì và khi nào dùng>"
format: v1

# Những câu NGƯỜI DÙNG sẽ nói để chạy workflow này.
# Ít nhất 2 câu, mỗi câu từ 2 từ có nghĩa trở lên, không trùng workflow khác.
triggers:
  - "<câu ngắn 1>"
  - "<câu ngắn 2>"

# Các bước chạy theo thứ tự. Mỗi bước là MỘT trong hai dạng:
#   agent + skill   -> một chuyên gia chạy một skill (phải tồn tại thật)
#   tool            -> một lệnh npm (phải có trong package.json), ví dụ: gate, lint
# Trường tuỳ chọn:
#   output          -> tên file kết quả, ghi vào OUTPUT/<slug>/
#   gate            -> cổng phải qua TRƯỚC bước này: ask | lint | readiness | confirm
#   note            -> ghi chú cho người chạy
steps:
  - agent: qa-analyst
    skill: requirement-risk-summary
    output: 01_requirement_risk_summary.md

  # Ví dụ bước có cổng. Từ Chặng 3 trở đi BẮT BUỘC có cổng ASK ở trước:
  # - agent: qa-analyst
  #   skill: viewpoint-selection
  #   gate: ask
  #   output: 03_viewpoint_report.md
---

# <Tên workflow>

## Khi nào dùng
<Một hai câu mô tả tình huống.>

## Điểm dừng
<Chỗ nào workflow phải dừng chờ con người, và vì sao.>
