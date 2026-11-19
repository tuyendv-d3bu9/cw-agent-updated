# Jira MCP (Model Context Protocol) Integration Guide

> **Goal**: Let AI coding assistants (**Google Antigravity IDE, Cursor, Claude Desktop, Windsurf**) interact with Jira directly in the chat window through the MCP (Model Context Protocol) standard or the REST API.

---

## 1. Three Ways to Connect to Jira in This Project

| Method | When to use? | How it works | Cost |
|---|---|---|---|
| **1. Jira MCP Server** | The AI looks up tickets, reads issue details and creates bugs directly during pair-programming | JSON-RPC 2.0 stdio (`qa-system/tools/jira/mcp-server.js`) | **100% free** (Jira Free Plan) |
| **2. REST API Script** | Background automation, bulk bug pulls (`jira:pull`), test risk analysis | Node HTTPS script (`qa-system/tools/jira/jira-client.js`) | **100% free** |
| **3. CSV Import** | Push hundreds of test cases into Jira / Xray without fear of rate limits | Export a UTF-8 BOM file (`export_jira_xray.csv`) | **100% free** |

---

## 2. How to Get a Free Jira API Token (30 Seconds)

1. Sign up for a Jira Cloud Free account (up to 10 users, permanently): [atlassian.com/software/jira/free](https://www.atlassian.com/software/jira/free).
2. Log in and go to the security management page: [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens).
3. Click **Create API token** ➔ give it a memorable name (e.g. `cw-qa-agent`) ➔ copy the token.
4. Create a `.env` file in the project root (copy from `.env.example`):
   ```env
   JIRA_HOST=https://your-domain.atlassian.net
   JIRA_EMAIL=your-email@gmail.com
   JIRA_API_TOKEN=ATATT3xFfGF0... (the token you just created)
   JIRA_PROJECT_KEY=PROJ
   ```

---

## 3. Available MCP Tools

When the MCP Server is activated, the Agent may use the following 5 tools:

### 1. `jira_check_connection`
- **Purpose**: Check the connection to the Jira instance, confirm the account information and access rights.

### 2. `jira_search_issues`
- **Purpose**: Search a list of issues using JQL (Jira Query Language) syntax.
- **Parameters**:
  - `jql` (string): The JQL statement (e.g. `project = "PROJ" AND issuetype = Bug AND status = Open`).
  - `maxResults` (number): Maximum number of results (default 20, max 100).

### 3. `jira_get_issue`
- **Purpose**: Get the details of one specific Jira ticket.
- **Parameters**:
  - `issueKey` (string, required): The ticket key (e.g. `PROJ-101`).

### 4. `jira_create_bug`
- **Purpose**: Create a new Bug-type issue in Jira following the technical standard.
- **Parameters**:
  - `summary` (string, required): The bug title.
  - `description` (string, required): Detailed description (Preconditions, Steps, Expected vs Actual).
  - `priority` (string): Priority level (`Highest`, `High`, `Medium`, `Low`, `Lowest`).
  - `components` (array of strings): List of related components.

### 5. `jira_pull_defects_to_file`
- **Purpose**: Pull every open Bug/Defect from Jira and write it to `OUTPUT/<task-slug>/jira_defects_summary.md` for test risk analysis.
- **Parameters**:
  - `taskSlug` (string): The feature folder name in `OUTPUT/`.

---

## 4. MCP Configuration for Each AI Tool

### 🟢 1. Google Antigravity IDE
The system has already configured this file:
👉 [`.agents/mcp_config.json`](../../.agents/mcp_config.json)
```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```
Antigravity automatically detects it and loads the `jira_*` tools into the Agent's context.

### 🟣 2. Cursor IDE
The configuration file is already created at:
👉 [`.cursor/mcp.json`](../../.cursor/mcp.json)
```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": ["qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```

### 🟠 3. Claude Desktop
Add to the `claude_desktop_config.json` configuration file:
```json
{
  "mcpServers": {
    "cw-jira": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_PROJECT>/qa-system/tools/jira/mcp-server.js"]
    }
  }
}
```

---

## 5. Self-Test

### Test with the CLI:
Run the command that checks the connection and starts the MCP server:
```bash
npm run jira:mcp
```
Or run the pull command through the REST API:
```bash
npm run jira:pull
```
