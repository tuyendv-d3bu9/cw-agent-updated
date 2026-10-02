---
name: gen-daily-summary
description: >
  Chuyển đổi dữ liệu sprint thô ở dạng JSON thành Daily QA Summary chuẩn hóa 4 section cố định
  (Tiến độ hôm nay, Outstanding Issues, Blocker, Next Action) cho đối tượng Dev hoặc PM.
---

# Skill: gen-daily-summary

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT standard).
>
> **Skill = LÀM THẾ NÀO.** Quy trình + tham số + format output 4 section. Tái dùng được.
> KHÔNG chứa danh tính/quyền hạn (đó là `AGENT.md`), KHÔNG nhắc lại ràng buộc chung (đó là `qa-system/core/QA_STANDARD.md`).

## Mục đích
Chuyển đổi dữ liệu sprint thô ở dạng JSON thành một Daily QA Summary chuẩn hóa gồm đúng 4 section cố định, được trình bày phù hợp với đối tượng độc giả mục tiêu (`dev` hoặc `pm`), đảm bảo 100% số liệu đối soát trực tiếp từ nguồn và tuân thủ tuyệt đối chuẩn FACT (không bịa số liệu, không nhận định cảm tính, không tự suy diễn blocker hay nhiệm vụ).

## Tham số
- `sprint_data_path`: Đường dẫn file dữ liệu sprint dạng JSON. Bắt buộc.
  **Hình dáng bắt buộc của file này**: [`qa-system/templates/sprint-data.example.json`](../../templates/sprint-data.example.json).
  Chưa có file ⇒ chép template ra `OUTPUT/<slug>/reports/sprint_data_<YYYY-MM-DD>.json` và điền
  từ `runs/<RUN-ID>/run_result.md` + `jira_defects_summary.md`. **Không tự bịa cấu trúc.**
- `audience`: Đối tượng đọc báo cáo, nhận một trong hai giá trị hợp lệ:
  - `dev`: Trình bày thiên về kỹ thuật, giữ nguyên Bug ID, Test Case ID, chi tiết lỗi và các thông số cụ thể.
  - `pm`: Tập trung vào tiến độ, rủi ro tổng quát và vấn đề cần quyết định; gộp chi tiết kỹ thuật ở mức feature, hạn chế tối đa jargon kỹ thuật nhưng bảo toàn bản chất dữ liệu.
  - **RÀNG BUỘC ĐẶC BIỆT**: Tham số này là BẮT BUỘC. Nếu người dùng không truyền hoặc truyền giá trị ngoài `dev` / `pm`, skill **BẮT BUỘC DỪNG LẠI HỎI NGƯỜI DÙNG (Verdict: `ASK`)**, tuyệt đối không được tự ý chọn ngầm.

## Đầu vào
- File sprint data JSON hợp lệ tại `<sprint_data_path>`.
- Tham số `audience` được xác nhận rõ ràng (`dev` hoặc `pm`).

> Nếu thiếu file dữ liệu JSON hoặc không truyền `audience` → DỪNG LẠI với `Verdict: ASK` và yêu cầu cung cấp đầy đủ thông tin, không tự tưởng tượng nội dung hoặc tự chọn đối tượng đọc.

## KHÔNG được (riêng skill này)
- **KHÔNG tự bịa hoặc thay đổi bất kỳ con số nào**: Mọi số liệu như `executed`, `passed`, `failed`, `blocked`, số lượng bug, và pass rate phải có thể đối chiếu ngược trực tiếp 100% về file JSON nguồn.
- **KHÔNG đưa nhận định cảm tính vượt quá dữ liệu**: Tuyệt đối không đưa ra các phán đoán như "chất lượng sprint rất tốt", "hệ thống kém ổn định", "tiến độ khả quan". Chỉ mô tả thuần túy số liệu, trạng thái và các rủi ro có thể quan sát trực tiếp từ dữ liệu.
- **KHÔNG tự tạo Blocker hoặc suy diễn Blocker**: Chỉ ghi nhận vấn đề là Blocker khi trong JSON có dữ liệu xác định rõ ràng là blocker (ví dụ: cờ `is_blocker: true`, thuộc tính `blockers`, hoặc trạng thái blocked được mô tả trực tiếp là blocker). Nếu JSON không cung cấp đủ dữ liệu xác định → ghi rõ `Không có blocker được ghi nhận trong dữ liệu sprint`.
- **KHÔNG tự thêm task, người thực hiện hoặc kế hoạch không tồn tại trong JSON**: Tại section `⏭ Next Action`, chỉ liệt kê những task và người phụ trách được nêu cụ thể trong dữ liệu JSON. Nếu không có thông tin người phụ trách → chỉ ghi nhận task và để người phụ trách là `(chưa phân công trong dữ liệu)`.
- **KHÔNG tự chọn `audience`**: Khi người dùng không truyền tham số `audience`, không được tự tiện mặc định thành `dev` hoặc `pm`.
- **KHÔNG làm thay đổi bản chất dữ liệu khi điều chỉnh cho `pm`**: Khi gộp chi tiết lỗi theo mức feature cho PM, phải giữ đúng số lượng bug, mức độ nghiêm trọng và nguyên nhân cốt lõi từ dữ liệu gốc.

---

## Cấu Trúc 4 Section Chuẩn Hóa Bắt Buộc

Daily QA Summary bắt buộc phải chứa đúng 4 section sau đây theo đúng thứ tự:

### 1. `Tiến độ hôm nay`
- Thể hiện các chỉ số thực thi: `Executed`, `Passed`, `Failed`, `Blocked`.
- Liệt kê danh sách các tính năng (`Features` / `Modules`) đã cover trong ngày.
- **Pass Rate**: Tự động tính toán theo công thức bắt buộc:
  $$\text{Pass Rate} = \frac{\text{passed}}{\text{executed}} \times 100\%$$
  - Bắt buộc ghi rõ ràng cách tính và phép tính cụ thể: `Pass Rate = passed / executed = <passed> / <executed> = <tỷ_lệ>%`.
  - Guard chia cho 0: Nếu `executed == 0`, ghi rõ `0% (0/0 test cases executed)` để tránh lỗi chia cho 0.
- Tất cả số liệu phải khớp chính xác với JSON.

### 2. `Outstanding Issues`
- Liệt kê các bug chưa fix (Open, In Progress, Reopened), đang verify (Ready for QA, In QA) hoặc các vấn đề bị blocked kèm `Severity` (nếu thông tin có trong JSON).
- **Phân hóa theo Audience**:
  - **Với `audience = dev`**:
    - Giữ nguyên Bug ID (ví dụ: `BUG-102`, `JIRA-405`), Test Case ID liên quan (`TC-012`).
    - Ghi chi tiết lỗi kỹ thuật: thông báo lỗi, endpoint, step gây lỗi, môi trường cụ thể nếu có.
  - **Với `audience = pm`**:
    - Gộp các chi tiết kỹ thuật thành mức feature/module hoặc vấn đề tổng quát.
    - Hạn chế thuật ngữ chuyên sâu (jargon kỹ thuật như stack trace, memory leak, null pointer) thành mô tả ảnh hưởng chức năng dễ hiểu.
    - Không làm mất số lượng bug hoặc làm sai lệch bản chất dữ liệu.

### 3. `Blocker`
- Nêu rõ các vấn đề đang trực tiếp chặn đứng tiến độ kiểm thử hoặc phát triển, cùng hành động (`Action`) cần thực hiện ngay lập tức để giải phóng điểm nghẽn.
- Nếu không có dữ liệu blocker trong JSON: Ghi rõ ràng `Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.` Tuyệt đối không suy diễn bug thường thành blocker.

### 4. `⏭ Next Action`
- Thể hiện kế hoạch tiếp theo cho ngày làm việc tiếp theo.
- Bao gồm: Ai sẽ làm gì (`Task` + `Người phụ trách / Assignee`) nếu thông tin người phụ trách có trong JSON.
- Nếu JSON không có thông tin người phụ trách: Ghi rõ `(chưa chỉ định người phụ trách trong dữ liệu)`. Không được tự bịa tên nhân sự hay tự nghĩ ra task ngoài JSON.

---

## Các Bước Thực Hiện

### Bước 1: Tiếp nhận và xác thực đầu vào (Input Validation & Audience Gate)
1. Kiểm tra tham số `sprint_data_path`: Đọc nội dung file JSON. Nếu file không tồn tại hoặc lỗi cú pháp JSON ➔ Trả về `Verdict: ASK` yêu cầu cung cấp file hợp lệ.
2. Kiểm tra tham số `audience`:
   - Nếu `audience` rỗng hoặc không thuộc `['dev', 'pm']`:
     - **DỪNG LẠI NGAY LẬP TỨC**.
     - Đưa ra phản hồi yêu cầu người dùng xác nhận đối tượng: *"Vui lòng chọn đối tượng đọc báo cáo (audience): `dev` (Kỹ thuật/Chi tiết) hoặc `pm` (Tiến độ/Tổng quan rủi ro)."*
     - Đặt `Verdict: ASK`.
3. Bóc tách các trường dữ liệu trong JSON:
   - Thông tin sprint: Tên sprint, ngày báo cáo, dự án.
   - Thống kê test execution: `executed`, `passed`, `failed`, `blocked`, danh sách feature.
   - Danh sách defect/issue: ID, title, status, severity, feature/module, technical details, related test cases.
   - Danh sách blocker (nếu có): mô tả, tác động, action cần thiết.
   - Kế hoạch kế tiếp (nếu có): task, assignee, target date.

### Bước 2: Tính toán chỉ số & Xử lý logic
1. Tính `Pass Rate`:
   - Lấy số `passed` và `executed` từ JSON.
   - Kiểm tra `executed > 0`: `pass_rate_percent = ((passed / executed) * 100).toFixed(2)` (hoặc làm tròn 1 chữ số thập phân nếu chia hết).
   - Thiết lập chuỗi diễn giải: `pass_rate_formula = passed / executed = ${passed} / ${executed} = ${pass_rate_percent}%`.
   - Nếu `executed === 0`: Chuỗi diễn giải `0% (0 / 0 test cases executed)`.
2. Phân loại Outstanding Issues:
   - Lọc các issue có trạng thái chưa hoàn tất (`Open`, `In Progress`, `Reopened`, `In QA`, `Blocked`...).
   - Nếu `audience == 'dev'`: Giữ cấu trúc bảng chi tiết với cột `Bug ID`, `Feature`, `Severity`, `Trạng thái`, `Chi tiết kỹ thuật / Test Case ID`.
   - Nếu `audience == 'pm'`: Nhóm issues theo `Feature / Nhóm chức năng`, mô tả tóm tắt tác động nghiệp vụ, giữ nguyên số lượng bug và mức độ severity tương ứng.
3. Xác định Blocker:
   - Chỉ trích xuất các item được định danh là blocker trong JSON.
   - Nếu mảng blocker rỗng hoặc không tồn tại: Đánh dấu `Không có blocker`.
4. Bóc tách Next Action:
   - Trích xuất danh sách công việc tiếp theo từ trường tương ứng trong JSON.
   - Ánh xạ rõ ràng Task ↔ Assignee (nếu có).

### Bước 3: FACT Self-Audit (Tự đối soát trước khi xuất file)
Thực hiện checklist đối chiếu 100% với JSON:
- [ ] **Factual (Trung thực số liệu)**:
  - Giá trị `executed` trong báo cáo có bằng đúng JSON không?
  - Giá trị `passed`, `failed`, `blocked` có khớp từng đơn vị không?
  - Tổng số bug trong Outstanding Issues có đúng bằng số bug chưa hoàn tất trong JSON không?
  - Không có blocker hay task nào bị tự suy diễn thêm?
- [ ] **Accurate (Độ chính xác)**:
  - Công thức tính Pass Rate có ghi rõ `passed / executed` kèm các giá trị thành phần không?
  - Kết quả phép tính phần trăm có chính xác về mặt số học không?
  - Các mã định danh (`Bug ID`, `TC-xx`) và tên feature có viết đúng nguyên văn không?
- [ ] **Complete (Đầy đủ cấu trúc)**:
  - Đủ đúng 4 section cố định: `Tiến độ hôm nay`, `Outstanding Issues`, `Blocker`, `⏭ Next Action`?
  - Có mục Human-Final Review Checklist ở cuối file không?
- [ ] **Testable (Khách quan & Kiểm chứng được)**:
  - Có nhận định cảm tính nào ("chất lượng tốt", "chất lượng xấu") bị lọt vào văn bản không? Nếu có, loại bỏ ngay.

### Bước 4: Xuất bản file Markdown
1. Tạo thư mục `OUTPUT/reports/` (nếu chưa tồn tại).
2. Ghi file báo cáo ra đường dẫn:
   ```
   OUTPUT/reports/daily-summary-<audience>.md
   ```
   *(với `<audience>` là `dev` hoặc `pm`)*.
3. Thông báo kết quả kèm bản tóm tắt ngắn gọn và nhắc nhở Human-Final review đặc biệt lưu ý section `Blocker`.

---

## Format Output Chuẩn

Ghi ra file `OUTPUT/reports/daily-summary-<audience>.md`:

````markdown
# DAILY QA SUMMARY · <Tên Sprint / Ngày>
Owner: qa-system/qa-reporter/gen-daily-summary · Audience: <dev | pm> · Nguồn: <sprint_data_path> · Verdict: <PASS | ASK>

---

## 1. Tiến độ hôm nay

### Chỉ số thực thi kiểm thử:
| Chỉ số | Số lượng | Ghi chú |
|---|---|---|
| **Executed** | <số lượng executed> | Test case đã thực hiện |
| **Passed** | <số lượng passed> | Test case đạt yêu cầu |
| **Failed** | <số lượng failed> | Test case phát hiện lỗi |
| **Blocked** | <số lượng blocked> | Test case bị chặn |

- **Pass Rate**: `<passed>/<executed>` = **<tỷ_lệ>%**  
  *(Công thức: `Pass Rate = (passed / executed) * 100% = <passed> / <executed> = <tỷ_lệ>%`)*
- **Phạm vi tính năng đã cover**: <Liệt kê các feature/module đã test từ JSON>

---

## 2. Outstanding Issues

<!-- NẾU AUDIENCE LÀ DEV: -->
| Bug ID | Test Case ID | Feature | Severity | Trạng thái | Chi tiết kỹ thuật |
|---|---|---|---|---|---|
| <ID> | <TC-ID> | <Feature> | <Severity> | <Status> | <Mô tả kỹ thuật/endpoint/log> |

<!-- NẾU AUDIENCE LÀ PM: -->
| Feature / Nhóm chức năng | Số lượng bug | Mức độ nghiêm trọng | Trạng thái tổng quát | Tác động tiến độ / nghiệp vụ |
|---|---|---|---|---|
| <Feature> | <Số lượng> | <Liệt kê severity: Critical, Major...> | <Status> | <Mô tả ảnh hưởng chức năng (không dùng jargon)> |

---

## 3. Blocker

<!-- Trường hợp CÓ blocker trong JSON: -->
- **Vấn đề chặn**: <Mô tả trực tiếp vấn đề blocker từ JSON>
- **Tác động**: <Mô tả tác động đến tiến độ kiểm thử/phát hành>
- **Action cần xử lý ngay**: <Hành động giải tỏa blocker từ JSON>

<!-- Trường hợp KHÔNG có blocker trong JSON: -->
*Không ghi nhận blocker nào trong dữ liệu sprint hiện tại.*

> ⚠️ **LƯU Ý HUMAN-FINAL REVIEW**: Section Blocker có thể kích hoạt các quyết định và hành động can thiệp tức thì từ phía PM / Lead. Đề nghị người duyệt đối chiếu kỹ lưỡng trước khi phát hành.

---

## 4. ⏭ Next Action

| Nhiệm vụ tiếp theo | Người phụ trách | Thời hạn / Ghi chú |
|---|---|---|
| <Task cụ thể từ JSON> | <Tên người phụ trách từ JSON hoặc "(chưa phân công trong dữ liệu)"> | <Ghi chú từ JSON> |

---

## 5. Human-Final Review Checklist (Trước khi gửi cho Team)
- [ ] **Số liệu thực thi**: Xác nhận đã đối chiếu các số Executed, Passed, Failed, Blocked với dashboard thực tế.
- [ ] **Công thức Pass Rate**: Xác nhận phép tính `passed / executed` chính xác.
- [ ] **Blocker (ĐẶC BIỆT QUAN TRỌNG)**: PM / QA Lead đã duyệt tính chính xác của các điểm chặn và hành động đề xuất.
- [ ] **Next Action**: Đã xác nhận người phụ trách các đầu việc tiếp theo.
- [ ] **Phê duyệt phát hành**: [ ] SẴN SÀNG GỬI / [ ] CẦN CẬP NHẬT
````

---

## Ghi Knowledge
Không ghi knowledge (chỉ đọc dữ liệu sprint thô để tổng hợp báo cáo).

---

## Chốt Chặn Nghiệm Thu (Quality Gates)
- [ ] File output bắt buộc ghi tại `OUTPUT/reports/daily-summary-<audience>.md`.
- [ ] Nếu không có tham số `audience`, skill bắt buộc dừng lại hỏi người dùng (Verdict: `ASK`), không tự chọn.
- [ ] Đủ đúng 4 section cố định: `Tiến độ hôm nay`, `Outstanding Issues`, `Blocker`, `⏭ Next Action`.
- [ ] Pass Rate ghi rõ công thức `passed / executed` và kết quả tính toán chính xác, có guard cho trường hợp mẫu số bằng 0.
- [ ] Nội dung phân hóa đúng chuẩn cho `dev` (giữ ID, chi tiết kỹ thuật) và `pm` (mức feature, hạn chế jargon, giữ nguyên bản chất).
- [ ] Section Blocker không bị suy diễn; ghi rõ nếu không có blocker trong JSON.
- [ ] Section Next Action không bị tự bịa task hay nhân sự ngoài JSON.
- [ ] 100% số liệu đối chiếu khớp hoàn toàn với file JSON nguồn.
- [ ] Tuyệt đối không chứa nhận định cảm tính chủ quan ("tốt/xấu").
