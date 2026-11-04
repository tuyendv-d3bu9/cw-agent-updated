# knowledge/features/ — Tri thức theo tính năng

Mỗi file một tính năng, tên kebab-case trùng `slug` của task: `<slug>.md`.
Tạo bằng `npm run knowledge:new <slug>` (intake cũng tự tạo), từ khuôn `knowledge/_template.md`.

Vòng đời:
1. Skill `01` ghi dữ kiện có nguồn; skill `02` thêm câu hỏi `MR-xx` trạng thái `New` vào §7.
2. BA/PO trả lời → người dùng chuyển lời, agent chép **nguyên văn** vào `Phản hồi chính thức` và đổi trạng thái;
   quyết định §8 phải có người phê duyệt + ngày. Rồi `npm run knowledge:sync -- <slug> --write`.
3. Lần chạy sau: mọi chặng đọc file này; MR đã chốt thành `BR` ở lần chạy `01` kế tiếp; không hỏi lại điều đã chốt.

Luật ghi chi tiết: `qa-system/core/QA_STANDARD.md` §8. Không xoá dòng cũ — chỉ đổi `Trạng thái`.

`<sut>-ui-map.md`: bản đồ giao diện của hệ thống dưới thử nghiệm, locator trích từ app thật — viết trước khi viết locator.
