/**
 * Pack ngành (qa-system/domains/): loader, tương thích ngược của ba tool, kiểm pack, luật `[DOMAIN]` của lint.
 *
 * Luật đầu tiên: dự án KHÔNG chọn ngành phải chạy y như trước — cùng chủ đề xung đột, cùng dataset
 * theo seed, cùng tập đơn vị, cùng kết quả lint.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write, fullTask, head, PATHS } = require('./helpers');
const D = require('../lib/domain');
const CD = require('../knowledge/conflict-detector');
const G = require('../testdata/generate-dataset');
const P = require('../lib/provenance');
const { lint } = require('../system/lint-deliverables');

const REPO_DOMAINS = path.join(__dirname, '..', '..', 'domains');

/** Một pack hợp lệ trong project tạm; `files` ghi đè / null để xoá từng file. */
function makePack(id, files = {}) {
  const base = {
    'README.md': `# ${id}\nNguồn: https://example.org/${id}\n`,
    'vocab.md': `# vocab ${id}\n`,
    'risks.md': `# risks ${id}\n`,
    'rule-patterns.md': `# rule-patterns ${id}\n`,
    'conflict_topics.json': JSON.stringify({ topics: {} }),
    'datagen.json': JSON.stringify({ types: {}, enums: {} }),
    'units.json': JSON.stringify({ units: [] }),
  };
  const all = { ...base, ...files };
  for (const [f, text] of Object.entries(all)) {
    if (text !== null) write(`qa-system/domains/${id}/${f}`, text);
  }
  return path.join(PATHS.ROOT, 'qa-system', 'domains', id);
}

const sut = (domain) => write('knowledge/_sut.json', JSON.stringify(domain === undefined ? { name: 'x' } : { name: 'x', domain }));
const load = () => D.loadDomain({ root: PATHS.ROOT });

// ───────────────────────── Loader ─────────────────────────

test('loader — không có _sut.json / không có `domain` / `domain: ""` ⇒ không chọn ngành', (t) => {
  t.after(useTempProject().cleanup);
  makePack('alpha');
  for (const setup of [() => {}, () => sut(undefined), () => sut(''), () => sut([]), () => sut('<pack-id>')]) {
    setup();
    const d = load();
    assert.deepStrictEqual(d.ids, []);
    assert.strictEqual(d.conflictTopics, null);
    assert.deepStrictEqual(d.datagen, { types: {}, enums: {} });
    assert.deepStrictEqual(d.units, []);
    assert.deepStrictEqual(d.files, { vocab: [], risks: [], rulePatterns: [] });
    assert.strictEqual(d.override, null);
  }
});

test('loader — một pack: đường dẫn file, chủ đề, datagen, đơn vị', (t) => {
  t.after(useTempProject().cleanup);
  makePack('alpha', {
    'conflict_topics.json': JSON.stringify({ topics: { t1: { category: 'C1', allow: ['a'], deny: ['b'] } } }),
    'datagen.json': JSON.stringify({ types: { ref_no: { generator: 'code', defaults: { prefixes: ['X'], values: ['1'] } } }, enums: { st: ['A', 'B'] } }),
    'units.json': JSON.stringify({ units: ['USD', 'kg'] }),
  });
  sut('alpha');
  const d = load();
  assert.deepStrictEqual(d.ids, ['alpha']);
  assert.deepStrictEqual(d.packs, [{ id: 'alpha', dir: 'qa-system/domains/alpha', readme: 'qa-system/domains/alpha/README.md' }]);
  assert.deepStrictEqual(d.files.risks, ['qa-system/domains/alpha/risks.md']);
  assert.deepStrictEqual(Object.keys(d.conflictTopics), ['t1']);
  assert.deepStrictEqual(Object.keys(d.datagen.types), ['ref_no']);
  assert.deepStrictEqual(d.datagen.enums.st, ['A', 'B']);
  assert.deepStrictEqual(d.units, ['usd', 'kg']);
});

test('loader — hai pack: gộp theo thứ tự, trùng khoá chủ đề giữ cả hai, đơn vị không lặp', (t) => {
  t.after(useTempProject().cleanup);
  const topic = (c) => JSON.stringify({ topics: { same: { category: c, allow: ['a'], deny: ['b'] } } });
  makePack('alpha', { 'conflict_topics.json': topic('A'), 'units.json': JSON.stringify({ units: ['kg'] }) });
  makePack('beta', { 'conflict_topics.json': topic('B'), 'units.json': JSON.stringify({ units: ['kg', 'usd'] }) });
  sut(['alpha', 'beta', 'alpha']);
  const d = load();
  assert.deepStrictEqual(d.ids, ['alpha', 'beta']);
  assert.deepStrictEqual(Object.keys(d.conflictTopics), ['same', 'beta:same']);
  assert.deepStrictEqual(d.units, ['kg', 'usd']);
  assert.strictEqual(d.files.vocab.length, 2);
});

test('loader — hai pack định nghĩa cùng kiểu datagen khác nhau ⇒ lỗi, không tự chọn', (t) => {
  t.after(useTempProject().cleanup);
  const dg = (p) => JSON.stringify({ types: { ref: { generator: 'code', defaults: { prefixes: [p] } } } });
  makePack('alpha', { 'datagen.json': dg('A') });
  makePack('beta', { 'datagen.json': dg('B') });
  sut(['alpha', 'beta']);
  assert.throws(load, /datagen\.types\.ref.*alpha\/datagen\.json.*beta\/datagen\.json/);
});

test('loader — id không có ⇒ lỗi liệt kê id đang có, không đoán', (t) => {
  t.after(useTempProject().cleanup);
  makePack('alpha');
  makePack('beta');
  write('qa-system/domains/_template/README.md', '# t');
  sut('alpah');
  assert.throws(load, (e) => /alpah/.test(e.message) && /alpha, beta/.test(e.message) && !/_template/.test(e.message));
});

test('loader — knowledge/_domain.md: khuôn trống không tác dụng; mục có nội dung được gộp và thắng pack', (t) => {
  t.after(useTempProject().cleanup);
  makePack('alpha', { 'datagen.json': JSON.stringify({ types: { ref: { generator: 'code', defaults: { prefixes: ['P'] } } } }) });
  sut('alpha');
  write('knowledge/_domain.md', fs.readFileSync(path.join(__dirname, '..', '..', 'templates', 'knowledge', '_domain.md'), 'utf-8'));
  assert.strictEqual(load().override, null, 'template copied by init must be inert');

  write('knowledge/_domain.md', [
    '# x', '## risks', '| Mục | Rủi ro |', '|---|---|', '| r1 | Rủi ro riêng của dự án |',
    '## datagen', '```json', JSON.stringify({ types: { ref: { generator: 'code', defaults: { prefixes: ['Q'] } } } }), '```',
    '## units', '```json', '{ "units": ["tấn"] }', '```',
  ].join('\n'));
  const d = load();
  assert.ok(d.override && /Rủi ro riêng/.test(d.override.risks));
  assert.deepStrictEqual(d.files.risks, ['qa-system/domains/alpha/risks.md', 'knowledge/_domain.md']);
  assert.deepStrictEqual(d.datagen.types.ref.defaults.prefixes, ['Q']);
  assert.deepStrictEqual(d.units, ['tấn']);
});

test('loader — _sut.json chọn ngành của repo thật: ecommerce-retail đọc được', () => {
  const d = D.loadDomain({ root: PATHS.ROOT, domainsDir: REPO_DOMAINS, sutFile: '/nonexistent' });
  assert.deepStrictEqual(d.ids, []);
  assert.ok(D.listPacks(REPO_DOMAINS).includes('ecommerce-retail'));
  assert.ok(!D.listPacks(REPO_DOMAINS).includes('_template'));
});

// ─────────────────── Tương thích: conflict-detector ───────────────────

/** Bộ chủ đề của pack ecommerce-retail thật, qua đúng loader. */
function ecommerceDomain() {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'qa-dom-'));
  fs.mkdirSync(path.join(tmp, 'knowledge'));
  fs.writeFileSync(path.join(tmp, 'knowledge', '_sut.json'), JSON.stringify({ domain: 'ecommerce-retail' }));
  try { return D.loadDomain({ root: tmp, domainsDir: REPO_DOMAINS }); } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

const FEATURES = [
  ['a', 'Mã được cộng dồn với flash sale. Hỗ trợ khách vãng lai. Giảm cả phí ship.'],
  ['b', 'Voucher không cộng dồn. Bắt buộc đăng nhập. Chỉ áp dụng tiền hàng.'],
  ['c', 'Huỷ đơn thì hoàn voucher.'],
  ['d', 'Huỷ là mất mã, không hoàn.'],
];

test('compat — không chọn ngành ⇒ chủ đề = DEFAULT_TOPICS (cùng object), xung đột y như cũ', (t) => {
  t.after(useTempProject().cleanup);
  const base = CD.baseTopics(load());
  assert.strictEqual(base, CD.DEFAULT_TOPICS);
  assert.strictEqual(CD.loadTopics(path.join(PATHS.KNOWLEDGE, '_conflict_topics.json'), base), CD.DEFAULT_TOPICS);
  const feats = FEATURES.map(([s, b]) => CD.parseFeatureFile(write(`knowledge/features/${s}.md`, `# ${s}\n${b}\n`)));
  const legacy = CD.detectConflicts(feats); // mặc định của hàm = DEFAULT_TOPICS, đúng như CLI cũ
  assert.ok(legacy.length >= 4);
  assert.deepStrictEqual(CD.detectConflicts(feats, { topics: base }), legacy);
});

test('compat — chọn ecommerce-retail ⇒ chủ đề bằng đúng DEFAULT_TOPICS, xung đột y như cũ', (t) => {
  t.after(useTempProject().cleanup);
  const d = ecommerceDomain();
  assert.deepStrictEqual(d.conflictTopics, CD.DEFAULT_TOPICS);
  const feats = FEATURES.map(([s, b]) => CD.parseFeatureFile(write(`knowledge/features/${s}.md`, `# ${s}\n${b}\n`)));
  assert.deepStrictEqual(CD.detectConflicts(feats, { topics: CD.baseTopics(d) }), CD.detectConflicts(feats));
});

test('compat — knowledge/_conflict_topics.json vẫn chồng lên chủ đề gốc ở cả hai trường hợp', (t) => {
  t.after(useTempProject().cleanup);
  const file = write('knowledge/_conflict_topics.json', JSON.stringify({ topics: { otp: { category: 'OTP', allow: ['gửi lại otp'], deny: ['không gửi lại otp'] } } }));
  const noDomain = CD.loadTopics(file, CD.baseTopics(load()));
  assert.deepStrictEqual(Object.keys(noDomain), [...Object.keys(CD.DEFAULT_TOPICS), 'otp']);
  makePack('alpha', { 'conflict_topics.json': JSON.stringify({ topics: { t1: { category: 'C1', allow: ['a'], deny: ['b'] } } }) });
  sut('alpha');
  assert.deepStrictEqual(Object.keys(CD.loadTopics(file, CD.baseTopics(load()))), ['t1', 'otp']);
  write('knowledge/_conflict_topics.json', JSON.stringify({ replaceDefaults: true, topics: { otp: { category: 'OTP', allow: ['x'], deny: ['y'] } } }));
  assert.deepStrictEqual(Object.keys(CD.loadTopics(file, CD.baseTopics(load()))), ['otp']);
});

// ─────────────────── Tương thích: generate-dataset ───────────────────

const LEGACY_SCHEMA = {
  code: { type: 'voucher_code' },
  code2: { type: 'voucher_code', prefixes: ['X'] },
  money: { type: 'currency_vnd', formatted: true },
  money2: { type: 'currency_vnd', min: 100000, max: 1000000, step: 50000 },
  bank: { type: 'bank_vn', field: 'full' },
  bank2: { type: 'bank_vn', field: 'account_number' },
  st: { type: 'enum', values: ['A', 'B'] },
  qty: { type: 'boundary', min: 1, max: 10 },
  other: { type: 'whatever' },
};

test('compat — không chọn ngành: kiểu cũ (voucher_code, currency_vnd, bank_vn…) ra đúng dữ liệu theo seed', () => {
  const legacy = G.generateDataset(LEGACY_SCHEMA, 12, { seed: 42 });
  assert.deepStrictEqual(G.generateDataset(LEGACY_SCHEMA, 12, { seed: 42, datagen: null }), legacy);
  // Chọn một ngành không khai các kiểu này ⇒ kiểu cũ vẫn chạy y như trước.
  assert.deepStrictEqual(G.generateDataset(LEGACY_SCHEMA, 12, { seed: 42, datagen: { types: {}, enums: {} } }), legacy);
  assert.match(String(legacy[0].money), / VND$/);
});

test('compat — chọn ecommerce-retail: kiểu của pack (engine trung tính) ra đúng dữ liệu của generator cũ', () => {
  const { datagen } = ecommerceDomain();
  assert.deepStrictEqual(Object.keys(datagen.types).sort(), ['bank_vn', 'currency_vnd', 'voucher_code']);
  const legacy = G.generateDataset(LEGACY_SCHEMA, 12, { seed: 7 });
  assert.deepStrictEqual(G.generateDataset(LEGACY_SCHEMA, 12, { seed: 7, datagen }), legacy);
});

test('dataset — pack thêm kiểu mới và enum có tên; enum không có ⇒ lỗi rõ', () => {
  const datagen = { types: { ref_no: { generator: 'code', defaults: { prefixes: ['REF-'], values: ['1', '2'] } } }, enums: { status: ['Open', 'Closed'] } };
  const rows = G.generateDataset({ r: { type: 'ref_no' }, s: { type: 'enum', enum: 'status' } }, 4, { seed: 1, datagen });
  rows.forEach((row) => assert.match(row.r, /^REF-[12]$/));
  assert.deepStrictEqual(rows.map((row) => row.s), ['Open', 'Closed', 'Open', 'Closed']);
  assert.throws(() => G.generateDataset({ s: { type: 'enum', enum: 'nope' } }, 1, { datagen }), /enum "nope"/);
  assert.throws(() => G.resolveSpec({ type: 'x' }, { types: { x: { generator: 'nope' } } }), /engine không có/);
});

// ─────────────────── Tương thích: provenance ───────────────────

test('provenance — không có đơn vị thêm ⇒ đúng regex cũ; pack chỉ THÊM đơn vị', () => {
  assert.strictEqual(P.unitPattern([]), P.UNIT_AFTER);
  assert.strictEqual(P.unitPattern(undefined), P.UNIT_AFTER);
  const re = P.unitPattern(['usd', 'kg']);
  const text = 'Phí 50 usd, nặng 3 kg, giá 200.000 vnđ, 5 lần';
  const before = P.numbersIn(text);
  const after = P.numbersIn(text, re);
  assert.deepStrictEqual(before.map((n) => n.unitAttached), [false, false, true, true]);
  assert.deepStrictEqual(after.map((n) => n.unitAttached), [true, true, true, true]);
  // Đơn vị sẵn có không bao giờ bị bớt.
  for (const n of before) assert.ok(!n.unitAttached || after.find((m) => m.raw === n.raw).unitAttached);
});

test('provenance — ecommerce-retail chỉ khai lại đơn vị sẵn có ⇒ số nhận diện không đổi', () => {
  const { units } = ecommerceDomain();
  assert.deepStrictEqual(units, ['vnđ', 'vnd', 'đồng', 'đ']);
  const text = 'Tối đa 500.000đ, 2 vnd, 3 đồng, 4 VNĐ, 5 abc, 6 lần';
  assert.deepStrictEqual(P.numbersIn(text, P.unitPattern(units)), P.numbersIn(text));
});

// ─────────────────── agent:check — kiểm pack ───────────────────

const ENGINES = G.ENGINES;

test('validatePack — pack thật ecommerce-retail và _template sạch', () => {
  assert.deepStrictEqual(D.validatePack(path.join(REPO_DOMAINS, 'ecommerce-retail'), { engines: ENGINES }), []);
  assert.deepStrictEqual(D.validatePack(path.join(REPO_DOMAINS, '_template'), { template: true, engines: ENGINES }), []);
});

test('validatePack — pack tốt / JSON hỏng / thiếu file / mã BR trong pack / README không nguồn / engine lạ', (t) => {
  t.after(useTempProject().cleanup);
  const fails = (dir) => D.validatePack(dir, { engines: ENGINES }).filter((p) => p.level === 'FAIL').map((p) => `${p.file}: ${p.msg}`).join(' | ');

  assert.strictEqual(fails(makePack('good')), '');
  assert.match(fails(makePack('badjson', { 'datagen.json': '{ "types": ' })), /datagen\.json: JSON không đọc được/);
  assert.match(fails(makePack('missing', { 'risks.md': null })), /risks\.md: Thiếu file bắt buộc/);
  assert.match(fails(makePack('fact', { 'rule-patterns.md': '| x | BR-01 luôn đúng |' })), /rule-patterns\.md: Chứa mã sự thật BR-01/);
  assert.match(fails(makePack('fact2', { 'vocab.md': 'xem FD-12' })), /FD-12/);
  assert.match(fails(makePack('nosrc', { 'README.md': '# pack\nkhông có nguồn\n' })), /README\.md: Cần ít nhất một URL/);
  assert.strictEqual(fails(makePack('unk', { 'README.md': '# pack\nNguồn: Unknown\n' })), '');
  assert.match(fails(makePack('eng', { 'datagen.json': JSON.stringify({ types: { x: { generator: 'magic' } } }) })), /engine có thật/);
  assert.match(fails(makePack('topic', { 'conflict_topics.json': JSON.stringify({ topics: { x: { category: 'c' } } }) })), /topics\.x cần/);
});

// ─────────────────── lint — `[DOMAIN]` không phải nguồn của BR/FD ───────────────────

const Q = 'Người dùng nhập mã voucher hợp lệ thì hệ thống áp dụng giảm giá';
const summaryWith = (row) => `${head('Requirement Risk Summary')}
## 3. BUSINESS RULES

| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn |
|---|---|---|---|---|
${row}
| BR-02 | đk | kq | 02_ba/spec.md §1 | Mã voucher hết hạn thì hiển thị thông báo lỗi |
`;
const lintErrors = () => lint('t').errors.map((e) => `${e.file} ${e.msg}`).join(' | ');

test('lint — BR có nguồn dự án: sạch (đối chứng)', (t) => {
  t.after(useTempProject().cleanup);
  fullTask();
  assert.strictEqual(lintErrors(), '');
});

test('lint — BR lấy `[DOMAIN]` làm nguồn ⇒ lỗi, kể cả khi câu trích có thật trong INPUT', (t) => {
  t.after(useTempProject().cleanup);
  fullTask();
  write('OUTPUT/t/01_requirement_risk_summary.md', summaryWith(`| BR-01 | đk | kq | [DOMAIN] ecommerce-retail/risks.md#x | ${Q} |`));
  assert.match(lintErrors(), /01_requirement_risk_summary\.md Cites a domain pack/);
});

test('lint — BR trích đường dẫn qa-system/domains/ ⇒ lỗi; knowledge §3 cũng vậy', (t) => {
  t.after(useTempProject().cleanup);
  fullTask();
  write('OUTPUT/t/01_requirement_risk_summary.md', summaryWith('| BR-01 | đk | kq | qa-system/domains/banking/risks.md | rủi ro ngành |'));
  assert.match(lintErrors(), /Cites a domain pack/);

  write('OUTPUT/t/01_requirement_risk_summary.md', summaryWith(`| BR-01 | đk | kq | 02_ba/spec.md §1 | ${Q} |`));
  const k = fs.readFileSync(path.join(PATHS.FEATURES, 't.md'), 'utf-8')
    .replace('| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |\n|---|---|---|---|---|---|\n',
      '| ID | Điều kiện | Hành vi / Kết quả | Nguồn (file §mục) | Trích nguyên văn | Trạng thái |\n|---|---|---|---|---|---|\n| BR-07 | đk | kq | [DOMAIN] x/risks.md#y | | Confirmed |\n');
  write('knowledge/features/t.md', k);
  assert.match(lintErrors(), /knowledge\/features\/t\.md Cites a domain pack/);
});

test('lint — không chọn ngành ⇒ kết quả lint của một task y như khi chọn pack chỉ khai lại đơn vị cũ', (t) => {
  t.after(useTempProject().cleanup);
  fullTask();
  const before = lint('t');
  fs.cpSync(path.join(REPO_DOMAINS, 'ecommerce-retail'), path.join(PATHS.ROOT, 'qa-system', 'domains', 'ecommerce-retail'), { recursive: true });
  sut('ecommerce-retail');
  assert.deepStrictEqual(lint('t'), before);
});
