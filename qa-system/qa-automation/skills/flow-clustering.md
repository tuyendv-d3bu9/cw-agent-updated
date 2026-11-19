---
name: flow-clustering
description: >
  Analyses the source Test Case repository (05_test_case_spec.md) or a per-ticket list of test cases and
  clusters the test cases that share a user journey (User Journey / Common Flow) to reuse browser state and optimise Playwright runs.
---

# Skill: flow-clustering

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).

## Purpose
Avoid opening the browser again and again and repeating the navigation steps from the start for every single test case. This skill groups the test cases that share a starting point, a data context and an action flow.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/05_test_case_spec.md` or `OUTPUT/<task-slug>/runs/<run-id>/run_plan.md`.
- `OUTPUT/<task-slug>/G1_web_journey_discovery.md` (Gherkin BDD scenarios from web exploration).
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (always loaded, QA_STANDARD §7)

## Steps
1. **Scan Preconditions & Test Steps**:
   - Group by starting page (e.g. `<page-1>`, `<page-2>`, `<page-3>`).
   - Group by authentication state: `<state-A>` vs `<state-B>`.
2. **Gather into journey clusters (Journey Clusters / Feature Groups)**:
   - Each cluster = a chain of **real** screens connected in `07_web_journey_discovery.md` / the ui-map, named after
     the user goal of that chain: `<Cluster A>: <screen 1> → <screen 2> → <screen 3>`. Never build a cluster from an imagined
     `<object type>`; a screen not yet seen in a DOM snapshot is not put into a cluster.
3. **Normalise into a Gherkin Scenario Outline (when there are several test data sets)**:
   - Instead of writing many repeated scenarios, merge the test cases of the same flow into one `Scenario Outline` with an `Examples` table (generated automatically by `generate-dataset.js`).
4. **Order the execution within a cluster**:
   - Run the Happy Path first as the baseline.
   - Run Boundary / Negative / Edge cases afterwards to isolate failures.

## Output format
Write `OUTPUT/<task-slug>/G2_flow_clusters.md`. The example below only illustrates the structure — page names, data and steps
come from `05` and `G1_…`, never from the example (QA_STANDARD §10.1).

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

(Per cluster: starting page · session state · test cases in the cluster in run order · the cluster's Gherkin, with `Examples` from `10_dataset.md` if present.)

## Acceptance gates (Quality Gates)
- [ ] 100% of the Test Cases in the run's scope are placed in the right logical journey cluster.
- [ ] Gherkin Scenario Outlines are used as much as possible to group similar data sets and reduce duplicated code.
- [ ] No test case is forgotten or duplicated across clusters.
- [ ] The Precondition and Auth state are stated clearly so Playwright can reuse the Storage State.
