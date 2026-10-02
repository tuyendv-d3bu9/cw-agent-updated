#!/usr/bin/env node
/**
 * gate-hook.js — Bridge between the Claude Code PreToolUse hook and `gate.js`.
 *
 * Layer 2 of the ASK gate. Unlike the rule written in AGENTS.md, this one is
 * enforced by the harness: the model cannot argue its way past it.
 *
 * Flow: harness pipes tool-call JSON on stdin -> decide whether the target file
 * belongs to stages 3-6 -> ask gate.js -> emit a `deny` decision if closed.
 *
 * Fails open on any unexpected error. This hook exists to stop stage skipping,
 * not to wedge a working session.
 */

const path = require('path');
const { PATHS } = require('../lib/paths');
const { evaluate, LOCKED_DELIVERABLES } = require('./gate');

function allow() {
  process.stdout.write('{}');
  process.exit(0);
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

/** @returns {{slug, file}|null} null when the path is none of the gate's business. */
function classify(filePath) {
  if (!filePath) return null;

  const abs = path.resolve(filePath);
  const rel = path.relative(PATHS.OUTPUT, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;

  const parts = rel.split(path.sep);
  if (parts.length < 2) return null;

  const [slug, ...rest] = parts;
  if (slug.startsWith('_')) return null; // OUTPUT/_template_run, OUTPUT/_upgrades, ...

  const fileName = rest[rest.length - 1];
  if (!LOCKED_DELIVERABLES.includes(fileName)) return null;

  return { slug, file: fileName };
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
      return allow();
    }

    const target = classify(payload?.tool_input?.file_path);
    if (!target) return allow();

    let state;
    try {
      state = evaluate(target.slug);
    } catch {
      return allow();
    }

    if (!state.blocked) return allow();

    const questions = state.pending.map((q) => `  - [${q.id}] ${q.question}`).join('\n');

    deny(
      [
        `ASK GATE IS CLOSED — do not write ${target.file} for task "${target.slug}".`,
        '',
        'Reasons:',
        ...state.reasons.map((r) => `  - ${r}`),
        questions ? `\nUnanswered questions:\n${questions}` : '',
        '',
        'This block comes from the harness, not from the model. Telling the agent to',
        '"just continue" will not lift it. Present the questions above to the user and wait for:',
        `  (1) BA/PO answer -> record in section 7 of ${state.knowledgePath}, status = Confirmed`,
        '  (2) OR an explicit business decision -> record in section 8 of that file',
        '',
        'Test cases built on unsettled rules are hallucinations and cannot be signed off.',
      ]
        .filter((l) => l !== '')
        .join('\n')
    );
  });
}

main();
