# THANG ĐIỂM CHẤM — Project Tốt Nghiệp

> Dành cho giảng viên. Học viên cũng nên đọc để biết mình được chấm theo tiêu chí nào.
> Tổng 100 điểm. Đạt từ 60 điểm.

---

## Tổng quan

| Phần | Điểm |
|---|---|
| A — Nâng cấp hệ thống Agent | 40 |
| B — Test case & Automation | 45 |
| C — Trình bày & Báo cáo | 15 |
| **Tổng** | **100** |
| Điểm thưởng (tối đa) | +10 |

---

## PHẦN A — Nâng cấp hệ thống (40 điểm)

### A1. Chất lượng quyết định (10 điểm)

| Điểm | Mô tả |
|---|---|
| 9–10 | Bảng quyết định trả lời đủ **cả ba** câu của cây A/B/C với lý do cụ thể. Ở câu (3) có phân tích ba dấu hiệu vượt vai trò. Kết luận nhất quán với lập luận |
| 6–8 | Có bảng quyết định, kết luận đúng, nhưng lý do sơ sài hoặc bỏ qua một câu |
| 3–5 | Kết luận đúng nhưng không có lập luận, hoặc chỉ làm theo đề bài mà không tự phân tích |
| 0–2 | Không có bảng quyết định |

> **Lưu ý chấm**: kết luận **khác** gợi ý trong đề vẫn được điểm tối đa nếu lập luận vững và nhóm lan truyền đúng theo nhánh mình chọn. Chấm tư duy, không chấm sự trùng khớp.

### A2. Chất lượng nội dung sửa/tạo (12 điểm)

| Điểm | Mô tả |
|---|---|
| 11–12 | Nội dung đặt **đúng tầng** (luật chung ở `QA_STANDARD.md`, quy trình ở skill, danh tính ở `AGENT.md`, dữ kiện ở `knowledge/`). Viết theo đúng khuôn mẫu, có `Format output`, có `Chốt chặn nghiệm thu` diễn đạt kiểm chứng được |
| 8–10 | Đúng tầng, đủ mục, nhưng chốt chặn nghiệm thu còn chung chung |
| 4–7 | Sai tầng ở một chỗ (ví dụ nhét luật chung vào skill), hoặc thiếu mục bắt buộc của khuôn mẫu |
| 0–3 | Còn placeholder `<…>` chưa thay, hoặc không theo khuôn mẫu |

### A3. Lan truyền điểm neo (12 điểm)

Chấm theo số điểm neo bắt buộc của từng đề (Đề 01 ít nhất, Đề 03 đủ sáu).

| Điểm | Mô tả |
|---|---|
| 11–12 | Đủ mọi điểm neo bắt buộc. Điểm không áp dụng đều có **lý do** cụ thể, không bỏ trống |
| 8–10 | Thiếu 1 điểm neo phụ (ví dụ `agent-doctor.js`) |
| 4–7 | Thiếu điểm neo chính: `AGENT.md` hoặc `WORKFLOW.md` hoặc `_system_map.json` |
| 0–3 | Chỉ sửa nội dung, không khai báo ở đâu cả |

> **Trừ thẳng 4 điểm** nếu tên skill khai trong `AGENT.md` không khớp tên file trên đĩa — đây là lỗi làm agent gọi sai skill.

### A4. Cổng nghiệm thu (6 điểm)

| Điểm | Mô tả |
|---|---|
| 6 | Cả 4 cổng `G1`–`G4` có **kết quả thật** dán vào biên bản. `agent:check` xanh. Có smoke lại luồng cũ |
| 4–5 | Chạy 2–3 cổng, có kết quả thật |
| 2–3 | Chỉ ghi "đã kiểm tra, OK" mà không có kết quả thật |
| 0–1 | Không chạy cổng nào |

> Riêng **Đề 04** bắt buộc có bằng chứng đã thử lại 3 câu lệnh cũ. Thiếu thì tối đa 3 điểm ở mục này.

---

## PHẦN B — Test case & Automation (45 điểm)

### B1. Chất lượng phân tích, Chặng 01–04 (10 điểm)

| Điểm | Mô tả |
|---|---|
| 9–10 | Bóc tách đủ Business Rule, không bịa rule ngoài nguồn. Ma trận rủi ro có lập luận. Viewpoint không chồng lấn. Test idea có lý do Giữ/Bỏ rõ ràng |
| 6–8 | Đủ file, nội dung đúng nhưng nông |
| 3–5 | Thiếu một chặng, hoặc có rule không dẫn được nguồn |
| 0–2 | Nhảy cóc, thiếu từ hai chặng trở lên |

### B2. Xử lý vòng `ASK` và tích luỹ tri thức (8 điểm)

**Đây là hạng mục phân loại rõ nhất giữa các nhóm.**

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
| 9–10 | Tái sử dụng POM có sẵn, không trùng lặp. Locator theo đúng thứ tự ưu tiên. **Không có `page.goto` nào ngoài `BasePage.open()`**. So tiền qua `parseMoney()`. `beforeEach` dọn trạng thái |
| 6–8 | Chạy được, đúng ràng buộc chính, nhưng có chỗ trùng lặp hoặc locator yếu |
| 3–5 | Vi phạm một ràng buộc cứng: dùng `page.goto` chuyển màn, hoặc dùng XPath tuyệt đối / class băm |
| 0–2 | Code không chạy được |

> **Trừ thẳng 5 điểm** nếu dùng `page.goto(<path>)` để chuyển màn — đây là ràng buộc đã ghi rõ ở ba nơi.

### B5. Thực thi & Bằng chứng (5 điểm)

| Điểm | Mô tả |
|---|---|
| 5 | Đủ số ca tối thiểu, chạy thật, `run_result.md` đầy đủ, mỗi ca `FAIL` có ảnh bằng chứng và giải trình nguyên nhân |
| 3–4 | Chạy thật nhưng thiếu ca, hoặc thiếu ảnh cho một số ca |
| 1–2 | Chỉ có code, chưa chạy |
| 0 | Không có phần automation |

> **Ca `FAIL` không bị trừ điểm** nếu nhóm giải trình được đó là lệch giữa tài liệu và hệ thống thật. Bị trừ khi `FAIL` mà không biết vì sao.

---

## PHẦN C — Trình bày & Báo cáo (15 điểm)

| Hạng mục | Điểm | Tiêu chí |
|---|---|---|
| `BAO-CAO.md` | 6 | Đủ 4 mục theo mẫu, số liệu khớp với file thật trong bài nộp |
| Cấu trúc bài nộp | 4 | Đúng cây thư mục quy định, không lẫn `node_modules/` hay `test-results/` |
| Trình bày 5 phút | 5 | Nói rõ nâng cấp gì, luồng thay đổi ra sao, trả lời được câu hỏi phản biện |

---

## ĐIỂM THƯỞNG (tối đa +10)

| Việc làm được | Thưởng |
|---|---|
| Phát hiện **lệch giữa tài liệu BA và hệ thống thật**, có dẫn chứng cụ thể ở cả hai phía | +3 mỗi phát hiện, tối đa +6 |
| Dùng chính thành quả Phần A vào Phần B (Đề 01 dùng trường mới trong test case · Đề 02 dùng skill chọn hồi quy · Đề 03 chạy `a11y-audit` · Đề 04 dùng runbook mới) | +3 |
| Chỉ ra được một điểm yếu **thật** của hệ thống Agent kèm đề xuất cải tiến cụ thể | +2 |
| Ca automation phát hiện lỗi thật của ứng dụng, không phải lỗi kịch bản | +2 |

---

## TRỪ ĐIỂM

| Vi phạm | Trừ |
|---|---|
| Tự ý **sửa tài liệu trong `INPUT/`** cho khớp hệ thống | −10 |
| Ghi kết quả kiểm tra là "OK" mà thực tế chưa chạy | −5 |
| Bịa Business Rule không có trong nguồn, không gắn `[GIẢ ĐỊNH]` | −5 mỗi rule, tối đa −10 |
| Sinh file rác ngoài `OUTPUT/` và `automation/` | −3 |
| Tên skill trong `AGENT.md` không khớp file thật | −4 |
| Dùng `page.goto(<path>)` để chuyển màn | −5 |

---

## Bảng chấm nhanh (in ra dùng khi chấm)

```
Nhóm: ____  Đề: ____

PHẦN A                                    Điểm      /40
  A1 Chất lượng quyết định                ____      /10
  A2 Chất lượng nội dung                  ____      /12
  A3 Lan truyền điểm neo                  ____      /12
  A4 Cổng nghiệm thu                      ____      /6

PHẦN B                                    Điểm      /45
  B1 Phân tích 01-04                      ____      /10
  B2 Vòng ASK & knowledge                 ____      /8
  B3 Test case 05-06                      ____      /12
  B4 Code automation                      ____      /10
  B5 Thực thi & bằng chứng                ____      /5

PHẦN C                                    Điểm      /15
  Báo cáo                                 ____      /6
  Cấu trúc bài nộp                        ____      /4
  Trình bày                               ____      /5

Thưởng  +____        Trừ  −____

TỔNG: ____ /100
```
