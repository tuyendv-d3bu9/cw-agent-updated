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

## 2. Hướng Dẫn Tích Hợp Jira MCP (Model Context Protocol)

Hệ thống hỗ trợ MCP Server tương tác trực tiếp 2 chiều với Jira:
👉 Chi tiết xem tại: **[`jira-mcp-guide.md`](./jira-mcp-guide.md)**

- Khởi động server MCP: `npm run jira:mcp`
- Kéo defects tự động: `npm run jira:pull`
- Đẩy test cases chuẩn bị CSV: `npm run jira:push`

---

## 3. Cách Sử Dụng Trên Từng Công Cụ

### 🟢 1. Google Antigravity IDE (Khuyến nghị)
- **Cách dùng**: Mở thư mục dự án trong Antigravity.
- Antigravity tự động kích hoạt Planning Mode, đọc `AGENTS.md` và nạp cấu hình MCP tại `.agents/mcp_config.json`.

### 🟣 2. Cursor IDE / Windsurf
- **Cấu hình MCP sẵn có**: File [`.cursor/mcp.json`](../../.cursor/mcp.json) đã được tích hợp sẵn.
- **Rules sẵn có**: File [`.cursor/rules/agents.mdc`](../../.cursor/rules/agents.mdc) đã được tích hợp sẵn trong repo.
- **Cách dùng**: 
  1. Mở dự án bằng Cursor.
  2. Cursor tự động nạp tool `jira_*`, tự đọc `AGENTS.md` và tự động cập nhật checkbox `- [x]` trong `OUTPUT/<task-slug>/00_plan.md`.

### 🟠 3. Claude Code CLI
- **Cấu hình sẵn có**: File [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md) đã được tích hợp sẵn trong repo.
- **Cách dùng**:
  1. Mở terminal tại thư mục dự án và gõ lệnh `claude`.
  2. Claude Code tự động nạp cấu hình và tuân thủ 100% Hiến pháp `AGENTS.md`.
