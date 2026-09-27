# THANG ĐIỂM CHẤM — Project Tốt Nghiệp

> Dành cho giảng viên. Học viên cũng nên đọc để biết mình được chấm theo tiêu chí nào.
> Mỗi học viên làm và được chấm **riêng**. Tổng 100 điểm, cộng thưởng tối đa +10.
> **Đạt từ 60 điểm**, tính trên **điểm cuối cùng** (sau khi cộng thưởng và trừ vi phạm).

---

## Tổng quan

| Phần | Điểm |
|---|---|
| A — Nâng cấp hệ thống Agent | 40 |
| B — Test case & Automation | 47 |
| C — Báo cáo & Bài nộp | 13 |
| **Tổng** | **100** |
| Điểm thưởng (tối đa) | +10 |

**Cách tính điểm cuối cùng:**

```
Điểm cuối cùng = (A + B + C) + Thưởng − Trừ        (tối đa 110)
```

> **Luật trừ điểm — mỗi vi phạm chỉ trừ MỘT lần.** Mọi vi phạm được trừ tại bảng [TRỪ ĐIỂM](#trừ-điểm). Khi chấm các mục A, B, C, **không** hạ điểm thêm vì chính vi phạm đó.

---

## PHẦN A — Nâng cấp hệ thống (40 điểm)

### A1. Chất lượng quyết định (10 điểm)

| Điểm | Mô tả |
|---|---|
| 9–10 | Bảng quyết định trả lời đủ **cả ba** câu của cây A/B/C với lý do cụ thể. Ở câu (3) có phân tích ba dấu hiệu vượt vai trò. Kết luận nhất quán với lập luận |
| 6–8 | Có bảng quyết định, kết luận đúng, nhưng lý do sơ sài hoặc bỏ qua một câu |
| 3–5 | Kết luận đúng nhưng không có lập luận, hoặc chỉ làm theo đề bài mà không tự phân tích |
| 0–2 | Không có bảng quyết định |

> **Lưu ý chấm**: kết luận **khác** gợi ý trong đề vẫn được điểm tối đa nếu lập luận vững và học viên lan truyền đúng theo nhánh mình chọn. Chấm tư duy, không chấm sự trùng khớp.

### A2. Chất lượng nội dung sửa/tạo (12 điểm)

| Điểm | Mô tả |
|---|---|
| 11–12 | Nội dung đặt **đúng tầng** (luật chung ở `QA_STANDARD.md`, quy trình ở skill, danh tính ở `AGENT.md`, dữ kiện ở `knowledge/`). Viết theo đúng khuôn mẫu, có `Format output`, có `Chốt chặn nghiệm thu` diễn đạt kiểm chứng được |
| 8–10 | Đúng tầng, đủ mục, nhưng chốt chặn nghiệm thu còn chung chung |
| 4–7 | Sai tầng ở một chỗ (ví dụ nhét luật chung vào skill), hoặc thiếu mục bắt buộc của khuôn mẫu |
| 0–3 | Còn placeholder `<…>` chưa thay, hoặc không theo khuôn mẫu |

### A3. Lan truyền điểm neo (12 điểm)

Chấm theo điểm neo bắt buộc của từng đề:

| Đề | Điểm neo bắt buộc |
|---|---|
| DE-01 `[C]` | **N1** bắt buộc. N3 và N5 chỉ bắt buộc nếu việc sửa làm đổi Vào/Ra của skill. N2, N4, N6 thường không áp dụng, nhưng **vẫn phải ghi lý do** |
| DE-02 `[A]` | **N1–N5** bắt buộc. N6 làm, hoặc ghi `KHÔNG ÁP DỤNG` kèm lý do |

| Điểm | Mô tả |
|---|---|
| 11–12 | Đủ mọi điểm neo bắt buộc. Điểm không áp dụng đều có **lý do** cụ thể, không bỏ trống |
| 8–10 | Thiếu 1 điểm neo phụ (ví dụ `agent-doctor.js`), hoặc một dòng `KHÔNG ÁP DỤNG` không có lý do |
| 4–7 | Thiếu điểm neo chính: `AGENT.md` hoặc `WORKFLOW.md` hoặc `_system_map.json` |
| 0–3 | Chỉ sửa nội dung, không khai báo ở đâu cả |

> Tên skill khai trong `AGENT.md` không khớp tên file trên đĩa: trừ ở bảng Trừ điểm (**P5**), không hạ thêm điểm A3.

### A4. Cổng nghiệm thu (6 điểm)

| Điểm | Mô tả |
|---|---|
| 6 | Cả 4 cổng `G1`–`G4` có **kết quả thật** dán vào biên bản. `agent:check` xanh. Có smoke lại luồng cũ |
| 4–5 | 2–3 cổng có kết quả thật |
| 2–3 | Chỉ 1 cổng có kết quả thật |
| 0–1 | Không cổng nào có kết quả thật |

> Ghi "OK" cho một cổng mà thực tế chưa chạy: trừ ở bảng Trừ điểm (**P2**). Cổng đó tính là không có kết quả thật.

---

## PHẦN B — Test case & Automation (47 điểm)

### B1. Chất lượng phân tích, Chặng 01–04 (10 điểm)

| Điểm | Mô tả |
|---|---|
| 9–10 | Bóc tách đủ Business Rule, không bịa rule ngoài nguồn. Ma trận rủi ro có lập luận. Viewpoint không chồng lấn. Test idea có lý do Giữ/Bỏ rõ ràng |
| 6–8 | Đủ file, nội dung đúng nhưng nông |
| 3–5 | Thiếu một chặng, hoặc có rule không dẫn được nguồn |
| 0–2 | Nhảy cóc, thiếu từ hai chặng trở lên |

> Rule bịa không có nguồn, không gắn `[GIẢ ĐỊNH]`: trừ ở bảng Trừ điểm (**P3**).

### B2. Xử lý vòng `ASK` và tích luỹ tri thức (8 điểm)

**Đây là hạng mục phân loại học viên rõ nhất.**

| Điểm | Mô tả |
|---|---|
| 7–8 | Trả lời BA **dứt khoát**, ghi đủ vào mục 7 (đổi trạng thái sang `Confirmed`) và mục 8 (kèm người phê duyệt, ngày). Chạy lại Chặng 2 và chứng minh được agent **không hỏi lại** |
| 5–6 | Ghi vào knowledge đầy đủ nhưng không chạy lại để chứng minh |
| 2–4 | Trả lời qua loa kiểu "tuỳ", hoặc chỉ trả lời trong chat mà không ghi vào knowledge |
| 0–1 | Bỏ qua `ASK`, ép agent chạy tiếp |

### B3. Chất lượng Test Case, Chặng 05–06 (12 điểm)

| Điểm | Mô tả |
|---|---|
| 11–12 | Đủ trường theo chuẩn. `Test Data` là giá trị thật đúng định dạng tiền. Mọi TC trace được về `BR-xx` và `VP-xx`. Coverage review chỉ ra gap cụ thể, không kết luận chung chung |
| 8–10 | Đủ trường, trace đủ, nhưng còn vài `Test Data` chung chung |
| 4–7 | Có TC "mồ côi" không trace được, hoặc `Test Data` còn placeholder |
| 0–3 | Test case không dùng được để thực thi |

> Kiểm bằng cách **truy vết ngược** một test case bất kỳ qua đủ 5 chặng (xem `run-graduation.md` §7). Đứt chặng nào thì trừ điểm.

### B4. Chất lượng code Automation (10 điểm)

| Điểm | Mô tả |
|---|---|
| 9–10 | Tái sử dụng POM có sẵn, không trùng lặp. Locator theo đúng thứ tự ưu tiên. So tiền qua `parseMoney()`. `beforeEach` dọn trạng thái |
| 6–8 | Chạy được, đúng ràng buộc chính, nhưng có chỗ trùng lặp hoặc locator yếu |
| 3–5 | Vi phạm một ràng buộc kỹ thuật: dùng XPath tuyệt đối / class băm, so tiền bằng chuỗi thô, hoặc không dọn trạng thái giữa các ca |
| 0–2 | Code không chạy được |

> Dùng `page.goto(<path>)` để chuyển màn (ngoài `BasePage.open()`): trừ ở bảng Trừ điểm (**P6**), không hạ thêm điểm B4.

### B5. Thực thi & Bằng chứng (7 điểm)

| Điểm | Mô tả |
|---|---|
| 7 | Đủ số ca tối thiểu, chạy thật, `run_result.md` đầy đủ, mỗi ca `FAIL` có ảnh bằng chứng và giải trình nguyên nhân trong `run_defects.md` |
| 4–6 | Chạy thật nhưng thiếu ca, hoặc thiếu ảnh / giải trình cho một số ca |
| 1–3 | Chỉ có code, chưa chạy |
| 0 | Không có phần automation |

> **Ca `FAIL` không bị trừ điểm** nếu học viên giải trình được đó là lệch giữa tài liệu và hệ thống thật. Bị trừ khi `FAIL` mà không biết vì sao.

---

## PHẦN C — Báo cáo & Bài nộp (13 điểm)

Không có phần trình bày trực tiếp. `BAO-CAO.md` là nơi học viên giải thích mình đã làm gì và vì sao.

### C1. `BAO-CAO.md` (9 điểm)

| Điểm | Mô tả |
|---|---|
| 8–9 | Đủ 4 mục theo mẫu. Số liệu khớp với file thật trong bài nộp. Giải thích được **vì sao** chọn nhánh A/B/C và vì sao chạm/không chạm từng điểm neo. Phát hiện có dẫn nguồn |
| 5–7 | Đủ 4 mục nhưng có 1–2 số liệu lệch với file thật, hoặc phần giải thích sơ sài |
| 2–4 | Thiếu mục, hoặc số liệu không khớp nhiều chỗ |
| 0–1 | Không có `BAO-CAO.md` |

### C2. Cấu trúc bài nộp (4 điểm)

| Điểm | Mô tả |
|---|---|
| 4 | Tên file đúng mẫu. Đúng cây thư mục quy định. Không lẫn `node_modules/`, `automation/test-results/`, `automation/playwright-report/` |
| 2–3 | Sai tên file, hoặc thiếu một thư mục bắt buộc |
| 0–1 | Thiếu nhiều thư mục bắt buộc, hoặc nén lẫn `node_modules/` |

---

## ĐIỂM THƯỞNG (tối đa +10)

| Mã | Việc làm được | Thưởng |
|---|---|---|
| BN1 | Phát hiện **lệch giữa tài liệu BA và hệ thống thật**, có dẫn chứng cụ thể ở cả hai phía | +3 mỗi phát hiện, tối đa +6 |
| BN2 | Chỉ ra được một điểm yếu **thật** của hệ thống Agent kèm đề xuất cải tiến cụ thể | +2 |
| BN3 | Ca automation phát hiện lỗi thật của ứng dụng, không phải lỗi kịch bản | +2 |

> Việc dùng thành quả Phần A vào Phần B là **yêu cầu bắt buộc** (checklist `B.5` của mỗi đề), không phải điểm thưởng.

---

## TRỪ ĐIỂM

Mỗi vi phạm chỉ trừ **một lần**, tại bảng này.

| Mã | Vi phạm | Trừ |
|---|---|---|
| P1 | Tự ý **sửa tài liệu trong `INPUT/`** cho khớp hệ thống | −10 |
| P2 | Ghi kết quả kiểm tra là "OK" mà thực tế chưa chạy | −5 |
| P3 | Bịa Business Rule không có trong nguồn, không gắn `[GIẢ ĐỊNH]` | −5 mỗi rule, tối đa −10 |
| P4 | Sinh file rác ngoài `OUTPUT/` và `automation/` | −3 |
| P5 | Tên skill trong `AGENT.md` không khớp file thật | −4 |
| P6 | Dùng `page.goto(<path>)` để chuyển màn | −5 |

---

## Bảng chấm nhanh (in ra dùng khi chấm)

```
Học viên: ______________________  Đề: ____

PHẦN A                                    Điểm      /40
  A1 Chất lượng quyết định                ____      /10
  A2 Chất lượng nội dung                  ____      /12
  A3 Lan truyền điểm neo                  ____      /12
  A4 Cổng nghiệm thu                      ____      /6

PHẦN B                                    Điểm      /47
  B1 Phân tích 01-04                      ____      /10
  B2 Vòng ASK & knowledge                 ____      /8
  B3 Test case 05-06                      ____      /12
  B4 Code automation                      ____      /10
  B5 Thực thi & bằng chứng                ____      /7

PHẦN C                                    Điểm      /13
  C1 BAO-CAO.md                           ____      /9
  C2 Cấu trúc bài nộp                     ____      /4

Thưởng (tối đa +10)   BN1 ____  BN2 ____  BN3 ____   = +____
Trừ                   P1 __ P2 __ P3 __ P4 __ P5 __ P6 __ = −____

ĐIỂM CUỐI CÙNG: ____ /100 (+10)        ĐẠT khi ≥ 60
```
