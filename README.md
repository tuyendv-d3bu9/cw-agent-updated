# CW QA Agent — Hướng Dẫn Vận Hành

Hệ thống Agent QA chuyên sâu gồm **8 nhóm chuyên gia**, điều hành tự động theo triết lý **Knowledge-First**, **Zero-CLI**, và chuẩn **FACT**.
Toàn bộ quy tắc cốt lõi nằm tại `AGENTS.md` (root) và `qa-system/core/QA_STANDARD.md`.

---

## 1. Bản Đồ Thư Mục Hệ Thống

```
INPUT/<task-slug>/              TÀI LIỆU ĐẦU VÀO 5 NGĂN ĐỐI TÁC:
  01_business/                  Yêu cầu chiến lược, bài toán kinh doanh, chính sách cấp cao
  02_ba/                        [BẮT BUỘC] PRD, SRS, User Stories, Use Cases (.docx, .md)
  03_dev/                       API Swagger/OpenAPI, DB Schema, Technical Specs
  04_design/                    Figma links, wireframes, screenshots UI
  05_communication/             Q&A log, biên bản họp, Change Requests (CR)

OUTPUT/<task-slug>/             KHO THIẾT KẾ GỐC & TẦNG THỰC THI (RUNS):
  00_plan.md                    Kế hoạch tổng thể của tính năng
  01_ -> 06_                    Báo cáo phân tích, viewpoint, test idea, testcase gốc
  _index.md                     Bảng điều khiển tổng hợp (Dashboard)
  runs/                         TẦNG THỰC THI THEO TICKET / VERSION:
    RUN-XX_<ticket>/            Session chạy độc lập: run_plan.md, run_result.md, evidence/

knowledge/                      BỘ NÃO TRI THỨC VĨNH VIỄN (SSOT)
  _system_map.json              Bản đồ vệ tinh toàn hệ thống (Agent đọc file này đầu tiên)
  _project.md                   Quy ước dự án: format mã, tiền tệ VNĐ, timezone, NULL vs rỗng
  _glossary.md                  Từ điển thuật ngữ nghiệp vụ thống nhất
  _template.md                  Mẫu chuẩn tạo tri thức tính năng mới
  features/<feature-slug>.md    Quy tắc đã chốt · câu trả lời BA · giả định đã chốt · domain constant

qa-system/                      HỆ THỐNG 9 CHUYÊN GIA QA (cũng là npm package sau này)
  qa-lead/AGENT.md              TỔNG CHỈ HUY — Cổng số 0 tiếp nhận & điều phối toàn bộ
  qa-lead/skills/               system-upgrade-governance: nâng cấp chính hệ thống agent
  core/QA_STANDARD.md           Luật chung: verdict · guard · FACT · 06W · risk matrix
  qa-analyst/                   01->04: Tóm tắt yêu cầu, 06W kẽ hở, viewpoint, test idea
  qa-test-design/               05->06: Test case 8 trường, rà soát độ phủ 3 góc nhìn
  qa-test-data/                 09->12: Data class, dataset, validation & traceability
  qa-ui-review/                 08: Phân tích ảnh màn hình (Vision)
  qa-reporter/                  13: Chuẩn hóa bug report 7 trường & Daily QA summary
  qa-automation/                Playwright E2E: Gom cụm luồng, sinh POM, chạy test & chụp evidence
  qa-readiness-evaluator/       Cổng Go/No-Go: đánh giá độ chín test design trước khi sang automation
  templates/                    Khuôn mẫu + 7 bước dựng agent mới
  workflows/                    Bản đồ pipeline & các runbook chạy sẵn
  tools/                        Công cụ nội bộ (xem qa-system/tools/README.md)

automation/                     TẦNG KIỂM THỬ TỰ ĐỘNG PLAYWRIGHT
  pages/                        Page Object Model: BasePage, ShopPage, CheckoutPage, LoginModal
  tests/                        Kịch bản test (smoke.spec.ts là bộ mồi đã chạy xanh)
```

**Thứ tự quy trình**:
1. **Cổng 0**: QA Leader kiểm duyệt và chuẩn hóa 5 ngăn `INPUT/<task-slug>/`.
2. **Thiết kế**: Tạo `00_plan.md` $\to$ Chạy pipeline thiết kế `01 → 06`.
3. **Thực thi**: Khi có Ticket cần test $\to$ Tạo session `runs/RUN-XX/` $\to$ `qa-automation` chạy Playwright và chụp bằng chứng vào `evidence/`.

---

## 2. Cách Sử Dụng Với Các AI Agent

Nhờ đã cấu hình file hiến pháp `AGENTS.md` ở root, bất kỳ AI Agent nào (**Antigravity IDE, Claude Code, Cursor, Codex, Gemini CLI...**) khi mở thư mục dự án lên đều tự động nắm luật:

### Lệnh chạy đơn giản:
```
Tạo plan và chạy pipeline cho tính năng <task-slug> từ INPUT/<task-slug>.md.
```

### Quy trình tự động:
1. Agent tạo ngay file kế hoạch: `OUTPUT/<task-slug>/00_plan.md` để chia nhỏ milestone và chống tràn context.
2. Agent đọc `knowledge/_project.md`, `knowledge/_glossary.md` và `knowledge/features/<slug>.md`.
3. Chạy từng bước và cập nhật trạng thái `PASS / FIX / ASK` vào file Plan.

---

- **Tiếp nhận, convert mọi định dạng thô (.docx, .pdf, .txt) & tự phân loại vào 5 ngăn INPUT (Cổng 0)**:
  ```bash
  npm run intake -- <file-hoặc-thư-mục> [--slug <task-slug>]
  ```
- **Tự khởi tạo bộ não tri thức ban đầu cho dự án mới (Self-Bootstrap)**:
  ```bash
  npm run knowledge:init
  ```
- **Chuyển đổi tài liệu .docx từ BA thành .md**:
  ```bash
  npm run convert
  ```
- **Tạo nhanh file tri thức cho tính năng mới**:
  ```bash
  npm run knowledge:new <feature-slug>
  ```
- **Gộp các lô test case (batch) thành file đặc tả tổng**:
  ```bash
  npm run testcases:merge <task-slug>
  ```
- **Xuất test cases ra CSV chuẩn Jira Xray & Redmine**:
  ```bash
  npm run testcases:export <task-slug>
  ```
- **Đồng bộ hai chiều với Jira qua REST API**:
  ```bash
  npm run jira:push <task-slug>   # Đẩy test cases lên Jira
  npm run jira:pull <task-slug>   # Kéo bug về phân tích rủi ro
  ```
- **Quét xung đột tri thức chéo giữa các tính năng**:
  ```bash
  npm run knowledge:conflicts
  ```
- **Bảng điều phối tiến độ QA Leader (Dashboard)**:
  ```bash
  npm run status
  ```
- **Đồng bộ bản đồ hệ thống tập trung (System Map)**:
  ```bash
  npm run map:sync
  ```
- **Kiểm tra toàn vẹn & Phân tích tác động khi sửa Agent (Agent Doctor)**:
  ```bash
  npm run agent:check
  npm run agent:check -- --impact <tên-agent>
  ```

---

## 4. Quản Lý Tri Thức Cho Dự Án Mới (`INPUT` ➔ `knowledge/`)

- **Bước 1**: Dự án mới chỉ cần có `knowledge/_project.md`. Nạp tài liệu BA vào `INPUT/`.
- **Bước 2**: Agent phân tích `INPUT/`, tự trích xuất quy tắc vào `knowledge/features/<slug>.md` Mục 3 (`CONFIRMED BUSINESS RULES`) và tìm kẽ hở 06W vào Mục 7 (`OPEN QUESTIONS`).
- **Bước 3**: BA trả lời các kẽ hở $\to$ Cập nhật vào Mục 8 (`GIẢ ĐỊNH ĐÃ CHỐT`).
- **Bước 4**: Lần sau chạy lại, Agent tự động kế thừa tri thức này mà không cần hỏi lại.
