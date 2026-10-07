---
name: exploratory-charter
description: >
  Chuyển đổi Risk Area thành bộ Exploratory Charter 5 trường (Mission, Area, Risk, Time-box, Notes)
  có mục tiêu rõ ràng và giới hạn thời gian cho các phiên kiểm thử thăm dò do con người thực hiện.
---

# Skill: exploratory-charter

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT · risk matrix 3x3 §5).

## Mục đích
Chuyển Risk Area thành Exploratory Charter có mục tiêu rõ ràng và giới hạn thời gian, định hướng
phiên thăm dò do con người thực hiện.

## Đầu vào
- Danh sách Risk Area + mức Likelihood/Impact (từ `03_viewpoint_report.md` §1), và/hoặc
- Requirement Summary (`01_*.md`), và/hoặc mô tả tính năng.

## KHÔNG được (riêng skill này)
- Kịch bản hoá: viết Steps / Precondition / Expected chi tiết như Test Case.
- Gộp nhiều rủi ro vào một Charter — **một Charter, một rủi ro**.
- Đặt time-box phi thực tế cho một phiên con người.

## Các bước
1. **Chọn rủi ro trọng tâm** — ưu tiên rủi ro cao trước; mỗi Charter tập trung **một** rủi ro
   khác biệt; bao phủ đầy đủ các rủi ro cao theo bản chất nghiệp vụ.
2. **Soạn từng Charter đủ 05 trường**:

   | Trường | Nội dung |
   |---|---|
   | **Mission** | Mục tiêu khám phá — "Khám phá … để phát hiện …" |
   | **Area** | Khu vực / màn hình / luồng dữ liệu cụ thể thuộc phạm vi thăm dò |
   | **Risk** | Rủi ro chính Charter nhắm tới — trace về Risk Area / Rule nguồn |
   | **Time-box** | Khung thời gian thực tế cho một phiên (gợi ý 30–90 phút) |
   | **Notes** | Điểm cần chú ý, dữ liệu/biến thể nên thử, câu hỏi mở cần trả lời |

3. **Tự đối chiếu độ bao phủ rủi ro** — không để rủi ro ưu tiên cao nào trống Charter. Vùng cần
   góc nhìn ngoài dữ liệu đã cho → gắn `[GIẢ ĐỊNH]` + nêu lý do.

## Format output
Ghi ra `OUTPUT/<task-slug>/07_exploratory_charter.md`:

```markdown
# EXPLORATORY CHARTER SET — [TÊN TÍNH NĂNG]
Owner: qa-system/qa-automation/exploratory-charter · Nguồn: OUTPUT/<task-slug>/03_viewpoint_report.md · Verdict: <PASS/ASK>

## 1. Bảng tổng hợp Charter theo rủi ro
| # | Charter (tóm tắt Mission) | Risk nhắm tới | Mức rủi ro | Time-box |
|:---|:---|:---|:---|:---|
| CH-01 | [tóm tắt] | [risk] | [Cao/TB/Thấp] | [vd 60'] |

## 2. Chi tiết từng Charter
### CH-01
- **Mission**: [Khám phá … để phát hiện …]
- **Area**: [khu vực/màn hình/luồng cụ thể]
- **Risk**: [rủi ro chính — trace về Risk Area/Rule]
- **Time-box**: [vd 60 phút]
- **Notes**: [điểm chú ý, biến thể dữ liệu nên thử, câu hỏi mở]

*(Lặp lại — mỗi Charter một rủi ro khác nhau, ưu tiên rủi ro cao trước)*
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Mỗi Charter tập trung duy nhất một rủi ro trọng tâm, không gộp nhiều rủi ro.
- [ ] Mission bắt đầu bằng cú pháp chuẩn: `Khám phá [đối tượng] để phát hiện [vấn đề tiềm ẩn]`.
- [ ] Time-box thực tế nằm trong khoảng 30–90 phút.
- [ ] Tuyệt đối không viết steps dạng scripted kịch bản hoá như test case.
