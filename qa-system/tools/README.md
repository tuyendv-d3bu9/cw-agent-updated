# agents/tools — Công cụ nội bộ của hệ thống Agent

> ⚠️ **Người dùng KHÔNG gõ các lệnh này** (luật Zero-CLI, `AGENTS.md` §7).
> Đây là tay chân của Agent. Agent tự chạy ngầm rồi báo cáo kết quả bằng tiếng Việt.

Tool được gom theo **nhóm chức năng**, mỗi nhóm một thư mục. Cần việc gì thì mở đúng
thư mục đó, không phải quét cả 16 file.

```
lib/          ← code dùng chung, KHÔNG gọi trực tiếp
intake/       ← đưa tài liệu từ ngoài vào INPUT/
knowledge/    ← khởi tạo & soát tri thức trong knowledge/
testcase/     ← gộp và xuất test case
testdata/     ← sinh dữ liệu kiểm thử
jira/         ← mọi giao tiếp với Jira
system/       ← tự kiểm, tiến độ, bản đồ, cổng ASK
```

---

## Bảng tra nhanh: cần gì → chạy gì

| Cần làm gì | Lệnh | File |
|---|---|---|
| **Khởi tạo dự án mới (chạy đầu tiên)** | `npm run init` | `system/init.js` |
| **Xem đang ở đâu, làm gì tiếp** | `npm start` | `system/start.js` |
| Nhận tài liệu mới, phân loại vào 5 ngăn | `npm run intake -- <file\|thư-mục> [--slug <slug>]` | `intake/intake.js` |
| **Xử lý tài liệu số lượng lớn (>100 files, đa luồng)** | `npm run intake:bulk [-- <thư-mục>] [--dry-run]` | `intake/bulk-intake.js` |
| Chỉ đổi docx/pdf/xlsx sang .md (không phân loại) | `npm run convert -- <file>` | `intake/convert.js` |
| Tạo file tri thức cho tính năng mới | `npm run knowledge:new <slug>` | `knowledge/new-knowledge.js` |
| Dựng `knowledge/` cho repo trắng | `npm run knowledge:init` | `knowledge/bootstrap-knowledge.js` |
| Soát mâu thuẫn rule giữa các tính năng | `npm run knowledge:conflicts [slug]` | `knowledge/conflict-detector.js` |
| **Chuyển câu trả lời BA từ OUTPUT sang knowledge** | `npm run knowledge:sync -- <slug> --write` | `knowledge/sync-answers.js` |
| Gộp `batch_*.md` thành spec tổng | `npm run testcases:merge <slug>` | `testcase/merge-testcases.js` |
| Xuất CSV Jira Xray / Redmine | `npm run testcases:export <slug>` | `testcase/export-testcases.js` |
| Sinh dataset (0 token LLM) | `npm run data:gen -- --slug <slug> --schema <f.json> --count 50` | `testdata/generate-dataset.js` |
| Kéo bug/defect từ Jira về | `npm run jira:pull <slug>` | `jira/jira-client.js` |
| Đẩy test case lên Jira (hoặc xuất CSV) | `npm run jira:push <slug>` | `jira/jira-client.js` |
| Đẩy kết quả chạy + ảnh bằng chứng lên Jira | `npm run jira:sync <slug> <run-id>` | `jira/jira-client.js` |
| Khởi động MCP server cho AI IDE | `npm run jira:mcp` | `jira/mcp-server.js` |
| Xem tiến độ mọi task | `npm run status` | `system/status.js` |
| Tự kiểm toàn vẹn hệ thống agent | `npm run agent:check` | `system/agent-doctor.js` |
| Xem bán kính ảnh hưởng trước khi sửa | `npm run agent:check -- --impact <agent>` | `system/agent-doctor.js` |
| Đồng bộ bản đồ hệ thống | `npm run map:sync` | `system/sync-system-map.js` |
| **Kiểm cổng ASK trước khi sinh chặng 3→6** | `npm run gate [slug]` | `system/gate.js` |
| Soát dấu vết nhảy cóc cổng ASK | `npm run gate:audit [slug]` | `system/gate.js` |
| **Đo độ sẵn sàng trước Automation** | `npm run readiness -- <slug> --write` | `system/readiness.js` |
| **Kiểm chuẩn FACT của deliverable** | `npm run lint -- <slug>` | `system/lint-deliverables.js` |
| **Tạo / tìm / chạy workflow** | `npm run workflow -- <list\|find\|show\|start\|new\|validate>` | `system/workflow.js` |
| **Chạy test cho chính các tool này** | `npm test` | `__tests__/` |

---

## `lib/` — code dùng chung

Không có entry point, không có script npm. Mọi tool khác `require` vào đây.
Trước khi viết một hàm tiện ích mới, kiểm tra ở đây đã có chưa.

| File | Giữ cái gì | Vì sao tồn tại |
|---|---|---|
| `paths.js` | `PATHS.ROOT/INPUT/OUTPUT/KNOWLEDGE/...`, `taskDir()`, `featureKnowledge()`, `listTaskSlugs()` | Trước đây 6 tool tự tính `path.resolve(__dirname,'../..')`. Gom tool vào thư mục con là độ sâu đổi → sai hết. Giờ chỉ một chỗ biết gốc repo ở đâu. |
| `env.js` | `loadEnv()`, `jiraConfig()` | `loadEnv()` từng bị chép nguyên văn ở 4 file Jira. |
| `jira-api.js` | `request()`, `jiraRequest()`, `jiraAttach()`, `adf()` | Từng có 4 bản `makeRequest` khác chữ ký, chỉ 2 bản có timeout. |
| `doc-converter.js` | Chuyển docx/xlsx/pdf/yaml/txt → markdown sạch | Thư viện dùng chung của `intake/` — không phải tool chạy riêng. |

---

## Cổng ASK — 3 lớp (`system/gate.js` + `system/gate-hook.js`)

`AGENTS.md` §1.6 cấm nhảy cóc sang chặng 3→6 khi Verdict còn `ASK`.
Luật viết bằng văn bản chỉ là *xác suất* — model vẫn có thể bị câu *"cứ làm tiếp đi"*
thuyết phục. Ba lớp dưới đây biến luật đó thành *điều kiện kiểm được bằng máy*:

| Lớp | Cơ chế | Chặn được gì | Hiệu lực ở đâu |
|---|---|---|---|
| 1 | `npm run gate` → exit code `0` mở / `1` đóng, ghi `OUTPUT/<slug>/_gate.lock` | Bất kỳ ai chịu gọi | Mọi IDE |
| 2 | Hook `PreToolUse` trong `.claude/settings.json` → `gate-hook.js` trả `permissionDecision: deny` | Thao tác ghi file 03→06, **harness chặn, model không cãi được** | Chỉ Claude Code |
| 3 | `npm run gate:audit` → exit `2` nếu có file 03→06 sinh ra sau mốc khoá | Phát hiện *hậu kiểm* khi ai đó lách được lớp 1 và 2 | Mọi IDE |

**Hai đường mở khoá duy nhất** (khớp `AGENTS.md` §1.6):
1. BA/PO trả lời → ghi vào **Mục 7** của `knowledge/features/<slug>.md`, cột *Phản hồi chính thức*, Trạng thái → `Confirmed`.
2. Quyết định nghiệp vụ tường minh → ghi vào **Mục 8** (`GIẢ ĐỊNH ĐÃ CHỐT`).

Cả hai đều là thay đổi **có dấu vết trong tri thức dự án**. Không có đường nào mở bằng lời nói.

---

## Thêm tool mới

1. Chọn đúng nhóm. Không vừa nhóm nào thì cân nhắc kỹ trước khi tạo nhóm mới —
   thêm thư mục là thêm thứ phải nhớ.
2. Lấy đường dẫn từ `lib/paths.js`. **Không** dùng `process.cwd()` (vỡ khi chạy từ
   thư mục khác) và **không** tự tính `__dirname/../..` (vỡ khi file bị di chuyển).
3. Khai báo script vào `package.json` theo quy ước `<nhóm>:<việc>`.
4. Thêm một dòng vào bảng tra nhanh ở trên.
5. Nếu tool sinh ra deliverable mới: khai thêm vào `PIPELINE_DEPENDENCIES` của
   `system/agent-doctor.js` để phân tích bán kính ảnh hưởng còn đúng.
6. Chạy `npm run agent:check` và dán **kết quả thật** vào biên bản nâng cấp.

---

## Cổng Go/No-Go trước Automation (`system/readiness.js`)

Cùng triết lý với cổng ASK: **số liệu do máy đo, agent chỉ diễn giải**. Trước đây skill
`gen-readiness-report` tự đếm bằng mắt, mà lại đọc 5 file của một dự án khác
(`coverage-plan.json`, `voucher-spec.json`, `testcases/*.csv`…) — không file nào do pipeline
này sinh ra, nên cổng luôn báo "không tìm thấy" rồi vẫn kết luận.

`npm run readiness -- <slug> --write` đọc deliverable thật (`01_` `02_` `03_` `05_` `06_` `12_`
và `knowledge/features/<slug>.md`), tính độ phủ viewpoint/rule, tỷ lệ trace, trạng thái cổng ASK,
rồi ghi `OUTPUT/<slug>/15_readiness_metrics.json`.

| Exit code | Khuyến nghị |
|:---:|---|
| `0` | **GO** — trace 100%, phủ đủ viewpoint và rule, cổng ASK mở, Chặng 6 PASS, tri thức đã ghi vào `knowledge/` |
| `1` | **CONDITIONAL GO** — còn điều kiện kèm theo |
| `2` | **NO-GO** — có điểm chặn phải xử lý xong |

> ⚠️ `GO` **chưa đủ** để chạy Automation. Cổng biên giới (`AGENTS.md` §1.5) còn đòi
> người dùng yêu cầu rõ ràng **và** URL môi trường cụ thể.

---

## Linter deliverable (`system/lint-deliverables.js`)

`AGENTS.md` §5 và `QA_STANDARD.md` đặt chuẩn rất chặt — 8 trường, Title mở đầu bằng
Verify/Validate/Confirm, Tags phải trích `Rule#` và `Viewpoint#`, cấm placeholder,
cấm ô bảng trống, quét đủ W1→W6. Nhưng thứ duy nhất kiểm những chuẩn đó lại là
`coverage-review`, tức **LLM tự chấm bài của LLM**.

`npm run lint -- <slug>` biến chuẩn thành điều kiện kiểm được bằng máy:

| Nhóm luật | Kiểm gì |
|---|---|
| Test case | `TC_ID` đúng `[MODULE]-[001]` · không trùng · đủ 7 trường còn lại · Title đúng động từ · Steps đánh số và ≤ 8 · Priority hợp lệ · Tags có `Rule#`+`Viewpoint#` · không placeholder |
| Dòng meta | `Owner:` và `Verdict:` nằm trong 10 dòng đầu (QA_STANDARD §7) |
| 06W | `02_` quét đủ W1→W6 (QA_STANDARD §4) |
| Bảng | Không ô nào để trống (QA_STANDARD §2.7) |

Exit `0` = sạch hoặc chỉ cảnh báo · `1` = có lỗi phải sửa.

> **Nguyên tắc khi mở rộng linter: thà bỏ sót còn hơn kêu oan.**
> Bản đầu bắt nhầm `<script>alert('XSS')</script>` (payload XSS hợp lệ) và `SG-XXXXXX`
> (mô tả định dạng mã đơn) là placeholder, lại báo "thiếu Verdict" cho file đang có
> `**Verdict Chặng 1**:`. Linter kêu oan thì người ta tắt nó đi — hỏng đúng mục đích.
> Luật mới phải được thử trên deliverable thật trước khi bật.

---

## `__tests__/` — test cho chính các tool

```bash
npm test        # 49 ca, chạy bằng node:test có sẵn, không thêm thư viện nào
```

Mỗi ca ở đây là **một lỗi đã xảy ra thật**, không phải test cho đủ hình thức.
Trong một phiên làm việc, các tool này hỏng 9 lần và **không lần nào lộ ra khi
đọc code** — chỉ lộ khi chạy trên dữ liệu thật hoặc trên một dự án trắng:

| Lỗi | Ca test giữ chỗ |
|---|---|
| `\Z` không tồn tại trong regex JS → Mục 8 cuối file không đọc được, đường mở khoá cổng ASK im lặng hỏng | `gate.test.js` |
| Từ khoá `email` đẩy mọi PRD đăng nhập sang `05_communication` → Cổng 0 báo thiếu `02_ba` | `intake.test.js` |
| `slugify` nuốt nguyên âm tiếng Việt → `Giỏ Hàng` thành `gi-hng` | `intake.test.js` |
| `03_dev` đòi đúng chữ `database schema` nên trượt `DB schema` | `intake.test.js` |
| Linter coi payload XSS và `SG-XXXXXX` là placeholder | `lint.test.js` |
| Linter báo trùng giữa `batch_*.md` và spec tổng, trong khi batch là nguồn được gộp vào spec | `lint.test.js` |
| Linter ép `Rule#BR-<số>` nên báo oan `Rule#GAP-H2` | `lint.test.js` |
| Thiếu một trường bị báo thành hai lỗi (điểm dừng regex sai) | `lint.test.js` |
| `_comment` trong schema biến thành một cột dữ liệu rác | `readiness.test.js` |

**Khi sửa một tool, viết ca test trước.** Nếu không tái hiện được lỗi bằng test
thì chưa hiểu lỗi.

Quy ước: file `*.test.js`, dùng `helpers.js` để dựng dự án giả trong thư mục tạm —
test không bao giờ đụng vào `OUTPUT/` hay `knowledge/` thật.
