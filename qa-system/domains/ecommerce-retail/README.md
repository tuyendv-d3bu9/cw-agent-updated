# Pack ngành · ecommerce-retail

STATUS: stub — content in Step B

> Pack là **checklist**, không phải nguồn sự thật (QA_STANDARD §10.3).
> Ở bước này pack mới chỉ chứa ba file máy đọc, chuyển nguyên trạng từ giá trị mặc định đang viết cứng trong tool,
> để dự án chọn `"domain": "ecommerce-retail"` chạy ra đúng kết quả như dự án chưa chọn ngành:

| File | Chuyển từ |
|---|---|
| `conflict_topics.json` | `DEFAULT_TOPICS` trong `qa-system/tools/knowledge/conflict-detector.js` |
| `datagen.json` | Kiểu `voucher_code`, `currency_vnd`, `bank_vn` trong `qa-system/tools/testdata/generate-dataset.js` |
| `units.json` | Đơn vị tiền `vnđ`, `vnd`, `đồng`, `đ` trong `qa-system/tools/lib/provenance.js` |

`vocab.md`, `risks.md`, `rule-patterns.md` và mục nguồn: viết ở Step B.

## Nguồn
- Phân loại ngành (GICS): https://www.msci.com/index/methodology/latest/GICS
- Mô hình tham chiếu ngành bán lẻ: Unknown (chưa kiểm được).
