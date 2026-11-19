# qa-system/domains — Danh mục pack ngành

> Pack ngành là **checklist** của một ngành (rủi ro hay gặp, họ quy tắc hay bị thiếu, từ vựng, dữ liệu mẫu),
> **không phải nguồn sự thật**. Luật duy nhất: `qa-system/core/QA_STANDARD.md` §10.3.
> Thư mục này là của **khung** (dùng chung mọi dự án, chỉ đọc với dự án). Dự án chọn pack, không sửa pack.

## 1. Danh mục

| Pack id | Ngành (GICS) | Trạng thái |
|---|---|---|
| `ecommerce-retail` | Consumer Discretionary · Distribution & Retail | draft — 3 file JSON là bản sao tương thích của mặc định cũ (test khoá từng byte) |
| `banking-payments` | Financials · Banks / Financial Services | draft — BIAN, GICS chưa mở được trang ⇒ phần phụ thuộc ghi `Unknown` |
| `insurance` | Financials · Insurance | draft — ACORD chưa mở được trang ⇒ phần phụ thuộc ghi `Unknown` |
| `healthcare` | Health Care · Health Care Equipment & Services | draft — HIPAA chưa kiểm được (hhs.gov 403) ⇒ `Unknown` |

Phase 2/3 (telecom, saas-b2b, logistics-transport, edtech, gaming, automotive) chỉ làm sau một lần review riêng — xem `docs/plans/domain-packs.md`.

Phân loại ngành theo GICS: https://www.msci.com/index/methodology/latest/GICS

## 2. Chọn ngành cho dự án

`knowledge/_sut.json`:

```json
{ "domain": "" }                                   // trống = không chọn ngành — mọi tool chạy như trước
{ "domain": "ecommerce-retail" }                   // một pack
{ "domain": ["ecommerce-retail", "<pack-id>"] }    // nhiều pack, gộp theo thứ tự
```

- Id không có trong thư mục này ⇒ tool dừng và liệt kê các id đang có. Không tự chọn pack gần nhất.
- Xem dự án đang chọn gì và pack gồm những file nào: `npm run domain`.
- Bổ sung riêng của dự án: `knowledge/_domain.md` (khuôn do `npm run init` tạo). Mục `## vocab`, `## risks`,
  `## rule-patterns` là markdown; `## datagen`, `## units` là một khối ` ```json ` cùng định dạng file của pack.
  Trùng tên với pack ⇒ `_domain.md` thắng. Chủ đề xung đột riêng vẫn khai ở `knowledge/_conflict_topics.json`.

## 3. Pack được dùng ở đâu

| Nơi dùng | Đọc | Ra gì |
|---|---|---|
| `knowledge-digest` | `vocab.md` | Gợi ý thuật ngữ `[DOMAIN]` cho `knowledge/_glossary.md` |
| `requirement-risk-summary` (01) | `risks.md` | `OQ` cho rủi ro ngành mà tài liệu chưa nói tới |
| `missing-rule-06w` (02) | `rule-patterns.md` | Câu hỏi `MR` — không bao giờ `BR` |
| `viewpoint-selection` (03) | `risks.md` | Ứng viên viewpoint — chỉ chọn khi có mã nguồn của dự án |
| `test-case-generation` (05) · `dataset-generation` (10) | `vocab.md`, `datagen.json` | Từ vựng, kiểu dữ liệu sinh |
| `npm run knowledge:conflicts` | `conflict_topics.json` | Có chọn ngành: chủ đề của pack thay chủ đề mặc định. Không chọn: chủ đề mặc định cũ |
| `npm run data:gen` | `datagen.json` | Thêm kiểu / enum. Kiểu cũ (`voucher_code`, `bank_vn`, `currency_vnd`…) vẫn chạy khi không chọn ngành |
| `npm run lint` | `units.json` | Thêm đơn vị nhận diện con số nghiệp vụ. Đơn vị sẵn có không bị bớt |

## 4. Checklist, không phải sự thật

- Một dòng của pack chỉ được thành: câu hỏi (`OQ` → `MR`), ứng viên viewpoint, hoặc từ vựng / dữ liệu sinh.
- `BR`/`FD` luôn trích từ tài liệu của dự án. Ghi `[DOMAIN]` vào cột `Nguồn` của `BR`/`FD` ⇒ `npm run lint` báo lỗi.
- Pack không chứa mã `BR-01`, `FD-02`… (mã sự thật của dự án) — `npm run agent:check` báo lỗi nếu có.

## 5. Thêm một pack

1. Copy `_template/` thành `qa-system/domains/<pack-id>/` (chữ thường, số, gạch nối).
2. Điền đủ 7 file. Mọi dòng có cột `Nguồn`: URL đã kiểm, hoặc `Unknown`. README cần **ít nhất một URL**
   (`http://`/`https://`) hoặc ghi rõ `Unknown`. Không đoán, không bịa link, không ví dụ giá trị của một dự án thật.
3. Thêm một dòng vào bảng §1 của file này.
4. `npm run agent:check` — pack phải xuất hiện trong mục *domain packs* và không có lỗi.
5. Đây là nâng cấp hệ thống: theo `qa-system/qa-lead/skills/system-upgrade-governance.md`.
