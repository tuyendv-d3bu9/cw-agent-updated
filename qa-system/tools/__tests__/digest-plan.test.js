/**
 * Tests for the knowledge digest planner.
 *
 * Hai thứ phải đúng thì mới dám chạy trên 200 tài liệu: lần chạy sau chỉ lấy file
 * mới hoặc đã đổi, và không lô nào vượt ngân sách context.
 */

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { useTempProject, write } = require('./helpers');
const { PATHS } = require('../lib/paths');
const { listDocs, readStamps, plan } = require('../knowledge/digest-plan');

const digestDir = () => path.join(PATHS.OUTPUT, 'kho', 'knowledge_digest');

test('lần đầu — mọi tài liệu đều vào lô, chia theo ngân sách', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', 'a'.repeat(40));
  write('INPUT/kho/02_ba/b.md', 'b'.repeat(40));
  write('INPUT/kho/03_dev/c.md', 'c'.repeat(40));

  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 100 });
  assert.strictEqual(p.todo, 3);
  assert.deepStrictEqual(p.batches.map((b) => b.docs.length), [2, 1]);
  assert.deepStrictEqual(p.batches.map((b) => b.name), ['batch_01', 'batch_02']);
});

test('chạy lại — file không đổi bị bỏ qua, file đổi vào lô mới và thẻ cũ bị đánh dấu', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', 'giữ nguyên');
  write('INPUT/kho/02_ba/b.md', 'bản cũ');
  const [a, b] = listDocs('kho');
  write('OUTPUT/kho/knowledge_digest/batch_01.md',
    `### DOC: ${a.path} · sha256:${a.sha}\n- BR\n### DOC: ${b.path} · sha256:${b.sha}\n- BR\n` +
    '### DOC: INPUT/kho/02_ba/da-xoa.md · sha256:000000000000\n');
  write('INPUT/kho/02_ba/b.md', 'bản mới');

  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 1000 });
  assert.strictEqual(p.fresh, 1);
  assert.deepStrictEqual(p.batches.map((x) => x.name), ['batch_02']);
  assert.deepStrictEqual(p.batches[0].docs.map((d) => d.path), [b.path]);
  assert.deepStrictEqual(p.stale.map((s) => s.reason).sort(), ['Đã gỡ khỏi INPUT', 'Đã đổi']);
});

test('tài liệu to hơn ngân sách đứng riêng một lô và được ghi chú tách theo mục', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', 'a'.repeat(10));
  write('INPUT/kho/02_ba/to.md', 'x'.repeat(500));
  write('INPUT/kho/02_ba/z.md', 'z'.repeat(10));

  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 100 });
  assert.deepStrictEqual(p.batches.map((b) => b.docs.length), [1, 1, 1]);
  assert.match(p.batches[1].docs[0].note, /quá ngân sách/);
});

// ───────────────────── Audit 2026-11-04 #15 ─────────────────────

const { splitByHeading } = require('../knowledge/digest-plan');

test('#15 — lô sắp theo SỐ: có batch_100 thì lô kế là batch_101, không ghi đè', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', 'mới');
  for (const n of ['99', '100']) write(`OUTPUT/kho/knowledge_digest/batch_${n}.md`, `### DOC: INPUT/kho/02_ba/x${n}.md · sha256:000000000000\n`);
  const st = readStamps(digestDir());
  assert.strictEqual(st.lastBatch, 100);
  const p = plan(listDocs('kho'), st, { budget: 1000 });
  assert.deepStrictEqual(p.batches.map((b) => b.name), ['batch_101']);
});

test('#15 — tài liệu đổi ở lô 100 thắng bản cũ ở lô 99 (lô số lớn hơn thắng)', (t) => {
  t.after(useTempProject().cleanup);
  write('OUTPUT/kho/knowledge_digest/batch_99.md', '### DOC: INPUT/kho/02_ba/a.md · sha256:111111111111\n');
  write('OUTPUT/kho/knowledge_digest/batch_100.md', '### DOC: INPUT/kho/02_ba/a.md · sha256:222222222222\n');
  assert.strictEqual(readStamps(digestDir()).stamps.get('INPUT/kho/02_ba/a.md').batch, 'batch_100');
});

test('#15 — ảnh base64 / placeholder không tính vào ngân sách', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', `chữ ![x](data:image/png;base64,${'A'.repeat(5000)}) [IMAGE: sơ đồ]`);
  const [d] = listDocs('kho');
  assert.ok(d.chars < 20, `chars=${d.chars}`);
});

test('#15 — sha không phụ thuộc metadata/mtime, chỉ phụ thuộc nội dung', (t) => {
  t.after(useTempProject().cleanup);
  write('INPUT/kho/02_ba/a.md', '<!-- TRACEABILITY_METADATA\nModified: 2026-01-01 00:00:00\n-->\n\n# A\nnội dung');
  const s1 = listDocs('kho')[0].sha;
  write('INPUT/kho/02_ba/a.md', '<!-- TRACEABILITY_METADATA\nModified: 2026-11-04 09:00:00\n-->\n\n# A\nnội dung');
  assert.strictEqual(listDocs('kho')[0].sha, s1);
});

test('#15 — tài liệu quá ngân sách được tool cắt theo heading, không cắt giữa bảng', (t) => {
  t.after(useTempProject().cleanup);
  const table = ['| a | b |', '|---|---|', ...Array.from({ length: 10 }, (_, i) => `| r${i} | ${'x'.repeat(10)} |`)].join('\n');
  const doc = `# Mục 1\n${'m'.repeat(80)}\n\n# Mục 2\n${table}\n\n# Mục 3\n${'n'.repeat(80)}\n`;
  write('INPUT/kho/02_ba/to.md', doc);
  const parts = splitByHeading(doc, 120);
  assert.ok(parts.length >= 3, JSON.stringify(parts));
  const lines = doc.split('\n');
  for (const pt of parts) {
    const first = lines[pt.from - 1];
    assert.ok(!/^\|/.test(first) || /^\| a \|/.test(first), `phần bắt đầu giữa bảng: ${first}`);
  }
  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 120 });
  const notes = p.batches.flatMap((b) => b.docs.map((d) => d.note));
  assert.ok(notes.some((n) => /phần 1\/\d+: dòng 1–/.test(n)), notes.join('\n'));
  assert.ok(notes.some((n) => /§ Mục 2/.test(n)));
});
