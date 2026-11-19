/**
 * domain.js — Nạp "pack ngành" (domain pack) mà dự án đã chọn. Một loader duy nhất cho mọi tool.
 *
 *   loadDomain({ root, domainsDir })  Đọc knowledge/_sut.json → `domain`, gộp các pack + knowledge/_domain.md
 *   listPacks(domainsDir)             Các pack id có trên đĩa (bỏ thư mục bắt đầu bằng `_`)
 *   validatePack(dir, opts)           Kiểm một pack: đủ file, JSON đọc được, README có nguồn, không chứa mã FACT
 *   parseOverride(text)               Tách các mục của knowledge/_domain.md
 *
 * Vì sao có file này: trước đây chủ đề xung đột, kiểu dữ liệu sinh và đơn vị tiền tệ đều cứng theo
 * thương mại điện tử nằm rải rác trong ba tool. Gom về một chỗ thì mọi tool đọc CÙNG một lựa chọn ngành,
 * và dự án không chọn ngành nào vẫn chạy đúng như cũ (mọi tool tự rơi về giá trị mặc định cũ khi `ids` rỗng).
 *
 * Luật nền (QA_STANDARD §10): pack là CHECKLIST, không phải nguồn sự thật. Loader chỉ trả đường dẫn và
 * cấu hình máy đọc; không biến nội dung pack thành BR/FD.
 *
 * Thuần: chỉ đọc file, không ghi, không in, không giữ trạng thái giữa các lần gọi.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = ['README.md', 'vocab.md', 'risks.md', 'rule-patterns.md', 'conflict_topics.json', 'datagen.json', 'units.json'];
const MD_KEYS = { 'vocab.md': 'vocab', 'risks.md': 'risks', 'rule-patterns.md': 'rulePatterns' };
const PACK_ID = /^[a-z0-9][a-z0-9-]*$/;

// Mã sự thật của QA_STANDARD §9.1. Pack chứa một mã như vậy là đang giả làm nguồn sự thật.
const FACT_ID = /\b(?:BR|FD|AF|OQ|MR|RK|TI)-\d+\b/g;
// Ô còn là khuôn: `<to be filled …>`, `<điền>` — coi như chưa khai (QA_STANDARD §8 luật đọc).
const PLACEHOLDER = /<\s*(?:to be filled|điền)[^>]*>/iu;

const posix = (p) => p.split(path.sep).join('/');
const readText = (p) => fs.readFileSync(p, 'utf-8');

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (e) {
    throw new Error(`${file}: JSON không đọc được — ${e.message}`);
  }
}

function listPacks(domainsDir) {
  if (!fs.existsSync(domainsDir)) return [];
  return fs.readdirSync(domainsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name))
    .map((d) => d.name)
    .sort();
}

/** `domain` của _sut.json: chuỗi hoặc mảng. Rỗng / khuôn `<…>` = chưa chọn ngành. */
function selectedIds(sut) {
  const raw = sut && sut.domain;
  if (raw === undefined || raw === null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const ids = [];
  for (const v of list) {
    if (typeof v !== 'string') throw new Error(`knowledge/_sut.json: "domain" phải là chuỗi hoặc mảng chuỗi, gặp ${JSON.stringify(v)}`);
    const id = v.trim();
    if (!id || /^<.*>$/.test(id)) continue;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * Phần chữ có nội dung thật của một mục: bỏ chú thích HTML, dòng hướng dẫn `>`, dòng còn khuôn,
 * dòng tiêu đề và dòng kẻ của bảng (một bảng chỉ có tiêu đề là bảng rỗng).
 */
function meaningful(text) {
  const out = [];
  let prevRow = false;
  for (const l of String(text || '').replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const row = /^\s*\|/.test(l);
    const header = row && !prevRow;
    prevRow = row;
    if (!l.trim() || /^\s*>/.test(l) || PLACEHOLDER.test(l) || header || /^\s*\|[\s|:-]+\|\s*$/.test(l)) continue;
    out.push(l);
  }
  return out.join('\n').trim();
}

function fencedJson(body, where) {
  const m = String(body).match(/```json\s*\n([\s\S]*?)```/);
  if (!m || !meaningful(m[1])) return null;
  try {
    return JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`${where}: khối \`\`\`json không đọc được — ${e.message}`);
  }
}

const SECTION_KEYS = { vocab: 'vocab', risks: 'risks', 'rule-patterns': 'rulePatterns', datagen: 'datagen', units: 'units' };

/**
 * knowledge/_domain.md: các mục `## vocab` · `## risks` · `## rule-patterns` (markdown tự do) và
 * `## datagen` · `## units` (một khối ```json cùng định dạng với file của pack). Mục chỉ còn khuôn ⇒ bỏ qua.
 */
function parseOverride(text, where = 'knowledge/_domain.md') {
  const out = { vocab: null, risks: null, rulePatterns: null, datagen: null, units: null };
  const parts = String(text).split(/^##\s+/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf('\n');
    const head = (nl === -1 ? part : part.slice(0, nl)).trim().toLowerCase().replace(/[`*]/g, '');
    const body = nl === -1 ? '' : part.slice(nl + 1);
    const key = SECTION_KEYS[head.replace(/\.(md|json)$/, '').replace(/_/g, '-')];
    if (!key) continue;
    if (key === 'datagen' || key === 'units') out[key] = fencedJson(body, `${where} ## ${head}`);
    else out[key] = meaningful(body) ? body.trim() : null;
  }
  return out;
}

const sameJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Gộp datagen của nhiều nguồn. Cùng tên mà khác định nghĩa ⇒ báo lỗi, không tự chọn bên nào. */
function mergeDatagen(target, src, from, { override = false } = {}) {
  for (const kind of ['types', 'enums']) {
    for (const [name, def] of Object.entries((src && src[kind]) || {})) {
      if (name.startsWith('_')) continue;
      const prev = target[kind][name];
      if (prev && !override && !sameJson(prev.def, def)) {
        throw new Error(`datagen.${kind}.${name} được định nghĩa khác nhau ở ${prev.from} và ${from} — sửa một bên hoặc khai trong knowledge/_domain.md`);
      }
      target[kind][name] = { def, from };
    }
  }
}

function unitsOf(json) {
  const list = Array.isArray(json) ? json : (json && json.units) || [];
  return list.filter((u) => typeof u === 'string' && u.trim()).map((u) => u.normalize('NFC').trim().toLowerCase());
}

/**
 * @param {{root?: string, domainsDir?: string, sutFile?: string, overrideFile?: string}} opts
 * @returns {{ids: string[], packs: Array<{id, dir, readme}>, conflictTopics: object|null,
 *           datagen: {types: object, enums: object}, units: string[],
 *           files: {vocab: string[], risks: string[], rulePatterns: string[]}, override: object|null}}
 *   conflictTopics = null khi chưa chọn ngành ⇒ tool dùng chủ đề mặc định cũ.
 *   Đường dẫn trong `packs`/`files` là tương đối so với `root`, dấu `/`.
 */
function loadDomain(opts = {}) {
  const root = opts.root || require('./paths').PATHS.ROOT;
  const domainsDir = opts.domainsDir || path.join(root, 'qa-system', 'domains');
  const sutFile = opts.sutFile || path.join(root, 'knowledge', '_sut.json');
  const overrideFile = opts.overrideFile || path.join(root, 'knowledge', '_domain.md');
  const rel = (p) => posix(path.relative(root, p));

  const sut = fs.existsSync(sutFile) ? readJson(sutFile) : {};
  const ids = selectedIds(sut);

  const available = listPacks(domainsDir);
  const unknown = ids.filter((id) => !available.includes(id));
  if (unknown.length) {
    throw new Error(`knowledge/_sut.json chọn ngành không có trong qa-system/domains/: ${unknown.join(', ')}. ` +
      `Các pack đang có: ${available.join(', ') || '(chưa có pack nào)'}. Không tự đoán pack gần nhất.`);
  }

  const result = {
    ids,
    packs: [],
    conflictTopics: ids.length ? {} : null,
    datagen: { types: {}, enums: {} },
    units: [],
    files: { vocab: [], risks: [], rulePatterns: [] },
    override: null,
  };
  const dg = { types: {}, enums: {} };
  const addUnits = (list) => { for (const u of list) if (!result.units.includes(u)) result.units.push(u); };

  for (const id of ids) {
    const dir = path.join(domainsDir, id);
    result.packs.push({ id, dir: rel(dir), readme: rel(path.join(dir, 'README.md')) });
    for (const [file, key] of Object.entries(MD_KEYS)) {
      if (fs.existsSync(path.join(dir, file))) result.files[key].push(rel(path.join(dir, file)));
    }

    const topicsFile = path.join(dir, 'conflict_topics.json');
    const topics = fs.existsSync(topicsFile) ? readJson(topicsFile).topics || {} : {};
    for (const [key, topic] of Object.entries(topics)) {
      // Hai pack trùng khoá chủ đề: giữ cả hai, khoá thứ hai mang tiền tố pack — không ghi đè lặng lẽ.
      result.conflictTopics[key in result.conflictTopics ? `${id}:${key}` : key] = topic;
    }

    const dgFile = path.join(dir, 'datagen.json');
    if (fs.existsSync(dgFile)) mergeDatagen(dg, readJson(dgFile), `${id}/datagen.json`);
    const unitsFile = path.join(dir, 'units.json');
    if (fs.existsSync(unitsFile)) addUnits(unitsOf(readJson(unitsFile)));
  }

  // knowledge/_domain.md là của dự án ⇒ thắng pack khi trùng tên (người dự án đã viết ra, không phải máy đoán).
  if (fs.existsSync(overrideFile)) {
    const ov = parseOverride(readText(overrideFile), rel(overrideFile));
    const has = Object.values(ov).some((v) => v !== null);
    if (has) {
      result.override = { file: rel(overrideFile), ...ov };
      for (const key of ['vocab', 'risks', 'rulePatterns']) if (ov[key]) result.files[key].push(rel(overrideFile));
      if (ov.datagen) mergeDatagen(dg, ov.datagen, rel(overrideFile), { override: true });
      if (ov.units) addUnits(unitsOf(ov.units));
    }
  }

  for (const kind of ['types', 'enums']) {
    for (const [name, { def }] of Object.entries(dg[kind])) result.datagen[kind][name] = def;
  }
  return result;
}

// ───────────────────────── Kiểm một pack (agent-doctor) ─────────────────────────

/**
 * @param {string} dir  thư mục pack
 * @param {{template?: boolean, engines?: string[]}} opts  template: cho phép khuôn `<to be filled>`, bỏ kiểm URL
 * @returns {Array<{level: 'FAIL'|'WARN', file: string, msg: string}>}
 */
function validatePack(dir, { template = false, engines = null } = {}) {
  const out = [];
  const fail = (file, msg) => out.push({ level: 'FAIL', file, msg });
  const warn = (file, msg) => out.push({ level: 'WARN', file, msg });
  const id = path.basename(dir);

  if (!template && !PACK_ID.test(id)) fail('.', `Tên pack "${id}" phải là chữ thường, số, gạch nối`);

  for (const f of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(dir, f))) fail(f, 'Thiếu file bắt buộc');
  }

  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const full = path.join(dir, f);
    if (!fs.statSync(full).isFile() || !/\.(md|json)$/.test(f)) continue;
    const text = readText(full);

    const ids = [...new Set(text.match(FACT_ID) || [])];
    if (ids.length) fail(f, `Chứa mã sự thật ${ids.slice(0, 5).join(', ')} — pack là checklist, không phải nguồn BR/FD (QA_STANDARD §10)`);
    if (!template && PLACEHOLDER.test(text)) warn(f, 'Còn ô khuôn `<to be filled …>` — điền nguồn hoặc ghi `Unknown`');

    if (!f.endsWith('.json')) continue;
    let json;
    try { json = JSON.parse(text); } catch (e) { fail(f, `JSON không đọc được — ${e.message}`); continue; }

    if (f === 'conflict_topics.json') {
      const topics = json.topics;
      if (!topics || typeof topics !== 'object' || Array.isArray(topics)) { fail(f, 'Cần khoá "topics" là object'); continue; }
      for (const [k, t] of Object.entries(topics)) {
        if (!t || typeof t.category !== 'string' || !Array.isArray(t.allow) || !Array.isArray(t.deny)) {
          fail(f, `topics.${k} cần "category" (chuỗi), "allow" và "deny" (mảng)`);
        }
      }
    } else if (f === 'datagen.json') {
      for (const kind of ['types', 'enums']) {
        if (json[kind] !== undefined && (typeof json[kind] !== 'object' || Array.isArray(json[kind]))) fail(f, `"${kind}" phải là object`);
      }
      for (const [name, def] of Object.entries(json.types || {})) {
        if (name.startsWith('_')) continue;
        if (!def || typeof def.generator !== 'string') { fail(f, `types.${name} cần "generator" (tên engine của generate-dataset)`); continue; }
        if (engines && !engines.includes(def.generator)) fail(f, `types.${name}.generator "${def.generator}" không phải engine có thật (${engines.join(', ')})`);
      }
      for (const [name, vals] of Object.entries(json.enums || {})) {
        if (!name.startsWith('_') && !Array.isArray(vals)) fail(f, `enums.${name} phải là mảng`);
      }
    } else if (f === 'units.json') {
      if (!Array.isArray(json.units) || json.units.some((u) => typeof u !== 'string')) fail(f, 'Cần khoá "units" là mảng chuỗi');
    }
  }

  const readme = path.join(dir, 'README.md');
  if (!template && fs.existsSync(readme)) {
    const text = readText(readme);
    if (!/https?:\/\/\S+/.test(text) && !/\bUnknown\b/.test(text)) {
      fail('README.md', 'Cần ít nhất một URL nguồn (http/https) hoặc ghi rõ `Unknown` — không tự đặt nguồn');
    }
  }
  return out;
}

module.exports = { loadDomain, listPacks, validatePack, parseOverride, selectedIds, REQUIRED_FILES };
