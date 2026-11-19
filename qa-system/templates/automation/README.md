# automation/ — Connector to the system under test (SUT Adapter)

> **On the `develop` branch this folder is INTENTIONALLY empty.**
> `develop` is the shared framework branch, tied to no system.
> A consuming branch (`exam`, `sample/*`, or your real project) fills it in.

## Why empty rather than deleted

Every project that wants to run automation needs a connector: locators, login flow,
and how to clean up the state of *that system*. The `qa-automation` agent generates exactly this kind of file
(branch G in `WORKFLOW.md`). Keep `playwright.config.ts` and the folder skeleton
so a consuming branch only drops POMs in and runs, without rebuilding the configuration.

## What a consuming branch must fill in

| Task | How |
|---|---|
| Declare the SUT | Set `QA_BASE_URL` in `.env` or an environment variable |
| Record the UI map | `knowledge/features/<sut>-ui-map.md` — locators quoted from the real app, not guessed |
| Generate POMs | Tell the agent: *"cluster the flows and generate POMs"* → `pages/*.ts` |
| Write scenarios | → `tests/*.spec.ts` |

`playwright.config.ts` stays as is, no edit needed.

## Run results are NOT here

`AGENTS.md` §1.2: the evidence of a run belongs in `OUTPUT/`.

```
automation/                      CODE — lives across many runs
OUTPUT/<task>/runs/RUN-XX/       RESULTS — can be deleted and re-run
  ├─ evidence/*.png              evidence screenshots for submission / Jira log
  ├─ report/                     HTML report
  └─ results.json
```

The agent passes `QA_TASK_SLUG` and `QA_RUN_ID` so the config knows where to write.
If not passed, it falls back to `.scratch/`.

## Running on other devices

The `QA_DEVICE` variable (passed by the agent): `desktop-chrome` (default) · `mobile-android` · `mobile-ios` · `tablet` · `all`,
or several names separated by commas. A wrong name -> the config reports an error with the list of valid names.
`mobile-ios`/`tablet` use WebKit: the agent runs `npx playwright install chromium webkit` once (the user types no commands).
The npm scripts also select a device (works on Windows, no cross-env needed): `test:e2e:mobile` (android + ios), `test:e2e:tablet`, `test:e2e:all`.
`QA_DEVICE` wins over the script name. The old alias `chromium` = `desktop-chrome`. The selection logic lives in `utils/devices.js` (tested).
Example the agent runs: `QA_DEVICE=mobile-ios,tablet QA_TASK_SLUG=<slug> QA_RUN_ID=RUN-01_x npx playwright test -c automation/playwright.config.ts`.
`run_result.md` has a `Thiết bị` (device) line at the top and a `Device` column for each result row.
When running on 2 or more devices, evidence goes in `evidence/<device>/<TC_ID>/`; with one device it stays in `evidence/<TC_ID>/`.

> Boundary gate (`AGENTS.md` §1.5): **never** run this layer on your own after Stage 6.
> It needs `npm run readiness` to recommend GO **and** the user's explicit request together with an environment URL.
