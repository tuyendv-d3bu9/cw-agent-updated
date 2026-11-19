---
name: web-journey-discovery
description: >
  Uses the Playwright Browser MCP to visit the target URL automatically, "explore the web" (the DOM tree, the Accessibility Snapshot),
  identify the interactive elements and record the real page-transition flow for generating the Page Object Model (POM).
---

# Skill: web-journey-discovery

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).
>
> The output format block below is kept as written (including its Vietnamese headings and Gherkin sample); copy its structure verbatim.

## Purpose
Explore the running web application directly (Staging / Dev / Production), automatically scanning the page structure to identify:
1. The order of page transitions.
2. The main interactive elements (Buttons, Input fields, Forms, Modals).
3. Proposed best selectors / locators for `qa-automation` to put into the POM.

## Parameters
- `url`: The target web address (provided by the user; never guessed).
- `scope`: The journey to explore (e.g. `<journey-1>`, `<journey-2>`).

## Inputs (Đầu vào)
- The `url` given by the user (never choose the environment yourself) · `OUTPUT/<task-slug>/05_test_case_spec.md`
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (always loaded, QA_STANDARD §7)

## Steps
1. **Initialise & navigate**:
   - Use Playwright to open the given URL.
   - Wait until the page has finished loading (`networkidle` or `domcontentloaded`).
2. **Scan the Accessibility Snapshot & DOM**:
   - Extract the Accessibility Tree to find the `role`, `name`, `placeholder`, `aria-label` values.
   - Look for elements with stable `data-testid` or `id` attributes.
3. **Interaction probe (Exploration Probe)**:
   - Try clicking or entering sample data to trigger page transitions or open popups.
   - Record the URL state before and after the action.
4. **Summarise the exploration report**:
   - Record the list of robust locators with screenshots of the current page state.

## Output format
Write `OUTPUT/<task-slug>/G1_web_journey_discovery.md` (with a separate Gherkin file `OUTPUT/<task-slug>/exploratory/journeys.feature` if it needs importing into Jira Xray/Zephyr):

```markdown
# WEB JOURNEY DISCOVERY & GHERKIN SPEC — [TÊN ỨNG DỤNG / DOMAIN]
Owner: qa-automation/web-journey-discovery · Nguồn: [URL], 05_test_case_spec.md · Verdict: PASS
URL khảo sát: [URL] · Thời gian: YYYY-MM-DD

## 1. Kịch Bản Gherkin BDD (Chuẩn Hóa Từ Thực Tế Khám Phá)

```gherkin
Feature: [Tên tính năng được khám phá trên web]

  Background:
    Given Người dùng truy cập "[URL]"
    And Đã đăng nhập hoặc chuẩn bị trạng thái ban đầu

  @smoke @happy-path
  Scenario: [Tên hành trình chính thành công]
    Given [Tiền điều kiện màn hình / dữ liệu]
    When Người dùng [Hành động: click / input / chọn]
    And [Hành động tiếp theo]
    Then Hệ thống phản hồi [Kết quả mong đợi trên giao diện]
    And [Kiểm chứng trạng thái URL / Tiền / Thông báo]

  @negative
  Scenario: [Hành trình lỗi / ngoại lệ thực tế phát hiện]
    When Người dùng thực hiện thao tác sai
    Then Hệ thống hiển thị thông báo lỗi phù hợp
```

## 2. Bản Đồ Ánh Xạ Step Gherkin ➔ Locator Khuyến Nghị Cho POM
| Step Gherkin | Tên phần tử | Action | Recommended Locator (Playwright) | Ghi chú |
|---|---|---|---|---|
| When Nhập `<field>` "<giá trị từ Test Data>" | `<field>` | fill | `page.getByLabel('<nhãn thật trên trang>')` | Lấy từ DOM snapshot |
| And Bấm nút "<nhãn nút thật>" | Nút `<tên>` | click | `page.getByRole('button', { name: '<nhãn nút thật>' })` | Accessible |
| Then Hiển thị "<chữ từ Expected Result>" | Vùng thông báo | text | `page.getByTestId('<data-testid thật>')` | Chờ cập nhật |

## 3. Nhật Ký Hành Trình Khám Phá (Timeline)
| Bước | URL | Thao tác thử nghiệm | Kết quả chuyển trang / Popup / Toast | Ảnh bằng chứng |
|---|---|---|---|---|
| 1 | `/` | Bấm vào `<phần tử>` đầu tiên | `<kết quả mong đợi>` | `evidence/step1.png` |
| 2 | `/<route>` | Nhập `<giá trị>` & click `<nút>` | `<kết quả mong đợi>` | `evidence/step2.png` |
```

(Sections: 1 Gherkin BDD scenarios normalised from the real exploration · 2 Gherkin step ➔ recommended POM locator mapping ·
3 exploration timeline — step, URL, probe action, transition/popup/toast result, evidence image.)

## Acceptance gates (Quality Gates)
- [ ] The scenarios follow the **Gherkin BDD** standard (`Given - When - Then`), not free prose.
- [ ] 100% of the Gherkin steps have a matching locator in the POM recommendation table.
- [ ] Locator priority order: `getByTestId` ➔ `getByRole` ➔ `getByPlaceholder` ➔ CSS ID `#...` (absolute XPath, which breaks easily, is FORBIDDEN).
- [ ] The report states the environment URL and the matching evidence screenshots.
