#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  fail('Usage: node scripts/validate-brief.mjs <brief.json>');
}

const brief = JSON.parse(fs.readFileSync(file, 'utf8'));
const requiredStrings = [
  'page',
  'primaryAudience',
  'jobToBeDone',
  'triggerMoment',
  'outcome',
  'positioningSentence',
  'primaryConversion',
  'antiAudience',
];

for (const field of requiredStrings) {
  const minLength = field === 'page' ? 1 : 8;
  if (typeof brief[field] !== 'string' || brief[field].trim().length < minLength) {
    fail(`Missing or weak string field: ${field}`);
  }
}

if (!Array.isArray(brief.proofRequirements) || brief.proofRequirements.length < 3) {
  fail('proofRequirements must contain at least 3 evidence needs');
}

if (!Array.isArray(brief.risks) || brief.risks.length < 1) {
  fail('risks must contain at least 1 risk');
}

const vagueAudience = /\b(everyone|anyone|all users|all businesses|people who want)\b/i;
if (vagueAudience.test(brief.primaryAudience)) {
  fail('primaryAudience is too broad');
}

const vaguePositioning = /\b(best|revolutionary|game.?changing|master any|for everyone)\b/i;
if (vaguePositioning.test(brief.positioningSentence) && brief.proofRequirements.length < 5) {
  fail('positioningSentence uses broad/superlative language without a stronger proof plan');
}

console.log(`OK: ${file}`);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
