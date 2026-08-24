#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  fail('Usage: node scripts/lint-copy.mjs <message-map.json>');
}

const map = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!map.hero || typeof map.hero !== 'object') fail('hero is required');

for (const field of ['h1', 'subhead', 'primaryCta']) {
  if (!map.hero[field] || String(map.hero[field]).trim().length < 6) {
    fail(`hero.${field} is missing or weak`);
  }
}

if (!Array.isArray(map.sections) || map.sections.length < 5) {
  fail('sections must contain at least 5 sections');
}

for (const [index, section] of map.sections.entries()) {
  for (const field of ['job', 'headline', 'ctaRole']) {
    if (!section[field]) fail(`sections[${index}].${field} is required`);
  }
}

if (!Array.isArray(map.proofClaims) || map.proofClaims.length < 3) {
  fail('proofClaims must contain at least 3 claims');
}

for (const [index, claim] of map.proofClaims.entries()) {
  if (!claim.claim || !claim.evidenceType || !claim.sourceStatus) {
    fail(`proofClaims[${index}] needs claim, evidenceType, and sourceStatus`);
  }
}

if (!Array.isArray(map.objections) || map.objections.length < 5) {
  fail('objections must contain at least 5 objections');
}

const labels = new Set(
  [map.hero.primaryCta, ...(map.primaryCtaInstances || [])]
    .map((label) => String(label).trim().toLowerCase())
    .filter(Boolean)
);
if (labels.size > 1) {
  fail(`multiple primary CTA labels found: ${[...labels].join(', ')}`);
}

console.log(`OK: ${file}`);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
