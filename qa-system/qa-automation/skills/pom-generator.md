---
name: pom-generator
description: >
  Automatically generates a standard TypeScript Page Object Model (POM) structure for Playwright based on the DOM and Accessibility Snapshot survey from the web exploration flow.
---

# Skill: pom-generator

> Complies with `qa-system/core/QA_STANDARD.md` (verdict · guards · FACT).

## Purpose
Create professional, modular, easy-to-maintain Page Object Model (POM) classes with a strict separation between the element structure (Locators) and the user actions (Actions).

## Inputs (Đầu vào)
- DOM snapshot / Accessibility Tree from web exploration (Playwright MCP or the `web-journey-discovery` skill of the same agent).
- The list of actions in the Test Cases (Steps).
- `knowledge/features/<sut>-ui-map.md` — locators extracted from the real app. Not present ⇒ run `web-journey-discovery` first; never guess.
- `knowledge/_project.md` · `knowledge/features/<task-slug>.md` (always loaded, QA_STANDARD §7)

## Rules for generating standard Playwright locators (Mandatory)
1. Priority 1: `page.getByRole(...)` (e.g. `page.getByRole('button', { name: '<button label in the ui-map>' })`)
2. Priority 2: `page.getByTestId(...)` (e.g. `page.getByTestId('<data-testid in the ui-map>')`)
3. Priority 3: `page.getByLabel(...)` or `page.getByPlaceholder(...)`
4. Priority 4: `page.getByText(...)`
5. **FORBIDDEN**: never use absolute XPath or random classes that change easily.

## Standard generated file structure:
> The example below only illustrates the structure; page names, labels and placeholders must come from the real app / ui-map.
Write into `automation/pages/<PageName>.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class <PageName>Page {
  readonly page: Page;
  readonly <field>Input: Locator;
  readonly submitButton: Locator;
  readonly resultMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Every label / placeholder / test-id is taken VERBATIM from knowledge/features/<sut>-ui-map.md
    this.<field>Input = page.getByLabel('<field label in the ui-map>');
    this.submitButton = page.getByRole('button', { name: '<button label in the ui-map>' });
    this.resultMessage = page.getByTestId('<data-testid in the ui-map>');
  }

  async goto() {
    await this.page.goto('<page path in the ui-map>');
  }

  async submit<Field>(value: string) {
    await this.<field>Input.fill(value);
    await this.submitButton.click();
  }

  async verifyResult(expectedText: string) {
    // expectedText comes from the test case's Expected Result; never set it yourself
    await expect(this.resultMessage).toContainText(expectedText);
  }
}
```

## Acceptance gates (Quality Gates)
- [ ] 100% of Page Objects follow the TypeScript standard, with no syntax errors.
- [ ] Every locator follows the robust-locator priority order (getByRole / getByTestId).
- [ ] Every action method has explicit types (`async ...: Promise<void>`).
