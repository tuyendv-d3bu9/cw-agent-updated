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
const {
  API,
  jiraRequest,
  jiraAttach,
  adf,
  adfToText,
  describeError,
  rejectedFields,
  createMeta,
  pickIssueType,
} = require('../lib/jira-api');

/** `--dry-run` anywhere on the command line: print what would be sent, write nothing. */
const DRY_RUN = process.argv.includes('--dry-run');

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
    `${API}/search/jql?jql=${jql}&maxResults=50&fields=key,summary,status,priority,components`
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

  // Ask Jira what this project accepts instead of assuming. Issue type 'Task'
  // does not exist everywhere, and `priority` is missing from many create screens;
  // both used to surface as an opaque 400 and send us back into the code.
  const meta = await createMeta(cfg, projectKey);
  if (!meta.ok) {
    throw new Error(
      `Cannot read the create screen of project ${projectKey}: ${meta.error}\n` +
        `Check JIRA_PROJECT_KEY, or that this account can create issues there.`
    );
  }

  const issueType = pickIssueType(meta.issueTypes, cfg.issueType);
  if (!issueType) {
    throw new Error(`Project ${projectKey} exposes no issue type this account may create.`);
  }
  if (issueType.name.toLowerCase() !== String(cfg.issueType).toLowerCase()) {
    console.warn(
      `JIRA_TEST_ISSUE_TYPE="${cfg.issueType}" not offered by ${projectKey} — ` +
        `falling back to "${issueType.name}". Available: ${meta.issueTypes.map((t) => t.name).join(', ')}`
    );
  }

  const canSetPriority = cfg.sendPriority !== 'off' && issueType.fields.includes('priority');
  console.log(
    `Issue type [${issueType.name}] · priority ${canSetPriority ? 'enabled' : 'skipped (not on the create screen)'}`
  );

  // Fetch existing issues so we do not create duplicates.
  const jql = encodeURIComponent(`project = "${projectKey}" ORDER BY created ASC`);
  const existingRes = await jiraRequest(
    cfg,
    'GET',
    `${API}/search/jql?jql=${jql}&maxResults=1000&fields=key,summary`
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

    const fields = {
      project: { key: projectKey },
      summary: `[${tc.id}] ${tc.title}`,
      description: adf(desc), // v3 takes ADF, not wiki markup
      issuetype: { id: issueType.id },
      labels,
    };
    if (canSetPriority) fields.priority = { name: mapPriority(tc.priority) };

    if (DRY_RUN) {
      console.log(`   [dry-run] would create [${tc.id}] as ${issueType.name}`);
      results.push({ ...tc, key: 'DRY-RUN', url: '', status: 'Thử khan' });
      continue;
    }

    console.log(`Creating [${tc.id}] in Jira...`);
    let res = await jiraRequest(cfg, 'POST', `${API}/issue`, { fields });

    // A 400 naming specific fields is a configuration mismatch, not a bug in us.
    // Drop exactly what Jira refused and try once more, so one odd project
    // setting does not mean editing this file again.
    if (res.statusCode === 400) {
      const bad = rejectedFields(res).filter((f) => !['project', 'summary', 'issuetype'].includes(f));
      if (bad.length) {
        console.warn(`   ${projectKey} rejected: ${bad.join(', ')} — retrying without them`);
        const retry = { ...fields };
        for (const f of bad) delete retry[f];
        res = await jiraRequest(cfg, 'POST', `${API}/issue`, { fields: retry });
      }
    }

    if (res.statusCode === 201 && res.data?.key) {
      console.log(`   ✅ ${res.data.key}`);
      results.push({ ...tc, key: res.data.key, url: `${cfg.host}/browse/${res.data.key}`, status: 'Tạo mới' });
    } else {
      console.error(`   ❌ Lỗi ${tc.id}: ${describeError(res)}`);
      results.push({ ...tc, key: 'ERROR', url: '', status: `Lỗi ${res.statusCode}` });
    }

    await sleep(200); // stay under Jira rate limits
  }

  if (DRY_RUN) {
    console.log('\n[dry-run] bảng ánh xạ KHÔNG được ghi — chạy lại không kèm --dry-run để ghi thật.');
    return;
  }
  writeMapping(slug, projectKey, cfg.host, results);
}

function writeMapping(slug, projectKey, host, results) {
  const ok = results.filter((r) => r.key !== 'ERROR').length;
  const lines = [
    `# BẢNG ÁNH XẠ TEST CASE ↔ JIRA · ${projectKey}`,
    // No timestamp here on purpose: stamping every run made the file show up as
    // changed in git even when not one row differed.
    `Jira Host: ${host}`,
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
/**
 * Đọc bảng kết quả trong run_result.md THEO TÊN CỘT, không theo vị trí cột.
 *
 * Bản cũ đếm cột cứng (cells[1] là TC ID, cells[3] là trạng thái...) theo đúng khuôn
 * `templates/run/run_result.md`. Nhưng file thật mà agent sinh ra có bảy cột và thứ tự
 * khác hẳn — thêm cột "Jira Key" và "Dữ liệu Kiểm Thử". Hậu quả: parser không khớp được
 * dòng nào, `jira:sync` báo "No result rows to sync" rồi thoát êm, không ai biết là hỏng.
 * Dò theo tên cột thì cả hai khuôn đều đọc được, và khuôn mới mai này cũng vậy.
 */
const COLUMN_ALIASES = {
  tcId: [/^tc[\s_-]*id$/i, /^test\s*case\s*id$/i, /^m[aã]\s*ca/i],
  title: [/ti[eê]u\s*[dđ][eề]/i, /^title$/i],
  status: [/tr[aạ]ng\s*th[aá]i/i, /^status$/i, /k[eế]t\s*qu[aả]$/i],
  actual: [/th[uự]c\s*t[eế]/i, /^actual/i],
  evidence: [/b[aằ]ng\s*ch[uứ]ng/i, /^evidence/i],
};

function mapHeader(cells) {
  const idx = {};
  cells.forEach((raw, i) => {
    const name = raw.replace(/[*`]/g, '').trim();
    for (const [key, patterns] of Object.entries(COLUMN_ALIASES)) {
      if (idx[key] === undefined && patterns.some((re) => re.test(name))) idx[key] = i;
    }
  });
  return idx;
}

function splitRow(line) {
  return line.split('|').slice(1, -1).map((c) => c.trim());
}

function parseRunResult(content) {
  const rows = [];
  let idx = null;

  for (const line of content.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = splitRow(line);
    if (cells.length < 3) continue;

    // Dòng kẻ ngăn cách (|---|:--:|) đóng luôn bảng trước đó.
    if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue;

    const looksLikeHeader = mapHeader(cells);
    if (looksLikeHeader.tcId !== undefined && looksLikeHeader.status !== undefined) {
      idx = looksLikeHeader;
      continue;
    }
    if (!idx) continue;

    const tcId = (cells[idx.tcId] || '').replace(/`/g, '').trim();
    if (!/^[A-Z][A-Z0-9_]*-\d+$/i.test(tcId)) continue;

    const cell = (k) => (idx[k] !== undefined ? cells[idx[k]] || '' : '');
    // Ô bằng chứng có thể là [tên](đường dẫn), hoặc chỉ mỗi tên file.
    const ev = cell('evidence');
    const evidence = (ev.match(/\(([^)]+)\)/) || [])[1] || ev.replace(/[[\]]/g, '').trim();

    rows.push({
      tcId,
      title: cell('title'),
      status: cell('status').replace(/\*/g, '').trim().toUpperCase(),
      actual: cell('actual'),
      evidence,
    });
  }
  return rows;
}

/**
 * Tìm file bằng chứng thật trên đĩa.
 *
 * run_result.md hiện đang chứa đường dẫn tuyệt đối kiểu
 * `file:///c:/Users/.../cw-agent-antigravity/OUTPUT/...` — máy khác, thư mục khác, repo
 * khác. Bám theo đó thì không bao giờ tìm ra file. Nên chỉ lấy TÊN FILE rồi dò trong
 * thư mục evidence của chính lượt chạy đó.
 */
function resolveEvidence(runDir, ref) {
  if (!ref) return null;
  const direct = path.resolve(runDir, ref);
  if (!/^(file:|https?:|[a-zA-Z]:)/.test(ref) && fs.existsSync(direct)) return direct;

  const name = path.basename(decodeURIComponent(ref.replace(/^file:\/+/, '')));
  const evDir = path.join(runDir, 'evidence');
  if (!fs.existsSync(evDir)) return null;

  const stack = [evDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name === name) return full;
    }
  }
  return null;
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
  const res = await jiraRequest(cfg, 'GET', `${API}/issue/${issueKey}/transitions`);
  if (res.statusCode !== 200) return null;
  const names = wanted.map((w) => w.toLowerCase());
  const hit = (res.data.transitions || []).find((t) => names.includes(t.name.toLowerCase()));
  return hit ? hit.id : null;
}

/**
 * The line every sync comment carries. Reading it back is what makes a second
 * sync of the same run a no-op instead of another round of noise.
 * The verdict is part of it on purpose: PASS -> FAIL must still be reported.
 */
function syncMarker(runId, status) {
  return `[qa-agent-sync] ${runId} · ${status}`;
}

/** Comment markers, attachment names and current status of an issue, in one look. */
async function issueSyncState(cfg, key) {
  const empty = { markers: [], attachments: [], status: '', isDone: false };

  const res = await jiraRequest(
    cfg,
    'GET',
    `${API}/issue/${key}?fields=attachment,status,comment`
  );
  if (res.statusCode !== 200) {
    console.warn(`   could not read ${key} (${describeError(res)}) — syncing as if new`);
    return empty;
  }

  const f = res.data?.fields || {};
  const markers = [];
  for (const c of f.comment?.comments || []) {
    const text = typeof c.body === 'string' ? c.body : adfToText(c.body);
    for (const line of text.split('\n')) {
      if (line.includes('[qa-agent-sync]')) markers.push(line.trim());
    }
  }

  const status = f.status?.name || '';
  return {
    markers,
    attachments: (f.attachment || []).map((a) => a.filename),
    status,
    isDone: f.status?.statusCategory?.key === 'done',
  };
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

  // Đối số thứ 5 là MỘT test case cần sync riêng, ví dụ `sync <slug> <run> VCHR-003`.
  // Cờ đứng ở đúng vị trí đó (`--dry-run`) từng bị hiểu là tên test case, lọc sạch
  // mọi dòng rồi báo "No result rows to sync" — im lặng và sai.
  const argAt5 = process.argv[5];
  const onlyTc = argAt5 && !argAt5.startsWith('--') ? argAt5 : null;
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

    // What the issue already carries. Syncing the same run twice used to pile on
    // a fresh comment and a duplicate attachment every time, which is why all 36
    // issues looked freshly "updated" after every run.
    const state = await issueSyncState(cfg, key);
    const marker = syncMarker(runId, row.status);

    if (state.markers.includes(marker)) {
      console.log(`   already synced for ${runId} with the same verdict — nothing to do`);
      synced.push({ tcId: row.tcId, status: row.status });
      continue;
    }

    // Evidence screenshot
    const evPath = resolveEvidence(runDir, row.evidence);
    const evName = evPath ? path.basename(evPath) : null;
    if (row.evidence) {
      if (!evPath) {
        console.warn(`   không tìm thấy bằng chứng "${path.basename(row.evidence)}" trong ${path.relative(PATHS.ROOT, path.join(runDir, 'evidence'))}`);
      } else if (state.attachments.includes(evName)) {
        console.log(`   ${evName} already attached — skipped`);
      } else if (DRY_RUN) {
        console.log(`   [dry-run] would attach ${evName}`);
      } else {
        const r = await jiraAttach(cfg, key, evName, fs.readFileSync(evPath));
        console.log(`   attached ${evName} (HTTP ${r.statusCode})`);
      }
    }

    // Result comment. The marker line is what the next run reads to stay quiet.
    const comment = [
      `Kết quả chạy tự động: ${row.status}`,
      `Run session: ${runId}`,
      `Thời điểm: ${new Date().toISOString()}`,
      `Thực tế: ${row.actual}`,
      evName ? `Bằng chứng: ${evName}` : '',
      marker,
      `Ghi tự động bởi QA Agent`,
    ].filter(Boolean).join('\n');

    if (DRY_RUN) {
      console.log(`   [dry-run] would comment and ${row.status === 'PASS' ? 'transition' : 'leave status'}`);
    } else {
      const cr = await jiraRequest(cfg, 'POST', `${API}/issue/${key}/comment`, { body: adf(comment) });
      console.log(
        cr.statusCode === 201 ? '   comment posted' : `   comment FAILED — ${describeError(cr)}`
      );

      // Transition only on PASS, only when it is not already there.
      if (row.status === 'PASS') {
        if (state.isDone) {
          console.log(`   already in "${state.status}" — no transition`);
        } else {
          const tid = await findTransition(cfg, key, cfg.doneTransitions);
          if (tid) {
            const tr = await jiraRequest(cfg, 'POST', `${API}/issue/${key}/transitions`, {
              transition: { id: tid },
            });
            console.log(`   transitioned to Done (HTTP ${tr.statusCode})`);
          } else {
            console.warn(
              `   no transition matching JIRA_DONE_TRANSITIONS (${cfg.doneTransitions.join(', ')}) for ${key}`
            );
          }
        }
      }
    }

    synced.push({ tcId: row.tcId, status: row.status });
    await sleep(200);
  }

  if (DRY_RUN) {
    console.log(`\n[dry-run] ${path.relative(PATHS.ROOT, mappingPath)} KHÔNG được ghi — bỏ --dry-run để ghi thật.`);
    return;
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

/**
 * Answers "will a push work here, and with what?" before anything is written.
 * Run this when a Jira starts refusing calls: it names the mismatch instead of
 * leaving a 400 to be guessed at halfway through a loop of 36 issues.
 */
async function preflight(cfg) {
  console.log('\n[JIRA CHECK] Reading what this Jira accepts...\n');

  if (!cfg.ok) {
    console.log(`  credentials   ❌ missing in .env: ${cfg.missing.join(', ')}`);
    console.log('\n  Without credentials push still works in CSV mode (export_jira_xray.csv).');
    process.exitCode = 1;
    return;
  }
  console.log(`  host          ${cfg.host}`);

  const me = await jiraRequest(cfg, 'GET', `${API}/myself`);
  if (me.statusCode !== 200) {
    console.log(`  credentials   ❌ ${describeError(me)}`);
    console.log('\n  A 401 here means the API token is wrong or revoked:');
    console.log('  https://id.atlassian.com/manage-profile/security/api-tokens');
    process.exitCode = 1;
    return;
  }
  console.log(`  credentials   ✅ ${me.data.displayName} <${me.data.emailAddress || cfg.email}>`);

  const projectKey = cfg.projectKey;
  if (!projectKey) {
    console.log('  project       ❌ JIRA_PROJECT_KEY is not set in .env');
    process.exitCode = 1;
    return;
  }

  const meta = await createMeta(cfg, projectKey);
  if (!meta.ok) {
    console.log(`  project       ❌ [${projectKey}] ${meta.error}`);
    process.exitCode = 1;
    return;
  }

  const issueType = pickIssueType(meta.issueTypes, cfg.issueType);
  const matched = issueType && issueType.name.toLowerCase() === String(cfg.issueType).toLowerCase();
  console.log(`  project       ✅ [${projectKey}]`);
  console.log(`  issue types   ${meta.issueTypes.map((t) => t.name).join(', ') || '(none)'}`);
  console.log(
    `  will create   ${matched ? '✅' : '⚠️ '} ${issueType ? issueType.name : '(nothing available)'}` +
      (matched ? '' : `  — JIRA_TEST_ISSUE_TYPE="${cfg.issueType}" not offered here`)
  );

  if (issueType) {
    const hasPriority = issueType.fields.includes('priority');
    const willSend = cfg.sendPriority !== 'off' && hasPriority;
    console.log(
      `  priority      ${willSend ? '✅ sent' : '⏭  skipped'}` +
        (hasPriority ? '' : ' — not on this create screen') +
        (cfg.sendPriority === 'off' ? ' — JIRA_SEND_PRIORITY=off' : '')
    );
    const unknown = issueType.required.filter(
      (f) => !['project', 'summary', 'issuetype', 'description', 'reporter'].includes(f)
    );
    if (unknown.length) {
      console.log(`  required      ⚠️  this project also demands: ${unknown.join(', ')}`);
      console.log('                push will drop what Jira refuses and retry, but these may need a real value');
    }
  }

  console.log(`  done states   ${cfg.doneTransitions.join(', ')}  (JIRA_DONE_TRANSITIONS)`);
  console.log('\n  Nothing was written. Add --dry-run to push/sync to rehearse those too.\n');
}

function usage() {
  console.log(`
Usage:
  jira-client.js check                   Report what this Jira accepts — writes nothing
  jira-client.js pull [slug]             Pull bugs/defects from Jira
  jira-client.js push [slug]             Push test cases (API when .env is set, CSV otherwise)
  jira-client.js sync [slug] [run-id]    Push run results and evidence screenshots
  jira-client.js mcp                     Start the stdio MCP server for AI IDEs

  --dry-run    on push/sync: print what would be sent, change nothing
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

  if (action === 'check') return preflight(cfg);
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

// Chỉ chạy khi gọi trực tiếp, để test nạp được các hàm thuần bên dưới.
if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}

module.exports = { parseRunResult, parseMapping, parseTestCases, resolveEvidence, mapHeader };
