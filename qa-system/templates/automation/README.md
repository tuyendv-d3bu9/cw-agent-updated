# automation/ — Bộ nối với hệ thống đang kiểm thử (SUT Adapter)

> **Trên nhánh `develop` thư mục này CỐ TÌNH trống.**
> `develop` là nhánh khung dùng chung, không gắn với hệ thống nào.
> Nhánh sử dụng (`exam`, `sample/*`, hoặc dự án thật của bạn) mới điền vào đây.

## Vì sao trống mà không xoá hẳn

Mọi dự án muốn chạy automation đều cần một bộ nối: locator, luồng đăng nhập,
cách dọn trạng thái của *hệ thống đó*. Agent `qa-automation` sinh ra chính loại file
này (nhánh G trong `WORKFLOW.md`). Giữ lại `playwright.config.ts` và khung thư mục
để nhánh sử dụng chỉ việc thả POM vào là chạy, không phải dựng lại cấu hình.

## Nhánh sử dụng cần điền gì

| Việc | Cách làm |
|---|---|
| Khai báo SUT | Đặt `QA_BASE_URL` trong `.env` hoặc biến môi trường |
| Ghi bản đồ giao diện | `knowledge/features/<sut>-ui-map.md` — locator trích từ app thật, không suy đoán |
| Sinh POM | Nói với agent: *"gom cụm luồng và sinh POM"* → `pages/*.ts` |
| Viết kịch bản | → `tests/*.spec.ts` |

`playwright.config.ts` giữ nguyên, không cần sửa.

## Kết quả chạy KHÔNG nằm ở đây

`AGENTS.md` §1.2: bằng chứng của một lượt chạy thuộc về `OUTPUT/`.

```
automation/                      CODE — sống qua nhiều lượt chạy
OUTPUT/<task>/runs/RUN-XX/       KẾT QUẢ — xoá và chạy lại được
  ├─ evidence/*.png              ảnh bằng chứng để nộp bài / log Jira
  ├─ report/                     báo cáo HTML
  └─ results.json
```

Agent truyền `QA_TASK_SLUG` và `QA_RUN_ID` để config biết ghi vào đâu.
Không truyền thì rơi về `OUTPUT/_scratch/`.

> Cổng biên giới (`AGENTS.md` §1.5): **không** tự chạy tầng này sau Chặng 6.
> Cần `npm run readiness` cho khuyến nghị GO **và** người dùng yêu cầu rõ kèm URL môi trường.
