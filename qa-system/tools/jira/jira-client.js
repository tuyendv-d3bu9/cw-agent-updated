#!/usr/bin/env node
/**
 * jira-client.js — Cổng giao tiếp DUY NHẤT với Jira.
 *
 * Gộp từ 3 file cũ (jira-client + push-testcases-to-jira + sync-results-to-jira),
 * vì trước đây bản được nối vào `npm run jira:push` lại là bản rỗng, còn bản
 * cài đặt thật thì không ai gọi tới.
 *
 * Lệnh:
 *   node agents/tools/jira/jira-client.js pull [slug]            Kéo bug/defect về
 *   node agents/tools/jira/jira-client.js push [slug]            Đẩy test case lên (CSV hoặc API)
 *   node agents/tools/jira/jira-client.js sync [slug] [run-id]   Đẩy kết quả chạy + ảnh bằng chứng
 *   node agents/tools/jira/jira-client.js mcp                    Khởi động MCP server cho AI IDE
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

  console.log(`\n🔍 [JIRA PULL] Đang lấy Bug/Defect của project [${projectKey}]...`);

  if (!cfg.ok) {
    console.warn(`⚠️  Chưa cấu hình: ${cfg.missing.join(', ')} trong .env`);
    console.log(`ℹ️  Sinh bảng mẫu để vẫn chạy được pipeline phân tích rủi ro.`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, mockDefectReport(projectKey), 'utf-8');
    console.log(`✅ Đã lưu: ${path.relative(PATHS.ROOT, outPath)}`);
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
    throw new Error(`Jira trả về HTTP ${res.statusCode}: ${res.raw}`);
  }

  const issues = res.data.issues || [];
  console.log(`✅ Đã kéo về ${issues.length} defect.`);

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
  console.log(`✅ Đã lưu: ${path.relative(PATHS.ROOT, outPath)}`);
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

/** Bóc 8 trường test case từ `05_test_case_spec.md`. */
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

  console.log(`\n🚀 [JIRA PUSH] Chuẩn bị test case cho task [${slug}]...`);

  // Không có credential → chế độ import file, vẫn dùng được.
  if (!cfg.ok) {
    if (!fs.existsSync(jiraCsv)) {
      console.log(`ℹ️  Chưa có CSV, gọi export-testcases...`);
      require('../testcase/export-testcases');
    }
    console.log(`\n📌 CHẾ ĐỘ IMPORT FILE (thiếu: ${cfg.missing.join(', ')})`);
    console.log(`   - Jira Xray : ${path.relative(PATHS.ROOT, jiraCsv)}`);
    console.log(`   - Redmine   : ${path.relative(PATHS.ROOT, redmineCsv)}`);
    console.log(`\n👉 Jira: Project > Xray Settings > Test Case Importer > chọn export_jira_xray.csv`);
    console.log(`👉 Redmine: Issues > Import > chọn export_redmine.csv`);
    console.log(`\n👉 Muốn đẩy thẳng qua API: điền ${cfg.missing.join(', ')} vào .env`);
    return;
  }

  if (!fs.existsSync(specPath)) {
    throw new Error(`Không tìm thấy ${path.relative(PATHS.ROOT, specPath)} — chạy chặng 5 trước.`);
  }

  const projectKey = cfg.projectKey || 'SG';
  console.log(`📡 Kết nối ${cfg.host} · project [${projectKey}]`);

  // 1. Lấy issue đã có để không tạo trùng.
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
  console.log(`ℹ️  Jira đang có ${existing.size} test case đã ánh xạ.`);

  const cases = parseTestCases(fs.readFileSync(specPath, 'utf-8'));
  console.log(`📋 Spec có ${cases.length} test case.`);

  const results = [];
  for (const tc of cases) {
    if (existing.has(tc.id)) {
      const key = existing.get(tc.id);
      console.log(`⏭️  [${tc.id}] đã tồn tại → ${key}`);
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

    console.log(`🚀 Tạo [${tc.id}] trên Jira...`);
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

    await sleep(200); // tránh bị rate-limit
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
  console.log(`\n🎉 Đã lưu bảng ánh xạ: ${path.relative(PATHS.ROOT, p)}`);
}

// ───────────────────────────── SYNC ─────────────────────────────

/**
 * Bóc kết quả thực thi từ bảng trong `run_result.md`.
 * Cột chuẩn: # | TC ID | Tiêu đề | Trạng thái | Actual Result | Bằng chứng | Defect ID
 */
function parseRunResult(content) {
  const rows = [];
  for (const line of content.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;

    const tcId = cells[1].replace(/`/g, '').trim();
    if (!/^[A-Z][A-Z0-9_]*-\d+$/i.test(tcId)) continue; // bỏ dòng tiêu đề và dòng kẻ

    const status = cells[3].replace(/\*/g, '').trim().toUpperCase();
    const evidence = (cells[5].match(/\(([^)]+)\)/) || [])[1] || '';

    rows.push({ tcId, title: cells[2], status, actual: cells[4], evidence });
  }
  return rows;
}

/** Đọc bảng ánh xạ TC ID → Jira Key do lệnh `push` sinh ra. */
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

/** Tìm transition hợp lệ theo tên, thay vì đoán ID cứng. */
async function findTransition(cfg, issueKey, wanted) {
  const res = await jiraRequest(cfg, 'GET', `/rest/api/3/issue/${issueKey}/transitions`);
  if (res.statusCode !== 200) return null;
  const names = wanted.map((w) => w.toLowerCase());
  const hit = (res.data.transitions || []).find((t) => names.includes(t.name.toLowerCase()));
  return hit ? hit.id : null;
}

async function syncRunResults(slug, runId, cfg) {
  if (!cfg.ok) {
    throw new Error(`Lệnh sync bắt buộc có kết nối Jira. Thiếu: ${cfg.missing.join(', ')} trong .env`);
  }

  const dir = taskDir(slug);
  const runDir = path.join(dir, 'runs', runId);
  const resultPath = path.join(runDir, 'run_result.md');
  const mappingPath = path.join(dir, 'jira_testcase_mapping.md');

  for (const [p, hint] of [
    [resultPath, 'chạy test và ghi kết quả trước'],
    [mappingPath, 'chạy `jira:push` trước để tạo bảng ánh xạ'],
  ]) {
    if (!fs.existsSync(p)) {
      throw new Error(`Không tìm thấy ${path.relative(PATHS.ROOT, p)} — ${hint}.`);
    }
  }

  const rows = parseRunResult(fs.readFileSync(resultPath, 'utf-8'));
  const mapping = parseMapping(fs.readFileSync(mappingPath, 'utf-8'));

  const onlyTc = process.argv[5];
  const targets = onlyTc ? rows.filter((r) => r.tcId === onlyTc) : rows;

  if (targets.length === 0) {
    console.log(`⚠️  Không có dòng kết quả nào để đồng bộ trong ${path.relative(PATHS.ROOT, resultPath)}`);
    return;
  }

  console.log(`\n🚀 [JIRA SYNC] Đẩy ${targets.length} kết quả lên ${cfg.host}...`);
  const synced = [];

  for (const row of targets) {
    const key = mapping.get(row.tcId);
    if (!key) {
      console.warn(`   ⚠️  [${row.tcId}] chưa có Jira key trong bảng ánh xạ — bỏ qua.`);
      continue;
    }

    console.log(`\n📌 [${row.tcId}] → ${key} · ${row.status}`);

    // 1. Ảnh bằng chứng
    if (row.evidence) {
      const evPath = path.resolve(runDir, row.evidence);
      if (fs.existsSync(evPath)) {
        const r = await jiraAttach(cfg, key, path.basename(evPath), fs.readFileSync(evPath));
        console.log(`   📸 Đính kèm ${path.basename(evPath)} (HTTP ${r.statusCode})`);
      } else {
        console.warn(`   ⚠️  Không thấy file bằng chứng: ${row.evidence}`);
      }
    }

    // 2. Bình luận kết quả
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
    console.log(`   💬 Bình luận (HTTP ${cr.statusCode})`);

    // 3. Chuyển trạng thái — chỉ khi PASS, và tra đúng ID thay vì đoán.
    if (row.status === 'PASS') {
      const tid = await findTransition(cfg, key, ['Done', 'Closed', 'Hoàn thành']);
      if (tid) {
        const tr = await jiraRequest(cfg, 'POST', `/rest/api/3/issue/${key}/transitions`, {
          transition: { id: tid },
        });
        console.log(`   🔄 Chuyển sang Done (HTTP ${tr.statusCode})`);
      } else {
        console.warn(`   ⚠️  Không tìm thấy transition Done/Closed cho ${key}`);
      }
    }

    synced.push({ tcId: row.tcId, status: row.status });
    await sleep(200);
  }

  // 4. Cập nhật cột "Kết quả chạy" trong bảng ánh xạ.
  let mappingContent = fs.readFileSync(mappingPath, 'utf-8');
  for (const s of synced) {
    const icon = s.status === 'PASS' ? '✅ PASS' : s.status === 'FAIL' ? '❌ FAIL' : `⏸ ${s.status}`;
    const re = new RegExp(`(\\|\\s*\`${s.tcId}\`\\s*(?:\\|[^|\\n]*){4}\\|\\s*)[^|\\n]*(\\s*\\|)`);
    mappingContent = mappingContent.replace(re, `$1${icon}$2`);
  }
  fs.writeFileSync(mappingPath, mappingContent, 'utf-8');
  console.log(`\n🎉 Đã cập nhật ${path.relative(PATHS.ROOT, mappingPath)} (${synced.length} dòng).`);
}

// ───────────────────────────── CLI ─────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function resolveSlug(arg) {
  if (arg) return arg;
  const slugs = listTaskSlugs();
  if (slugs.length === 1) return slugs[0];
  if (slugs.length > 1) {
    throw new Error(`OUTPUT/ có ${slugs.length} task (${slugs.join(', ')}) — nêu rõ task-slug.`);
  }
  throw new Error('OUTPUT/ chưa có task nào.');
}

function usage() {
  console.log(`
Cách dùng:
  jira-client.js pull [slug]             Kéo bug/defect từ Jira về
  jira-client.js push [slug]             Đẩy test case lên (API nếu có .env, không thì xuất CSV)
  jira-client.js sync [slug] [run-id]    Đẩy kết quả chạy + ảnh bằng chứng lên Jira
  jira-client.js mcp                     Khởi động MCP server (stdio) cho AI IDE
`);
}

async function main() {
  const action = process.argv[2];

  if (!action || action === 'help' || action === '--help') return usage();

  if (action === 'mcp') {
    console.log(`\n🔌 Khởi động Jira MCP Server (stdio)...`);
    console.log(`ℹ️  Cấu hình: .agents/mcp_config.json · .cursor/mcp.json`);
    require('./mcp-server');
    return;
  }

  const cfg = jiraConfig(loadEnv());

  if (action === 'pull') return pullDefects(resolveSlug(process.argv[3]), cfg);
  if (action === 'push') return pushTestCases(resolveSlug(process.argv[3]), cfg);
  if (action === 'sync') {
    const slug = resolveSlug(process.argv[3]);
    const runId = process.argv[4];
    if (!runId) throw new Error('Lệnh sync cần run-id, ví dụ: sync <slug> RUN-01_smoke');
    return syncRunResults(slug, runId, cfg);
  }

  console.error(`❌ Lệnh không hợp lệ: ${action}`);
  usage();
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exitCode = 1;
});
