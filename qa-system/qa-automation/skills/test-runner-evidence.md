---
name: test-runner-evidence
description: >
  Maps the test steps of the Test Cases onto the Page Object Model, executes the Playwright test suite,
  captures evidence screenshots and produces a detailed result report per run.
---

# Skill: test-runner-evidence

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).

## Purpose
Execute automated tests for a specific run (Run Session), record binary results (PASS/FAIL) and automatically collect evidence screenshots for each test case.

## Inputs (Đầu vào)
- `OUTPUT/<task-slug>/runs/<run-id>/run_plan.md` — the list of test cases to run this time.
- `automation/pages/*.ts` — the matching Page Object Model files.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (always loaded, QA_STANDARD §7)

## Procedure
1. **Generate the Test Spec file**:
   - Write it to `automation/tests/<task-slug>_<run-id>.spec.ts`.
   - Each test case is written in a block `test('TC_ID: Title', async ({ page }) => { ... })`.
2. **Configure evidence collection (controlled by the `evidence_video` variable in `.env`)**:
   - **Image mode (`evidence_video=OFF`)**:
     + Each test case has its own folder: `evidence/<TC_ID>/`.
     + Capture each step with a sequence number: `01_load_web.png`, `02_dien_thong_tin.png`, etc. via `await evidence.step(...)`.
     + The final result image has the `_result` suffix: `XX_PASS_result.png` or `XX_FAIL_result.png` via `await evidence.result(...)`.
   - **Video mode (`evidence_video=ON`)**:
     + Playwright is configured with `video: 'on'`.
     + The video records the whole run and is saved automatically into the test case folder: `evidence/<TC_ID>/<TC_ID>_PASS_result.webm`.
     + No per-step screenshots, to save resources.
   - On an error / assertion failure: automatically record the failing result image with the `_result` suffix and save the Playwright Trace.
3. **Silent execution**:
   - Run the tests headless: `npx playwright test automation/tests/<task-slug>_<run-id>.spec.ts`.
   - **Choose devices** (the agent runs it itself; the user does not type commands) with the `QA_DEVICE` variable, comma-separated:
     `desktop-chrome` · `mobile-android` (Pixel 7) · `mobile-ios` (iPhone 14) · `tablet` (iPad gen 7) · `all`.
     Not set = only `desktop-chrome` (the previous behaviour). An unknown value makes the config report an error with the list of valid values.
     Example: `QA_DEVICE=mobile-ios,tablet npx playwright test ...` (macOS/Linux; on Windows set the variable with `set`/`$env:`), or the scripts — which work on every OS — `npm run test:e2e:mobile` / `test:e2e:tablet` / `test:e2e:all`.
   - **WebKit**: `mobile-ios` and `tablet` run on WebKit. On first use, the agent runs `npx playwright install webkit` itself
     (and `chromium` if missing) and reports the result; never make the user type it.
   - **Evidence path**: with 1 device keep `evidence/<TC_ID>/`; with 2 or more devices it becomes
     `evidence/<device>/<TC_ID>/` so the images do not overwrite each other. `run_result.md` must state the devices: a header line `Thiết bị (Device)` listing every project that ran, and a `Device` column in the results table (exactly the project name in `results.json`/the HTML report) — one case run on 3 devices = 3 rows.
   - **Install the browsers (the agent runs it and reports the result)**: on first use `npx playwright install chromium webkit`. If the download is blocked, report the exact command and the error message; never guess the result.
   - **Record the real device used** when proof is needed: in the test, log `page.viewportSize()` and `navigator.userAgent`, then copy them into the Actual Result.
4. **Summarise the results into the Run Result**:
   - Write it to `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.
   - If there are failures, list them in `OUTPUT/<task-slug>/runs/<run-id>/run_defects.md` for `qa-reporter` to process next.

## Output format
Write `OUTPUT/<task-slug>/runs/<run-id>/run_result.md` following the standard template:
- A summary table of PASS, FAIL, BLOCKED counts, with the `Thiết bị (Device)` line at the top and a `Device` column on every result row (keep both labels verbatim, as in `qa-system/templates/run/run_result.md` — `npm run jira:sync` parses the result table's columns).
- Details of each test case with the Actual Result and the path of the evidence folder/file in `evidence/<TC_ID>/`.

## Acceptance gates (Quality Gates)
- [ ] Every test case has a clear binary status (PASS / FAIL).
- [ ] Each test case has its own folder in `evidence/<TC_ID>/` (or `evidence/<device>/<TC_ID>/` when running several devices).
- [ ] If `evidence_video=OFF`: all step images (numbered 01, 02...) and the result image with the `_result` suffix are present.
- [ ] If `evidence_video=ON`: there is a video file recording the test case flow in the `evidence/<TC_ID>/` folder.
- [ ] Every FAIL test case must have evidence recording the UI error in the `evidence/<TC_ID>/` folder.
- [ ] The source `05_test_case_spec.md` is never overwritten or polluted.
- [ ] The result file is written exactly at `OUTPUT/<task-slug>/runs/<run-id>/run_result.md`.
