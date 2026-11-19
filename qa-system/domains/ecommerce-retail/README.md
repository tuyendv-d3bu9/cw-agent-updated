# Pack ngành · ecommerce-retail

> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3). Không ghi mã `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` có số vào bất kỳ file nào của pack.

STATUS: draft

## 1. Phạm vi
Phủ: bán lẻ trực tuyến — giỏ hàng, định giá / thuế, khuyến mãi (cộng dồn, phạm vi giảm), khách vãng lai và thành viên, tồn kho giữ chỗ, vòng đời đơn / thanh toán / giao hàng, huỷ, đổi trả, hoàn tiền và hoàn quyền lợi.
Không phủ: bán lẻ tại cửa hàng (POS), sàn đa người bán, quy định thuế cụ thể của từng nước. Mọi giá trị cụ thể (ngưỡng, tỷ lệ, thời hạn) phải lấy từ tài liệu dự án.
Ba file JSON của pack là bản chuyển nguyên trạng từ mặc định cũ của tool (test giữ hai bên không lệch) — không sửa.

## 2. Phân loại ngành (GICS)
| Cấp | Giá trị | Nguồn |
|---|---|---|
| Sector | Consumer Discretionary | https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Consumer Discretionary Distribution & Retail | https://www.msci.com/index/methodology/latest/GICS |

Tên cấp lấy theo plan domain-packs §3; trang MSCI chưa được mở lại trong lượt viết pack này: Unknown (chưa tự kiểm).

## 3. Mô hình tham chiếu của ngành
| Mô hình | Dùng để | Nguồn |
|---|---|---|
| Unknown (mô hình tham chiếu bán lẻ chưa được kiểm) | Không có phần nào của pack lấy từ mô hình này | Unknown |

## 4. Quy định / chuẩn tạo rủi ro
| Quy định / chuẩn | Phạm vi áp dụng | Nguồn |
|---|---|---|
| PCI DSS | Dữ liệu thẻ thanh toán; trang chủ PCI SSC xác nhận có PCI Data Security Standard, nội dung yêu cầu cụ thể chưa đọc | https://www.pcisecuritystandards.org/ (đã mở) |
| Luật bảo vệ người tiêu dùng, thuế | Tuỳ quốc gia triển khai | Unknown |
| ISO/IEC 25010:2023 (9 đặc tính) | Cột đặc tính trong `risks.md` | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở, trang bên thứ ba; trang iso.org trả 403) |

## 5. Nguồn
- GICS: https://www.msci.com/index/methodology/latest/GICS
- PCI Security Standards Council: https://www.pcisecuritystandards.org/
- Tên đặc tính ISO/IEC 25010: https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
- ISO/IEC 25010:2023 (trang chính thức, chưa mở được): https://www.iso.org/standard/78176.html
- Mô hình tham chiếu bán lẻ: Unknown

## 6. File của pack
| File | Ai đọc | Dùng làm |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Gợi ý thuật ngữ cho `knowledge/_glossary.md` — người dự án duyệt |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Rủi ro ngành ⇒ câu hỏi `OQ`, ứng viên viewpoint |
| `rule-patterns.md` | `missing-rule-06w` | Họ quy tắc hay bị thiếu ⇒ câu hỏi `MR`, không bao giờ thành `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Chuyển từ `DEFAULT_TOPICS` của `conflict-detector.js` |
| `datagen.json` | `npm run data:gen` | Chuyển từ kiểu `voucher_code`, `currency_vnd`, `bank_vn` của `generate-dataset.js` |
| `units.json` | `npm run lint` (nguồn gốc con số) | Đơn vị tiền `vnđ`, `vnd`, `đồng`, `đ` của `provenance.js` |
