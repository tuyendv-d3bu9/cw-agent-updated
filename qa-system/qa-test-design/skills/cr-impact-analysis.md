---
name: cr-impact-analysis
description: >
  Phân tích tác động của Change Request (CR) hoặc tài liệu cập nhật trong 5 ngăn INPUT/<task-slug>/
  lên kho tri thức và bộ Test Case hiện hành: chỉ rõ Delta (Cũ → Mới) trên BR/FD/AF/thông báo, gom
  điểm mờ thành câu hỏi đóng MR-xx cho BA/PO, và phân loại từng Test Case bị ảnh hưởng (Sửa giá trị /
  Viết lại / Chỉ chạy lại / Blocked).
---

# Skill: cr-impact-analysis

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict §1 · guard & nhãn §2 · FACT §3 · chuỗi biên §6 ·
> I/O §7 · knowledge §8 · mã & schema §9 · nguồn & ưu tiên §10 · thang đo §11).
> Luật đã có ở QA_STANDARD thì **trỏ số mục**, không chép lại.
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung
> (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
Đánh giá tác động khi có Change Request (CR) hoặc tài liệu cập nhật mới (System Design, API Spec, SRS, Wireframe, biên bản họp) được bổ sung vào một tính năng đã có bộ Test Case. Xuất ra `OUTPUT/<task-slug>/16_cr_impact_analysis.md` gồm bảng Delta (Cũ → Mới) có trích nguyên văn, bảng câu hỏi `MR-xx` cho các điểm mờ, danh sách từng `TC_ID` bị ảnh hưởng kèm hành động bảo trì cụ thể và chỉ dẫn đồng bộ tri thức.

## Đầu vào
- `INPUT/<task-slug>/` — đủ 5 ngăn (`01_business/`, `02_ba/`, `03_dev/`, `04_design/`, `05_communication/`). **Không đọc** `<ngăn>/_superseded/`. Nếu tài liệu cập nhật còn nằm ở thư mục rời bên ngoài, chạy `npm run intake -- <đường-dẫn> --into <task-slug>` trước để phân nhóm tự động vào 5 ngăn.
- `OUTPUT/<task-slug>/01_requirement_risk_summary.md` — bảng `BR`, `FD`, `AF` hiện hành và danh sách file nguồn tại dòng meta.
- `OUTPUT/<task-slug>/02_missing_rule_report.md` (nếu có) — danh sách `MR` đã có của tính năng.
- `OUTPUT/<task-slug>/05_test_case_spec.md` (hoặc `OUTPUT/<task-slug>/testcases/batch_*.md`) — bộ Test Case 8 trường hiện hành.
- `OUTPUT/<task-slug>/06_coverage_review.md` (nếu có) — ma trận độ phủ `BR/FD/AF` ↔ `TC_ID` và bảng chuỗi biên.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` — §3, §7, §8, §9 (luôn nạp, QA_STANDARD §7).

> Thiếu `01_requirement_risk_summary.md`, thiếu `05_test_case_spec.md` (hoặc `testcases/batch_*.md`), hoặc không có tài liệu cập nhật mới nào trong 5 ngăn `INPUT/<task-slug>/` → DỪNG, không tự tưởng tượng nội dung.

## KHÔNG được (riêng skill này)
> Chỉ ghi chốt chặn **riêng**. Guard chung ở `qa-system/core/QA_STANDARD.md` §2 — không lặp lại.

- Không tự ý sửa trực tiếp `01_requirement_risk_summary.md`, `05_test_case_spec.md` hay `knowledge/features/<task-slug>.md` trong bước này — việc cập nhật chính thức thuộc các chặng `01`, `02`, `05`, `06` sau khi người dùng/BA xác nhận.
- Không đọc hoặc trích dẫn từ thư mục `<ngăn>/_superseded/` (bản cũ đã bị thay thế).
- Không tự đoán giá trị mới, ngưỡng mới hoặc chữ thông báo lỗi mới khi tài liệu cập nhật bỏ ngỏ hoặc hẹn bổ sung sau — bắt buộc gắn nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` (QA_STANDARD §2.1) và sinh câu hỏi đóng cho BA/PO.
- Không bỏ sót bất kỳ `TC_ID` nào trong `05_test_case_spec.md` có gắn tag `Rule#<mã>` của `BR`/`FD`/`AF` nằm trong bảng Delta.
- Không tự đếm nhẩm số thứ tự mã `MR-xx` (hoặc `BR-xx`, `FD-xx`, `AF-xx` mới) — phải dùng mã tạm rồi chạy `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/16_cr_impact_analysis.md`.

## Quy tắc phân loại tác động lên Test Case (ma trận đóng)
> Chỉ dùng trong skill này để bảo đảm hai lần chạy trên cùng đầu vào luôn ra cùng danh sách `TC_ID` và cùng nhãn hành động.

1. **Quy tắc chọn dòng vào Bảng Delta (§2)**:
   Quét bảng `BR` (§3), `FD` (§3b), `AF` (§5) của `01_requirement_risk_summary.md` và đưa vào Bảng Delta mọi mã thoả một trong hai điều kiện:
   - **Thay đổi trực tiếp**: Tài liệu cập nhật sửa trực tiếp điều kiện, ngưỡng, độ dài, định dạng hoặc chữ thông báo của mã đó.
   - **Thay đổi dẫn xuất**: Dòng của mã đó trong `01_requirement_risk_summary.md` có dẫn chiếu mã bị thay đổi trực tiếp **và** lặp lại con số ngưỡng/giá trị cũ bị thay đổi.
2. **Quy tắc chọn `TC_ID` vào Bảng đánh giá tác động (§4.2)**:
   Tập `TC_ID` đưa vào §4.2 (sắp xếp theo `TC_ID` tăng dần) gồm và **chỉ gồm**:
   - **Nhóm theo Tag**: Mọi `TC_ID` trong `05_test_case_spec.md` có tag `Rule#<mã>` trùng với một `Mã đối tượng` trong Bảng Delta (§2).
   - **Nhóm liên đới theo Expected Result**: Mọi `TC_ID` khác trong `05_test_case_spec.md` không mang tag của mã trong Bảng Delta nhưng có dòng trong `Expected Result` khẳng định trực tiếp hành vi của quy tắc nằm trong Bảng Delta.
3. **Quy tắc gán nhãn cho từng `TC_ID` trong §4.2**:
   Mỗi `TC_ID` nhận **đúng một** nhãn ở cột `Hành động` và **đúng một** nhãn ở cột `Trạng thái`:

| Cột | Giá trị hợp lệ | Điều kiện áp dụng (ma trận đóng) |
|---|---|---|
| `Hành động` | `Sửa giá trị` | TC có chứa trực tiếp con số ngưỡng cũ, điểm biên cũ (`min`, `max-1`, `max`, `max+1`) hoặc chữ thông báo cũ trong `Title`, `Test Steps`, `Test Data` hoặc `Expected Result`, và cấu trúc các bước thao tác (`Test Steps`) giữ nguyên (chỉ đổi con số/chuỗi sang giá trị mới). |
| `Hành động` | `Viết lại` | Thay đổi điều kiện rẽ nhánh làm đổi kết quả nghiệp vụ của kịch bản, phải thêm/bớt bước thao tác trong `Test Steps`, hoặc cần tách lại kịch bản theo chuỗi biên chuẩn (QA_STANDARD §6). |
| `Hành động` | `Chỉ chạy lại` | TC **không** chứa con số ngưỡng cũ hay chữ thông báo cũ (mọi dữ liệu và kết quả kỳ vọng trong TC vẫn đúng nguyên văn dưới quy tắc mới), chỉ dùng chung quy tắc hoặc kiểm tra hành vi liên đới trong `Expected Result` nên cần chạy hồi quy. |
| `Trạng thái` | `Blocked — Chờ MR-xx` | Nội dung cần sửa hoặc kết quả kỳ vọng của `TC_ID` phụ thuộc trực tiếp vào một điểm mờ chưa chốt (`MR-xx` ở trạng thái `New` hoặc `TREO`). |
| `Trạng thái` | `Sẵn sàng cập nhật` | Áp dụng cho TC có `Hành động` là `Sửa giá trị` hoặc `Viết lại` và mọi giá trị mới cần cho TC đó đã có đầy đủ trong nguồn hợp lệ. |
| `Trạng thái` | `Sẵn sàng chạy lại` | Áp dụng cho TC có `Hành động` là `Chỉ chạy lại` và không phụ thuộc vào `MR-xx` nào đang treo. |

## Các bước
1. **Bước 1 — Tiếp nhận & Quét tài liệu cập nhật theo 5 ngăn (`INPUT/<task-slug>/`)**:
   - Nếu tài liệu mới còn nằm ở thư mục rời (ví dụ `updates/`), chạy `npm run intake -- <đường-dẫn> --into <task-slug>` để chuyển sang `.md`, xếp vào đúng 5 ngăn (`01_business`, `02_ba`, `03_dev`, `04_design`, `05_communication`) và dời bản cũ vào `<ngăn>/_superseded/`.
   - Quét 5 ngăn của `INPUT/<task-slug>/` (trừ `_superseded/`), đối chiếu với dòng meta `Nguồn:` của `01_requirement_risk_summary.md` và `knowledge/features/<task-slug>.md` để lập danh sách các file cập nhật mới theo từng ngăn.
   - Kiểm tra ngày ban hành, người yêu cầu, trạng thái phê duyệt và áp thứ tự ưu tiên nguồn theo `QA_STANDARD` §10.2. Mục `## Annotations / Pending changes` hoặc tài liệu chưa phê duyệt được ghi nhận thành điểm mờ (`MR`).
2. **Bước 2 — Đối chiếu Tri thức & Test Suite hiện có**:
   - Đọc `knowledge/_project.md`, `knowledge/features/<task-slug>.md` (§3, §7, §8, §9) và `01_requirement_risk_summary.md` (§3 `BR`, §3b `FD`, §5 `AF`).
   - Đọc toàn bộ `05_test_case_spec.md` (và `06_coverage_review.md` nếu có), lập danh sách ánh xạ từng mã `BR-xx`, `FD-xx`, `AF-xx` sang các `TC_ID` đang kiểm tra mã đó.
3. **Bước 3 — Phân tích Delta (Cũ → Mới) & Bắt điểm mờ (`MR-xx`)**:
   - Đối chiếu từng nội dung thay đổi trong tài liệu mới với các dòng `BR-xx`, `FD-xx`, `AF-xx` hiện có (sắp xếp theo mã tăng dần: `BR` → `FD` → `AF`).
   - Lập bảng Delta (§2 của báo cáo): ghi rõ `Mã đối tượng`, `Loại thay đổi`, `Nội dung cũ (kèm nguồn cũ)`, `Nội dung mới`, `Nguồn mới (file §mục)` và `Trích nguyên văn` đúng từng chữ từ tài liệu mới.
   - Chỗ nào tài liệu mới thiếu thông tin (ví dụ: đổi độ dài nhưng thông báo lỗi hẹn gửi sau), mâu thuẫn giữa các nguồn cùng cấp (`QA_STANDARD` §10.2), hoặc chưa rõ phạm vi áp dụng:
     - Điền nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-?a]` tại phần thiếu trong ô `Nội dung mới`.
     - Thêm dòng câu hỏi đóng tương ứng vào bảng `## 3. DANH SÁCH CÂU HỎI CHO BA/PO (ĐIỂM MỜ)` theo đúng schema `QA_STANDARD` §9.4.
4. **Bước 4 — Đánh giá tác động lên từng Test Case**:
   - Tập hợp mọi `TC_ID` mang tag `Rule#<mã>` của các mã có trong bảng Delta (và các `TC_ID` có quy tắc phụ thuộc trực tiếp vào mã đó trong `01_requirement_risk_summary.md`), sắp xếp theo `TC_ID` tăng dần.
   - Áp dụng bảng **Quy tắc phân loại tác động lên Test Case** ở trên để điền `Hành động` (`Sửa giá trị` / `Viết lại` / `Chỉ chạy lại`), `Trạng thái` (`Sẵn sàng cập nhật` / `Sẵn sàng chạy lại` / `Blocked — Chờ MR-xx`) và `Chi tiết thay đổi / Lý do` (chỉ rõ đổi từ giá trị nào sang giá trị nào hoặc chờ `MR-xx` nào).
   - Kiểm tra chuỗi biên chuẩn (`QA_STANDARD` §6) cho các `FD-xx` hoặc ngưỡng `BR-xx` bị đổi: nếu sau khi sửa các TC hiện có mà vẫn thiếu điểm biên mới (có thể dùng `npm run boundary` để tính điểm biên từ ngưỡng mới), liệt kê vào mục `## 5. ĐỀ XUẤT TEST CASE BỔ SUNG (NẾU CÓ)`.
5. **Bước 5 — Gán mã tự động, Chỉ dẫn đồng bộ Knowledge & Ra Verdict**:
   - Ghi file `OUTPUT/<task-slug>/16_cr_impact_analysis.md`, rồi chạy `npm run ids -- <task-slug> --assign OUTPUT/<task-slug>/16_cr_impact_analysis.md` để đổi toàn bộ mã tạm (`MR-?a`, `BR-?a`…) sang số thứ tự tiếp theo (QA_STANDARD §9.1).
   - Lập bảng chỉ dẫn đồng bộ vào `knowledge/features/<task-slug>.md` (tuân thủ luật ghi `QA_STANDARD` §8) và thứ tự các chặng cần chạy lại sau khi BA/PO xác nhận.
   - Xác định Verdict theo `QA_STANDARD` §1:
     - `ASK`: khi còn bất kỳ câu hỏi `MR-xx` mới nào ở trạng thái `New` / `TREO` (hoặc tài liệu cập nhật chưa được phê duyệt).
     - `PASS`: khi tài liệu cập nhật đã phê duyệt, không phát sinh `MR-xx` treo, và đã liệt kê đủ 100% `TC_ID` bị ảnh hưởng.
     - `FIX`: khi thiếu trích dẫn nguyên văn, để trống ô bảng không hợp lệ, hoặc bỏ sót `TC_ID` mang tag của mã bị thay đổi.

## Format output
Ghi ra `OUTPUT/<task-slug>/16_cr_impact_analysis.md`:

````markdown
# CR & Update Impact Analysis · <task-slug>
Owner: qa-system/qa-test-design/skills/cr-impact-analysis.md · Nguồn: <danh sách file đã đọc> · Verdict: ASK

## 1. TÀI LIỆU CẬP NHẬT ĐÃ QUÉT
| File cập nhật | Ngăn INPUT | Ngày / Phiên bản | Người yêu cầu / Ban hành | Trạng thái phê duyệt | Ghi chú ưu tiên nguồn (QA_STANDARD §10.2) |
|---|---|---|---|---|---|
| <đường-dẫn-file-trong-INPUT> | <01_business..05_communication> | <YYYY-MM-DD> | <tên/vai trò> | <Đã phê duyệt / Chờ xác nhận> | <ghi chú đối chiếu với spec cũ> |

## 2. PHÂN TÍCH DELTA (CŨ → MỚI)
| Mã đối tượng | Loại thay đổi | Nội dung cũ (Nguồn cũ) | Nội dung mới | Nguồn mới (file §mục) | Trích nguyên văn |
|---|---|---|---|---|---|
| BR-01 | Đổi ngưỡng/giá trị | <mô tả giá trị cũ> (<file-cũ §mục>) | <mô tả giá trị mới> | <file-mới §mục> | <câu trích đúng từng chữ từ file mới> |
| FD-01 | Đổi độ dài/định dạng & Đổi thông báo | <ràng buộc cũ>; Thông báo: "<thông-báo-cũ>" (<file-cũ §mục>) | <ràng buộc mới>; Thông báo: [CHƯA CÓ TRONG TÀI LIỆU – MR-01] | <file-mới §mục> | <câu trích đúng từng chữ từ file mới> |

## 3. DANH SÁCH CÂU HỎI CHO BA/PO (ĐIỂM MỜ)
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-01 | <mô tả điểm mờ trong tài liệu cập nhật> | W1 | <FD-01 × file-mới §mục> | <phương án A hoặc B> | <câu hỏi đóng cho BA/PO> |  |  |  | New |

## 4. ĐÁNH GIÁ TÁC ĐỘNG LÊN TEST CASE
### 4.1. Tổng hợp nhanh
| Phân loại hành động | Số lượng TC | Danh sách TC_ID |
|---|---|---|
| Sửa giá trị | <số> | <MODULE>-001, <MODULE>-002 |
| Viết lại | <số> | <MODULE>-003 |
| Chỉ chạy lại | <số> | <MODULE>-004 |

### 4.2. Chi tiết từng Test Case bị ảnh hưởng
| TC_ID | Title hiện tại | Mã liên quan | Hành động | Trạng thái | Chi tiết thay đổi / Lý do |
|---|---|---|---|---|---|
| <MODULE>-001 | <tiêu đề TC> | BR-01 | Sửa giá trị | Sẵn sàng cập nhật | Đổi <ngưỡng-cũ> thành <ngưỡng-mới> ở Test Data và Expected Result theo BR-01 mới |
| <MODULE>-002 | <tiêu đề TC> | FD-01 | Sửa giá trị | Blocked — Chờ MR-01 | Đổi độ dài từ <cũ> lên <mới>; thông báo lỗi trong Expected Result đang chờ chốt MR-01 |
| <MODULE>-003 | <tiêu đề TC> | BR-01 | Viết lại | Sẵn sàng cập nhật | Kịch bản cũ kiểm tại <giá-trị> nay đổi phân vùng nghiệp vụ theo BR-01 mới, cần viết lại bước/kỳ vọng |
| <MODULE>-004 | <tiêu đề TC> | BR-01 | Chỉ chạy lại | Sẵn sàng chạy lại | Điều kiện và dữ liệu của TC không đổi nhưng dùng chung luồng BR-01, cần chạy hồi quy |

## 5. ĐỀ XUẤT TEST CASE BỔ SUNG (NẾU CÓ)
| Kịch bản đề xuất | Mã nguồn liên quan | Viewpoint | Lý do bổ sung |
|---|---|---|---|
| <mô tả kịch bản điểm biên/nhánh mới> | <BR-01 / FD-01> | <VP-xx> | <lý do theo chuỗi biên QA_STANDARD §6> |

## 6. CHỈ DẪN CẬP NHẬT TRI THỨC & PIPELINE (THEO QA_STANDARD §8)
| Hạng mục | Đích cập nhật | Hành động tiếp theo | Điều kiện thực hiện |
|---|---|---|---|
| Câu hỏi điểm mờ (`MR-xx`) | `knowledge/features/<task-slug>.md` (§7, §8) | Chuyển câu hỏi ở §3 cho BA/PO; khi có phản hồi thì chép nguyên văn và chạy `npm run knowledge:sync -- <task-slug> --write` | Con người (BA/PO) trả lời và phê duyệt |
| Quy tắc & Trường thay đổi (`BR-xx`, `FD-xx`, `AF-xx`) | `OUTPUT/<task-slug>/01_requirement_risk_summary.md` & `knowledge/features/<task-slug>.md` (§3) | Chạy lại skill `01` (`requirement-risk-summary`) để cập nhật bảng BR/FD/AF và tự động ghi vào knowledge §3 | Sau khi các `MR-xx` mới đã chốt (hoặc chạy ngay cho phần đã rõ) |
| Bộ Test Case & Độ phủ | `OUTPUT/<task-slug>/05_test_case_spec.md` & `06_coverage_review.md` | Chạy lại `05` (`test-case-generation`) cho các TC `Sửa giá trị` / `Viết lại` → `npm run lint -- <task-slug>` → `06` (`coverage-review`) | Sau khi cổng `npm run gate <task-slug>` mở (`OPEN`) |

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
| 1 | §3 MR-01 | <nội dung câu hỏi cần chốt> | BA / PO |
````

> Dòng 2 là dòng meta đúng QA_STANDARD §7 (một verdict, không in đậm). Mỗi bảng có cột nguồn hoặc mã trace (§9).
> Mã mới lấy số từ `npm run ids -- <task-slug> --assign`; mã cũ giữ nguyên (§9.1). Ô thiếu dữ liệu điền nhãn §2.1.
> Nếu mục §3 hoặc §5 hoặc `## ASK` không có dòng nào, ghi dòng văn bản `Không có` thay vì để bảng rỗng.

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] File xuất ra đúng `OUTPUT/<task-slug>/16_cr_impact_analysis.md`, dòng 2 là dòng meta đúng `QA_STANDARD` §7.
- [ ] Mọi dòng trong `## 2. PHÂN TÍCH DELTA (CŨ → MỚI)` có đủ `Mã đối tượng`, `Nguồn mới (file §mục)` và `Trích nguyên văn` đúng từng chữ từ file trong `INPUT/<task-slug>/` (trừ `_superseded/`).
- [ ] Không có giá trị mới, ngưỡng mới hay chữ thông báo lỗi mới nào tự chế: mọi chỗ tài liệu cập nhật bỏ ngỏ đều mang nhãn `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` và có dòng tương ứng trong `## 3`.
- [ ] Mọi mã `MR-xx` mới lấy số tiếp theo qua `npm run ids -- <task-slug> --assign`, không trùng mã đã có trong `02_missing_rule_report.md` hoặc `knowledge/features/<task-slug>.md`.
- [ ] 100% `TC_ID` trong `05_test_case_spec.md` có tag `Rule#<mã>` thuộc tập mã trong bảng Delta đều xuất hiện trong `## 4.2` với đúng một nhãn `Hành động` (`Sửa giá trị` / `Viết lại` / `Chỉ chạy lại`) và một `Trạng thái` hợp lệ.
- [ ] Không có ô trống trong bất kỳ bảng nào (ngoài 3 cột `Phản hồi chính thức`, `Người trả lời`, `Ngày` của bảng câu hỏi §3); chạy `npm run lint -- <task-slug>` đạt 0 lỗi, 0 cảnh báo ô trống.
