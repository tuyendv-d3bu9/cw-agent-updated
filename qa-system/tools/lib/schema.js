/**
 * schema.js — The one parser every tool shares (QA_STANDARD §7, §9).
 *
 * gate, lint, readiness, knowledge:sync, merge, export and ids all read the
 * deliverables through this module. A private regex copy in one tool is how the
 * tools drifted apart before: the gate read `MR-\w+`, sync read `MR-\d+`, lint
 * read `### TC_ID:` only, readiness read the first `Verdict:` anywhere. Change a
 * format here and every tool follows.
 *
 *   readMeta(text)            Meta line (§7): {owner, source, verdict, line} or null.
 *   readVerdict(text)         'PASS' | 'FIX' | 'ASK' | null (null = unreadable ⇒ fail-closed).
 *   ID_FAMILIES, idRegex(f)   ID families of §9.1; canonicalId() strips ** and backticks.
 *   normalizeStatus(s)        §9.3 status incl. Vietnamese synonyms -> New/TREO/Confirmed/Rejected/null.
 *   parseTables(text)         Markdown tables keyed by header name, with aliases.
 *   findSection(text, key)    Body of a heading, matched loosely ("## 7 Câu hỏi" == "## 7. CÂU HỎI").
 *   parseTestCases(text)      Test cases (### TC_ID: X, or a heading whose first token is a TC id).
 *   normText / quoteFound     Normalisation for verbatim-quote matching.
 *   hasLabel / stripLabels / findPlaceholder   §2.1 labels are valid; template leftovers are not.
 *   nextIds(slug)             Next free ID per family over knowledge + OUTPUT/<slug>.
 */

const fs = require('fs');
const path = require('path');
const { PATHS, taskDir, featureKnowledge } = require('./paths');

// ───────────────────────────── Text ─────────────────────────────

const nfc = (s) => String(s == null ? '' : s).normalize('NFC');

/** Removes markdown decoration (bold, italics, code ticks, escapes) and trims. */
function stripMd(s) {
  return nfc(s)
    .replace(/\\([\\`*_{}[\]()#+\-.!|>])/g, '$1')
    .replace(/[*`]/g, '')
    .replace(/(^|\s)_+|_+(\s|$)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Header/heading key: NFC, markdown stripped, lowercase, spaces collapsed. */
function normKey(s) {
  return stripMd(s).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Text normaliser for verbatim-quote matching (FORMAT_PINS "Trích nguyên văn"):
 * NFC, drop markdown `*_\``, typographic quotes to plain, collapse whitespace,
 * case-insensitive.
 */
function normText(s) {
  return nfc(s)
    .replace(/\\([^\s])/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/[“”„«»]/g, '"')
    .replace(/[‘’‚]/g, "'")
    .replace(/[\u00A0\s]+/g, ' ')
    .toLowerCase()
    .trim();
}

/** Comparison key for question text: normText minus trailing punctuation. */
function questionKey(s) {
  return normText(s).replace(/[\s.?!:;,…]+$/g, '').trim();
}

const ELISION = /\s*(?:\.\.\.|…)\s*/;
const MIN_PIECE_WORDS = 4;
const MAX_GAP = 400;

/** Pieces of a quote split on … / ... (normText'ed, quote marks trimmed). */
function quotePieces(quote) {
  const q = normText(quote).replace(/^["'\s]+|["'\s]+$/g, '');
  return q ? q.split(ELISION).map((p) => p.trim()).filter(Boolean) : [];
}

/**
 * Is `quote` verbatim in ONE haystack (already normText'ed)? Elided pieces must
 * appear in order, each at most MAX_GAP chars after the previous one, and each
 * elided piece must have ≥ MIN_PIECE_WORDS words — otherwise "…" could stitch a
 * fabricated sentence out of common words found far apart.
 * Returns { ok, reason }.
 */
function quoteMatch(quote, haystackNorm) {
  const parts = quotePieces(quote);
  if (parts.length === 0) return { ok: false, reason: 'empty quote' };
  if (parts.length > 1) {
    const short = parts.find((p) => p.split(' ').length < MIN_PIECE_WORDS);
    if (short) return { ok: false, reason: `elided piece "${short}" has fewer than ${MIN_PIECE_WORDS} words` };
  }
  // Try every occurrence of the first piece as an anchor.
  let anchor = haystackNorm.indexOf(parts[0]);
  while (anchor !== -1) {
    let end = anchor + parts[0].length;
    let ok = true;
    for (const p of parts.slice(1)) {
      const at = haystackNorm.indexOf(p, end);
      if (at === -1 || at - end > MAX_GAP) { ok = false; break; }
      end = at + p.length;
    }
    if (ok) return { ok: true, reason: '' };
    anchor = haystackNorm.indexOf(parts[0], anchor + 1);
  }
  return { ok: false, reason: parts.length > 1 ? `pieces not found in order within ${MAX_GAP} chars of each other in one file` : 'not found' };
}

/** Back-compat boolean form over one haystack. */
function quoteFound(quote, haystackNorm) {
  return quoteMatch(quote, haystackNorm).ok;
}

/**
 * Source files a "Nguồn (file §mục)" cell names, resolved against `files`
 * ([{rel, norm}]) by relative path suffix or by file stem (spec.docx -> spec.md).
 * Empty when nothing resolves.
 */
function resolveSourceFiles(sourceCell, files) {
  const src = stripMd(sourceCell).toLowerCase();
  const names = [...src.matchAll(/([^\s,;§()|]+\.(?:md|txt|csv|docx?|pdf|xlsx?|pptx?|html?))/g)].map((m) => m[1]);
  const stem = (p) => p.replace(/\\/g, '/').split('/').pop().replace(/\.[^.]+$/, '');
  const hits = [];
  for (const n of names) {
    const norm = n.replace(/\\/g, '/');
    for (const f of files) {
      const rel = f.rel.toLowerCase().replace(/\\/g, '/');
      if (rel === norm || rel.endsWith('/' + norm) || stem(rel) === stem(norm)) hits.push(f);
    }
  }
  return [...new Set(hits)];
}

/**
 * Quote check against separate source files: the named file(s) when the source
 * cell resolves, otherwise each file on its own (never one joined corpus).
 * Returns { ok, reason, searched: [rel] }.
 */
function quoteInSources(quote, sourceCell, files) {
  const named = resolveSourceFiles(sourceCell, files);
  const pool = named.length ? named : files;
  let reason = 'not found';
  for (const f of pool) {
    const r = quoteMatch(quote, f.norm);
    if (r.ok) return { ok: true, reason: '', searched: pool.map((x) => x.rel) };
    if (r.reason !== 'not found') reason = r.reason;
  }
  return { ok: false, reason, searched: pool.map((x) => x.rel), named: named.length > 0 };
}

/** An empty-ish cell: blank, a dash, `<điền>`, `...`. */
function isBlank(s) {
  const t = stripMd(s);
  return t === '' || /^[-–—.…\s]*$/.test(t) || /^<\s*điền[^>]*>$/i.test(t) || /^n\/?a$/i.test(t);
}

// ───────────────────────────── Meta line (§7) ─────────────────────────────

const META_LINE = /^Owner:.*Verdict:\s*(PASS|FIX|ASK)\b/;
const META_TOP = 10;

/** Meta line from the first 10 lines, or null when absent/unreadable. */
function readMeta(text) {
  if (text == null) return null;
  const lines = nfc(text).split('\n').slice(0, META_TOP);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    const m = l.match(META_LINE);
    if (!m) continue;
    const owner = (l.match(/^Owner:\s*([^·]*)/) || [, ''])[1].trim();
    const source = (l.match(/Nguồn:\s*([^·]*)/) || [, ''])[1].trim();
    return { owner, source, verdict: m[1], line: i + 1 };
  }
  return null;
}

function readVerdict(text) {
  const m = readMeta(text);
  return m ? m.verdict : null;
}

const VERDICT_RANK = { PASS: 0, FIX: 1, ASK: 2 };
/** Worst of several verdicts; null entries count as FIX (unreadable must not pass). */
function worstVerdict(list) {
  let worst = 'PASS';
  for (const v of list) {
    const x = v && VERDICT_RANK[v] !== undefined ? v : 'FIX';
    if (VERDICT_RANK[x] > VERDICT_RANK[worst]) worst = x;
  }
  return worst;
}

// ───────────────────────────── IDs (§9.1) ─────────────────────────────

const ID_FAMILIES = ['BR', 'FD', 'AF', 'OQ', 'MR', 'RK', 'VP', 'TI'];
const VP_REGISTRY = {
  'VP-01': 'Happy Path', 'VP-02': 'Negative', 'VP-03': 'Boundary', 'VP-04': 'Security',
  'VP-05': 'UX/Usability', 'VP-06': 'Performance', 'VP-07': 'Accessibility', 'VP-08': 'Integration',
};

/** Global regex for one family (or several), tolerant of ** and backticks around the code. */
function idRegex(families = ID_FAMILIES, flags = 'g') {
  const fam = Array.isArray(families) ? families.join('|') : families;
  return new RegExp(`(?<![A-Za-z0-9])(${fam})-(\\d+)(?![A-Za-z0-9-])`, flags);
}

/** `**mr-3**` -> `MR-03`. Returns null when the text is not exactly one ID. */
function canonicalId(raw, families = ID_FAMILIES) {
  const t = stripMd(raw).toUpperCase();
  const fam = Array.isArray(families) ? families.join('|') : families;
  const m = t.match(new RegExp(`^(${fam})-(\\d+)$`));
  return m ? `${m[1]}-${m[2].padStart(2, '0')}` : null;
}

/** Every ID of the given families mentioned in `text`, canonical, unique, sorted. */
function idsIn(text, families = ID_FAMILIES) {
  if (!text) return [];
  const out = new Set();
  for (const m of stripMd(text).matchAll(idRegex(families))) {
    out.add(`${m[1].toUpperCase()}-${m[2].padStart(2, '0')}`);
  }
  return [...out].sort(compareIds);
}

function compareIds(a, b) {
  const [fa, na] = splitId(a);
  const [fb, nb] = splitId(b);
  return fa === fb ? na - nb : fa.localeCompare(fb);
}

function splitId(id) {
  const m = String(id).match(/^(.*)-(\d+)$/);
  return m ? [m[1], Number(m[2])] : [String(id), 0];
}

/** Test case ID `<MODULE>-NNN` (§9.1). Loose form is used only to *detect* TC-like text. */
const TC_ID = /^[A-Z][A-Z0-9]{1,5}-\d{3}$/;
const TC_ID_LOOSE_SRC = '[A-Za-z][A-Za-z0-9]*(?:[-_][A-Za-z0-9]+)*-\\d+';
const isTcId = (s) => TC_ID.test(s);
/** A loose TC-like token that is not one of the §9.1 rule/question families. */
function looksLikeTcId(token) {
  const t = stripMd(token);
  if (!new RegExp(`^${TC_ID_LOOSE_SRC}$`).test(t)) return false;
  return !new RegExp(`^(${ID_FAMILIES.join('|')})-\\d+$`, 'i').test(t);
}

// ───────────────────────────── Status (§9.3) ─────────────────────────────

/** Whole-word test that works for Vietnamese letters (JS `\b` is ASCII-only). */
function hasWord(text, phrase) {
  const esc = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${esc}(?=$|[^\\p{L}\\p{N}])`, 'u').test(text);
}

const STATUS_LEAD = [
  ['Confirmed', ['confirmed', 'đã xác nhận', 'đã chốt']],
  ['Rejected', ['rejected', 'không xử lý', 'loại']],
  ['TREO', ['treo', 'pending']],
  ['New', ['new', 'mới', 'chờ trả lời']],
];

/**
 * Canonical status, or null when unrecognised (unrecognised keeps the gate closed).
 * "Confirmed (BA An)" -> Confirmed. Negations win over substrings:
 * "Chưa xác nhận" / "Unconfirmed" -> New, never Confirmed.
 */
function normalizeStatus(raw) {
  const t = normKey(raw);
  if (!t) return null;
  // 1. A canonical word at the very start decides ("Confirmed (BA An)").
  for (const [canon, words] of STATUS_LEAD) {
    for (const w of words) {
      if (t === w || (t.startsWith(w) && !/[\p{L}\p{N}]/u.test(t.charAt(w.length)))) return canon;
    }
  }
  // 2. Otherwise negation/pending words win over any resolved substring.
  if (hasWord(t, 'treo') || hasWord(t, 'pending')) return 'TREO';
  if (['chưa', 'chờ', 'not', 'unconfirmed', 'open', 'waiting', 'new', 'mới'].some((w) => hasWord(t, w))) return 'New';
  if (['confirmed', 'đã xác nhận', 'đã chốt'].some((w) => hasWord(t, w))) return 'Confirmed';
  if (['rejected', 'không xử lý', 'loại'].some((w) => hasWord(t, w))) return 'Rejected';
  return null;
}

// ───────────────────────────── Tables ─────────────────────────────

/** Column aliases, normalised with normKey. First entry is the canonical name. */
const COLUMN_ALIASES = {
  id: ['id', 'mã', 'mã rule', 'rule id', 'mã câu hỏi'],
  gap: ['kẽ hở', 'mô tả kẽ hở'],
  w: ['nhóm 06w', 'nhóm'],
  foundAt: ['nguồn phát hiện'],
  suggestion: ['phương án gợi ý (chưa phải rule)', 'phương án gợi ý', 'đề xuất mặc định'],
  question: ['câu hỏi cho ba/po', 'câu hỏi', 'câu hỏi xác nhận cho ba', 'question'],
  answer: ['phản hồi chính thức', 'trả lời của ba', 'phản hồi chính thức của ba', 'câu trả lời', 'answer'],
  answeredBy: ['người trả lời'],
  date: ['ngày'],
  status: ['trạng thái', 'status'],
  // knowledge §8
  num: ['#', 'stt'],
  related: ['mã liên quan'],
  decision: ['quyết định chính thức', 'quyết định đã chốt', 'quyết định'],
  approver: ['người phê duyệt'],
  decidedOn: ['ngày chốt'],
  // 01
  source: ['nguồn (file §mục)', 'nguồn'],
  quote: ['trích nguyên văn'],
  // 02 matrix / OQ
  object: ['đối tượng'],
  oq: ['oq'],
  handling: ['xử lý'],
  // 03 / 04
  vp: ['vp'],
  ti: ['ti'],
  keep: ['giữ/bỏ'],
  // 06
  code: ['mã'],
};

/**
 * Every markdown table in `text`. Each table: { headers, keys, rows, line }
 * where rows are { cells, line } and `col(table, name)` finds a column by alias.
 */
/** A row that only says the table is empty ("Không có", "—", blanks). */
function isEmptyMarkerRow(cells) {
  return cells.every((c) => {
    const k = normKey(c).replace(/[().:]/g, '').trim();
    return k === '' || k === 'không có' || /^[-–—…]+$/.test(k);
  });
}

/** Does this header row look like a data row (first cell is an ID)? Usually a table split by a blank line. */
function looksLikeDataRow(cells) {
  const first = stripMd(cells[0] || '');
  return !!(canonicalId(first) || looksLikeTcId(first));
}

function parseTables(text, offset = 0) {
  const out = [];
  const lines = nfc(text || '').split('\n');
  let cur = null;
  const split = (l) => {
    const t = l.trim().replace(/^\|/, '').replace(/\|$/, '');
    // Keep escaped pipes inside cells.
    return t.split(/(?<!\\)\|/).map((c) => c.trim());
  };
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t.startsWith('|')) {
      if (cur) { out.push(cur); cur = null; }
      continue;
    }
    if (/^\|[\s:|-]+\|?$/.test(t)) continue; // separator
    if (!cur) {
      const headers = split(t);
      cur = { headers, keys: headers.map(normKey), rows: [], line: i + 1 + offset, idLikeHeader: looksLikeDataRow(headers) };
    } else {
      const cells = split(t);
      if (isEmptyMarkerRow(cells)) continue;
      cur.rows.push({ cells, line: i + 1 + offset });
    }
  }
  if (cur) out.push(cur);
  return out;
}

/** Index of a column by logical name (alias list) or literal header; -1 when absent. */
function col(table, name) {
  const aliases = (COLUMN_ALIASES[name] || [name]).map(normKey);
  let i = table.keys.findIndex((k) => aliases.includes(k));
  if (i !== -1) return i;
  i = table.keys.findIndex((k) => aliases.some((a) => a.length >= 3 && k.startsWith(a)));
  return i;
}

/** Cell value by logical column name ('' when the column or cell is absent). */
function cell(table, row, name) {
  const i = col(table, name);
  return i === -1 ? '' : (row.cells[i] || '');
}

/** First table in `text` that has every one of the named columns. */
function findTable(text, required) {
  return parseTables(text).find((t) => required.every((n) => col(t, n) !== -1)) || null;
}

// ───────────────────────────── Sections ─────────────────────────────

const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const NUMBERED = /^(\d+[a-z]?)\.?(?:\s|$)/i;

/**
 * Body of a heading. `key` is a section number ('7', '3b') matched against the
 * heading's leading number with or without a dot, or a RegExp tested on the
 * normalised heading title. Ends at the next heading of the same or higher
 * level, or at the next numbered heading of any level ("### 3b" ends "## 3").
 */
function findSection(text, key) {
  const lines = nfc(text || '').split('\n');
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(HEADING);
    if (!h) continue;
    const title = normKey(h[2]);
    const num = (title.match(NUMBERED) || [])[1];
    const hit = key instanceof RegExp ? key.test(title) : num && num.toLowerCase() === String(key).toLowerCase();
    if (hit) { start = i; level = h[1].length; break; }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const h = lines[i].match(HEADING);
    if (!h) continue;
    if (h[1].length <= level || NUMBERED.test(normKey(h[2]))) { end = i; break; }
  }
  return { body: lines.slice(start + 1, end).join('\n'), startLine: start + 1, title: lines[start] };
}

/** { body, offset } of a section: body line n is file line offset + n. null when absent. */
function sectionAt(text, num, titleRe) {
  const s = findSection(text, num) || (titleRe ? findSection(text, titleRe) : null);
  return s ? { body: s.body, offset: s.startLine } : null;
}

/** Section body by number, falling back to a title pattern; '' when neither is present. */
function sectionBody(text, num, titleRe) {
  const s = findSection(text, num) || (titleRe ? findSection(text, titleRe) : null);
  return s ? s.body : '';
}

// ───────────────────────────── Test cases ─────────────────────────────

const FIELD_LINE = /^ ?(?:[-*+]\s+)?\*\*([^*\n]+?)(?::\*\*|\*\*\s*:)\s*(.*)$/;

/**
 * Parses test cases. Accepts `### TC_ID: X` at levels 2-4, and `## / ### / #### X`
 * whose first token is a TC id (not a BR/MR/... code). Fields: `- **X**:` and `- **X:**`.
 *
 * Returns { cases, unparsed } where `unparsed` lists TC-like lines outside any
 * parsed case (table rows, bullets, malformed headings) whose ID was not parsed:
 * a format the tools cannot see must be reported, never silently dropped.
 */
function parseTestCases(text) {
  const lines = nfc(text || '').split('\n');
  const cases = [];
  let cur = null;
  let field = null;
  const inCase = new Array(lines.length).fill(false);

  const close = () => {
    if (!cur) return;
    for (const k of Object.keys(cur.fields)) cur.fields[k] = cur.fields[k].replace(/\s+$/, '').replace(/^\n+/, '');
    cases.push(cur);
    cur = null;
    field = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h = line.match(HEADING);
    if (h) {
      const level = h[1].length;
      const title = stripMd(h[2]);
      const explicit = title.match(/^TC[_ ]?ID\s*:\s*(\S+)/i);
      const firstTok = (title.match(/^(\S+?)(?=[\s:—–-]*(?:\s|$))/) || [, ''])[1].replace(/[:.]+$/, '');
      const id = explicit ? explicit[1].replace(/[:.,]+$/, '') : (level >= 2 && level <= 4 && looksLikeTcId(firstTok) ? firstTok : null);
      if (id && level >= 2 && level <= 4) {
        close();
        cur = { id, heading: line.trim(), line: i + 1, level, fields: {}, order: [] };
        inCase[i] = true;
        continue;
      }
      if (cur && level <= cur.level) close();
      else if (cur) { inCase[i] = true; continue; }
      continue;
    }
    if (!cur) continue;
    if (/^\s*---+\s*$/.test(line)) { close(); continue; }
    inCase[i] = true;
    const f = line.match(FIELD_LINE);
    if (f) {
      field = f[1].trim();
      cur.fields[field] = f[2] || '';
      cur.order.push(field);
    } else if (field) {
      cur.fields[field] += '\n' + line;
    }
  }
  close();

  const parsedIds = new Set(cases.map((c) => c.id.toUpperCase()));
  const unparsed = [];
  const lead = new RegExp(`^(${TC_ID_LOOSE_SRC})(?=$|[\\s|:,.)\\]—–])`);
  const headingLines = new Set(cases.map((c) => c.line - 1));
  for (let i = 0; i < lines.length; i++) {
    if (headingLines.has(i)) continue;
    const t = lines[i].trim();
    // Inside a case only a table row can smuggle in another test case.
    if (inCase[i] && !t.startsWith('|')) continue;
    if (/^#\s/.test(t) || /^\|[\s:|-]+\|?$/.test(t)) continue; // document title, table separator
    if (!/^(#{2,6}\s|\||[-*+]\s|\d+\.\s)/.test(t) && !/TC_ID/i.test(t)) continue;
    // The identifying position of a test case is the start of the line, after markup.
    const body = stripMd(t.replace(/^(#{1,6}\s+|\|\s*|[-*+]\s+|\d+\.\s+)/, '')).replace(/^TC[_ ]?ID\s*:\s*/i, '');
    const m = body.match(lead);
    const id = m && looksLikeTcId(m[1]) ? m[1] : null;
    if (id && !parsedIds.has(id.toUpperCase())) unparsed.push({ line: i + 1, text: t.slice(0, 100), id });
    else if (!id && /TC_ID/i.test(t)) unparsed.push({ line: i + 1, text: t.slice(0, 100), id: null });
  }
  return { cases, unparsed };
}

/** Field value by name, case-insensitive; null when the field is absent. */
function tcField(tc, name) {
  const k = Object.keys(tc.fields).find((x) => normKey(x) === normKey(name));
  return k === undefined ? null : tc.fields[k];
}

/** Tag codes of a case: rules (Rule#X), viewpoints, test ideas, module, raw tags. */
function tcTags(tc) {
  const tags = stripMd(tcField(tc, 'Tags') || '');
  // `Viewpoint#VP-01, Viewpoint#VP-03` and `Viewpoint#VP-01/VP-03` (or `, VP-03`) both list several.
  const grab = (prefix, cont) => {
    const more = cont ? `(?:\\s*[,/;]\\s*(?:${cont}))*` : '';
    const re = new RegExp(`${prefix}#\\s*([A-Za-z0-9_-]+${more})`, 'g');
    return [...tags.matchAll(re)].flatMap((m) => m[1].split(/\s*[,/;]\s*/)).map((x) => x.toUpperCase());
  };
  const canon = (x) => canonicalId(x) || x;
  return {
    raw: tags,
    rules: [...new Set(grab('Rule', '(?:BR|FD|AF|MR)-\\d+').map(canon))],
    viewpoints: [...new Set(grab('Viewpoint', 'VP-\\d+').map(canon))],
    ideas: [...new Set(grab('TI', 'TI-\\d+').map(canon))],
    module: (grab('Module')[0] || ''),
  };
}

// ───────────────────────────── Labels & placeholders (§2.1) ─────────────────────────────

const LABEL_RE = /\[\s*(?:CHƯA CÓ TRONG TÀI LIỆU[^\]]*|GIẢ ĐỊNH|CONTEXT_MISSING|ĐỀ XUẤT|SEVERITY_CONFIDENCE_LOW)\s*\]|CHƯA COVER|CHƯA CÓ DATA/giu;

function hasLabel(text) {
  LABEL_RE.lastIndex = 0;
  return LABEL_RE.test(nfc(text));
}

function stripLabels(text) {
  return nfc(text).replace(LABEL_RE, ' ');
}

/**
 * Leftover template content. Deliberately narrow so real test data is not
 * flagged (`<script>alert(1)</script>`, `SG-XXXXXX`). §2.1 labels are removed
 * first: `[CHƯA CÓ TRONG TÀI LIỆU – MR-03]` is the correct way to say "missing".
 */
const TEMPLATE_WORDS = 'hành động|giá trị|trạng thái|tên trường|điều kiện|module|verify/validate/confirm|id/tên|tên|high/medium/low|automated/manual|điền|mô tả|nội dung|ví dụ';
const PLACEHOLDERS = [
  /(?<![A-Za-z])TBD(?![A-Za-z])/i,
  /(?<![A-Za-z])TODO(?![A-Za-z])/i,
  /(?<![A-Za-z])FIXME(?![A-Za-z])/i,
  new RegExp(`\\[\\s*(?:${TEMPLATE_WORDS})(?:\\s[^\\]]*)?\\]`, 'iu'),
  new RegExp(`<\\s*(?:${TEMPLATE_WORDS})(?:\\s[^>]*)?>`, 'iu'),
];

/** The first placeholder pattern found in `text` (code spans included), or null. */
function findPlaceholder(text) {
  const t = stripLabels(text).replace(/`/g, ' ');
  return PLACEHOLDERS.find((re) => re.test(t)) || null;
}

// ───────────────────────────── Knowledge questions (§9.4, §9.5) ─────────────────────────────

const HTML_TAGS = /^\/?(?:script|style|b|i|u|em|strong|br|hr|div|span|p|a|img|input|svg|iframe|form|button|table|tr|td|th|ul|ol|li|h[1-6])\b/i;

/** `<số ngày>`, `<điền>`, `<giá trị>` — a template slot, not an answer (HTML tags excluded). */
function hasAnglePlaceholder(text) {
  for (const m of nfc(text).matchAll(/<\s*([^<>\n]{1,60})>/g)) {
    if (!HTML_TAGS.test(m[1].trim())) return true;
  }
  return false;
}

const NOT_CONCRETE_HINT = 'câu trả lời của BA chưa phải chữ cụ thể — giữ MR ở TREO và hỏi lại';

/** Rows of a question table (§9.4) in `text`: {id, rawId, question, answer, answeredBy, date, status, statusRaw, resolved, line}. */
function readQuestionRows(text, offset = 0) {
  const out = [];
  for (const t of parseTables(text, offset)) {
    if (col(t, 'id') === -1 || col(t, 'status') === -1) continue;
    if (col(t, 'question') === -1 && col(t, 'answer') === -1) continue;
    for (const r of t.rows) {
      const rawId = stripMd(cell(t, r, 'id'));
      if (!rawId || isBlank(rawId)) continue;
      const statusRaw = cell(t, r, 'status');
      const status = normalizeStatus(statusRaw);
      const answer = stripMd(cell(t, r, 'answer'));
      const placeholder = hasAnglePlaceholder(cell(t, r, 'answer'));
      const answered = !isBlank(answer) && !placeholder;
      out.push({
        id: canonicalId(rawId) || rawId.toUpperCase(),
        rawId,
        gap: stripMd(cell(t, r, 'gap')),
        w: stripMd(cell(t, r, 'w')),
        foundAt: stripMd(cell(t, r, 'foundAt')),
        suggestion: stripMd(cell(t, r, 'suggestion')),
        question: stripMd(cell(t, r, 'question')),
        answer: answered ? answer : '',
        answeredBy: isBlank(cell(t, r, 'answeredBy')) ? '' : stripMd(cell(t, r, 'answeredBy')),
        date: isBlank(cell(t, r, 'date')) ? '' : stripMd(cell(t, r, 'date')),
        status,
        statusRaw: stripMd(statusRaw),
        resolved: (status === 'Confirmed' && answered) || status === 'Rejected',
        placeholder,
        line: r.line,
      });
    }
  }
  return out;
}

/** §8 decisions; `valid` only with decision + approver + date (§9.5). */
function readDecisions(text, offset = 0) {
  const out = [];
  for (const t of parseTables(text, offset)) {
    if (col(t, 'related') === -1 || col(t, 'decision') === -1) continue;
    for (const r of t.rows) {
      const related = idsIn(cell(t, r, 'related'));
      const decision = stripMd(cell(t, r, 'decision'));
      const approver = stripMd(cell(t, r, 'approver'));
      const date = stripMd(cell(t, r, 'decidedOn'));
      out.push({
        num: stripMd(cell(t, r, 'num')),
        related,
        question: stripMd(cell(t, r, 'question')),
        decision,
        approver: isBlank(approver) ? '' : approver,
        date: isBlank(date) ? '' : date,
        placeholder: hasAnglePlaceholder(cell(t, r, 'decision')),
        valid: !isBlank(decision) && !hasAnglePlaceholder(cell(t, r, 'decision')) && !isBlank(approver) && !isBlank(date) && related.length > 0,
        line: r.line,
      });
    }
  }
  return out;
}

/** Knowledge file parsed into §7 questions and §8 decisions. */
function readKnowledge(slug) {
  const p = featureKnowledge(slug);
  if (!fs.existsSync(p)) return { exists: false, path: p, questions: [], decisions: [], text: '' };
  const text = fs.readFileSync(p, 'utf-8');
  const s7 = sectionAt(text, '7', /câu hỏi|open questions/);
  const s8 = sectionAt(text, '8', /quyết định|giả định|decision/);
  return {
    exists: true, path: p, text,
    questions: s7 ? readQuestionRows(s7.body, s7.offset) : [],
    decisions: s8 ? readDecisions(s8.body, s8.offset) : [],
  };
}

/** Same question? IDs equal and text equal after normalisation (empty text matches by ID only). */
function sameQuestion(a, b) {
  if (a.id !== b.id) return false;
  const qa = questionKey(a.question);
  const qb = questionKey(b.question);
  return !qa || !qb || qa === qb;
}

/**
 * Is `q` (an MR from 02 or a §7 row) settled in knowledge? A §7 row with the
 * same ID AND question that is resolved, or a valid §8 decision citing the ID
 * (whose question, if recorded, matches).
 */
function resolvedInKnowledge(q, k) {
  if (k.questions.some((r) => r.resolved && sameQuestion(r, q))) return true;
  return k.decisions.some((d) => d.valid && d.related.includes(q.id) &&
    (!d.question || !q.question || questionKey(d.question) === questionKey(q.question)));
}

// ───────────────────────────── Deliverable helpers ─────────────────────────────

/** IDs from the ID column of the table under section `num` of `text`. */
function tableIds(text, num, family, titleRe) {
  const body = sectionBody(text, num, titleRe);
  const out = [];
  for (const t of parseTables(body)) {
    const i = col(t, 'id');
    if (i === -1) continue;
    for (const r of t.rows) {
      const id = canonicalId(r.cells[i], family);
      if (id) out.push(id);
    }
  }
  return [...new Set(out)];
}

/**
 * BR / FD / AF / OQ / RK defined in 01 or knowledge: ID columns of the tables in
 * sections 3, 3b, 5, 7, 10 (pins). Falls back to every table when none of those
 * sections exists, so a renumbered document is still read rather than ignored.
 */
function read01(text) {
  if (!text) return null;
  const bodies = ['3', '3b', '5', '7', '10'].map((n) => sectionBody(text, n)).filter(Boolean);
  const scope = bodies.length ? bodies.join('\n\n') : text;
  const fam = (f) => {
    const all = [];
    for (const t of parseTables(scope)) {
      const i = col(t, 'id');
      if (i === -1) continue;
      for (const r of t.rows) { const id = canonicalId(r.cells[i], f); if (id) all.push(id); }
    }
    return [...new Set(all)].sort(compareIds);
  };
  return { BR: fam('BR'), FD: fam('FD'), AF: fam('AF'), OQ: fam('OQ'), RK: fam('RK') };
}

/** Definitions recorded in knowledge §3/§3b/§5 (ID columns). */
function readKnowledgeDefs(text) {
  return read01(text) || { BR: [], FD: [], AF: [], OQ: [], RK: [] };
}

/** VP rows of 03 §2 (pins). */
function read03Viewpoints(text) {
  if (!text) return [];
  const body = sectionBody(text, '2', /viewpoint/);
  const out = new Set();
  for (const t of parseTables(body || text)) {
    const i = col(t, 'vp');
    if (i === -1) continue;
    for (const r of t.rows) { const id = canonicalId(r.cells[i], 'VP'); if (id) out.add(id); }
  }
  return [...out].sort(compareIds);
}

/** TI rows of 04 (pins): [{id, keep: 'Giữ'|'Bỏ'|'Chờ MR'|raw}]. */
function read04Ideas(text) {
  if (!text) return [];
  const out = [];
  for (const t of parseTables(text)) {
    const i = col(t, 'ti');
    if (i === -1) continue;
    for (const r of t.rows) {
      const id = canonicalId(r.cells[i], 'TI');
      if (!id) continue;
      const k = normKey(cell(t, r, 'keep'));
      const keep = /^giữ/.test(k) ? 'Giữ' : /^bỏ/.test(k) ? 'Bỏ' : /^chờ/.test(k) ? 'Chờ MR' : k;
      out.push({ id, keep, line: r.line });
    }
  }
  return out;
}

/** MR rows of 02 §3 (pins), falling back to any question table in the file. */
function read02Questions(text) {
  if (!text) return [];
  const sec = sectionAt(text, '3', /câu hỏi/);
  const rows = sec ? readQuestionRows(sec.body, sec.offset) : [];
  return (rows.length ? rows : readQuestionRows(text)).filter((r) => /^MR-\d+$/.test(r.id));
}

// ───────────────────────────── Progress ─────────────────────────────

const STAGE_FILES = [
  ['01', '01_requirement_risk_summary.md'],
  ['02', '02_missing_rule_report.md'],
  ['03', '03_viewpoint_report.md'],
  ['04', '04_test_idea_report.md'],
  ['05', '05_test_case_spec.md'],
  ['06', '06_coverage_review.md'],
];

/**
 * Stage 01-06 deliverables present in OUTPUT/<slug>/ with their meta verdict.
 * `done` counts files whose meta line reads PASS. Used when 00_plan.md has no ticks.
 */
function deliverableProgress(slug) {
  const dir = taskDir(slug);
  const stages = STAGE_FILES.map(([stage, file]) => {
    const p = path.join(dir, file);
    const exists = fs.existsSync(p);
    return { stage, file, exists, verdict: exists ? readVerdict(fs.readFileSync(p, 'utf-8')) : null };
  });
  return {
    stages,
    present: stages.filter((x) => x.exists).length,
    done: stages.filter((x) => x.verdict === 'PASS').length,
    total: stages.length,
    last: [...stages].reverse().find((x) => x.exists) || null,
  };
}

// ───────────────────────────── Next-ID allocator ─────────────────────────────

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!/^(node_modules|runs|_playwright)$/.test(e.name)) walk(p, out); }
    else if (/\.(md|json|txt)$/i.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * Next free ID per family over knowledge/features/<slug>.md and OUTPUT/<slug>/**.
 * Never renumbers from 01 (§9.1). VP is a fixed registry: the next free one is
 * the next `VP-9x`. Test cases are numbered per module (`AUTH-004`).
 */
function nextIds(slug) {
  const files = [featureKnowledge(slug), ...walk(taskDir(slug))].filter((p) => fs.existsSync(p));
  const max = Object.fromEntries(ID_FAMILIES.map((f) => [f, 0]));
  const modules = {};
  const sources = [];
  for (const p of files) {
    const text = stripMd(fs.readFileSync(p, 'utf-8'));
    sources.push(path.relative(PATHS.ROOT, p));
    for (const m of text.matchAll(idRegex())) {
      const n = Number(m[2]);
      const f = m[1].toUpperCase();
      if (f === 'VP') { if (n >= 90 && n > max.VP) max.VP = n; continue; }
      if (n > max[f]) max[f] = n;
    }
    for (const m of text.matchAll(/(?<![A-Za-z0-9-])([A-Z][A-Z0-9]{1,5})-(\d{3})(?![A-Za-z0-9])/g)) {
      if (ID_FAMILIES.includes(m[1])) continue;
      modules[m[1]] = Math.max(modules[m[1]] || 0, Number(m[2]));
    }
  }
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  const next = {};
  for (const f of ID_FAMILIES) {
    next[f] = f === 'VP' ? `VP-${pad(max.VP ? max.VP + 1 : 91)}` : `${f}-${pad(max[f] + 1)}`;
  }
  const tc = Object.fromEntries(Object.entries(modules).sort().map(([m, n]) => [m, `${m}-${pad(n + 1, 3)}`]));
  return { slug, next, max, testCases: tc, sources };
}

module.exports = {
  // text
  nfc, stripMd, normKey, normText, questionKey, quoteFound, quoteMatch, quotePieces, quoteInSources, resolveSourceFiles, isBlank,
  // meta
  readMeta, readVerdict, worstVerdict, META_LINE, META_TOP,
  // ids
  ID_FAMILIES, VP_REGISTRY, idRegex, canonicalId, idsIn, compareIds, TC_ID, isTcId, looksLikeTcId,
  // status
  normalizeStatus,
  // tables & sections
  COLUMN_ALIASES, parseTables, col, cell, findTable, findSection, sectionBody, sectionAt, isEmptyMarkerRow,
  // test cases
  parseTestCases, tcField, tcTags,
  // labels
  hasLabel, stripLabels, findPlaceholder, PLACEHOLDERS,
  // knowledge & deliverables
  hasAnglePlaceholder, NOT_CONCRETE_HINT, readQuestionRows, readDecisions, readKnowledge, sameQuestion, resolvedInKnowledge,
  tableIds, read01, readKnowledgeDefs, read03Viewpoints, read04Ideas, read02Questions,
  // ids & progress
  nextIds, deliverableProgress, STAGE_FILES,
};
