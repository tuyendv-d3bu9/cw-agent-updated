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
  t.after(useTempProject());
  write('INPUT/kho/02_ba/a.md', 'a'.repeat(40));
  write('INPUT/kho/02_ba/b.md', 'b'.repeat(40));
  write('INPUT/kho/03_dev/c.md', 'c'.repeat(40));

  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 100 });
  assert.strictEqual(p.todo, 3);
  assert.deepStrictEqual(p.batches.map((b) => b.docs.length), [2, 1]);
  assert.deepStrictEqual(p.batches.map((b) => b.name), ['batch_01', 'batch_02']);
});

test('chạy lại — file không đổi bị bỏ qua, file đổi vào lô mới và thẻ cũ bị đánh dấu', (t) => {
  t.after(useTempProject());
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
  t.after(useTempProject());
  write('INPUT/kho/02_ba/a.md', 'a'.repeat(10));
  write('INPUT/kho/02_ba/to.md', 'x'.repeat(500));
  write('INPUT/kho/02_ba/z.md', 'z'.repeat(10));

  const p = plan(listDocs('kho'), readStamps(digestDir()), { budget: 100 });
  assert.deepStrictEqual(p.batches.map((b) => b.docs.length), [1, 1, 1]);
  assert.match(p.batches[1].docs[0].note, /tách theo mục/);
});
