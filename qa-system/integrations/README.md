# Cross-Tool Integration Guide

> This folder is for **Learners & Developers**: how to use this codebase on different AI tools (**Google Antigravity IDE, Cursor, Claude Code CLI, Windsurf, Codex**).

---

## 1. Common Mechanism (Single Source of Truth)

The whole system is orchestrated through a single Constitution:
👉 **[`AGENTS.md`](../../AGENTS.md)** (in the root folder).

- **Do not create a messy `TODO.md` at the root**: every test process and per-feature task list is managed centrally and updated directly at:
  `OUTPUT/<task-slug>/00_plan.md`
- **See progress at any time**:
  ```bash
  npm run status
  ```

---

## 2. Jira MCP Integration Guide (Model Context Protocol)

The system supports an MCP Server that interacts with Jira directly in both directions:
👉 Details at: **[`jira-mcp-guide.md`](./jira-mcp-guide.md)**

- Start the MCP server: `npm run jira:mcp`
- Pull defects automatically: `npm run jira:pull`
- Push test cases prepared as CSV: `npm run jira:push`

---

## 3. How to Use on Each Tool

### 🟢 1. Google Antigravity IDE (Recommended)
- **How to use**: Open the project folder in Antigravity.
- Antigravity automatically activates Planning Mode, reads `AGENTS.md` and loads the MCP configuration at `.agents/mcp_config.json`.

### 🟣 2. Cursor IDE / Windsurf
- **Ready-made MCP configuration**: the file [`.cursor/mcp.json`](../../.cursor/mcp.json) is already included.
- **Ready-made rules**: the file [`.cursor/rules/agents.mdc`](../../.cursor/rules/agents.mdc) is already included in the repo.
- **How to use**: 
  1. Open the project with Cursor.
  2. Cursor automatically loads the `jira_*` tools, reads `AGENTS.md` and automatically updates the `- [x]` checkboxes in `OUTPUT/<task-slug>/00_plan.md`.

### 🟠 3. Claude Code CLI
- **Ready-made configuration**: the file [`.claude/CLAUDE.md`](../../.claude/CLAUDE.md) is already included in the repo.
- **How to use**:
  1. Open a terminal in the project folder and run `claude`.
  2. Claude Code automatically loads the configuration and complies 100% with the `AGENTS.md` Constitution.
