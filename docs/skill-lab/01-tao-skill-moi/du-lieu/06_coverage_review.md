# Coverage Review · hoan-tien
Owner: qa-system/qa-test-design/skills/coverage-review.md · Nguồn: 01–05, knowledge/features/hoan-tien.md · Verdict: PASS

> Ma trận dựng bằng script từ tag `Rule#` / `TI#` của 51 test case trong `05_test_case_spec.md` — không đếm bằng mắt.

## 1. KẾT QUẢ LINT
```
───────────────────────────────────────────────────────────────────
  DELIVERABLE LINT · task [ hoan-tien ]   ·   51 test case(s)
───────────────────────────────────────────────────────────────────
  Clean — test cases, meta lines, 01 quotes, 06W matrix and table cells all pass.
───────────────────────────────────────────────────────────────────
```

## 2. MA TRẬN ĐỘ PHỦ
| Mã | Loại | Mô tả | Test Case IDs cover | Gap & Đề xuất |
|---|---|---|---|---|
| BR-01 | BR | Đơn hàng ở trạng thái Đã giao | REFUND-001, REFUND-002 | Đạt |
| BR-02 | BR | Yêu cầu được gửi trong vòng 10 ngày kể từ ngày giao hàng thành công | REFUND-003, REFUND-004 | Đạt |
| BR-03 | BR | Đơn hàng đã có 1 yêu cầu ở trạng thái Chờ duyệt | REFUND-005 | Đạt |
| BR-04 | BR | Số tiền yêu cầu so với số tiền khách đã thanh toán cho đơn hàng | REFUND-006 | Đạt |
| BR-05 | BR | Số tiền từ 500.000đ trở xuống VÀ lý do là Hàng lỗi | REFUND-026, REFUND-027 | Đạt |
| BR-06 | BR | Số tiền trên 5.000.000đ; các yêu cầu còn lại | REFUND-029, REFUND-030 | Đạt |
| BR-07 | BR | Yêu cầu được duyệt | REFUND-033 | Đạt |
| BR-08 | BR | Người duyệt từ chối yêu cầu | REFUND-035 | Đạt |
| BR-09 | BR | Yêu cầu vừa được tạo | REFUND-001 | Đạt |
| BR-10 | BR | Người duyệt chấp nhận / từ chối; cổng thanh toán xác nhận hoàn tiền th | REFUND-033, REFUND-035 | Đạt |
| BR-11 | BR | Khách hàng huỷ khi yêu cầu còn ở trạng thái Chờ duyệt | REFUND-043 | Đạt |
| BR-12 | BR | Khách hàng muốn thay đổi yêu cầu đã gửi | REFUND-046 | Đạt |
| BR-13 | BR | Số lần gửi yêu cầu của một đơn hàng, tính cả yêu cầu đã bị từ chối hoặ | REFUND-047, REFUND-048 | Đạt |
| BR-14 | BR | Yêu cầu được duyệt hoặc bị từ chối | REFUND-041, REFUND-042 | Đạt |
| BR-15 | BR | Yêu cầu ở trạng thái Chờ duyệt (màn Chi tiết yêu cầu) | REFUND-044 | Đạt |
| BR-16 | BR | Đơn hàng thanh toán khi nhận hàng (COD) ở trạng thái Đã giao | REFUND-050 | Đạt |
| BR-17 | BR | Tính thời hạn của BR-02 | REFUND-003, REFUND-004 | Đạt |
| BR-18 | BR | Đơn hàng đã có yêu cầu được hoàn một phần, gửi yêu cầu thứ hai | REFUND-008, REFUND-009 | Đạt |
| BR-19 | BR | Yêu cầu từ 500.000đ trở xuống với lý do khác Hàng lỗi | REFUND-028 | Đạt |
| BR-20 | BR | Nhân viên CSKH xem yêu cầu trên 5.000.000đ | REFUND-031 | Đạt |
| BR-21 | BR | Trưởng nhóm CSKH với yêu cầu bất kỳ | REFUND-032 | Đạt |
| BR-22 | BR | Yêu cầu bị từ chối | REFUND-042 | Đạt |
| BR-23 | BR | Số tiền đã thanh toán (paidAmount) dùng làm trần ở BR-04 | REFUND-007 | Đạt |
| BR-24 | BR | Lý do là Hàng lỗi VÀ không đính kèm ảnh minh chứng | REFUND-025 | Đạt |
| BR-25 | BR | Khách hàng gửi yêu cầu thành công | REFUND-001 | Đạt |
| FD-01 | FD | Lý do (reason) | REFUND-013, REFUND-015 | Đạt |
| FD-02 | FD | Số tiền yêu cầu (amount) | REFUND-010, REFUND-011, REFUND-012, REFUND-014 | Đạt |
| FD-03 | FD | Mô tả (description) | REFUND-016, REFUND-017, REFUND-018 | Đạt |
| FD-04 | FD | Ảnh minh chứng (images) | REFUND-019, REFUND-020, REFUND-021, REFUND-022, REFUND-023, REFUND-024 | Đạt |
| FD-05 | FD | Lý do từ chối (người duyệt nhập) | REFUND-036, REFUND-037, REFUND-038, REFUND-039, REFUND-040 | Đạt |
| AF-01 | AF | Đơn hàng quá thời hạn gửi yêu cầu (BR-02) — mã REFUND_WINDOW_EXPIRED | REFUND-004 | Đạt |
| AF-02 | AF | Đơn hàng đã có yêu cầu Chờ duyệt (BR-03) — mã REFUND_ALREADY_PENDING | REFUND-005 | Đạt |
| AF-03 | AF | Số tiền yêu cầu vượt quá số tiền đã thanh toán (BR-04) — mã REFUND_AMO | REFUND-006 | Đạt |
| AF-04 | AF | Đơn hàng chưa ở trạng thái Đã giao (BR-01) — mã ORDER_NOT_DELIVERED | REFUND-002 | Đạt |
| AF-05 | AF | Thiếu trường bắt buộc khi gửi | REFUND-013, REFUND-014 | Đạt |
| AF-06 | AF | Lý do không hợp lệ, chỉ xảy ra khi gọi API — mã VALIDATION_ERROR | REFUND-015 | Đạt |
| AF-07 | AF | Khách hàng bấm "Huỷ yêu cầu" ở màn Chi tiết | REFUND-043 | Đạt |
| AF-08 | AF | Tài khoản gửi yêu cầu cho orderId không thuộc về mình | REFUND-049 | Đạt |
| AF-09 | AF | Hoàn tiền qua cổng thanh toán thất bại | REFUND-034 | Đạt |
| AF-10 | AF | Khách huỷ và người duyệt duyệt cùng một yêu cầu gần như đồng thời | REFUND-045 | Đạt |
| AF-11 | AF | Đơn hàng đã gửi đủ 2 lần (BR-13) — mã REFUND_LIMIT_REACHED | REFUND-048 | Đạt |
| AF-12 | AF | Số tiền yêu cầu dưới 10.000 (FD-02) | REFUND-010 | Đạt |
| AF-13 | AF | Đính kèm quá 3 ảnh (FD-04) | REFUND-021 | Đạt |
| AF-14 | AF | Ảnh vượt quá 5 MB (FD-04) | REFUND-023 | Đạt |
| AF-15 | AF | Gọi API tạo yêu cầu cho đơn COD ở trạng thái Đã giao (BR-16) | REFUND-051 | Đạt |
| MR-16 | MR | Confirmed — R9 đang là tracked change chưa duyệt; nguồn hiện hành ghi Ản | REFUND-025 | Đạt |
| MR-05 | MR | Confirmed — R5 chỉ nêu lý do Hàng lỗi; PO hỏi lý do Giao sai hàng chưa c | REFUND-026, REFUND-027, REFUND-028 | Đạt |
| MR-13 | MR | Confirmed — BR-13 giới hạn 2 lần nhưng không nêu hệ thống phản hồi gì; d | REFUND-048 | Đạt |
| MR-09 | MR | Confirmed — Nguồn không mô tả trạng thái và xử lý khi cổng thanh toán kh | REFUND-034 | Đạt |
| MR-01 | MR | Confirmed — Đơn COD ở trạng thái Đã giao thoả R1; nguồn không nói chức n | REFUND-050 | Đạt |
| MR-02 | MR | Confirmed — Gọi API với orderId không thuộc tài khoản: mã HTTP và mã lỗi | REFUND-049 | Đạt |
| MR-03 | MR | Confirmed — Không rõ ngày giao là ngày 0 hay ngày 1, hạn cuối là cuối ng | REFUND-003, REFUND-004 | Đạt |
| MR-04 | MR | Confirmed — Yêu cầu thứ nhất đã được hoàn một phần; nguồn không nói trần | REFUND-008, REFUND-009 | Đạt |
| MR-06 | MR | Confirmed — Không rõ Nhân viên CSKH có thấy và thao tác được yêu cầu trê | REFUND-031 | Đạt |
| MR-08 | MR | Confirmed — Phân quyền của Trưởng nhóm với yêu cầu từ 5.000.000đ trở xuố | REFUND-032 | Đạt |
| MR-10 | MR | Confirmed — Không có min/max, xử lý chuỗi toàn khoảng trắng, chữ thông b | REFUND-036, REFUND-037, REFUND-038, REFUND-039, REFUND-040 | Đạt |
| MR-11 | MR | Confirmed — Không có mẫu email; không rõ khách có thấy lý do từ chối khô | REFUND-042 | Đạt |
| MR-12 | MR | Confirmed — Khách huỷ trong khi người duyệt đang duyệt (hoặc hộp xác nhậ | REFUND-045 | Đạt |
| MR-14 | MR | Confirmed — Không có chữ thông báo cho: số tiền dưới 10.000, mô tả quá 5 | REFUND-010, REFUND-011, REFUND-012, REFUND-015, REFUND-016, REFUND-017, REFUND-018, REFUND-019, REFUND-020, REFUND-021, REFUND-022, REFUND-023, REFUND-024 | Đạt |
| MR-15 | MR | Confirmed — Không rõ paidAmount gồm phí vận chuyển và đã trừ giảm giá vo | REFUND-007 | Đạt |
| MR-17 | MR | Confirmed — Gọi thẳng API tạo yêu cầu cho đơn COD ở trạng thái Đã giao — | REFUND-051 | Đạt |
| TI-01 | TI | Khách gửi yêu cầu hợp lệ cho đơn Đã giao thì yêu cầu được tạo ở Chờ du | REFUND-001 | Đạt |
| TI-02 | TI | Đơn chưa ở trạng thái Đã giao bị từ chối tạo yêu cầu. | REFUND-002 | Đạt |
| TI-03 | TI | Hạn gửi yêu cầu kết thúc lúc 23:59 ngày thứ 10 kể từ ngày giao. | REFUND-003, REFUND-004 | Đạt |
| TI-05 | TI | Đơn đã có yêu cầu Chờ duyệt thì không tạo được yêu cầu thứ hai. | REFUND-005 | Đạt |
| TI-06 | TI | Số tiền yêu cầu vượt số tiền đã thanh toán thì không gửi được. | REFUND-006 | Đạt |
| TI-07 | TI | Trần số tiền bằng paidAmount gồm phí vận chuyển và đã trừ voucher. | REFUND-007 | Đạt |
| TI-08 | TI | Yêu cầu thứ hai sau khi đã hoàn một phần có trần bằng số đã thanh toán | REFUND-008, REFUND-009 | Đạt |
| TI-09 | TI | Số tiền yêu cầu có giới hạn dưới 10.000. | REFUND-010, REFUND-011, REFUND-012 | Đạt |
| TI-10 | TI | Gửi khi bỏ trống trường bắt buộc Lý do hoặc Số tiền thì hiện thông báo | REFUND-013, REFUND-014 | Đạt |
| TI-11 | TI | Gọi API với lý do không thuộc danh sách thì nhận lỗi ràng buộc. | REFUND-015 | Đạt |
| TI-12 | TI | Mô tả có độ dài tối đa 500 ký tự. | REFUND-016, REFUND-017, REFUND-018 | Đạt |
| TI-13 | TI | Số ảnh minh chứng tối đa là 3. | REFUND-019, REFUND-020, REFUND-021 | Đạt |
| TI-14 | TI | Mỗi ảnh minh chứng tối đa 5 MB. | REFUND-022, REFUND-023 | Đạt |
| TI-15 | TI | Ảnh không phải JPG hoặc PNG bị từ chối. | REFUND-024 | Đạt |
| TI-16 | TI | Lý do Hàng lỗi mà không có ảnh minh chứng thì không gửi được. | REFUND-025 | Đạt |
| TI-17 | TI | Tự động duyệt khi số tiền từ 500.000đ trở xuống và lý do Hàng lỗi. | REFUND-026, REFUND-027 | Đạt |
| TI-18 | TI | Lý do khác Hàng lỗi thì không được tự động duyệt dù số tiền nhỏ. | REFUND-028 | Đạt |
| TI-19 | TI | Ngưỡng 5.000.000đ phân yêu cầu cho Nhân viên hay Trưởng nhóm CSKH. | REFUND-029, REFUND-030 | Đạt |
| TI-20 | TI | Nhân viên CSKH thấy yêu cầu trên 5.000.000đ nhưng không có nút Duyệt v | REFUND-031 | Đạt |
| TI-21 | TI | Trưởng nhóm CSKH duyệt được yêu cầu từ 5.000.000đ trở xuống. | REFUND-032 | Đạt |
| TI-22 | TI | Yêu cầu được duyệt chuyển Đã duyệt rồi Đã hoàn tiền, tiền về phương th | REFUND-033 | Đạt |
| TI-23 | TI | Cổng thanh toán hoàn tiền thất bại thì yêu cầu giữ trạng thái Đã duyệt | REFUND-034 | Đạt |
| TI-24 | TI | Người duyệt từ chối có nhập lý do thì yêu cầu chuyển Từ chối. | REFUND-035 | Đạt |
| TI-25 | TI | Lý do từ chối tối đa 255 ký tự. | REFUND-036, REFUND-037, REFUND-038 | Đạt |
| TI-26 | TI | Lý do từ chối để trống hoặc chỉ có khoảng trắng bị chặn. | REFUND-039, REFUND-040 | Đạt |
| TI-27 | TI | Khách nhận email khi yêu cầu được duyệt, và email từ chối có kèm lý do | REFUND-041, REFUND-042 | Đạt |
| TI-28 | TI | Khách huỷ yêu cầu Chờ duyệt qua hộp xác nhận thì yêu cầu chuyển Đã huỷ | REFUND-043 | Đạt |
| TI-30 | TI | Nút Huỷ yêu cầu bị ẩn khi yêu cầu không ở Chờ duyệt. | REFUND-044 | Đạt |
| TI-31 | TI | Khách huỷ và người duyệt duyệt cùng lúc thì bên sau nhận thông báo cập | REFUND-045 | Đạt |
| TI-32 | TI | Yêu cầu đã gửi không sửa được. | REFUND-046 | Đạt |
| TI-33 | TI | Mỗi đơn gửi tối đa 2 lần tính cả lần bị từ chối hoặc đã huỷ. | REFUND-047, REFUND-048 | Đạt |
| TI-34 | TI | Gửi yêu cầu cho đơn của tài khoản khác qua API bị chặn. | REFUND-049 | Đạt |
| TI-35 | TI | Đơn COD đã giao không có nút yêu cầu hoàn tiền và API chặn. | REFUND-050, REFUND-051 | Đạt |

## 3. CÂN BẰNG VIEWPOINT
| VP | Tên | Số TC | Ghi chú |
|---|---|---|---|
| VP-01 | Happy Path | 8 | Đủ |
| VP-02 | Negative | 16 | Đủ |
| VP-03 | Boundary | 20 | Đủ |
| VP-04 | Security | 4 | Đủ |
| VP-05 | UX/Usability | 4 | Đủ |
| VP-08 | Integration | 4 | Đủ |

TC mang VP ngoài 03: Không có.

## 4. CHUỖI BIÊN
> Chỉ các điểm máy tính được từ nguồn (`npm run boundary`). Điểm ghi `[CHƯA CÓ TRONG TÀI LIỆU]` ở tool không phải gap (QA_STANDARD §6).

| FD | min-1 | min | min+1 | Giữa | max-1 | max | max+1 |
|---|---|---|---|---|---|---|---|
| FD-02 | REFUND-010 | REFUND-011 | REFUND-012 | Không áp dụng (max động = paidAmount) | Không áp dụng | Không áp dụng | Không áp dụng — vượt paidAmount kiểm ở AF-03 |
| FD-03 | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng | REFUND-016 | REFUND-017 | REFUND-018 |
| FD-04 (số ảnh) | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng | REFUND-019 | REFUND-020 | REFUND-021 |
| FD-05 | Không áp dụng | Không áp dụng | Không áp dụng | Không áp dụng | REFUND-036 | REFUND-037 | REFUND-038 |

## 5. HUMAN-FINAL
- Mức rủi ro chấp nhận được, Priority cuối (20 TC mang `Medium [ĐỀ XUẤT]` vì không có RK liên quan), Automated/Manual: do QA Lead / PO quyết (không chặn verdict).
- 18 chỗ trong TC mang `[CHƯA CÓ TRONG TÀI LIỆU]`: phần lớn là chữ thông báo cho nhánh mà BA chưa cung cấp (vd lý do từ chối quá 255 ký tự, yêu cầu lần 2 vượt trần). Hành vi đã rõ nên không chặn verdict; nên gửi BA ở vòng sau.
- Điểm dung lượng ảnh "đúng 5 MB / lớn hơn 5 MB" chỉ có ở AF-14 — tool `boundary` chưa tách được ràng buộc thứ hai của FD-04.

## FIX
Không có

## ASK
Không có
