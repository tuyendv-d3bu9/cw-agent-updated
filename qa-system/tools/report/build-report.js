#!/usr/bin/env node
/**
 * build-report.js — Render OUTPUT/<slug>/ into one self-contained HTML report.
 *
 *   npm run report -- <feature-slug> [--out <file>] [--generated-at <text>] [--dir <task-dir>]
 *
 * Read-only on the artifacts: the only file written is the report (default OUTPUT/<slug>/report.html).
 * Deterministic: the same inputs give byte-identical HTML (no timestamp unless --generated-at is passed).
 * Missing stages are reported as "not produced" — nothing is invented.
 *
 *   buildReport({ dir, slug, outFile, generatedAt }) -> { html, sections, found, missing }
 */

const fs = require('fs');
const path = require('path');
const { taskDir } = require('../lib/paths');
const { readMeta, idsIn, parseTestCases } = require('../lib/schema');
const { escapeHtml, renderMarkdown, renderReport, slugId } = require('./html-report');

const read = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };
const readJson = (f) => { const t = read(f); if (t == null) return null; try { return JSON.parse(t.replace(/^﻿/, '')); } catch { return undefined; } };
const sortedList = (d, re) => { try { return fs.readdirSync(d).filter((n) => re.test(n)).sort(); } catch { return []; } };

const mdTable = (headers, rows) => {
  const cell = (v) => escapeHtml(v);
  return `<div class="tbl"><table><thead><tr>${headers.map((h) => `<th>${cell(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c && c.html ? c.html : cell(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
};

/** JSON -> flat [path, value] rows. Arrays of objects are summarised, not expanded. */
function flatten(value, prefix, rows, depth = 0) {
  if (Array.isArray(value)) {
    if (value.every((v) => v === null || typeof v !== 'object')) rows.push([prefix, value.join(', ')]);
    else rows.push([prefix, `${value.length} item(s)`]);
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      if (depth > 5) rows.push([`${prefix}.${k}`, '(nested)']);
      else flatten(value[k], prefix ? `${prefix}.${k}` : k, rows, depth + 1);
    }
  } else rows.push([prefix, value === null ? 'null' : String(value)]);
  return rows;
}

function jsonSummary(data) {
  if (data === undefined) return '<p>File is not valid JSON; shown as not parsed.</p>';
  if (Array.isArray(data) && data.length && data.every((x) => x && typeof x === 'object' && !Array.isArray(x))) {
    const keys = [...new Set(data.flatMap((x) => Object.keys(x)))];
    return `<p>${data.length} record(s).</p>` + mdTable(keys, data.map((x) => keys.map((k) => (x[k] == null ? '' : typeof x[k] === 'object' ? JSON.stringify(x[k]) : String(x[k])))));
  }
  const rows = flatten(data, '', []);
  const CAP = 400;
  const note = rows.length > CAP ? `<p>Showing first ${CAP} of ${rows.length} rows.</p>` : '';
  return mdTable(['Field', 'Value'], rows.slice(0, CAP).map(([k, v]) => [{ html: `<code>${escapeHtml(k)}</code>` }, v])) + note;
}

function gateLogHtml(text) {
  const rows = [];
  for (const l of text.split('\n')) {
    if (!l.trim()) continue;
    try {
      const e = JSON.parse(l);
      rows.push([e.at || '', e.event || '', Array.isArray(e.reasons) ? e.reasons.join(' | ') : '']);
    } catch { rows.push(['', '(unparsed line)', l]); }
  }
  return `<p>${rows.length} gate event(s).</p>` + mdTable(['At', 'Event', 'Reasons'], rows);
}

function buildReport({ dir, slug, outFile, generatedAt } = {}) {
  const outDir = path.dirname(outFile || path.join(dir, 'report.html'));
  const rel = (f) => path.relative(outDir, f).split(path.sep).map(encodeURIComponent).join('/');
  const link = (f) => ({ html: `<a href="${escapeHtml(rel(f))}">${escapeHtml(path.relative(dir, f).split(path.sep).join('/'))}</a>` });
  const at = (...p) => path.join(dir, ...p);

  const stageMd = sortedList(dir, /^\d\d_.*\.md$/);
  const byNum = (n) => stageMd.filter((f) => f.startsWith(`${n}_`));
  const blueprintFile = at('05_test_blueprint.json');
  const hasBlueprint = fs.existsSync(blueprintFile);
  const batchFiles = sortedList(at('testcases'), /\.md$/).map((n) => at('testcases', n));
  const metricsFile = at('15_readiness_metrics.json');
  const hasMetrics = fs.existsSync(metricsFile);
  const gateFile = at('_gate.log');
  const runFiles = sortedList(at('runs'), /./).map((d) => at('runs', d, 'run_result.md')).filter((f) => fs.existsSync(f));

  // ── Stage presence ──
  const CORE = [['00', 'Plan'], ['01', 'Requirement & risk summary'], ['02', 'Missing-rule report'], ['03', 'Viewpoint report'], ['04', 'Test idea report'], ['05', 'Test case spec'], ['06', 'Coverage review']];
  const stageRows = [];
  const missing = [];
  const found = [];
  for (const [n, name] of CORE) {
    const files = byNum(n).map((f) => at(f));
    if (n === '05') { if (hasBlueprint) files.push(blueprintFile); files.push(...batchFiles); }
    if (files.length) { found.push(n); stageRows.push([n, name, 'produced', { html: files.map((f) => link(f).html).join('<br>') }]); }
    else { missing.push(n); stageRows.push([n, name, 'not produced', '']); }
  }
  const optRows = [['15', 'Readiness', [...byNum('15').map((f) => at(f)), ...(hasMetrics ? [metricsFile] : [])]], ['16', 'CR impact analysis', byNum('16').map((f) => at(f))]];
  for (const [n, name, files] of optRows) {
    stageRows.push([`${n} (optional)`, name, files.length ? 'produced' : 'not produced', { html: files.map((f) => link(f).html).join('<br>') }]);
    if (files.length) found.push(n); else missing.push(n);
  }
  for (const f of stageMd) {
    const n = f.slice(0, 2);
    if (!['00', '01', '02', '03', '04', '05', '06', '15', '16'].includes(n)) stageRows.push([`${n} (extra)`, f, 'produced', { html: link(at(f)).html }]);
  }
  stageRows.push(['—', 'ASK gate log', fs.existsSync(gateFile) ? 'present' : 'not produced', fs.existsSync(gateFile) ? link(gateFile) : '']);
  stageRows.push(['—', 'Run results', runFiles.length ? `${runFiles.length} run(s)` : 'not produced', { html: runFiles.map((f) => link(f).html).join('<br>') }]);

  // ── Verdicts as found ──
  const verdictRows = stageMd.map((f) => {
    const m = readMeta(read(at(f)) || '');
    return [f, m ? m.verdict : 'not found', m && m.owner ? m.owner : ''];
  });

  // ── Counts computed from files ──
  const countRows = [];
  const idCount = (label, num, fam) => {
    for (const f of byNum(num)) {
      const ids = idsIn(read(at(f)) || '', [fam]);
      countRows.push([label, String(ids.length), { html: `${link(at(f)).html}${ids.length ? ` <small>(${escapeHtml(ids[0])} … ${escapeHtml(ids[ids.length - 1])})</small>` : ''}` }]);
    }
  };
  idCount('BR ids mentioned', '01', 'BR');
  idCount('FD ids mentioned', '01', 'FD');
  idCount('MR ids mentioned', '02', 'MR');
  idCount('VP ids mentioned', '03', 'VP');
  idCount('TI ids mentioned', '04', 'TI');
  const tcIds = new Set();
  for (const f of byNum('05').filter((x) => x.endsWith('.md'))) {
    const ids = parseTestCases(read(at(f)) || '').cases.map((c) => c.id);
    ids.forEach((x) => tcIds.add(x));
    countRows.push(['Test cases in spec', String(ids.length), link(at(f))]);
  }
  for (const f of batchFiles) {
    const ids = parseTestCases(read(f) || '').cases.map((c) => c.id);
    ids.forEach((x) => tcIds.add(x));
    countRows.push(['Test cases in batch', String(ids.length), link(f)]);
  }
  const blueprint = hasBlueprint ? readJson(blueprintFile) : null;
  if (Array.isArray(blueprint)) {
    countRows.push(['Test cases in blueprint', String(blueprint.length), link(blueprintFile)]);
    const prio = {};
    for (const b of blueprint) { const p = String(b.priority || 'unset').replace(/\s*\[.*?\]\s*$/, ''); prio[p] = (prio[p] || 0) + 1; }
    for (const p of Object.keys(prio).sort()) countRows.push([`Blueprint priority: ${p}`, String(prio[p]), link(blueprintFile)]);
  }
  if (tcIds.size) countRows.push(['Distinct test case ids (spec + batches)', String(tcIds.size), '']);
  if (!countRows.length) countRows.push(['(nothing countable)', '—', 'no deliverable with countable content was produced']);

  const overview = [
    '<h3>Stages</h3>', mdTable(['#', 'Stage', 'Status', 'File(s)'], stageRows),
    '<h3>Verdict line per deliverable</h3>',
    verdictRows.length ? mdTable(['File', 'Verdict', 'Owner'], verdictRows) : '<p>No deliverable markdown found.</p>',
    '<h3>Counts (computed from the files)</h3>', mdTable(['Metric', 'Count', 'Source'], countRows),
  ].join('\n');

  // ── Sections ──
  const sections = [{ id: 'overview', title: 'Overview', html: overview }];
  const used = new Set();
  const add = (f, title, html) => {
    let id = slugId(path.basename(f, path.extname(f)));
    while (used.has(id)) id += '-x';
    used.add(id);
    sections.push({ id, title, html });
  };
  const evidence = [];
  for (const f of stageMd) {
    const file = at(f);
    evidence.push(file);
    add(file, f, renderMarkdown(read(file) || ''));
  }
  if (hasBlueprint) {
    evidence.push(blueprintFile);
    add(blueprintFile, '05_test_blueprint.json', jsonSummary(blueprint));
  }
  for (const f of batchFiles) { evidence.push(f); add(f, `testcases/${path.basename(f)}`, renderMarkdown(read(f) || '')); }
  if (hasMetrics) { evidence.push(metricsFile); add(metricsFile, '15_readiness_metrics.json', jsonSummary(readJson(metricsFile))); }
  if (fs.existsSync(gateFile)) { evidence.push(gateFile); add(gateFile, '_gate.log', gateLogHtml(read(gateFile) || '')); }
  for (const f of runFiles) { evidence.push(f); add(f, path.relative(dir, f).split(path.sep).join('/'), renderMarkdown(read(f) || '')); }

  sections.push({
    id: 'evidence',
    title: 'Evidence & sources',
    html: evidence.length
      ? `<p>${evidence.length} source file(s) read; none were modified.</p><ul>${evidence.map((f) => `<li>${link(f).html}</li>`).join('')}</ul>`
      : '<p>No source files found.</p>',
  });

  const meta = [['Feature', slug || path.basename(dir)], ['Stages produced', found.length ? found.join(', ') : 'none'], ['Stages not produced', missing.length ? missing.join(', ') : 'none']];
  if (generatedAt) meta.push(['Generated at', generatedAt]);
  const html = renderReport({ title: `QA report — ${slug || path.basename(dir)}`, sections, meta });
  return { html, sections: sections.map((s) => s.title), found, missing };
}

function main(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (['--out', '--generated-at', '--dir'].includes(a)) args[a.slice(2)] = argv[++i];
    else args._.push(a);
  }
  const slug = args._[0];
  if (!slug && !args.dir) {
    console.error('Usage: npm run report -- <feature-slug> [--out <file>] [--generated-at <text>]');
    return 2;
  }
  const dir = path.resolve(args.dir || taskDir(slug));
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error(`Task folder not found: ${dir}`);
    return 2;
  }
  const outFile = path.resolve(args.out || path.join(dir, 'report.html'));
  const r = buildReport({ dir, slug: slug || path.basename(dir), outFile, generatedAt: args['generated-at'] });
  fs.writeFileSync(outFile, r.html);
  console.log(`Report written: ${outFile}`);
  console.log(`Sections: ${r.sections.join(' | ')}`);
  if (r.missing.length) console.log(`Not produced: ${r.missing.join(', ')}`);
  return 0;
}

if (require.main === module) process.exit(main(process.argv.slice(2)));

module.exports = { buildReport, main, jsonSummary };
