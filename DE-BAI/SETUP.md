# CHUẨN BỊ MÔI TRƯỜNG — Làm Trước Khi Bắt Đầu

> **Làm bước này trước khi bắt đầu làm bài.**
> Việc này tải khoảng **150 MB** và mất 5–10 phút tuỳ mạng.

---

## 1. Cần có sẵn trên máy

| Phần mềm | Phiên bản | Kiểm tra bằng |
|---|---|---|
| Node.js | 18 trở lên | `node -v` |
| npm | đi kèm Node.js | `npm -v` |
| Git | bất kỳ | `git --version` |
| Một IDE có Agent Coding | Antigravity IDE · Claude Code · Cursor · GitHub Copilot | |

---

## 2. Cách làm: nhờ AI Agent làm hộ

Mở IDE có Agent Coding, dán **nguyên văn** câu sau vào khung chat:

```
Clone repo https://github.com/tuyendv-d3bu9/cw-agent-updated nhánh exam,
mở thư mục đó, rồi đọc và làm đúng theo file DE-BAI/BAT-DAU.md.
Tự chạy mọi lệnh, đừng bảo tôi gõ terminal.
```

Agent sẽ tự clone repo, chạy 4 lệnh bên dưới, hỏi bạn họ tên, email và **đề bạn quyết định làm**, rồi ghi lại vào `OUTPUT/_session.md`. Bạn chỉ cần trả lời câu hỏi và cho phép agent chạy lệnh khi IDE hỏi.

> Nên đọc lướt [DE-01](DE-01.md) và [DE-02](DE-02.md) để quyết định đề **trước** khi dán câu này. Sau này muốn đổi đề thì dán lại câu này là được.

### Bốn lệnh agent sẽ chạy (để bạn biết, hoặc tự chạy nếu agent không chạy được)

```bash
# 1. Cài thư viện
npm install

# 2. Tải trình duyệt cho Playwright (~150 MB, đây là bước lâu nhất)
npx playwright install chromium

# 3. Kiểm tra hệ thống Agent còn nguyên vẹn
npm run agent:check

# 4. Chạy bộ test mồi để xác nhận mọi thứ hoạt động
npm run test:e2e

# 5. Xem mình đang ở đâu và làm gì tiếp
npm start
```

> Bình thường bạn **không cần** gõ các lệnh này, agent tự chạy. Chỉ tự gõ khi agent báo không chạy được lệnh trên máy bạn.

---

## 3. Kết quả đúng trông như thế nào

**Lệnh 3** — kiểm tra hệ thống Agent. Dòng cuối phải bắt đầu bằng `INTACT`:

```
===============================================================
           AGENT SYSTEM INTEGRITY CHECK (AGENT DOCTOR)          
===============================================================
Discovered 9 agent(s) under qa-system/
🤖 qa-analyst                 ✅ 4 skill
🤖 qa-automation              ✅ 3 skill
🤖 qa-exploratory             ✅ 2 skill
🤖 qa-lead                    ✅ 1 skill
🤖 qa-readiness-evaluator     ✅ 1 skill
🤖 qa-reporter                ✅ 2 skill
🤖 qa-test-data               ✅ 4 skill
🤖 qa-test-design             ✅ 2 skill
🤖 qa-ui-review               ✅ 1 skill

--- Cross-checking knowledge/_system_map.json ---
   9 agent(s) · 50 routing entries

--- Cross-checking qa-system/workflows/WORKFLOW.md ---
   20/20 skill(s) present in the dispatch table

...

INTACT: agents, skills, system map, workflow, package scripts and gates all agree.
```

> Kết quả tool hiển thị bằng tiếng Anh. Bạn không cần đọc hiểu từng dòng —
> chỉ cần dòng cuối bắt đầu bằng `INTACT` và lệnh không báo lỗi.

**Lệnh 4** — bộ test mồi, phải **xanh cả 5 ca**:

```
ok 1 SMOKE-01 Mở được trang chủ và thấy đủ 6 sản phẩm
ok 2 SMOKE-02 Chưa đăng nhập thì không vào được màn Thanh toán
ok 3 SMOKE-03 Đăng nhập bằng tài khoản mẫu thì vào được menu người dùng
ok 4 SMOKE-04 Thêm sản phẩm vào giỏ thì tổng thanh toán đúng đơn giá
ok 5 SMOKE-05 Áp mã GIAM50K cho đơn đủ điều kiện thì giảm đúng 50.000 đ

5 passed
```

**Lệnh 5** — bảng định hướng. Đây là lệnh bạn sẽ dùng lại nhiều nhất:

```
👉 LÀM GÌ TIẾP
  Chưa có task nào. Bắt đầu bằng cách kéo tài liệu của BA vào thư mục INPUT/.
  Rồi nói với agent:  "Tôi vừa bỏ tài liệu vào INPUT, xử lý giúp"

🗺️  THƯ MỤC NÀO LÀ CỦA AI
  📥 CỦA BẠN          INPUT/ OUTPUT/        — thoải mái thêm, sửa, xoá
  🧠 DÙNG CHUNG       knowledge/            — bạn và agent cùng ghi
  ⚙️  MÁY MÓC          qa-system/ automation/ — chỉ đụng khi cố ý nâng cấp
  📖 ĐỌC THÔI         AGENTS.md DE-BAI/     — agent tự đọc, bạn không cần
```

---

## 4. Lạc đường thì gõ gì

| Tình huống | Gõ / nói |
|---|---|
| Không biết bắt đầu từ đâu | `npm start` — hoặc hỏi agent *"tôi nên làm gì tiếp?"* |
| Không biết đang làm tới đâu | *"Tiến độ thế nào rồi?"* |
| Agent dừng lại không chịu làm tiếp | Cổng ASK đang đóng. Hỏi *"cho tôi xem các câu hỏi đang treo"* |
| Muốn biết test case đã đạt chuẩn chưa | *"Kiểm tra test case có đạt chuẩn không"* |
| Muốn biết đã sẵn sàng làm automation chưa | *"Kiểm tra độ sẵn sàng giúp tôi"* |

> Bạn **không cần** nhớ lệnh terminal nào. Mọi dòng trên đều nói được bằng tiếng Việt.
