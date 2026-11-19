# Pack ngành · insurance

> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3). Không ghi mã `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` có số vào bất kỳ file nào của pack.

STATUS: draft

## 1. Phạm vi
Bảo hiểm (nhân thọ / phi nhân thọ ở mức vòng đời hợp đồng): báo giá, phát hành hợp đồng, sửa đổi (endorsement), thu phí, bồi thường, tái tục / mất hiệu lực.
KHÔNG phủ: tái bảo hiểm, tính toán định phí (actuarial), quy định solvency và báo cáo giám sát cụ thể từng quốc gia (ghi "local regulation", chi tiết `Unknown`),
giá trị phí / hạn mức / thời hạn chờ cụ thể của bất kỳ sản phẩm nào.

## 2. Phân loại ngành (GICS)
| Cấp | Giá trị | Nguồn |
|---|---|---|
| Sector | Financials (tên lấy từ plan §3) | Unknown — trang MSCI trả PDF không đọc được. Trang tham chiếu: https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Insurance (tên lấy từ plan §3) | Unknown (như trên) |

## 3. Mô hình tham chiếu của ngành
| Mô hình | Dùng để | Nguồn |
|---|---|---|
| ACORD Reference Architecture (Capability, Process, Product, Data models — theo plan §3) | Gợi ý nhóm từ vựng và vùng rủi ro theo năng lực / quy trình / sản phẩm / dữ liệu bảo hiểm. Nội dung trang `Unknown` vì chưa mở được | https://www.acord.org/standards-architecture/reference-architecture (WebFetch trả 403) |

## 4. Quy định / chuẩn tạo rủi ro
| Quy định / chuẩn | Phạm vi áp dụng | Nguồn |
|---|---|---|
| Solvency / dự phòng nghiệp vụ (local regulation) | Theo quốc gia; chi tiết `Unknown` | Unknown |
| Bảo vệ người tiêu dùng / công bố thông tin trước khi bán (local regulation) | Theo quốc gia; chi tiết `Unknown` | Unknown |
| Bảo vệ dữ liệu cá nhân và dữ liệu sức khoẻ (local regulation) | Theo quốc gia; chi tiết `Unknown` | Unknown |
| ISO/IEC 25010:2023 (đặc tính ở risks.md) | Tên đặc tính đối chiếu từ trang tóm tắt iso25000.com, không phải trang ISO (trả 403) | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở) |

## 5. Nguồn
- https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 — đã mở
- https://www.acord.org/standards-architecture/reference-architecture — URL của plan §8, trả 403, chưa mở được
- https://www.msci.com/index/methodology/latest/GICS — URL của plan §8, PDF không đọc được
- https://www.iso.org/standard/78176.html — URL của plan §8, trả 403

## 6. File của pack
| File | Ai đọc | Dùng làm |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Gợi ý thuật ngữ cho `knowledge/_glossary.md` — người dự án duyệt |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Rủi ro ngành ⇒ câu hỏi `OQ`, ứng viên viewpoint |
| `rule-patterns.md` | `missing-rule-06w` | Họ quy tắc hay bị thiếu ⇒ câu hỏi `MR`, không bao giờ thành `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Chủ đề dò xung đột giữa các tính năng |
| `datagen.json` | `npm run data:gen` | Kiểu dữ liệu sinh |
| `units.json` | `npm run lint` (nguồn gốc con số) | Đơn vị đo / tiền tệ (chỉ thêm) |
