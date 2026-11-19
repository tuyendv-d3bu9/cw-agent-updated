#!/usr/bin/env node
/**
 * digest-plan.js — Split a task documents into context-sized batches, taking only new or changed files.
 *
 *   listDocs(slug)          Every .md file in INPUT/<slug>/ with sha256 and character count.
 *   readStamps(dir)         Which documents were already digested, in which batch, with which hash.
 *   plan(docs, stamps, o)   Batches to run + old cards to drop when merging.
 *
 * Loading 200 documents into one analysis pass overflows tokens, or the agent only skims.
 * The `knowledge-digest` skill runs each batch this tool splits; each document yields a card with
 * a line `### DOC: <path> · sha256:<12 hex>`. That line is the ledger: next
 * time only documents whose hash appears in no card need re-running. There is no
 * separate ledger file that could drift from the real cards.
 *
 * Usage:
 *   digest-plan.js <slug> [--budget 60000]   Ghi OUTPUT/<slug>/00_digest_plan.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PATHS, taskDir } = require('../lib/paths');

const DEFAULT_BUDGET = 60000; // characters per batch, about 15–20k tokens
const STAMP = /^###\s+DOC:\s+(\S+)\s+·\s+sha256:([0-9a-f]{12})/;

const rel = (p) => path.relative(PATHS.ROOT, p).split(path.sep).join('/');

/**
 * Content used for HASHING: drops the metadata block (the old TRACEABILITY_METADATA has `Modified:` = mtime,
 * SOURCE_METADATA has a modified date) — touching a file without changing the text must not change the sha.
 */
function hashableText(text) {
  return String(text)
    .replace(/<!-- (?:SOURCE_METADATA|TRACEABILITY_METADATA)[\s\S]*?-->\s*/g, '')
    .replace(/\r\n/g, '\n');
}

/** Characters counted toward the budget: base64 images (data: URI) and image placeholders cost no reading context. */
function budgetChars(text) {
  return hashableText(text)
    .replace(/!\[[^\]]*\]\(data:[^)]*\)/g, '')
    .replace(/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi, '')
    .replace(/\[IMAGE:[^\]]*\]/g, '')
    .length;
}

/**
 * Cut an over-budget document into parts by heading — never cutting in the middle of a table
 * or code block. A section still over budget is cut further at a blank line outside a table; a single
 * over-budget table is kept whole (that part exceeds the budget, noted explicitly).
 * @returns [{ from, to, heading, chars }] (1-based lines, both ends inclusive)
 */
function splitByHeading(text, budget) {
  const lines = String(text).split('\n');
  const cuts = new Set([0]); // line indexes where a new part may start
  const softCuts = new Set();
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*(```|~~~)/.test(l)) inFence = !inFence;
    if (inFence) continue;
    const inTable = (j) => j >= 0 && j < lines.length && /^\s*\|/.test(lines[j]);
    if (/^#{1,6}\s/.test(l)) cuts.add(i);
    else if (l.trim() === '' && !inTable(i - 1) && !inTable(i + 1) && i + 1 < lines.length) softCuts.add(i + 1);
  }
  const len = (a, b) => budgetChars(lines.slice(a, b).join('\n'));
  const starts = [...cuts].sort((a, b) => a - b);
  // Sections by heading
  let sections = starts.map((s, k) => [s, k + 1 < starts.length ? starts[k + 1] : lines.length]);
  // Section over budget → cut at a blank line outside a table
  sections = sections.flatMap(([a, b]) => {
    if (len(a, b) <= budget) return [[a, b]];
    const pts = [a, ...[...softCuts].filter((x) => x > a && x < b).sort((x, y) => x - y), b];
    const out = [];
    let cur = a;
    for (let k = 1; k < pts.length; k++) {
      if (len(cur, pts[k]) > budget && pts[k - 1] > cur) { out.push([cur, pts[k - 1]]); cur = pts[k - 1]; }
    }
    out.push([cur, b]);
    return out;
  });
  // Greedily merge adjacent sections to fit the budget
  const parts = [];
  for (const [a, b] of sections) {
    const last = parts[parts.length - 1];
    if (last && len(last[0], b) <= budget) last[1] = b;
    else parts.push([a, b]);
  }
  return parts.map(([a, b]) => {
    const h = lines.slice(a, b).find((l) => /^#{1,6}\s/.test(l));
    return { from: a + 1, to: b, heading: h ? h.replace(/^#+\s*/, '').trim().slice(0, 60) : '', chars: len(a, b) };
  });
}

function listDocs(slug) {
  const root = path.join(PATHS.INPUT, slug);
  if (!fs.existsSync(root)) throw new Error(`INPUT/${slug}/ not found`);

  const docs = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== '_superseded') walk(p); } // replaced old version — not digested
      else if (e.name.endsWith('.md') && e.name !== 'README.md') {
        const text = fs.readFileSync(p, 'utf-8');
        const sha = crypto.createHash('sha256').update(hashableText(text)).digest('hex').slice(0, 12);
        docs.push({ path: rel(p), sha, chars: budgetChars(text), text });
      }
    }
  })(root);
  return docs.sort((a, b) => a.path.localeCompare(b.path));
}

/** path → { sha, batch } of the latest digest (the higher batch number wins). */
function readStamps(digestDir) {
  const stamps = new Map();
  if (!fs.existsSync(digestDir)) return { stamps, lastBatch: 0 };

  // Sort by NUMBER: a text sort puts batch_100 before batch_99 → a new batch gets its cards overwritten by an old one and
  // lastBatch is miscalculated, the next batch overwrites batch_100.
  const num = (f) => parseInt(f.match(/\d+/)[0], 10);
  const files = fs.readdirSync(digestDir).filter((f) => /^batch_\d+\.md$/.test(f)).sort((a, b) => num(a) - num(b));
  for (const f of files) {
    for (const line of fs.readFileSync(path.join(digestDir, f), 'utf-8').split('\n')) {
      const m = line.match(STAMP);
      if (m) stamps.set(m[1], { sha: m[2], batch: f.replace(/\.md$/, '') });
    }
  }
  const lastBatch = files.length ? num(files[files.length - 1]) : 0;
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

  // A document larger than the budget: the TOOL cuts it by heading (never mid-table), each part is one
  // entry in the batch with explicit from–to lines. Never left to the LLM to cut.
  const units = [];
  for (const d of todo) {
    const { text, ...doc } = d;
    if (d.chars > budget && text !== undefined) {
      const parts = splitByHeading(text, budget);
      if (parts.length === 1) {
        units.push({ ...doc, note: `${doc.note} · quá ngân sách nhưng không có heading/chỗ cắt an toàn ngoài bảng — đọc trọn một lượt` });
        continue;
      }
      parts.forEach((pt, k) => units.push({
        ...doc,
        chars: pt.chars,
        part: { index: k + 1, total: parts.length, from: pt.from, to: pt.to, heading: pt.heading },
        note: `${doc.note} · phần ${k + 1}/${parts.length}: dòng ${pt.from}–${pt.to}${pt.heading ? ` (§ ${pt.heading})` : ''}${pt.chars > budget ? ' · một bảng/mục liền vượt ngân sách, đọc trọn' : ''}`,
      }));
    } else {
      units.push(d.chars > budget ? { ...doc, note: `${doc.note} · quá ngân sách, tách theo mục` } : doc);
    }
  }

  const batches = [];
  let cur = null;
  for (const u of units) {
    if (!cur || cur.chars + u.chars > budget) {
      cur = { name: `batch_${String(lastBatch + batches.length + 1).padStart(2, '0')}`, docs: [], chars: 0 };
      batches.push(cur);
    }
    cur.docs.push(u);
    cur.chars += u.chars;
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

  console.log(`[digest] ${slug}: ${p.total} documents · ${p.fresh} unchanged · ${p.todo} to run in ${p.batches.length} batch(es) · ${p.stale.length} old card(s) to drop`);
  console.log(`         → OUTPUT/${slug}/00_digest_plan.md`);
}

if (require.main === module) {
  try { main(); } catch (e) { console.error(`❌ ${e.message}`); process.exit(1); }
}

module.exports = { listDocs, readStamps, plan, render, splitByHeading, budgetChars, hashableText, STAMP };
