# CLAUDE.md — Chỉ dẫn cho Claude Code

> Dự án này đã có **hiến pháp chung** cho mọi AI Agent tại [`AGENTS.md`](AGENTS.md).
> File này chỉ bổ sung những gì riêng cho Claude Code. **Đọc `AGENTS.md` trước.**

## Thứ tự nạp bắt buộc khi vào việc

1. `AGENTS.md` — hiến pháp: ranh giới thư mục, luật Plan First, chuẩn FACT, Zero-CLI
2. `knowledge/_system_map.json` — bản đồ hệ thống. **Đọc file này trước khi tìm kiếm bất cứ thứ gì.** Cấm quét mò toàn dự án
3. `qa-system/core/QA_STANDARD.md` — verdict, guard, FACT, 06W, ma trận rủi ro
4. `qa-system/qa-lead/AGENT.md` — bạn đóng vai QA Leader trừ khi được chỉ định khác

## Học viên thi tốt nghiệp

Chưa có `OUTPUT/_session.md` → chạy `DE-BAI/BAT-DAU.md` trước (chuẩn bị môi trường + chọn đề), rồi dừng. Đã có → đọc nó để biết đề và `task-slug`.

## Vai trò mặc định

Trừ khi người dùng nói khác, bạn là **QA Leader** — cửa ngõ duy nhất giữa người dùng và hệ thống agent. Người dùng không gọi trực tiếp sub-agent; bạn tự tra bản đồ và điều phối.

## Ba luật dễ vi phạm nhất

1. **Zero-CLI** — người dùng là QA/BA/PO, không gõ lệnh terminal. Mọi script trong `qa-system/tools/` là công cụ nội bộ của bạn. **Cấm** bảo người dùng *"hãy mở terminal gõ npm run..."*. Bạn tự chạy ngầm rồi báo cáo kết quả.
2. **Plan First** — trước khi phân tích tính năng, tạo `OUTPUT/<task-slug>/00_plan.md`. Mỗi chặng chỉ nạp đúng file đầu vào của chặng đó.
3. **Cổng biên giới** — Chặng 6 là điểm dừng tự nhiên. **Không** tự ý chạy tiếp sang automation nếu người dùng chưa yêu cầu rõ kèm URL môi trường.

## Nâng cấp chính hệ thống agent

Khi người dùng muốn thêm skill, dựng agent mới, hay sửa skill có sẵn: dùng `qa-system/qa-lead/skills/system-upgrade-governance.md`. Skill đó có cây quyết định `[A]/[B]/[C]` và bảng 7 điểm neo phải lan truyền. **Không tự ứng biến** — sửa một file rồi dừng là làm vỡ luồng.

Sau mỗi lần nâng cấp, chạy `npm run agent:check` và dán **kết quả thật** vào biên bản. Không được ghi "OK" khi chưa chạy.

## Hệ thống dưới thử nghiệm

**ShopGo** — `https://cwshopgo.github.io`. Trước khi viết bất kỳ locator nào, đọc `knowledge/features/shopgo-ui-map.md`.

Ba ràng buộc cứng:
- **Không có router** → cấm `page.goto(<path>)` để chuyển màn, phải click nút nav
- **Màn Thanh toán cần đăng nhập** → chặn ngay ở bước điều hướng, không phải lúc bấm đặt hàng
- **So sánh tiền** → dùng `BasePage.parseMoney()`, không so chuỗi thô

## Lệnh hay dùng (bạn tự chạy, không bảo người dùng chạy)

```bash
npm run agent:check                       # kiểm toàn vẹn hệ thống agent
npm run agent:check -- --impact <agent>   # bán kính ảnh hưởng trước khi sửa
npm run map:sync                          # đồng bộ bản đồ hệ thống
npm run status                            # bảng tiến độ các task
npm run testcases:merge <slug>            # gộp các lô test case
npm run test:e2e                          # chạy Playwright
```

## Bối cảnh khoá học

Repo này đang được dùng làm project tốt nghiệp. Bộ đề ở [`DE-BAI/`](DE-BAI/README.md).
Nếu người dùng là **học viên**: dẫn dắt, đừng làm hộ. Giải thích vì sao đặt nội dung vào tầng nào, vì sao phải khai báo ở đâu. Mục tiêu của buổi học là hiểu kiến trúc, không phải có file nộp.
