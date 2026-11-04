/**
 * Tests for knowledge:new (audit #1/#3: no sample rows may reach a real feature).
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { useTempProject, write } = require('./helpers');
const { createKnowledge } = require('../knowledge/new-knowledge');
const S = require('../lib/schema');

test('creates an empty feature file from the real template, filling only <feature-slug>', () => {
  const t = useTempProject();
  try {
    write('knowledge/_template.md', fs.readFileSync(path.join(__dirname, '..', '..', '..', 'knowledge', '_template.md'), 'utf-8'));
    const r = createKnowledge('voucher');
    assert.ok(r.created);
    const k = fs.readFileSync(r.path, 'utf-8');
    assert.ok(!k.includes('<feature-slug>'));
    assert.match(k, /`voucher`/);
    assert.deepStrictEqual(S.idsIn(k, ['BR', 'MR', 'FD', 'AF']), []);
    assert.strictEqual(createKnowledge('voucher').created, false, 'never overwrites');
  } finally { t.cleanup(); }
});

test('sample rows of an OLD template are stripped', () => {
  const t = useTempProject();
  try {
    write('knowledge/_template.md', '# <Tên>\n## 7. Q\n| ID | Câu hỏi cho BA/PO | Phản hồi chính thức | Trạng thái |\n|---|---|---|---|\n| MR-01 | mẫu | 5 lần | Confirmed |\n');
    const k = fs.readFileSync(createKnowledge('x').path, 'utf-8');
    assert.ok(!k.includes('MR-01'));
    assert.match(k, /\| ID \| Câu hỏi/);
  } finally { t.cleanup(); }
});
