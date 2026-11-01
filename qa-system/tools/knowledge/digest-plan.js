#!/usr/bin/env node
/**
 * digest-plan.js — Chia tài liệu của một task thành lô vừa context, chỉ lấy file mới hoặc đã đổi.
 *
 *   listDocs(slug)          Mọi file .md trong INPUT/<slug>/ kèm sha256 và số ký tự.
 *   readStamps(dir)         Tài liệu nào đã được chưng cất, ở lô nào, với hash nào.
 *   plan(docs, stamps, o)   Lô cần chạy + thẻ cũ phải bỏ khi gộp.
 *
 * Nạp 200 tài liệu vào một lượt phân tích thì tràn token, hoặc agent chỉ đọc lướt.
 * Skill `knowledge-digest` chạy từng lô do tool này chia, mỗi tài liệu ra một thẻ có
 * dòng `### DOC: <đường dẫn> · sha256:<12 hex>`. Chính dòng đó là sổ theo dõi: lần
 * sau chỉ tài liệu có hash chưa thấy trong thẻ nào mới phải chạy lại. Không có file
 * sổ riêng để lệch với thẻ thật.
 *
 * Usage:
 *   digest-plan.js <slug> [--budget 60000]   Ghi OUTPUT/<slug>/00_digest_plan.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PATHS, taskDir } = require('../lib/paths');

const DEFAULT_BUDGET = 60000; // ký tự mỗi lô, cỡ 15–20k token
const STAMP = /^###\s+DOC:\s+(\S+)\s+·\s+sha256:([0-9a-f]{12})/;

const rel = (p) => path.relative(PATHS.ROOT, p).split(path.sep).join('/');

function listDocs(slug) {
  const root = path.join(PATHS.INPUT, slug);
  if (!fs.existsSync(root)) throw new Error(`Không có INPUT/${slug}/`);

  const docs = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md') && e.name !== 'README.md') {
        const text = fs.readFileSync(p, 'utf-8');
        const sha = crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
        docs.push({ path: rel(p), sha, chars: text.length });
      }
    }
  })(root);
  return docs.sort((a, b) => a.path.localeCompare(b.path));
}

/** path → { sha, batch } của lần chưng cất gần nhất (lô số lớn hơn thắng). */
function readStamps(digestDir) {
  const stamps = new Map();
  if (!fs.existsSync(digestDir)) return { stamps, lastBatch: 0 };

  const files = fs.readdirSync(digestDir).filter((f) => /^batch_\d+\.md$/.test(f)).sort();
  for (const f of files) {
    for (const line of fs.readFileSync(path.join(digestDir, f), 'utf-8').split('\n')) {
      const m = line.match(STAMP);
      if (m) stamps.set(m[1], { sha: m[2], batch: f.replace(/\.md$/, '') });
    }
  }
  const lastBatch = files.length ? parseInt(files[files.length - 1].match(/\d+/)[0], 10) : 0;
  return { stamps, lastBatch };
}

function plan(docs, { stamps, lastBatch }, { budget = DEFAULT_BUDGET } = {}) {
  const todo = [];
  const stale = [];
  let fresh = 0;

  for (const d of docs) {
    const old = stamps.get(d.path);
    if (old && old.sha === d.sha) { fresh++; continue; }
    if (old) stale.push({ path: d.path, batch: old.batch, reason: 'Đã đổi' });
    todo.push({ ...d, note: old ? `Đã đổi (bản cũ ở ${old.batch})` : 'Mới' });
  }

  const present = new Set(docs.map((d) => d.path));
  for (const [p, old] of stamps) {
    if (!present.has(p)) stale.push({ path: p, batch: old.batch, reason: 'Đã gỡ khỏi INPUT' });
  }

  // Xếp tham lam theo ngân sách ký tự. Tài liệu to hơn ngân sách đứng riêng một lô,
  // skill phải tách theo mục thay vì đọc một lượt.
  const batches = [];
  let cur = null;
  for (const d of todo) {
    const over = d.chars > budget;
    if (!cur || over || cur.chars + d.chars > budget) {
      cur = { name: `batch_${String(lastBatch + batches.length + 1).padStart(2, '0')}`, docs: [], chars: 0 };
      batches.push(cur);
    }
    cur.docs.push(over ? { ...d, note: `${d.note} · quá ngân sách, tách theo mục` } : d);
    cur.chars += d.chars;
    if (over) cur = null;
  }

  return { total: docs.length, fresh, todo: todo.length, stale, batches };
}

function render(slug, p, budget) {
  const changed = p.stale.filter((s) => s.reason === 'Đã đổi').length;
  const removed = p.stale.length - changed;
  const out = [
    `# KẾ HOẠCH CHƯNG CẤT TRI THỨC · ${slug}`,
    `Owner: qa-system/tools/knowledge/digest-plan.js · Nguồn: INPUT/${slug}/ · Ngân sách: ${budget} ký tự/lô · Verdict: PASS`,
    '',
    '## 1. Tổng quan',
    '| Chỉ số | Số lượng |',
    '|---|---|',
    `| Tài liệu trong INPUT | ${p.total} |`,
    `| Đã chưng cất, không đổi | ${p.fresh} |`,
    `| Mới | ${p.todo - changed} |`,
    `| Đã đổi | ${changed} |`,
    `| Đã gỡ khỏi INPUT | ${removed} |`,
    `| Số lô phải chạy | ${p.batches.length} |`,
    '',
    '## 2. Các lô cần chạy',
  ];

  if (p.batches.length === 0) out.push('Không có. Mọi tài liệu đã được chưng cất với đúng nội dung hiện tại.');
  for (const b of p.batches) {
    out.push('', `### ${b.name} · ${b.docs.length} tài liệu · ${b.chars} ký tự`,
      '| Tài liệu | sha256 | Ký tự | Ghi chú |', '|---|---|---|---|');
    for (const d of b.docs) out.push(`| \`${d.path}\` | \`${d.sha}\` | ${d.chars} | ${d.note} |`);
  }

  out.push('', '## 3. Thẻ cũ phải bỏ khi gộp');
  if (p.stale.length === 0) out.push('Không có.');
  else {
    out.push('| Tài liệu | Bản cũ ở | Lý do |', '|---|---|---|');
    for (const s of p.stale) out.push(`| \`${s.path}\` | ${s.batch} | ${s.reason} |`);
  }
  return out.join('\n') + '\n';
}

function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith('--'));
  const bi = args.indexOf('--budget');
  const budget = bi !== -1 ? parseInt(args[bi + 1], 10) : DEFAULT_BUDGET;
  if (!slug) {
    console.error('Usage: digest-plan.js <slug> [--budget 60000]');
    process.exit(1);
  }

  const dir = taskDir(slug);
  const p = plan(listDocs(slug), readStamps(path.join(dir, 'knowledge_digest')), { budget });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, '00_digest_plan.md'), render(slug, p, budget), 'utf-8');

  console.log(`[digest] ${slug}: ${p.total} tài liệu · ${p.fresh} không đổi · ${p.todo} cần chạy trong ${p.batches.length} lô · ${p.stale.length} thẻ cũ phải bỏ`);
  console.log(`         → OUTPUT/${slug}/00_digest_plan.md`);
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}

module.exports = { listDocs, readStamps, plan, render, STAMP };
