# INPUT/ — Source documents · **YOURS**

Drag and drop the BA's documents here (`.docx` `.pdf` `.xlsx` `.md`…), then tell the agent:

> *"I just put documents in INPUT, please process them"*

The agent converts them to Markdown, sorts them into the 5 compartments of `INPUT/<slug>/` and builds the working skeleton.
**You do not need to create folders yourself.**

| Compartment | Contains |
|---|---|
| `01_business/` | Direction, policies, business problem |
| `02_ba/` | **Required.** PRD, SRS, User Story, Use Case |
| `03_dev/` | API Swagger/OpenAPI, DB schema, tech spec, error codes |
| `04_design/` | Figma, wireframes, screenshots (images are kept in `04_design/_assets/`) |
| `05_communication/` | Q&A with the BA, meeting minutes, Change Requests |

- Comments, tracked changes and "DRAFT" markers in a document are split into the `## Annotations / Pending changes` section —
  the agent treats them as **not settled** and asks the BA, never using them as truth.
- Files that cannot be read or have an unsupported format are **left in place** and reported to you — never deleted.
- When two documents disagree: the priority order is in `qa-system/core/QA_STANDARD.md` §10.2; if it is unclear which is newer, the agent asks the BA.
  Putting a version/date in the file name (`spec_v2_2026-10-01.docx`) helps the agent know which is newer.
- Sending a new version of an existing document: the agent asks you to confirm *"is this a new version of feature X?"* before accepting it.
  The old version is moved to `<compartment>/_superseded/` (with the reason) — still there for comparison, but the agent no longer uses it.

> The agent **only reads** this folder and never edits the content of the original documents.
