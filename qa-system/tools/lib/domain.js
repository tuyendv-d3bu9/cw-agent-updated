/**
 * domain.js — Loads the "domain pack" the project selected. One single loader for every tool.
 *
 *   loadDomain({ root, domainsDir })  Reads knowledge/_sut.json → `domain`, merges the packs + knowledge/_domain.md
 *   listPacks(domainsDir)             Pack ids present on disk (skips folders starting with `_`)
 *   validatePack(dir, opts)           Validates a pack: required files, readable JSON, README has a source, no FACT ids
 *   parseOverride(text)               Splits the sections of knowledge/_domain.md
 *
 * Why this file exists: conflict topics, generated data types and currency units used to be hard-wired to
 * e-commerce, scattered across three tools. Gathered in one place, every tool reads the SAME domain choice,
 * and a project that selects no domain behaves exactly as before (every tool falls back to the old defaults when `ids` is empty).
 *
 * Base rule (QA_STANDARD §10): a pack is a CHECKLIST, not a source of truth. The loader returns only paths and
 * machine-readable config; it never turns pack content into BR/FD.
 *
 * Pure: only reads files — no writes, no printing, no state kept between calls.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = ['README.md', 'vocab.md', 'risks.md', 'rule-patterns.md', 'conflict_topics.json', 'datagen.json', 'units.json'];
const MD_KEYS = { 'vocab.md': 'vocab', 'risks.md': 'risks', 'rule-patterns.md': 'rulePatterns' };
const PACK_ID = /^[a-z0-9][a-z0-9-]*$/;

// Fact ids of QA_STANDARD §9.1. A pack containing such an id is posing as a source of truth.
const FACT_ID = /\b(?:BR|FD|AF|OQ|MR|RK|TI)-\d+\b/g;
// A cell that is still a template: `<to be filled …>`, `<điền>` — treated as undeclared (QA_STANDARD §8 reading rule).
const PLACEHOLDER = /<\s*(?:to be filled|điền)[^>]*>/iu;

const posix = (p) => p.split(path.sep).join('/');
const readText = (p) => fs.readFileSync(p, 'utf-8');

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (e) {
    throw new Error(`${file}: unreadable JSON — ${e.message}`);
  }
}

function listPacks(domainsDir) {
  if (!fs.existsSync(domainsDir)) return [];
  return fs.readdirSync(domainsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name))
    .map((d) => d.name)
    .sort();
}

/** `domain` of _sut.json: a string or an array. Empty / template `<…>` = no domain selected. */
function selectedIds(sut) {
  const raw = sut && sut.domain;
  if (raw === undefined || raw === null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  const ids = [];
  for (const v of list) {
    if (typeof v !== 'string') throw new Error(`knowledge/_sut.json: "domain" must be a string or an array of strings, got ${JSON.stringify(v)}`);
    const id = v.trim();
    if (!id || /^<.*>$/.test(id)) continue;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * The real content text of a section: drops HTML comments, `>` instruction lines, template lines,
 * table header and rule lines (a table with only a header is an empty table).
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
    throw new Error(`${where}: unreadable \`\`\`json block — ${e.message}`);
  }
}

const SECTION_KEYS = { vocab: 'vocab', risks: 'risks', 'rule-patterns': 'rulePatterns', datagen: 'datagen', units: 'units' };

/**
 * knowledge/_domain.md: the sections `## vocab` · `## risks` · `## rule-patterns` (free markdown) and
 * `## datagen` · `## units` (a ```json block in the same format as the pack file). A section that is only a template ⇒ ignored.
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

/** Merge datagen from several sources. Same name with different definitions ⇒ error, never picks a side. */
function mergeDatagen(target, src, from, { override = false } = {}) {
  for (const kind of ['types', 'enums']) {
    for (const [name, def] of Object.entries((src && src[kind]) || {})) {
      if (name.startsWith('_')) continue;
      const prev = target[kind][name];
      if (prev && !override && !sameJson(prev.def, def)) {
        throw new Error(`datagen.${kind}.${name} is defined differently in ${prev.from} and ${from} — fix one side or declare it in knowledge/_domain.md`);
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
 *   conflictTopics = null when no domain is selected ⇒ tools use the old default topics.
 *   Paths in `packs`/`files` are relative to `root`, with `/` separators.
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
    throw new Error(`knowledge/_sut.json selects a domain that is not in qa-system/domains/: ${unknown.join(', ')}. ` +
      `Available packs: ${available.join(', ') || '(no pack yet)'}. Do not guess the closest pack.`);
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
      // Two packs share a topic key: keep both, the second key gets the pack prefix — no silent overwrite.
      result.conflictTopics[key in result.conflictTopics ? `${id}:${key}` : key] = topic;
    }

    const dgFile = path.join(dir, 'datagen.json');
    if (fs.existsSync(dgFile)) mergeDatagen(dg, readJson(dgFile), `${id}/datagen.json`);
    const unitsFile = path.join(dir, 'units.json');
    if (fs.existsSync(unitsFile)) addUnits(unitsOf(readJson(unitsFile)));
  }

  // knowledge/_domain.md belongs to the project ⇒ wins over a pack on a name clash (the project wrote it, not a machine guess).
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

// ───────────────────────── Validate a pack (agent-doctor) ─────────────────────────

/**
 * @param {string} dir  pack directory
 * @param {{template?: boolean, engines?: string[]}} opts  template: allow `<to be filled>` placeholders, skip the URL check
 * @returns {Array<{level: 'FAIL'|'WARN', file: string, msg: string}>}
 */
function validatePack(dir, { template = false, engines = null } = {}) {
  const out = [];
  const fail = (file, msg) => out.push({ level: 'FAIL', file, msg });
  const warn = (file, msg) => out.push({ level: 'WARN', file, msg });
  const id = path.basename(dir);

  if (!template && !PACK_ID.test(id)) fail('.', `Pack name "${id}" must be lowercase letters, digits, hyphens`);

  for (const f of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(dir, f))) fail(f, 'Missing required file');
  }

  for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const full = path.join(dir, f);
    if (!fs.statSync(full).isFile() || !/\.(md|json)$/.test(f)) continue;
    const text = readText(full);

    const ids = [...new Set(text.match(FACT_ID) || [])];
    if (ids.length) fail(f, `Contains fact ids ${ids.slice(0, 5).join(', ')} — a pack is a checklist, not a BR/FD source (QA_STANDARD §10)`);
    if (!template && PLACEHOLDER.test(text)) warn(f, 'Still has a `<to be filled …>` placeholder — fill in the source or write `Unknown`');

    if (!f.endsWith('.json')) continue;
    let json;
    try { json = JSON.parse(text); } catch (e) { fail(f, `unreadable JSON — ${e.message}`); continue; }

    if (f === 'conflict_topics.json') {
      const topics = json.topics;
      if (!topics || typeof topics !== 'object' || Array.isArray(topics)) { fail(f, 'Key "topics" must be an object'); continue; }
      for (const [k, t] of Object.entries(topics)) {
        if (!t || typeof t.category !== 'string' || !Array.isArray(t.allow) || !Array.isArray(t.deny)) {
          fail(f, `topics.${k} needs "category" (string), "allow" and "deny" (arrays)`);
        }
      }
    } else if (f === 'datagen.json') {
      for (const kind of ['types', 'enums']) {
        if (json[kind] !== undefined && (typeof json[kind] !== 'object' || Array.isArray(json[kind]))) fail(f, `"${kind}" must be an object`);
      }
      for (const [name, def] of Object.entries(json.types || {})) {
        if (name.startsWith('_')) continue;
        if (!def || typeof def.generator !== 'string') { fail(f, `types.${name} needs "generator" (a generate-dataset engine name)`); continue; }
        if (engines && !engines.includes(def.generator)) fail(f, `types.${name}.generator "${def.generator}" is not a real engine (${engines.join(', ')})`);
      }
      for (const [name, vals] of Object.entries(json.enums || {})) {
        if (!name.startsWith('_') && !Array.isArray(vals)) fail(f, `enums.${name} must be an array`);
      }
    } else if (f === 'units.json') {
      if (!Array.isArray(json.units) || json.units.some((u) => typeof u !== 'string')) fail(f, 'Key "units" must be an array of strings');
    }
  }

  const readme = path.join(dir, 'README.md');
  if (!template && fs.existsSync(readme)) {
    const text = readText(readme);
    if (!/https?:\/\/\S+/.test(text) && !/\bUnknown\b/.test(text)) {
      fail('README.md', 'Needs at least one source URL (http/https) or an explicit `Unknown` — never invent a source');
    }
  }
  return out;
}

module.exports = { loadDomain, listPacks, validatePack, parseOverride, selectedIds, REQUIRED_FILES };
