const test = require('node:test');
const assert = require('node:assert');
const { useTempProject, write } = require('./helpers');
const J = require('../lib/jsonq');
const jsonTool = require('../system/json');
const mapTool = require('../system/map');

const DATA = {
  name: 'x',
  routing_table: { lint_command: 'npm run lint -- <slug>', gate_command: 'npm run gate <slug>' },
  items: [{ filename: 'a.docx', status: 'SUCCESS' }, { filename: 'b.png', status: 'FAILED' }, { filename: 'c.pdf', status: 'failed' }],
};

test('jsonq — khoá lồng, chỉ số, chỉ số âm, lọc, [*]', () => {
  assert.strictEqual(J.query(DATA, 'routing_table.lint_command').value, 'npm run lint -- <slug>');
  assert.strictEqual(J.query(DATA, 'items[0].filename').value, 'a.docx');
  assert.strictEqual(J.query(DATA, 'items[-1].filename').value, 'c.pdf');
  assert.deepStrictEqual(J.query(DATA, 'items[status=FAILED].filename').value, ['b.png', 'c.pdf']);
  assert.deepStrictEqual(J.query(DATA, 'items[*].filename').value, ['a.docx', 'b.png', 'c.pdf']);
  assert.strictEqual(J.query(DATA, 'routing_table.nope').found, false);
  assert.strictEqual(J.query(DATA, 'items[9]').found, false);
});

test('json tool — lấy một nhánh, --keys, từ chối file ngoài repo, JSON hỏng', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  write('knowledge/m.json', JSON.stringify(DATA));
  write('knowledge/bad.json', '{ oops');

  assert.strictEqual(jsonTool.run(['knowledge/m.json', 'routing_table.gate_command']).out, 'npm run gate <slug>');
  const keys = jsonTool.run(['knowledge/m.json', 'routing_table', '--keys']);
  assert.match(keys.out, /lint_command/);
  assert.strictEqual(jsonTool.run(['../../etc/passwd']).code, 2);
  assert.strictEqual(jsonTool.run(['knowledge/bad.json']).code, 1);
  const miss = jsonTool.run(['knowledge/m.json', 'routing_table.zzz']);
  assert.strictEqual(miss.code, 1);
  assert.match(miss.out, /lint_command/); // gợi ý các khoá có thật
});

test('json tool — cắt kết quả dài và nói rõ đã cắt', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  write('knowledge/big.json', JSON.stringify({ a: 'x'.repeat(5000) }));
  const r = jsonTool.run(['knowledge/big.json']);
  assert.ok(r.out.length < 1800);
  assert.match(r.out, /truncated/);
  assert.ok(jsonTool.run(['knowledge/big.json', '--max', '9000']).out.length > 4000);
});

test('map tool — mọi từ khoá phải khớp, bỏ dấu, giới hạn số dòng', (t) => {
  const p = useTempProject();
  t.after(p.cleanup);
  const rt = { lint_command: 'npm run lint -- <slug>', lint_tool: 'x/lint.js' };
  for (let i = 0; i < 20; i++) rt[`gate_${i}`] = `g${i}`;
  write('knowledge/_system_map.json', JSON.stringify({ routing_table: rt, note: 'Thiết kế' }));
  assert.match(mapTool.run(['lint']).out, /lint_command → npm run lint/);
  assert.strictEqual(mapTool.run(['lint', 'tool']).out.split('\n').length, 1);
  assert.match(mapTool.run(['thiet', 'ke']).out, /Thiết kế/);
  assert.match(mapTool.run(['gate']).out, /8 more matching entries/);
  assert.strictEqual(mapTool.run(['khongco']).code, 1);
  assert.strictEqual(mapTool.run([]).code, 2);
});

test('agent-doctor — --impact 16 trỏ đúng skill cr-impact-analysis và deliverable 16_cr_impact_analysis.md', () => {
  const { execFileSync } = require('node:child_process');
  const path = require('node:path');
  const doctorPath = path.join(__dirname, '..', 'system', 'agent-doctor.js');
  const out = execFileSync(process.execPath, [doctorPath, '--impact', '16'], { encoding: 'utf8' });
  assert.match(out, /qa-system\/qa-test-design\/skills\/cr-impact-analysis\.md/);
  assert.match(out, /16_cr_impact_analysis\.md/);
});
