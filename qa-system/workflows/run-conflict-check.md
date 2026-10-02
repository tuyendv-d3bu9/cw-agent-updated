# Workflow: Rà Soát Xung Đột Tri Thức Chéo (Cross-Feature Conflict Check)

> **Mục đích**: Tự động phát hiện các kẽ hở logic đá nhau giữa tính năng đang phân tích với toàn bộ các tính năng đã có trong `knowledge/features/*.md`.

---

## 1. Trách Nhiệm Phân Vai

| Vai trò | Phụ trách | Tác vụ |
|---|---|---|
| **`qa-lead`** | Điều phối | Tự động kích hoạt kiểm tra xung đột trước khi nghiệm thu Chặng 1 và Chặng 2 |
| **`qa-analyst`** | Phân tích & Cảnh báo | Đọc báo cáo `01_conflict_warning.md`, đưa các điểm mâu thuẫn vào `02_missing_rule_report.md` với verdict `ASK` |

---

## 2. Các Kịch Bản Thao Tác (100% Zero-CLI)

### Kịch bản: Kiểm Tra Xung Đột Tính Năng Mới
1. **User yêu cầu**: *"Kiểm tra xem tính năng mới có đá logic với các tính năng cũ không?"*
2. **QA Leader thực hiện**:
   - Chạy ngầm: `node qa-system/tools/knowledge/conflict-detector.js <task-slug>`
   - Quét qua 4 khía cạnh:
     1. Điều kiện tài khoản: Khách vãng lai (Guest) vs Bắt buộc đăng nhập.
     2. Cộng dồn khuyến mãi: Được phép hay không được phép dùng chung voucher với flash sale/giảm giá khác.
     3. Phạm vi giảm giá: Tiền hàng vs Phí vận chuyển.
     4. Quy định huỷ đơn: Có phục hồi lại voucher/quyền lợi hay mất vĩnh viễn.
   - Báo cáo kết quả ra hội thoại chat và ghi vào `OUTPUT/<task-slug>/01_conflict_warning.md`.
