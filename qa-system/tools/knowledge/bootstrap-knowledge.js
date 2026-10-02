#!/usr/bin/env node
/**
 * bootstrap-knowledge.js — Automatically seeds initial knowledge base for a new project
 *
 * Usage:
 *   node agents/tools/bootstrap-knowledge.js
 *   npm run knowledge:init
 *
 * Rule:
 *   When starting a clean repository without knowledge/, this script copies
 *   seed templates from agents/templates/knowledge/ to knowledge/.
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const rootDir = PATHS.ROOT;
const knowledgeDir = path.join(rootDir, 'knowledge');
const featuresDir = path.join(knowledgeDir, 'features');
const seedDir = path.join(rootDir, 'agents', 'templates', 'knowledge');

function bootstrapKnowledge() {
  console.log('🌱 Checking knowledge base status (knowledge/)...');

  if (!fs.existsSync(knowledgeDir)) {
    fs.mkdirSync(knowledgeDir, { recursive: true });
    console.log(' -> Created directory: knowledge/');
  }

  if (!fs.existsSync(featuresDir)) {
    fs.mkdirSync(featuresDir, { recursive: true });
    console.log(' -> Created directory: knowledge/features/');
  }

  if (!fs.existsSync(seedDir)) {
    console.error(`❌ ERROR: Seed template directory not found at: ${seedDir}`);
    process.exit(1);
  }

  const seedFiles = fs.readdirSync(seedDir);
  let initializedCount = 0;

  seedFiles.forEach(file => {
    const destFile = path.join(knowledgeDir, file);
    if (!fs.existsSync(destFile)) {
      const srcFile = path.join(seedDir, file);
      fs.copyFileSync(srcFile, destFile);
      console.log(` -> Initialized seed file: knowledge/${file}`);
      initializedCount++;
    }
  });

  if (initializedCount > 0) {
    console.log(`🎉 Knowledge base bootstrap complete (${initializedCount} foundational file(s) initialized).`);
  } else {
    console.log('✅ Knowledge base knowledge/ already contains all foundational files.');
  }
}

if (require.main === module) {
  bootstrapKnowledge();
}

module.exports = { bootstrapKnowledge };
