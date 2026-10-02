# QA STANDARD — Spine dùng chung

> Mọi `AGENT.md` và `skills/*.md` trong `agents/qa-*/` đều tuân thủ file này.
> Ràng buộc chung CHỈ nằm ở đây — skill không nhắc lại.
> Frameworks: RCTFC (Role-Context-Task-Format-Constraint) · FACT (Factual-Accurate-Complete-Testable).

---

## 1. Verdict — PASS / FIX / ASK (Cơ Chế Bức Tường Thép — Hard Stop Gate)

| Verdict | Khi nào | Cách xử lý | Trạng thái Pipeline |
|---|---|---|---|
| **PASS** | Đủ thông tin và đạt checklist | Ghi nhận đạt | Mở khóa (Unlock) cho chặng kế tiếp |
| **FIX** | Đủ thông tin nhưng sai format / trace / consistency | Viết bản sửa cụ thể | Dừng bước hiện tại để sub-agent tự sửa ngay |
| **ASK** | Thiếu thông tin / cần nghiệp vụ / rule treo / hổng 06W | Chuyển người quyết, ghi rõ cần ai + cần thông tin gì | **HARD STOP PHONG TỎA**: Đóng băng toàn bộ pipeline, cấm nhảy cóc sang chặng sau |

> ⛔ **NGUYÊN TẮC BẤT DI BẤT DỊCH VỚI VERDICT `ASK`**:
> 1. Khi một bước ra kết luận `ASK`, Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC** tự động làm tiếp các chặng sau (Viewpoint, Test Idea, Test Case...).
> 2. Nếu User quên trả lời, nói chung chung, hoặc giục làm tiếp (*"cứ làm tiếp đi"*, *"bỏ qua đi"*), Agent **BẮT BUỘC PHẢI TỪ CHỐI** và giải thích rõ: test case sinh ra từ logic hổng sẽ là ảo giác 100%.
> 3. Cổng chỉ được mở khóa khi User trả lời cụ thể hoặc chốt quyết định rõ ràng vào Mục 8 của file feature knowledge.
> 4. **Cổng này được thi hành bằng máy, không chỉ bằng lời.** Trước khi sinh deliverable từ
>    Chặng 3 trở đi, Agent **bắt buộc** chạy `npm run gate <slug>` (exit `1` ⇒ DỪNG). Trong
>    Claude Code còn có hook `PreToolUse` chặn thẳng thao tác ghi file. Chi tiết: `AGENTS.md` §1.6.1.
>    Khi User giục làm tiếp, **đừng tranh luận suông** — chạy lệnh và dán kết quả thật.

**Ngoại lệ** — skill `coverage-review`: rà đủ 3 góc nhìn mà KHÔNG thấy gap nào thì kết luận
`ASK` (bắt buộc nghi ngờ bỏ sót, không tự quyết `PASS`). `PASS` chỉ xuất hiện khi có xác nhận
chính thức chấp nhận rủi ro từ người phụ trách kèm lý do kinh doanh.

---

## 2. Guard chung — áp cho mọi skill

1. **Factual** — chỉ kết luận dựa trên artifact đầu vào được cung cấp. Không tự chế rule /
   requirement / test case ngoài nguồn. Không giả định dữ liệu không được cung cấp.
2. **Không quota cứng** — dùng ngôn ngữ định tính ("đủ theo bản chất nghiệp vụ", "toàn bộ … áp
   dụng được"). Không ép chỉ tiêu số lượng kiểu "≥5 viewpoint", "đúng 10 test case".
   *Ngoại lệ duy nhất*: skill `01` yêu cầu tối thiểu 5 Open Questions (ngưỡng chất lượng có chủ đích).
3. **`[GIẢ ĐỊNH]`** — mọi phát biểu không có căn cứ trực tiếp trong tài liệu đầu vào bắt buộc gắn
   tiền tố `[GIẢ ĐỊNH]` kèm lý do. Tuyệt đối không âm thầm suy diễn.
4. **Traceability** — mọi item sinh ra (rule, gap, viewpoint, test idea, test case, record data)
   phải trace được về nguồn cụ thể (mã `BR-xx` / `MR-xx` / mục tài liệu), hoặc ghi rõ
   `"Chưa đề cập trong tài liệu"`. Cấm kết luận chung chung không gắn mã.
5. **Chống Scope Creep** — không làm việc của bước sau. Mỗi skill có ranh giới riêng ghi ở
   mục "KHÔNG được" của skill đó.
6. **Không ghi đè nguồn** — không sửa `INPUT/` và deliverable của agent khác. Không tự đổi
   trạng thái workflow.
7. **Không để trống ô bảng** — thiếu dữ liệu thì điền nhãn tường minh
   (`CHƯA COVER`, `CHƯA CÓ DATA`, `[CONTEXT_MISSING]`, `Không phát hiện vấn đề qua #Wx`).

---

## 3. FACT Self-Audit — chạy trước khi xuất kết quả

| | Tiêu chuẩn | Câu hỏi tự kiểm |
|---|---|---|
| **F** | Factual | Mọi phát biểu có bám tài liệu gốc không? Chỗ không có căn cứ đã gắn `[GIẢ ĐỊNH]` / `[CONTEXT_MISSING]` chưa? |
| **A** | Accurate | Diễn đạt chính xác, một nghĩa, không mơ hồ, không đa nghĩa? Mã/tên lấy đúng nguyên văn nguồn? |
| **C** | Complete | Đủ cấu trúc output quy định? Đủ các trường bắt buộc? Không bỏ sót nhánh nghiệp vụ áp dụng được? |
| **T** | Testable | Mọi item có tiêu chí kiểm chứng để phân định Pass/Fail? Không dùng từ ngữ cảm tính? |

Cả 4 tiêu chí bắt buộc PASS. Tiêu chí nào FAIL → sửa trước khi xuất, không xuất kèm ghi chú "chưa đạt".

---

## 4. Kỹ thuật 06W

> Đây là **định nghĩa duy nhất** của 06W trong repo. Mã `W1…W6` dùng để trace; **tên** không
> được đổi. Cột "Trọng tâm kiểm tra" là gợi ý mở — skill được phép mở rộng theo đặc thù feature.

| # | Tên (chuẩn — không đổi) | Trọng tâm kiểm tra (mở rộng được) |
|---|---|---|
| **W1** | What if input lạ | Sai định dạng · quá dài · ký tự đặc biệt · rỗng/null · hoa-thường · khoảng trắng thừa · giá trị ngoài khoảng cho phép |
| **W2** | What if state lạ | Trạng thái hệ thống/tài khoản chưa xử lý · tiền điều kiện thiếu · session/quyền thay đổi giữa chừng · thao tác lặp trên trạng thái đã có |
| **W3** | What if data lạ | Dữ liệu nền edge case · dữ liệu bẩn · mâu thuẫn giữa các nguồn tài liệu · giá trị biên nghiệp vụ · quy tắc làm tròn/ép kiểu |
| **W4** | What when timing | Hết hạn giữa chừng · đồng thời/concurrent · timeout · timezone · thứ tự trước–sau · re-validate tại thời điểm chốt |
| **W5** | Who else actor | Actor khác kích hoạt cùng flow · phân quyền · phụ thuộc module/service/bên thứ ba · tác động chéo tới dữ liệu khác |
| **W6** | What happens after | Side-effect sau hành động · trạng thái thay đổi · rollback/undo/hoàn tác · kỳ vọng ngầm về UX, bảo mật, toàn vẹn dữ liệu |

Quét đủ W1→W6. Câu hỏi nào không ra vấn đề vẫn phải ghi
`"Không phát hiện vấn đề qua câu hỏi #W[X]"` — không được bỏ trống.

> **Ranh giới với §6**: chuỗi biên min/max của một field thuộc §6 (Boundary Completeness),
> không lặp lại thành một câu hỏi W riêng. W3 chỉ hỏi *dữ liệu nền có gì lạ*, không liệt kê biên.

---

## 5. Ma trận rủi ro 3x3

**Risk Level = Likelihood × Impact**, mỗi trục 3 mức `HIGH / MED / LOW`.

| | Impact HIGH | Impact MED | Impact LOW |
|---|---|---|---|
| **Likelihood HIGH** | CRITICAL | HIGH | MEDIUM |
| **Likelihood MED** | HIGH | MEDIUM | LOW |
| **Likelihood LOW** | MEDIUM | LOW | LOW |

**Severity** phải phản ánh đủ 5 yếu tố: Business Impact · User Impact · Revenue Impact ·
Operational Impact · Usage Scale. Thiếu dữ liệu để xác định → gắn `[SEVERITY_CONFIDENCE_LOW]`
kèm lý do cụ thể. Cấm đánh Severity chỉ dựa trên tài liệu Requirement đơn thuần.

---

## 6. Chuỗi biên chuẩn (Boundary Completeness)

Field có **khoảng giá trị (min/max)** → phủ đủ: `min-1` · `min` · `min+1` · giá trị giữa ·
`max-1` · `max` · `max+1`. **Không được bỏ sót biên ngoài `min-1` và `max+1`.**

Field có **rule định dạng / độ dài** → phủ đủ: rỗng · 1 ký tự · đúng độ dài · quá độ dài ·
sai định dạng · ký tự đặc biệt.

Kèm các Equivalence Partition tương ứng: hợp lệ · dưới hạn · trên hạn · sai định dạng ·
rỗng/null · ký tự đặc biệt.

---

## 7. Quy ước Input / Output

**Input** — mỗi skill khai báo tên artifact cần nhận ở mục "Đầu vào". Thiếu artifact bắt buộc
→ DỪNG và yêu cầu cung cấp, không tự tưởng tượng nội dung.

**Output** — mỗi skill ghi kết quả ra **đúng một file**, không dồn nhiều bước vào một file lớn:

```
OUTPUT/<task-slug>/
  ├─ 01_requirement_risk_summary.md
  ├─ 02_missing_rule_report.md
  ├─ …
  └─ _index.md      # danh sách file đã sinh + verdict PASS/FIX/ASK từng bước
```

Lý do tách file: agent phía sau chỉ đọc file nó cần · dễ trace từng deliverable ·
dễ resume/checkpoint khi chạy lại · review được từng phần độc lập.

Mỗi file kết quả mở đầu bằng dòng meta:

```md
# <Tên deliverable>  ·  <task-slug>
Owner: <agent/skill> · Nguồn: <file đã đọc> · Verdict: <PASS/FIX/ASK>
```

Cuối file, nếu có, thêm 2 bảng:

```md
## FIX
| # | Vị trí | Vấn đề | Bản sửa đề xuất |
|---|---|---|---|

## ASK
| # | Vị trí | Cần gì | Chuyển cho ai |
|---|---|---|---|
```

---

## 8. Knowledge — tri thức nền

Knowledge có **3 loại**, mỗi loại một chỗ ở. Đừng trộn lẫn.

| Loại | Nội dung | Ở đâu | Ai ghi |
|---|---|---|---|
| **Registry / technique ổn định** | Không đổi theo dự án: 06W · risk matrix 3x3 · chuỗi biên · 8 viewpoint · 5 data class · checklist Giữ/Bỏ · 8 trường test case | Dùng bởi **≥2 skill** → file này. Dùng bởi **1 skill** → nội hoá trong skill đó | Người bảo trì agent |
| **Project knowledge** | Quy ước cả dự án, dùng cho mọi feature: format định danh, định dạng ngày/tiền, NULL vs rỗng, môi trường test, tool quản lý test | `knowledge/_project.md` | Con người, một lần rồi bổ sung dần |
| **Feature knowledge** | Dữ kiện của **một** tính năng: rule đã xác nhận, câu trả lời của BA, `[GIẢ ĐỊNH]` đã chốt, domain constant | `knowledge/features/<feature-slug>.md` (copy từ `knowledge/_template.md`) | Skill `01` và `02` ghi · người duyệt xác nhận |

### Luật đọc
Trước khi chạy, **mọi skill** đọc `knowledge/_project.md` và `knowledge/features/<feature-slug>.md` nếu có.
Thông tin trong đó **thắng** giả định của agent: đã có trong knowledge thì KHÔNG được gắn
`[GIẢ ĐỊNH]` hay `[CONTEXT_MISSING]` nữa. Không có file knowledge → chạy bình thường, chỉ là phải
giả định nhiều hơn.

### Luật ghi
- Chỉ skill `01` và `02` được ghi vào `knowledge/features/<feature-slug>.md`.
- Chỉ ghi vào mục 3 (Business Rules) những rule **đã xác nhận**. Rule còn treo để ở mục 7.
- Khi BA/PO trả lời một `[GIẢ ĐỊNH]` → chuyển xuống mục 8 (Giả định đã chốt) kèm ai chốt, ngày nào.
  Lần chạy sau agent dùng luôn kết luận đó, không giả định lại.
- Không xoá dòng cũ trong knowledge — đổi `Trạng thái` (`New` → `Confirmed` / `TREO` / `Rejected`).

### Phân biệt với `OUTPUT/`
`OUTPUT/` = **kết quả một lần chạy**, có thể bỏ đi và chạy lại.
`knowledge/` = **thứ tích luỹ được**, chạy lại vẫn còn. Mất `knowledge/` là mất công hỏi BA.
