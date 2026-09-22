# Mô Tả Kỹ Thuật (Technical Spec)
- **Nguồn tiếp nhận**: `INPUT/spec.txt`
- **Phân loại**: `03_dev` (Mô tả kỹ thuật & ràng buộc hệ thống)
- **Thời gian tiếp nhận**: 2026-09-20 (Cập nhật đính chính lúc 21:09)

## Nội Dung Đặc Tả Kỹ Thuật
> **Quy định chính thức sau đính chính**: "Mức hóa đơn tối thiểu áp mã là 200k" (200.000 VNĐ).

## Phân Tích & Đối Soát Nghiệp Vụ:
1. **Phạm vi áp dụng**:
   - Mức sàn tối thiểu chung cho toàn bộ hệ thống để được kích hoạt tính năng áp mã voucher là `200.000 VNĐ` (`subtotal >= 200.000 VNĐ`).
2. **Khớp 100% với Web Live (`https://cwshopgo.github.io/`)**:
   - Mã `GIAM50K`: `minSubtotal = 200.000 VNĐ` ➔ Hoàn toàn khớp với mức sàn 200k.
   - Mã `SALE20`: `minSubtotal = 300.000 VNĐ` (thỏa mãn điều kiện >= 200k).
   - Ngưỡng Freeship: `200.000 VNĐ` ➔ Các ngưỡng chính sách thương mại đạt tính nhất quán cao.
