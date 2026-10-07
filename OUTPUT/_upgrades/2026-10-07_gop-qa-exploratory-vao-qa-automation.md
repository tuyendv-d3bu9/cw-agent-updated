# BIÊN BẢN NÂNG CẤP HỆ THỐNG · gộp qa-exploratory vào qa-automation
Owner: qa-system/qa-lead/skills/system-upgrade-governance.md · Ngày: 2026-10-07 · Verdict: PASS

## 1. Yêu cầu gốc

> *"phần qa-system/qa-exploratory/ giờ đưa cho qa-automation, rồi làm ngay giờ commit lên develop, exam và sample"*

### Bối cảnh: hệ thống đang ở trạng thái hỏng trước khi nâng cấp

Ba file của `qa-exploratory` đã bị xoá khỏi working tree **mà không qua commit nào**, trong khi
`_system_map.json`, `qa-lead/AGENT.md` và `agent-doctor.js` vẫn trỏ tới chúng. `npm run agent:check`
báo 2 ERROR. Truy vết cho thấy:

| Câu hỏi | Kết luận | Bằng chứng |
|---|---|---|
| Commit nào xoá? | **Không có.** File vẫn nằm trong cây commit của cả 6 nhánh | `git log --name-status` |
| Xoá lúc nào? | Trong khoảng **04/10 16:36 → 07/10 13:57** | `git status` ngày 04/10 chưa thấy dòng `D`; ảnh `git status` ngày 07/10 đã thấy |
| Ai xoá? | **Không xác định được** | Không có trong git, `~/.zsh_history`, 4 transcript Claude Code, `~/.Trash`, local history của IDE |
| Vì sao 3 ngày không ai thấy? | `git checkout` chỉ đụng file **khác nhau** giữa hai nhánh; 3 file này giống hệt ở mọi nhánh nên trạng thái "đã xoá" được giữ nguyên qua mọi lần chuyển nhánh | — |

> Lần xoá đó vi phạm `system-upgrade-governance.md` §KHÔNG-được: *"Không xoá skill/agent cũ để
> 'dọn cho gọn'. Việc gỡ bỏ là quyết định của con người (§6)."* Biên bản này là lần gỡ **có quyết
> định của con người** và có lan truyền đầy đủ.

## 2. Bảng quyết định (cây A/B/C)

| Mục | Nội dung |
|---|---|
| Miền chuyên môn | Khám phá web thật (`web-journey-discovery`) + charter thăm dò cho con người (`exploratory-charter`) |
| Agent ứng viên | `qa-automation` |
| Câu (1) — chỉ đổi hành vi một skill? | **Sai** — chuyển quyền sở hữu skill giữa hai agent, không phải đổi hành vi |
| Câu (2) — có agent đúng miền? | **Có** — `qa-automation` đã lái browser thật và đã ghi `automation/` |
| Câu (3) — có vượt quá một vai trò? | **Có 1 dấu hiệu**, nhưng người dùng đã quyết (xem §6) |
| **Kết luận** | **`[A]` THÊM SKILL VÀO AGENT ĐÃ CÓ** + gỡ agent `qa-exploratory` |

### Phân tích câu (3) — ghi lại trung thực

| Skill | Ba dấu hiệu vượt vai trò | Kết luận kỹ thuật |
|---|---|---|
| `web-journey-discovery` | Đọc artifact khác? **Không** (đã lái browser) · Ghi phân vùng khác? **Không** · Phải thêm "và cũng…"? **Không** (khám phá luồng là bước trước gom cụm luồng) | **Về đúng nhà.** Đầu ra `07_web_journey_discovery.md` vốn đã là đầu vào của `flow-clustering` |
| `exploratory-charter` | Phải thêm mệnh đề "và cũng…"? **CÓ** — đây là việc **do con người thực hiện**, không sinh mã | Theo cây quyết định thuần tuý thì nên tách riêng |

**Người dùng chọn gộp cả hai.** Theo §6, ranh giới vai trò agent là quyết định thiết kế của con
người; skill này đề xuất, người dùng quyết. Đã thực thi theo quyết định đó, kèm biện pháp giảm rủi
ro ở §6.

## 3. Đặt tầng

| Nội dung | Đặt vào tầng | Lý do |
|---|---|---|
| Quy trình mò web, format Gherkin BDD | `qa-system/qa-automation/skills/web-journey-discovery.md` | Quy trình riêng của một việc |
| Quy trình dựng Charter 5 trường | `qa-system/qa-automation/skills/exploratory-charter.md` | Quy trình riêng của một việc |
| Ranh giới ghi `07_*`, luật cấm kịch bản hoá Charter, Human-Final | `qa-system/qa-automation/AGENT.md` | Danh tính, quyền hạn, ranh giới |
| Không sửa `QA_STANDARD.md` | — | Thay đổi không áp cho ≥ 2 skill; hiến pháp tầng luật chung giữ nguyên |

## 4. Lan truyền điểm neo

| # | Điểm neo | File đã sửa | Nội dung thay đổi | Trạng thái |
|---|---|---|---|---|
| N1 | skills/ | `qa-automation/skills/web-journey-discovery.md`<br>`qa-automation/skills/exploratory-charter.md` | `git mv` từ `qa-exploratory/skills/`; sửa dòng `Owner:` và `Người thực hiện:` trỏ về `qa-automation` | ĐÃ XONG |
| N2 | AGENT.md | `qa-automation/AGENT.md` | §1 Là Ai thêm nhánh khám phá + nhánh charter · §2 thêm 4 dòng ranh giới (`03_` đọc, `07_*` ghi, `knowledge/` chỉ đọc) · `Skill sở hữu` 3→5 · §4 thêm luật 4 (cấm kịch bản hoá Charter) và luật 5 (chỉ chạm web thật khi có URL + GO) · **thêm §5 Human-Final** mang từ `qa-exploratory` sang · §6 thêm 2 chốt chặn | ĐÃ XONG |
| N2b | AGENT.md (xoá) | `qa-exploratory/AGENT.md` | `git rm` — agent không còn tồn tại | ĐÃ XONG |
| N3 | WORKFLOW.md | `qa-system/workflows/WORKFLOW.md` | Cây thư mục bỏ `qa-exploratory/` · bảng §2 chặng `7` và nhánh `G1` đổi chủ sở hữu sang `qa-automation` | ĐÃ XONG |
| N4 | _system_map.json | `knowledge/_system_map.json`<br>`qa-system/templates/knowledge/_system_map.json` | `routing_table.web_journey_discovery` trỏ đường dẫn mới · **thêm** `routing_table.exploratory_charter` · xoá `specialized_agents.qa_exploratory` · viết lại `role` của `qa_automation` | ĐÃ XONG |
| N5 | qa-lead/AGENT.md | `qa-system/qa-lead/AGENT.md` | Ma trận §2: dòng "Mò web & Khám phá luồng" đổi sang `qa-automation`; **thêm dòng mới** cho `exploratory-charter` | ĐÃ XONG |
| N6 | agent-doctor.js | `qa-system/tools/system/agent-doctor.js` | `PIPELINE_DEPENDENCIES` node `03` → consumer bước `07` đổi tên thành `qa-automation/exploratory-charter` | ĐÃ XONG |
| N7 | lint-deliverables.js | — | KHÔNG ÁP DỤNG — không thêm/bớt deliverable `NN_`, luật kiểm `05_`/`06_` không đổi | KHÔNG ÁP DỤNG |

### Điểm neo phát sinh ngoài bảng 7 điểm

| File | Vì sao phải sửa |
|---|---|
| `README.md` | Bản đồ thư mục mục 1 liệt kê `qa-exploratory/` (bước B-e của nhánh `[B]`, áp dụng ngược khi gỡ agent) |
| `AGENTS.md` §181 | Hiến pháp chung chỉ đích danh `qa-exploratory` khi nói về luật Gherkin BDD |
| `qa-analyst/AGENT.md` §Bàn giao | Khai bàn giao `03` → `agents/qa-exploratory` |
| `qa-system/workflows/verify-testcase.md` | Runbook trỏ tới đường dẫn skill cũ |
| `qa-automation/skills/pom-generator.md` | Khai nguồn snapshot DOM "từ `qa-exploratory`" — nay là skill cùng agent |
| `knowledge/features/shopgo-ui-map.md` | Chỉ có trên nhánh `sample/function-d-voucher` (file riêng của SUT), sửa khi cherry-pick |

> **Bài học**: bảng 7 điểm neo chưa phủ hết. Bốn file trên (`README.md`, `AGENTS.md`,
> `qa-analyst/AGENT.md`, runbook `workflows/*.md`) phải tìm bằng `grep -rn` toàn repo. Không grep
> thì sót — đúng như lần xoá không-rõ-nguồn ở §1.

## 5. Cổng nghiệm thu — kết quả thật

| # | Kiểm tra | Lệnh | Kết quả thật |
|---|---|---|---|
| G1 | Toàn vẹn cấu trúc | `npm run agent:check` | `INTACT: agents, skills, system map, workflow, package scripts and gates all agree.`<br>`8 agent(s) · 62 routing entries` · `21/21 skill(s) present in the dispatch table`<br>(trước khi sửa: **2 ERROR**) |
| G2 | Bán kính ảnh hưởng | `npm run agent:check -- --impact qa-automation` | `ℹ️ No explicit dependency entry found for: "qa-automation"` — công cụ chưa có node cho agent này, **không phải lỗi**, nhưng là khoảng trống đã ghi nhận ở §6 |
| G3 | Đồng bộ bản đồ | sửa tay `_system_map.json` + bản template | Cả 2 file JSON parse được; `qa_exploratory` đã biến mất khỏi `specialized_agents`; agent đếm được 8 |
| G3b | Test tool nội bộ | `npm test` | `ℹ tests 81 · ℹ pass 81 · ℹ fail 0` |
| G4 | Smoke luồng cũ | `npm run workflow -- validate` | 11/11 workflow `ok` (gồm `verify-testcase` vừa sửa đường dẫn skill), `EXIT=0` |

### Kiểm tra thủ công

- [x] `## Skill sở hữu` của `qa-automation` khớp từng dòng với 5 file trong `skills/`
- [x] Không còn placeholder `<…>` sót lại
- [x] `grep -rn "qa-exploratory"` toàn repo → **sạch** (trừ `OUTPUT/function-d-voucher/*`, xem §6)
- [x] Đường dẫn viết đúng hoa/thường

## 6. Rủi ro còn lại & việc cần người quyết

1. **`exploratory-charter` nằm trong `qa-automation` là một thoả hiệp có chủ ý.** Skill này mô tả
   việc **do con người làm**, trong khi phần còn lại của agent sinh mã và chạy máy. Đã giảm rủi ro
   bằng cách: tách thành mục riêng trong §1, gắn nhãn *"Độc lập, không thuộc pipeline tự động hoá"*
   trong `Skill sở hữu`, thêm luật §4.4 cấm dùng Charter làm đầu vào sinh mã, và mang nguyên mục
   **Human-Final** từ `qa-exploratory` sang. Nếu sau này thấy `qa-automation` bị quá tải vai trò,
   tách `exploratory-charter` ra agent riêng là việc một bước.

2. **`OUTPUT/function-d-voucher/*` vẫn ghi `qa-exploratory`** (các file `07_`, `07b_`, `00_plan.md`,
   `reports/readiness-report.md`). **Cố ý không sửa** — đây là hồ sơ của những lượt chạy đã diễn ra
   trong quá khứ; sửa lại là làm sai lệch bằng chứng. Hồ sơ mới sẽ tự mang tên `qa-automation`.

3. **`agent-doctor.js --impact` chưa có node cho `qa-automation`** (`PIPELINE_DEPENDENCIES` mới phủ
   `01`–`05`, `09`). Nghĩa là G2 hiện không đo được bán kính ảnh hưởng cho nhánh automation. Nên bổ
   sung node `07` và nhóm `G1`–`G4` trong một lần nâng cấp sau.

4. **Chưa ai xác định được người xoá 3 file ban đầu.** Nếu thao tác đó đến từ một công cụ tự động
   nào đó đang chạy trên máy, nó có thể lặp lại với thư mục khác. Đề nghị bật cảnh báo bằng cách
   chạy `npm run agent:check` trong hook trước mỗi commit.
