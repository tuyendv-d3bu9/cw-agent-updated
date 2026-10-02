# BẮT ĐẦU — Runbook chuẩn bị trước khi làm bài

> **File này để AI Agent CHẠY, không phải để học viên đọc.**
> Học viên chỉ cần dán **câu khởi động** dưới đây vào AI Agent của mình (Antigravity IDE · Claude Code · Cursor · GitHub Copilot…). Agent tự làm phần còn lại.
>
> Mục tiêu: máy của mọi học viên ra **cùng một trạng thái** trước khi bắt đầu làm bài. Repo đúng nhánh, môi trường chạy xanh, đề đã chọn được ghi lại theo cùng một mẫu.

## Câu khởi động (học viên dán nguyên văn)

```
Clone repo https://github.com/tuyendv-d3bu9/cw-agent-updated nhánh exam,
mở thư mục đó, rồi đọc và làm đúng theo file DE-BAI/BAT-DAU.md.
Tự chạy mọi lệnh, đừng bảo tôi gõ terminal.
```

---

## Luật khi chạy file này

Agent **bắt buộc** tuân thủ trong suốt runbook:

| # | Luật |
|---|---|
| L1 | **Tự chạy mọi lệnh.** Không bảo học viên gõ terminal. Ngoại lệ duy nhất: cài Node.js, Git hoặc IDE, vì đó là phần mềm hệ thống (Bước 1) |
| L2 | **Chỉ ghi đúng một file:** `OUTPUT/_session.md`. Không sửa, không tạo file nào khác trong repo |
| L3 | **Không bắt đầu bài thi.** Không đọc `INPUT/`, không tạo `OUTPUT/<task-slug>/`, không lập `00_plan.md`, không chạy Chặng nào, không nâng cấp agent. Các việc đó được chấm điểm, học viên sẽ tự bắt đầu khi làm bài |
| L4 | **Dán kết quả thật.** Mỗi lệnh phải trích nguyên văn các dòng kết quả chính. Không được ghi "OK" khi chưa chạy |
| L5 | **Lỗi thì dừng và báo, không tự "chữa cháy".** Cấm sửa code, test, cấu hình trong `qa-system/` hay `automation/` để lệnh chạy xanh |
| L6 | **Làm tuần tự Bước 0 → 5.** Bước nào chưa đạt thì không sang bước sau |

---

## Bước 0 — Đưa repo về đúng chỗ, đúng nhánh

| Tình huống | Việc làm |
|---|---|
| Thư mục hiện tại **chưa có** repo | Hỏi học viên muốn đặt repo ở thư mục nào (mặc định: thư mục hiện tại). Chạy `git clone -b exam https://github.com/tuyendv-d3bu9/cw-agent-updated.git`, rồi làm việc trong thư mục `cw-agent-updated` |
| **Đã có** repo (thấy `AGENTS.md` và `DE-BAI/`) | Chạy `git status`. Có thay đổi chưa commit thì **DỪNG**, liệt kê file đang đổi và hỏi học viên có muốn giữ không. Sạch thì `git checkout exam` rồi `git pull` |

**Đạt khi:** `git branch --show-current` in ra `exam`.

Sau bước này, đọc `AGENTS.md` để nắm luật dự án. **Không** đọc thêm file nào khác ngoài những file runbook này chỉ định.

## Bước 1 — Kiểm tra phần mềm trên máy

Chạy và ghi lại phiên bản:

| Lệnh | Đạt khi |
|---|---|
| `node -v` | Từ `v18` trở lên |
| `npm -v` | Có số phiên bản |
| `git --version` | Có số phiên bản |

Thiếu hoặc Node.js dưới 18 thì **DỪNG**. Hướng dẫn học viên cài bản LTS từ `https://nodejs.org` (Git từ `https://git-scm.com`), cài xong mở lại IDE và dán lại câu khởi động.

## Bước 2 — Bốn lệnh chuẩn bị

Chạy lần lượt tại thư mục gốc của repo. Lệnh 2 tải khoảng 150 MB, có thể mất 5–15 phút: cứ chờ, đừng huỷ giữa chừng. Nếu IDE hỏi quyền chạy lệnh hoặc truy cập mạng, xin học viên cho phép.

| # | Lệnh | Đạt khi |
|---|---|---|
| 1 | `npm install` | Kết thúc không có dòng `ERR!` |
| 2 | `npx playwright install chromium` | Tải xong trình duyệt Chromium |
| 3 | `npm run agent:check` | Dòng cuối là `🎉 TOÀN VẸN: agent · skill · bản đồ · workflow · package · cổng ASK đều khớp.`, cả **9 agent** đều `✅ OK` |
| 4 | `npm run test:e2e` | Có dòng `5 passed`, đủ 5 ca `SMOKE-01` → `SMOKE-05` |

Lệnh nào không đạt: tra bảng **Xử lý sự cố** ở `DE-BAI/SETUP.md` §4, làm theo cách xử lý ghi trong đó, rồi chạy lại **đúng lệnh đó**. Vẫn không đạt thì **DỪNG**, trích nguyên văn lỗi và bảo học viên chụp màn hình gửi giảng viên.

## Bước 3 — Hỏi học viên (một lần, đủ ba câu)

Trước khi hỏi, in bảng 2 đề cho học viên xem:

| Đề | Phần A — Nâng cấp hệ thống | Phần B — Nghiệp vụ kiểm thử |
|---|---|---|
| **DE-01** | `[C]` Tinh chỉnh skill sinh test case: thêm trường `Boundary Profile` | Voucher & Chiết khấu (`shopgo-voucher`) |
| **DE-02** | `[A]` Thêm skill chọn bộ test hồi quy vào agent `qa-test-design` | Giỏ hàng & Số lượng (`shopgo-cart-qty`) |

Rồi hỏi **gộp một lần**:

```
1. Họ tên đầy đủ của bạn (có dấu)?
2. Email của bạn (email dùng cho khoá học)?
3. Bạn quyết định làm đề nào: DE-01 hay DE-02?
```

| Câu trả lời | Xử lý |
|---|---|
| Chưa quyết định được đề | Tóm tắt lại khác biệt của 2 đề ở bảng trên, gợi ý học viên đọc nhanh `DE-BAI/DE-01.md` và `DE-BAI/DE-02.md`, rồi hỏi lại câu 3 |
| Trả lời khác `DE-01` / `DE-02` | Hỏi lại. Chỉ có 2 đề |
| Thiếu họ tên hoặc email | Hỏi lại phần còn thiếu |

## Bước 4 — Ghi file phiên `OUTPUT/_session.md`

Tính tên file nộp bài từ họ tên: bỏ dấu tiếng Việt (`đ` → `d`, `Đ` → `D`), bỏ khoảng trắng, viết hoa chữ cái đầu mỗi từ. Ví dụ `Nguyễn Văn An`, DE-01 → `NOP-BAI_NguyenVanAn_De-01.zip`.

Thư mục `OUTPUT/` chưa có thì tạo (thư mục này không nằm trong git). Ghi **đúng** mẫu sau (không thêm, không bớt mục; mục 4 `Nộp bài` sẽ do `DE-BAI/NOP-BAI.md` thêm vào khi nộp bài):

```markdown
# PHIÊN LÀM BÀI · <Họ tên>
Owner: DE-BAI/BAT-DAU.md · Ngày chuẩn bị: <YYYY-MM-DD> · Verdict: <PASS / FIX>

## 1. Học viên
| Mục | Giá trị |
|---|---|
| Họ tên | <Họ tên có dấu> |
| Email | <email> |
| Đề | <DE-01 / DE-02> |
| task-slug | <shopgo-voucher / shopgo-cart-qty> |
| File nộp bài | <NOP-BAI_HoTenKhongDau_De-0x.zip> |

## 2. Môi trường
| Kiểm tra | Kết quả thật |
|---|---|
| Nhánh git | <exam> · commit <7 ký tự đầu của `git rev-parse HEAD`> |
| Node.js / npm / Git | <v.. / .. / ..> |
| npm install | <Đạt / Lỗi: …> |
| Playwright Chromium | <Đạt / Lỗi: …> |
| npm run agent:check | <trích dòng kết quả> |
| npm run test:e2e | <trích dòng `N passed`> |

## 3. Việc cần làm trước khi bắt đầu
- [ ] Đọc `DE-BAI/README.md` và `DE-BAI/<DE-0x>.md`
- [ ] Đọc lướt `DE-BAI/CHEATSHEET-CAU-CHAT.md`
- [ ] Mở `https://cwshopgo.github.io`, làm 6 bước làm quen ở `DE-BAI/SETUP.md` §5
```

`Verdict` là `PASS` khi Bước 1 và cả 4 lệnh ở Bước 2 đều đạt. Ngược lại là `FIX`, và mục 2 phải ghi rõ lệnh nào lỗi.

## Bước 5 — Báo cáo cho học viên rồi DỪNG

In đúng khối sau, rồi **dừng hẳn**. Không đề xuất làm tiếp Phần A hay Phần B.

```
✅ CHUẨN BỊ XONG — <Họ tên> · <DE-0x> · Verdict: <PASS / FIX>

Đã ghi: OUTPUT/_session.md
Môi trường: agent:check <kết quả> · test:e2e <N passed>
File nộp bài của bạn sẽ tên là: <NOP-BAI_..._De-0x.zip>

Trước khi bắt đầu làm bài, bạn nên:
  1. Đọc DE-BAI/README.md và DE-BAI/<DE-0x>.md
  2. Đọc lướt DE-BAI/CHEATSHEET-CAU-CHAT.md
  3. Mở https://cwshopgo.github.io và thử 6 bước ở DE-BAI/SETUP.md §5

Khi bắt đầu làm bài, mở repo này trong IDE và gõ câu đầu tiên:
  "Chào QA Leader. Đọc AGENTS.md và knowledge/_system_map.json để nắm luật dự án.
   Tôi làm đề <số>, task-slug là <slug>. Cho tôi biết hệ thống hiện có gì
   và ta bắt đầu từ đâu."
```

Nếu `Verdict: FIX`, thay dòng `✅ CHUẨN BỊ XONG` bằng `⚠️ CHƯA XONG — còn lỗi ở: <lệnh>`, và nhắc học viên gửi ảnh lỗi cho giảng viên trước khi bắt đầu làm bài.

---

## Chạy lại runbook

Nếu `OUTPUT/_session.md` **đã có**:

1. In lại mục 1 của file đó cho học viên xem.
2. Hỏi: *"Bạn muốn kiểm tra lại môi trường, hay đổi thông tin/đề?"*
3. Kiểm tra lại → làm lại Bước 0–2, cập nhật mục 2 và `Verdict`.
4. Đổi đề → hỏi lại câu 3 ở Bước 3, ghi đè mục 1 (đề, `task-slug`, tên file nộp bài). Nhắc học viên: phần đã làm cho đề cũ trong `OUTPUT/` và `knowledge/` không dùng được cho đề mới.

## Lỗi hay gặp

| Hiện tượng | Nguyên nhân | Xử lý |
|---|---|---|
| Agent không clone được | IDE chặn truy cập mạng / chạy lệnh | Xin học viên cấp quyền chạy lệnh và truy cập mạng cho agent |
| `git pull` báo xung đột | Học viên đã sửa file trong repo | DỪNG, liệt kê file xung đột, hỏi học viên. Không tự `reset --hard` |
| `agent:check` báo thiếu agent | Repo không ở nhánh `exam`, hoặc thiếu file | Kiểm lại Bước 0 |
| `test:e2e` đỏ vì timeout / `net::ERR_` | Máy không vào được `https://cwshopgo.github.io` | Nhờ học viên mở trang bằng trình duyệt. Không vào được thì là do mạng, báo giảng viên |
| Agent bắt đầu đọc `INPUT/` hoặc lập plan | Vi phạm L3 | Dừng lại, chỉ hoàn tất Bước 4–5 |
