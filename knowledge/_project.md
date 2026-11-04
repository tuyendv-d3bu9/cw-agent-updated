# Project Knowledge — quy ước dùng cho MỌI feature

> Tri thức nền cấp **dự án**, do con người khai. Mọi skill đọc file này.
> Ô còn `<điền>` = **chưa khai báo**: agent coi như không có (`[CONTEXT_MISSING]` / `[CHƯA CÓ TRONG TÀI LIỆU]`),
> **không** tự lấy giá trị "thường gặp" thay vào. Xem `qa-system/core/QA_STANDARD.md` §8, §10.

Dự án: `<điền>` · Cập nhật lần cuối: `<điền>`

---

## 1. Quy ước định danh
| Đối tượng | Format | Ví dụ |
|---|---|---|
| Module prefix cho `TC_ID` (2–6 ký tự hoa) | `<điền>` | `<điền>` |
| Mã nghiệp vụ (mã đơn, mã giao dịch…) | `<điền>` | `<điền>` |

## 2. Định dạng dữ liệu
| Loại | Quy ước | Ghi chú |
|---|---|---|
| Ngày / Giờ | `<điền>` | Chưa khai thì agent dùng `YYYY-MM-DD` cho **tài liệu QA**, không suy ra định dạng hiển thị của hệ thống |
| Tiền tệ | `<điền>` | |
| Timezone | `<điền>` | |
| NULL vs rỗng | `<điền>` | |

## 3. Bối cảnh nghiệp vụ dùng chung
> Dùng cho Risk Analysis (skill `01`). Ô chưa khai ⇒ `[CONTEXT_MISSING]`.

| Khía cạnh | Nội dung |
|---|---|
| User Context | `<điền>` |
| Usage Context | `<điền>` |
| Financial / Business Context | `<điền>` |
| Operational Context | `<điền>` |
| Criticality Context | `<điền>` |

## 4. Môi trường test
| Thuộc tính | Nội dung |
|---|---|
| Môi trường | `<điền>` |
| Cách seed data | `<điền>` |
| Có được dùng dữ liệu giống production? | `<điền>` |

## 5. Test Management Tool & ALM Integration
### 5.1. Jira Xray (Khuyến nghị)
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Issue Type | `Test` | Loại issue đại diện cho Test Case trong Xray |
| Summary Format | `[<TC_ID>] <Title>` | Ví dụ: `[AUTH-001] Verify đăng nhập thành công...` |
| Manual Steps | `Action`, `Data`, `Expected Result` | 3 cột chuẩn của bảng Manual Test Step trong Xray |
| Preconditions | `Preconditions` (Text/Wiki) | Tiền điều kiện trước khi thực hiện test |
| Priority | `High`, `Medium`, `Low` | Theo thang Priority của `QA_STANDARD.md` §11 |
| Labels | `Rule#BR-xx`, `Viewpoint#VP-xx`, `Module#<MOD>` | Phục vụ truy xuất nguồn gốc (Traceability) |
| File xuất | `OUTPUT/<slug>/export_jira_xray.csv` | Mã hóa UTF-8 BOM, sẵn sàng cho Xray Test Importer |

### 5.2. Redmine
| Thuộc tính | Cấu hình chuẩn | Ý nghĩa / Ghi chú |
|---|---|---|
| Tracker | `Test Case` (hoặc `Feature` / `Task`) | Phân loại issue trong Redmine |
| Subject | `[<TC_ID>] <Title>` | Tiêu đề test case |
| Priority | `Urgent` (High), `Normal` (Medium), `Low` (Low) | Mức độ ưu tiên chuẩn của Redmine |
| Category | Mã module (`AUTH`, `PAY`...) | Gom nhóm test case theo phân hệ |
| Status | `New` | Trạng thái ban đầu |
| Description | Đầy đủ Preconditions, Steps, Data, Expected Result | Định dạng Textile / Markdown của Redmine |
| File xuất | `OUTPUT/<slug>/export_redmine.csv` | Mã hóa UTF-8 BOM |

## 6. Ràng buộc riêng của dự án
> Quy tắc áp dụng xuyên suốt hệ thống, **có nguồn**. Chưa có thì để trống bảng.

| Quy tắc | Nguồn |
|---|---|
