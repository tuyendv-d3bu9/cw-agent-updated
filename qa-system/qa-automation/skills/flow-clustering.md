---
name: flow-clustering
description: >
  Phân tích kho Test Cases gốc (05_test_case_spec.md) hoặc danh sách test cases theo Ticket,
  phân cụm các test cases có chung hành trình người dùng (User Journey / Common Flow) để tái sử dụng trạng thái trình duyệt và tối ưu hóa việc chạy Playwright.
---

# Skill: flow-clustering

> Tuân thủ `qa-system/core/QA_STANDARD.md` (verdict · guard · FACT).

## Mục đích
Tránh việc mở đi mở lại trình duyệt và lặp lại các bước điều hướng từ đầu cho từng test case đơn lẻ. Skill này nhóm các test case có chung điểm xuất phát, chung ngữ cảnh dữ liệu và chung luồng thao tác.

## Đầu vào
- `OUTPUT/<task-slug>/05_test_case_spec.md` hoặc `OUTPUT/<task-slug>/runs/<run-id>/run_plan.md`.
- `OUTPUT/<task-slug>/G1_web_journey_discovery.md` (Kịch bản Gherkin BDD từ khám phá web).
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (luôn nạp, QA_STANDARD §7)

## Các bước thực hiện
1. **Quét Preconditions & Test Steps**:
   - Nhóm theo trang xuất phát (ví dụ: Trang chủ, Trang danh mục, Trang giỏ hàng).
   - Nhóm theo trạng thái xác thực: Khách vãng lai (Guest) vs Người dùng đã đăng nhập (Authenticated User).
2. **Gom thành các cụm hành trình (Journey Clusters / Feature Groups)**:
   - Mỗi cụm = một chuỗi màn hình **thật** nối nhau trong `07_web_journey_discovery.md` / ui-map, đặt tên theo
     mục tiêu người dùng của chuỗi đó: `<Cụm A>: <màn 1> → <màn 2> → <màn 3>`. Không dựng cụm từ hình dung về
     loại sản phẩm; màn hình nào chưa thấy trong DOM snapshot thì không đưa vào cụm.
3. **Chuẩn hóa thành Gherkin Scenario Outline (Nếu có nhiều bộ data test)**:
   - Thay vì viết lặp nhiều scenario, gộp các test case cùng luồng vào 1 `Scenario Outline` kèm bảng `Examples` (được sinh tự động từ `generate-dataset.js`).
4. **Sắp xếp thứ tự thực thi trong cụm**:
   - Chạy Happy Path trước để làm baseline.
   - Chạy Boundary / Negative / Edge cases sau để cô lập lỗi.

## Format output
Ghi ra `OUTPUT/<task-slug>/G2_flow_clusters.md`. Ví dụ dưới chỉ minh hoạ cấu trúc — tên trang, dữ liệu, bước
lấy từ `05` và `G1_…`, không lấy từ ví dụ (QA_STANDARD §10.1).

````markdown
# FLOW CLUSTERS · <task-slug>
Owner: qa-automation/flow-clustering · Nguồn: 05_test_case_spec.md, G1_web_journey_discovery.md · Verdict: PASS

## Cụm <CL-01>: <tên cụm>
- **Trang khởi đầu**: <đường dẫn trong G1>
- **Session state**: <trạng thái đăng nhập / dữ liệu nền theo Precondition của TC>
- **Test case trong cụm** (thứ tự chạy: happy path → negative/boundary): <MODULE>-001 · <MODULE>-002 …
- **Gherkin cụm** (Scenario Outline khi nhiều bộ data; `Examples` lấy từ `10_dataset.md` nếu có):
```gherkin
Feature: <tính năng>
  Scenario Outline: <mục đích>
    Given <tiền điều kiện>
    When <hành động với "<tham_số>">
    Then <kỳ vọng trích từ Expected Result của TC>
```
````

## Chốt chặn nghiệm thu (Quality Gates)
- [ ] 100% Test Case trong phạm vi đợt chạy được phân vào đúng cụm hành trình logic.
- [ ] Tận dụng tối đa Gherkin Scenario Outline để gom các bộ dữ liệu tương đồng, giảm lặp code.
- [ ] Không có test case nào bị bỏ quên hoặc trùng lặp giữa các cụm.
- [ ] Chỉ rõ Precondition và trạng thái Auth để Playwright tái sử dụng Storage State.

