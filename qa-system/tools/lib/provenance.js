/**
 * provenance.js — Giá trị trong test case có nguồn gốc không?
 *
 * Lint cũ chỉ kiểm HÌNH THỨC của test case (đủ trường, đúng Tags). Một chữ thông báo lỗi tự chế
 * hay một con số tự đặt vẫn qua sạch. Module này chặn đúng chỗ đó, bằng cách đối chiếu giá trị
 * trong Expected Result / Test Data với những gì ĐÃ được kiểm là có nguồn:
 *
 *   • 01 §3 BR, §3b FD, §5 AF, §6 — mỗi dòng có "Trích nguyên văn" mà lint dò lại trong INPUT/
 *   • knowledge §3/§3b/§5, §8 (quyết định có người phê duyệt + ngày), §9 (hằng số), và câu trả lời §7 đã chốt
 *
 * Giới hạn (nói thẳng): máy chặn được GIÁ TRỊ KHÔNG CÓ NGUỒN, không chặn được việc hiểu sai một câu có
 * thật. Phần ý nghĩa vẫn cần người duyệt.
 */

const S = require('./schema');

// Đơn vị / ngữ cảnh khiến một con số là "giới hạn nghiệp vụ" chứ không phải số thứ tự bước.
const UNIT_AFTER = /^\s*(?:lần|phút|giây|giờ|ngày|tuần|tháng|năm|ký tự|kí tự|chữ số|vnđ|vnd|đồng|đ(?![\p{L}\p{N}])|%|mb\b|kb\b|gb\b|chars?\b|characters?\b|seconds?\b|minutes?\b|hours?\b|days?\b|times\b|attempts?\b|bản ghi|dòng|tệp|file\b)/iu;
const CONTEXT_BEFORE = /(?:tối đa|tối thiểu|ít nhất|nhiều nhất|giới hạn|không quá|vượt quá|quá|sau|trong vòng|max(?:imum)?|min(?:imum)?|limit|after|within)\s*[:=]?\s*$/iu;

/** Bỏ những thứ chứa số nhưng không phải con số nghiệp vụ: ngày, giờ, email, URL, mã ID, chuỗi lặp. */
function stripNoise(text) {
  return String(text)
    .replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, ' ')
    .replace(/\b\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\b/g, ' ')
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ')
    .replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\b[A-Z]{2,6}-\d{1,4}\b/g, ' ') // BR-01, TC-001, MR-03, AUTH-001
    .replace(/§\s*[\d.]+[a-z]?/gi, ' ') // tham chiếu mục: §2.1, § 3b
    .replace(/(.)\1{7,}/g, ' '); // "aaaaaaaa…" — chuỗi sinh độ dài biên
}

function parseNumber(tok) {
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(tok)) return Number(tok.replace(/[.,]/g, ''));
  const n = Number(tok.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** [{value, unitAttached, raw}] — các con số nghiệp vụ trong một đoạn văn. */
function numbersIn(text) {
  const clean = stripNoise(text);
  const out = [];
  // Sau số không được là chữ số/gạch dưới; chữ cái chỉ được đi liền khi đó là đơn vị ("500.000đ", "15phút"),
  // còn "3abc" hay "2fa" là mã chứ không phải con số nghiệp vụ.
  const re = /(?<![\p{L}\p{N}_.])(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?![\p{N}_])/gu;
  let m;
  while ((m = re.exec(clean)) !== null) {
    const value = parseNumber(m[1]);
    if (value === null) continue;
    const after = clean.slice(m.index + m[1].length, m.index + m[1].length + 14);
    if (/^\p{L}/u.test(after) && !UNIT_AFTER.test(after)) continue;
    const before = clean.slice(Math.max(0, m.index - 16), m.index);
    out.push({ value, raw: m[1], unitAttached: UNIT_AFTER.test(after) || CONTEXT_BEFORE.test(before) });
  }
  return out;
}

/** Những chuỗi nằm trong ngoặc kép — thường là chữ thông báo mà hệ thống hiển thị. */
function quotedStrings(text) {
  const out = [];
  const re = /["“«]([^"”»\n]{3,}?)["”»]/g;
  let m;
  while ((m = re.exec(String(text))) !== null) out.push(m[1].trim());
  return out;
}

/** Ô cell của mọi dòng ở các bảng của một mục. */
function cellsOf(text, num, titleRe) {
  const sec = S.sectionAt(text, num, titleRe);
  if (!sec) return [];
  const out = [];
  for (const t of S.parseTables(sec.body, sec.offset)) for (const r of t.rows) out.push(...r.cells);
  return out;
}

/**
 * Tập nguồn của một task: văn bản đã chuẩn hoá để dò chuỗi + tập con số cho phép.
 * @param {{t01: string|null, k: object}} ctx  context của lint (t01 = nội dung 01, k = readKnowledge)
 */
function buildSources(ctx) {
  const cells = [];
  if (ctx.t01) {
    for (const n of ['3', '3b', '5', '6']) cells.push(...cellsOf(ctx.t01, n));
  }
  if (ctx.k && ctx.k.exists) {
    for (const n of ['3', '3b', '5', '6', '9']) cells.push(...cellsOf(ctx.k.text, n));
    // §8: chỉ quyết định hợp lệ (có người phê duyệt + ngày); §7: chỉ câu trả lời đã chốt.
    for (const d of ctx.k.decisions) if (d.valid) cells.push(d.decision, d.question);
    for (const q of ctx.k.questions) if (q.resolved) cells.push(q.answer);
  }
  const cleaned = cells.map((c) => S.stripMd(c)).filter((c) => c && !S.isBlank(c));
  const text = S.normText(cleaned.join(' \n '));

  const allowed = new Set();
  const add = (v) => { allowed.add(v - 1); allowed.add(v); allowed.add(v + 1); };
  for (const c of cleaned) {
    const nums = numbersIn(c).map((n) => n.value);
    nums.forEach(add);
    // Giá trị giữa của khoảng min–max trong cùng một ô.
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const [a, b] = nums[i] < nums[j] ? [nums[i], nums[j]] : [nums[j], nums[i]];
        add(Math.floor((a + b) / 2));
        add(Math.ceil((a + b) / 2));
      }
    }
  }
  return { text, allowed, empty: cleaned.length === 0 };
}

const VALUE_FIELDS = ['Precondition', 'Test Steps', 'Test Data', 'Expected Result'];
const ASSUMPTION = /\[\s*GIẢ ĐỊNH\s*\]/iu;

/**
 * Kiểm một test case. `get(field)` trả nội dung trường (hoặc null).
 * @returns {Array<{level: 'error'|'warn', msg: string}>}
 */
function checkTestCase(get, sources, knownMr) {
  const out = [];
  const say = (level, msg) => out.push({ level, msg });

  // 1. [GIẢ ĐỊNH] không được làm vé thông hành cho một giá trị cụ thể.
  for (const f of VALUE_FIELDS) {
    const v = get(f);
    if (v && ASSUMPTION.test(S.nfc(v))) {
      say('error', `\`${f}\` carries [GIẢ ĐỊNH]. A value cell must be a value from a source or the label [CHƯA CÓ TRONG TÀI LIỆU – MR-xx]; an assumption is not a value (QA_STANDARD §2.1)`);
    }
  }

  // 2. Nhãn [CHƯA CÓ TRONG TÀI LIỆU – MR-xx] phải trỏ tới một câu hỏi có thật.
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

  if (sources.empty) return out; // không có nguồn nào để đối chiếu — lint 01/knowledge đã báo riêng

  // 3. Chuỗi trong ngoặc kép ở Expected phải có trong nguồn.
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

  // 4. Con số: gắn đơn vị/ngữ cảnh giới hạn mà không có trong nguồn (±1, hoặc giá trị giữa) ⇒ bịa.
  for (const f of ['Test Data', 'Expected Result']) {
    const v = get(f);
    if (!v) continue;
    // Số nằm trong chuỗi trích dẫn đã được kiểm ở bước 3 — không kiểm lại.
    let body = S.stripMd(v);
    if (f === 'Expected Result') body = body.replace(/["“«][^"”»\n]{3,}?["”»]/g, ' ');
    const seen = new Set();
    for (const n of numbersIn(body)) {
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
 * Con số trong các ô nghiệp vụ của một dòng 01 mà câu trích nguyên văn KHÔNG chứa.
 * Bắt trường hợp: Điều kiện ghi "khoá 30 phút" nhưng câu trích chỉ là "Khoá tài khoản tạm thời".
 */
function numbersMissingFromQuote(rowText, quote) {
  const inQuote = new Set(numbersIn(quote).map((n) => n.value));
  const missing = [];
  for (const n of numbersIn(rowText)) if (!inQuote.has(n.value) && !missing.includes(n.raw)) missing.push(n.raw);
  return missing;
}

module.exports = { parseNumber, numbersIn, quotedStrings, buildSources, checkTestCase, stripNoise, numbersMissingFromQuote };
