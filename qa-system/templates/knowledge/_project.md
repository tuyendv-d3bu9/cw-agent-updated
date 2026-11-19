# Project Knowledge — conventions used for EVERY feature

> **Project-level** baseline knowledge, declared by humans. Every skill reads this file.
> A cell still containing `<điền>` ("to be filled") = **not declared**: the agent treats it as absent (`[CONTEXT_MISSING]` / `[CHƯA CÓ TRONG TÀI LIỆU]`, the fixed label meaning "not in the document"),
> and **never** substitutes a "typical" value. See `qa-system/core/QA_STANDARD.md` §8, §10.

Project (Dự án): `<điền>` · Last updated (Cập nhật lần cuối): `<điền>`

---

## 1. Identifier conventions
| Object | Format | Example |
|---|---|---|
| Module prefix for `TC_ID` (2–6 uppercase characters) | `<điền>` | `<điền>` |
| Business codes (order code, transaction code…) | `<điền>` | `<điền>` |

## 2. Data formats
| Type | Convention | Note |
|---|---|---|
| Date / Time | `<điền>` | If not declared, the agent uses `YYYY-MM-DD` for **QA documents** and does not infer the system's display format |
| Currency | `<điền>` | |
| Timezone | `<điền>` | |
| NULL vs empty | `<điền>` | |

## 3. Shared business context
> Used for Risk Analysis (skill `01`). A cell not declared ⇒ `[CONTEXT_MISSING]`.

| Aspect | Content |
|---|---|
| User Context | `<điền>` |
| Usage Context | `<điền>` |
| Financial / Business Context | `<điền>` |
| Operational Context | `<điền>` |
| Criticality Context | `<điền>` |

## 4. Test environment
| Attribute | Content |
|---|---|
| Environment | `<điền>` |
| How data is seeded | `<điền>` |
| May production-like data be used? | `<điền>` |

## 5. Test Management Tool & ALM Integration
### 5.1. Jira Xray (recommended)
| Attribute | Standard configuration | Meaning / Note |
|---|---|---|
| Issue Type | `Test` | The issue type that represents a Test Case in Xray |
| Summary Format | `[<TC_ID>] <Title>` | Example: `[<MODULE>-001] Verify <behavior>...` |
| Manual Steps | `Action`, `Data`, `Expected Result` | The 3 standard columns of the Manual Test Step table in Xray |
| Preconditions | `Preconditions` (Text/Wiki) | Conditions that must hold before executing the test |
| Priority | `High`, `Medium`, `Low` | Per the Priority scale of `QA_STANDARD.md` §11 |
| Labels | `Rule#BR-xx`, `Viewpoint#VP-xx`, `Module#<MOD>` | Supports traceability |
| Export file | `OUTPUT/<slug>/export_jira_xray.csv` | UTF-8 BOM encoding, ready for the Xray Test Importer |

### 5.2. Redmine
| Attribute | Standard configuration | Meaning / Note |
|---|---|---|
| Tracker | `Test Case` (or `Feature` / `Task`) | Issue classification in Redmine |
| Subject | `[<TC_ID>] <Title>` | Test case title |
| Priority | `Urgent` (High), `Normal` (Medium), `Low` (Low) | Redmine's standard priority levels |
| Category | Module code (`AUTH`, `PAY`...) | Groups test cases by module |
| Status | `New` | Initial status |
| Description | Full Preconditions, Steps, Data, Expected Result | Redmine's Textile / Markdown format |
| Export file | `OUTPUT/<slug>/export_redmine.csv` | UTF-8 BOM encoding |

## 6. Project-specific constraints
> Rules that apply across the whole system, **with a source**. If none, leave the table empty.

| Rule | Source |
|---|---|
