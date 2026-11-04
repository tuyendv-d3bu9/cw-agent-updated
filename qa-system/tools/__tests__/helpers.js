/**
 * helpers.js — Scaffolding for tests.
 *
 *   useTempProject()  Create a throwaway project tree and point PATHS at it.
 *   write(rel, text)  Write a file inside that tree.
 *   testCase(id, over) Build a well-formed test case, with per-field overrides.
 *   spec(cases, meta)  Wrap test cases in a spec file.
 *
 * Tools resolve paths through `lib/paths.js`, which is anchored to the repo root.
 * Redirecting PATHS keeps tests away from real OUTPUT/ and knowledge/ data.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { PATHS } = require('../lib/paths');

/** Original values, restored after each case. */
const ORIGINAL = { ...PATHS };

/** Returns a cleanup function every case must call, including on failure. */
function useTempProject() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-agent-test-'));

  Object.assign(PATHS, {
    ROOT: root,
    INPUT: path.join(root, 'INPUT'),
    OUTPUT: path.join(root, 'OUTPUT'),
    KNOWLEDGE: path.join(root, 'knowledge'),
    FEATURES: path.join(root, 'knowledge', 'features'),
    SYSTEM: path.join(root, 'qa-system'),
    AGENTS: path.join(root, 'qa-system'),
    TOOLS: path.join(root, 'qa-system', 'tools'),
    TEMPLATES: path.join(root, 'qa-system', 'templates'),
    AUTOMATION: path.join(root, 'automation'),
    SYSTEM_MAP: path.join(root, 'knowledge', '_system_map.json'),
    ENV_FILE: path.join(root, '.env'),
  });

  for (const d of [PATHS.INPUT, PATHS.OUTPUT, PATHS.FEATURES]) {
    fs.mkdirSync(d, { recursive: true });
  }

  return {
    root,
    cleanup() {
      Object.assign(PATHS, ORIGINAL);
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

/** Writes a file in the temp project, creating parent directories. */
function write(relPath, content) {
  const full = path.join(PATHS.ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf-8');
  return full;
}

/** Builds a standards-compliant test case; any field can be overridden. */
function testCase(id, over = {}) {
  const f = {
    Title: `Verify ${id} behaves correctly`,
    Precondition: '\n  - User is logged in',
    'Test Steps': '\n  1. Click the button',
    'Test Data': '\n  - Code: `ABC`',
    'Expected Result': '\n  - Success message is shown',
    Priority: 'High',
    Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual',
    ...over,
  };
  const body = Object.entries(f)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `- **${k}**:${String(v).startsWith('\n') ? '' : ' '}${v}`)
    .join('\n');
  return `### TC_ID: ${id}\n${body}\n`;
}

/** A complete spec file: meta line plus test cases. */
function spec(cases, meta = 'Owner: qa-test-design · Nguồn: 04 · Verdict: PASS') {
  return `# Test Case Spec\n${meta}\n\n${cases.join('\n')}`;
}

/** Title + meta line exactly as QA_STANDARD §7 pins it. */
function head(title, verdict = 'PASS') {
  return `# ${title} · t\nOwner: test · Nguồn: test · Verdict: ${verdict}\n`;
}

const Q_HEAD = '| ID | Kẽ hở | Nhóm 06W | Nguồn phát hiện | Phương án gợi ý (chưa phải rule) | Câu hỏi cho BA/PO | Phản hồi chính thức | Người trả lời | Ngày | Trạng thái |\n|---|---|---|---|---|---|---|---|---|---|';

/** One §9.4 row. q = {id, question, answer, by, date, status}. */
function qRow(q) {
  return `| ${q.id} | Kẽ hở ${q.id} | W1 | BR-01 × W1 | Gợi ý | ${q.question || `Câu hỏi ${q.id}?`} | ${q.answer || ''} | ${q.by || ''} | ${q.date || ''} | ${q.status || 'New'} |`;
}

/** Knowledge file with the new template's §7/§8 tables (§8 LAST-but-two as in the template). */
function knowledgeDoc({ q7 = [], d8 = [], br = [] } = {}) {
  return `# T — Feature Knowledge

## 3. QUY TẮC NGHIỆP VỤ ĐÃ XÁC NHẬN

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |
|---|---|---|---|---|---|
${br.map((b) => `| ${b} | đk | kq | knowledge §8 #1 |  | Confirmed |`).join('\n')}

## 7. CÂU HỎI MỞ & KẼ HỞ 06W

${Q_HEAD}
${q7.map(qRow).join('\n')}

## 8. QUYẾT ĐỊNH ĐÃ CHỐT

| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |
|---|---|---|---|---|---|
${d8.map((d, i) => `| ${i + 1} | ${d.id} | ${d.question || ''} | ${d.decision || 'Quyết định'} | ${d.by || ''} | ${d.date || ''} |`).join('\n')}

## 9. HẰNG SỐ NGHIỆP VỤ

| Hằng số | Kiểu dữ liệu | Giá trị | Phạm vi ảnh hưởng | Nguồn (file §mục) |
|---|---|---|---|---|
`;
}

/** 02 report: matrix rows for `objects`, §3 question rows, verdict. */
function report02({ verdict = 'PASS', objects = ['BR-01', 'BR-02'], cells = {}, questions = [], oq = [] } = {}) {
  const row = (o) => `| ${o} | ${[1, 2, 3, 4, 5, 6].map((w) => cells[`${o}:W${w}`] || 'Không áp dụng').join(' | ')} |`;
  return `${head('Missing Rule Report', verdict)}
## 1. MA TRẬN 06W

| Đối tượng | W1 | W2 | W3 | W4 | W5 | W6 |
|---|---|---|---|---|---|---|
${objects.map(row).join('\n')}

## 2. CHI TIẾT MISSING RULES
${questions.map((q) => `### ${q.id} — kẽ hở`).join('\n')}

## 3. BẢNG CÂU HỎI

${Q_HEAD}
${questions.map(qRow).join('\n')}

## 4. ĐỐI CHIẾU OQ

| OQ | Xử lý |
|---|---|
${oq.map(([o, h]) => `| ${o} | ${h} |`).join('\n')}
`;
}

const SPEC_TEXT = 'Người dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá.\nMã voucher hết hạn thì hiển thị thông báo lỗi.\n';

/** 01 summary whose quotes exist verbatim in INPUT (written by fullTask). */
function summary01({ br = ['BR-01', 'BR-02'], oq = [], quote } = {}) {
  const quotes = ['Người dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá', 'Mã voucher hết hạn thì hiển thị thông báo lỗi'];
  return `${head('Requirement Risk Summary')}
## 3. BUSINESS RULES

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
${br.map((b, i) => `| ${b} | đk | kq | 02_ba/spec.md §1 | ${quote !== undefined && i === 0 ? quote : quotes[i % 2]} |`).join('\n')}

## 7. ĐIỂM CHƯA RÕ

| ID | Điểm chưa rõ | Vị trí trong nguồn |
|---|---|---|
${oq.map((o) => `| ${o} | chưa rõ | spec §1 |`).join('\n')}
`;
}

/**
 * A mature task in the pinned formats: INPUT, 01-06, 12, knowledge. Gate open,
 * lint clean, readiness GO. Tests override single files to break one thing.
 */
function fullTask(slug = 't') {
  write(`INPUT/${slug}/02_ba/spec.md`, `# Spec\n## 1\n${SPEC_TEXT}`);
  write(`OUTPUT/${slug}/01_requirement_risk_summary.md`, summary01());
  write(`OUTPUT/${slug}/02_missing_rule_report.md`, report02());
  write(`OUTPUT/${slug}/03_viewpoint_report.md`, `${head('Viewpoint')}
## 2. VIEWPOINT ĐƯỢC CHỌN

| VP | Tên | Nguồn (BR/FD/AF/MR) | Lý do |
|---|---|---|---|
| VP-01 | Happy Path | BR-01 | luồng chính |
| VP-02 | Negative | BR-02 | lỗi |
`);
  write(`OUTPUT/${slug}/04_test_idea_report.md`, `${head('Test Idea')}
| TI | Test Idea | VP | Nguồn (BR/FD/AF/MR) | Kỹ thuật | Giữ/Bỏ | Lý do filter |
|---|---|---|---|---|---|---|
| TI-01 | hợp lệ | VP-01 | BR-01 | EP | Giữ | chính |
| TI-02 | hết hạn | VP-02 | BR-02 | EP | Giữ | lỗi |
`);
  write(`OUTPUT/${slug}/05_test_case_spec.md`, spec([
    testCase('TST-001', { Tags: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#TST, Manual' }),
    testCase('TST-002', { Tags: 'Rule#BR-02, Viewpoint#VP-02, TI#TI-02, Module#TST, Manual' }),
  ]));
  write(`OUTPUT/${slug}/06_coverage_review.md`, `${head('Coverage Review')}`);
  write(`OUTPUT/${slug}/12_data_validation_traceability.md`, `${head('Data')}Mọi dataset đã map.\n`);
  write(`knowledge/features/${slug}.md`, knowledgeDoc());
}

module.exports = { useTempProject, write, testCase, spec, head, qRow, knowledgeDoc, report02, summary01, fullTask, PATHS };
