/**
 * render.js — Views generated ONLY from result JSON (plan §3.3, D8).
 *
 *   renderHtml(result) → self-contained HTML (no external resources, every value escaped)
 *   renderCsv(results) → summary.csv text, sorted by student_id, empty cell for null
 *
 * `null` is rendered as "pending" in HTML and as an empty cell in CSV — never 0.
 */

const TEMPLATE_VERSION = '1.0.0';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const pts = (v) => (v === null || v === undefined ? '<span class="pending">pending</span>' : esc(v));
const bool = (v) => (v === null || v === undefined ? '<span class="pending">pending</span>' : v ? 'yes' : '<b>no</b>');

function renderHtml(r) {
  const rows = [];
  for (const [id, cr] of Object.entries(r.automated.criteria)) {
    rows.push(`<tr class="crit"><th>${esc(id)}</th><td>${pts(cr.points)} / ${esc(cr.max)}</td><td colspan="2"></td></tr>`);
    for (const c of cr.checks) {
      rows.push(`<tr><td class="cid">${esc(c.id)}</td><td>${pts(c.points)} / ${esc(c.max)}</td><td><span class="st st-${esc(c.state)}">${esc(c.state)}</span></td>` +
        `<td>${esc(c.message)}${c.evidence.length ? `<div class="ev">evidence: ${c.evidence.map(esc).join(', ')}</div>` : ''}</td></tr>`);
    }
  }
  const manual = Object.entries(r.instructor.criteria).map(([id, m]) =>
    `<tr><th>${esc(id)}</th><td>${pts(m.points)} / ${esc(m.max)}</td><td>${m.level === null ? '<span class="pending">pending</span>' : esc(m.level)}</td>` +
    `<td>${m.comment === null ? '' : esc(m.comment)}${m.evidence.length ? `<div class="ev">evidence: ${m.evidence.map(esc).join(', ')}</div>` : ''}</td></tr>`).join('\n');
  const list = (xs, f) => (xs.length ? `<ul>${xs.map((x) => `<li>${f(x)}</li>`).join('')}</ul>` : '<p>none</p>');
  const pf = (x) => `<code>${esc(x.code)}</code> ${esc(x.path || '')} — ${esc(x.message)}${x.fix ? ` <i>(${esc(x.fix)})</i>` : ''}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="cw-exam-grader ${esc(r.grader_version)} / template ${TEMPLATE_VERSION}">
<title>Exam result · ${esc(r.student_id)}</title>
<style>
:root{--fg:#1d2327;--bg:#fff;--mut:#5f6b73;--line:#dde3e7;--ok:#1b7f3b;--bad:#b42318;--warn:#9a6700}
@media (prefers-color-scheme: dark){:root{--fg:#e6e9eb;--bg:#15191c;--mut:#9aa6ad;--line:#2c3439;--ok:#5cc27e;--bad:#ff7b72;--warn:#e3b341}}
body{font:15px/1.5 system-ui,sans-serif;color:var(--fg);background:var(--bg);max-width:1000px;margin:0 auto;padding:16px}
table{border-collapse:collapse;width:100%;margin:8px 0 20px}th,td{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
.crit th,.crit td{border-top:2px solid var(--line);font-weight:600}.cid{padding-left:20px}.ev{color:var(--mut);font-size:13px}
.pending{color:var(--warn);font-style:italic}.st{font-size:12px;font-weight:600}.st-PASSED{color:var(--ok)}.st-FAILED,.st-NOT_SUBMITTED{color:var(--bad)}.st-PARTIAL,.st-PENDING_HUMAN_REVIEW,.st-NOT_GRADED{color:var(--warn)}
.big{font-size:22px;font-weight:700}code{font-size:13px}dl{display:grid;grid-template-columns:max-content 1fr;gap:2px 16px}dt{color:var(--mut)}
@media (max-width:600px){td,th{padding:4px}}
</style></head><body>
<h1>Exam result · ${esc(r.student_id)}</h1>
<p class="big">Status: ${esc(r.status)} · Total: ${pts(r.total.score)} / ${esc(r.total.max)}</p>
<dl>
<dt>Exam</dt><dd>${esc(r.exam_id)} (rubric ${esc(r.rubric_version)}, grader ${esc(r.grader_version)})</dd>
<dt>Branch</dt><dd>${r.branch === null ? '—' : esc(r.branch)}</dd>
<dt>Graded commit</dt><dd><code>${r.submission_sha === null ? '—' : esc(r.submission_sha)}</code></dd>
<dt>Starter commit</dt><dd><code>${esc(r.starter_commit)}</code></dd>
<dt>Graded at</dt><dd>${esc(r.graded_at)}</dd>
<dt>Override</dt><dd>${r.override ? esc(`${r.override.old_sha} → ${r.override.new_sha} approved by ${r.override.approver}: ${r.override.reason}`) : 'none'}</dd>
<dt>Automated</dt><dd>${pts(r.automated.score)} / ${esc(r.automated.max)} (${esc(r.automated.status)})</dd>
<dt>Instructor</dt><dd>${pts(r.instructor.score)} / ${esc(r.instructor.max)} (${esc(r.instructor.status)}${r.instructor.reviewer ? `, ${esc(r.instructor.reviewer)}` : ''})</dd>
</dl>
<h2>Pass conditions</h2>
<table><tr><th>Total ≥ 60</th><td>${bool(r.pass_conditions.total_ge_60)}</td></tr><tr><th>Pipeline minimum</th><td>${bool(r.pass_conditions.pipeline_minimum)}</td></tr><tr><th>Defense (I3) ≥ 4</th><td>${bool(r.pass_conditions.defense_ge_4)}</td></tr></table>
<h2>Preflight: ${esc(r.preflight.status)}</h2>
<h3>Blocking</h3>${list(r.preflight.blocking, pf)}
<h3>Gaps (graded with partial credit)</h3>${list(r.preflight.gradable, pf)}
<h3>Warnings</h3>${list(r.preflight.warnings, pf)}
<h2>Automated criteria</h2>
<table><tr><th>Check</th><th>Points</th><th>State</th><th>Message</th></tr>
${rows.join('\n')}
</table>
<h2>Instructor criteria</h2>
<table><tr><th>Criterion</th><th>Points</th><th>Level</th><th>Comment</th></tr>
${manual}
</table>
<h2>Integrity flags</h2>${list(r.integrity_flags, (f) => `<code>${esc(f.code)}</code> ${esc(f.path || '')} — ${esc(f.detail || '')} (${esc(f.state || 'open')})`)}
<h2>Missing requirements</h2>${list(r.missing_requirements, esc)}
<h2>Feedback</h2>${list(r.feedback, (f) => `<b>${esc(f.criterion)}</b>: ${esc(f.text)}`)}
<p class="ev">Evidence root: ${r.evidence_root === null ? '—' : esc(r.evidence_root)}. This page is generated from ${esc(`GRADING/results/${r.student_id}.json`)}; never edit it.</p>
</body></html>
`;
}

const CSV_COLUMNS = ['student_id', 'branch', 'submission_sha', 'status', 'preflight', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'auto_score',
  'I1', 'I2', 'I3', 'instructor_score', 'total', 'pipeline_minimum', 'defense_ge_4', 'integrity_flags', 'graded_at'];

function csvCell(v) {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // spreadsheet formula injection
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function renderCsv(results) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of [...results].sort((a, b) => (a.student_id < b.student_id ? -1 : a.student_id > b.student_id ? 1 : 0))) {
    const a = r.automated.criteria;
    const i = r.instructor.criteria;
    const openFlags = r.integrity_flags.filter((f) => f.state !== 'resolved').map((f) => f.code);
    lines.push([r.student_id, r.branch, r.submission_sha, r.status, r.preflight.status,
      a.A1.points, a.A2.points, a.A3.points, a.A4.points, a.A5.points, a.A6.points, r.automated.score,
      i.I1.points, i.I2.points, i.I3.points, r.instructor.score, r.total.score,
      r.pass_conditions.pipeline_minimum, r.pass_conditions.defense_ge_4, openFlags.join(';'), r.graded_at].map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}

module.exports = { renderHtml, renderCsv, CSV_COLUMNS, esc, TEMPLATE_VERSION };
