<!-- SOURCE_METADATA (intake ghi; dùng cho QA_STANDARD §10.2 — bản nào mới hơn)
source_file: SRS_Hoan_tien_v1.docx
sha256: 1534e8fb42c9114c6d7788b6a2467dd4bed4e2ee8b28d019862961aa0ef0d386
title: Đặc tả yêu cầu — Hoàn tiền đơn hàng
version: 1.0
date: 2026-09-15T08:00:00Z
last_modified: 2026-09-15T17:00:00Z
last_modified_by: Trần Thị Lan
-->

# Đặc tả yêu cầu — Yêu cầu hoàn tiền đơn hàng

Phiên bản: 1.0

Ngày: 2026-09-15

## 1. Phạm vi

Tính năng cho phép khách hàng gửi yêu cầu hoàn tiền cho đơn hàng đã mua trên ShopGo.

## 2. Quy tắc nghiệp vụ

R1. Chỉ đơn hàng ở trạng thái Đã giao mới được gửi yêu cầu hoàn tiền.

R2. Yêu cầu phải được gửi trong vòng 5 ngày kể từ ngày giao hàng thành công.

R3. Mọi yêu cầu hoàn tiền do Nhân viên CSKH duyệt.

## Annotations / Pending changes
> Trích tự động khi intake. **Chưa phải sự thật** (QA_STANDARD §10.2): mỗi dòng cần BA/PO xác nhận — sinh MR, không dùng làm rule.

Không phát hiện comment, tracked change, header/footer hay nội dung ẩn.
