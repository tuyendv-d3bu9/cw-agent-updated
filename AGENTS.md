# AGENTS — Hiến pháp & bản đồ điều hành

> Áp dụng cho mọi AI Agent (Antigravity, Claude Code, Cursor, Codex, Copilot, Gemini CLI…) trong repo này.
> **Luật nghiệp vụ** (verdict, cổng ASK, nhãn, FACT, 06W, knowledge, mã định danh, thứ tự ưu tiên nguồn)
> chỉ nằm ở [`qa-system/core/QA_STANDARD.md`](qa-system/core/QA_STANDARD.md). File này **trỏ tới**, không chép lại.

---

## 1. Không gian làm việc

| Khu vực | Chức năng | Agent được làm gì |
|---|---|---|
| `INPUT/<slug>/` | Tài liệu nguồn, 5 ngăn `01_business` · `02_ba` · `03_dev` · `04_design` · `05_communication` | **Chỉ đọc** (trừ tool intake) |
| `OUTPUT/<slug>/` | Deliverable `00`→`15`, `testcases/`, `runs/` | **Nơi duy nhất** được xuất kết quả |
| `knowledge/` | Tri thức tích luỹ (SSOT) | Đọc/ghi theo QA_STANDARD §8 |
| `qa-system/` | Agent, skill, tool, template, workflow | Chỉ QA Leader sửa, qua `system-upgrade-governance` |

### 1.1. Cổng 0 — tiếp nhận tài liệu
- QA Leader tự chạy `npm run intake` (hoặc `intake:bulk` cho khối lớn): chuyển sang `.md`, xếp 5 ngăn, dựng `OUTPUT/<slug>/`, `knowledge/features/<slug>.md`, `00_plan.md`.
- **Thiếu `02_ba/`** ⇒ dừng, xin người dùng bổ sung trước khi lập plan. Thiếu ngăn khác ⇒ ghi rủi ro (`qa-lead/AGENT.md` §3).
- **Thứ tự ưu tiên khi các nguồn khác nhau**: QA_STANDARD §10.2. Không xác định được bản mới hơn ⇒ sinh MR, không tự chọn.
- Intake trích comment, tracked changes, dấu "DRAFT" vào mục `## Annotations / Pending changes` của file `.md`.
  Mục này **chưa phải sự thật** ⇒ thành MR (QA_STANDARD §10.2).
- File không hỗ trợ hoặc chuyển đổi lỗi được **giữ nguyên tại chỗ và báo lại** — không xoá. Ảnh (wireframe,
  screenshot) được giữ ở `INPUT/<slug>/04_design/_assets/`.
- **Tên task theo tính năng**, không theo bản: version/ngày/loại tài liệu bị bỏ (`SRS_Doi_mat_khau_v2` → `doi-mat-khau`).
  Tài liệu sắp vào một task **đã có** tài liệu ⇒ intake dừng, **exit 2**, file chưa bị đụng. QA Leader hỏi người dùng
  bằng lời *"đây là bản mới / tài liệu bổ sung của tính năng X?"* — không tự chọn — rồi chạy lại với `--into <slug>`
  (đúng) hoặc `--slug <tên-khác>` (khác tính năng).
- Bản cũ của cùng tài liệu (cùng tên bỏ version/ngày, cùng ngăn) được chuyển sang `<ngăn>/_superseded/` theo
  ngày → version. **Không agent nào đọc `_superseded/`** khi phân tích. Không phân định được bản nào mới hơn ⇒ giữ
  cả hai, intake báo ra, QA Leader hỏi người dùng bản nào đang dùng.

### 1.2. Tầng thực thi (`OUTPUT/<slug>/runs/`)
Master Spec `01_`→`06_` cố định. Chạy test cho một ticket thì mở session riêng
`runs/RUN-XX_<ticket>/` gồm `run_plan.md` · `run_result.md` · `evidence/` · `run_defects.md`
(khuôn ở `qa-system/templates/run/`).

### 1.3. System Map First
Vào việc là đọc `knowledge/_system_map.json` (bảng `routing_table`) rồi mở **đúng file đích**.
Cấm quét/grep mò toàn dự án. Bản đồ lệch thực tế ⇒ `npm run map:sync`.

### 1.4. QA Leader là cửa ngõ duy nhất
Người dùng chỉ nói với QA Leader (`qa-system/qa-lead/AGENT.md`). QA Leader tra bản đồ, lập `00_plan.md`,
giao việc cho đúng agent chuyên môn.

### 1.5. Cổng biên giới & sẵn sàng
- Chặng 6 là **điểm dừng tự nhiên**. Không tự chạy tiếp sang automation.
- Automation (nhánh G) chỉ chạy khi đủ cả ba: người dùng yêu cầu rõ · có URL môi trường ·
  `npm run readiness -- <slug> --write` ra `GO` (exit `0` GO · `1` CONDITIONAL · `2` NO-GO), rồi
  `qa-readiness-evaluator` diễn giải thành `15_readiness_report.md`. Số liệu do tool đo, không đếm bằng mắt.

### 1.6. Cổng ASK
Luật: **QA_STANDARD §1** (định nghĩa duy nhất). Thi hành bằng máy, ba lớp:

| Lớp | Cơ chế | Hiệu lực |
|---|---|---|
| 1 | `npm run gate <slug>` → exit `0` mở · `1` đóng; ghi/gỡ `OUTPUT/<slug>/_gate.lock` | Mọi IDE |
| 2 | Hook `PreToolUse` (`.claude/settings.json` → `qa-system/tools/system/gate-hook.js`) chặn ghi `03_`→`06_` | Claude Code |
| 3 | `npm run gate:audit <slug>` → exit `2` nếu có file `03_`→`06_` sinh sau mốc khoá | Mọi IDE / CI |

Ngoài Claude Code không có lớp 2 ⇒ tự gọi `npm run gate` trước mỗi deliverable Chặng 3+ là **bắt buộc**.

---

## 2. Plan First & nạp theo chặng

Trước khi phân tích tính năng: tạo `OUTPUT/<slug>/00_plan.md` (hoặc `npm run workflow -- start <tên> --slug <slug>`).
Đây là **tracker duy nhất** — tick `- [x]` tại đây, không tạo `TODO.md` hay file theo dõi nào khác. Xem nhanh: `npm run status`.

**Luật nạp**: mỗi chặng nạp **đầu vào đã khai trong skill** + `knowledge/_project.md` + `knowledge/features/<slug>.md`
(QA_STANDARD §7). Không nạp thêm deliverable ngoài danh sách, không đọc lan sang task khác.

### 2.1. Thứ tự chặng

```
01 → 02 →[npm run gate]→ 03 → 04 → 05 →[npm run lint]→ 06   ← điểm dừng tự nhiên
                                    └─(tuỳ chọn) 09 → 10 → 11 → 12 → chạy lại 06 (có 12)
06 →[readiness GO + yêu cầu + URL]→ nhánh G (automation)
```

- `01` không có điểm dừng cứng: `OQ-xx` không chặn, `02` xử lý chúng. Cổng duy nhất của pipeline thiết kế là sau `02`.
- Nhánh dữ liệu `09`→`12` chỉ chạy khi cần dataset. Đã chạy thì `06` phải chạy lại để gom gap `CHƯA CÓ DATA`.
- Mã định danh ổn định qua các lần chạy (QA_STANDARD §9.1). Số kế tiếp cho từng họ mã: `npm run ids -- <slug>`.
- Bảng chặng đầy đủ (agent · skill · vào · ra): `qa-system/workflows/WORKFLOW.md`.

### 2.2. Khung `00_plan.md`

```markdown
# Kế hoạch · <slug>
Ngày tạo: YYYY-MM-DD · Người lập: <agent/tool> · Mode: <1-4> · Trạng thái: IN-PROGRESS

## Nguồn
- INPUT/<slug>/ (5 ngăn) hoặc OUTPUT/<slug>/00_knowledge_digest.md
- knowledge/_project.md · knowledge/features/<slug>.md

## Lộ trình
- [ ] 01 requirement-risk-summary → 01_requirement_risk_summary.md
- [ ] 02 missing-rule-06w → 02_missing_rule_report.md
- [ ] Cổng ASK: npm run gate <slug>
- [ ] 03 viewpoint-selection → 03_viewpoint_report.md
- [ ] 04 test-idea-design → 04_test_idea_report.md
- [ ] 05 test-case-generation → 05_test_case_spec.md
- [ ] Cổng lint: npm run lint -- <slug>
- [ ] 06 coverage-review → 06_coverage_review.md
```

### 2.3. "Tiếp tục" / "Tiến độ thế nào?"
Người dùng không phải nhớ đường dẫn. Agent tự đóng vai QA Leader: chạy `npm run status`, đọc `00_plan.md`,
xác định task dở và cổng đang đóng (nếu có thì nhắc lại câu hỏi treo), đề xuất chặng kế, chờ xác nhận rồi
nạp đúng đầu vào của chặng đó — không làm lại chặng đã xong.

---

## 3. Quy mô lớn

- **Test case > 50**: không sinh một lượt. `05_test_blueprint.json` (danh mục rút gọn) → lô
  `OUTPUT/<slug>/testcases/batch_01.md`, `batch_02.md`… (~50 TC/lô) → `npm run testcases:merge <slug>`.
- **Dữ liệu > 10 record**: không gõ tay. Agent viết `dataset_schema.json`, chạy `npm run data:gen`
  (0 token LLM), ra `10_dataset.md`.
- **Khối tài liệu lớn**: `npm run knowledge:digest <slug>` chia lô, skill `knowledge-digest` chưng cất có trích nguồn.
- **Hành trình web** (nhánh G): chuẩn hoá Gherkin `Given/When/Then` kèm bảng ánh xạ Step → locator
  (`getByRole`, `getByTestId`, `getByPlaceholder`). Locator chỉ lấy từ app thật / `knowledge/features/<sut>-ui-map.md`.

---

## 4. Vòng tri thức

`OUTPUT/` là kết quả một lần chạy; `knowledge/` là thứ tích luỹ. **Ai ghi mục nào**: QA_STANDARD §8 (một bảng duy nhất).
Câu trả lời của BA/PO là việc của con người: agent chỉ chép nguyên văn khi người dùng đưa, rồi chạy
`npm run knowledge:sync -- <slug> --write`. Lần chạy sau đọc knowledge ⇒ không hỏi lại điều đã chốt.
Khởi tạo: `npm run init` (repo mới) · `npm run knowledge:new <slug>` (tính năng mới).

---

## 5. Ràng buộc bất biến

1. **Chỉ trích hoặc hỏi, không sáng tác** — guard QA_STANDARD §2, nhãn khi thiếu §2.1, FACT §3.
2. **Verdict** PASS / FIX / ASK — QA_STANDARD §1. Dòng meta 10 dòng đầu — §7.
3. **Kiểm bằng máy trước khi báo xong**: `npm run lint -- <slug>` trước khi báo xong Chặng 5/6 (exit `1` ⇒ chưa xong).
   Linter lo phần cơ học; độ phủ nghiệp vụ vẫn là việc của agent và con người.
4. **Giữ gốc sạch**: không tạo file ở root (`TODO.md`, `.cursorrules`…). Mọi kết quả trong `OUTPUT/<slug>/`.

---

## 6. Lệnh

Mục lục đầy đủ + bảng "cần gì → chạy gì": [`qa-system/tools/README.md`](qa-system/tools/README.md).
Hay dùng: `npm run init` · `npm start` · `npm run intake` · `npm run status` · `npm run gate <slug>` ·
`npm run ids -- <slug>` · `npm run lint -- <slug>` · `npm run readiness -- <slug>` ·
`npm run knowledge:sync -- <slug> --write` · `npm run testcases:merge <slug>` · `npm run workflow -- <list|find|start|validate>` ·
`npm test` · `npm run agent:check`.

---

## 7. Zero-CLI

Người dùng là Tester / BA / PO / quản lý — **không gõ lệnh terminal**. Mọi script là công cụ nội bộ của agent.
**Cấm** bảo người dùng *"mở terminal gõ npm run…"*: agent tự chạy ngầm rồi báo kết quả bằng lời.

| Người dùng nói | Agent tự làm |
|---|---|
| *"Bắt đầu từ đâu?"* · *"Thư mục này để làm gì?"* | `npm start`, đọc kết quả cho họ |
| *"Có tài liệu mới trong INPUT, xử lý giúp"* | `npm run intake` |
| *"Tiến độ thế nào?"* | `npm run status` |
| *"Tạo workflow: mỗi khi … thì …"* | skill `workflow-authoring` chế độ TẠO, `validate` xanh, trình bày rồi **chờ** |
| Một câu ngắn như *"BA gửi tài liệu mới"* | `npm run workflow -- find` → `start`, dừng ở mọi cổng |

Bảng ánh xạ đầy đủ: `qa-system/qa-lead/AGENT.md` §5.
