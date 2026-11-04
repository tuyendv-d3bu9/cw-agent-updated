# API — Tạo yêu cầu hoàn tiền

Phiên bản: 1.1 · Ngày: 2026-10-14 · Người soạn: Phạm Quốc Huy (Dev lead)

## Endpoint
`POST /api/v1/orders/{orderId}/refund-requests`

## Request body
| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| reason | enum | Có | DEFECTIVE, WRONG_ITEM, NO_LONGER_NEEDED |
| amount | integer (VND) | Có | Tối thiểu 10.000, không vượt quá paidAmount của đơn hàng |
| description | string | Không | Tối đa 500 ký tự |
| images | array of file | Không | Tối đa 3 tệp; mỗi tệp tối đa 5 MB; định dạng JPG hoặc PNG |

Ánh xạ lý do trên giao diện: DEFECTIVE = Hàng lỗi · WRONG_ITEM = Giao sai hàng · NO_LONGER_NEEDED = Không còn nhu cầu.

## Phản hồi
| HTTP | Mã lỗi | Khi nào |
|---|---|---|
| 201 | — | Tạo yêu cầu thành công |
| 403 | ORDER_NOT_DELIVERED | Đơn hàng chưa ở trạng thái Đã giao |
| 422 | REFUND_WINDOW_EXPIRED | Quá thời hạn gửi yêu cầu |
| 409 | REFUND_ALREADY_PENDING | Đơn hàng đã có yêu cầu Chờ duyệt |
| 400 | REFUND_AMOUNT_EXCEEDED | amount lớn hơn paidAmount |
| 400 | VALIDATION_ERROR | Dữ liệu không đúng ràng buộc của request body |

Chữ thông báo hiển thị cho từng mã lỗi: xem file Mã lỗi hoàn tiền.
