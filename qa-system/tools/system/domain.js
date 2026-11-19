#!/usr/bin/env node
/**
 * domain.js — Which domain pack the project selected, and which files that pack provides per stage.
 *
 *   npm run domain            Selected domain (knowledge/_sut.json → domain), skill files to read, available packs
 *   npm run domain -- --json  Same as above, as JSON (loadDomain result)
 *
 * Read-only. Choosing / changing the domain is a human task: edit `domain` in knowledge/_sut.json.
 * Exit: 0 = readable · 1 = _sut.json selects a non-existent id, or a pack is broken.
 */

const path = require('path');
const { PATHS } = require('../lib/paths');
const { loadDomain, listPacks } = require('../lib/domain');

function run(argv) {
  const available = listPacks(path.join(PATHS.SYSTEM, 'domains'));
  let d;
  try {
    d = loadDomain({ root: PATHS.ROOT });
  } catch (e) {
    return { code: 1, out: `❌ ${e.message}` };
  }
  if (argv.includes('--json')) return { code: 0, out: JSON.stringify({ available, ...d }, null, 2) };

  const lines = [`Available packs: ${available.join(', ') || '(none)'}`];
  if (!d.ids.length) {
    lines.push('Selected domain: (none) — knowledge/_sut.json declares no `domain`; all tools use the legacy default, skills skip the domain-pack step.');
  } else {
    lines.push(`Selected domain: ${d.ids.join(', ')}`);
    lines.push(`  vocab:         ${d.files.vocab.join(' · ') || '—'}`);
    lines.push(`  risks:         ${d.files.risks.join(' · ') || '—'}`);
    lines.push(`  rule-patterns: ${d.files.rulePatterns.join(' · ') || '—'}`);
    lines.push(`  conflict topics: ${Object.keys(d.conflictTopics || {}).length} · datagen types: ${Object.keys(d.datagen.types).join(', ') || '—'} · units: ${d.units.join(', ') || '—'}`);
  }
  if (d.override) lines.push(`Project override: ${d.override.file}`);
  lines.push('A pack is a checklist, not a source of truth (QA_STANDARD §10.3).');
  return { code: 0, out: lines.join('\n') };
}

if (require.main === module) {
  const r = run(process.argv.slice(2));
  console.log(r.out);
  process.exit(r.code);
}

module.exports = { run };
