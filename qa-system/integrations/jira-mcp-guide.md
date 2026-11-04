# Hướng Dẫn Tích Hợp Jira MCP (Model Context Protocol)

> **Mục tiêu**: Cho phép các AI Coding Assistant (**Google Antigravity IDE, Cursor, Claude Desktop, Windsurf**) tương tác trực tiếp với Jira trong cửa sổ chat thông qua chuẩn giao tiếp MCP (Model Context Protocol) hoặc REST API.

---

## 1. Ba Phương Thức Kết Nối Jira Trong Dự Án

| Phương thức | Khi nào nên dùng? | Cơ chế hoạt động | Chi phí |
|---|---|---|---|
| **1. Jira MCP Server** | AI tự động tra cứu ticket, đọc chi tiết issue, tạo bug trực tiếp lúc pair-programming | JSON-RPC 2.0 stdio (`qa-system/tools/jira/mcp-server.js`) | **Miễn phí 100%** (Dùng Jira Free Plan) |
| **2. REST API Script** | Tự động hóa ngầm, kéo bug hàng loạt (`jira:pull`), phân tích rủi ro kiểm thử | Node HTTPS script (`qa-system/tools/jira/jira-client.js`) | **Miễn phí 100%** |
| **3. CSV Import** | Đẩy hàng trăm test case vào Jira / Xray mà không sợ nghẽn rate-limit | Xuất file UTF-8 BOM (`export_jira_xray.csv`) | **Miễn phí 100%** |

---

## 2. Hướng Dẫn Lấy Jira API Token Miễn Phí (30 Giây)

1. Đăng ký tài khoản Jira Cloud Free (tối đa 10 người dùng vĩnh viễn): [atlassian.com/software/jira/free](https://www.atlassian.com/software/jira/free).
2. Đăng nhập và truy cập trang quản lý bảo mật: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
3. Bấm **Create API token** ➔ Đặt tên gợi nhớ (ví dụ: `cw-qa-agent`) ➔ Sao chép token.
4. Tạo file `.env` ở thư mục gốc dự án (sao chép từ `.env.example`):
   ```env
   JIRA_HOST=https://your-domain.atlassian.net
   JIRA_EMAIL=email-cua-ban@gmail.com
   JIRA_API_TOKEN=ATATT3xFfGF0... (token vừa tạo)
   JIRA_PROJECT_KEY=SHOPGO
   ```

---

## 3. Danh Sách Công Cụ MCP Cung Cấp (Available MCP Tools)

Khi MCP Server được kích hoạt, Agent có quyền sử dụng 5 công cụ sau:

### 1. `jira_check_connection`
- **Mục đích**: Kiểm tra kết nối tới Jira instance, xác nhận thông tin tài khoản và quyền truy cập.

### 2. `jira_search_issues`
- **Mục đích**: Tìm kiếm danh sách issue theo cú pháp JQL (Jira Query Language).
- **Tham số**:
  - `jql` (string): Câu lệnh JQL (ví dụ: `project = "SHOPGO" AND issuetype = Bug AND status = Open`).
  - `maxResults` (number): Số lượng kết quả tối đa (mặc định 20, tối đa 100).

### 3. `jira_get_issue`
- **Mục đích**: Lấy thông tin chi tiết của 1 ticket Jira cụ thể.
- **Tham số**:
  - `issueKey` (string, bắt buộc): Mã ticket (ví dụ: `SHOPGO-101`).

### 4. `jira_create_bug`
- **Mục đích**: Tạo một issue loại Bug mới trên Jira theo chuẩn kỹ thuật.
- **Tham số**:
  - `summary` (string, bắt buộc): Tiêu đề lỗi.
  - `description` (string, bắt buộc): Mô tả chi tiết (Preconditions, Steps, Expected vs Actual).
  - `priority` (string): Mức độ ưu tiên (`Highest`, `High`, `Medium`, `Low`, `Lowest`).
  - `components` (array string): Danh sách component liên quan.

### 5. `jira_pull_defects_to_file`
- **Mục đích**: Kéo toàn bộ Bug/Defect còn mở từ Jira về và ghi ra file `OUTPUT/<task-slug>/jira_defects_summary.md` phục vụ phân tích rủi ro kiểm thử.
- **Tham số**:
  - `taskSlug` (string): Tên thư mục tính năng trong `OUTPUT/`.

---

## 4. Cấu Hình MCP Cho Từng Công Cụ AI

### 🟢 1. Google Antigravity IDE
Hệ thống đã tự động cấu hình sẵn file:
👉 [`.agents/mcp_config.json`](../../.agents/mcp_config.json)
```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```
Antigravity sẽ tự động nhận diện và nạp các tool `jira_*` vào context của Agent.

### 🟣 2. Cursor IDE
File cấu hình đã được tạo sẵn tại:
👉 [`.cursor/mcp.json`](../../.cursor/mcp.json)
```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```

### 🟠 3. Claude Desktop
Thêm vào file cấu hình `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "cw-jira": {
      "command": "node",
      "args": ["<DUONG_DAN_TUYET_DOI_DEN_DU_AN>/qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```

---

## 5. Kiểm Tra Hoạt Động (Self-Test)

### Kiểm tra bằng CLI:
Chạy lệnh kiểm tra kết nối và khởi động MCP server:
```bash
npm run jira:mcp
```
Hoặc chạy lệnh pull qua REST API:
```bash
npm run jira:pull
```
