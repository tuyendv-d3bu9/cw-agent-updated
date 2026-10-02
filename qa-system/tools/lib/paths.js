/**
 * paths.js — Single source of truth for project directory locations.
 *
 *   PATHS              Frozen map of project directories, all anchored to repo root.
 *   taskDir(slug)      Output directory of one task.
 *   featureKnowledge() Knowledge file of one feature.
 *   listTaskSlugs()    Task slugs currently present in OUTPUT/.
 *
 * Every tool must read paths from here. Computing `__dirname/../..` locally
 * breaks as soon as a tool moves to a different nesting depth.
 */

const path = require('path');
const fs = require('fs');

// lib/ lives at qa-system/tools/lib — three levels below repo root.
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  ROOT: ROOT_DIR,
  INPUT: path.join(ROOT_DIR, 'INPUT'),
  OUTPUT: path.join(ROOT_DIR, 'OUTPUT'),
  KNOWLEDGE: path.join(ROOT_DIR, 'knowledge'),
  FEATURES: path.join(ROOT_DIR, 'knowledge', 'features'),
  SYSTEM: path.join(ROOT_DIR, 'qa-system'),
  AGENTS: path.join(ROOT_DIR, 'qa-system'), // legacy alias
  TOOLS: path.join(ROOT_DIR, 'qa-system', 'tools'),
  TEMPLATES: path.join(ROOT_DIR, 'qa-system', 'templates'),
  AUTOMATION: path.join(ROOT_DIR, 'automation'),
  SYSTEM_MAP: path.join(ROOT_DIR, 'knowledge', '_system_map.json'),
  ENV_FILE: path.join(ROOT_DIR, '.env'),
};

function taskDir(slug) {
  return path.join(PATHS.OUTPUT, slug);
}

function featureKnowledge(slug) {
  return path.join(PATHS.FEATURES, `${slug}.md`);
}

/** Skips system folders (leading `_`) and backups (`.bak`). */
function listTaskSlugs() {
  if (!fs.existsSync(PATHS.OUTPUT)) return [];
  return fs.readdirSync(PATHS.OUTPUT).filter((name) => {
    if (name.startsWith('_') || name.endsWith('.bak')) return false;
    return fs.statSync(path.join(PATHS.OUTPUT, name)).isDirectory();
  });
}

module.exports = { PATHS, taskDir, featureKnowledge, listTaskSlugs };
