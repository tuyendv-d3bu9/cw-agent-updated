# Pack ngành · <to be filled: pack-id>

> Khuôn pack. Copy cả thư mục `_template/` thành `qa-system/domains/<pack-id>/` rồi điền.
> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3). Không ghi mã `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` có số vào bất kỳ file nào của pack.

STATUS: <to be filled: draft | reviewed>

## 1. Phạm vi
<to be filled: ngành / phân ngành mà pack phủ, và điều pack KHÔNG phủ>

## 2. Phân loại ngành (GICS)
| Cấp | Giá trị | Nguồn |
|---|---|---|
| Sector | <to be filled: tên sector> | <to be filled: source URL> |
| Industry group / Industry | <to be filled: tên> | <to be filled: source URL> |

## 3. Mô hình tham chiếu của ngành
| Mô hình | Dùng để | Nguồn |
|---|---|---|
| <to be filled: tên mô hình, hoặc `Unknown`> | <to be filled: phần nào của pack lấy từ đây> | <to be filled: source URL, hoặc `Unknown`> |

## 4. Quy định / chuẩn tạo rủi ro
| Quy định / chuẩn | Phạm vi áp dụng | Nguồn |
|---|---|---|
| <to be filled: tên, hoặc `Unknown`> | <to be filled: quốc gia / loại dữ liệu> | <to be filled: source URL, hoặc `Unknown`> |

## 5. Nguồn
Bắt buộc **ít nhất một URL** (`http://` / `https://`). Chưa kiểm được thì ghi `Unknown` — không đoán, không bịa link.

- <to be filled: source URL>

## 6. File của pack
| File | Ai đọc | Dùng làm |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Gợi ý thuật ngữ cho `knowledge/_glossary.md` — người dự án duyệt |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Rủi ro ngành ⇒ câu hỏi `OQ`, ứng viên viewpoint |
| `rule-patterns.md` | `missing-rule-06w` | Họ quy tắc hay bị thiếu ⇒ câu hỏi `MR`, không bao giờ thành `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Chủ đề dò xung đột giữa các tính năng |
| `datagen.json` | `npm run data:gen` | Kiểu dữ liệu sinh / danh sách enum |
| `units.json` | `npm run lint` (nguồn gốc con số) | Đơn vị đo / tiền tệ của ngành (chỉ thêm) |
