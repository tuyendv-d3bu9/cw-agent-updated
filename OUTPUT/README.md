# OUTPUT/ — Kết quả · **CỦA BẠN**

Mỗi tính năng một thư mục `OUTPUT/<tên-task>/`:

| File | Là gì |
|---|---|
| `00_plan.md` | Bản đồ tiến độ. Agent tick `[x]` vào đây sau mỗi chặng. |
| `01_` → `06_` | Sáu chặng thiết kế kiểm thử |
| `09_` → `12_` | Dữ liệu kiểm thử (khi cần) |
| `15_readiness_*` | Đánh giá sẵn sàng trước khi làm automation |
| `runs/RUN-XX/` | Kết quả chạy test + **ảnh bằng chứng** để nộp bài |

Muốn biết đang ở đâu, nói: *"Tiến độ thế nào rồi?"*

> ⚠️ `OUTPUT/` là **sản phẩm bàn giao, giữ lâu dài**: bằng chứng chạy test, test case,
> bảng ánh xạ Jira. Nhiều công cụ đọc lại nó — `jira:sync` đính ảnh evidence lên Jira,
> `lint` và `readiness` chấm điểm trên chính các file này. Xoá là mất, không chạy lại được.
>
> Chỉ chứa thư mục task, mỗi tính năng một thư mục. Không có thư mục nào bắt đầu bằng `_`:
> khuôn mẫu ở `qa-system/templates/`, biên bản nâng cấp ở `qa-system/_upgrades/`,
> bản chạy nháp ở `.scratch/`.
>
> Quy tắc nghiệp vụ BA đã chốt thì nằm ở `knowledge/`, không nằm đây.
