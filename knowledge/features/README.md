# knowledge/features/ — Per-feature knowledge

One file per feature, kebab-case name equal to the task's `slug`: `<slug>.md`.
Create with `npm run knowledge:new <slug>` (intake also creates it), from the template `knowledge/_template.md`.

Lifecycle:
1. Skill `01` records sourced facts; skill `02` adds `MR-xx` questions with status `New` to §7.
2. The BA/PO answers → the user relays it, the agent copies it **verbatim** into `Phản hồi chính thức` (official answer) and changes the status;
   a §8 decision needs an approver + date. Then `npm run knowledge:sync -- <slug> --write`.
3. Next run: every stage reads this file; a settled MR becomes a `BR` in the next `01` run; never re-ask what is settled.

Detailed write rules: `qa-system/core/QA_STANDARD.md` §8. Never delete old rows — only change `Trạng thái` (status).

`<sut>-ui-map.md`: the UI map of the system under test, locators quoted from the real app — written before writing any locator.
