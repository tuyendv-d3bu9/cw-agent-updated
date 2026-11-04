# OUTPUT/ — Kết quả · **CỦA BẠN**

Mỗi tính năng một thư mục `OUTPUT/<slug>/`:

| File | Là gì |
|---|---|
| `00_plan.md` | Bản đồ tiến độ. Agent tick `[x]` vào đây sau mỗi chặng |
| `00_*` khác | Manifest intake, kế hoạch/kết quả chưng cất tài liệu lớn |
| `01_` → `06_` | Sáu chặng thiết kế kiểm thử (dừng tự nhiên ở `06`) |
| `07_` · `08_` | Charter thăm dò · phân tích ảnh giao diện (độc lập) |
| `09_` → `12_` | Dữ liệu kiểm thử (khi cần; có thì `06` chạy lại) |
| `15_readiness_*` | Đánh giá sẵn sàng trước automation |
| `G1_` · `G2_` | Mò web, gom cụm luồng (automation) |
| `testcases/batch_NN.md` | Lô test case trước khi gộp vào `05_` |
| `runs/RUN-XX_<ticket>/` | Kết quả chạy test + **ảnh bằng chứng** |

Báo cáo bug và daily summary ở `OUTPUT/reports/`.
Muốn biết đang ở đâu, nói: *"Tiến độ thế nào rồi?"*

> ⚠️ `OUTPUT/` là sản phẩm bàn giao: `jira:sync`, `lint`, `readiness`, `gate` đều đọc lại các file này.
> Quy tắc BA đã chốt nằm ở `knowledge/`, không nằm đây. Không có thư mục nào bắt đầu bằng `_`:
> khuôn mẫu ở `qa-system/templates/`, bản chạy nháp ở `.scratch/`, biên bản nâng cấp hệ thống để ngoài repo.
