/**
 * jira-mcp-server.js
 * Model Context Protocol (MCP) server for Jira integration over stdio.
 * 
 * Works out-of-the-box with Google Antigravity IDE, Cursor, Claude Desktop, and Windsurf.
 * Uses Jira REST API with credentials configured in .env (JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY).
 * 
 * Protocol: JSON-RPC 2.0 over stdin/stdout.
 * Note: All diagnostic logs are sent to stderr to keep stdout pure for JSON-RPC messages.
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');
const { loadEnv: loadEnvFile } = require('../lib/env');
const https = require('https');
const http = require('http');
const readline = require('readline');

const ROOT_DIR = PATHS.ROOT;
const OUTPUT_DIR = PATHS.OUTPUT;

/** process.env wins over .env: IDEs pass configuration through the environment. */
const loadEnv = () => loadEnvFile({ includeProcessEnv: true });

function logErr(msg) {
  process.stderr.write(`[JIRA-MCP] ${msg}\n`);
}

function makeRequest(jiraHost, email, token, reqPath, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(jiraHost);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      const authHeader = 'Basic ' + Buffer.from(`${email}:${token}`).toString('base64');

      const headers = {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'User-Agent': 'CW-Agent-Jira-MCP/1.0'
      };

      let bodyStr = null;
      if (postData) {
        bodyStr = typeof postData === 'string' ? postData : JSON.stringify(postData);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(bodyStr);
      }

      const options = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: reqPath,
        method: method,
        headers: headers
      };

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed, raw: body });
          } catch (e) {
            resolve({ statusCode: res.statusCode, headers: res.headers, data: null, raw: body });
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.setTimeout(15000, () => {
        req.destroy();
        reject(new Error('Request timeout after 15s'));
      });

      if (bodyStr) {
        req.write(bodyStr);
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// -------------------------------------------------------------
// Tool Definitions
// -------------------------------------------------------------
const TOOLS = [
  {
    name: 'jira_search_issues',
    description: 'Search Jira issues using JQL query (e.g. find bugs, stories, tasks). Returns list of matching tickets.',
    inputSchema: {
      type: 'object',
      properties: {
        jql: {
          type: 'string',
          description: 'JQL query string. Defaults to searching open bugs in the configured project.'
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of issues to return (default: 20, max: 100).'
        }
      }
    }
  },
  {
    name: 'jira_get_issue',
    description: 'Get full details of a specific Jira issue by its key (e.g. SHOPGO-101).',
    inputSchema: {
      type: 'object',
      properties: {
        issueKey: {
          type: 'string',
          description: 'The Jira issue key, e.g. "SHOPGO-101".'
        }
      },
      required: ['issueKey']
    }
  },
  {
    name: 'jira_create_bug',
    description: 'Create a new Bug ticket on Jira with standard fields (summary, description, severity/priority, component).',
    inputSchema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Title/Summary of the bug (e.g., "[Voucher] Mã hết hạn vẫn áp dụng thành công").'
        },
        description: {
          type: 'string',
          description: 'Detailed description (Steps to reproduce, Expected vs Actual, Environment).'
        },
        priority: {
          type: 'string',
          description: 'Priority level: Highest, High, Medium, Low, Lowest (default: Medium).'
        },
        components: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional component names (e.g. ["Voucher", "Checkout"]).'
        }
      },
      required: ['summary', 'description']
    }
  },
  {
    name: 'jira_pull_defects_to_file',
    description: 'Pull all active bugs/defects from Jira and write directly to OUTPUT/<task-slug>/jira_defects_summary.md for QA analysis.',
    inputSchema: {
      type: 'object',
      properties: {
        taskSlug: {
          type: 'string',
          description: 'The task slug (e.g. "function-d-voucher"). If omitted, uses the first active task directory.'
        }
      }
    }
  },
  {
    name: 'jira_check_connection',
    description: 'Verify connection to Jira Cloud instance and return current user and server info.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// -------------------------------------------------------------
// Tool Implementation Handlers
// -------------------------------------------------------------
async function handleCheckConnection(env) {
  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;

  if (!host || !token || !email) {
    return {
      success: false,
      message: 'Jira credentials not fully configured in .env. Required: JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN.'
    };
  }

  const res = await makeRequest(host, email, token, '/rest/api/2/myself');
  if (res.statusCode === 200 && res.data) {
    return {
      success: true,
      user: {
        displayName: res.data.displayName,
        emailAddress: res.data.emailAddress,
        timeZone: res.data.timeZone,
        active: res.data.active
      },
      jiraHost: host,
      projectKey: env.JIRA_PROJECT_KEY || 'N/A'
    };
  }

  return {
    success: false,
    statusCode: res.statusCode,
    error: res.data || res.raw
  };
}

async function handleSearchIssues(args, env) {
  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;
  const projectKey = env.JIRA_PROJECT_KEY || 'PROJECT';

  if (!host || !token || !email) {
    return {
      error: 'Missing Jira configuration in .env. Please configure JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN.'
    };
  }

  const defaultJql = `project = "${projectKey}" ORDER BY created DESC`;
  const jql = args.jql || defaultJql;
  const maxResults = Math.min(Math.max(args.maxResults || 20, 1), 100);

  const reqPath = `/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=key,summary,status,priority,issuetype,components,created,assignee`;
  const res = await makeRequest(host, email, token, reqPath);

  if (res.statusCode !== 200) {
    return {
      error: `Jira search returned HTTP ${res.statusCode}`,
      details: res.data || res.raw
    };
  }

  const issues = (res.data.issues || []).map(i => ({
    key: i.key,
    type: i.fields.issuetype?.name || 'Unknown',
    summary: i.fields.summary,
    status: i.fields.status?.name || 'Unknown',
    priority: i.fields.priority?.name || 'Medium',
    components: (i.fields.components || []).map(c => c.name),
    assignee: i.fields.assignee?.displayName || 'Unassigned',
    created: i.fields.created
  }));

  return {
    total: res.data.total,
    returned: issues.length,
    jql: jql,
    issues: issues
  };
}

async function handleGetIssue(args, env) {
  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;

  if (!host || !token || !email) {
    return { error: 'Missing Jira configuration in .env.' };
  }

  const issueKey = args.issueKey;
  if (!issueKey) {
    return { error: 'Missing parameter "issueKey".' };
  }

  const res = await makeRequest(host, email, token, `/rest/api/2/issue/${encodeURIComponent(issueKey)}`);
  if (res.statusCode !== 200) {
    return {
      error: `Failed to fetch issue ${issueKey}: HTTP ${res.statusCode}`,
      details: res.data || res.raw
    };
  }

  const f = res.data.fields || {};
  return {
    key: res.data.key,
    summary: f.summary,
    type: f.issuetype?.name,
    status: f.status?.name,
    priority: f.priority?.name,
    description: f.description,
    components: (f.components || []).map(c => c.name),
    created: f.created,
    updated: f.updated,
    assignee: f.assignee?.displayName || 'Unassigned',
    reporter: f.reporter?.displayName || 'Unknown'
  };
}

async function handleCreateBug(args, env) {
  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;
  const projectKey = env.JIRA_PROJECT_KEY;

  if (!host || !token || !email || !projectKey) {
    return { error: 'Missing Jira configuration in .env. Required: JIRA_HOST, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_PROJECT_KEY.' };
  }

  const payload = {
    fields: {
      project: { key: projectKey },
      summary: args.summary,
      description: args.description,
      issuetype: { name: 'Bug' }
    }
  };

  if (args.priority) {
    payload.fields.priority = { name: args.priority };
  }

  if (args.components && Array.isArray(args.components) && args.components.length > 0) {
    payload.fields.components = args.components.map(c => ({ name: c }));
  }

  const res = await makeRequest(host, email, token, '/rest/api/2/issue', 'POST', payload);
  if (res.statusCode === 201 && res.data) {
    return {
      success: true,
      key: res.data.key,
      id: res.data.id,
      self: res.data.self,
      url: `${host}/browse/${res.data.key}`
    };
  }

  return {
    success: false,
    statusCode: res.statusCode,
    error: res.data || res.raw
  };
}

async function handlePullDefectsToFile(args, env) {
  let taskSlug = args.taskSlug;
  if (!taskSlug) {
    if (fs.existsSync(OUTPUT_DIR)) {
      const dirs = fs.readdirSync(OUTPUT_DIR).filter(f => {
        return fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory() && !f.startsWith('.') && !f.startsWith('_');
      });
      if (dirs.length > 0) taskSlug = dirs[0];
    }
  }

  if (!taskSlug) {
    return { error: 'No active task directory found in OUTPUT/.' };
  }

  const taskDir = path.join(OUTPUT_DIR, taskSlug);
  if (!fs.existsSync(taskDir)) {
    fs.mkdirSync(taskDir, { recursive: true });
  }
  const outPath = path.join(taskDir, 'jira_defects_summary.md');

  const host = env.JIRA_HOST;
  const email = env.JIRA_EMAIL;
  const token = env.JIRA_API_TOKEN;
  const projectKey = env.JIRA_PROJECT_KEY || 'PROJECT';

  if (!host || !token || !email) {
    return {
      success: false,
      message: 'Jira credentials not set in .env. Mock summary used if running via CLI.',
      file: outPath
    };
  }

  const jql = `project = "${projectKey}" AND issuetype in (Bug, Defect) ORDER BY created DESC`;
  const reqPath = `/rest/api/2/search?jql=${encodeURIComponent(jql)}&maxResults=50&fields=key,summary,status,priority,components`;
  const res = await makeRequest(host, email, token, reqPath);

  if (res.statusCode !== 200) {
    return {
      success: false,
      statusCode: res.statusCode,
      error: res.data || res.raw
    };
  }

  const issues = res.data.issues || [];
  const rows = issues.map(iss => {
    const key = iss.key;
    const sum = (iss.fields.summary || '').replace(/\|/g, '-');
    const stat = iss.fields.status?.name || 'Open';
    const prio = iss.fields.priority?.name || 'Medium';
    const comp = (iss.fields.components || []).map(c => c.name).join(', ') || 'General';
    return `| \`${key}\` | ${sum} | ${prio} | ${stat} | ${comp} | Synced via Jira MCP |`;
  });

  const reportContent = [
    `# DEFECTS SUMMARY FROM JIRA · ${projectKey}`,
    `Sync Timestamp: ${new Date().toISOString()} · Source: ${host} (MCP Mode)`,
    ``,
    `| Issue Key | Summary | Severity | Status | Component | Notes |`,
    `|---|---|---|---|---|---|`,
    ...rows,
    ``
  ].join('\n');

  fs.writeFileSync(outPath, reportContent, 'utf-8');

  return {
    success: true,
    count: issues.length,
    outputFile: outPath,
    projectKey: projectKey
  };
}

// -------------------------------------------------------------
// JSON-RPC stdio Protocol Handler
// -------------------------------------------------------------
function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message, data = null) {
  const errRes = {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: code,
      message: message
    }
  };
  if (data) errRes.error.data = data;
  sendResponse(errRes);
}

async function processMessage(msg, env) {
  if (!msg || typeof msg !== 'object') return;

  const { id, method, params } = msg;

  switch (method) {
    case 'initialize': {
      sendResponse({
        jsonrpc: '2.0',
        id: id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'cw-jira-mcp',
            version: '1.0.0'
          }
        }
      });
      break;
    }

    case 'notifications/initialized': {
      logErr('MCP client connection established successfully.');
      break;
    }

    case 'ping': {
      sendResponse({
        jsonrpc: '2.0',
        id: id,
        result: {}
      });
      break;
    }

    case 'tools/list': {
      sendResponse({
        jsonrpc: '2.0',
        id: id,
        result: {
          tools: TOOLS
        }
      });
      break;
    }

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      try {
        let resultData = null;

        if (toolName === 'jira_check_connection') {
          resultData = await handleCheckConnection(env);
        } else if (toolName === 'jira_search_issues') {
          resultData = await handleSearchIssues(toolArgs, env);
        } else if (toolName === 'jira_get_issue') {
          resultData = await handleGetIssue(toolArgs, env);
        } else if (toolName === 'jira_create_bug') {
          resultData = await handleCreateBug(toolArgs, env);
        } else if (toolName === 'jira_pull_defects_to_file') {
          resultData = await handlePullDefectsToFile(toolArgs, env);
        } else {
          sendError(id, -32601, `Method/Tool not found: ${toolName}`);
          return;
        }

        sendResponse({
          jsonrpc: '2.0',
          id: id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof resultData === 'string' ? resultData : JSON.stringify(resultData, null, 2)
              }
            ]
          }
        });
      } catch (err) {
        logErr(`Error executing tool ${toolName}: ${err.message}`);
        sendResponse({
          jsonrpc: '2.0',
          id: id,
          result: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Tool execution failed: ${err.message}`
              }
            ]
          }
        });
      }
      break;
    }

    default: {
      if (id !== undefined && id !== null) {
        sendError(id, -32601, `Method not supported: ${method}`);
      }
      break;
    }
  }
}

function main() {
  const env = loadEnv();
  logErr('Starting CW Jira MCP Server (stdio mode)...');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed);
      processMessage(parsed, env);
    } catch (e) {
      logErr(`Invalid JSON message received: ${e.message}`);
    }
  });

  rl.on('close', () => {
    logErr('MCP Server stdin closed. Exiting.');
    process.exit(0);
  });
}

main();
