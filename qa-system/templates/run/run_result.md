# RUN RESULT — [RUN-ID] · [TÊN TÍNH NĂNG]
Thời gian bắt đầu: YYYY-MM-DD HH:mm · Thời gian hoàn thành: YYYY-MM-DD HH:mm
Tổng số cases: [X] · **PASS**: [A] · **FAIL**: [B] · **BLOCKED**: [C] · **Tỷ lệ Pass**: [%]

---

## 1. Bảng Chi Tiết Kết Quả Thực Thi

| # | TC ID | Tiêu đề | Trạng thái | Actual Result (Thực tế) | Bằng chứng (Evidence) | Defect ID (Nếu có) |
|---|---|---|:---:|---|---|:---:|
| 1 | TC-001 | Verify áp mã voucher % hợp lệ | **PASS** | Giảm đúng 10% (trừ 20.000đ), UI hiển thị chính xác | [evidence/TC-001_pass.png](evidence/TC-001_pass.png) | — |
| 2 | TC-005 | Validate áp mã vượt mức tối đa | **FAIL** | Hệ thống vẫn trừ quá số tiền tối đa quy định trong rule | [evidence/TC-005_fail.png](evidence/TC-005_fail.png) | [BUG-01](#bug-01) |

---

## 2. Nhật Ký Lỗi Nhanh (Failed Issues Summary)

### BUG-01: [Tóm tắt ngắn lỗi phát sinh ở TC-005]
- **Mức độ**: High
- **Mô tả**: Khi tổng tiền 500k, áp voucher 20% giảm tối đa 50k, hệ thống thực tế trừ 100k.
- **Trace**: Vi phạm `BR-02` trong `01_requirement_risk_summary.md`.
- **Evidence**: `evidence/TC-005_fail.png`
