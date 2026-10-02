/**
 * conflict-detector.js
 * Cross-Feature Knowledge Conflict Detector Module
 * 
 * Goal: Automatically cross-references Business Rules between feature knowledge bases in knowledge/features/*.md
 * Identifies logic contradictions (Promotion stacking, Guest vs Member, Cancellation/Refund, Constants).
 * 
 * Usage:
 *   node agents/tools/conflict-detector.js [target-feature-slug]
 */

const fs = require('fs');
const path = require('path');
const { PATHS } = require('../lib/paths');

const ROOT_DIR = PATHS.ROOT;
const FEATURES_DIR = path.join(ROOT_DIR, 'knowledge', 'features');
const OUTPUT_DIR = path.join(ROOT_DIR, 'OUTPUT');

// Sensitive business logic keywords
const PATTERNS = {
  stacking: {
    category: 'Promotion / Benefit Stacking',
    allowKeywords: ['cộng dồn', 'kết hợp', 'áp dụng đồng thời', 'stackable', 'dùng chung', 'combine', 'stacking allowed'],
    denyKeywords: ['không cộng dồn', 'không áp dụng đồng thời', 'chỉ 1 mã', 'duy nhất 1', 'không dùng chung', 'non-stackable', 'cannot combine']
  },
  guestCheckout: {
    category: 'Account Authentication Precondition (Guest vs Registered)',
    allowKeywords: ['không cần đăng nhập', 'khách vãng lai', 'guest', 'chưa đăng nhập', 'anonymous'],
    denyKeywords: ['bắt buộc đăng nhập', 'yêu cầu đăng nhập', 'phải đăng nhập', 'chỉ áp dụng thành viên', 'tài khoản kích hoạt', 'must login', 'authentication required']
  },
  cancellationRefund: {
    category: 'Cancellation & Refund Policy',
    allowKeywords: ['hoàn lại mã', 'hoàn voucher', 'phục hồi mã', 'restore voucher', 'hoàn về ví', 'refund', 'restore'],
    denyKeywords: ['không hoàn lại', 'hủy là mất', 'mất quyền sử dụng', 'không phục hồi', 'non-refundable', 'forfeited']
  },
  shippingDiscount: {
    category: 'Discount Scope (Shipping Fee vs Subtotal)',
    allowKeywords: ['giảm cả phí ship', 'áp dụng phí vận chuyển', 'freeship kết hợp', 'applies to shipping'],
    denyKeywords: ['chỉ áp dụng tiền hàng', 'không giảm phí vận chuyển', 'không bao gồm ship', 'subtotal only']
  }
};

function parseFeatureFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const slug = path.basename(filePath, '.md');

  // Extract title
  const titleMatch = content.match(/^#\s+(?:Tính năng:\s*)?([^\n]+)/m);
  const title = titleMatch ? titleMatch[1].trim() : slug;

  // Extract Business Rules
  const rules = [];
  
  // Table format: | BR-01 | Rule content | Source | Status |
  const tableRowRegex = /\|\s*(BR-[0-9]+)\s*\|\s*([^|]+)\s*\|/gi;
  let match;
  while ((match = tableRowRegex.exec(content)) !== null) {
    rules.push({
      id: match[1].toUpperCase(),
      title: match[2].trim(),
      body: match[2].trim()
    });
  }

  // Header format: ### BR-01: ...
  const headerRegex = /###\s+(BR-[0-9]+)[:\s]+([^\n]+)/gi;
  while ((match = headerRegex.exec(content)) !== null) {
    if (!rules.some(r => r.id === match[1].toUpperCase())) {
      rules.push({
        id: match[1].toUpperCase(),
        title: match[2].trim(),
        body: match[2].trim()
      });
    }
  }

  return {
    slug,
    title,
    content,
    rules
  };
}

function detectConflicts(features) {
  const conflicts = [];

  for (let i = 0; i < features.length; i++) {
    for (let j = i + 1; j < features.length; j++) {
      const featA = features[i];
      const featB = features[j];

      for (const [key, ruleDef] of Object.entries(PATTERNS)) {
        const textA = featA.content.toLowerCase();
        const textB = featB.content.toLowerCase();

        const aAllows = ruleDef.allowKeywords.some(kw => textA.includes(kw));
        const aDenies = ruleDef.denyKeywords.some(kw => textA.includes(kw));

        const bAllows = ruleDef.allowKeywords.some(kw => textB.includes(kw));
        const bDenies = ruleDef.denyKeywords.some(kw => textB.includes(kw));

        // Case 1: A allows, B denies
        if (aAllows && bDenies) {
          conflicts.push({
            type: ruleDef.category,
            featureA: `${featA.slug} (${featA.title})`,
            featureB: `${featB.slug} (${featB.title})`,
            description: `Feature [${featA.slug}] permits this behavior while [${featB.slug}] restricts or forbids it.`,
            recommendation: `Clarify with BA/PO regarding rule precedence when both features are engaged.`
          });
        }
        // Case 2: A denies, B allows
        else if (aDenies && bAllows) {
          conflicts.push({
            type: ruleDef.category,
            featureA: `${featA.slug} (${featA.title})`,
            featureB: `${featB.slug} (${featB.title})`,
            description: `Feature [${featA.slug}] forbids this behavior while [${featB.slug}] permits it.`,
            recommendation: `Clarify with BA/PO regarding precedence order between the two operations.`
          });
        }
      }
    }
  }

  return conflicts;
}

function main() {
  const targetSlug = process.argv[2];

  console.log('🔍 [CONFLICT DETECTOR] Scanning feature knowledge bases in knowledge/features/...\n');

  if (!fs.existsSync(FEATURES_DIR)) {
    console.error('❌ Error: Directory knowledge/features/ does not exist.');
    process.exit(1);
  }

  const files = fs.readdirSync(FEATURES_DIR).filter(f => f.endsWith('.md') && f !== 'README.md');

  if (files.length === 0) {
    console.log('ℹ️ No feature knowledge files found for cross-comparison.');
    return;
  }

  const features = files.map(f => parseFeatureFile(path.join(FEATURES_DIR, f)));
  console.log(`📚 Loaded ${features.length} feature(s):`);
  features.forEach(f => console.log(`  - [${f.slug}] ${f.title} (${f.rules.length} rules)`));

  const conflicts = detectConflicts(features);

  let reportLines = [
    `# CROSS-FEATURE KNOWLEDGE CONFLICT REPORT`,
    `Scan Timestamp: ${new Date().toISOString()} · Scope: ${features.length} feature(s)`,
    ``
  ];

  if (conflicts.length === 0) {
    console.log('\n✅ PASS: No cross-feature logical conflicts detected.');
    reportLines.push(`> [!NOTE]`);
    reportLines.push(`> **VERDICT: PASS** — Features in \`knowledge/features/\` are logically consistent across policies.`);
  } else {
    console.warn(`\n⚠️ Detected ${conflicts.length} potential conflict(s) requiring BA verification:`);
    reportLines.push(`> [!WARNING]`);
    reportLines.push(`> Detected **${conflicts.length} cross-feature logical contradiction(s)**. Recommend including in \`02_missing_rule_report.md\` with Verdict **ASK**.`);
    reportLines.push(``);
    reportLines.push(`| # | Conflict Aspect | Feature A | Feature B | Contradiction Details | Recommendation |`);
    reportLines.push(`|---|---|---|---|---|---|`);

    conflicts.forEach((c, idx) => {
      console.warn(`  [${idx + 1}] ${c.type}:`);
      console.warn(`      ${c.featureA} ⚡ ${c.featureB}`);
      console.warn(`      Detail: ${c.description}`);

      reportLines.push(`| ${idx + 1} | **${c.type}** | ${c.featureA} | ${c.featureB} | ${c.description} | ${c.recommendation} |`);
    });
  }

  if (targetSlug && fs.existsSync(path.join(OUTPUT_DIR, targetSlug))) {
    const reportPath = path.join(OUTPUT_DIR, targetSlug, '01_conflict_warning.md');
    fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf-8');
    console.log(`\n📄 Saved conflict report to: ${reportPath}`);
  }
}

main();
