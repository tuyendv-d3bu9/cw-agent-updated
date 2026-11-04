#!/usr/bin/env node
/**
 * gate-hook.js — Bridge between the Claude Code PreToolUse hook and `gate.js`.
 *
 * Layer 2 of the ASK gate, enforced by the harness rather than by the model.
 *
 *   Write / Edit / MultiEdit   tool_input.file_path
 *   NotebookEdit               tool_input.notebook_path
 *   Bash (best-effort)         redirections, tee, cp/mv/install/rsync/ln, sed -i,
 *                              dd of=, touch, interpreter one-liners that write a
 *                              locked path, and `testcases:merge` / export runs
 *
 * Locked: OUTPUT/<slug>/0[3-6]*_* (case-insensitive) and OUTPUT/<slug>/testcases/**.
 * An unparseable payload is allowed (never wedge the session); a gate that
 * throws while judging a locked path denies (fail-closed, QA_STANDARD §1).
 */

const fs = require('fs');
const path = require('path');
const { PATHS, listTaskSlugs } = require('../lib/paths');
const { evaluate, isLockedPath } = require('./gate');

function emitAllow() {
  return '{}';
}

function emitDeny(reason) {
  return JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  });
}

/** Case-insensitive match of a slug against the real task folders (macOS FS). */
function realSlug(slug) {
  try {
    return listTaskSlugs().find((s) => s.toLowerCase() === slug.toLowerCase()) || slug;
  } catch {
    return slug;
  }
}

/** @returns {{slug, file}|null} null when the path is none of the gate's business. */
function classify(filePath, cwd = process.cwd()) {
  if (!filePath || typeof filePath !== 'string') return null;
  const abs = path.resolve(cwd, filePath.replace(/^["']|["']$/g, ''));
  const out = PATHS.OUTPUT;
  // Compare case-insensitively: on macOS `output/T/05_X.md` is the same file.
  if (!abs.toLowerCase().startsWith(out.toLowerCase() + path.sep)) return null;
  const rel = abs.slice(out.length + 1);
  const parts = rel.split(path.sep).filter(Boolean);
  if (parts.length < 2) return null;
  const [slug, ...rest] = parts;
  if (/^[_.]/.test(slug) || /[$`*?{}()<>]/.test(slug)) return null;
  const inner = rest.join('/');
  if (!isLockedPath(inner)) return null;
  return { slug: realSlug(slug), file: inner };
}

// ───────────────────────────── Bash (best-effort) ─────────────────────────────

/** Splits a shell line into simple commands on && || ; | and newlines (quotes respected). */
function splitCommands(cmd) {
  const out = [];
  let cur = '';
  let q = null;
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (q) { cur += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'") { q = c; cur += c; continue; }
    if (c === '\n' || c === ';' || (c === '&' && cmd[i + 1] === '&') || c === '|') {
      // keep `>|` and `|&` simple: treat any pipe as a separator except right after `>`
      if (c === '|' && cur.endsWith('>')) { cur += c; continue; }
      out.push(cur);
      cur = '';
      if ((c === '&' || c === '|') && cmd[i + 1] === c) i++;
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

function tokenize(s) {
  const toks = [];
  const re = /"((?:[^"\\]|\\.)*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(s))) toks.push(m[1] ?? m[2] ?? m[3]);
  return toks;
}

const WRITE_API = /writeFile|appendFile|createWriteStream|copyFile|rename|write_text|write_bytes|open\([^)]*['"][wa]\+?['"]|shutil\.(copy|move)/;

/**
 * Targets a Bash command would write. Best-effort: catches the common shapes an
 * agent uses to write a file, not every possible shell program.
 */
function bashTargets(command, cwd) {
  const targets = [];
  let here = cwd;
  for (const seg of splitCommands(command)) {
    const toks = stripEnv(tokenize(seg));
    if (toks[0] === 'cd' && toks[1]) { here = path.resolve(here, toks[1]); continue; }

    // Redirections: > file, >> file, >| file, &> file, 1> file (not 2>&1).
    for (const m of seg.matchAll(/(?:^|[^>&0-9])(?:[0-9]|&)?>>?\|?\s*(?!&)("[^"]+"|'[^']+'|[^\s;&|]+)/g)) {
      targets.push(path.resolve(here, m[1].replace(/^["']|["']$/g, '')));
    }

    const verb = path.basename(toks[0] || '');
    const args = toks.slice(1).filter((t) => !t.startsWith('-'));
    if (verb === 'tee') args.forEach((a) => targets.push(path.resolve(here, a)));
    if (['cp', 'mv', 'install', 'rsync', 'ln', 'ditto'].includes(verb) && args.length >= 2) {
      const dest = path.resolve(here, args[args.length - 1]);
      targets.push(dest);
      for (const src of args.slice(0, -1)) targets.push(path.join(dest, path.basename(src)));
    }
    if (['touch', 'truncate'].includes(verb)) args.forEach((a) => targets.push(path.resolve(here, a)));
    if ((verb === 'sed' || verb === 'perl') && toks.some((t) => /^-[a-zA-Z]*i/.test(t))) {
      args.slice(1).forEach((a) => targets.push(path.resolve(here, a)));
    }
    for (const t of toks) {
      const m = t.match(/^of=(.+)$/);
      if (m) targets.push(path.resolve(here, m[1]));
    }
    // Interpreter one-liners: any locked path mentioned next to a write API.
    if (/^(node|python3?|ruby|perl|bash|sh|zsh|deno|bun)$/.test(verb) && WRITE_API.test(seg)) {
      for (const t of seg.matchAll(/[^\s"'`(),;]*OUTPUT\/[^\s"'`(),;]+/gi)) targets.push(path.resolve(here, t[0]));
    }
  }
  return { targets, cwd: here };
}

/** A token the shell would still expand: not a literal slug or path we can judge. */
const UNRESOLVED = /[$`*?{}()<>]/;

/** Drops leading `VAR=value` assignments: `FOO=1 npm run …` -> `npm run …`. */
function stripEnv(toks) {
  let i = 0;
  while (i < toks.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(toks[i])) i++;
  return toks.slice(i);
}

const isInside = (dir, root) => {
  const rel = path.relative(root, dir);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

const TOOL_RE = /^testcases:(merge|export)$/;

/**
 * Slugs a merge/export run would touch — only when the command EXECUTES the
 * tool: `npm|pnpm|yarn run testcases:<merge|export> <slug>`, `node …/<merge|export>-testcases(.js) <slug>`,
 * or `node -e|--eval` code requiring those modules with a literal slug. Mentioning
 * the file name (grep, sed, cat, a commit message) is not a run. No resolvable
 * literal slug, or a run in another project ⇒ nothing to judge here: the tools
 * refuse on their own when the gate is closed, and `gate audit` keeps the record.
 */
function toolSlugs(command, cwd = process.cwd()) {
  const out = [];
  let here = cwd;
  for (const seg of splitCommands(command)) {
    const toks = stripEnv(tokenize(seg));
    if (toks[0] === 'cd' && toks[1]) { here = path.resolve(here, toks[1]); continue; }
    const verb = path.basename(toks[0] || '');
    let tool = null;
    let rest = [];
    let root = here;

    if (/^(npm|pnpm|yarn)$/.test(verb)) {
      const i = toks.findIndex((t, k) => k > 0 && TOOL_RE.test(t));
      const runIdx = toks.findIndex((t) => t === 'run' || t === 'run-script');
      if (i !== -1 && (verb === 'yarn' || (runIdx !== -1 && runIdx < i))) {
        tool = toks[i];
        rest = toks.slice(i + 1);
        const prefix = toks.findIndex((t) => t === '--prefix' || t === '-C');
        if (prefix !== -1 && toks[prefix + 1]) root = path.resolve(here, toks[prefix + 1]);
      }
    } else if (verb === 'node') {
      const evalIdx = toks.findIndex((t) => t === '-e' || t === '--eval' || t === '-p' || t === '--print');
      if (evalIdx !== -1) {
        const code = toks[evalIdx + 1] || '';
        const m = code.match(/require\(\s*['"`]([^'"`]*(merge|export)-testcases(?:\.js)?)['"`]\s*\)/);
        if (m) {
          tool = `testcases:${m[2]}`;
          root = path.resolve(here, path.dirname(m[1]));
          const lit = code.match(/\b(?:merge|runExport|exportTestCases)\(\s*['"]([^'"]+)['"]/);
          rest = lit ? [lit[1]] : [];
        }
      } else {
        const script = toks.slice(1).find((t) => !t.startsWith('-'));
        const m = script && path.basename(script).match(/^(merge|export)-testcases(?:\.js)?$/);
        if (m) {
          tool = `testcases:${m[1]}`;
          root = path.dirname(path.resolve(here, script));
          rest = toks.slice(toks.indexOf(script) + 1);
        }
      }
    }
    if (!tool) continue;
    if (!isInside(root, PATHS.ROOT)) continue; // another project: its own hook judges it
    const slug = rest.find((t) => t !== '--' && !t.startsWith('-'));
    if (!slug || UNRESOLVED.test(slug) || /[\s/\\]/.test(slug)) continue;
    out.push({ slug: realSlug(slug), tool });
  }
  return out;
}

// ───────────────────────────── Decision ─────────────────────────────

function denyMessage(slug, what, state) {
  const questions = (state.pending || []).map((q) => `  - [${q.id}] ${q.question}`).join('\n');
  return [
    `ASK GATE IS CLOSED — ${what} for task "${slug}" is blocked.`,
    '',
    'Reasons:',
    ...(state.reasons || []).map((r) => `  - ${r}`),
    questions ? `\nUnanswered questions:\n${questions}` : '',
    '',
    'This block comes from the harness, not from the model. Telling the agent to',
    '"just continue" will not lift it. Present the questions above to the user and wait for:',
    `  (1) BA/PO answer -> knowledge §7 of ${state.knowledgePath}: Phản hồi chính thức + status Confirmed/Rejected`,
    '  (2) OR a decision with Người phê duyệt + Ngày chốt in §8 of that file',
    'Then run `npm run gate <slug>` and paste the real result.',
  ]
    .filter((l) => l !== '')
    .join('\n');
}

/** Pure decision: returns the hook's stdout string for a payload object. */
function decide(payload) {
  const tool = payload?.tool_name || '';
  const input = payload?.tool_input || {};
  const cwd = payload?.cwd || process.cwd();

  /** [{slug, what}] the call would touch. */
  const touches = [];
  if (tool === 'Bash') {
    const cmd = String(input.command || '');
    const { targets } = bashTargets(cmd, cwd);
    for (const t of targets) {
      const c = classify(t, cwd);
      if (c) touches.push({ slug: c.slug, what: `writing ${c.file} via Bash` });
    }
    for (const t of toolSlugs(cmd, cwd)) touches.push({ slug: t.slug, what: `running ${t.tool}` });
  } else {
    const fp = input.file_path || input.notebook_path || input.path;
    const c = classify(fp, cwd);
    if (c) touches.push({ slug: c.slug, what: `writing ${c.file}` });
  }
  if (touches.length === 0) return emitAllow();

  for (const t of touches) {
    let state;
    try {
      state = evaluate(t.slug);
    } catch (e) {
      return emitDeny(`ASK gate could not be evaluated for "${t.slug}" (${e.message}) — fail-closed. Run \`npm run gate ${t.slug}\`.`);
    }
    if (state.blocked) return emitDeny(denyMessage(t.slug, t.what, state));
  }
  return emitAllow();
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf-8');
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    let payload;
    try {
      payload = JSON.parse(raw || '{}');
    } catch {
      process.stdout.write(emitAllow());
      return process.exit(0);
    }
    process.stdout.write(decide(payload));
    process.exit(0);
  });
}

if (require.main === module) main();

module.exports = { decide, classify, bashTargets, toolSlugs, splitCommands };
