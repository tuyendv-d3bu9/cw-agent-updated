# Skill Lab — creating and upgrading qa-system skills

Two practice exercises, done together with the AI following the process in `qa-system/qa-lead/skills/system-upgrade-governance.md`.
Read first: [`docs/so-tay-tao-skill.html`](../so-tay-tao-skill.html) (the skill-authoring handbook; open it in a browser).

> **Language note.** The lab's scenario data (the refund feature documents in `de-bai/`, the BA answers in `tra-loi-ba/`,
> the reference results in `*/du-lieu/`, and `CR-08`) is deliberately kept in Vietnamese: it is the source material the
> agents quote verbatim, and the `.docx` / `.xlsx` files of the same scenario are Vietnamese too. Folder names
> (`de-bai` = assignment, `tra-loi-ba` = BA answers, `du-lieu` = data) are also kept because commands refer to them.

| Folder | Exercise | Upgrade type | Suggested duration |
|---|---|---|---|
| [`01-tao-skill-moi/`](01-tao-skill-moi/) | Create a new skill when you **do not yet know** which `qa-*` agent it belongs to | `[A]` or `[B]` — learners analyze it themselves | 60–75 minutes |
| [`02-nang-cap-skill/`](02-nang-cap-skill/) | Upgrade the `missing-rule-06w` skill so two runs produce the same set of questions | `[C]` — edit in place | 45–60 minutes |

## Preparation (5 minutes, each learner)

```bash
git switch develop
git switch -c lab/<learner-name>      # work on your own branch, never edit develop directly
npm install
npm test                              # must be green before starting
```

All lab data lives right in this folder, independent of any branch:

| Folder | Contains |
|---|---|
| [`de-bai/`](de-bai/) | 8 documents of the refund feature with planted traps: SRS v1/v2 (docx, with comments and unapproved edits), an xlsx error-code table with hidden rows, API, wireframe, BRD, CR-07, meeting minutes |
| [`tra-loi-ba/`](tra-loi-ba/) | BA/PO answers to 17 questions (role-played) |
| `01-tao-skill-moi/du-lieu/` | Reference results for Stages 01→06 (51 test cases) + knowledge, so Exercise 1 can analyze a CR |
| `02-nang-cap-skill/du-lieu/` | A fixed Stage 01 version, so Exercise 2 measures Stage 02 alone |

Load the assignment into a new task (use `--force` because a task with the same content may already exist):

```bash
npm run intake -- docs/skill-lab/de-bai --slug <task-name> --force
```

## Ground rules of the lab session

1. Do not edit files in `qa-system/` by hand — delegate to the AI using the sample sentences in each exercise.
2. The ANALYSIS step (`PHAN_TICH`) always stops for a **human** to approve before editing.
3. "Done" means: `npm test` green · `npm run agent:check` INTACT · two real runs and `diff-runs` explainable.
4. The analysis sheet (`phieu-phan-tich.md`) may be committed only once filled in. The sheet is a record handed to the instructor, not committed.
