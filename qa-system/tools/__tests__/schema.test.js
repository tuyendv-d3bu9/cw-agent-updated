/**
 * Tests for lib/schema.js — the one parser every tool shares.
 */

const test = require('node:test');
const assert = require('node:assert');
const S = require('../lib/schema');

test('meta line: only `Owner: … Verdict: X` in the first 10 lines', () => {
  assert.strictEqual(S.readVerdict('# T\nOwner: a · Nguồn: b · Verdict: ASK\n'), 'ASK');
  assert.strictEqual(S.readVerdict('# T\n**Verdict:** ASK'), null);
  assert.strictEqual(S.readVerdict('# T\nOwner: a · Verdict: `PASS`'), null);
  assert.strictEqual(S.readVerdict('# T\nVerdict: PASS'), null);
  assert.strictEqual(S.readVerdict('\n'.repeat(12) + 'Owner: a · Verdict: PASS'), null);
  assert.strictEqual(S.readVerdict('# T\nOwner: a · Verdict: PASSED'), null);
  assert.deepStrictEqual(S.readMeta('# T\nOwner: qa · Nguồn: 01, 02 · Verdict: FIX'), { owner: 'qa', source: '01, 02', verdict: 'FIX', line: 2 });
});

test('worst verdict; unreadable counts as FIX', () => {
  assert.strictEqual(S.worstVerdict(['PASS', 'PASS']), 'PASS');
  assert.strictEqual(S.worstVerdict(['PASS', null]), 'FIX');
  assert.strictEqual(S.worstVerdict(['FIX', 'ASK', 'PASS']), 'ASK');
});

test('IDs: ** and backticks stripped, padded to 2 digits, families respected', () => {
  assert.strictEqual(S.canonicalId('**MR-3**'), 'MR-03');
  assert.strictEqual(S.canonicalId('`BR-12`'), 'BR-12');
  assert.strictEqual(S.canonicalId('MR-01', 'BR'), null);
  assert.deepStrictEqual(S.idsIn('`MR-02`, **BR-1**, AUTH-001, XMR-05'), ['BR-01', 'MR-02']);
});

test('status normaliser (§9.3) incl. Vietnamese synonyms and negations', () => {
  const cases = {
    Confirmed: 'Confirmed', 'Confirmed (BA An)': 'Confirmed', 'Đã xác nhận': 'Confirmed', 'Đã chốt': 'Confirmed', '`Confirmed`': 'Confirmed',
    Rejected: 'Rejected', 'Loại': 'Rejected', 'Không xử lý': 'Rejected',
    TREO: 'TREO', Pending: 'TREO', Treo: 'TREO',
    New: 'New', 'Mới': 'New', 'Chờ trả lời': 'New', 'Chưa xác nhận': 'New', Unconfirmed: 'New', 'Not confirmed': 'New',
    '': null, 'xyz': null,
  };
  for (const [raw, want] of Object.entries(cases)) assert.strictEqual(S.normalizeStatus(raw), want, raw);
});

test('tables are read by header name, with aliases and NFC/markdown-insensitive matching', () => {
  const nfd = 'Phản hồi chính thức'.normalize('NFD');
  const t = S.parseTables(`| **ID** | Trạng thái | ${nfd} |\n|---|---|---|\n| MR-01 | New | x |\n`)[0];
  assert.strictEqual(S.col(t, 'id'), 0);
  assert.strictEqual(S.col(t, 'answer'), 2);
  const legacy = S.parseTables('| ID | Trả lời của BA | Trạng thái |\n|---|---|---|\n')[0];
  assert.strictEqual(S.col(legacy, 'answer'), 1);
});

test('sections match loosely: "## 7 Câu hỏi" == "## 7. CÂU HỎI"; ends at next numbered heading', () => {
  const doc = '# x\n## 7 Câu hỏi\nA\n### ghi chú\nB\n## 8. Quyết định\nC\n';
  assert.strictEqual(S.findSection(doc, '7').body.trim(), 'A\n### ghi chú\nB');
  assert.strictEqual(S.sectionBody(doc, '8').trim(), 'C');
  const k = '## 3. RULES\nR\n### 3b. FIELD\nF\n## 4. X\n';
  assert.strictEqual(S.sectionBody(k, '3').trim(), 'R');
  assert.strictEqual(S.sectionBody(k, '3b').trim(), 'F');
});

test('test cases: TC_ID heading at ## / ### / ####, bare TC id heading, both bold-colon styles', () => {
  const text = [
    '# Spec · sprint-12', 'Owner: x · Verdict: PASS',
    '## TC_ID: AUTH-001', '- **Title**: Verify a', '- **Priority:** High',
    '### AUTH-002 — đăng xuất', '- **Tags**: Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#AUTH',
    '#### TC_ID: AUTH-003', '- **Expected Result**:', '  - Thông báo', '  - **ghi chú**: lồng',
    '### MR-01 — không phải test case',
  ].join('\n');
  const { cases, unparsed } = S.parseTestCases(text);
  assert.deepStrictEqual(cases.map((c) => c.id), ['AUTH-001', 'AUTH-002', 'AUTH-003']);
  assert.strictEqual(S.tcField(cases[0], 'priority'), 'High');
  assert.match(S.tcField(cases[2], 'Expected Result'), /ghi chú/);
  assert.deepStrictEqual(S.tcTags(cases[1]), { raw: 'Rule#BR-01, Viewpoint#VP-01, TI#TI-01, Module#AUTH', rules: ['BR-01'], viewpoints: ['VP-01'], ideas: ['TI-01'], module: 'AUTH' });
  assert.deepStrictEqual(unparsed, []);
});

test('test cases: TC-like lines that are not parsed are reported', () => {
  const { cases, unparsed } = S.parseTestCases('# x\n| TC_ID | Title |\n|---|---|\n| AUTH-001 | a |\n- TC-02: b\n##### AUTH-003\n');
  assert.strictEqual(cases.length, 0);
  assert.deepStrictEqual(unparsed.map((u) => u.id), [null, 'AUTH-001', 'TC-02', 'AUTH-003']);
});

test('labels are valid; template leftovers are placeholders (backticks included)', () => {
  assert.strictEqual(S.findPlaceholder('Hiển thị [CHƯA CÓ TRONG TÀI LIỆU – MR-03]'), null);
  assert.strictEqual(S.findPlaceholder('[GIẢ ĐỊNH] x · [CONTEXT_MISSING] · [ĐỀ XUẤT] Automated'), null);
  assert.strictEqual(S.findPlaceholder("`<script>alert('XSS')</script>` `SG-XXXXXX`"), null);
  for (const bad of ['`TBD`', 'TODO later', '[giá trị cụ thể]', '<điền>', '[High/Medium/Low]', 'Rule#[ID/Tên]']) {
    assert.ok(S.findPlaceholder(bad), bad);
  }
  assert.ok(S.hasLabel('CHƯA COVER'));
});

test('quote matching: NFC, whitespace, markdown, case, curly quotes and elisions', () => {
  const hay = S.normText('Mã voucher **hết hạn** thì hiển thị “thông báo lỗi”.\nKhác.'.normalize('NFD'));
  assert.ok(S.quoteFound('mã voucher hết  hạn thì hiển thị "thông báo lỗi"', hay));
  assert.ok(S.quoteFound('Mã voucher hết hạn thì … hiển thị "thông báo lỗi"', hay));
  assert.ok(!S.quoteFound('hiển thị "thông báo lỗi" … Mã voucher hết hạn thì', hay), 'elided parts keep their order');
  assert.ok(!S.quoteFound('Mã voucher … thông báo lỗi', hay), 'elided pieces need ≥ 4 words');
  assert.ok(!S.quoteFound('Mã voucher còn hạn', hay));
});

test('question rows: resolved only with Confirmed + answer, or Rejected', () => {
  const rows = S.readQuestionRows('| ID | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |\n|---|---|---|---|\n| MR-01 | a | x | Confirmed |\n| MR-02 | b |  | Confirmed |\n| MR-03 | c |  | Rejected |\n| MR-04 | d | – | New |\n');
  assert.deepStrictEqual(rows.map((r) => r.resolved), [true, false, true, false]);
});

test('decisions valid only with approver + date', () => {
  const d = S.readDecisions('| # | Mã liên quan | Câu hỏi | Quyết định chính thức | Người phê duyệt | Ngày chốt |\n|---|---|---|---|---|---|\n| 1 | MR-01, MR-02 | q | x | PO | 2026-11-01 |\n| 2 | MR-03 | q | x |  | 2026-11-01 |\n| 3 | MR-04 | q | x | <điền> | <điền> |\n');
  assert.deepStrictEqual(d.map((x) => x.valid), [true, false, false]);
  assert.deepStrictEqual(d[0].related, ['MR-01', 'MR-02']);
});
