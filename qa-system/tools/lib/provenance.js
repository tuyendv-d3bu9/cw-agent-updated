/**
 * provenance.js — Do the values in a test case have a source?
 *
 * The old lint only checked the FORM of a test case (fields present, correct Tags). An invented error message
 * or a made-up number passed clean. This module closes exactly that gap by matching the values
 * in Expected Result / Test Data against what has ALREADY been verified as sourced:
 *
 *   • 01 §3 BR, §3b FD, §5 AF, §6 — each row has a "Trích nguyên văn" that lint re-checks in INPUT/
 *   • knowledge §3/§3b/§5, §8 (decisions with approver + date), §9 (constants), and settled §7 answers
 *
 * Limit (stated plainly): the machine blocks UNSOURCED VALUES; it cannot block a misreading of a sentence that
 * really exists. Meaning still needs a human reviewer.
 */

const S = require('./schema');

// Units / contexts that make a number a "business limit" rather than a step ordinal.
const UNIT_AFTER = /^\s*(?:lần|phút|giây|giờ|ngày|tuần|tháng|năm|ký tự|kí tự|chữ số|vnđ|vnd|đồng|đ(?![\p{L}\p{N}])|%|mb\b|kb\b|gb\b|chars?\b|characters?\b|seconds?\b|minutes?\b|hours?\b|days?\b|times\b|attempts?\b|bản ghi|dòng|tệp|file\b)/iu;

/**
 * Unit set = the built-in units above + units of the selected domain pack (units.json / knowledge/_domain.md).
 * Only ADDS: no extra units ⇒ returns exactly UNIT_AFTER, lint runs as for a project with no domain.
 */
function unitPattern(extra = []) {
  const words = [...new Set((extra || []).map((u) => String(u).normalize('NFC').trim().toLowerCase()).filter(Boolean))];
  if (!words.length) return UNIT_AFTER;
  const esc = words.sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`${UNIT_AFTER.source}|^\\s*(?:${esc.join('|')})(?![\\p{L}\\p{N}])`, UNIT_AFTER.flags);
}

const CONTEXT_BEFORE = /(?:tối đa|tối thiểu|ít nhất|nhiều nhất|giới hạn|không quá|vượt quá|quá|sau|trong vòng|max(?:imum)?|min(?:imum)?|limit|after|within)\s*[:=]?\s*$/iu;

/** Drop things that contain digits but are not business numbers: dates, times, emails, URLs, ids, repeated strings. */
function stripNoise(text) {
  return String(text)
    .replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, ' ')
    .replace(/\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\b/g, ' ')
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ')
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\b[A-Z]{2,6}-\d{1,4}\b/g, ' ') // BR-01, TC-001, MR-03, AUTH-001
    .replace(/§\s*[\d.]+[a-z]?/gi, ' ') // section reference: §2.1, § 3b
    .replace(/(.)\1{7,}/g, ' '); // "aaaaaaaa…" — generated boundary-length string
}

function parseNumber(tok) {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(tok)) return Number(tok.replace(/[.,]/g, ''));
  const n = Number(tok.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** [{value, unitAttached, raw}] — business numbers in a paragraph. */
function numbersIn(text, unitRe = UNIT_AFTER) {
  const clean = stripNoise(text);
  const out = [];
  // A number must not be followed by a digit/underscore; letters may follow only when they are a unit ("500.000đ", "15phút"),
  // whereas "3abc" or "2fa" are codes, not business numbers.
  const re = /(?<![\p{L}\p{N}_.])(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?![\p{N}_])/gu;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const value = parseNumber(m[1]);
    if (value === null) continue;
    const after = clean.slice(m.index + m[1].length, m.index + m[1].length + 14);
    if (/^\p{L}/u.test(after) && !unitRe.test(after)) continue;
    const before = clean.slice(Math.max(0, m.index - 16), m.index);
    out.push({ value, raw: m[1], unitAttached: unitRe.test(after) || CONTEXT_BEFORE.test(before) });
  }
  return out;
}

/** Strings inside double quotes — usually message text the system displays. */
function quotedStrings(text) {
  const out = [];
  const re = /["“«]([^"”»\n]{3,}?)["”»]/g;
  let m;
  while ((m = re.exec(String(text))) !== null) out.push(m[1].trim());
  return out;
}

/** Cells of every row in the tables of a section. */
function cellsOf(text, num, titleRe) {
  const sec = S.sectionAt(text, num, titleRe);
  if (!sec) return [];
  const out = [];
  for (const t of S.parseTables(sec.body, sec.offset)) for (const r of t.rows) out.push(...r.cells);
  return out;
}

/**
 * The source set of a task: normalised text for string lookup + the set of allowed numbers.
 * @param {{t01: string|null, k: object, units?: string[]}} ctx  lint context (t01 = content of 01,
 *   k = readKnowledge, units = extra units from the domain pack)
 */
function buildSources(ctx) {
  const unitRe = unitPattern(ctx.units);
  const cells = [];
  if (ctx.t01) {
    for (const n of ['3', '3b', '5', '6']) cells.push(...cellsOf(ctx.t01, n));
  }
  if (ctx.k && ctx.k.exists) {
    for (const n of ['3', '3b', '5', '6', '9']) cells.push(...cellsOf(ctx.k.text, n));
    // §8: only valid decisions (approver + date); §7: only settled answers.
    for (const d of ctx.k.decisions) if (d.valid) cells.push(d.decision, d.question);
    for (const q of ctx.k.questions) if (q.resolved) cells.push(q.answer);
  }
  const cleaned = cells.map((c) => S.stripMd(c)).filter((c) => c && !S.isBlank(c));
  const text = S.normText(cleaned.join(' \n '));

  const allowed = new Set();
  const add = (v) => { allowed.add(v - 1); allowed.add(v); allowed.add(v + 1); };
  for (const c of cleaned) {
    const nums = numbersIn(c, unitRe).map((n) => n.value);
    nums.forEach(add);
    // The middle value of a min–max range within the same cell.
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [a, b] = nums[i] < nums[j] ? [nums[i], nums[j]] : [nums[j], nums[i]];
        add(Math.floor((a + b) / 2));
        add(Math.ceil((a + b) / 2));
      }
    }
  }
  return { text, allowed, empty: cleaned.length === 0, unitRe };
}

const VALUE_FIELDS = ['Precondition', 'Test Steps', 'Test Data', 'Expected Result'];
const ASSUMPTION = /\[\s*GIẢ ĐỊNH\s*\]/iu;

/**
 * Check one test case. `get(field)` returns the field content (or null).
 * @returns {Array<{level: 'error'|'warn', msg: string}>}
 */
function checkTestCase(get, sources, knownMr) {
  const out = [];
  const say = (level, msg) => out.push({ level, msg });

  // 1. [GIẢ ĐỊNH] must not serve as a pass for a concrete value.
  for (const f of VALUE_FIELDS) {
    const v = get(f);
    if (v && ASSUMPTION.test(S.nfc(v))) {
      say('error', `\`${f}\` carries [GIẢ ĐỊNH]. A value cell must be a value from a source or the label [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]; an assumption is not a value (QA_STANDARD §2.1)`);
    }
  }

  // 2. The label [CHƯA CÓ TRONG TÀI LIỆU – MR-xx] must point to a real question.
  for (const f of VALUE_FIELDS) {
    const v = get(f);
    if (!v) continue;
    for (const m of S.nfc(v).matchAll(/\[\s*CHƯA CÓ TRONG TÀI LIỆU\s*(?:[–—-]\s*([^\]]*?))?\s*\]/giu)) {
      const refs = m[1] ? S.idsIn(m[1], 'MR') : [];
      if (m[1] && /MR/i.test(m[1]) && refs.length === 0) say('error', `\`${f}\` label "${m[0]}" names no real MR code (MR-xx is a template slot)`);
      for (const id of refs) {
        if (!knownMr.has(id)) say('error', `\`${f}\` label cites ${id}, which is not a question in 02 §3 or knowledge §7 — the gap would never be asked`);
      }
    }
  }

  if (sources.empty) return out; // no source to compare against — lint of 01/knowledge already reports it separately

  // 3. A quoted string in Expected must exist in the sources.
  const expected = get('Expected Result');
  if (expected) {
    for (const q of quotedStrings(S.stripMd(expected))) {
      const key = S.normText(q);
      if (key.length < 3 || sources.text.includes(key)) continue;
      const words = key.split(' ').length;
      say(words >= 2 ? 'error' : 'warn',
        `Expected Result quotes "${q.slice(0, 60)}" which appears in no FD "Thông báo khi sai", AF "Hệ thống phản hồi", BR, knowledge §8/§9 or answered §7 — copy the exact text from a source, or write [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`);
    }
  }

  // 4. Numbers: tied to a unit/limit context but absent from the sources (±1, or a middle value) ⇒ fabricated.
  for (const f of ['Test Data', 'Expected Result']) {
    const v = get(f);
    if (!v) continue;
    // A number inside a quoted string was already checked in step 3 — not re-checked.
    let body = S.stripMd(v);
    if (f === 'Expected Result') body = body.replace(/["“«][^"”»\n]{3,}?["”»]/g, ' ');
    const seen = new Set();
    for (const n of numbersIn(body, sources.unitRe || UNIT_AFTER)) {
      if (sources.allowed.has(n.value) || seen.has(n.raw)) continue;
      seen.add(n.raw);
      if (n.unitAttached) {
        say('error', `\`${f}\` states ${n.raw} with a unit/limit context, but ${n.raw} (±1) is in no FD constraint, BR, knowledge §8/§9 or answered §7 — a number is not a free value; cite the source or write [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]`);
      } else if (String(Math.trunc(n.value)).length >= 3) {
        say('warn', `\`${f}\` contains ${n.raw}, which matches no number in the sources (±1) — check that it is derived (boundary) and not invented`);
      }
    }
  }
  return out;
}

/**
 * Numbers in the business cells of a row of 01 that the verbatim quote does NOT contain.
 * Catches the case: Điều kiện says "lock 30 minutes" but the quote is only "Account temporarily locked".
 */
function numbersMissingFromQuote(rowText, quote, unitRe = UNIT_AFTER) {
  const inQuote = new Set(numbersIn(quote, unitRe).map((n) => n.value));
  const missing = [];
  for (const n of numbersIn(rowText, unitRe)) if (!inQuote.has(n.value) && !missing.includes(n.raw)) missing.push(n.raw);
  return missing;
}

module.exports = { UNIT_AFTER, unitPattern, parseNumber, numbersIn, quotedStrings, buildSources, checkTestCase, stripNoise, numbersMissingFromQuote };
