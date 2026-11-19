# Pack ngành · banking-payments

> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3). Không ghi mã `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` có số vào bất kỳ file nào của pack.

STATUS: draft

## 1. Phạm vi
Ngân hàng bán lẻ / thanh toán: tài khoản, chuyển tiền, thanh toán thẻ, đối soát.
KHÔNG phủ: chứng khoán, bảo hiểm (xem pack `insurance`), quy định cụ thể từng quốc gia (ghi "local regulation", chi tiết `Unknown`),
giá trị hạn mức / phí / giờ chốt cụ thể của bất kỳ ngân hàng nào.

## 2. Phân loại ngành (GICS)
| Cấp | Giá trị | Nguồn |
|---|---|---|
| Sector | Financials (tên lấy từ plan §3) | Unknown — trang MSCI trả PDF không đọc được. Trang tham chiếu: https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Banks / Financial Services (tên lấy từ plan §3) | Unknown (như trên) |

## 3. Mô hình tham chiếu của ngành
| Mô hình | Dùng để | Nguồn |
|---|---|---|
| BIAN Service Landscape (business areas → business domains → service domains) | Gợi ý nhóm từ vựng / vùng rủi ro theo miền dịch vụ ngân hàng. Cấu trúc ba cấp lấy từ plan §3; nội dung trang `Unknown` vì chưa mở được | https://digital-portfolio.opengroup.org/archimate-bian/latest/01-doc/chap03.html (WebFetch bị chuyển sang trang đăng nhập) |
| ISTQB Certified Tester Finance Testing (CT-FT) | Nhắc rằng kiểm thử hệ thống tài chính là chuyên ngành riêng. Trang chỉ nói CT-FT tập trung vào kiến thức kiểm thử cho hệ thống trong lĩnh vực dịch vụ tài chính; nội dung syllabus `Unknown` | https://istqb.org/certifications/certification-list (đã mở) |

## 4. Quy định / chuẩn tạo rủi ro
| Quy định / chuẩn | Phạm vi áp dụng | Nguồn |
|---|---|---|
| PCI DSS | Dữ liệu tài khoản thẻ thanh toán; do PCI Security Standards Council ban hành. Phiên bản, số điều khoản: `Unknown` | https://www.pcisecuritystandards.org/standards/pci-dss/ (đã mở) |
| AML/KYC (local regulation) | Theo quốc gia; ngưỡng, thời hạn lưu, danh sách giám sát: `Unknown` | Unknown |
| Quy định thanh toán / ngân hàng nhà nước (local regulation) | Theo quốc gia: `Unknown` | Unknown |
| ISO/IEC 25010:2023 (đặc tính ở risks.md) | Tên đặc tính đối chiếu từ trang tóm tắt iso25000.com, không phải trang ISO (trả 403) | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở) |

## 5. Nguồn
- https://www.pcisecuritystandards.org/standards/pci-dss/ — đã mở
- https://istqb.org/certifications/certification-list — đã mở
- https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 — đã mở
- https://docs.stripe.com/testing — đã mở (số thẻ TEST trong datagen.json)
- https://digital-portfolio.opengroup.org/archimate-bian/latest/01-doc/chap03.html — URL của plan §8, chưa mở được
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
