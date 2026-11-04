# Hoàn tiền đơn hàng — Feature Knowledge

> Dữ kiện nghiệp vụ **có nguồn** của một tính năng. Mọi agent đọc file này trước khi chạy.
> Luật đọc/ghi: `qa-system/core/QA_STANDARD.md` §8. Schema bảng: §9.
>
> File được tạo tự động khi intake (hoặc `npm run knowledge:new hoan-tien`) và **bắt đầu trống**.
> Dòng còn `<điền>` hoặc bảng chưa có dòng = chưa khai báo — agent coi như không có, không tự điền giá trị.

Feature slug: `hoan-tien` · Nguồn tài liệu: `INPUT/hoan-tien/` · Cập nhật lần cuối: `2026-11-04` · Trạng thái tổng thể: `DRAFT`

---

## 1. TỔNG QUAN TÍNH NĂNG (FEATURE OVERVIEW)
Khách hàng gửi yêu cầu hoàn tiền cho đơn hàng đã mua trên ShopGo; bộ phận CSKH duyệt hoặc từ chối, một phần yêu cầu được hệ thống tự động duyệt. — Nguồn: 02_ba/srs-hoan-tien-v2.md §1, §3 (R5)

## 2. TÁC NHÂN & PHÂN QUYỀN (ACTORS & ROLES)

| Tác nhân (Actor) | Quyền hạn trong tính năng này | Điều kiện tiên quyết | Nguồn (file §mục) |
|---|---|---|---|
| Khách hàng | Tạo, xem và huỷ yêu cầu hoàn tiền của đơn hàng của chính mình | [CHƯA CÓ TRONG TÀI LIỆU] | 02_ba/srs-hoan-tien-v2.md §2 |
| Nhân viên CSKH | Duyệt hoặc từ chối yêu cầu hoàn tiền (các yêu cầu không thuộc ngưỡng của Trưởng nhóm) | [CHƯA CÓ TRONG TÀI LIỆU] | 02_ba/srs-hoan-tien-v2.md §2, §3 R6 |
| Trưởng nhóm CSKH | Duyệt hoặc từ chối yêu cầu hoàn tiền có giá trị lớn | [CHƯA CÓ TRONG TÀI LIỆU] | 02_ba/srs-hoan-tien-v2.md §2, §3 R6 |
| Hệ thống | Tự động duyệt yêu cầu thoả R5 | [CHƯA CÓ TRONG TÀI LIỆU] | 02_ba/srs-hoan-tien-v2.md §3 R5 |

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN (CONFIRMED BUSINESS RULES)
> Chỉ rule **có nguồn**: tài liệu (kèm trích nguyên văn) hoặc quyết định ở Mục 8 (`knowledge §8 #n`).
> Điều chưa rõ nằm ở Mục 7.

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |
|---|---|---|---|---|---|
| BR-01 | Đơn hàng ở trạng thái Đã giao | Được gửi yêu cầu hoàn tiền; trạng thái khác thì không | 02_ba/srs-hoan-tien-v2.md §3 R1 | Chỉ đơn hàng ở trạng thái Đã giao mới được gửi yêu cầu hoàn tiền. | Confirmed |
| BR-02 | Yêu cầu được gửi trong vòng 10 ngày kể từ ngày giao hàng thành công | Được gửi; quá hạn thì bị từ chối (AF-01). CR-07 (đã phê duyệt, ngày mới hơn) thay giá trị 7 ngày của SRS R2 — áp thứ tự ưu tiên nguồn QA_STANDARD §10.2 (CR thắng spec) | 05_communication/cr-07-thoi-han-hoan-tien-2026-10-20.md §Nội dung thay đổi | thời hạn gửi yêu cầu hoàn tiền tăng từ 7 ngày lên 10 ngày kể từ ngày giao hàng thành công | Confirmed |
| BR-03 | Đơn hàng đã có 1 yêu cầu ở trạng thái Chờ duyệt | Không được có thêm yêu cầu Chờ duyệt thứ hai cùng lúc | 02_ba/srs-hoan-tien-v2.md §3 R3 | Mỗi đơn hàng chỉ có tối đa 1 yêu cầu hoàn tiền ở trạng thái Chờ duyệt tại một thời điểm. | Confirmed |
| BR-04 | Số tiền yêu cầu so với số tiền khách đã thanh toán cho đơn hàng | Số tiền yêu cầu không được vượt quá số tiền đã thanh toán | 02_ba/srs-hoan-tien-v2.md §3 R4 | Số tiền yêu cầu hoàn không được vượt quá số tiền khách đã thanh toán cho đơn hàng. | Confirmed |
| BR-05 | Số tiền từ 500.000đ trở xuống **VÀ** lý do là Hàng lỗi | Hệ thống tự động duyệt | 02_ba/srs-hoan-tien-v2.md §3 R5 | Yêu cầu có số tiền từ 500.000đ trở xuống và lý do là Hàng lỗi được hệ thống tự động duyệt. | Confirmed |
| BR-06 | Số tiền trên 5.000.000đ; các yêu cầu còn lại | Trên 5.000.000đ: Trưởng nhóm CSKH duyệt; còn lại: Nhân viên CSKH duyệt | 02_ba/srs-hoan-tien-v2.md §3 R6 | Yêu cầu có số tiền trên 5.000.000đ phải do Trưởng nhóm CSKH duyệt. Các yêu cầu còn lại do Nhân viên CSKH duyệt. | Confirmed |
| BR-07 | Yêu cầu được duyệt | Tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng | 02_ba/srs-hoan-tien-v2.md §3 R7 | Khi yêu cầu được duyệt, tiền được hoàn về phương thức thanh toán ban đầu của đơn hàng. | Confirmed |
| BR-08 | Người duyệt từ chối yêu cầu | Phải nhập lý do từ chối | 02_ba/srs-hoan-tien-v2.md §3 R8 | Khi từ chối yêu cầu, người duyệt phải nhập lý do từ chối. | Confirmed |
| BR-09 | Yêu cầu vừa được tạo | Trạng thái Chờ duyệt | 02_ba/srs-hoan-tien-v2.md §4 | Yêu cầu mới tạo có trạng thái Chờ duyệt. | Confirmed |
| BR-10 | Người duyệt chấp nhận / từ chối; cổng thanh toán xác nhận hoàn tiền thành công | Chờ duyệt → Đã duyệt; Chờ duyệt → Từ chối; Đã duyệt → Đã hoàn tiền | 02_ba/srs-hoan-tien-v2.md §4 | Chờ duyệt chuyển sang Đã duyệt khi người duyệt chấp nhận; Chờ duyệt chuyển sang Từ chối khi người duyệt từ chối; Đã duyệt chuyển sang Đã hoàn tiền khi cổng thanh toán xác nhận hoàn tiền thành công. | Confirmed |
| BR-11 | Khách hàng huỷ khi yêu cầu còn ở trạng thái Chờ duyệt | Được huỷ; yêu cầu chuyển sang Đã huỷ | 02_ba/srs-hoan-tien-v2.md §4 | Khách hàng được huỷ yêu cầu khi yêu cầu còn ở trạng thái Chờ duyệt. Yêu cầu đã huỷ có trạng thái Đã huỷ. | Confirmed |
| BR-12 | Khách hàng muốn thay đổi yêu cầu đã gửi | Không được sửa; phải huỷ và gửi yêu cầu mới | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #1 | Khách hàng không được sửa yêu cầu hoàn tiền sau khi đã gửi; muốn thay đổi thì huỷ và gửi yêu cầu mới. | Confirmed |
| BR-13 | Số lần gửi yêu cầu của một đơn hàng, tính cả yêu cầu đã bị từ chối hoặc đã huỷ | Tối đa 2 lần | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #2 | Mỗi đơn hàng được gửi yêu cầu hoàn tiền tối đa 2 lần, tính cả yêu cầu đã bị từ chối hoặc đã huỷ. | Confirmed |
| BR-14 | Yêu cầu được duyệt hoặc bị từ chối | Khách hàng nhận email thông báo | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #3 | Khách hàng nhận email thông báo khi yêu cầu được duyệt hoặc bị từ chối. | Confirmed |
| BR-15 | Yêu cầu ở trạng thái Chờ duyệt (màn Chi tiết yêu cầu) | Nút "Huỷ yêu cầu" chỉ hiển thị ở trạng thái này | 04_design/wireframe-man-hinh-hoan-tien.md §Màn hình "Chi tiết yêu cầu hoàn tiền" | Nút "Huỷ yêu cầu" chỉ hiển thị khi yêu cầu ở trạng thái Chờ duyệt. | Confirmed |
| BR-16 | Đơn hàng thanh toán khi nhận hàng (COD) ở trạng thái Đã giao | Ẩn nút Yêu cầu hoàn tiền | knowledge §8 #1 |  | Confirmed |
| BR-17 | Tính thời hạn của BR-02 | Ngày giao hàng thành công là ngày 0; hạn cuối là 23:59 ngày thứ 10, theo giờ Việt Nam (UTC+7) | knowledge §8 #3 |  | Confirmed |
| BR-18 | Đơn hàng đã có yêu cầu được hoàn một phần, gửi yêu cầu thứ hai | Trần của yêu cầu thứ hai bằng số tiền đã thanh toán trừ phần đã hoàn | knowledge §8 #4 |  | Confirmed |
| BR-19 | Yêu cầu từ 500.000đ trở xuống với lý do khác Hàng lỗi | Không tự động duyệt — chỉ lý do Hàng lỗi được tự động duyệt (BR-05) | knowledge §8 #5 |  | Confirmed |
| BR-20 | Nhân viên CSKH xem yêu cầu trên 5.000.000đ | Thấy trong danh sách nhưng không có nút Duyệt và Từ chối | knowledge §8 #6 |  | Confirmed |
| BR-21 | Trưởng nhóm CSKH với yêu cầu bất kỳ | Được duyệt và từ chối mọi yêu cầu | knowledge §8 #7 |  | Confirmed |
| BR-22 | Yêu cầu bị từ chối | Email từ chối có kèm lý do từ chối (chưa có mẫu email — chỉ kiểm có gửi email) | knowledge §8 #10 |  | Confirmed |
| BR-23 | Số tiền đã thanh toán (paidAmount) dùng làm trần ở BR-04 | Gồm phí vận chuyển và đã trừ giảm giá voucher | knowledge §8 #14 |  | Confirmed |
| BR-24 | Lý do là Hàng lỗi **VÀ** không đính kèm ảnh minh chứng | Không gửi được; dùng thông báo của trường bắt buộc (R9 được chấp nhận) | knowledge §8 #15 |  | Confirmed |
| BR-25 | Khách hàng gửi yêu cầu thành công | Hiển thị thông báo "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." | 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Gửi thành công: "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." | Confirmed |

### 3b. FIELD & RÀNG BUỘC

| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|---|---|
| FD-01 | Lý do (reason) | Danh sách chọn (enum) | Có | Một trong: Hàng lỗi (DEFECTIVE) · Giao sai hàng (WRONG_ITEM) · Không còn nhu cầu (NO_LONGER_NEEDED) | Vui lòng nhập thông tin này. | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Ánh xạ lý do trên giao diện: DEFECTIVE = Hàng lỗi · WRONG_ITEM = Giao sai hàng · NO_LONGER_NEEDED = Không còn nhu cầu. |
| FD-02 | Số tiền yêu cầu (amount) | Số nguyên (VND) | Có | Tối thiểu 10.000; tối đa = số tiền đã thanh toán của đơn hàng (paidAmount) | Vui lòng nhập thông tin này. | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | Tối thiểu 10.000, không vượt quá paidAmount của đơn hàng |
| FD-03 | Mô tả (description) | Văn bản (string) | Không | Tối đa 500 ký tự | Mô tả tối đa 500 ký tự. | 03_dev/api-refund-request-spec.md §Request body; 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md (knowledge §8 #13) | Tối đa 500 ký tự |
| FD-04 | Ảnh minh chứng (images) | Tệp ảnh (array of file) | Không — bắt buộc khi lý do là Hàng lỗi (BR-24) | Tối đa 3 tệp; mỗi tệp tối đa 5 MB; định dạng JPG hoặc PNG | Chỉ chấp nhận ảnh JPG hoặc PNG. | 03_dev/api-refund-request-spec.md §Request body; 05_communication/qa-ba-tra-loi-hoan-tien-2026-11-04.md (knowledge §8 #13) | Tối đa 3 tệp; mỗi tệp tối đa 5 MB; định dạng JPG hoặc PNG |
| FD-05 | Lý do từ chối (người duyệt nhập) | Văn bản | Có | Tối đa 255 ký tự; chuỗi chỉ có khoảng trắng bị chặn | Vui lòng nhập lý do từ chối. | knowledge §8 #9 |  |

## 4. LUỒNG CHÍNH (HAPPY PATH)
1. Khách hàng mở chi tiết đơn hàng ở trạng thái Đã giao và chọn Yêu cầu hoàn tiền. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 1
2. Khách hàng chọn lý do, nhập số tiền yêu cầu, mô tả và đính kèm ảnh minh chứng (nếu có). — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 2
3. Khách hàng nhấn Gửi yêu cầu. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 3
4. Hệ thống kiểm tra các quy tắc R1 đến R4 và tạo yêu cầu ở trạng thái Chờ duyệt. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 4
5. Hệ thống hiển thị "Đã gửi yêu cầu hoàn tiền. Chúng tôi sẽ phản hồi trong 2 ngày làm việc." — Nguồn: 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo
6. Hệ thống áp dụng R5 hoặc chuyển yêu cầu cho người duyệt theo R6. — Nguồn: 02_ba/srs-hoan-tien-v2.md §6 Bước 5

## 5. LUỒNG PHỤ & LỖI (ALTERNATE & ERROR FLOWS)

| ID | Tình huống | Hệ thống phản hồi (nguyên văn nếu có) | Nguồn (file §mục) | Trích nguyên văn |
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

## 6. NGOÀI PHẠM VI (OUT OF SCOPE)
> Chỉ những gì nguồn **nói rõ** là không làm, kèm trích nguồn. Điều tài liệu không nhắc tới là câu hỏi (Mục 7), không phải ngoài phạm vi.

| Nội dung loại trừ | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|
| Hoàn tiền cho đơn hàng thanh toán khi nhận hàng (COD) | 02_ba/srs-hoan-tien-v2.md §1 | Hoàn tiền cho đơn hàng thanh toán khi nhận hàng (COD) không thuộc phạm vi phiên bản này. |
| Đổi sang sản phẩm khác | 02_ba/srs-hoan-tien-v2.md §1 | Đổi sang sản phẩm khác không thuộc phạm vi tài liệu này. |

## 7. CÂU HỎI MỞ & KẼ HỞ 06W (OPEN QUESTIONS & MISSING RULES)
> Skill `02` thêm dòng (`New`). Cột `Phản hồi chính thức`, `Người trả lời`, `Ngày`, `Trạng thái` do **con người** điền
> (hoặc agent chép nguyên văn khi người dùng chuyển lời BA). Trạng thái: `New` → `TREO` → `Confirmed` / `Rejected` (§9.3).
> Mã `MR-xx` cấp tiếp số lớn nhất đang có — không đánh lại từ 01.

| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-01 | Đơn COD ở trạng thái Đã giao thoả R1; nguồn không nói chức năng bị ẩn hay bị chặn | W3 | BR-01 × W3 | A) Ẩn nút Yêu cầu hoàn tiền với đơn COD · B) Hiện nút, chặn khi gửi với thông báo (ghi rõ) | Với đơn COD ở trạng thái Đã giao, nút Yêu cầu hoàn tiền bị ẩn hay bị chặn khi gửi (A/B)? | A) Ẩn nút Yêu cầu hoàn tiền với đơn COD. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-02 | Gọi API với orderId không thuộc tài khoản: mã HTTP và mã lỗi không có trong 03_dev/api-refund-request-spec.md §Phản hồi | W5 | BR-01 × W5 | A) HTTP 403 kèm mã lỗi riêng (ghi rõ) · B) HTTP 404 như đơn không tồn tại | Khi tài khoản gửi yêu cầu cho orderId không thuộc về mình, API trả mã HTTP và mã lỗi nào (A/B)? | B) HTTP 404 với mã lỗi ORDER_NOT_FOUND, giống đơn hàng không tồn tại. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-03 | Không rõ ngày giao là ngày 0 hay ngày 1, hạn cuối là cuối ngày hay theo giờ, theo múi giờ nào | W3 | BR-02 × W3, BR-02 × W4 | A) Ngày giao là ngày 0, hạn cuối 23:59 ngày thứ 10 theo giờ Việt Nam · B) Tính đúng 240 giờ từ thời điểm giao | Hạn gửi yêu cầu được tính theo cách nào (A/B), và theo múi giờ nào? | A) Ngày giao hàng thành công là ngày 0; hạn cuối là 23:59 ngày thứ 10, theo giờ Việt Nam (UTC+7). | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-04 | Yêu cầu thứ nhất đã được hoàn một phần; nguồn không nói trần của yêu cầu thứ hai | W3 | BR-04 × W3 | A) Trần = số đã thanh toán trừ phần đã hoàn · B) Trần = số đã thanh toán | Nếu yêu cầu thứ nhất đã được hoàn một phần, trần số tiền của yêu cầu thứ hai là A hay B? | A) Trần của yêu cầu thứ hai bằng số tiền đã thanh toán trừ phần đã hoàn. | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-05 | R5 chỉ nêu lý do Hàng lỗi; PO hỏi lý do Giao sai hàng chưa có câu trả lời | W3 | BR-05 × W3 | A) Giao sai hàng cũng được tự động duyệt theo cùng ngưỡng · B) Chỉ Hàng lỗi | Yêu cầu từ 500.000đ trở xuống với lý do Giao sai hàng có được tự động duyệt như Hàng lỗi không (A/B)? | B) Chỉ lý do Hàng lỗi được tự động duyệt. | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-06 | Không rõ Nhân viên CSKH có thấy và thao tác được yêu cầu trên 5.000.000đ không | W2 | BR-06 × W2 | A) Không thấy trong danh sách · B) Thấy nhưng không có nút duyệt/từ chối | Nhân viên CSKH thấy yêu cầu trên 5.000.000đ theo cách nào (A/B)? | B) Nhân viên CSKH thấy yêu cầu trên 5.000.000đ trong danh sách nhưng không có nút Duyệt và Từ chối. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-07 | Thời gian tối đa CSKH xử lý một yêu cầu chưa chốt; không rõ hệ thống có hành động khi quá hạn | W4 | BR-06 × W4 | A) Không có hành động tự động · B) Nhắc người duyệt sau N ngày làm việc (ghi N) | Yêu cầu ở Chờ duyệt quá bao nhiêu ngày làm việc thì hệ thống có hành động tự động, và hành động đó là gì (A/B)? | Không xử lý trong phiên bản này: không có hành động tự động khi yêu cầu Chờ duyệt quá hạn; CSKH theo dõi thủ công trên danh sách. | Nguyễn Minh Đức | 2026-11-04 | Rejected |
| MR-08 | Phân quyền của Trưởng nhóm với yêu cầu từ 5.000.000đ trở xuống chưa rõ | W5 | BR-06 × W5 | A) Có · B) Không | Trưởng nhóm CSKH có được duyệt/từ chối yêu cầu từ 5.000.000đ trở xuống không (A/B)? | A) Có, Trưởng nhóm CSKH được duyệt và từ chối mọi yêu cầu. | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-09 | Nguồn không mô tả trạng thái và xử lý khi cổng thanh toán không hoàn được tiền | W6 | BR-07 × W2, BR-07 × W6, BR-10 × W6 | A) Giữ Đã duyệt, CSKH thử lại thủ công · B) Thêm trạng thái mới cho hoàn tiền thất bại (ghi tên) | Khi hoàn tiền qua cổng thanh toán thất bại, yêu cầu ở trạng thái nào và ai xử lý tiếp (A/B)? | A) Giữ trạng thái Đã duyệt; CSKH thử lại hoàn tiền thủ công. | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-10 | Không có min/max, xử lý chuỗi toàn khoảng trắng, chữ thông báo khi bỏ trống | W1 | BR-08 × W1 | A) Dùng thông báo của trường bắt buộc, tối đa như Mô tả · B) Ràng buộc riêng (ghi rõ) | Ô lý do từ chối có độ dài tối đa bao nhiêu ký tự, chuỗi chỉ có khoảng trắng có bị chặn không, và thông báo khi bỏ trống là gì? | Lý do từ chối tối đa 255 ký tự; chuỗi chỉ có khoảng trắng bị chặn; thông báo khi bỏ trống: "Vui lòng nhập lý do từ chối." | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-11 | Không có mẫu email; không rõ khách có thấy lý do từ chối không | W3 | BR-08 × W5, BR-14 × W3 | A) Có mẫu email — BA gửi kèm · B) Chưa có mẫu — chỉ kiểm có gửi email | Email duyệt/từ chối đã có mẫu nội dung chưa, và có kèm lý do từ chối không (A/B)? | B) Chưa có mẫu email; QA chỉ kiểm có gửi email. Email từ chối có kèm lý do từ chối. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-12 | Khách huỷ trong khi người duyệt đang duyệt (hoặc hộp xác nhận huỷ mở khi yêu cầu vừa được duyệt) | W4 | BR-10 × W4, BR-11 × W4, AF-07 × W2 | A) Thao tác đến trước thắng, bên sau nhận thông báo trạng thái đã thay đổi (ghi chữ) · B) Khác (ghi rõ) | Khi khách huỷ và người duyệt duyệt cùng một yêu cầu gần như đồng thời, thao tác nào được ghi nhận và bên còn lại thấy thông báo gì? | A) Thao tác đến trước được ghi nhận; bên sau thấy thông báo "Yêu cầu đã được cập nhật bởi người khác. Vui lòng tải lại trang." | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-13 | BR-13 giới hạn 2 lần nhưng không nêu hệ thống phản hồi gì; dòng mã lỗi duy nhất liên quan đang bị ẩn | W6 | BR-13 × W6 | A) Dùng mã REFUND_LIMIT_REACHED và chữ của dòng đang ẩn · B) Dùng mã/chữ khác (ghi rõ) | Khi đơn hàng đã gửi đủ 2 lần, hệ thống có trả mã REFUND_LIMIT_REACHED với thông báo "Đơn hàng đã hết số lần yêu cầu hoàn tiền." (dòng đang ẩn) không (A/B)? | A) Dùng mã REFUND_LIMIT_REACHED với thông báo "Đơn hàng đã hết số lần yêu cầu hoàn tiền."; dòng này sẽ được hiện lại trong bảng mã lỗi. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-14 | Không có chữ thông báo cho: số tiền dưới 10.000, mô tả quá 500 ký tự, quá 3 ảnh, ảnh quá 5 MB, ảnh không phải JPG/PNG, lý do không hợp lệ | W1 | FD-01 × W1, FD-02 × W1, FD-03 × W1, FD-04 × W1, AF-06 × W6 | BA cung cấp bảng chữ thông báo theo từng lỗi | Chữ thông báo hiển thị cho từng lỗi ràng buộc (số tiền dưới 10.000, mô tả quá 500 ký tự, quá 3 ảnh, ảnh quá 5 MB, ảnh sai định dạng, lý do không hợp lệ) là gì? | Số tiền dưới 10.000: "Số tiền yêu cầu tối thiểu là 10.000đ." · Mô tả quá 500 ký tự: "Mô tả tối đa 500 ký tự." · Quá 3 ảnh: "Chỉ được đính kèm tối đa 3 ảnh." · Ảnh quá 5 MB: "Mỗi ảnh tối đa 5 MB." · Ảnh sai định dạng: "Chỉ chấp nhận ảnh JPG hoặc PNG." · Lý do không hợp lệ chỉ xảy ra khi gọi API: HTTP 400 VALIDATION_ERROR, không có chữ hiển thị. | Trần Thị Lan | 2026-11-04 | Confirmed |
| MR-15 | Không rõ paidAmount gồm phí vận chuyển và đã trừ giảm giá voucher hay chưa | W3 | FD-02 × W3 | A) Gồm phí vận chuyển, đã trừ voucher · B) Không gồm phí vận chuyển, đã trừ voucher | paidAmount (trần số tiền được hoàn) có gồm phí vận chuyển không, và đã trừ giảm giá voucher chưa (A/B)? | A) paidAmount gồm phí vận chuyển và đã trừ giảm giá voucher. | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-16 | R9 đang là tracked change chưa duyệt; nguồn hiện hành ghi Ảnh minh chứng "Không" bắt buộc | W3 | FD-04 × W3 | A) Chấp nhận R9, thiếu ảnh dùng thông báo của trường bắt buộc · B) Bỏ R9, ảnh luôn không bắt buộc | Tracked change R9 "Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi." có được chấp nhận không (A/B)? | A) Chấp nhận R9; thiếu ảnh khi lý do là Hàng lỗi dùng thông báo "Vui lòng nhập thông tin này." | Nguyễn Minh Đức | 2026-11-04 | Confirmed |
| MR-17 | Gọi thẳng API tạo yêu cầu cho đơn COD ở trạng thái Đã giao — phản hồi không có trong nguồn | W2 | BR-16 × W2 | A) Chặn: HTTP 403 với mã lỗi riêng (ghi mã) · B) Chặn: dùng ORDER_NOT_DELIVERED | Khi gọi API tạo yêu cầu hoàn tiền cho đơn COD ở trạng thái Đã giao, API trả mã HTTP và mã lỗi nào (A/B)? | B) API chặn đơn COD bằng HTTP 403 với mã lỗi ORDER_NOT_DELIVERED. | Trần Thị Lan | 2026-11-04 | Confirmed |

## 8. QUYẾT ĐỊNH ĐÃ CHỐT (CONFIRMED DECISIONS LOG)
> Chỉ ghi khi BA/PO đã quyết. Thiếu `Người phê duyệt` hoặc `Ngày chốt` thì tool coi là chưa chốt.
> Lần chạy sau agent áp dụng luôn, không hỏi lại.

| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
| 1 | MR-01 | Với đơn COD ở trạng thái Đã giao, nút Yêu cầu hoàn tiền bị ẩn hay bị chặn khi gửi (A/B)? | A) Ẩn nút Yêu cầu hoàn tiền với đơn COD. | Trần Thị Lan | 2026-11-04 |
| 2 | MR-02 | Khi tài khoản gửi yêu cầu cho orderId không thuộc về mình, API trả mã HTTP và mã lỗi nào (A/B)? | B) HTTP 404 với mã lỗi ORDER_NOT_FOUND, giống đơn hàng không tồn tại. | Trần Thị Lan | 2026-11-04 |
| 3 | MR-03 | Hạn gửi yêu cầu được tính theo cách nào (A/B), và theo múi giờ nào? | A) Ngày giao hàng thành công là ngày 0; hạn cuối là 23:59 ngày thứ 10, theo giờ Việt Nam (UTC+7). | Nguyễn Minh Đức | 2026-11-04 |
| 4 | MR-04 | Nếu yêu cầu thứ nhất đã được hoàn một phần, trần số tiền của yêu cầu thứ hai là A hay B? | A) Trần của yêu cầu thứ hai bằng số tiền đã thanh toán trừ phần đã hoàn. | Nguyễn Minh Đức | 2026-11-04 |
| 5 | MR-05 | Yêu cầu từ 500.000đ trở xuống với lý do Giao sai hàng có được tự động duyệt như Hàng lỗi không (A/B)? | B) Chỉ lý do Hàng lỗi được tự động duyệt. | Nguyễn Minh Đức | 2026-11-04 |
| 6 | MR-06 | Nhân viên CSKH thấy yêu cầu trên 5.000.000đ theo cách nào (A/B)? | B) Nhân viên CSKH thấy yêu cầu trên 5.000.000đ trong danh sách nhưng không có nút Duyệt và Từ chối. | Trần Thị Lan | 2026-11-04 |
| 7 | MR-08 | Trưởng nhóm CSKH có được duyệt/từ chối yêu cầu từ 5.000.000đ trở xuống không (A/B)? | A) Có, Trưởng nhóm CSKH được duyệt và từ chối mọi yêu cầu. | Nguyễn Minh Đức | 2026-11-04 |
| 8 | MR-09 | Khi hoàn tiền qua cổng thanh toán thất bại, yêu cầu ở trạng thái nào và ai xử lý tiếp (A/B)? | A) Giữ trạng thái Đã duyệt; CSKH thử lại hoàn tiền thủ công. | Nguyễn Minh Đức | 2026-11-04 |
| 9 | MR-10 | Ô lý do từ chối có độ dài tối đa bao nhiêu ký tự, chuỗi chỉ có khoảng trắng có bị chặn không, và thông báo khi bỏ trống là gì? | Lý do từ chối tối đa 255 ký tự; chuỗi chỉ có khoảng trắng bị chặn; thông báo khi bỏ trống: "Vui lòng nhập lý do từ chối." | Trần Thị Lan | 2026-11-04 |
| 10 | MR-11 | Email duyệt/từ chối đã có mẫu nội dung chưa, và có kèm lý do từ chối không (A/B)? | B) Chưa có mẫu email; QA chỉ kiểm có gửi email. Email từ chối có kèm lý do từ chối. | Trần Thị Lan | 2026-11-04 |
| 11 | MR-12 | Khi khách huỷ và người duyệt duyệt cùng một yêu cầu gần như đồng thời, thao tác nào được ghi nhận và bên còn lại thấy thông báo gì? | A) Thao tác đến trước được ghi nhận; bên sau thấy thông báo "Yêu cầu đã được cập nhật bởi người khác. Vui lòng tải lại trang." | Trần Thị Lan | 2026-11-04 |
| 12 | MR-13 | Khi đơn hàng đã gửi đủ 2 lần, hệ thống có trả mã REFUND_LIMIT_REACHED với thông báo "Đơn hàng đã hết số lần yêu cầu hoàn tiền." (dòng đang ẩn) không (A/B)? | A) Dùng mã REFUND_LIMIT_REACHED với thông báo "Đơn hàng đã hết số lần yêu cầu hoàn tiền."; dòng này sẽ được hiện lại trong bảng mã lỗi. | Trần Thị Lan | 2026-11-04 |
| 13 | MR-14 | Chữ thông báo hiển thị cho từng lỗi ràng buộc (số tiền dưới 10.000, mô tả quá 500 ký tự, quá 3 ảnh, ảnh quá 5 MB, ảnh sai định dạng, lý do không hợp lệ) là gì? | Số tiền dưới 10.000: "Số tiền yêu cầu tối thiểu là 10.000đ." · Mô tả quá 500 ký tự: "Mô tả tối đa 500 ký tự." · Quá 3 ảnh: "Chỉ được đính kèm tối đa 3 ảnh." · Ảnh quá 5 MB: "Mỗi ảnh tối đa 5 MB." · Ảnh sai định dạng: "Chỉ chấp nhận ảnh JPG hoặc PNG." · Lý do không hợp lệ chỉ xảy ra khi gọi API: HTTP 400 VALIDATION_ERROR, không có chữ hiển thị. | Trần Thị Lan | 2026-11-04 |
| 14 | MR-15 | paidAmount (trần số tiền được hoàn) có gồm phí vận chuyển không, và đã trừ giảm giá voucher chưa (A/B)? | A) paidAmount gồm phí vận chuyển và đã trừ giảm giá voucher. | Nguyễn Minh Đức | 2026-11-04 |
| 15 | MR-16 | Tracked change R9 "Ảnh minh chứng là bắt buộc khi lý do là Hàng lỗi." có được chấp nhận không (A/B)? | A) Chấp nhận R9; thiếu ảnh khi lý do là Hàng lỗi dùng thông báo "Vui lòng nhập thông tin này." | Nguyễn Minh Đức | 2026-11-04 |
| 16 | MR-07 | Yêu cầu ở Chờ duyệt quá bao nhiêu ngày làm việc thì hệ thống có hành động tự động, và hành động đó là gì (A/B)? | Không xử lý trong phiên bản này: không có hành động tự động khi yêu cầu Chờ duyệt quá hạn; CSKH theo dõi thủ công trên danh sách. | Nguyễn Minh Đức | 2026-11-04 |
| 17 | MR-17 | Khi gọi API tạo yêu cầu hoàn tiền cho đơn COD ở trạng thái Đã giao, API trả mã HTTP và mã lỗi nào (A/B)? | B) API chặn đơn COD bằng HTTP 403 với mã lỗi ORDER_NOT_DELIVERED. | Trần Thị Lan | 2026-11-04 |

## 9. HẰNG SỐ NGHIỆP VỤ (DOMAIN CONSTANTS)
> Chỉ hằng số có trong nguồn. Dùng cho chuỗi biên và sinh dữ liệu test.

| Hằng số | Kiểu dữ liệu | Giá trị | Phạm vi ảnh hưởng | Nguồn (file §mục) |
|---|---|---|---|---|
| Thời hạn gửi yêu cầu | Số ngày | 10 ngày kể từ ngày giao hàng thành công | BR-02, AF-01 | 05_communication/cr-07-thoi-han-hoan-tien-2026-10-20.md §Nội dung thay đổi |
| Số yêu cầu Chờ duyệt tối đa mỗi đơn | Số nguyên | 1 | BR-03, AF-02 | 02_ba/srs-hoan-tien-v2.md §3 R3 |
| Ngưỡng tự động duyệt (lý do Hàng lỗi) | Tiền (VND) | 500.000đ trở xuống | BR-05 | 02_ba/srs-hoan-tien-v2.md §3 R5 |
| Ngưỡng Trưởng nhóm CSKH duyệt | Tiền (VND) | trên 5.000.000đ | BR-06 | 02_ba/srs-hoan-tien-v2.md §3 R6 |
| Số lần gửi yêu cầu tối đa mỗi đơn | Số nguyên | 2 lần (tính cả bị từ chối / đã huỷ) | BR-13 | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #2 |
| Số tiền yêu cầu tối thiểu | Tiền (VND) | 10.000 | FD-02 | 03_dev/api-refund-request-spec.md §Request body |
| Số tiền yêu cầu tối đa | Tiền (VND) | số tiền đã thanh toán của đơn hàng (paidAmount) | FD-02, BR-04 | 03_dev/api-refund-request-spec.md §Request body |
| Độ dài Mô tả tối đa | Số ký tự | 500 ký tự | FD-03 | 03_dev/api-refund-request-spec.md §Request body |
| Số ảnh minh chứng tối đa | Số tệp | 3 tệp | FD-04 | 03_dev/api-refund-request-spec.md §Request body |
| Dung lượng mỗi ảnh tối đa | Dung lượng | 5 MB | FD-04 | 03_dev/api-refund-request-spec.md §Request body |
| Định dạng ảnh | Định dạng | JPG hoặc PNG | FD-04 | 03_dev/api-refund-request-spec.md §Request body |
| Hạn cuối gửi yêu cầu | Thời điểm | 23:59 ngày thứ 10 (ngày giao = ngày 0), giờ Việt Nam UTC+7 | BR-02, BR-17 | knowledge §8 #3 |
| Độ dài lý do từ chối tối đa | Số ký tự | 255 ký tự | FD-05 | knowledge §8 #9 |
| Mã lỗi đơn của người khác | Mã phản hồi | HTTP 404 · ORDER_NOT_FOUND | AF-08 | knowledge §8 #2 |
| Mã lỗi đơn COD qua API | Mã phản hồi | HTTP 403 · ORDER_NOT_DELIVERED | AF-15 | knowledge §8 #17 |

## 10. MA TRẬN TRUY VẾT (TRACEABILITY MATRIX)

| Mã | Nguồn (file §mục) | Test Case IDs liên quan | Ghi chú |
|---|---|---|---|
| BR-01 | 02_ba/srs-hoan-tien-v2.md §3 R1 | REFUND-001, REFUND-002 | |
| BR-02 | 05_communication/cr-07-thoi-han-hoan-tien-2026-10-20.md §Nội dung thay đổi | REFUND-003, REFUND-004 | |
| BR-03 | 02_ba/srs-hoan-tien-v2.md §3 R3 | REFUND-005 | |
| BR-04 | 02_ba/srs-hoan-tien-v2.md §3 R4 | REFUND-006 | |
| BR-05 | 02_ba/srs-hoan-tien-v2.md §3 R5 | REFUND-026, REFUND-027 | |
| BR-06 | 02_ba/srs-hoan-tien-v2.md §3 R6 | REFUND-029, REFUND-030 | |
| BR-07 | 02_ba/srs-hoan-tien-v2.md §3 R7 | REFUND-033 | |
| BR-08 | 02_ba/srs-hoan-tien-v2.md §3 R8 | REFUND-035 | |
| BR-09 | 02_ba/srs-hoan-tien-v2.md §4 | REFUND-001 | |
| BR-10 | 02_ba/srs-hoan-tien-v2.md §4 | REFUND-033, REFUND-035 | |
| BR-11 | 02_ba/srs-hoan-tien-v2.md §4 | REFUND-043 | |
| BR-12 | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #1 | REFUND-046 | |
| BR-13 | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #2 | REFUND-047, REFUND-048 | |
| BR-14 | 05_communication/bien-ban-hop-hoan-tien-2026-10-15.md §Nội dung đã thống nhất #3 | REFUND-041, REFUND-042 | |
| BR-15 | 04_design/wireframe-man-hinh-hoan-tien.md §Màn hình "Chi tiết yêu cầu hoàn tiền" | REFUND-044 | |
| FD-01 | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | REFUND-013, REFUND-015 | |
| FD-02 | 03_dev/api-refund-request-spec.md §Request body; 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | REFUND-010, REFUND-011, REFUND-012, REFUND-014 | |
| FD-03 | 03_dev/api-refund-request-spec.md §Request body | REFUND-016, REFUND-017, REFUND-018 | |
| FD-04 | 03_dev/api-refund-request-spec.md §Request body | REFUND-019, REFUND-020, REFUND-021, REFUND-022, REFUND-023, REFUND-024 | |
| AF-01 | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | REFUND-004 | |
| AF-02 | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | REFUND-005 | |
| AF-03 | 02_ba/srs-hoan-tien-v2.md §7; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | REFUND-006 | |
| AF-04 | 03_dev/api-refund-request-spec.md §Phản hồi; 03_dev/api-ma-loi-hoan-tien.md §Sheet Thong bao loi | REFUND-002 | |
| AF-05 | 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | REFUND-013, REFUND-014 | |
| AF-06 | 03_dev/api-refund-request-spec.md §Phản hồi | REFUND-015 | |
| AF-07 | 04_design/wireframe-man-hinh-hoan-tien.md §Màn hình "Chi tiết yêu cầu hoàn tiền" | REFUND-043 | |
| BR-16 | knowledge §8 | REFUND-050 | Lần chạy 2 |
| BR-17 | knowledge §8 | REFUND-003, REFUND-004 | Lần chạy 2 |
| BR-18 | knowledge §8 | REFUND-008, REFUND-009 | Lần chạy 2 |
| BR-19 | knowledge §8 | REFUND-028 | Lần chạy 2 |
| BR-20 | knowledge §8 | REFUND-031 | Lần chạy 2 |
| BR-21 | knowledge §8 | REFUND-032 | Lần chạy 2 |
| BR-22 | knowledge §8 | REFUND-042 | Lần chạy 2 |
| BR-23 | knowledge §8 | REFUND-007 | Lần chạy 2 |
| BR-24 | knowledge §8 | REFUND-025 | Lần chạy 2 |
| BR-25 | 04_design/wireframe-man-hinh-hoan-tien.md §Thông báo | REFUND-001 | Lần chạy 2 |
| FD-05 | knowledge §8 | REFUND-036, REFUND-037, REFUND-038, REFUND-039, REFUND-040 | Lần chạy 2 |
| AF-08 | knowledge §8 | REFUND-049 | Lần chạy 2 |
| AF-09 | knowledge §8 | REFUND-034 | Lần chạy 2 |
| AF-10 | knowledge §8 | REFUND-045 | Lần chạy 2 |
| AF-11 | knowledge §8 | REFUND-048 | Lần chạy 2 |
| AF-12 | knowledge §8 | REFUND-010 | Lần chạy 2 |
| AF-13 | knowledge §8 | REFUND-021 | Lần chạy 2 |
| AF-14 | knowledge §8 | REFUND-023 | Lần chạy 2 |
| AF-15 | knowledge §8 | REFUND-051 | Lần chạy 2 |
