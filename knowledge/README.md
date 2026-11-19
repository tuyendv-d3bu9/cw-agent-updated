# knowledge/ — Project memory · **SHARED**

This is the **only thing that outlives `OUTPUT/`**. Delete `OUTPUT/` and re-run and the agent still remembers;
delete `knowledge/` and you must go back and ask the BA everything from scratch.

| File | What it is |
|---|---|
| `_project.md` | Project conventions — filled by **humans**. A line still `<điền>` ("to be filled") = not declared, the agent treats it as absent |
| `_glossary.md` | Business term glossary — filled by humans |
| `_template.md` | Template for feature files |
| `_sut.json` | System under test (URL…) for automation |
| `_system_map.json` | Routing map — `npm run map:sync` syncs it automatically, do not edit by hand |
| `features/<slug>.md` | Knowledge of one feature — see [features/README.md](features/README.md) |

Who may write which section: a single table in `qa-system/core/QA_STANDARD.md` §8.
When the BA answers a pending question, tell the agent *"The BA settled: [content]"* — the agent copies it verbatim into the right question row
(with the answerer and date) and never writes on the BA's behalf.
