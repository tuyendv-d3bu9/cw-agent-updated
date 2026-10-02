# automation/ — Bộ nối với hệ thống đang kiểm thử (SUT Adapter)

> **Thư mục này gắn với MỘT hệ thống cụ thể — không phải code dùng chung.**
> Hiện tại nó là bộ nối cho **ShopGo** (`https://cwshopgo.github.io`).
> Dự án khác dùng hệ thống agent này sẽ **thay toàn bộ `pages/` và `tests/`** bằng
> bộ nối của SUT họ. Khung `qa-system/` thì giữ nguyên, không sửa gì.

## Vì sao không bỏ được

Mọi dự án muốn chạy automation đều cần một bộ nối như vậy — locator, luồng đăng nhập,
cách dọn trạng thái của *hệ thống đó*. Agent `qa-automation` sinh ra chính loại file này
(nhánh G trong `WORKFLOW.md`). ShopGo chỉ tình cờ là SUT của repo này.

## Có gì ở đây

| File | Vai trò | Dự án mới |
|---|---|---|
| `playwright.config.ts` | Cấu hình, định tuyến bằng chứng về `OUTPUT/<slug>/runs/` | **Giữ**, chỉ đổi `baseURL` |
| `pages/BasePage.ts` | Điều hướng chung, `resetState()`, `parseMoney()` | **Viết lại** — locator và storage key là của ShopGo |
| `pages/ShopPage.ts` `CheckoutPage.ts` `LoginModal.ts` | POM từng màn hình ShopGo | **Thay** bằng POM của SUT mới |
| `tests/smoke.spec.ts` | 5 ca mồi, xác nhận môi trường chạy được | **Thay** bằng smoke của SUT mới |

## Kết quả chạy KHÔNG nằm ở đây

`AGENTS.md` §1.2: bằng chứng của một lượt chạy thuộc về `OUTPUT/`.

```
automation/                      CODE — sống qua nhiều lượt chạy, dùng lại cho mọi task
OUTPUT/<task>/runs/RUN-XX/       KẾT QUẢ — xoá và chạy lại được
  ├─ evidence/*.png              ảnh bằng chứng để nộp bài / log Jira
  ├─ report/                     báo cáo HTML
  └─ results.json
```

Agent truyền `QA_TASK_SLUG` và `QA_RUN_ID` để config biết ghi vào đâu.
Không truyền thì rơi về `OUTPUT/_scratch/` — vẫn thấy được, tên nói rõ là chạy nháp.

## Chạy

```bash
npm run test:e2e          # agent tự chạy, người dùng không cần gõ
npm run test:e2e:headed   # xem trình duyệt thao tác
npm run test:report       # mở báo cáo HTML
```

> Cổng biên giới (`AGENTS.md` §1.5): **không** tự chạy tầng này sau Chặng 6.
> Cần `npm run readiness` cho khuyến nghị GO **và** người dùng yêu cầu rõ kèm URL môi trường.
