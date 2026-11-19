/**
 * exam-schema.test.js — The minimal JSON Schema validator and the exam contracts:
 * plan §9.1–9.3 sample results and a full submission validate; broken ones do not.
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { validate } = require('../exam/lib/json-schema');
const C = require('../exam/lib/common');
const F = require('./exam-fixtures');

const PLAN = fs.readFileSync(path.join(F.REPO, 'docs/plans/graduation-project.md'), 'utf8');
/** JSON code blocks under a heading of the plan. */
function planJson(heading) {
  const at = PLAN.indexOf(heading);
  const start = PLAN.indexOf('```json', at) + '```json'.length;
  return JSON.parse(PLAN.slice(start, PLAN.indexOf('```', start)));
}

test('validator: types, union types, integer, const, enum', () => {
  assert.deepStrictEqual(validate({ type: 'string' }, 'a'), []);
  assert.strictEqual(validate({ type: 'string' }, 1)[0].message, 'expected type string, got integer');
  assert.deepStrictEqual(validate({ type: ['string', 'null'] }, null), []);
  assert.deepStrictEqual(validate({ type: 'number' }, 3), []);
  assert.strictEqual(validate({ type: 'integer' }, 1.5).length, 1);
  assert.strictEqual(validate({ type: 'array' }, {}).length, 1);
  assert.strictEqual(validate({ type: 'object' }, []).length, 1);
  assert.strictEqual(validate({ const: 70 }, 71).length, 1);
  assert.deepStrictEqual(validate({ const: { a: [1] } }, { a: [1] }), []);
  assert.strictEqual(validate({ enum: ['A', 'B'] }, 'C').length, 1);
});

test('validator: strings and numbers', () => {
  assert.strictEqual(validate({ type: 'string', minLength: 3 }, 'ab').length, 1);
  assert.strictEqual(validate({ type: 'string', maxLength: 2 }, 'abc').length, 1);
  assert.deepStrictEqual(validate({ type: 'string', maxLength: 2 }, 'ăâ'), []); // code points, not bytes
  assert.strictEqual(validate({ type: 'string', pattern: '^[0-9a-f]{40}$' }, 'xyz').length, 1);
  assert.strictEqual(validate({ type: 'number', minimum: 0 }, -1).length, 1);
  assert.deepStrictEqual(validate({ type: ['number', 'null'], minimum: 0 }, null), []);
});

test('validator: objects, arrays, $ref and JSON-pointer paths', () => {
  const s = {
    type: 'object', additionalProperties: false, required: ['a', 'b/c'],
    $defs: { item: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } } },
    properties: { a: { type: 'array', items: { $ref: '#/$defs/item' } }, 'b/c': { type: 'object', additionalProperties: { type: 'string', minLength: 2 } } },
  };
  const errs = validate(s, { a: [{ id: 'x' }, { id: 1 }, {}], 'b/c': { k: 'v' }, extra: 1 });
  const paths = errs.map((e) => e.path).sort();
  assert.deepStrictEqual(paths, ['/a/1/id', '/a/2/id', '/b~1c/k', '/extra']);
  assert.ok(errs.find((e) => e.path === '/extra').message.includes('not an allowed property'));
  const missing = validate(s, {});
  assert.deepStrictEqual(missing.map((e) => e.path).sort(), ['/a', '/b~1c']);
  assert.strictEqual(missing[0].message, 'is required');
});

test('validator: unsupported keywords and refs are schema errors, not silent passes', () => {
  assert.throws(() => validate({ type: 'array', minItems: 1 }, []), /Unsupported schema keyword "minItems"/);
  assert.throws(() => validate({ $ref: 'http://x/y' }, 1), /Unsupported \$ref/);
  assert.throws(() => validate({ $ref: '#/$defs/none' }, 1), /Unresolvable/);
});

test('every exam schema loads and uses only supported keywords', () => {
  for (const n of ['submission', 'result', 'instructor', 'roster', 'exam-config']) {
    const s = C.loadSchema(n);
    assert.strictEqual(s.$schema, 'https://json-schema.org/draft/2020-12/schema');
    validate(s, {}); // throws on any unsupported keyword
  }
});

test('result schema accepts the plan samples §9.1, §9.2, §9.3', () => {
  const schema = C.loadSchema('result');
  for (const h of ['### 9.1 Valid', '### 9.2 Incomplete', '### 9.3 Invalid']) {
    assert.deepStrictEqual(validate(schema, planJson(h)), [], h);
  }
  const bad = planJson('### 9.1 Valid');
  bad.automated.max = 69;
  bad.total.score = 'x';
  delete bad.status;
  assert.deepStrictEqual(validate(schema, bad).map((e) => e.path).sort(), ['/automated/max', '/status', '/total/score']);
});

test('submission schema: the plan contract equals the shipped file; a full submission validates', () => {
  assert.deepStrictEqual(C.loadSchema('submission'), planJson('### 2.2 JSON Schema'));
  assert.deepStrictEqual(C.loadSchema('result'), planJson('### 3.1 JSON Schema'));
  const files = F.studentFiles({ starterDir: F.REPO, starterSha: 'a'.repeat(40) }, 'nguyen-van-a', 'complete');
  const sub = JSON.parse(files['EXAM/submission.json']);
  assert.deepStrictEqual(validate(C.loadSchema('submission'), sub), []);
  const broken = JSON.parse(JSON.stringify(sub));
  broken.t1_customized_agent.changed_files.push('../escape');
  broken.t1_customized_agent.anchors.N3 = 'maybe';
  broken.t1_customized_agent.anchor_reasons.N2 = 'short';
  broken.student_id = 'Nguyen';
  assert.deepStrictEqual(validate(C.loadSchema('submission'), broken).map((e) => e.path).sort(),
    ['/student_id', '/t1_customized_agent/anchor_reasons/N2', '/t1_customized_agent/anchors/N3', '/t1_customized_agent/changed_files/3']);
});

test('roster and exam-config schemas', () => {
  assert.deepStrictEqual(validate(C.loadSchema('roster'), { exam_id: 'shopgo-refund-v1', students: [{ student_id: 'nguyen-van-a', display_name: 'Nguyen Van A' }] }), []);
  assert.strictEqual(validate(C.loadSchema('roster'), { exam_id: 'x', students: [{ student_id: 'Bad Id', display_name: '' }] }).length, 2);
  const cfg = { exam_id: 'shopgo-refund-v1', task_slug: 'shopgo-refund', exam_branch: 'exams/shopgo-refund-v1', starter_tag: 'exam/shopgo-refund-v1/starter',
    remote: 'origin', deadline: '2026-12-15T23:59:59+07:00', timezone: 'Asia/Ho_Chi_Minh', rubric_version: 'grad-v1.0.0' };
  assert.deepStrictEqual(validate(C.loadSchema('exam-config'), cfg), []);
  assert.strictEqual(validate(C.loadSchema('exam-config'), { ...cfg, deadline: '15/12/2026' }).length, 1);
});
