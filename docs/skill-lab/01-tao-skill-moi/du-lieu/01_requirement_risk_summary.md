# Requirement & Risk Summary · hoan-tien
Owner: qa-system/qa-analyst/skills/requirement-risk-summary.md · Nguồn: 02_ba/srs-hoan-tien-v2.md, 02_ba/brd-hoan-tien-2026-10-01.md, 03_dev/api-refund-request-spec.md, 03_dev/api-ma-loi-hoan-tien.md, 04_design/wireframe-man-hinh-hoan-tien.md, 05_communication/cr-07-thoi-han-hoan-tien-2026-10-20.md, 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md, 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md, 05_communication/qa-po-bo-sung-hoan-tien-2026-11-04.md, knowledge/_project.md, knowledge/features/hoan-tien.md · Verdict: PASS

> Không đọc `02_ba/_superseded/srs-hoan-tien-v1.md` (bản 1.0 đã bị thay bởi 2.0).
> Lần chạy 2 (2026-11-04, sau khi cổng ASK mở): thêm BR/FD/AF từ quyết định đã chốt ở knowledge §8 (nguồn `knowledge §8 #n`). Mã cũ giữ nguyên.
> Ngăn `01_business/` trống; BRD nằm ở `02_ba/` và được dùng làm nguồn bối cảnh (§8, §9).

## 1. FEATURE OVERVIEW
Khách hàng gửi yêu cầu hoàn tiền cho đơn hàng đã mua trên ShopGo; bộ phận CSKH duyệt hoặc từ chối, một phần yêu cầu được hệ thống tự động duyệt. — Nguồn: 02_ba/srs-hoan-tien-v2.md §1, §3 (R5)

## 2. ACTOR & USER ROLE
| Actor | Vai trò / quyền hạn | Nguồn (file §mục) |
|---|---|---|
| Khách hàng | Tạo, xem và huỷ yêu cầu hoàn tiền của đơn hàng của chính mình | 02_ba/srs-hoan-tien-v2.md §2 |
| Nhân viên CSKH | Duyệt hoặc từ chối yêu cầu hoàn tiền (các yêu cầu không thuộc ngưỡng của Trưởng nhóm) | 02_ba/srs-hoan-tien-v2.md §2, §3 R6 |
| Trưởng nhóm CSKH | Duyệt hoặc từ chối yêu cầu hoàn tiền có giá trị lớn | 02_ba/srs-hoan-tien-v2.md §2, §3 R6 |
| Hệ thống | Tự động duyệt yêu cầu thoả R5 | 02_ba/srs-hoan-tien-v2.md §3 R5 |

## 3. BUSINESS RULES
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| BR-01 | Đơn hàng ở trạng thái Đã giao | Được gửi yêu cầu hoàn tiền; trạng thái khác thì không | 02_ba/srs-hoan-tien-v2.md §3 R1 | Chỉ đơn hàng ở trạng thái Đã giao mới được gửi yêu cầu hoàn tiền. |
| BR-02 | Yêu cầu được gửi trong vòng 10 ngày kể từ ngày giao hàng thành công | Được gửi; quá hạn thì bị từ chối (AF-01). CR-07 (đã phê duyệt, ngày mới hơn) thay giá trị 7 ngày của SRS R2 — áp thứ tự ưu tiên nguồn QA_STANDARD §10.2 (CR thắng spec) | 05_communication/cr-07-thoi-han-hoan-tien-2026-10-20.md §Nội dung thay đổi | thời hạn gửi yêu cầu hoàn tiền tăng từ 7 ngày lên 10 ngày kể từ ngày giao hàng thành công |
| BR-03 | Đơn hàng đã có 1 yêu cầu ở trạng thái Chờ duyệt | Không được có thêm yêu cầu Chờ duyệt thứ hai cùng lúc | 02_ba/srs-hoan-tien-v2.md §3 R3 | Mỗi đơn hàng chỉ có tối đa 1 yêu cầu hoàn tiền ở trạng thái Chờ duyệt tại một thời điểm. |
| BR-04 | Số tiền yêu cầu so với số tiền khách đã thanh toán cho đơn hàng | Số tiền yêu cầu không được vượt quá số tiền đã thanh toán | 02_ba/srs-hoan-tien-v2.md §3 R4 | Số tiền yêu cầu hoàn không được vượt quá số tiền khách đã thanh toán cho đơn hàng. |
| BR-05 | Số tiền từ 500.000đ trở xuống **VÀ** lý do là Hàng lỗi | Hệ thống tự động duyệt | 02_ba/srs-hoan-tien-v2.md §3 R5 | Yêu cầu có số tiền từ 500.000đ trở xuống và lý do là Hàng lỗi được hệ thống tự động duyệt. |
| BR-06 | Số tiền trên 5.000.000đ; các yêu cầu còn lại | Trên 5.000.000đ: Trưởng nhóm CSKH duyệt; còn lại: Nhân viên CSKH duyệt | 02_ba/srs-hoan-tien-v2.md §3 R6 | Yêu cầu có số tiền trên 5.000.000đ phải do Trưởng nhóm CSKH duyệt. Các yêu cầu còn lại do Nhân viên CSKH duyệt. |
| BR-07 | Yêu cầu được duyệt | Tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng | 02_ba/srs-hoan-tien-v2.md §3 R7 | Khi yêu cầu được duyệt, tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng. |
| BR-08 | Người duyệt từ chối yêu cầu | Phải nhập lý do từ chối | 02_ba/srs-hoan-tien-v2.md §3 R8 | Khi từ chối yêu cầu, người duyệt phải nhập lý do từ chối. |
| BR-09 | Yêu cầu vừa được tạo | Trạng thái Chờ duyệt | 02_ba/srs-hoan-tien-v2.md §4 | Yêu cầu mới tạo có trạng thái Chờ duyệt. |
| BR-10 | Người duyệt chấp nhận / từ chối; cổng thanh toán xác nhận hoàn tiền thành công | Chờ duyệt → Đã duyệt; Chờ duyệt → Từ chối; Đã duyệt → Đã hoàn tiền | 02_ba/srs-hoan-tien-v2.md §4 | Chờ duyệt chuyển sang Đã duyệt khi người duyệt chấp nhận; Chờ duyệt chuyển sang Từ chối khi người duyệt từ chối; Đã duyệt chuyển sang Đã hoàn tiền khi cổng thanh toán xác nhận hoàn tiền thành công. |
| BR-11 | Khách hàng huỷ khi yêu cầu còn ở trạng thái Chờ duyệt | Được huỷ; yêu cầu chuyển sang Đã huỷ | 02_ba/srs-hoan-tien-v2.md §4 | Khách hàng được huỷ yêu cầu khi yêu cầu còn ở trạng thái Chờ duyệt. Yêu cầu đã huỷ có trạng thái Đã huỷ. |
| BR-12 | Khách hàng muốn thay đổi yêu cầu đã gửi | Không được sửa; phải huỷ và gửi yêu cầu mới | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #1 | Khách hàng không được sửa yêu cầu hoàn tiền sau khi đã gửi; muốn thay đổi thì huỷ và gửi yêu cầu mới. |
| BR-13 | Số lần gửi yêu cầu của một đơn hàng, tính cả yêu cầu đã bị từ chối hoặc đã huỷ | Tối đa 2 lần | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #2 | Mỗi đơn hàng được gửi yêu cầu hoàn tiền tối đa 2 lần, tính cả yêu cầu đã bị từ chối hoặc đã huỷ. |
| BR-14 | Yêu cầu được duyệt hoặc bị từ chối | Khách hàng nhận email thông báo | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #3 | Khách hàng nhận email thông báo khi yêu cầu được duyệt hoặc bị từ chối. |
| BR-15 | Yêu cầu ở trạng thái Chờ duyệt (màn Chi tiết yêu cầu) | Nút "Huỷ yêu cầu" chỉ hiển thị ở trạng thái này | 04_design/wireframe-man-hinh-hoan-tien.md §Màn hình "Chi tiết yêu cầu hoàn tiền" | Nút "Huỷ yêu cầu" chỉ hiển thị khi yêu cầu ở trạng thái Chờ duyệt. |
| BR-16 | Đơn hàng thanh toán khi nhận hàng (COD) ở trạng thái Đã giao | Ẩn nút Yêu cầu hoàn tiền | knowledge §8 #1 |  |
| BR-17 | Tính thời hạn của BR-02 | Ngày giao hàng thành công là ngày 0; hạn cuối là 23:59 ngày thứ 10, theo giờ Việt Nam (UTC+7) | knowledge §8 #3 |  |
| BR-18 | Đơn hàng đã có yêu cầu được hoàn một phần, gửi yêu cầu thứ hai | Trần của yêu cầu thứ hai bằng số tiền đã thanh toán trừ phần đã hoàn | knowledge §8 #4 |  |
| BR-19 | Yêu cầu từ 500.000đ trở xuống với lý do khác Hàng lỗi | Không tự động duyệt — chỉ lý do Hàng lỗi được tự động duyệt (BR-05) | knowledge §8 #5 |  |
| BR-20 | Nhân viên CSKH xem yêu cầu trên 5.000.000đ | Thấy trong danh sách nhưng không có nút Duyệt và Từ chối | knowledge §8 #6 |  |
| BR-21 | Trưởng nhóm CSKH với yêu cầu bất kỳ | Được duyệt và từ chối mọi yêu cầu | knowledge §8 #7 |  |
| BR-22 | Yêu cầu bị từ chối | Email từ chối có kèm lý do từ chối (chưa có mẫu email — chỉ kiểm có gửi email) | knowledge §8 #10 |  |
| BR-23 | Số tiền đã thanh toán (paidAmount) dùng làm trần ở BR-04 | Gồm phí vận chuyển và đã trừ giảm giá voucher | knowledge §8 #14 |  |
| BR-24 | Lý do là Hàng lỗi **VÀ** không đính kèm ảnh minh chứng | Không gửi được; dùng thông báo của trường bắt buộc (R9 được chấp nhận) | knowledge §8 #15 |  |
| BR-25 | Khách hàng gửi yêu cầu thành công | Hiển thị thông báo "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." | 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Gửi thành công: "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." |

## 3b. FIELD & RÀNG BUỘC
| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | Lý do (reason) | Danh sách chọn (enum) | Có | Một trong: Hàng lỗi (DEFECTIVE) · Giao sai hàng (WRONG_ITEM) · Không còn nhu cầu (NO_LONGER_NEEDED) | Vui lòng nhập thông tin này. | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Ánh xạ lý do trên giao diện: DEFECTIVE = Hàng lỗi · WRONG_ITEM = Giao sai hàng · NO_LONGER_NEEDED = Không còn nhu cầu. |
| FD-02 | Số tiền yêu cầu (amount) | Số nguyên (VND) | Có | Tối thiểu 10.000; tối đa = số tiền đã thanh toán của đơn hàng (paidAmount) | Vui lòng nhập thông tin này. | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Tối thiểu 10.000, không vượt quá paidAmount của đơn hàng |
| FD-03 | Mô tả (description) | Văn bản (string) | Không | Tối đa 500 ký tự | Mô tả tối đa 500 ký tự. | 03_dev/api-refund-request-spec.md §Request body; 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md (knowledge §8 #13) | Tối đa 500 ký tự |
| FD-04 | Ảnh minh chứng (images) | Tệp ảnh (array of file) | Không — bắt buộc khi lý do là Hàng lỗi (BR-24) | Tối đa 3 tệp; mỗi tệp tối đa 5 MB; định dạng JPG hoặc PNG | Chỉ chấp nhận ảnh JPG hoặc PNG. | 03_dev/api-refund-request-spec.md §Request body; 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md (knowledge §8 #13) | Tối đa 3 tệp; mỗi tệp tối đa 5 MB; định dạng JPG hoặc PNG |
| FD-05 | Lý do từ chối (người duyệt nhập) | Văn bản | Có | Tối đa 255 ký tự; chuỗi chỉ có khoảng trắng bị chặn | Vui lòng nhập lý do từ chối. | knowledge §8 #9 |  |

## 4. HAPPY PATH
1. Khách hàng mở chi tiết đơn hàng ở trạng thái Đã giao và chọn Yêu cầu hoàn tiền. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 1
2. Khách hàng chọn lý do, nhập số tiền yêu cầu, mô tả và đính kèm ảnh minh chứng (nếu có). — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 2
3. Khách hàng nhấn Gửi yêu cầu. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 3
4. Hệ thống kiểm tra các quy tắc R1 đến R4 và tạo yêu cầu ở trạng thái Chờ duyệt. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 4
5. Hệ thống hiển thị "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." — Nguồn: 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo
6. Hệ thống áp dụng R5 hoặc chuyển yêu cầu cho người duyệt theo R6. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 5

## 5. ALTERNATE FLOWS
| ID | Tình huống | Hệ thống phản hồi | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
| AF-01 | Đơn hàng quá thời hạn gửi yêu cầu (BR-02) — mã REFUND_WINDOW_EXPIRED | Đơn hàng đã quá thời hạn yêu cầu hoàn tiền. | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | Đơn hàng quá thời hạn ở R2: hệ thống từ chối tạo yêu cầu và hiển thị thông báo lỗi. |
| AF-02 | Đơn hàng đã có yêu cầu Chờ duyệt (BR-03) — mã REFUND_ALREADY_PENDING | Đơn hàng đang có yêu cầu hoàn tiền chờ xử lý. | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | Đơn hàng đã có yêu cầu Chờ duyệt: hệ thống từ chối tạo yêu cầu mới. |
| AF-03 | Số tiền yêu cầu vượt quá số tiền đã thanh toán (BR-04) — mã REFUND_AMOUNT_EXCEEDED | Số tiền yêu cầu vượt quá số tiền đã thanh toán. | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | Số tiền vượt quá số tiền đã thanh toán: hệ thống không cho gửi yêu cầu. |
| AF-04 | Đơn hàng chưa ở trạng thái Đã giao (BR-01) — mã ORDER_NOT_DELIVERED | Chỉ đơn hàng đã giao mới được yêu cầu hoàn tiền. | 03_dev/api-refund-request-spec.md §Phản hồi; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | Đơn hàng chưa ở trạng thái Đã giao |
| AF-05 | Thiếu trường bắt buộc khi gửi | Vui lòng nhập thông tin này. | 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Thiếu trường bắt buộc: viền đỏ ở trường bị thiếu và dòng chữ "Vui lòng nhập thông tin này." |
| AF-06 | Lý do không hợp lệ, chỉ xảy ra khi gọi API — mã VALIDATION_ERROR | HTTP 400 VALIDATION_ERROR, không có chữ hiển thị. | 03_dev/api-refund-request-spec.md §Phản hồi; 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md (knowledge §8 #13) | Dữ liệu không đúng ràng buộc của request body |
| AF-07 | Khách hàng bấm "Huỷ yêu cầu" ở màn Chi tiết | Bạn chắc chắn muốn huỷ yêu cầu hoàn tiền này? | 04_design/wireframe-man-hinh-hoan-tien.md §Màn hình "Chi tiết yêu cầu hoàn tiền" | Khi bấm "Huỷ yêu cầu": hộp xác nhận "Bạn chắc chắn muốn huỷ yêu cầu hoàn tiền này?" với hai nút "Huỷ yêu cầu" và "Quay lại". |
| AF-08 | Tài khoản gửi yêu cầu cho orderId không thuộc về mình | HTTP 404 với mã lỗi ORDER_NOT_FOUND | knowledge §8 #2 |  |
| AF-09 | Hoàn tiền qua cổng thanh toán thất bại | Giữ trạng thái Đã duyệt; CSKH thử lại hoàn tiền thủ công. | knowledge §8 #8 |  |
| AF-10 | Khách huỷ và người duyệt duyệt cùng một yêu cầu gần như đồng thời | Yêu cầu đã được cập nhật bởi người khác. Vui lòng tải lại trang. | knowledge §8 #11 |  |
| AF-11 | Đơn hàng đã gửi đủ 2 lần (BR-13) — mã REFUND_LIMIT_REACHED | Đơn hàng đã hết số lần yêu cầu hoàn tiền. | knowledge §8 #12 |  |
| AF-12 | Số tiền yêu cầu dưới 10.000 (FD-02) | Số tiền yêu cầu tối thiểu là 10.000đ. | knowledge §8 #13 |  |
| AF-13 | Đính kèm quá 3 ảnh (FD-04) | Chỉ được đính kèm tối đa 3 ảnh. | knowledge §8 #13 |  |
| AF-14 | Ảnh vượt quá 5 MB (FD-04) | Mỗi ảnh tối đa 5 MB. | knowledge §8 #13 |  |
| AF-15 | Gọi API tạo yêu cầu cho đơn COD ở trạng thái Đã giao (BR-16) | HTTP 403 với mã lỗi ORDER_NOT_DELIVERED | knowledge §8 #17 |  |

## 6. OUT OF SCOPE
| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|
| Hoàn tiền cho đơn hàng thanh toán khi nhận hàng (COD) | 02_ba/srs-hoan-tien-v2.md §1 | Hoàn tiền cho đơn hàng thanh toán khi nhận hàng (COD) không thuộc phạm vi phiên bản này. |
| Đổi sang sản phẩm khác | 02_ba/srs-hoan-tien-v2.md §1 | Đổi sang sản phẩm khác không thuộc phạm vi tài liệu này. |

## 7. ĐIỂM CHƯA RÕ
| ID | Điểm chưa rõ | Vị trí trong nguồn |
|---|---|---|
| OQ-01 | Tracked change chưa duyệt: thêm "R9. Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi." — chưa phải rule — đã chốt: knowledge §8 #15 | 02_ba/srs-hoan-tien-v2.md §Annotations #1 |
| OQ-02 | Comment của PO: lý do Giao sai hàng có được tự động duyệt giống Hàng lỗi (BR-05) không — đã chốt: knowledge §8 #5 | 02_ba/srs-hoan-tien-v2.md §Annotations #2 |
| OQ-03 | Dòng mã lỗi REFUND_LIMIT_REACHED bị ẩn trong file gốc — còn hiệu lực không, và có phải thông báo cho BR-13 không — đã chốt: knowledge §8 #12 | 03_dev/api-ma-loi-hoan-tien.md §Annotations #1 |
| OQ-04 | Luồng hoàn tiền qua cổng thanh toán thất bại ghi "[ĐANG CẬP NHẬT]" — đã chốt: knowledge §8 #8 | 02_ba/srs-hoan-tien-v2.md §7 |
| OQ-05 | Thời gian tối đa để CSKH xử lý một yêu cầu còn mở trong biên bản họp — đã chốt: knowledge §8 #16 | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Việc còn mở |

## 8. BUSINESS CRITICALITY ASSESSMENT
- Bối cảnh ghi nhận: khách hàng hiện yêu cầu hoàn tiền qua hotline, CSKH xử lý thủ công; khoảng 1.200 yêu cầu mỗi tháng; khiếu nại về hoàn tiền chậm chiếm 18% tổng khiếu nại quý 3/2026 — Nguồn: 02_ba/brd-hoan-tien-2026-10-01.md §Bối cảnh
- Mục tiêu: 90% yêu cầu được xử lý trong 2 ngày làm việc; tự động duyệt yêu cầu giá trị nhỏ — Nguồn: 02_ba/brd-hoan-tien-2026-10-01.md §Mục tiêu
- Giá trị tiền trung bình một yêu cầu, doanh thu bị ảnh hưởng: [CONTEXT_MISSING]

## 9. MISSING RISK CONTEXT INFORMATION
| Khía cạnh | Có trong nguồn | Thiếu | Ảnh hưởng tới chấm rủi ro |
|---|---|---|---|
| User | Khách hàng đã mua trên web ShopGo; nhân viên và trưởng nhóm CSKH — 02_ba/brd-hoan-tien-2026-10-01.md §Đối tượng sử dụng | Không | Không |
| Usage | Khoảng 1.200 yêu cầu mỗi tháng — 02_ba/brd-hoan-tien-2026-10-01.md §Bối cảnh | Cao điểm, tải đồng thời: [CONTEXT_MISSING] | Không chấm được rủi ro đồng thời (W4) từ số liệu |
| Financial | Không | Giá trị trung bình / tổng tiền hoàn: [CONTEXT_MISSING] | Impact tài chính chấm theo mô tả "mất tiền", cờ tin cậy thấp |
| Operational | Mục tiêu 90% yêu cầu xử lý trong 2 ngày làm việc — 02_ba/brd-hoan-tien-2026-10-01.md §Mục tiêu | Thời gian xử lý tối đa của CSKH (OQ-05) | Không |
| Criticality | Khiếu nại hoàn tiền chậm chiếm 18% tổng khiếu nại quý 3/2026 — 02_ba/brd-hoan-tien-2026-10-01.md §Bối cảnh | Không | Không |

## 10. RISK ANALYSIS
| ID | Rủi ro | Likelihood | Impact | Risk Level | Severity | Cờ tin cậy | Nguồn |
|---|---|---|---|---|---|---|---|
| RK-01 | Tự động duyệt sai điều kiện (biên số tiền, lý do khác Hàng lỗi) làm hoàn tiền không qua người duyệt | HIGH | HIGH | CRITICAL | Critical | SEVERITY_CONFIDENCE_LOW | BR-05, OQ-02 |
| RK-02 | Hoàn số tiền vượt quá số khách đã thanh toán | MEDIUM | HIGH | HIGH | Critical | SEVERITY_CONFIDENCE_LOW | BR-04, FD-02, AF-03 |
| RK-03 | Tính sai thời hạn gửi yêu cầu (giá trị vừa đổi theo CR-07) | HIGH | MEDIUM | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-02, AF-01 |
| RK-04 | Tạo trùng yêu cầu hoặc vượt số lần gửi cho một đơn hàng | MEDIUM | HIGH | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-03, BR-13, AF-02, OQ-03 |
| RK-05 | Yêu cầu đã duyệt nhưng hoàn tiền thất bại mà không có luồng xử lý | MEDIUM | HIGH | HIGH | Major | SEVERITY_CONFIDENCE_LOW | BR-07, BR-10, OQ-04 |
| RK-06 | Phân sai người duyệt theo ngưỡng số tiền | MEDIUM | MEDIUM | MEDIUM | Major | SEVERITY_CONFIDENCE_LOW | BR-06 |
| RK-07 | Chuyển trạng thái sai (huỷ / sửa yêu cầu ngoài trạng thái Chờ duyệt) | MEDIUM | MEDIUM | MEDIUM | Minor | SEVERITY_CONFIDENCE_LOW | BR-09, BR-10, BR-11, BR-12, BR-15 |
