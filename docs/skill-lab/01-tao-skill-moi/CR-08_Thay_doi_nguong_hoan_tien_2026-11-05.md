# Change Request CR-08 — Ngưỡng tự động duyệt và độ dài mô tả

Ngày: 2026-11-05 · Người yêu cầu: Nguyễn Minh Đức (PO) · Trạng thái: Đã phê duyệt

> Tài liệu thực hành Skill Lab (giảng viên đóng vai PO).

## Nội dung thay đổi
1. Thay đổi quy tắc R5 của SRS Hoàn tiền phiên bản 2.0: ngưỡng tự động duyệt giảm từ 500.000đ xuống 300.000đ. Điều kiện lý do Hàng lỗi giữ nguyên.
2. Trường Mô tả: độ dài tối đa tăng từ 500 lên 1.000 ký tự.

## Lý do
Giảm rủi ro tự động duyệt sai với đơn giá trị trung bình; khách hàng cần mô tả lỗi chi tiết hơn.

## Ảnh hưởng
Bộ đếm ký tự trên màn hình cập nhật theo độ dài mới. Thông báo khi vượt độ dài sẽ được BA gửi sau.
