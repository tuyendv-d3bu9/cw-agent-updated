# OUTPUT/ — Kết quả · **CỦA BẠN**

Mỗi tính năng một thư mục `OUTPUT/<tên-task>/`:

| File | Là gì |
|---|---|
| `00_plan.md` | Bản đồ tiến độ. Agent tick `[x]` vào đây sau mỗi chặng. |
| `01_` → `06_` | Sáu chặng thiết kế kiểm thử, từ phân tích đến rà soát độ phủ |
| `09_` → `12_` | Dữ liệu kiểm thử (khi cần) |
| `15_readiness_*` | Đánh giá sẵn sàng trước khi làm automation |
| `runs/RUN-XX/` | Kết quả chạy test + **ảnh bằng chứng** để nộp bài |

Muốn biết đang ở đâu, nói: *"Tiến độ thế nào rồi?"*

> ⚠️ `OUTPUT/` là **kết quả một lần chạy, có thể xoá và chạy lại**.
> Thứ cần giữ lâu dài (quy tắc BA đã chốt) nằm ở `knowledge/`.
