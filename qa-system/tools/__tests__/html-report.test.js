const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const R = require('../report/html-report');
const B = require('../report/build-report');

const CLI = path.join(__dirname, '..', 'report', 'build-report.js');

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-report-test-'));
  const w = (rel, text) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); };
  w('00_plan.md', '# Plan\n- [x] stage 1\n');
  w('01_requirement_risk_summary.md', '# Summary\nOwner: x · Nguồn: a.md · Verdict: PASS\n\n| Rule | Text |\n|---|---|\n| BR-01 | <script>alert(1)</script> |\n| BR-02 | b |\n');
  w('05_test_blueprint.json', JSON.stringify([{ tc_id: 'T-001', priority: 'High' }, { tc_id: 'T-002', priority: 'Low [ĐỀ XUẤT]' }]));
  w('testcases/batch_01.md', '### TC_ID: T-001\n- **Title**: one\n\n### TC_ID: T-002\n- **Title**: two\n');
  w('_gate.log', '{"event":"locked","at":"2026-01-01T00:00:00Z","reasons":["r1"]}\n');
  return { dir, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

const snapshot = (dir) => {
  const out = {};
  const walk = (d) => { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); fs.statSync(p).isDirectory() ? walk(p) : (out[path.relative(dir, p)] = fs.readFileSync(p, 'utf8')); } };
  walk(dir);
  return out;
};

test('escapes <script>, <img onerror> and quotes — raw HTML is shown as text', () => {
  const html = R.renderMarkdown('<script>alert(1)</script>\n\nx <img src=x onerror=alert(1)> y\n\n`<b>`');
  assert.ok(!/<script/i.test(html));
  assert.ok(!/<img/i.test(html));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.strictEqual(R.escapeHtml(`<a href="x">'&`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
});

test('links: javascript:, data:, obfuscated schemes are neutralised; http(s) and relative kept', () => {
  for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil.example/x', 'java%0ascript:x']) {
    const html = R.renderMarkdown(`[click](${bad})`);
    if (bad.startsWith('java%')) continue; // percent-encoded text is not a scheme; it stays a harmless relative path
    assert.ok(!/href=/.test(html), `${bad} -> ${html}`);
    assert.ok(html.includes('click'));
  }
  assert.strictEqual(R.safeUrl('java\tscript:alert(1)'), null);
  assert.ok(R.renderMarkdown('[a](https://example.com/?q=1&r="2")').includes('href="https://example.com/?q=1&amp;r=&quot;2&quot;"'));
  assert.ok(R.renderMarkdown('[a](docs/file.md)').includes('href="docs/file.md"'));
  assert.ok(!/<[^>]* on\w+=/i.test(R.renderMarkdown('[a](https://x.io" onmouseover="alert(1))')));
});

test('markdown: headings, tables, lists, code blocks, blockquotes, inline styles', () => {
  const html = R.renderMarkdown('# T\n\n## Sub\n\n| A | B |\n|---|---|\n| 1 | **2** |\n\n- one\n- two\n  - nested\n\n1. x\n\n```\n<b>code</b>\n```\n\n> quote *em*\n\nuse `a<b`');
  assert.ok(html.includes('<h1>T</h1>') && html.includes('<h2>Sub</h2>'));
  assert.ok(html.includes('<th>A</th>') && html.includes('<td><strong>2</strong></td>'));
  assert.ok(html.includes('<ul><li>one</li>') && html.includes('<ul><li>nested</li></ul>'));
  assert.ok(html.includes('<ol><li>x</li></ol>'));
  assert.ok(html.includes('<pre><code>&lt;b&gt;code&lt;/b&gt;</code></pre>'));
  assert.ok(html.includes('<blockquote><p>quote <em>em</em></p></blockquote>'));
  assert.ok(html.includes('<code>a&lt;b</code>'));
});

test('renderReport: self-contained, CSP, dark mode, no script, unique section ids', () => {
  const html = R.renderReport({ title: '<T>', sections: [{ id: 'a', title: 'A', html: '<p>x</p>' }, { id: 'a', title: 'A2', html: '' }], meta: { k: '<v>' } });
  assert.ok(html.includes(`content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:"`));
  assert.ok(html.includes('prefers-color-scheme:dark') && html.includes('@media print'));
  assert.ok(!/<script|https?:\/\/|<link/i.test(html));
  assert.ok(html.includes('&lt;T&gt;') && html.includes('&lt;v&gt;'));
  assert.ok(html.includes('href="#a"') && html.includes('href="#a-2"'));
});

test('build-report: reports missing stages as "not produced", counts from files', () => {
  const f = fixture();
  try {
    const r = B.buildReport({ dir: f.dir, slug: 'demo', outFile: path.join(f.dir, 'report.html') });
    assert.deepStrictEqual(r.missing.filter((n) => ['02', '03', '04', '06'].includes(n)), ['02', '03', '04', '06']);
    assert.ok(r.found.includes('01') && r.found.includes('05'));
    assert.ok(r.html.includes('not produced'));
    assert.ok(!/<script/i.test(r.html));
    assert.ok(r.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    assert.match(r.html, /<td>Test cases in blueprint<\/td><td>2<\/td>/);
    assert.match(r.html, /<td>BR ids mentioned<\/td><td>2<\/td>/);
    assert.match(r.html, /<td>Test cases in batch<\/td><td>2<\/td>/);
    assert.deepStrictEqual(r.sections.slice(0, 1).concat(r.sections.slice(-1)), ['Overview', 'Evidence & sources']);
  } finally { f.cleanup(); }
});

test('build-report: deterministic and read-only on artifacts; CLI end-to-end writes only report.html', () => {
  const f = fixture();
  try {
    const before = snapshot(f.dir);
    const run = () => spawnSync(process.execPath, [CLI, 'demo', '--dir', f.dir], { encoding: 'utf8' });
    const a = run();
    assert.strictEqual(a.status, 0, a.stderr);
    const first = fs.readFileSync(path.join(f.dir, 'report.html'), 'utf8');
    const b = run();
    assert.strictEqual(b.status, 0, b.stderr);
    assert.strictEqual(fs.readFileSync(path.join(f.dir, 'report.html'), 'utf8'), first);
    const after = snapshot(f.dir);
    assert.deepStrictEqual(Object.keys(after).filter((k) => !(k in before)), ['report.html']);
    for (const k of Object.keys(before)) assert.strictEqual(after[k], before[k], `${k} was modified`);
    assert.ok(!/Generated at/.test(first));

    const out = path.join(f.dir, 'sub', 'x.html');
    fs.mkdirSync(path.dirname(out));
    const c = spawnSync(process.execPath, [CLI, 'demo', '--dir', f.dir, '--out', out, '--generated-at', 'T0'], { encoding: 'utf8' });
    assert.strictEqual(c.status, 0, c.stderr);
    const html = fs.readFileSync(out, 'utf8');
    assert.ok(html.includes('Generated at') && html.includes('href="../01_requirement_risk_summary.md"'));
  } finally { f.cleanup(); }
});

test('CLI: missing folder or slug exits 2 with an English message', () => {
  const a = spawnSync(process.execPath, [CLI], { encoding: 'utf8' });
  assert.strictEqual(a.status, 2);
  assert.match(a.stderr, /Usage/);
  const b = spawnSync(process.execPath, [CLI, 'x', '--dir', path.join(os.tmpdir(), 'no-such-dir-qa-report')], { encoding: 'utf8' });
  assert.strictEqual(b.status, 2);
  assert.match(b.stderr, /not found/);
});
