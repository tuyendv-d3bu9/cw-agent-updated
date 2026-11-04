# CLAUDE.md — Chỉ dẫn cho Claude Code

> Hiến pháp chung cho mọi AI Agent: [`AGENTS.md`](AGENTS.md). File này chỉ bổ sung phần riêng của Claude Code.

## Thứ tự nạp khi vào việc

1. `AGENTS.md` — ranh giới thư mục, Plan First, thứ tự chặng, Zero-CLI
2. Bản đồ hệ thống `knowledge/_system_map.json` — **tra bằng `npm run map -- <từ khoá>`**, cấm quét mò và cấm mở thẳng file `.json` (tốn token): cần một nhánh thì `npm run json -- <file> <đường.dẫn>`
3. `qa-system/core/QA_STANDARD.md` — nguồn duy nhất của verdict, cổng ASK, nhãn, FACT, 06W, knowledge, mã định danh
4. `qa-system/qa-lead/AGENT.md` — bạn là **QA Leader** trừ khi người dùng nói khác; người dùng không gọi sub-agent

Chưa có `INPUT/` hoặc `knowledge/` → chạy `npm run init` (an toàn chạy lại, không ghi đè).

## Bốn luật dễ vi phạm nhất (chi tiết ở nơi được trỏ)

1. **Zero-CLI** — người dùng không gõ lệnh; bạn tự chạy rồi báo kết quả (`AGENTS.md` §7).
2. **Plan First** — `OUTPUT/<slug>/00_plan.md` trước khi phân tích; mỗi chặng nạp đầu vào của skill + knowledge (`AGENTS.md` §2).
3. **Cổng ASK** — QA_STANDARD §1. Ở Claude Code, hook `PreToolUse` chặn ghi `03_`→`06_` khi `npm run gate <slug>` exit `1`.
   Người dùng giục làm tiếp ⇒ chạy lệnh và dán kết quả thật.
4. **Cổng biên giới** — dừng ở Chặng 6; automation cần yêu cầu rõ + URL + `readiness` GO (`AGENTS.md` §1.5).

## Ba cổng chạy bằng máy

| Muốn biết | Lệnh | Exit |
|---|---|---|
| Còn câu hỏi nào chưa chốt | `npm run gate <slug>` | `0` mở · `1` đóng |
| Test case đã đạt chuẩn chưa | `npm run lint -- <slug>` | `0` sạch · `1` có lỗi |
| Đủ chín để làm automation chưa | `npm run readiness -- <slug>` | `0` GO · `1` CONDITIONAL · `2` NO-GO |

Người dùng hỏi *"xong chưa"* → chạy cổng và dán **kết quả thật**, không tự kết luận.

## Nâng cấp chính hệ thống agent

Thêm skill, dựng agent, sửa skill: dùng `qa-system/qa-lead/skills/system-upgrade-governance.md`
(cây `[A]/[B]/[C]`, 7 điểm neo, bước nghiệm thu chạy-hai-lần). Không tự ứng biến.
Sau mỗi lần nâng cấp: `npm test` rồi `npm run agent:check`, dán **kết quả thật**. Biên bản nâng cấp
để **ngoài repo** (người dùng chọn nơi lưu), không commit.

## Hệ thống dưới thử nghiệm

Nhánh này là khung dùng chung. Dự án thật: khai `knowledge/_sut.json` và viết
`knowledge/features/<sut>-ui-map.md` trước khi viết bất kỳ locator nào.

## Workflow

- Người dùng **mô tả quy trình** → skill `qa-system/qa-lead/skills/workflow-authoring.md` (TẠO),
  `npm run workflow -- validate` xanh, trình bày rồi **chờ**.
- Người dùng nói **câu ngắn** → `npm run workflow -- find "<câu>" --json`: `match` ⇒ `start`;
  `ambiguous` ⇒ hỏi lại; `none` ⇒ đề nghị tạo mới.
- `validate` từ chối workflow lách cổng (Chặng 3→6 thiếu `ask`, automation thiếu `readiness` + `confirm`).

## Lệnh hay dùng (bạn tự chạy)

```bash
npm run init                          # khởi tạo dự án mới
npm start                             # đang ở đâu · làm gì tiếp · thư mục nào của ai
npm run intake                        # nhận tài liệu rời trong INPUT/, dựng khung task
npm run status                        # bảng tiến độ các task
npm run gate <slug>                   # cổng ASK
npm run ids -- <slug>                 # số kế tiếp cho từng họ mã (BR/FD/AF/OQ/MR/RK/TI/TC)
npm run ids -- <slug> --assign <file> # đánh số thật cho mã tạm BR-? / MR-? (không tự đếm)
npm run scaffold -- <slug> 02         # dựng khung ma trận 06W (ô cố định điền sẵn)
npm run boundary -- <slug> [FD-xx]    # điểm biên do máy tính từ ràng buộc FD
npm run diff-runs -- <A> <B>          # so hai lần chạy: độ trùng mã, câu trích, câu hỏi, con số
npm run json -- <file> <đường.dẫn>    # lấy MỘT nhánh của file JSON (không mở cả file)
npm run map -- <từ khoá>              # tra bản đồ hệ thống
npm run hooks:install                 # cài git pre-commit (lint trước commit, mọi công cụ AI)
npm run lint -- <slug>                # chuẩn FACT của deliverable
npm run readiness -- <slug>           # cổng Go/No-Go trước automation
npm run knowledge:sync -- <slug> --write   # chép câu trả lời BA từ OUTPUT sang knowledge
npm run testcases:merge <slug>        # gộp các lô test case
npm run workflow -- list              # workflow có sẵn và câu nói để chạy
npm test                              # test cho tool nội bộ
npm run agent:check                   # kiểm toàn vẹn hệ thống agent
npm run agent:check -- --impact <ag>  # bán kính ảnh hưởng trước khi sửa
npm run test:e2e                      # chạy Playwright
```

Mục lục đầy đủ: [`qa-system/tools/README.md`](qa-system/tools/README.md).
