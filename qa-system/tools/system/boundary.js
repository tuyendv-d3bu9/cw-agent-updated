#!/usr/bin/env node
/**
 * boundary.js — Boundary points of each field, computed by the MACHINE from the constraints in 01 §3b (FD).
 *
 * The skill used to say "boundary points come from min/max" without saying how, so each run the model
 * computed them differently (and invented thresholds when the source had none). This tool reads min/max from the FD table and computes the full boundary series
 * of QA_STANDARD §6 (min-1, min, min+1, middle, max-1, max, max+1) — the agent COPIES the result, never computes.
 * Missing min or max in the source ⇒ that point is the label [CHƯA CÓ TRONG TÀI LIỆU], a threshold is never invented.
 *
 * Usage:
 *   node qa-system/tools/system/boundary.js <slug> [FD-xx] [--json]
 */
const fs = require('fs');
const path = require('path');
const { taskDir } = require('../lib/paths');
const S = require('../lib/schema');
const { parseNumber } = require('../lib/provenance');

const LABEL = '[CHƯA CÓ TRONG TÀI LIỆU]';
const NUM = '(\\d[\\d.,]*)';

/** Read min/max from the constraint cell. @returns {{min:number|null, max:number|null, kind:'length'|'numeric'|'unknown'}} */
function parseConstraint(constraint, type = '') {
  const c = S.stripMd(constraint).toLowerCase();
  const num = (s) => (s == null ? null : parseNumber(s.replace(/[.,]$/, '')));
  let min = null;
  let max = null;

  const range = c.match(new RegExp(`${NUM}\\s*(?:–|—|-|~|đến|tới|to)\\s*${NUM}`, 'u'));
  if (range) { min = num(range[1]); max = num(range[2]); }
  const lo = c.match(new RegExp(`(?:tối thiểu|ít nhất|min(?:imum)?|≥|>=)\\s*:?\\s*${NUM}`, 'u'));
  const hi = c.match(new RegExp(`(?:tối đa|nhiều nhất|không quá|max(?:imum)?|≤|<=)\\s*:?\\s*${NUM}`, 'u'));
  if (lo && min === null) min = num(lo[1]);
  if (hi && max === null) max = num(hi[1]);

  const t = S.stripMd(type).toLowerCase();
  let kind = 'unknown';
  if (/ký tự|kí tự|chars?\b|độ dài|length/u.test(c)) kind = 'length';
  else if (/số|number|int|decimal|float|tiền|currency|amount/u.test(t)) kind = 'numeric';
  else if (/text|chuỗi|string|văn bản/u.test(t)) kind = 'length';
  return { min, max, kind };
}

/** The boundary points. Each point: {name, value|null, note}. */
function points({ min, max, kind }) {
  const out = [];
  const add = (name, value, note = '') => out.push({ name, value, note });
  const isLen = kind === 'length';
  const ok = (v) => v !== null && (!isLen || v >= 0);

  if (min !== null) {
    if (ok(min - 1)) add('min-1', min - 1, 'dưới giới hạn (không hợp lệ)'); else add('min-1', null, 'không tồn tại (độ dài < 0)');
    add('min', min, 'hợp lệ');
    if (max === null || min + 1 <= max) add('min+1', min + 1, 'hợp lệ');
  } else {
    ['min-1', 'min', 'min+1'].forEach((n) => add(n, null, `${LABEL} — nguồn không nêu giới hạn dưới, cần MR`));
  }
  if (min !== null && max !== null) add('giữa', Math.floor((min + max) / 2), 'hợp lệ, = floor((min+max)/2)');
  else add('giữa', null, `${LABEL} — cần cả min và max`);
  if (max !== null) {
    if (min === null || max - 1 >= min) add('max-1', max - 1, 'hợp lệ');
    add('max', max, 'hợp lệ');
    add('max+1', max + 1, 'trên giới hạn (không hợp lệ)');
  } else {
    ['max-1', 'max', 'max+1'].forEach((n) => add(n, null, `${LABEL} — nguồn không nêu giới hạn trên, cần MR`));
  }
  if (isLen) {
    add('rỗng', 0, 'chuỗi rỗng — hợp lệ hay không do FD "Bắt buộc"');
    if (min === null || min > 1) add('1 ký tự', 1, 'một ký tự');
  }
  // Drop duplicate values (e.g. min+1 = max) but keep the first label.
  const seen = new Set();
  return out.filter((p) => { if (p.value === null) return true; if (seen.has(p.value)) return false; seen.add(p.value); return true; });
}

function describeValue(value, kind) {
  if (value === null) return LABEL;
  return kind === 'length' ? `chuỗi ${value} ký tự (ký tự lặp "a" × ${value})` : String(value);
}

function compute(slug, only) {
  const p = path.join(taskDir(slug), '01_requirement_risk_summary.md');
  if (!fs.existsSync(p)) throw new Error(`OUTPUT/${slug}/01_requirement_risk_summary.md not found`);
  const text = fs.readFileSync(p, 'utf-8');
  const sec = S.sectionAt(text, '3b');
  const result = [];
  if (!sec) return result;
  for (const t of S.parseTables(sec.body, sec.offset)) {
    if (S.col(t, 'id') === -1 || S.col(t, 'constraint') === -1) continue;
    for (const r of t.rows) {
      const id = S.canonicalId(r.cells[S.col(t, 'id')], 'FD');
      if (!id || (only && id !== only)) continue;
      const constraint = S.cell(t, r, 'constraint');
      const parsed = parseConstraint(constraint, S.cell(t, r, 'type'));
      result.push({
        id,
        field: S.stripMd(S.cell(t, r, 'field')),
        constraint: S.stripMd(constraint),
        ...parsed,
        points: points(parsed).map((pt) => ({ ...pt, display: describeValue(pt.value, parsed.kind) })),
      });
    }
  }
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const pos = args.filter((a) => !a.startsWith('-'));
  const [slug, only] = pos;
  if (!slug) { console.error('Usage: boundary.js <slug> [FD-xx] [--json]'); process.exit(1); }
  let res;
  try { res = compute(slug, only ? only.toUpperCase() : null); } catch (e) { console.error(e.message); process.exit(1); }
  if (args.includes('--json')) { console.log(JSON.stringify(res, null, 2)); return; }
  if (res.length === 0) { console.log(`No FD${only ? ` named ${only}` : ''} in 01 §3b.`); return; }
  console.log(`\nBoundary points · task [ ${slug} ] — computed from the constraints in 01 §3b; the agent copies, never computes\n`);
  for (const f of res) {
    console.log(`${f.id} · ${f.field}  (constraint: "${f.constraint}"; detected kind: ${f.kind}; min=${f.min ?? '—'} max=${f.max ?? '—'})`);
    if (f.min === null && f.max === null) console.log(`   ${LABEL}: the constraint states no min/max ⇒ no boundary series built, let Stage 2 ask (MR).`);
    for (const pt of f.points) console.log(`   ${pt.name.padEnd(7)} ${pt.display}${pt.note ? `   — ${pt.note}` : ''}`);
    console.log('');
  }
}

if (require.main === module) main();

module.exports = { parseConstraint, points, compute };
