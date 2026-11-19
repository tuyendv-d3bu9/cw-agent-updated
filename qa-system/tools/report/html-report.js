/**
 * html-report.js — Dependency-free, self-contained HTML report rendering.
 *
 *   escapeHtml(s)        Escapes & < > " ' — the only way content enters HTML here.
 *   safeUrl(u)           Returns the URL if http(s) or relative, else null (javascript:, data:, ...).
 *   renderInline(s)      Inline markdown subset (code, bold, italic, links), escaped.
 *   renderMarkdown(md)   Safe markdown subset -> HTML fragment. Raw HTML is shown as text.
 *   renderReport(opts)   { title, sections:[{id,title,html}], meta } -> full HTML document string.
 *
 * Pure functions, no I/O, no dependency on any other tool: reusable by any report generator.
 * The document has no scripts, no external resources and a strict CSP meta.
 */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

const CTRL = /[\u0000- \u007f-\u009f]/g;

/** http(s) and scheme-less relative URLs only. Control chars/whitespace are removed first. */
function safeUrl(u) {
  // Browsers ignore tabs/newlines/control chars inside a scheme ("java\tscript:"), so test the stripped form.
  const probe = String(u == null ? '' : u).replace(CTRL, '');
  if (!probe) return null;
  if (/^https?:\/\//i.test(probe)) return probe;
  if (/^[a-z][a-z0-9+.-]*:/i.test(probe)) return null; // any other scheme
  if (probe.startsWith('//') || probe.startsWith('\\')) return null; // protocol-relative
  return probe;
}

const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/** Inline markdown on raw text: everything is escaped first; markup is then applied to the escaped text. */
function renderInline(text) {
  const codes = [];
  let s = escapeHtml(text).replace(/`([^`\n]+)`/g, (_, c) => {
    codes.push(`<code>${c}</code>`);
    return `\u0001${codes.length - 1}\u0001`;
  });
  s = s.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const ok = safeUrl(unescapeHtml(url));
    if (!ok) return label;
    const ext = /^https?:/i.test(ok) ? ' rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(ok)}"${ext}>${label}</a>`;
  });
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
  return s.replace(/\u0001(\d+)\u0001/g, (_, i) => codes[Number(i)]);
}

const splitRow = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
const isSep = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l) && l.includes('|');
const isTableStart = (lines, i) => lines[i].includes('|') && i + 1 < lines.length && isSep(lines[i + 1]);
const LI = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;

/** Safe markdown subset -> HTML fragment. */
function renderMarkdown(md) {
  const lines = String(md == null ? '' : md).replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const blank = (l) => !l.trim();

  while (i < lines.length) {
    const line = lines[i];
    if (blank(line)) { i++; continue; }

    const fence = line.match(/^\s*(```+|~~~+)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      out.push(`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`);
      continue;
    }

    const h = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) { out.push(`<h${h[1].length}>${renderInline(h[2])}</h${h[1].length}>`); i++; continue; }

    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    if (isTableStart(lines, i)) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      const th = head.map((c) => `<th>${renderInline(c)}</th>`).join('');
      const tr = rows.map((r) => `<tr>${head.map((_, k) => `<td>${renderInline(r[k] == null ? '' : r[k])}</td>`).join('')}</tr>`).join('');
      out.push(`<div class="tbl"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`);
      continue;
    }

    if (/^\s{0,3}>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s{0,3}>/.test(lines[i])) body.push(lines[i++].replace(/^\s{0,3}>\s?/, ''));
      out.push(`<blockquote>${renderMarkdown(body.join('\n'))}</blockquote>`);
      continue;
    }

    const li = line.match(LI);
    if (li) {
      const base = li[1].length;
      const ordered = /\d/.test(li[2]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(LI);
        if (m && m[1].length <= base + 1) {
          items.push({ text: m[3], sub: [] });
          i++;
        } else if (items.length && (m || (!blank(lines[i]) && /^\s+\S/.test(lines[i])))) {
          items[items.length - 1].sub.push(lines[i++]); // nested item or continuation
        } else break;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.map((it) => {
        const sub = it.sub.length ? renderMarkdown(it.sub.map((l) => l.replace(/^\s{1,4}/, '')).join('\n')) : '';
        return `<li>${renderInline(it.text)}${sub}</li>`;
      }).join('')}</${tag}>`);
      continue;
    }

    const para = [];
    while (i < lines.length && !blank(lines[i]) && !/^\s*(```|~~~)/.test(lines[i]) && !/^\s{0,3}(#{1,6}\s|>)/.test(lines[i]) && !isTableStart(lines, i) && !LI.test(lines[i])) {
      para.push(lines[i++].trim());
    }
    if (!para.length) para.push(lines[i++].trim());
    out.push(`<p>${para.map(renderInline).join('<br>')}</p>`);
  }
  return out.join('\n');
}

const slugId = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'section';

const CSS = `
:root{--bg:#fff;--fg:#1c2330;--muted:#5b6678;--line:#dde2ea;--card:#f6f8fb;--accent:#1f5fbf;--code:#eef1f6;--ok:#157347;--warn:#a15c00;--bad:#b42318}
@media (prefers-color-scheme:dark){:root{--bg:#12161d;--fg:#e4e8ef;--muted:#9aa5b8;--line:#2b3340;--card:#1a2029;--accent:#6ea8ff;--code:#222a36;--ok:#4cc38a;--warn:#e0a040;--bad:#ff7b72}}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.layout{display:flex;gap:2rem;max-width:1280px;margin:0 auto;padding:1rem 16px 4rem}
nav.toc{position:sticky;top:1rem;align-self:flex-start;flex:0 0 240px;max-height:calc(100vh - 2rem);overflow:auto;font-size:.85rem;border-right:1px solid var(--line);padding-right:1rem}
nav.toc strong{display:block;margin-bottom:.5rem;color:var(--muted);text-transform:uppercase;font-size:.7rem;letter-spacing:.06em}
nav.toc ol{list-style:none;margin:0;padding:0}
nav.toc a{display:block;padding:.25rem 0;color:var(--fg);text-decoration:none}
nav.toc a:hover{color:var(--accent)}
main{flex:1;min-width:0}
header.top{border-bottom:1px solid var(--line);margin-bottom:1.5rem;padding-bottom:1rem}
header.top h1{margin:.2rem 0 .6rem;font-size:1.7rem}
dl.meta{display:grid;grid-template-columns:max-content 1fr;gap:.2rem 1rem;margin:0;color:var(--muted);font-size:.85rem}
dl.meta dt{font-weight:600}dl.meta dd{margin:0;overflow-wrap:anywhere}
section.sec{margin:0 0 2.5rem;scroll-margin-top:1rem}
section.sec>h2{font-size:1.35rem;border-bottom:2px solid var(--line);padding-bottom:.3rem}
h3,h4,h5,h6{margin:1.4rem 0 .5rem}
a{color:var(--accent)}
code{background:var(--code);padding:.1em .35em;border-radius:4px;font:.88em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
pre{background:var(--code);padding:.8rem 1rem;border-radius:6px;overflow:auto;border:1px solid var(--line)}
pre code{background:none;padding:0}
blockquote{margin:1rem 0;padding:.2rem 1rem;border-left:4px solid var(--accent);background:var(--card);color:var(--muted)}
.tbl{overflow-x:auto;margin:1rem 0}
table{border-collapse:collapse;width:100%;font-size:.88rem}
th,td{border:1px solid var(--line);padding:.4rem .6rem;text-align:left;vertical-align:top}
th{background:var(--card)}
tbody tr:nth-child(even){background:var(--card)}
footer{color:var(--muted);font-size:.8rem;border-top:1px solid var(--line);padding-top:1rem}
@media (max-width:820px){.layout{flex-direction:column;gap:1rem}nav.toc{position:static;flex:none;max-height:none;border-right:0;border-bottom:1px solid var(--line);padding:0 0 .8rem}}
@media print{nav.toc{display:none}.layout{display:block;max-width:none;padding:0}body{font-size:11pt}h2,h3{break-after:avoid}pre,table,blockquote{break-inside:avoid}a{color:inherit;text-decoration:none}:root{--bg:#fff;--fg:#000;--muted:#333;--line:#bbb;--card:#f2f2f2;--code:#f2f2f2}}
`.trim();

/**
 * renderReport({ title, sections:[{id,title,html}], meta, footer }) -> full HTML string.
 * Section `html` is trusted HTML from renderMarkdown or the caller; title/meta/footer are escaped here.
 * meta: array of [label, value] pairs or a plain object. Deterministic: nothing time-dependent is added.
 */
function renderReport({ title = 'Report', sections = [], meta = [], footer = '' } = {}) {
  const pairs = Array.isArray(meta) ? meta : Object.entries(meta || {});
  const used = new Set();
  const secs = sections.map((s) => {
    const base = slugId(s.id || s.title);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return { id, title: s.title, html: s.html || '' };
  });
  const toc = secs.map((s) => `<li><a href="#${escapeHtml(s.id)}">${escapeHtml(s.title)}</a></li>`).join('');
  const metaHtml = pairs.length
    ? `<dl class="meta">${pairs.map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd>`).join('')}</dl>`
    : '';
  const body = secs.map((s) => `<section class="sec" id="${escapeHtml(s.id)}"><h2>${escapeHtml(s.title)}</h2>\n${s.html}\n</section>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>${escapeHtml(title)}</title>
<style>
${CSS}
</style>
</head>
<body>
<div class="layout">
<nav class="toc" aria-label="Table of contents"><strong>Contents</strong><ol>${toc}</ol></nav>
<main>
<header class="top"><h1>${escapeHtml(title)}</h1>${metaHtml}</header>
${body}
${footer ? `<footer>${escapeHtml(footer)}</footer>` : ''}
</main>
</div>
</body>
</html>
`;
}

module.exports = { escapeHtml, safeUrl, renderInline, renderMarkdown, renderReport, slugId };
