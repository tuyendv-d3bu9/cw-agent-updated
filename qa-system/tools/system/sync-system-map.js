#!/usr/bin/env node
/**
 * sync-system-map.js — Automatically synchronizes knowledge/_system_map.json
 *
 * Usage:
 *   npm run map:sync
 */

const fs = require('fs');
const path = require('path');
const { PATHS, listTaskSlugs } = require('../lib/paths');

const mapPath = PATHS.SYSTEM_MAP;
const outputDir = PATHS.OUTPUT;
const inputDir = PATHS.INPUT;
const featuresDir = PATHS.FEATURES;

if (!fs.existsSync(mapPath)) {
  console.error(`Error: File not found: ${mapPath}`);
  process.exit(1);
}

let mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
mapData.last_updated = new Date().toISOString().split('T')[0];
mapData.features_inventory = {};

// Scan existing features in OUTPUT/
if (fs.existsSync(outputDir)) {
  const tasks = listTaskSlugs();

  tasks.forEach(slug => {
    const taskDir = path.join(outputDir, slug);
    const planFile = path.join(taskDir, '00_plan.md');
    const specFile = path.join(taskDir, '05_test_case_spec.md');
    const featureKnowledge = `knowledge/features/${slug}.md`;

    // Find corresponding input file
    let inputFile = `INPUT/${slug}.md`;
    if (fs.existsSync(inputDir)) {
      const inputs = fs.readdirSync(inputDir);
      const match = inputs.find(i => i.toLowerCase().includes(slug.replace(/-/g, ' ')) || i.toLowerCase().includes(slug));
      if (match) inputFile = `INPUT/${match}`;
    }

    let status = 'IN-PROGRESS';
    let lastVerdict = 'UNKNOWN';
    let totalTCs = 0;

    if (fs.existsSync(planFile)) {
      const planText = fs.readFileSync(planFile, 'utf8');
      if (planText.includes('COMPLETED') || (planText.match(/- \[x\]/g) || []).length >= 6) {
        status = 'COMPLETED (PASS)';
        lastVerdict = 'PASS';
      } else if (planText.includes('Verdict: ASK')) {
        status = 'WAITING_FOR_BA (ASK)';
        lastVerdict = 'ASK';
      }
    }

    if (fs.existsSync(specFile)) {
      const specText = fs.readFileSync(specFile, 'utf8');
      const tcMatches = specText.match(/### TC_ID:/g);
      if (tcMatches) totalTCs = tcMatches.length;
    }

    mapData.features_inventory[slug] = {
      name: slug,
      input_file: inputFile,
      knowledge_file: featureKnowledge,
      output_dir: `OUTPUT/${slug}/`,
      plan_file: `OUTPUT/${slug}/00_plan.md`,
      status: status,
      total_testcases: totalTCs,
      last_verdict: lastVerdict
    };
  });
}

// Domain pack catalogue: read from disk so the map never drifts when a pack is added (qa-system/domains/README.md §5).
// Which pack a project selects lives in knowledge/_sut.json, not here — the map belongs to the framework.
const { listPacks } = require('../lib/domain');
const domainsDir = path.join(PATHS.SYSTEM, 'domains');
mapData.domains_index = {
  catalogue: 'qa-system/domains/README.md',
  template: 'qa-system/domains/_template/',
  selected_in: 'knowledge/_sut.json → domain',
  rule: 'qa-system/core/QA_STANDARD.md §10.3 — pack là checklist, không phải nguồn sự thật',
  packs: Object.fromEntries(listPacks(domainsDir).map((id) => [id, `qa-system/domains/${id}/`])),
};

fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
console.log('✅ Successfully synchronized system map:');
console.log(`  -> ${mapPath}`);
console.log(`  -> Updated ${Object.keys(mapData.features_inventory).length} feature(s) in system inventory.`);
console.log(`  -> Indexed ${Object.keys(mapData.domains_index.packs).length} domain pack(s): ${Object.keys(mapData.domains_index.packs).join(', ') || '(none)'}.`);
