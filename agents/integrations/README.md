# Hướng Dẫn Tích Hợp Đa Nền Tảng (Cross-Tool Integration)

> Thư mục này dành cho **Học viên & Lập trình viên**: Hướng dẫn cách dùng bộ mã nguồn này trên các công cụ AI khác nhau (**Google Antigravity IDE, Cursor, Claude Code CLI, Windsurf, Codex**).

---

## 1. Cơ Chế Hoạt Động Chung (Single Source of Truth)

Toàn bộ hệ thống được điều phối qua một Hiến pháp duy nhất:
👉 **[`AGENTS.md`](../../AGENTS.md)** (nằm ở thư mục gốc).

- **Không tạo file `TODO.md` lộn xộn ở root**: Mọi tiến trình kiểm thử và task list của từng tính năng đều được quản lý tập trung và cập nhật trực tiếp tại:
  `OUTPUT/<task-slug>/00_plan.md`
- **Xem tiến độ bất cứ lúc nào**:
  ```bash
  npm run status
  ```

---

## 2. Cách Sử Dụng Trên Từng Công Cụ

### 🟢 1. Google Antigravity IDE (Khuyến nghị)
- **Cách dùng**: Mở thư mục dự án trong Antigravity.
- Antigravity tự động kích hoạt Planning Mode, đọc `AGENTS.md` và hiển thị giao diện phê duyệt (Proceed Button) trực quan.

### 🟣 2. Cursor IDE / Windsurf
- **Cấu hình sẵn có**: File [`.cursor/rules/agents.mdc`](../../.cursor/rules/agents.mdc) đã được tích hợp sẵn trong repo.
- **Cách dùng**: 
  1. Học viên chỉ cần mở dự án bằng Cursor.
  2. Cursor tự động kích hoạt Rule: Tự đọc `AGENTS.md` và tự động cập nhật checkbox `- [x]` trong `OUTPUT/<task-slug>/00_plan.md` mà học viên không cần cấu hình thêm gì!

### 🟠 3. Claude Code CLI
- **Cấu hình sẵn có**: File [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md) đã được tích hợp sẵn trong repo.
- **Cách dùng**:
  1. Mở terminal tại thư mục dự án và gõ lệnh `claude`.
  2. Claude Code tự động nạp cấu hình và tuân thủ 100% Hiến pháp `AGENTS.md`.
