# RUN RESULT — [RUN-ID] · [TÊN TÍNH NĂNG]
Thời gian bắt đầu: YYYY-MM-DD HH:mm · Thời gian hoàn thành: YYYY-MM-DD HH:mm
Thiết bị (Device): `<desktop-chrome / mobile-android / mobile-ios / tablet>` — liệt kê mọi project đã chạy, đúng tên `QA_DEVICE`
Tổng số cases: [X] · **PASS**: [A] · **FAIL**: [B] · **BLOCKED**: [C] · **Tỷ lệ Pass**: [%]

---

## 1. Bảng Chi Tiết Kết Quả Thực Thi

| # | TC ID | Device | Tiêu đề | Trạng thái | Actual Result (Thực tế) | Bằng chứng (Evidence) | Defect ID (Nếu có) |
|---|---|---|---|:---:|---|---|:---:|
| 1 | <TC_ID> | <tên project, vd mobile-ios> | <Title từ 05> | **PASS / FAIL / BLOCKED** | <điều quan sát được thật, không suy diễn> | [evidence/<device>/<TC_ID>_<kết quả>.png](evidence/) (một thiết bị: `evidence/<TC_ID>/`) | <BUG-xx hoặc —> |

---

## 2. Nhật Ký Lỗi Nhanh (Failed Issues Summary)

### BUG-01: <tóm tắt lỗi ở TC_ID>
- **Mức độ**: `[ĐỀ XUẤT]` Critical / Major / Minor / Trivial (QA_STANDARD §11)
- **Mô tả**: <Expected (chép từ 05) so với Actual (quan sát thật)>
- **Trace**: Vi phạm `<BR-xx/FD-xx/AF-xx>` trong `01_requirement_risk_summary.md`.
- **Evidence**: `evidence/<TC_ID>_fail.png`
