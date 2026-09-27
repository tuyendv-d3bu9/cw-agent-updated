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
```

> Bình thường bạn **không cần** gõ các lệnh này, agent tự chạy. Chỉ tự gõ khi agent báo không chạy được lệnh trên máy bạn.

---

## 3. Kết quả đúng trông như thế nào

**Lệnh 3** — kiểm tra hệ thống Agent:

```
🤖 Agent: [ qa-lead ] -> ✅ OK
🤖 Agent: [ qa-analyst ] -> ✅ OK
... (8 agent đều OK)
🎉 100% SYSTEM INTEGRITY VERIFIED
```

**Lệnh 4** — bộ test mồi, phải **xanh cả 5 ca**:

```
ok 1 SMOKE-01 Mở được trang chủ và thấy đủ 6 sản phẩm
ok 2 SMOKE-02 Chưa đăng nhập thì không vào được màn Thanh toán
ok 3 SMOKE-03 Đăng nhập bằng tài khoản mẫu thì vào được menu người dùng
ok 4 SMOKE-04 Thêm sản phẩm vào giỏ thì tổng thanh toán đúng đơn giá
ok 5 SMOKE-05 Áp mã GIAM50K cho đơn đủ điều kiện thì giảm đúng 50.000 đ

5 passed
```

**Nếu cả 5 ca xanh, bạn đã sẵn sàng.** Không cần làm gì thêm.

---

## 4. Xử lý sự cố

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `npm install` báo lỗi mạng | Proxy công ty chặn | Thử mạng khác (điện thoại phát wifi), hoặc `npm config set registry https://registry.npmjs.org/` |
| `npx playwright install` tải mãi không xong | File trình duyệt lớn, mạng chậm | Để chạy nền, đừng tắt terminal. Có thể mất tới 15 phút |
| Test đỏ, báo `net::ERR_` hoặc timeout khi mở trang | Không vào được `https://cwshopgo.github.io` | Mở trang đó bằng trình duyệt kiểm tra. Nếu trình duyệt cũng không vào được thì là vấn đề mạng, báo giảng viên |
| Test đỏ nhưng trang web mở bình thường | Có thể site vừa đổi nội dung | Chụp màn hình lỗi gửi giảng viên trước khi bắt đầu làm bài |
| `node` không nhận lệnh | Chưa cài Node.js hoặc chưa thêm vào PATH | Cài lại từ nodejs.org, chọn bản LTS |

---

## 5. Làm quen trước với hệ thống dưới thử nghiệm

Mở `https://cwshopgo.github.io` bằng trình duyệt và thử 5 phút:

1. Xem 6 sản phẩm ở màn Cửa hàng, thử lọc theo danh mục và tìm kiếm.
2. Thêm vài sản phẩm vào giỏ.
3. Bấm **Thanh toán** — chú ý xem điều gì xảy ra khi chưa đăng nhập.
4. Đăng nhập bằng `khachhang@shopgo.vn` / `123456`.
5. Thử áp mã `GIAM50K`, rồi `SALE20`, rồi `HETHAN`, rồi một mã bịa ra.

Hiểu sẵn hệ thống sẽ giúp bạn nhanh hơn rất nhiều ở phần đóng vai BA trả lời câu hỏi.

---

## 6. Đọc trước (không bắt buộc nhưng rất nên)

| File | Vì sao nên đọc |
|---|---|
| [README.md](README.md) | Luật chơi của bài thi |
| Đề mình đã chọn | Biết trước mình phải làm gì |
| [CHEATSHEET-CAU-CHAT.md](CHEATSHEET-CAU-CHAT.md) | Biết cách ra lệnh cho Agent |
| `knowledge/features/shopgo-ui-map.md` | Hiểu hệ thống dưới thử nghiệm |
