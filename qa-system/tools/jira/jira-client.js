#!/usr/bin/env node
/**
 * jira-client.js — The single entry point for everything Jira.
 *
 *   pullDefects(slug, cfg)        Fetch bugs/defects into a summary file.
 *   pushTestCases(slug, cfg)      Create test-case issues, or export CSV without credentials.
 *   syncRunResults(slug, run, cfg) Push run results, comments and evidence screenshots.
 *   parseTestCases / parseRunResult / parseMapping  Markdown readers for the above.
 *
 * Merged from three earlier files. The one wired to `npm run jira:push` was a
 * stub that logged and returned, while the working implementation sat unused.
 *
 * Usage:
 *   jira-client.js pull [slug]
 *   jira-client.js push [slug]
 *   jira-client.js sync [slug] [run-id]
 *   jira-client.js mcp
 *
 * Note: generated reports and Jira issue bodies stay in Vietnamese — they are
 * deliverables read by the project team, not diagnostics.
 */

const fs = require('fs');
const path = require('path');

const { PATHS, taskDir, listTaskSlugs } = require('../lib/paths');
const { loadEnv, jiraConfig } = require('../lib/env');
const { jiraRequest, jiraAttach } = require('../lib/jira-api');

// ───────────────────────────── PULL ─────────────────────────────

async function pullDefects(slug, cfg) {
  const outPath = path.join(taskDir(slug), 'jira_defects_summary.md');
  const projectKey = cfg.projectKey || 'PROJECT';

  console.log(`\n[JIRA PULL] Fetching bugs/defects for project [${projectKey}]...`);

  if (!cfg.ok) {
    console.warn(`Not configured in .env: ${cfg.missing.join(', ')}`);
    console.log('Emitting a sample table so the risk-analysis pipeline can still run.');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, mockDefectReport(projectKey), 'utf-8');
    console.log(`Saved: ${path.relative(PATHS.ROOT, outPath)}`);
    return;
  }

  const jql = encodeURIComponent(
    `project = "${projectKey}" AND issuetype in (Bug, Defect) ORDER BY created DESC`
  );
  const res = await jiraRequest(
    cfg,
    'GET',
    `/rest/api/3/search/jql?jql=${jql}&maxResults=50&fields=key,summary,status,priority,components`
  );

  if (res.statusCode !== 200) {
    throw new Error(`Jira returned HTTP ${res.statusCode}: ${res.raw}`);
  }

  const issues = res.data.issues || [];
  console.log(`Pulled ${issues.length} defect(s).`);

  const rows = issues.map((iss) => {
    const sum = iss.fields.summary.replace(/\|/g, '-');
    const stat = iss.fields.status?.name || 'Open';
    const prio = iss.fields.priority?.name || 'Medium';
    const comp = (iss.fields.components || []).map((c) => c.name).join(', ') || 'General';
    return `| \`${iss.key}\` | ${sum} | ${prio} | ${stat} | ${comp} | Đồng bộ từ Jira |`;
  });

  const report = [
    `# DANH SÁCH DEFECT TỪ JIRA · ${projectKey}`,
    `Thời điểm đồng bộ: ${new Date().toISOString()} · Nguồn: ${cfg.host}`,
    ``,
    `| Issue Key | Tóm tắt | Severity | Trạng thái | Component | Ghi chú |`,
    `|---|---|---|---|---|---|`,
    ...rows,
    ``,
  ].join('\n');

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, report, 'utf-8');
  console.log(`Saved: ${path.relative(PATHS.ROOT, outPath)}`);
}

function mockDefectReport(projectKey) {
  return [
    `# DANH SÁCH DEFECT TỪ JIRA · ${projectKey}`,
    `Thời điểm: ${new Date().toISOString()}`,
    ``,
    `> [!NOTE]`,
    `> Đây là **dữ liệu mẫu**, sinh ra khi .env chưa có thông tin kết nối Jira.`,
    `> Không dùng số liệu này để kết luận chất lượng.`,
    ``,
    `| Issue Key | Tóm tắt | Severity | Trạng thái | Component | Ghi chú |`,
    `|---|---|---|---|---|---|`,
    `| \`${projectKey}-102\` | Không trim khoảng trắng khi dán từ clipboard | Medium | Closed | CORE | Kiểm thử biên khoảng trắng |`,
    `| \`${projectKey}-145\` | Giá trị vượt ngưỡng vẫn tính theo mệnh giá | High | Resolved | LOGIC | Kiểm biên trên |`,
    `| \`${projectKey}-208\` | Người dùng chưa đăng nhập thao tác gây crash | High | Closed | AUTH | Kiểm tiền điều kiện đăng nhập |`,
    `| \`${projectKey}-256\` | Giao dịch lỗi không rollback sạch trạng thái | Critical | Reopened | TRANSACTION | Kiểm nhánh thất bại |`,
    ``,
    `### Cấu hình kết nối thật`,
    `Tạo file \`.env\` ở thư mục gốc:`,
    '```env',
    `JIRA_HOST=https://your-company.atlassian.net`,
    `JIRA_EMAIL=qa-lead@example.com`,
    `JIRA_API_TOKEN=your_jira_api_token`,
    `JIRA_PROJECT_KEY=${projectKey}`,
    '```',
  ].join('\n');
}

// ───────────────────────────── PUSH ─────────────────────────────

/** Reads the eight test-case fields out of `05_test_case_spec.md`. */
function parseTestCases(content) {
  const cases = [];

  for (const sec of content.split(/\n(?=###\s+TC_ID:)/g)) {
    if (!sec.includes('### TC_ID:')) continue;

    const pick = (re, fallback = '') => {
      const m = sec.match(re);
      return m ? m[1].trim().replace(/^\s*-\s+/gm, '• ') : fallback;
    };

    const tc = {
      id: pick(/###\s+TC_ID:\s*([A-Za-z0-9_-]+)/),
      title: pick(/-\s+\*\*Title\*\*:\s*([^\n]+)/),
      precondition: pick(/-\s+\*\*Precondition\*\*:\s*([\s\S]*?)(?=-\s+\*\*Test Steps\*\*)/),
      steps: pick(/-\s+\*\*Test Steps\*\*:\s*([\s\S]*?)(?=-\s+\*\*Test Data\*\*)/),
      data: pick(/-\s+\*\*Test Data\*\*:\s*([\s\S]*?)(?=-\s+\*\*Expected Result\*\*)/),
      expected: pick(/-\s+\*\*Expected Result\*\*:\s*([\s\S]*?)(?=-\s+\*\*Priority\*\*)/),
      priority: pick(/-\s+\*\*Priority\*\*:\s*([^\n]+)/, 'Medium'),
      tags: pick(/-\s+\*\*Tags\*\*:\s*([^\n]+)/),
      module: '',
    };

    if (!tc.id) continue;
    tc.module = (tc.tags.match(/Module#([A-Za-z0-9_-]+)/) || [])[1] || tc.id.split('-')[0] || '';
    cases.push(tc);
  }
  return cases;
}

function mapPriority(raw) {
  const p = String(raw).toLowerCase();
  if (p.includes('critical') || p.includes('blocker') || p.includes('highest')) return 'Highest';
  if (p.includes('high')) return 'High';
  if (p.includes('low')) return 'Low';
  return 'Medium';
}

async function pushTestCases(slug, cfg) {
  const dir = taskDir(slug);
  const specPath = path.join(dir, '05_test_case_spec.md');
  const jiraCsv = path.join(dir, 'export_jira_xray.csv');
  const redmineCsv = path.join(dir, 'export_redmine.csv');

  console.log(`\n[JIRA PUSH] Preparing test cases for task [${slug}]...`);

  // Without credentials, fall back to CSV import mode, which still works.
  if (!cfg.ok) {
    if (!fs.existsSync(jiraCsv)) {
      console.log('No CSV yet, invoking export-testcases...');
      const { exportTestCases } = require('../testcase/export-testcases');
      exportTestCases(slug);
    }
    console.log(`\nFILE IMPORT MODE (missing: ${cfg.missing.join(', ')})`);
    console.log(`   - Jira Xray : ${path.relative(PATHS.ROOT, jiraCsv)}`);
    console.log(`   - Redmine   : ${path.relative(PATHS.ROOT, redmineCsv)}`);
    console.log('\nJira: Project > Xray Settings > Test Case Importer > pick export_jira_xray.csv');
    console.log('Redmine: Issues > Import > pick export_redmine.csv');
    console.log(`\nTo push through the API instead, set ${cfg.missing.join(', ')} in .env`);
    return;
  }

  if (!fs.existsSync(specPath)) {
    throw new Error(`No ${path.relative(PATHS.ROOT, specPath)} — run stage 5 first.`);
  }

  const projectKey = cfg.projectKey || 'SG';
  console.log(`Connecting to ${cfg.host} · project [${projectKey}]`);

  // Fetch existing issues so we do not create duplicates.
  const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY created ASC`);
  const existingRes = await jiraRequest(
    cfg,
    'GET',
    `/rest/api/3/search/jql?jql=${jql}&maxResults=1000&fields=key,summary`
  );

  const existing = new Map();
  if (existingRes.statusCode === 200 && existingRes.data?.issues) {
    for (const iss of existingRes.data.issues) {
      const m = iss.fields.summary.match(/\[([A-Za-z0-9_-]+)\]/);
      if (m) existing.set(m[1], iss.key);
    }
  }
  console.log(`Jira already holds ${existing.size} mapped test case(s).`);

  const cases = parseTestCases(fs.readFileSync(specPath, 'utf-8'));
  console.log(`Spec contains ${cases.length} test case(s).`);

  const results = [];
  for (const tc of cases) {
    if (existing.has(tc.id)) {
      const key = existing.get(tc.id);
      console.log(`[${tc.id}] already exists as ${key}`);
      results.push({ ...tc, key, url: `${cfg.host}/browse/${key}`, status: 'Đã có' });
      continue;
    }

    const desc = [
      `h3. Mục tiêu`, tc.title, ``,
      `h3. Tiền điều kiện`, tc.precondition, ``,
      `h3. Các bước`, tc.steps, ``,
      `h3. Dữ liệu test`, tc.data, ``,
      `h3. Kết quả kỳ vọng`, tc.expected, ``,
      `----`, `*Tags*: ${tc.tags}`,
    ].join('\n');

    const labels = ['test-case', 'qa-agent'];
    if (tc.module) labels.push(tc.module.toLowerCase());

    console.log(`Creating [${tc.id}] in Jira...`);
    const res = await jiraRequest(cfg, 'POST', '/rest/api/2/issue', {
      fields: {
        project: { key: projectKey },
        summary: `[${tc.id}] ${tc.title}`,
        description: desc,
        issuetype: { name: 'Task' },
        priority: { name: mapPriority(tc.priority) },
        labels,
      },
    });

    if (res.statusCode === 201 && res.data?.key) {
      console.log(`   ✅ ${res.data.key}`);
      results.push({ ...tc, key: res.data.key, url: `${cfg.host}/browse/${res.data.key}`, status: 'Tạo mới' });
    } else {
      console.error(`   ❌ Lỗi ${tc.id}: HTTP ${res.statusCode} ${res.raw?.slice(0, 200) || ''}`);
      results.push({ ...tc, key: 'ERROR', url: '', status: `Lỗi ${res.statusCode}` });
    }

    await sleep(200); // stay under Jira rate limits
  }

  writeMapping(slug, projectKey, cfg.host, results);
}

function writeMapping(slug, projectKey, host, results) {
  const ok = results.filter((r) => r.key !== 'ERROR').length;
  const lines = [
    `# BẢNG ÁNH XẠ TEST CASE ↔ JIRA · ${projectKey}`,
    `Đồng bộ lúc: ${new Date().toISOString()} · Jira Host: ${host}`,
    ``,
    `| TC ID | Tiêu đề | Jira Key | Liên kết | Trạng thái đẩy | Kết quả chạy |`,
    `|---|---|---|---|---|---|`,
    ...results.map(
      (r) => `| \`${r.id}\` | ${r.title} | ${r.key} | [Xem](${r.url}) | ${r.status} | — |`
    ),
    ``,
    `*Tổng*: ${results.length} · *Thành công*: ${ok}`,
  ];

  const p = path.join(taskDir(slug), 'jira_testcase_mapping.md');
  fs.writeFileSync(p, lines.join('\n'), 'utf-8');
  console.log(`\nMapping table saved: ${path.relative(PATHS.ROOT, p)}`);
}

// ───────────────────────────── SYNC ─────────────────────────────

/**
 * Reads execution results from the `run_result.md` table.
 * Columns: # | TC ID | Title | Status | Actual Result | Evidence | Defect ID
 */
function parseRunResult(content) {
  const rows = [];
  for (const line of content.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;

    const tcId = cells[1].replace(/`/g, '').trim();
    if (!/^[A-Z][A-Z0-9_]*-\d+$/i.test(tcId)) continue; // skip header and separator rows

    const status = cells[3].replace(/\*/g, '').trim().toUpperCase();
    const evidence = (cells[5].match(/\(([^)]+)\)/) || [])[1] || '';

    rows.push({ tcId, title: cells[2], status, actual: cells[4], evidence });
  }
  return rows;
}

/** Reads the TC ID to Jira key mapping produced by `push`. */
function parseMapping(content) {
  const map = new Map();
  for (const line of content.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 3) continue;
    const tcId = cells[0].replace(/`/g, '').trim();
    const key = (cells[2].match(/([A-Z][A-Z0-9]*-\d+)/) || [])[1];
    if (tcId && key) map.set(tcId, key);
  }
  return map;
}

/** Looks up a transition by name instead of guessing a numeric id. */
async function findTransition(cfg, issueKey, wanted) {
  const res = await jiraRequest(cfg, 'GET', `/rest/api/3/issue/${issueKey}/transitions`);
  if (res.statusCode !== 200) return null;
  const names = wanted.map((w) => w.toLowerCase());
  const hit = (res.data.transitions || []).find((t) => names.includes(t.name.toLowerCase()));
  return hit ? hit.id : null;
}

async function syncRunResults(slug, runId, cfg) {
  if (!cfg.ok) {
    throw new Error(`sync requires Jira credentials. Missing in .env: ${cfg.missing.join(', ')}`);
  }

  const dir = taskDir(slug);
  const runDir = path.join(dir, 'runs', runId);
  const resultPath = path.join(runDir, 'run_result.md');
  const mappingPath = path.join(dir, 'jira_testcase_mapping.md');

  for (const [p, hint] of [
    [resultPath, 'run the tests and record results first'],
    [mappingPath, 'run `jira:push` first to create the mapping table'],
  ]) {
    if (!fs.existsSync(p)) {
      throw new Error(`No ${path.relative(PATHS.ROOT, p)} — ${hint}.`);
    }
  }

  const rows = parseRunResult(fs.readFileSync(resultPath, 'utf-8'));
  const mapping = parseMapping(fs.readFileSync(mappingPath, 'utf-8'));

  const onlyTc = process.argv[5];
  const targets = onlyTc ? rows.filter((r) => r.tcId === onlyTc) : rows;

  if (targets.length === 0) {
    console.log(`No result rows to sync in ${path.relative(PATHS.ROOT, resultPath)}`);
    return;
  }

  console.log(`\n[JIRA SYNC] Pushing ${targets.length} result(s) to ${cfg.host}...`);
  const synced = [];

  for (const row of targets) {
    const key = mapping.get(row.tcId);
    if (!key) {
      console.warn(`   [${row.tcId}] has no Jira key in the mapping table — skipped.`);
      continue;
    }

    console.log(`\n📌 [${row.tcId}] → ${key} · ${row.status}`);

    // Evidence screenshot
    if (row.evidence) {
      const evPath = path.resolve(runDir, row.evidence);
      if (fs.existsSync(evPath)) {
        const r = await jiraAttach(cfg, key, path.basename(evPath), fs.readFileSync(evPath));
        console.log(`   attached ${path.basename(evPath)} (HTTP ${r.statusCode})`);
      } else {
        console.warn(`   evidence file not found: ${row.evidence}`);
      }
    }

    // Result comment
    const comment = [
      `h3. Kết quả chạy tự động: ${row.status}`,
      `* *Run session*: ${runId}`,
      `* *Thời điểm*: ${new Date().toISOString()}`,
      `* *Thực tế*: ${row.actual}`,
      row.evidence ? `* *Bằng chứng*: [^${path.basename(row.evidence)}]` : '',
      `----`,
      `_Ghi tự động bởi QA Leader Agent_`,
    ].filter(Boolean).join('\n');

    const cr = await jiraRequest(cfg, 'POST', `/rest/api/2/issue/${key}/comment`, { body: comment });
    console.log(`   comment posted (HTTP ${cr.statusCode})`);

    // Transition only on PASS, and look the id up rather than guessing.
    if (row.status === 'PASS') {
      const tid = await findTransition(cfg, key, ['Done', 'Closed', 'Hoàn thành']);
      if (tid) {
        const tr = await jiraRequest(cfg, 'POST', `/rest/api/3/issue/${key}/transitions`, {
          transition: { id: tid },
        });
        console.log(`   transitioned to Done (HTTP ${tr.statusCode})`);
      } else {
        console.warn(`   no Done/Closed transition available for ${key}`);
      }
    }

    synced.push({ tcId: row.tcId, status: row.status });
    await sleep(200);
  }

  // Update the run-result column in the mapping table.
  let mappingContent = fs.readFileSync(mappingPath, 'utf-8');
  for (const s of synced) {
    const icon = s.status === 'PASS' ? '✅ PASS' : s.status === 'FAIL' ? '❌ FAIL' : `⏸ ${s.status}`;
    const re = new RegExp(`(\\|\\s*\`${s.tcId}\`\\s*(?:\\|[^|\\n]*){4}\\|\\s*)[^|\\n]*(\\s*\\|)`);
    mappingContent = mappingContent.replace(re, `$1${icon}$2`);
  }
  fs.writeFileSync(mappingPath, mappingContent, 'utf-8');
  console.log(`\nUpdated ${path.relative(PATHS.ROOT, mappingPath)} (${synced.length} row(s)).`);
}

// ───────────────────────────── CLI ─────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveSlug(arg) {
  if (arg) return arg;
  const slugs = listTaskSlugs();
  if (slugs.length === 1) return slugs[0];
  if (slugs.length > 1) {
    throw new Error(`OUTPUT/ holds ${slugs.length} tasks (${slugs.join(', ')}) — name one explicitly.`);
  }
  throw new Error('OUTPUT/ has no tasks yet.');
}

function usage() {
  console.log(`
Usage:
  jira-client.js pull [slug]             Pull bugs/defects from Jira
  jira-client.js push [slug]             Push test cases (API when .env is set, CSV otherwise)
  jira-client.js sync [slug] [run-id]    Push run results and evidence screenshots
  jira-client.js mcp                     Start the stdio MCP server for AI IDEs
`);
}

async function main() {
  const action = process.argv[2];

  if (!action || action === 'help' || action === '--help') return usage();

  if (action === 'mcp') {
    console.log('\nStarting the Jira MCP server (stdio)...');
    console.log('Config: .agents/mcp_config.json · .cursor/mcp.json');
    require('./mcp-server');
    return;
  }

  const cfg = jiraConfig(loadEnv());

  if (action === 'pull') return pullDefects(resolveSlug(process.argv[3]), cfg);
  if (action === 'push') return pushTestCases(resolveSlug(process.argv[3]), cfg);
  if (action === 'sync') {
    const slug = resolveSlug(process.argv[3]);
    const runId = process.argv[4];
    if (!runId) throw new Error('sync needs a run-id, e.g. sync <slug> RUN-01_smoke');
    return syncRunResults(slug, runId, cfg);
  }

  console.error(`Unknown command: ${action}`);
  usage();
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err.message);
  process.exitCode = 1;
});
