# AGENTS — Hiến Pháp & Bản Đồ Điều Hành Hệ Thống

> File này là **Hiến pháp tối cao** cho mọi AI Agent (**Antigravity IDE, Claude Code, Cursor, Codex, Copilot, Gemini CLI...**) khi làm việc trong repository này.
> Mọi tương tác, phân tích, sinh kết quả đều phải tuân thủ nghiêm ngặt các nguyên tắc dưới đây.

---

## 1. Bản Đồ Không Gian Làm Việc (Workspace Boundaries)

Dự án được phân định rạch ròi thành 4 khu vực chức năng. Agent chỉ được đọc/ghi đúng phân vùng:

| Khu vực | Chức năng duy nhất | Nguyên tắc hoạt động của Agent |
|---|---|---|
| `INPUT/<task-slug>/` | Chứa tài liệu nguồn 5 đối tác: `01_business`, `02_ba`, `03_dev`, `04_design`, `05_communication` | **Chỉ ĐỌC** (trừ tiện ích chuyển đổi file tự động). |
| `OUTPUT/<task-slug>/` | Lưu Master Spec (`00`->`06`) và Tầng thực thi các đợt chạy (`runs/`) | **Nơi DUY NHẤT được phép xuất kết quả**. Tuyệt đối không sinh file rác ở root. |
| `knowledge/` | Bộ não tri thức vĩnh viễn của dự án (SSOT) | Bắt buộc đọc `_system_map.json` đầu tiên để định tuyến vị trí tính năng và conventions. |
| `agents/` | Hệ thống chuyên gia QA & công cụ thực thi nội bộ | Giao tiếp qua QA Leader (`qa-system/qa-lead/`), không gọi rời rạc. |

### 1.1. Cổng Tiếp Nhận Số 0 (QA Leader Intake Gate & Outcome Alignment):
- Mọi tài liệu đầu vào được tổ chức theo 5 đối tác:
  1. `01_business/`: Định hướng, bài toán kinh doanh, chính sách cấp cao.
  2. `02_ba/`: [BẮT BUỘC] PRD, SRS, User Stories, Use Cases (.docx, .md).
  3. `03_dev/`: API Swagger/OpenAPI, DB Schema, Technical specs.
  4. `04_design/`: Figma links, wireframes, screenshots giao diện.
  5. `05_communication/`: Q&A log, biên bản họp, Change Requests (CR).
- **QA Leader gác cổng số 0**:
  + Tự động kích hoạt `qa-system/tools/intake/intake.js` phân loại và convert docx/pdf sang `.md` sạch.
  + Đánh giá sự thiếu hụt tài liệu (**Gap Assessment**): Kiểm tra bắt buộc phải có `02_ba/`. Nếu thiếu tài liệu các ngăn khác, ghi nhận rủi ro và các giả định tương ứng.
  + Căn chỉnh mục tiêu đầu ra (**Outcome Alignment**): Xác nhận Mode làm việc (Mode 1: Manual Test Cases Only; Mode 2: Manual + Test Data; Mode 3: Web Journey & Gherkin; Mode 4: Full Automation E2E).

### 1.2. Phân Tầng Thực Thi Độc Lập (`OUTPUT/<task-slug>/runs/`):
- **Master Spec (`01_` đến `06_`)**: Là kho tài liệu thiết kế kiểm thử gốc (ví dụ: 100 test cases). Cố định và không bị bẩn.
- **Tầng Thực Thi (`runs/`)**: Khi cần chạy test cho 1 Ticket cụ thể (ví dụ: chỉ chạy 20/100 cases), tạo session riêng:
  `OUTPUT/<task-slug>/runs/RUN-01_<ticket-name>/`
  gồm: `run_plan.md` (lọc 20 cases), `run_result.md` (kết quả), `evidence/` (ảnh chụp màn hình), và `run_defects.md` (lỗi phát hiện).

### 1.3. Nguyên Tắc "System Map First" (Tuyệt Đối Chống Đọc Dò File & Tiết Kiệm Token):
- **CẤM** các Agent coding hay QA chạy lệnh quét/tìm kiếm mò mẫm (`list_dir`, `grep_search` toàn dự án) khi vào việc.
- **BẮT BUỘC**: Mọi Agent trước khi thực thi việc gì phải đọc ngay file:
  ```
  knowledge/_system_map.json
  ```
- File này chứa đầy đủ: Bảng định tuyến (`routing_table`), vị trí chính xác của từng feature, và trạng thái hiện tại. Đọc xong là mở **ĐÚNG FILE ĐÍCH**, tiết kiệm 80% token tìm kiếm.
- Lệnh đồng bộ bản đồ: `npm run map:sync`.

### 1.4. Vai Trò Tổng Chỉ Huy Của QA Leader (`qa-system/qa-lead/`):
- User **CHỈ CẦN GIAO TIẾP VỚI QA LEADER**. Không cần nhớ hay gọi trực tiếp từng sub-agent con.
- QA Leader tự động nắm bắt ý định của User, tra cứu `_system_map.json`, lập `00_plan.md` và giao việc cho đúng chuyên gia (`qa-analyst`, `qa-test-design`, `qa-automation`...).

### 1.5. Quy Tắc Biên Giới Nghiêm Ngặt (Boundary Gate & Readiness Gate):
- **CẤM** tự ý chạy một mạch từ thiết kế Test Cases sang viết script Automation Playwright nếu ứng dụng web chưa sẵn sàng hoặc người dùng chỉ yêu cầu thiết kế Test Case Manual.
- **Điểm Dừng Chuẩn**: Chặng 6 (`06_coverage_review.md`) là điểm hoàn tất tự nhiên của quy trình thiết kế kiểm thử.
- **Chốt chặn sẵn sàng (Readiness Gate)**: Trước khi kích hoạt Automation, bắt buộc chạy `npm run readiness -- <slug> --write` (đo số liệu bằng máy) rồi để `qa-readiness-evaluator` diễn giải thành `OUTPUT/<slug>/15_readiness_report.md`.
  + Exit code: `0` = GO · `1` = CONDITIONAL GO · `2` = NO-GO.
  + **Số liệu do công cụ đo, không do Agent đếm bằng mắt** — đếm thủ công trên hàng trăm test case là nguồn sai số, mà sai ở cổng này thì cho phép automation trên nền thiết kế chưa chín.
  + Kết quả `GO` **chưa đủ** để chạy Automation: còn phải có yêu cầu rõ ràng của người dùng **và** URL môi trường cụ thể.
- Chỉ kích hoạt Tầng Thực Thi (`runs/`) hoặc Automation khi có yêu cầu rõ ràng từ người dùng kèm URL môi trường cụ thể và khuyến nghị GO.

### 1.6. Quy Tắc Bức Tường Thép (Iron Gatekeeper — Tuyệt Đối Cấm Nhảy Cóc Khi Vướng ASK):
- **BẢO VỆ CHẤT LƯỢNG LÀ TRÊN HẾT**: Khi tài liệu thiếu hụt (Cổng 0 thiếu `02_ba/`), hoặc Chặng 2 quét kẽ hở 06W ra Verdict `ASK` (còn Open Questions chưa được xác nhận):
  + **CẤM TUYỆT ĐỐI**: Không được tự ý nhảy cóc sang Chặng 3 (Viewpoint), Chặng 4 (Test Idea), hay Chặng 5 (Sinh Test Case).
  + **CẤM XUÊ XOA THEO Ý USER**: Kể cả khi User quên trả lời, giục làm tiếp (*"cứ làm tiếp đi"*, *"bỏ qua câu hỏi đó đi"*, *"viết test case đại đi"*), Agent **BẮT BUỘC PHẢI CỨNG RẮN BẢO VỆ QUAN ĐIỂM CHẶN (HARD STOP)**.
  + **PHẢN BIỆN CHUẨN MỰC**: Agent phải giải thích rõ ràng với User: *"Nếu sinh test case trên nền tảng nghiệp vụ đang mơ hồ hoặc lủng logic, 100% test case sinh ra sẽ là ảo giác (hallucination), gây lãng phí nguồn lực kiểm thử và tiềm ẩn nguy cơ lọt lỗi nghiêm trọng lên Production."*
  + **ĐIỀU KIỆN MỞ KHÓA DUY NHẤT (UNLOCK GATE)**: Chỉ được phép tiến sang bước sau khi:
    (1) User/BA cung cấp câu trả lời giải quyết triệt để các câu hỏi `ASK`, HOẶC
    (2) User đưa ra quyết định kinh doanh tường minh (Explicit Business Decision) để ghi nhận vào Mục 8 (`GIẢ ĐỊNH ĐÃ CHỐT`) trong `knowledge/features/<slug>.md`.

#### 1.6.1. Cổng ASK được THI HÀNH BẰNG MÁY, không chỉ bằng lời (3 lớp)

> Luật viết bằng văn bản chỉ là **xác suất** — model vẫn có thể bị câu *"cứ làm tiếp đi"*
> thuyết phục. Vì vậy cổng ASK có cơ chế kiểm được bằng máy, nằm ngoài tầm thuyết phục của hội thoại.

| Lớp | Cơ chế | Ai thi hành | Hiệu lực |
|---|---|---|---|
| **1** | `npm run gate [slug]` → exit `0` mở / `1` đóng. Tự ghi/gỡ `OUTPUT/<slug>/_gate.lock` | Agent tự gọi | Mọi IDE |
| **2** | Hook `PreToolUse` (`.claude/settings.json` → `qa-system/tools/system/gate-hook.js`) **chặn thẳng** thao tác ghi file `03_`→`06_` | **Harness chặn — model không cãi được** | Claude Code |
| **3** | `npm run gate:audit [slug]` → exit `2` nếu phát hiện file `03_`→`06_` sinh ra sau mốc khoá | Agent / CI | Mọi IDE |

**Nghĩa vụ bắt buộc của mọi Agent**:
- Trước khi sinh bất kỳ deliverable nào từ Chặng 3 trở đi: **chạy `npm run gate <slug>`**. Exit code `1` ⇒ DỪNG, trình bày danh sách câu hỏi treo cho người dùng.
- Khi người dùng giục *"cứ làm tiếp đi"*: **không tranh luận suông** — chạy `npm run gate <slug>` và dán kết quả thật ra màn hình. Cổng do công cụ quyết định, không do Agent hay User quyết định.
- Sau khi người dùng chốt câu trả lời: ghi vào Mục 7 (Trạng thái → `Confirmed`) **hoặc** Mục 8, rồi chạy lại `npm run gate <slug>` để chứng minh cổng đã mở, trước khi làm tiếp.

> ⚠️ Hook lớp 2 chỉ hiệu lực trong Claude Code. Ở Antigravity / Cursor / Codex, lớp 1 và lớp 3
> vẫn chạy được — nhưng khi đó **nghĩa vụ tự gọi `npm run gate` là bắt buộc tuyệt đối**,
> vì không còn harness đứng sau chặn hộ.

---

## 2. Quy Tắc Bắt Buộc: "Plan First" Chống Tràn Context (Mọi Agent Phải Tuân Thủ)

Khi nhận bất kỳ yêu cầu phân tích tính năng hay chạy pipeline, **Agent BẮT BUỘC phải tạo file Plan trước khi thực thi**:

### Vị trí lưu Plan:
```
OUTPUT/<task-slug>/00_plan.md
```

### Mục đích của `00_plan.md`:
1. **Kiểm soát Context Window**: Tránh đọc tràn lan tất cả file cùng lúc làm đầy ngữ cảnh, khiến AI bị phân tâm và hallucinate. Mỗi bước (Milestone) Agent chỉ nạp đúng file đầu vào của bước đó.
2. **Kế thừa xuyên Agent**: Khi người dùng chuyển đổi giữa các tool (từ Antigravity sang Claude Code hay Cursor), Agent mới chỉ cần mở `00_plan.md` là biết ngay tiến độ đang dừng ở đâu để làm tiếp, không cần tóm tắt lại lịch sử chat.

### Cấu trúc chuẩn của `00_plan.md`:
```markdown
# Kế Hoạch Phân Tích & Kiểm Thử · <task-slug>
Ngày tạo: YYYY-MM-DD · Người lập: <Agent/Tool> · Trạng thái: IN-PROGRESS

## 1. Phạm Vi & Tài Liệu Nguồn
- Tài liệu yêu cầu: INPUT/<file>.md
- Tri thức dự án: knowledge/_project.md, knowledge/_glossary.md
- Tri thức tính năng: knowledge/features/<task-slug>.md

## 2. Lộ Trình Từng Chặng (Milestones & Explicit Skills)
- [ ] **Chặng 1**: Đọc yêu cầu thô & Phân tích rủi ro [qa-analyst/skills/requirement-risk-summary.md] ➔ Ra `01_requirement_risk_summary.md`
- [ ] **Chặng 2**: Quét kẽ hở 06W & Câu hỏi cho BA [qa-analyst/skills/missing-rule-06w.md] ➔ Ra `02_missing_rule_report.md`
      *(Nếu Verdict là ASK -> DỪNG để người dùng chốt với BA)*
- [ ] **Chặng 3**: Chọn Risk Area & Viewpoints [qa-analyst/skills/viewpoint-selection.md] ➔ Ra `03_viewpoint_report.md`
- [ ] **Chặng 4**: Thiết kế Test Idea & Lọc Giữ/Bỏ [qa-analyst/skills/test-idea-design.md] ➔ Ra `04_test_idea_report.md`
- [ ] **Chặng 5**: Sinh Test Case chi tiết 8 trường [qa-test-design/skills/test-case-generation.md] ➔ Ra `05_test_case_spec.md`
- [ ] **Chặng 6**: Rà soát độ phủ 3 góc nhìn & Nghiệm thu [qa-test-design/skills/coverage-review.md] ➔ Ra `06_coverage_review.md`
- [ ] **Bổ trợ Dữ liệu (Nếu cần)**: Data Class [qa-test-data/skills/data-class-map.md] · Dataset [qa-test-data/skills/dataset-generation.md] · Boundary [qa-test-data/skills/boundary-negative-dataset.md] · Traceability [qa-test-data/skills/data-validation-traceability.md]
- [ ] **Chốt chặn Sẵn sàng (Khi sang Automation)**: `npm run readiness -- <slug> --write` rồi diễn giải [qa-readiness-evaluator/skills/gen-readiness-report.md] ➔ Ra `15_readiness_report.md`

### 2.4. Cơ Chế "QA Leader Tự Nắm Tiến Độ" (Zero-Path Typing):
Người dùng **KHÔNG CẦN** nhớ đường dẫn hay gõ lại `OUTPUT/.../00_plan.md`.
Khi người dùng gõ các câu thoại ngắn như:
> *"Tiếp tục"*, *"Làm tiếp"*, *"Tiến độ thế nào"*, *"Hôm nay làm gì tiếp?"*, hoặc *"Chạy tiếp task <slug>"*

Mọi AI Agent **bắt buộc tự động đóng vai QA Leader**:
1. Tự động quét thư mục `OUTPUT/` để kiểm tra toàn bộ file `00_plan.md` hiện có.
2. Xác định chính xác: Task nào đang làm dở? Đã xong đến chặng nào? Có đang bị chặn bởi câu hỏi `ASK` cho BA không?
3. Báo cáo bảng Dashboard tiến độ ngắn gọn và chủ động đề xuất:
   *"Task `<task-slug>` đã hoàn thành xong Chặng X. Tôi đề xuất làm tiếp Chặng Y [hoặc Batch Z]. Bạn có muốn tiếp tục không?"*
4. Khi người dùng xác nhận (`OK` / `Tiếp tục`), Agent tự động đọc đúng đầu vào của chặng dang dở để làm tiếp mà không làm lại các bước cũ.

### 2.5. Chỉ Dẫn Độc Lập Cho Mọi Coding Agent (Claude Code, Cursor, Codex, Windsurf):
- **CẤM TỰ Ý TẠO FILE Ở ROOT**: Không tạo thêm `TODO.md`, `CLAUDE.md`, `.cursorrules`... ở thư mục gốc để tránh làm bẩn workspace.
- **Nơi duy nhất theo dõi tiến trình (Universal Task Tracker)**:
  + Mọi Agent khi cần kiểm tra hoặc cập nhật tiến độ công việc **bắt buộc đọc và tick `- [x]` trực tiếp vào `OUTPUT/<task-slug>/00_plan.md`**.
  + Nếu muốn lấy danh sách công việc hiện tại dạng checklist: Chạy lệnh `npm run status`.
  + File `00_plan.md` sử dụng 100% cú pháp GitHub Flavored Markdown (GFM) tiêu chuẩn, hoàn toàn tương thích và kế thừa mượt mà giữa Antigravity, Claude Code, Cursor và Codex.

---

## 3. Quy Tắc Xử Lý Quy Mô Lớn: Blueprint JSON & Batch Generation (Chống Tràn Token)

Khi số lượng Test Case dự tính vượt quá **50 test cases** (hoặc lên tới hàng trăm, hàng nghìn test cases), **CẤM** cố sinh toàn bộ trong 1 lần (One-shot) vì chắc chắn sẽ bị cắt cụt token hoặc suy giảm chất lượng. Mọi Agent bắt buộc tuân theo quy trình 3 giai đoạn:

```
[04_test_idea_report.md] ──► 1. TẠO BLUEPRINT JSON (05_test_blueprint.json)
                                    │
                                    ├──► Lô 1 (batch_01.md: TC-001 -> TC-050)
                                    ├──► Lô 2 (batch_02.md: TC-051 -> TC-100)
                                    └──► ... Lô N
                                    │
                          3. GỘP TỔNG (npm run testcases:merge <slug>)
                                    ▼
                          05_test_case_spec.md
```

1. **Giai đoạn 1 — Bản thiết kế khung (`05_test_blueprint.json`)**:
   - Sinh danh mục metadata rút gọn cho toàn bộ 500 - 1.000 test case (TC ID, Module, Rule ID, Viewpoint ID, Mục đích kiểm thử, Priority).
   - Bản thiết kế này nhẹ (~30 token/item), đảm bảo bao quát 100% phạm vi mà không bị đứt đoạn hay trùng lặp.
2. **Giai đoạn 2 — Chia lô sinh chi tiết (`Chunked Batching`)**:
   - Chia danh mục thành các lô nhỏ (khuyến nghị **50 test cases / batch**).
   - Sinh chi tiết 8 trường chuẩn cho từng lô vào `OUTPUT/<task-slug>/testcases/batch_01.md`, `batch_02.md`...
3. **Giai đoạn 3 — Gộp tổng thể (`Assembly`)**:
   - Chạy lệnh tiện ích để tự động ghép các lô thành file đặc tả hoàn chỉnh:
     ```bash
     npm run testcases:merge <task-slug>
     ```

### 3.1. Engine Sinh Dữ Liệu Tự Động (Data Generator Engine — 0 Token LLM):
- **CẤM** AI gõ tay từng dòng dữ liệu test khi số lượng lớn (> 10 records) vì gây lãng phí token và hallucinate.
- **Quy trình chuẩn**:
  1. AI chỉ định nghĩa `dataset_schema.json` siêu nhẹ (~30 token) chứa các loại generator: `vietnamese_name`, `phone_vn`, `email`, `voucher_code`, `currency_vnd`, `date_vn`, `boundary`, `enum`, `negative`.
  2. Kích hoạt engine nội bộ `qa-system/tools/testdata/generate-dataset.js` (`npm run data:gen`) sinh hàng trăm/nghìn dòng trong 0.05s với 0 token LLM.
  3. Xuất bảng dữ liệu chuẩn markdown hoặc CSV/JSON vào `OUTPUT/<task-slug>/10_dataset.md`.

### 3.2. Chuẩn Hóa Gherkin BDD (`Given - When - Then`) Cho Luồng Mò Web:
- Khi Agent thực hiện khám phá ứng dụng web (`qa-exploratory` với skill `web-journey-discovery`), toàn bộ hành trình người dùng **BẮT BUỘC** được chuẩn hóa thành kịch bản **Gherkin BDD** (`.feature`).
- **Cấu trúc chuẩn**:
  + `Given`: Tiền điều kiện môi trường, trạng thái đăng nhập, dữ liệu giỏ hàng.
  + `When`: Hành động của người dùng (click nút, nhập mã voucher, chuyển trang).
  + `Then`: Kỳ vọng kiểm chứng được (hiển thị toast thành công, cập nhật số tiền, báo lỗi đỏ).
- Kèm theo bảng **Metadata Ánh Xạ Step ➔ Playwright Locator** (`getByRole`, `getByTestId`, `getByPlaceholder`) để phục vụ sinh Page Object Model (POM) cho tầng Automation.

---

## 4. Quy Trình Khởi Tạo & Tích Luỹ Tri Thức Cho Dự Án Mới (`INPUT` ➔ `knowledge/`)

Đối với một dự án mới tinh **chưa có tri thức nền**:

1. **Khởi tạo tối thiểu**:
   - `knowledge/_project.md`: Điền vài quy ước dự án cơ bản (tiền tệ, timezone, định dạng mã).
   - Thả file tài liệu của BA (PRD/SRS) vào `INPUT/<feature>.md` (dùng `npm run convert` nếu là `.docx`).
2. **Khởi tạo tri thức tính năng**:
   - Chạy lệnh: `npm run knowledge:new <feature-slug>` để tạo `knowledge/features/<feature-slug>.md`.
3. **Agent tự động bóc tách từ `INPUT/`**:
   - Chạy bước `01`: Agent trích xuất các quy tắc đã có căn cứ rõ ràng từ `INPUT/` nạp vào Mục 3 (`CONFIRMED BUSINESS RULES`).
   - Chạy bước `02`: Agent quét 06W tìm ra các kẽ hở logic mà tài liệu chưa nêu, ghi vào Mục 7 (`OPEN QUESTIONS`) với trạng thái `New` và ra Verdict `ASK`.
4. **BA/PO phản hồi**:
   - Người dùng đưa câu trả lời của BA vào Mục 8 (`GIẢ ĐỊNH ĐÃ CHỐT`) và chuyển rule sang `Confirmed`.
5. **Kế thừa lâu dài**:
   - Lần chạy tiếp theo, Agent đọc `knowledge/features/<feature-slug>.md` ➔ **Không hỏi lại điều đã trả lời**, áp dụng ngay vào Test Cases.

---

## 5. Các Ràng Buộc Bất Biến (Non-Negotiable Rules)

1. **Chuẩn FACT 100% (Chống Ảo Giác)**:
   - **Factual**: Mọi kết luận phải dẫn xuất từ `INPUT/` hoặc `knowledge/`. Cấm tự bịa quy tắc.
   - **Accurate**: Dùng đúng mã định danh (`BR-xx`, `MR-xx`, `VP-xx`, `TC-xx`) và thuật ngữ trong `knowledge/_glossary.md`.
   - **Complete**: Quét đủ 6 câu hỏi 06W (W1 đến W6). Không bỏ sót nhánh ngoại lệ.
   - **Testable**: Kỳ vọng đầu ra phải kiểm chứng được nhị phân (Pass/Fail).
2. **Bắt buộc gắn nhãn `[GIẢ ĐỊNH]`**:
   - Bất kỳ điểm nào tài liệu chưa nêu mà Agent tự suy đoán đều **BẮT BUỘC** gắn tiền tố `[GIẢ ĐỊNH]` kèm mức độ rủi ro.
3. **Cổng Nghiệm Thu Bất Biến & Chốt Chặn Bức Tường Thép (Verdict Gates)**:
   - `PASS`: Đạt chuẩn ➔ Chạy bước tiếp.
   - `FIX`: Sai format/trace ➔ Agent tự sửa.
   - `ASK`: Hổng nghiệp vụ / thiếu thông tin ➔ **HARD STOP TUYỆT ĐỐI**. Bắt buộc dừng lại, giữ nguyên hiện trạng, không tự suy đoán, không nhảy cóc sang chặng sau. Kể cả khi User quên trả lời hoặc yêu cầu bỏ qua, Agent bắt buộc từ chối và yêu cầu chốt rõ ràng mới mở cổng đi tiếp.
4. **Chuẩn FACT được KIỂM BẰNG MÁY, không chỉ bằng mắt**:
   - Bốn tiêu chí F-A-C-T ở trên trước đây chỉ được kiểm bởi `coverage-review` — tức LLM tự chấm bài của LLM.
   - Nay có `npm run lint -- <task-slug>` kiểm phần **cơ học**: đủ 8 trường, `TC_ID` đúng định dạng và không trùng, Title đúng động từ quy chuẩn, Tags trace được về `Rule#`/`Viewpoint#`, không còn placeholder, quét đủ W1→W6, không ô bảng trống.
   - **Nghĩa vụ**: Agent chạy lệnh này **trước khi báo hoàn thành Chặng 5 hoặc Chặng 6**. Exit `1` ⇒ chưa xong.
   - Linter chỉ lo phần cơ học. Phần còn lại của FACT (độ phủ nghiệp vụ, tính hợp lý của kỳ vọng) vẫn là việc của Agent và con người.
5. **Không làm bẩn thư mục gốc (Keep Root Clean)**:
   - Không sinh file tùy tiện ngoài thư mục gốc. Mọi kết quả phân tích PHẢI nằm trong `OUTPUT/<task-slug>/`.

---

## 6. Lệnh Tiện Ích

- **Khởi tạo dự án mới (chạy đầu tiên)** — dựng `INPUT/` 5 ngăn, `OUTPUT/`, `knowledge/`,
  `automation/`, cài thư viện, rồi tự kiểm. Chạy lại bao nhiêu lần cũng được, **không ghi đè**:
  ```bash
  npm run init                  # dựng + cài + tự kiểm
  npm run init -- --dry-run     # xem trước sẽ tạo gì
  ```
- **Xem đang ở đâu, làm gì tiếp**:
  ```bash
  npm start
  ```

> Mục lục đầy đủ kèm bảng tra "cần gì → chạy gì": [`qa-system/tools/README.md`](qa-system/tools/README.md).
> Tool được gom theo nhóm chức năng (`intake/ knowledge/ testcase/ testdata/ jira/ system/ lib/`).

- **Chạy test cho chính các tool nội bộ** (sau khi sửa bất kỳ tool nào):
  ```bash
  npm test
  ```
- **Kiểm cổng ASK trước khi sinh Chặng 3→6** (bắt buộc, xem §1.6.1):
  ```bash
  npm run gate <task-slug>          # exit 0 = mở, exit 1 = đóng
  npm run gate:audit <task-slug>    # soát dấu vết nhảy cóc, exit 2 = có vi phạm
  ```
- **Kiểm chuẩn FACT của deliverable bằng máy** (bắt buộc trước khi báo xong Chặng 5/6):
  ```bash
  npm run lint -- <task-slug>          # exit 0 = sạch, exit 1 = có lỗi phải sửa
  ```
- Cổng tiếp nhận và phân loại thông minh tài liệu đầu vào:
  ```bash
  npm run intake -- <file-hoặc-thư-mục> [--slug <task-slug>]
  ```
- Sinh dữ liệu kiểm thử tốc độ cao (0 token LLM):
  ```bash
  npm run data:gen -- --slug <slug> --schema <schema.json> --count 50
  ```
- Đổi file `.docx` từ BA sang `.md`:
  ```bash
  npm run convert
  ```
- Tạo file tri thức mới cho tính năng:
  ```bash
  npm run knowledge:new <feature-slug>
  ```
- Gộp các batch test case thành spec tổng:
  ```bash
  npm run testcases:merge <task-slug>
  ```
- Đồng bộ bản đồ hệ thống:
  ```bash
  npm run map:sync
  ```
- Kết nối và tương tác Jira (MCP Server & REST API):
  ```bash
  npm run jira:mcp   # Chạy stdio MCP Server cho AI IDEs (Antigravity, Cursor, Claude)
  npm run jira:pull  # Kéo danh sách bug/defect từ Jira về
  npm run jira:push  # Chuẩn bị file CSV Xray / đẩy test case lên Jira
  ```

---

## 7. Nguyên Tắc Trải Nghiệm: 100% Lời Nói Tự Nhiên (Zero-CLI)

> **ĐIỀU KHOẢN TỐI CAO CHO MỌI AI AGENT**:
> - Người dùng của dự án là Tester, BA, Product Owner, Quản lý — **KHÔNG BIẾT VÀ KHÔNG PHẢI GÕ CÁC LỆNH TERMINAL (`npm run...`)**.
> - **CẤM** AI Agent bảo người dùng: *"Bạn hãy mở terminal gõ npm run..."*.
> - Toàn bộ các script trong dự án là **CÔNG CỤ NỘI BỘ DÀNH RIÊNG CHO AI AGENT**.
> - Khi người dùng yêu cầu bằng tiếng Việt tự nhiên, **AI Agent tự động kích hoạt công cụ chạy ngầm ở hậu trường** và chỉ báo cáo kết quả thân thiện cho người dùng.

### Lệnh định hướng cho người dùng mới
Khi người dùng hỏi *"bắt đầu từ đâu"*, *"tôi phải làm gì"*, *"thư mục này để làm gì"*,
hoặc tỏ ra bối rối trước cấu trúc dự án: chạy `npm start` và đọc kết quả cho họ.
Lệnh này in ra việc nên làm tiếp, công việc đang có, và **bản đồ quyền sở hữu thư mục**
(của bạn / dùng chung / máy móc / đọc thôi).

### Ví Dụ Thực Tế:
- User nói: *"Có tài liệu mới trong INPUT, xử lý giúp"* ➔ Agent **tự chạy** `npm run intake` ngầm.
  Lệnh không tham số sẽ tự quét tài liệu rời trong `INPUT/`, chuyển sang Markdown sạch, phân vào
  5 ngăn, **và dựng luôn** `OUTPUT/<slug>/`, `knowledge/features/<slug>.md`, `00_plan.md`.
  Người dùng chỉ cần kéo thả file — không phải tự tạo thư mục nào.
- User nói: *"Bắt đầu từ đâu?"* · *"Thư mục này để làm gì?"* ➔ Agent **tự chạy** `npm start` và đọc kết quả.
- User nói: *"Sinh cho tôi 50 bộ dữ liệu test"* ➔ Agent **tự chạy** `generate-dataset.js` ngầm.
- User nói: *"Gộp test case lại đi"* ➔ Agent **tự chạy** `merge-testcases.js` ngầm.
- User nói: *"Tiến độ thế nào rồi?"* ➔ Agent **tự chạy** `status.js` ngầm và in bảng tiến độ ra chat.
- User nói: *"Đã chốt xong"* ➔ Agent **tự chạy** `sync-system-map.js` ngầm để cập nhật bản đồ vệ tinh.
- User nói: *"Kiểm tra ticket Jira SHOPGO-101"* hoặc *"Log bug này lên Jira"* ➔ Agent **tự kích hoạt** Jira MCP tool hoặc gọi API ngầm.

