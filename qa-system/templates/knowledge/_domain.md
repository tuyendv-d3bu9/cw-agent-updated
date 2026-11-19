# Domain pack — project-specific additions

> Heading names `vocab`, `risks`, `rule-patterns`, `datagen`, `units` and all table header rows below are kept verbatim: `lib/domain.js` parses them. `<điền>` = "to be filled".

> Optional. Left as the empty template it has no effect: any entry still `<điền>` is treated as not declared.
> The project's industry is chosen in `knowledge/_sut.json` → `domain` (catalog: `qa-system/domains/README.md`).
> This file only ADDS to the chosen pack; on a name clash this file wins.
> Every line here is still a **checklist, not a source of truth** (QA_STANDARD §10.3): `BR`/`FD` are always quoted from project documents.
> Project-specific conflict-detection topics: declare them in `knowledge/_conflict_topics.json`, not here.

## vocab
> Same columns as the pack's `vocab.md`.

| Mục | Thuật ngữ | Nghĩa ngắn | Nguồn |
|---|---|---|---|
| <điền> | <điền> | <điền> | <điền> |

## risks
> Same columns as the pack's `risks.md`.

| Mục | Rủi ro (một câu) | Đặc tính ISO/IEC 25010:2023 | Dấu hiệu tính năng có chạm tới | Câu hỏi đóng gợi ý cho BA | Nguồn |
|---|---|---|---|---|---|
| <điền> | <điền> | <điền> | <điền> | <điền> | <điền> |

## rule-patterns
> Same columns as the pack's `rule-patterns.md`.

| Mục | Họ quy tắc | Nhóm 06W | Câu hỏi khung (trung tính) | Nguồn |
|---|---|---|---|---|
| <điền> | <điền> | <điền> | <điền> | <điền> |

## datagen
> A json block in the same format as the pack's `datagen.json`. Leave the block empty if not needed.

```json
```

## units
> A json block in the same format as the pack's `units.json`, e.g. `{ "units": ["<unit>"] }`.

```json
```
