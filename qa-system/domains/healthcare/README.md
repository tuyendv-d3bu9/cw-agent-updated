# Pack ngành · healthcare

> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3). Không ghi mã `BR`/`FD`/`AF`/`OQ`/`MR`/`RK`/`TI` có số vào bất kỳ file nào của pack.

STATUS: draft

## 1. Phạm vi
Phủ: phần mềm chăm sóc sức khoẻ có dữ liệu người bệnh — đăng ký / định danh, lượt khám (encounter), kết quả quan sát, chỉ định thuốc, đặt lịch, thanh toán / bồi hoàn (claim), phân quyền truy cập hồ sơ.
Không phủ: thiết bị y tế nhúng, quy trình lâm sàng cụ thể, ngưỡng / liều / giá trị chuẩn lâm sàng, luật y tế của từng quốc gia. Mọi giá trị cụ thể phải lấy từ tài liệu dự án.
Dữ liệu thử trong pack luôn là dữ liệu **giả, dễ nhận ra** (tiền tố `SYN-`); không dùng định danh người bệnh thật.

## 2. Phân loại ngành (GICS)
| Cấp | Giá trị | Nguồn |
|---|---|---|
| Sector | Health Care | https://www.msci.com/index/methodology/latest/GICS |
| Industry group / Industry | Health Care Equipment & Services | https://www.msci.com/index/methodology/latest/GICS |

Tên cấp lấy theo plan domain-packs §3; trang MSCI chưa được mở lại trong lượt viết pack này: Unknown (chưa tự kiểm).

## 3. Mô hình tham chiếu của ngành
| Mô hình | Dùng để | Nguồn |
|---|---|---|
| HL7 FHIR (R5) — module Administration, Clinical, Medications, Diagnostics, Workflow, Financial, Security & Privacy | Từ vựng thực thể (Patient, Encounter, Observation, Claim…) trong `vocab.md`, `datagen.json` | https://www.hl7.org/fhir/overview.html (đã mở; trang liệt kê 14 module) |
| Mã trạng thái Encounter (9 mã), Claim (4 mã) | Enum `encounter_status`, `claim_status` trong `datagen.json` | https://www.hl7.org/fhir/encounter.html · https://www.hl7.org/fhir/claim.html (đã mở; chỉ đọc 100000 ký tự đầu mỗi trang) |
| Tập mã trạng thái Observation đầy đủ | Không dùng làm enum | Unknown (chỉ thấy 4 mã đầu) |

## 4. Quy định / chuẩn tạo rủi ro
| Quy định / chuẩn | Phạm vi áp dụng | Nguồn |
|---|---|---|
| HIPAA (Hoa Kỳ) | Dữ liệu sức khoẻ có thể định danh; trang hhs.gov trả HTTP 403, chưa kiểm được | Unknown |
| Luật dữ liệu sức khoẻ địa phương | Tuỳ quốc gia triển khai | Unknown |
| ISO/IEC 25010:2023 (9 đặc tính) | Cột đặc tính trong `risks.md` | https://iso25000.com/index.php/en/iso-25000-standards/iso-25010 (đã mở, trang bên thứ ba; trang iso.org trả 403) |

## 5. Nguồn
- GICS: https://www.msci.com/index/methodology/latest/GICS
- HL7 FHIR overview: https://www.hl7.org/fhir/overview.html
- FHIR Encounter: https://www.hl7.org/fhir/encounter.html
- FHIR Claim: https://www.hl7.org/fhir/claim.html
- Tên đặc tính ISO/IEC 25010: https://iso25000.com/index.php/en/iso-25000-standards/iso-25010
- ISO/IEC 25010:2023 (trang chính thức, chưa mở được): https://www.iso.org/standard/78176.html

## 6. File của pack
| File | Ai đọc | Dùng làm |
|---|---|---|
| `vocab.md` | `knowledge-digest`, `test-case-generation`, `dataset-generation` | Gợi ý thuật ngữ cho `knowledge/_glossary.md` — người dự án duyệt |
| `risks.md` | `requirement-risk-summary`, `viewpoint-selection` | Rủi ro ngành ⇒ câu hỏi `OQ`, ứng viên viewpoint |
| `rule-patterns.md` | `missing-rule-06w` | Họ quy tắc hay bị thiếu ⇒ câu hỏi `MR`, không bao giờ thành `BR` |
| `conflict_topics.json` | `npm run knowledge:conflicts` | Chủ đề dò xung đột giữa các tính năng |
| `datagen.json` | `npm run data:gen` | Kiểu dữ liệu sinh giả / danh sách enum |
| `units.json` | `npm run lint` (nguồn gốc con số) | Đơn vị đo lường (chỉ thêm) |
