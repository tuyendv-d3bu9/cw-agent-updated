# Workflow: Đồng Bộ Jira & Redmine (Export / Push / Pull)

> **Mục đích**: Chuẩn hóa quy trình đưa Test Case từ Agent lên Jira Xray / Redmine và kéo danh sách Bug về phân tích rủi ro.

---

## 1. Trách Nhiệm Phân Vai

| Vai trò | Phụ trách | Tác vụ |
|---|---|---|
| **`qa-lead`** | Điều phối tổng thể | Nhận lệnh tự nhiên từ User, ủy quyền cho chuyên gia tương ứng và phản hồi kết quả |
| **`qa-reporter`** | Defect Sync & Reporting | Kéo danh sách Bug/Defect từ Jira/Redmine về lưu `jira_defects_summary.md`, chuẩn hóa bug report 7 trường và hỗ trợ push |
| **`qa-analyst`** | Defect Ingestion | Đọc `jira_defects_summary.md` (do `qa-reporter` kéo về) để bổ sung vào `01_requirement_risk_summary.md` |
| **`qa-test-design`** | Test Case Export | Sinh `05_test_case_spec.md` ➔ Tự gọi `export-testcases.js` xuất CSV |

---

## 2. Các Kịch Bản Thao Tác (100% Zero-CLI)

### Kịch bản A: Xuất File CSV Để Import Thủ Công
1. **User yêu cầu**: *"Xuất test case ra file cho Jira Xray và Redmine"*
2. **QA Leader điều phối**:
   - Ủy quyền cho `qa-test-design` chạy ngầm: `node qa-system/tools/testcase/export-testcases.js <task-slug>`
   - Báo cáo kết quả:
     - `OUTPUT/<task-slug>/export_jira_xray.csv` (Chuẩn UTF-8 BOM, 10 cột Xray)
     - `OUTPUT/<task-slug>/export_redmine.csv` (Chuẩn UTF-8 BOM, 6 cột Redmine)

### Kịch bản B: Đẩy Trực Tiếp Lên Jira Qua API
1. **User yêu cầu**: *"Đẩy test case lên Jira"*
2. **QA Leader điều phối**:
   - Ủy quyền cho `qa-test-design` chạy ngầm: `node qa-system/tools/jira/jira-client.js push <task-slug>`
   - Nếu có file `.env`, hệ thống push trực tiếp lên REST API.
   - Nếu chưa có `.env`, hệ thống hướng dẫn vị trí file CSV để import 1-click.

### Kịch bản C: Kéo Danh Sách Lỗi Từ Jira/Redmine Về Phân Tích
1. **User yêu cầu**: *"Lấy danh sách lỗi liên quan từ Jira/Redmine về"*
2. **QA Leader điều phối**:
   - Ủy quyền cho `qa-reporter` chạy ngầm: `node qa-system/tools/jira/jira-client.js pull <task-slug>`
   - Ghi kết quả vào `OUTPUT/<task-slug>/jira_defects_summary.md`.
   - `qa-analyst` sử dụng danh sách này làm đầu vào đối soát khi lập Viewpoint & Test Idea.
