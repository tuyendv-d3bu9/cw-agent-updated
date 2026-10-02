---
name: ui-screenshot-review
description: >
  Phân tích ảnh chụp màn hình UI bằng AI Vision để phát hiện và đặc tả các vấn đề về
  UI Inconsistency, Accessibility và UX Problem nhìn thấy được.
---

# Skill: ui-screenshot-review

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).
> **Cần ảnh đính kèm (Vision). Không có ảnh → DỪNG, yêu cầu cung cấp ảnh.**

## Mục đích
Quét ảnh chụp màn hình, phát hiện và đặc tả vấn đề UI / Accessibility / UX nhìn thấy được.

## Đầu vào
- 1..n ảnh chụp màn hình đính kèm trực tiếp.
- (Tuỳ chọn) mô tả ngắn từng màn hình / bối cảnh tính năng.

## KHÔNG được (riêng skill này)
- Suy đoán hành vi động: hover, animation, chuyển màn, phản hồi sau click — ảnh tĩnh không chứa
  thông tin đó.
- Tự "tưởng tượng" màn hình khi chưa có ảnh.
- Khẳng định điều không nhìn rõ khi ảnh mờ / độ phân giải thấp.

## 3 nhóm vấn đề cần soi
| Nhóm | Soi gì |
|---|---|
| **UI Inconsistency** | Lệch canh lề, spacing không đều, bo góc/kích thước/màu nút không nhất quán, font lộn xộn |
| **Accessibility** | Tương phản chữ/nền thấp, cỡ chữ quá nhỏ, vùng chạm quá sát nhau, thiếu nhãn nhìn thấy được |
| **UX Problem** | Thông báo lỗi/nhãn khó hiểu, thiếu tín hiệu trạng thái (vd không thấy loading), luồng thị giác gây nhầm lẫn |

## Các bước
1. **Kiểm tra tiền đề** — không có ảnh → DỪNG và yêu cầu cung cấp ảnh.
2. **Quét & phân loại** — với mỗi ảnh, liệt kê vấn đề nhìn thấy được, phân vào đúng 1 trong 3 nhóm.
3. **Đặc tả từng vấn đề** — **Vị trí** (chỗ nào trên màn hình) · **Mô tả** (nhìn thấy gì) ·
   **Lý do** (vì sao là vấn đề) · **Mức độ** (Low/Med/High) · **Đề xuất sửa**.
4. **Gắn cờ độ tin cậy** — ảnh mờ hoặc không đủ rõ → gắn `[GIẢ ĐỊNH]` + đề nghị người dùng
   cross-check bằng mắt.

## Format output
Ghi ra `OUTPUT/<task-slug>/08_ui_screenshot_analysis.md`:

```markdown
# UI SCREENSHOT ANALYSIS — [TÊN MÀN HÌNH]
Owner: qa-system/qa-ui-review/ui-screenshot-review · Nguồn: Ảnh chụp màn hình đính kèm · Verdict: <PASS/ASK>

## Ảnh [n]: [mô tả ngắn màn hình]

### UI Inconsistency
| # | Vị trí | Mô tả (nhìn thấy) | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UI-01 | [vị trí] | [mô tả] | [lý do] | [Low/Med/High] | [đề xuất] |

### Accessibility
| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| AC-01 | … | … | … | … | … |

### UX Problem
| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UX-01 | … | … | … | … | … |

> **Ghi chú độ tin cậy**: [các nhận định gắn [GIẢ ĐỊNH] cần cross-check bằng mắt, nếu có]
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] Bắt buộc có file ảnh đính kèm; nếu không có ảnh phải dừng lại ngay với Verdict `ASK`.
- [ ] Đã quét đủ 3 nhóm (UI Inconsistency, Accessibility, UX Problem) cho từng ảnh, không bỏ nhóm nào.
- [ ] Mọi nhận định dựa trên ảnh mờ hoặc phỏng đoán bắt buộc gắn nhãn `[GIẢ ĐỊNH]`.
- [ ] Mỗi đề xuất sửa đủ cụ thể để Dev/Designer có thể verify lại sau khi sửa.
