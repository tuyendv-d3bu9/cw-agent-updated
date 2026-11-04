# Bằng chứng — hai lần chạy Chặng 01–02 trên tính năng hoàn tiền

Đo ngày 2026-11-04. Lần A và lần B do hai phiên AI độc lập chạy trên cùng `INPUT/` (lần B không thấy kết quả lần A).
Lưu ý: ở lần đo này **cả 01 và 02 đều chạy lại**, nên một phần độ lệch đến từ 01. Bài 2 cố định 01 để đo riêng skill 02.

## Kết quả `npm run diff-runs`

```
Bộ mã                A     B   trùng
   BR                15    15   100%
   FD                 4     4   100%
   AF                 7     8    88%
   OQ                 5     6    83%
   RK                 7     7   100%
   MR                16    13    81%

Nội dung                         A     B   trùng
   câu trích 01                28    29    58%
   câu hỏi MR (đúng chữ)       16    13     0%     ← câu hỏi là văn tự do, chỉ số này không dùng để đánh giá
   ô 06W có kẽ hở              26    21    34%
   phán quyết ô 06W           156   162    59%
```

## Đối chiếu chủ đề câu hỏi (bằng tay)

| Chủ đề | Lần A (ô) | Lần B (ô) | Ghi chú |
|---|---|---|---|
| Ảnh bắt buộc khi Hàng lỗi (tracked change) | FD-04 × W3 | FD-01 × W1 | Cùng câu, khác ô |
| Giao sai hàng có tự động duyệt? (comment PO) | BR-05 × W3 | BR-05 × W1 | Cùng câu, khác ô |
| Dòng mã lỗi bị ẩn / vượt số lần | BR-13 × W6 | BR-13 × W2 | Cùng câu, khác ô |
| Hoàn tiền qua cổng thanh toán thất bại | BR-07 × W2, W6 | BR-07 × W5 | Cùng câu, khác ô |
| Thời gian xử lý tối đa | BR-06 × W4 | BR-06 × W4 | Trùng |
| Thông báo lỗi ràng buộc từng field | FD-01…04 × W1 | FD-02…04 × W1 | Gần trùng |
| Cách tính 10 ngày, múi giờ | BR-02 × W3, W4 | BR-02 × W4 | Gần trùng |
| Trần tiền yêu cầu thứ hai | BR-04 × W3 | BR-04 × W3 | Trùng |
| Trưởng nhóm duyệt yêu cầu nhỏ | BR-06 × W5 | BR-06 × W5 | Trùng |
| Ràng buộc lý do từ chối | BR-08 × W1 | BR-08 × W1 | Trùng |
| Huỷ và duyệt cùng lúc | BR-10/11 × W4 | BR-11 × W4 | Gần trùng |
| Email thông báo | BR-14 × W3 | BR-14 × W6 | Cùng chủ đề, khác ô |
| **Đơn COD đã giao** | BR-01 × W3 | — | **B bỏ sót** |
| **Gửi yêu cầu cho đơn của người khác** | BR-01 × W5 | — | **B bỏ sót** |
| **Nhân viên CSKH với yêu cầu trên ngưỡng** | BR-06 × W2 | — | **B bỏ sót** |
| **Số tiền đã thanh toán gồm những gì** | FD-02 × W3 | — | **B bỏ sót** |
| Phương thức thanh toán gốc không dùng được | (gộp trong câu cổng thanh toán) | BR-07 × W3 | Khác cách gộp |

**Đọc kết quả:** phần có trong tài liệu (comment, chữ ẩn, TBD) → 100% trùng chủ đề. Phần phải phán đoán → lệch ô
(cùng câu nhưng W1/W3/W6 tuỳ lần), và 4 câu hỏi về **người khác / vai trò** (W5), **con số gồm gì** (W3),
**ngoài phạm vi nhưng vẫn đi được** (W2) chỉ một lần hỏi.

## Test case bịa mẫu (cho bài nâng cao)

```markdown
### TC_ID: REFUND-901
- **Title**: Verify khách bị khoá chức năng hoàn tiền khi gửi quá nhiều yêu cầu
- **Precondition**:
  - [GIẢ ĐỊNH] Khách đã gửi 5 yêu cầu trong ngày
- **Test Steps**:
  1. Mở chi tiết đơn hàng Đã giao
  2. Chọn Yêu cầu hoàn tiền
  3. Nhấn Gửi yêu cầu
- **Test Data**:
  - Số tiền yêu cầu: 15.000.000đ
  - Thời gian khoá: 30 phút
- **Expected Result**:
  - Hiển thị thông báo "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 30 phút."
  - Mã lỗi E-REFUND-429
- **Priority**: High
- **Tags**: Rule#BR-13, Viewpoint#VP-02, TI#TI-33, Module#REFUND, Manual
```

Lint hiện tại chặn 4 lỗi (`[GIẢ ĐỊNH]`, câu thông báo, 15.000.000, 30). `E-REFUND-429` chưa bị chặn.
