# RUNBOOK — Chạy Một Mạch: Requirement ➔ Test Case ➔ Automation (Project Tốt Nghiệp)

> File này để **CHẠY**, không phải để đọc tham khảo.
> Cách dùng: nói với agent *"Đọc `qa-system/workflows/run-graduation.md` và thực hiện với task-slug = `<slug>`."*
> Bản đồ toàn hệ thống: `qa-system/workflows/WORKFLOW.md`. Luật chung: `qa-system/core/QA_STANDARD.md`.

Runbook này gộp **nhánh A (`01`→`06`)** và **nhánh Automation** thành một chuỗi liền mạch, có 2 điểm dừng bắt buộc.

---

## 0. Tham số

| Tham số | Giá trị | Ghi chú |
|---|---|---|
| `task-slug` | một trong: `shopgo-voucher` (DE-01) · `shopgo-cart-qty` (DE-02) | Theo đề học viên đã chọn |
| `input` | `INPUT/<task-slug>/` | Có sẵn 2 ngăn: `01_business/`, `02_ba/` |
| `feature knowledge` | `knowledge/features/<task-slug>.md` | Chưa có thì tạo từ `knowledge/_template.md` |
| `SUT` | `https://cwshopgo.github.io` | |
| `ticket` | `<mã ticket của học viên>` | Dùng đặt tên thư mục run, ví dụ `RUN-01_VCHR-Regression` |

## 1. Nạp trước (đọc một lần, đầu phiên)

```
qa-system/core/QA_STANDARD.md
knowledge/_system_map.json
knowledge/_project.md
knowledge/features/shopgo-ui-map.md
knowledge/features/<task-slug>.md        (nếu đã có)
```

> `shopgo-ui-map.md` là tri thức nền **bắt buộc** cho ShopGo. Không đọc file này mà tự mò DOM là vi phạm nguyên tắc "System Map First" (`AGENTS.md` §1.3).

---

## 2. GIAI ĐOẠN 0 — Cổng tiếp nhận (QA Leader)

Trước khi lập plan, QA Leader làm 2 việc:

1. **Gap Assessment** — đối chiếu 5 ngăn của `INPUT/<task-slug>/`:

   | Ngăn | Trạng thái mong đợi | Nếu thiếu |
   |---|---|---|
   | `01_business/` | Có | — |
   | `02_ba/` | Có (**BẮT BUỘC**) | DỪNG, yêu cầu bổ sung |
   | `03_dev/` | **Không có** | Ghi nhận rủi ro: chỉ test được mức hộp đen / giao diện |
   | `04_design/` | **Không có** | Ghi nhận rủi ro: chưa verify được bố cục, màu sắc, khoảng cách |
   | `05_communication/` | **Không có** | Ghi nhận rủi ro: chưa có kênh ghi nhận câu hỏi cho BA |

2. **Outcome Alignment** — chốt Mode. Project tốt nghiệp chạy **Mode 4 (Full Automation)**, đi qua toàn bộ `01`→`06` rồi sang automation.

Ghi kết quả vào đầu `OUTPUT/<task-slug>/00_plan.md`.

---

## 3. GIAI ĐOẠN 1 — Thiết kế kiểm thử (`01` → `06`)

Chạy tuần tự. **Sau MỖI bước**: ghi file output → cập nhật `OUTPUT/<task-slug>/_index.md` → in verdict ra màn hình → mới sang bước kế.

| Bước | Agent + Skill | Vào | Ra |
|---|---|---|---|
| `B1` | `qa-analyst` + `requirement-risk-summary` | `INPUT/<task-slug>/**` | `01_requirement_risk_summary.md` · cập nhật `knowledge/features/<task-slug>.md` |
| `B2` | `qa-analyst` + `missing-rule-06w` | `01` + knowledge | `02_missing_rule_report.md` · cập nhật knowledge mục 7 |
| `B3` | `qa-analyst` + `viewpoint-selection` | `01` + `02` | `03_viewpoint_report.md` |
| `B4` | `qa-analyst` + `test-idea-design` | `01` + `03` | `04_test_idea_report.md` |
| `B5` | `qa-test-design` + `test-case-generation` | `01` + `03` + `04` | `05_test_case_spec.md` |
| `B6` | `qa-test-design` + `coverage-review` | `01` + `03` + `05` | `06_coverage_review.md` |

### ⛔ ĐIỂM DỪNG 1 — sau `B2`

`B2` gần như chắc chắn ra **`Verdict: ASK`**: tài liệu BA của ShopGo có kẽ hở nghiệp vụ thật.

**Đây là hành vi đúng, không phải lỗi.** Khi gặp `ASK`:

1. Agent DỪNG, in bảng câu hỏi cho BA/PO.
2. **Người học đóng vai BA** và trả lời từng câu. Câu trả lời phải là quyết định nghiệp vụ dứt khoát, không phải "tuỳ".
3. Ghi câu trả lời vào `knowledge/features/<task-slug>.md`:
   - Mục 7 — đổi `Trạng thái` của dòng tương ứng từ `New` sang `Confirmed`, điền cột `Phản hồi chính thức`.
   - Mục 8 — thêm dòng vào bảng `GIẢ ĐỊNH ĐÃ ĐƯỢC CHỐT` kèm người phê duyệt và ngày.
4. Chạy lại `B2`. Lần này các mục đã `Confirmed` **không được báo lại** là kẽ hở mới.
5. Verdict thành `PASS` → chạy tiếp `B3`.

> **Đây là bài học trọng tâm của cả buổi**: hệ thống biết dừng lại hỏi thay vì bịa ra quy tắc, và tri thức đã chốt thì không hỏi lại lần hai.

### Nếu số test case dự tính vượt 50

Theo `AGENTS.md` §3, `B5` chuyển sang quy trình 3 giai đoạn:
`05_test_blueprint.json` → `testcases/batch_01.md`, `batch_02.md`… → gộp thành `05_test_case_spec.md`.

---

## 4. ⛔ ĐIỂM DỪNG 2 — Cổng biên giới trước Automation

`AGENTS.md` §1.5 cấm tự ý chạy thẳng từ test case sang automation. Chỉ đi tiếp khi đủ **cả ba**:

- [ ] `06_coverage_review.md` đã có, không còn rule nào ở trạng thái `CHƯA COVER` mà chưa giải trình.
- [ ] Người dùng nêu rõ yêu cầu automation kèm URL môi trường (`https://cwshopgo.github.io`).
- [ ] Đã chọn xong phạm vi đợt chạy (`ticket`) — chạy bao nhiêu trong tổng số test case, không mặc định chạy hết.

---

## 5. GIAI ĐOẠN 2 — Automation (`qa-automation`)

### `B7` — Gom cụm luồng

- Agent + Skill: `qa-automation` + `flow-clustering`
- Vào: `05_test_case_spec.md`
- Ra: `OUTPUT/<task-slug>/runs/<ticket>/run_plan.md` — danh sách test case thuộc phạm vi đợt chạy, đã gom theo hành trình người dùng chung.

### `B8` — Sinh Page Object Model

- Agent + Skill: `qa-automation` + `pom-generator`
- Vào: `run_plan.md` + **`knowledge/features/shopgo-ui-map.md`**
- Ra: bổ sung / mở rộng `automation/pages/*.ts`

**Ràng buộc bắt buộc cho ShopGo** (vi phạm là `Verdict: FIX`):

1. **CẤM `page.goto(<path>)`** để chuyển màn. Chỉ `BasePage.open()` được gọi `goto`, và chỉ tới trang chủ.
2. Locator theo thứ tự ưu tiên: `#id` trong `shopgo-ui-map.md` → `getByRole` → `getByPlaceholder` → `getByText`.
3. **CẤM** XPath tuyệt đối và class CSS băm (`css-1x2y3z`).
4. Kế thừa `BasePage`, không viết lại phần điều hướng.
5. So sánh tiền phải qua `BasePage.parseMoney()`, không so chuỗi thô.

### `B9` — Viết kịch bản kiểm thử

- Ra: `automation/tests/<scope>.spec.ts`
- Mỗi test case trong `run_plan.md` ánh xạ tới **một** khối `test(...)`, tên test bắt đầu bằng `TC_ID`.
- `beforeEach` gọi `open()` rồi `resetState()` để mỗi ca chạy trên trạng thái sạch.

### `B10` — Chạy và thu thập bằng chứng

- Agent + Skill: `qa-automation` + `test-runner-evidence`
- Chạy: `npm run test:e2e`
- Ra:
  - `OUTPUT/<task-slug>/runs/<ticket>/run_result.md` — bảng `TC_ID · Trạng thái · Kết quả thực tế · Đường dẫn ảnh`
  - `OUTPUT/<task-slug>/runs/<ticket>/evidence/*.png`
  - `OUTPUT/<task-slug>/runs/<ticket>/run_defects.md` — nếu có ca `FAIL`

> **Ca `FAIL` không phải là điểm trừ.** PRD có mâu thuẫn với hệ thống thật, nên `FAIL` có thể là bằng chứng phát hiện lỗi tài liệu. Điều bị trừ điểm là `FAIL` mà không giải trình được nguyên nhân.

---

## 6. Kiểm nhanh sau mỗi bước (30 giây, không bỏ)

| Bước | Nhìn đúng 2 thứ này |
|---|---|
| `B1` | Có ma trận rủi ro 3x3 không? Có tối thiểu 5 Open Question không? |
| `B2` | Ma trận 06W có đủ `W1`→`W6` không? `W` nào không ra vấn đề có ghi rõ không? |
| `B3` | Các viewpoint có chồng lấn nhau không? |
| `B4` | Cột `Lý do filter` có trích đúng nguyên văn checklist Giữ/Bỏ không? |
| `B5` | Chọn ngẫu nhiên 1 test case: `Test Data` có giá trị thật (`150.000 ₫`) hay còn placeholder? |
| `B6` | Mọi `BR-xx` đều có TC cover, hoặc ghi rõ `CHƯA COVER` kèm lý do? |
| `B8` | Mở file POM: còn dòng `page.goto` nào ngoài `BasePage.open()` không? |
| `B10` | Mỗi ca `FAIL` có ảnh bằng chứng tương ứng không? |

---

## 7. Truy vết ngược để nghiệm thu

Chọn **một** test case bất kỳ trong `05_test_case_spec.md`, đi ngược đủ 5 chặng:

```
Test Case → Tags: Rule#BR-xx, Viewpoint#VP-xx
          → 04_test_idea_report.md        (idea nào sinh ra nó, vì sao "Giữ")
          → 03_viewpoint_report.md        (viewpoint đó thuộc risk area nào)
          → knowledge/features/<slug>.md  (BR-xx nội dung gì, ai xác nhận, ngày nào)
          → INPUT/<slug>/02_ba/PRD_*.md   (câu chữ gốc trong tài liệu BA)
```

Đứt ở chặng nào thì đó là lỗi truy vết, test case chưa dùng được.

---

## 8. Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Agent chạy thẳng ra test case, bỏ `B2`–`B4` | Câu lệnh bị rút gọn, mất ràng buộc "dừng in verdict sau mỗi bước" | Trỏ lại đúng file runbook này |
| `B2` hỏi lại đúng câu đã trả lời | Agent không đọc `knowledge/features/<slug>.md` | Kiểm phần "Nạp trước" §1 đã có file knowledge chưa |
| Test automation đỏ hàng loạt ngay ca đầu | POM dùng `page.goto` để chuyển màn | Sửa theo ràng buộc `B8` mục 1 |
| So sánh tiền luôn lệch | So chuỗi thô, dính khoảng trắng hẹp và ký tự `₫` | Dùng `BasePage.parseMoney()` |
| Ca test lúc xanh lúc đỏ | Không dọn `localStorage` giữa các ca | `beforeEach` phải gọi `resetState()` |
| Đặt hàng xong không thấy hoá đơn | Tiến trình 4 giai đoạn mất ~3,2 giây | Dùng `waitForReceiptAndClose()` thay vì `click` ngay |
