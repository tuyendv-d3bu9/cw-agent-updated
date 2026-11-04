# QA STANDARD — Spine dùng chung

> Mọi `AGENT.md` và `skills/*.md` trong `qa-system/qa-*/` đều tuân thủ file này.
> Ràng buộc chung CHỈ nằm ở đây — skill và AGENT.md **trỏ tới**, không chép lại.
> Frameworks: RCTFC (Role-Context-Task-Format-Constraint) · FACT (Factual-Accurate-Complete-Testable).
>
> **Nguyên tắc gốc**: agent chỉ được **trích** (có nguồn) hoặc **hỏi** (thành câu hỏi cho BA/PO).
> Không được **sáng tác** giá trị, rule, thông báo, ngưỡng. Thiếu thì nói thiếu — nói thiếu là đạt chuẩn.

---

## 1. Verdict — PASS / FIX / ASK

| Verdict | Khi nào | Cách xử lý | Trạng thái Pipeline |
|---|---|---|---|
| **PASS** | Đủ thông tin và đạt checklist | Ghi nhận đạt | Mở chặng kế tiếp |
| **FIX** | Đủ thông tin nhưng sai format / trace / thiếu độ phủ **sửa được từ nguồn đang có** | Viết bản sửa cụ thể | Agent tự sửa ngay rồi chạy lại |
| **ASK** | Thiếu thông tin nghiệp vụ, chỉ người (BA/PO) trả lời được | Ghi câu hỏi theo schema §9.4, nêu cần ai | **Dừng pipeline** — cấm nhảy sang chặng sau |

Luật cổng `ASK` (định nghĩa duy nhất — nơi khác chỉ trỏ về đây):

1. Chặng 2 ra `ASK` ⇒ **không** sinh deliverable Chặng 3→6. Người dùng giục *"cứ làm tiếp"* cũng
   không mở được: giải thích rằng test case dựng trên logic chưa chốt sẽ phải đoán, rồi liệt kê câu hỏi treo.
2. Cổng chỉ mở khi mọi câu hỏi ở knowledge §7 có trạng thái `Confirmed` hoặc `Rejected` (§9.3)
   hoặc có quyết định ở knowledge §8 kèm người phê duyệt và ngày.
3. Cổng được **thi hành bằng máy**: trước khi sinh deliverable Chặng 3 trở đi, chạy `npm run gate <slug>`
   (exit `1` ⇒ dừng). Thiếu file `02` hoặc không đọc được verdict ⇒ cổng **đóng** (fail-closed).
   Khi người dùng giục làm tiếp, chạy lệnh và dán kết quả thật — đừng tranh luận suông.
4. Agent **không** tự điền câu trả lời, trạng thái `Confirmed`, hay quyết định §8 thay BA/PO.

**Verdict của `coverage-review` (Chặng 6)** — luật riêng, có điểm kết thúc:
- `PASS` — mọi mục trong ma trận độ phủ (BR, MR đã chốt, AF, TI "Giữ") đều có test case và
  `npm run lint` sạch. Phần quyết định của con người vẫn ghi ở mục Human-Final, không chặn verdict.
- `FIX` — còn mục chưa cover mà nguồn **đủ** để viết test case.
- `ASK` — còn mục chưa cover vì **thiếu** thông tin (kèm câu hỏi theo §9.4).

---

## 2. Guard chung — áp cho mọi skill

1. **Factual** — chỉ kết luận từ nguồn hợp lệ (§10.1). Không tự chế rule, giá trị, thông báo lỗi,
   mã phản hồi, ngưỡng, định dạng. Kiến thức chung về "ngành này thường làm thế" **không phải nguồn**.
2. **Không quota** — không ép số lượng ("≥5 câu hỏi", "≥X test case", "≥1 NULL"). Số lượng là hệ
   quả của nguồn, không phải chỉ tiêu.
3. **Nhãn khi thiếu** — dùng đúng bộ nhãn §2.1. Gắn nhãn tường minh luôn tốt hơn lấp chỗ trống.
4. **Traceability** — mọi item (rule, câu hỏi, viewpoint, test idea, test case, record data) có cột
   hoặc tag nguồn theo §9. Không gắn được nguồn ⇒ item đó là câu hỏi, không phải dữ kiện.
5. **Chống Scope Creep** — không làm việc của bước sau (mục "KHÔNG được" của từng skill).
6. **Không ghi đè nguồn** — không sửa `INPUT/` và deliverable của agent khác.
7. **Không để trống ô bảng** — điền nhãn §2.1.
8. **Out of Scope = loại trừ tường minh** — chỉ những gì nguồn **nói rõ** là không làm, kèm trích
   nguồn. Điều tài liệu **không nhắc tới** là **câu hỏi**, không phải ngoài phạm vi.

### 2.1. Bộ nhãn chuẩn

| Nhãn | Dùng khi | Ví dụ |
|---|---|---|
| `[CHƯA CÓ TRONG TÀI LIỆU]` | Cần một giá trị cụ thể (chữ thông báo, số, mã lỗi, định dạng) mà nguồn không có. Có câu hỏi rồi thì kèm mã: `[CHƯA CÓ TRONG TÀI LIỆU – MR-03]` — mã MR phải là câu hỏi có thật ở 02 §3 hoặc knowledge §7 (lint kiểm) | Expected: `Hiển thị thông báo lỗi [CHƯA CÓ TRONG TÀI LIỆU – MR-03]` |
| `[GIẢ ĐỊNH]` | Một suy luận của agent, kèm lý do. **Không** dùng để bịa giá trị cụ thể, và **cấm** trong ô giá trị (Precondition, Test Steps, Test Data, Expected Result) — lint báo lỗi; ở đó dùng `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` | `[GIẢ ĐỊNH] Field này không có vòng đời trạng thái vì tài liệu chỉ mô tả nhập liệu` |
| `[CONTEXT_MISSING]` | Thiếu bối cảnh kinh doanh (người dùng, tải, doanh thu, SLA) | Ô Usage Context của skill 01 |
| `[ĐỀ XUẤT]` | Agent đề nghị, chờ người duyệt (Human-Final) | `[ĐỀ XUẤT] Automated` |
| `CHƯA COVER` / `CHƯA CÓ DATA` | Ô ma trận chưa có test case / dữ liệu | Ma trận Chặng 6, Chặng 12 |

---

## 3. FACT Self-Audit — chạy trước khi xuất kết quả

| | Tiêu chuẩn | Câu hỏi tự kiểm |
|---|---|---|
| **F** | Factual | Mọi giá trị/rule có nguồn §10.1 không? Chỗ không có đã gắn nhãn §2.1 chưa? Có giá trị nào "nghe hợp lý" nhưng không trích được không? |
| **A** | Accurate | Diễn đạt một nghĩa? Mã/tên/chữ thông báo lấy **đúng nguyên văn** nguồn? |
| **C** | Complete | Đủ cấu trúc và trường bắt buộc? Không sót nhánh nghiệp vụ **có trong nguồn**? |
| **T** | Testable | Mọi item có tiêu chí phân định Pass/Fail, hoặc có nhãn chỉ rõ phần tiêu chí còn thiếu? |

**Thiếu nguồn mà đã gắn nhãn tường minh ⇒ F và C vẫn ĐẠT.** Lấp chỗ trống bằng giá trị tự chế ⇒
F **TRƯỢT** dù trông đầy đủ. Tiêu chí trượt thì sửa trước khi xuất.

---

## 4. Kỹ thuật 06W

> Định nghĩa duy nhất của 06W. Mã `W1…W6` dùng để trace; **tên** không được đổi.

| # | Tên (chuẩn — không đổi) | Trọng tâm kiểm tra |
|---|---|---|
| **W1** | What if input lạ | Sai định dạng · quá dài · ký tự đặc biệt · rỗng/null · hoa-thường · khoảng trắng thừa · ngoài khoảng cho phép |
| **W2** | What if state lạ | Trạng thái chưa xử lý · tiền điều kiện thiếu · session/quyền đổi giữa chừng · thao tác lặp trên trạng thái đã có |
| **W3** | What if data lạ | Dữ liệu nền edge case · dữ liệu bẩn · mâu thuẫn giữa các nguồn · quy tắc làm tròn/ép kiểu |
| **W4** | What when timing | Hết hạn giữa chừng · đồng thời · timeout · timezone · thứ tự trước–sau · re-validate tại thời điểm chốt |
| **W5** | Who else actor | Actor khác cùng flow · phân quyền · phụ thuộc module/service/bên thứ ba · tác động chéo dữ liệu |
| **W6** | What happens after | Side-effect · trạng thái thay đổi · rollback/hoàn tác · kỳ vọng ngầm về bảo mật, toàn vẹn dữ liệu |

**Cách quét — ma trận đóng** (để cùng tài liệu cho cùng bộ câu hỏi):
quét **từng đối tượng** (mỗi `BR-xx`, mỗi `FD-xx`, mỗi `AF-xx`) × **W1→W6**. Mỗi ô nhận đúng một
kết quả: `Có kẽ hở` (⇒ sinh một `MR-xx`) · `Nguồn đã trả lời` (ghi mã nguồn) · `Không áp dụng`.
Câu hỏi chỉ sinh từ ô `Có kẽ hở`. Quét xong ma trận là **dừng** — không tìm thêm ngoài ma trận.

**Bảng áp dụng** (cố định, để số ô cần phán đoán không do model quyết). Ô ngoài bảng mặc định `Không áp dụng` và
**không sửa**; `npm run scaffold -- <slug> 02` dựng sẵn khung theo bảng này.

| Đối tượng | W cần phán đoán | W cố định `Không áp dụng` |
|---|---|---|
| `BR-xx` | W1 W2 W3 W4 W5 W6 | — |
| `FD-xx` | W1 W3 | W2 W4 W5 W6 (kẽ hở về trạng thái/thời gian/actor/hậu quả nằm ở `BR`/`AF` liên quan) |
| `AF-xx` | W2 W6 | W1 W3 W4 W5 |

> Chuỗi biên min/max của một field thuộc §6, không lặp thành câu hỏi W riêng.

---

## 5. Ma trận rủi ro 3x3

**Risk Level = Likelihood × Impact**, mỗi trục `HIGH / MEDIUM / LOW`.

| | Impact HIGH | Impact MEDIUM | Impact LOW |
|---|---|---|---|
| **Likelihood HIGH** | CRITICAL | HIGH | MEDIUM |
| **Likelihood MEDIUM** | HIGH | MEDIUM | LOW |
| **Likelihood LOW** | MEDIUM | LOW | LOW |

- **Likelihood** chấm từ chính tài liệu: số điều kiện ghép, số nhánh, số kẽ hở `MR` liên quan.
- **Impact** chấm từ tác động **tài liệu mô tả** (mất tiền, sai dữ liệu, chặn luồng chính…).
- Bối cảnh kinh doanh (doanh thu, quy mô, SLA) chỉ dùng khi có trong nguồn hoặc `_project.md` đã khai.
  Không có ⇒ vẫn chấm từ tài liệu, gắn `[SEVERITY_CONFIDENCE_LOW]` + ghi khía cạnh thiếu là `[CONTEXT_MISSING]`.
  **Không** ước đoán con số doanh thu, lượt dùng.

---

## 6. Chuỗi biên chuẩn (Boundary Completeness)

> Định nghĩa duy nhất — skill dữ liệu và coverage-review dùng đúng chuỗi này.

Field có **khoảng giá trị (min/max)** → 7 điểm: `min-1` · `min` · `min+1` · giá trị giữa ·
`max-1` · `max` · `max+1`.

Field có **rule định dạng / độ dài** → rỗng · 1 ký tự · đúng độ dài · quá độ dài · sai định dạng · ký tự đặc biệt.

Kèm Equivalence Partition: hợp lệ · dưới hạn · trên hạn · sai định dạng · rỗng/null · ký tự đặc biệt.

**Chỉ dựng chuỗi biên khi min/max/độ dài có trong nguồn.** Không có ⇒ không tự đặt ngưỡng:
ghi `[CHƯA CÓ TRONG TÀI LIỆU – MR-xx]` và để Chặng 2 hỏi.

---

## 7. Quy ước Input / Output

**Input** — mỗi skill khai "Đầu vào". Ngoài danh sách đó, **mọi skill luôn nạp**:
`knowledge/_project.md` và `knowledge/features/<slug>.md` (§8). Thiếu artifact bắt buộc → DỪNG.

**Output** — mỗi skill ghi **đúng một** file trong `OUTPUT/<task-slug>/`. Dòng thứ 2 của mọi file
là **dòng meta**, viết thường (không in đậm, không backtick), đúng một verdict:

```md
# <Tên deliverable> · <task-slug>
Owner: <agent/skill> · Nguồn: <file đã đọc> · Verdict: PASS
```

Ghi xong deliverable thì tick `- [x]` đúng chặng đó trong `OUTPUT/<task-slug>/00_plan.md`.

Tool chỉ đọc verdict từ dòng meta này (trong 10 dòng đầu). Viết khác đi ⇒ tool coi là **không đọc
được** và đóng cổng. Cuối file, nếu có, thêm bảng `## FIX` và `## ASK`:

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

| Loại | Nội dung | Ở đâu | Ai ghi |
|---|---|---|---|
| **Registry / technique** | 06W · risk 3x3 · chuỗi biên · 8 viewpoint · nhãn · ID · thang đo | File này (≥2 skill dùng) hoặc trong skill (1 skill dùng) | Người bảo trì hệ thống |
| **Project knowledge** | Quy ước cả dự án | `knowledge/_project.md` | Con người |
| **Feature knowledge** | Dữ kiện của một tính năng | `knowledge/features/<slug>.md` (từ `knowledge/_template.md`) | Xem luật ghi |

### Luật đọc
- Mọi skill đọc `_project.md` và `features/<slug>.md` trước khi chạy.
- Dòng còn chứa `<điền>` hoặc ô trống = **chưa khai báo** ⇒ coi như không có (`[CONTEXT_MISSING]`).
- Dữ kiện đã có trong knowledge (§3 Confirmed, §8, §9 có nguồn) **thắng** suy luận của agent và
  không bị hỏi lại.

### Luật ghi (một luật duy nhất)
| Mục knowledge | Ai ghi | Điều kiện |
|---|---|---|
| §1–§6, §9, §10 | skill `01` | Chỉ dữ kiện có nguồn §10.1 |
| §7 (câu hỏi) | skill `02` | Thêm dòng mới trạng thái `New`. Không xoá dòng cũ |
| Cột trả lời của §7 + §8 | **Con người** (BA/PO trả lời, người dùng chuyển lời) — agent chỉ chép lại nguyên văn khi người dùng đưa câu trả lời, rồi chạy `npm run knowledge:sync -- <slug> --write` | Phải có người phê duyệt + ngày |
| Rule mới sinh từ MR đã chốt | skill `01` lần chạy kế tiếp → §3, cấp `BR` số tiếp theo, nguồn = `knowledge §8 #n` | — |

Không xoá dòng cũ — đổi `Trạng thái`. `OUTPUT/` là kết quả một lần chạy; `knowledge/` là thứ tích luỹ.

---

## 9. Mã định danh & schema dùng chung

> Tool (`gate`, `lint`, `knowledge:sync`, `readiness`, `merge`, `export`) đọc đúng các schema này
> qua một module chung `qa-system/tools/lib/schema.js`. Skill viết khác schema ⇒ tool không đọc được.

### 9.1. Họ mã

| Mã | Là gì | Cấp ở | Ghi chú |
|---|---|---|---|
| `BR-xx` | Business rule đã có nguồn | 01 | Nguồn: tài liệu, hoặc `knowledge §8 #n` |
| `FD-xx` | Field & ràng buộc (kiểu, bắt buộc, min/max, định dạng, chữ thông báo) | 01 | Đầu vào cho 06W, chuỗi biên, nhánh dữ liệu |
| `AF-xx` | Luồng phụ / lỗi có trong nguồn | 01 | |
| `OQ-xx` | Điểm chưa rõ phát hiện khi đọc tài liệu | 01 | Không phải cổng. Mọi OQ phải được 02 chuyển thành MR hoặc ghi "nguồn đã trả lời" |
| `MR-xx` | Câu hỏi chính thức gửi BA/PO (kẽ hở) | 02 | **Họ mã duy nhất mà cổng ASK theo dõi** |
| `RK-xx` | Rủi ro | 01 | 03 kế thừa, chỉ cấp tiếp số mới cho rủi ro từ MR |
| `VP-01…VP-08` | Viewpoint registry | Cố định (bảng §9.2) | Ngoài registry: `VP-9x` + `[GIẢ ĐỊNH]` |
| `TI-xx` | Test idea | 04 | |
| `<MODULE>-NNN` | Test case, vd `AUTH-001` | 05 | `MODULE` 2–6 ký tự hoa lấy theo `_project.md` §1 |

**Ổn định qua các lần chạy**: mã đã có trong knowledge **giữ nguyên**. Mã mới cấp **số tiếp theo**
sau số lớn nhất đang có (trong knowledge và OUTPUT của task). Không bao giờ đánh số lại từ 01.
Ít nhất 2 chữ số (`BR-01`, `MR-12`).

### 9.2. Registry viewpoint (mã cố định)
`VP-01` Happy Path · `VP-02` Negative · `VP-03` Boundary · `VP-04` Security · `VP-05` UX/Usability ·
`VP-06` Performance · `VP-07` Accessibility · `VP-08` Integration.

### 9.3. Trạng thái câu hỏi

| Chuẩn | Tool chấp nhận thêm | Ý nghĩa | Cổng |
|---|---|---|---|
| `New` | Mới, Chờ trả lời | Chưa hỏi / chưa có trả lời | Đóng |
| `TREO` | Pending, Treo | Đã hỏi, BA chưa chốt | Đóng |
| `Confirmed` | Đã xác nhận, Đã chốt | BA/PO trả lời, ô `Phản hồi chính thức` có nội dung | Mở |
| `Rejected` | Loại, Không xử lý | BA/PO quyết định không cần xử lý | Mở |

### 9.4. Bảng câu hỏi (dùng chung cho 02 §3 và knowledge §7)

```md
| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |
|---|---|---|---|---|---|---|---|---|---|
| MR-01 | ... | W2 | BR-03 × W2 | ... | ... |  |  |  | New |
```

Tool đọc cột **theo tên tiêu đề**, không theo vị trí. Bắt buộc có: `ID`, `Câu hỏi cho BA/PO`,
`Phản hồi chính thức`, `Trạng thái`. "Phương án gợi ý" chỉ để BA trả lời nhanh; nó **chỉ thành rule**
khi BA chọn nó và câu trả lời được ghi vào `Phản hồi chính thức`.

### 9.5. Bảng quyết định (knowledge §8)
```md
| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
```
Thiếu `Người phê duyệt` hoặc `Ngày chốt` ⇒ tool coi là chưa chốt.

### 9.6. Bảng BR và FD (01 §3, §3b) — có trích nguyên văn
```md
| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
| ID | Field | Kiểu | Bắt buộc | Ràng buộc (min/max/định dạng) | Thông báo khi sai | Nguồn (file §mục) | Trích nguyên văn |
```
`Trích nguyên văn` là một đoạn chép **đúng từng chữ** từ file nguồn trong `INPUT/<slug>/`.
`npm run lint` dò lại đoạn này trong `INPUT/`; không tìm thấy ⇒ lỗi. Nguồn là knowledge §8 ⇒ ghi
`knowledge §8 #n` và để trống trích dẫn. Ô không có trong nguồn ⇒ nhãn §2.1.

---

## 10. Nguồn hợp lệ & thứ tự ưu tiên

### 10.1. Nguồn hợp lệ
1. `INPUT/<slug>/` — 5 ngăn đã qua intake (hoặc `00_knowledge_digest.md`, giữ cột nguồn).
2. `knowledge/features/<slug>.md` — §3 Confirmed, §8 có người phê duyệt, §9 có nguồn.
3. `knowledge/_project.md` — chỉ dòng đã khai (không còn `<điền>`).
4. Deliverable các chặng trước **trong cùng task** (chúng đã trace về 1–3).

Không phải nguồn: hiểu biết chung về ngành, ví dụ trong skill/template, output của task khác,
output của người khác đưa vào làm mẫu.

### 10.2. Khi các nguồn khác nhau
| Ưu tiên | Nguồn | Thắng về |
|---|---|---|
| 1 | knowledge §8 (có người phê duyệt + ngày) | Mọi thứ |
| 2 | `05_communication/` — CR, Q&A, biên bản có ngày | Phần nó nói tới, nếu mới hơn spec |
| 3 | `02_ba/` — bản có version/ngày mới nhất | Logic nghiệp vụ |
| 4 | `03_dev/` | Ràng buộc kỹ thuật của field, API, mã phản hồi |
| 5 | `04_design/` | Bố cục, chữ hiển thị trên màn hình |
| 6 | `01_business/` | Mục tiêu, bối cảnh |

- Không xác định được bản nào mới hơn, hoặc hai nguồn cùng mức mâu thuẫn ⇒ **sinh MR**, không tự chọn.
- Phần `## Annotations / Pending changes` do intake trích ra (comment, tracked changes, "DRAFT") **chưa
  phải sự thật** ⇒ sinh MR để BA xác nhận.

---

## 11. Thang đo dùng chung

| Đại lượng | Giá trị hợp lệ | Ghi chú |
|---|---|---|
| Likelihood / Impact | `HIGH` / `MEDIUM` / `LOW` | §5 |
| Risk Level | `CRITICAL` / `HIGH` / `MEDIUM` / `LOW` | §5 |
| Severity (bug, rủi ro) | `Critical` / `Major` / `Minor` / `Trivial` | |
| Ưu tiên câu hỏi MR | `High` / `Medium` / `Low` | |
| Priority test case | `High` / `Medium` / `Low` | **Ánh xạ cố định** từ Risk Level cao nhất của RK liên quan: CRITICAL/HIGH → `High`, MEDIUM → `Medium`, LOW → `Low`. Không có RK ⇒ `Medium` + `[ĐỀ XUẤT]`. Người phụ trách được quyền đổi (Human-Final) |
| Automated/Manual | Tag `Manual` mặc định; `[ĐỀ XUẤT] Automated` khi bước kiểm được hoàn toàn bằng UI/API, không cần phán đoán của người | Human-Final |
| Ngày | `YYYY-MM-DD` trừ khi `_project.md` §2 khai khác | |
