---
name: viewpoint-selection
description: >
  Phân rã tính năng thành các Viewpoint (góc nhìn kiểm thử) độc lập theo rủi ro dựa trên registry 8 viewpoint chuẩn.
  Thiết lập ranh giới In/Out scope và kiểm chéo ma trận Zero-Overlap.
---

# Skill: viewpoint-selection

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT · risk matrix 3x3).

## Mục đích
Phân rã tính năng thành các **viewpoint** (góc nhìn kiểm thử) độc lập theo rủi ro, thiết lập
ranh giới In/Out scope chuẩn xác trước khi thiết kế kịch bản chi tiết.

## Đầu vào
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — tổng quan nghiệp vụ, luồng, dữ liệu, risk matrix.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` — quy tắc tiềm ẩn, trường hợp biên, lỗ hổng logic.

## KHÔNG được (riêng skill này)
- Sinh test idea chi tiết, test step hay test case — chỉ dừng ở ranh giới & định hướng góc nhìn.
- Âm thầm đổi tên viewpoint chuẩn trong registry.
- Viết In/Out scope trừu tượng, chung chung — mọi mục phải ánh xạ trực tiếp từ requirement thực tế.

## Registry 8 viewpoint (CỐ ĐỊNH)
Không tự thêm/bớt. Cần góc nhìn đặc thù ngoài registry → gắn `[GIẢ ĐỊNH]` + nêu lý do kỹ thuật/nghiệp vụ.

| Viewpoint | Câu hỏi chủ đạo | Khi nào ưu tiên cao |
|---|---|---|
| Happy Path | Luồng đúng chuẩn xảy ra thế nào? | Mọi tính năng — luôn kiểm tra trước tiên |
| Negative | Input sai / flow gián đoạn thì sao? | Form có input, flow nhiều bước |
| Boundary | Giới hạn hệ thống ở đâu? | Bất kỳ field số / text / date |
| Security | Có thể bị tấn công / bypass không? | Auth, payment, admin |
| UX/Usability | User hiểu và dùng được không? | Tính năng mới, form phức tạp |
| Performance | Chịu tải thực tế không? | API, search, real-time |
| Accessibility | User đặc biệt dùng được không? | Public-facing, B2C |
| Integration | Tương tác hệ thống khác thế nào? | Có call API bên ngoài |

Ưu tiên hoá theo risk: **Business Impact** → Happy Path, Negative, Security ·
**Likelihood** → Boundary, Integration, Negative · **Detectability** → Security, Integration, Performance.

## Các bước
1. **Chiến lược độ phủ theo rủi ro** — liệt kê các **Risk Area** trọng yếu từ output 01 + 02;
   chấm Likelihood × Impact (§5); xếp hạng theo nguyên tắc *"test đúng chỗ, không phải test nhiều"*;
   với rủi ro ưu tiên cao nhất, nêu **loại test cần làm** (vd BVA cho tính tiền giảm, Decision
   Table cho tổ hợp điều kiện áp mã, Negative cho mã hết hạn).
2. **Tuyển chọn viewpoint** — chọn **toàn bộ viewpoint áp dụng được** cho tính năng, đối chiếu
   registry ở trên. Mọi Risk Area ưu tiên cao phải được ánh xạ tới ít nhất một viewpoint.
3. **Đặc tả từng viewpoint** đủ **6 trường** (xem format).
4. **Kiểm chéo Zero-Overlap** — In-scope của viewpoint này không được xuất hiện trong In-scope
   của viewpoint khác; mọi điểm giao thoa tiềm ẩn phải có quy ước bàn giao ghi ở Out-of-scope.

## Format output
Ghi ra `OUTPUT/<task-slug>/03_viewpoint_report.md`:

```markdown
# BÁO CÁO PHÂN TÍCH VIEWPOINT KIỂM THỬ — [TÊN TÍNH NĂNG]

## 1. CHIẾN LƯỢC ĐỘ PHỦ THEO RỦI RO
### 1.1 Ma trận Ưu tiên Rủi ro (Likelihood × Impact)
| # | Risk Area | Likelihood | Impact | Mức ưu tiên | Nguồn (Rule/Missing Rule) |
|:---|:---|:---:|:---:|:---:|:---|
| RK-01 | [mô tả khu vực rủi ro] | [Thấp/TB/Cao] | [Thấp/TB/Cao] | [Ưu tiên 1] | [BR-xx / MR-xx] |

### 1.2 Xếp hạng ưu tiên & loại test cần làm
- [Risk Area theo ưu tiên giảm dần, kèm loại test cần làm cho từng rủi ro cao]

### 1.3 Liên kết Risk → Viewpoint
- [Mỗi Risk Area ưu tiên cao được phủ bởi viewpoint nào — không để rủi ro cao nào "mồ côi"]

## 2. TỔNG QUAN LỰA CHỌN VIEWPOINT
| STT | Tên Viewpoint | Mức rủi ro | Nguồn | Lý do lựa chọn |
|:---|:---|:---|:---|:---|
| 1 | [tên chuẩn từ registry] | [High/Med/Low] | Registry | [lý do] |
| 2 | [GIẢ ĐỊNH] [tên mới] | [High/Med/Low] | [GIẢ ĐỊNH] | [lý do bắt buộc cần bổ sung] |

## 3. ĐẶC TẢ CHI TIẾT CÁC VIEWPOINT
### Viewpoint [NN]: [Tên]
- **Tên Viewpoint**: [đúng tên registry, hoặc [GIẢ ĐỊNH] + tên]
- **Mục tiêu kiểm thử**: [giá trị chất lượng cần đạt + rủi ro chính cần ngăn]
- **Phạm vi bao phủ (In-scope)**:
  - [mục in-scope gắn requirement thực tế]
- **Phạm vi loại trừ (Out-of-scope)**:
  - [mục out-of-scope — thuộc trách nhiệm của Viewpoint X]
- **Rủi ro nếu bỏ qua**: [hậu quả cụ thể với user / hệ thống / kinh doanh]
- **Ước lượng định tính Test Idea**: [Cao/TB/Thấp + luận điểm — KHÔNG đưa quota con số]

*(Lặp lại cho toàn bộ viewpoint được chọn)*

## 4. MA TRẬN ZERO-OVERLAP
| Viewpoint A | Viewpoint B | Điểm nguy cơ giao thoa | Ranh giới phân định |
|:---|:---|:---|:---|
| [VP A] | [VP B] | [mô tả giao thoa tiềm ẩn] | [VP A phụ trách…, VP B phụ trách…] |

## 5. XÁC NHẬN BÀN GIAO
- [ ] Mọi Risk Area ưu tiên cao đã ánh xạ tới viewpoint.
- [ ] Chọn đủ mọi viewpoint áp dụng được theo rủi ro.
- [ ] Tên viewpoint đúng registry; ngoài registry đều có `[GIẢ ĐỊNH]`.
- [ ] In/Out scope không trùng lặp.
- [ ] Không sinh test idea/test case chi tiết.
```

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] File output lưu tại `OUTPUT/<task-slug>/03_viewpoint_report.md`.
- [ ] 100% Risk Area ưu tiên cao từ output 01 và 02 được liên kết với ít nhất một Viewpoint.
- [ ] Ma trận Zero-Overlap phân định ranh giới rõ ràng, không có sự chồng lấn In-scope giữa các Viewpoint.
- [ ] Mọi viewpoint ngoài registry 8 chuẩn bắt buộc gắn nhãn `[GIẢ ĐỊNH]` kèm giải trình kỹ thuật.
