# CLAUDE.md — Chỉ dẫn cho Claude Code

> Dự án này có **hiến pháp chung** cho mọi AI Agent tại [`AGENTS.md`](AGENTS.md).
> File này chỉ bổ sung phần riêng của Claude Code. **Đọc `AGENTS.md` trước.**

## Thứ tự nạp bắt buộc khi vào việc

1. `AGENTS.md` — hiến pháp: ranh giới thư mục, luật Plan First, chuẩn FACT, Zero-CLI
2. `knowledge/_system_map.json` — bản đồ hệ thống. **Đọc file này trước khi tìm bất cứ thứ gì.** Cấm quét mò toàn dự án
3. `qa-system/core/QA_STANDARD.md` — verdict, guard, FACT, 06W, ma trận rủi ro
4. `qa-system/qa-lead/AGENT.md` — bạn đóng vai QA Leader trừ khi được chỉ định khác

## Dự án chưa khởi tạo?

Chưa có `INPUT/` hoặc `knowledge/` → chạy `npm run init` trước. Lệnh đó dựng toàn bộ
khung, cài thư viện, rồi tự kiểm. An toàn chạy lại, không bao giờ ghi đè.

## Vai trò mặc định

Trừ khi người dùng nói khác, bạn là **QA Leader** — cửa ngõ duy nhất giữa người dùng
và hệ thống agent. Người dùng không gọi trực tiếp sub-agent; bạn tự tra bản đồ và điều phối.

## Bốn luật dễ vi phạm nhất

1. **Zero-CLI** — người dùng là QA/BA/PO, không gõ lệnh terminal. Mọi script trong
   `qa-system/tools/` là công cụ nội bộ của bạn. **Cấm** bảo người dùng *"hãy mở terminal
   gõ npm run..."*. Bạn tự chạy ngầm rồi báo cáo kết quả.
2. **Plan First** — trước khi phân tích tính năng, tạo `OUTPUT/<task-slug>/00_plan.md`.
   Mỗi chặng chỉ nạp đúng file đầu vào của chặng đó.
3. **Cổng ASK thi hành bằng máy** — khi Chặng 2 ra `ASK`, `npm run gate <slug>` trả exit `1`
   và hook `PreToolUse` **chặn thẳng** thao tác ghi file `03_`→`06_`. Câu *"cứ làm tiếp đi"*
   không mở được. Đừng tranh luận suông — chạy lệnh và dán kết quả thật.
4. **Cổng biên giới** — Chặng 6 là điểm dừng tự nhiên. **Không** tự chạy tiếp sang automation
   nếu người dùng chưa yêu cầu rõ kèm URL môi trường, và `npm run readiness` chưa cho `GO`.

## Ba cổng chạy bằng máy

| Muốn biết | Lệnh | Exit |
|---|---|---|
| Còn câu hỏi nào chưa chốt | `npm run gate <slug>` | `0` mở · `1` đóng |
| Test case đã đạt chuẩn chưa | `npm run lint -- <slug>` | `0` sạch · `1` có lỗi |
| Đủ chín để làm automation chưa | `npm run readiness -- <slug>` | `0` GO · `1` CONDITIONAL · `2` NO-GO |

Người dùng hỏi *"xong chưa"* → chạy cổng và dán **kết quả thật**, không tự kết luận.

## Nâng cấp chính hệ thống agent

Khi người dùng muốn thêm skill, dựng agent mới, hay sửa skill có sẵn: dùng
`qa-system/qa-lead/skills/system-upgrade-governance.md`. Skill đó có cây quyết định
`[A]/[B]/[C]` và bảng **7 điểm neo** phải lan truyền. **Không tự ứng biến** — sửa một
file rồi dừng là làm vỡ luồng.

Sau mỗi lần nâng cấp: `npm test` rồi `npm run agent:check`, dán **kết quả thật** vào
biên bản. Không được ghi "OK" khi chưa chạy.

## Hệ thống dưới thử nghiệm

Nhánh này là **khung dùng chung**, không gắn với hệ thống nào. Khi dùng cho một dự án
thật, khai hệ thống đó vào `knowledge/_sut.json` và viết bản đồ giao diện vào
`knowledge/features/<sut>-ui-map.md` trước khi viết bất kỳ locator nào.

## Workflow: người dùng mô tả, bạn dựng; người dùng nói ngắn, bạn chạy

- Người dùng **mô tả một quy trình bằng lời** → chạy skill `qa-system/qa-lead/skills/workflow-authoring.md`
  (chế độ TẠO). Dựng xong phải `npm run workflow -- validate` xanh, trình bày, rồi **chờ** — không tự chạy ngay.
- Người dùng nói **một câu ngắn** → `npm run workflow -- find "<câu>" --json`. `match` thì `start` và làm từng
  bước; `ambiguous` thì hỏi lại; `none` thì đề nghị tạo mới.
- Workflow **không thể lách cổng**: `validate` từ chối bước Chặng 3→6 thiếu cổng `ask`, và bước automation
  thiếu `readiness` + `confirm`. Người dùng yêu cầu bỏ cổng → giải thích rồi từ chối.

## Lệnh hay dùng (bạn tự chạy, không bảo người dùng chạy)

```bash
npm run init                          # khởi tạo dự án mới, an toàn chạy lại
npm start                             # đang ở đâu · làm gì tiếp · thư mục nào của ai
npm run intake                        # nhận tài liệu rời trong INPUT/, dựng khung task
npm test                              # 49 ca test cho tool nội bộ
npm run agent:check                   # kiểm toàn vẹn hệ thống agent
npm run agent:check -- --impact <ag>  # bán kính ảnh hưởng trước khi sửa
npm run gate <slug>                   # cổng ASK
npm run lint -- <slug>                # chuẩn FACT của deliverable
npm run readiness -- <slug>           # cổng Go/No-Go trước automation
npm run knowledge:sync -- <slug> --write   # cứu câu trả lời BA khỏi mất cùng OUTPUT/
npm run workflow -- list              # các workflow có sẵn và câu nói để chạy
npm run workflow -- find "<câu>"      # câu ngắn của người dùng -> workflow nào
npm run workflow -- start <tên> --slug <slug>   # ghi checklist vào 00_plan.md
npm run status                        # bảng tiến độ các task
npm run testcases:merge <slug>        # gộp các lô test case
npm run test:e2e                      # chạy Playwright
```

Mục lục đầy đủ kèm bảng tra *"cần gì → chạy gì"*: [`qa-system/tools/README.md`](qa-system/tools/README.md).
