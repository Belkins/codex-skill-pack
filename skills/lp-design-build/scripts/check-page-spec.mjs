#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  fail('Usage: node scripts/check-page-spec.mjs <page-spec.json>');
}

const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
const required = [
  'visualDirection',
  'firstViewport',
  'components',
  'responsivePlan',
  'states',
  'accessibility',
  'performanceBudgets',
  'handoffChecks',
];

for (const field of required) {
  if (!spec[field]) fail(`${field} is required`);
}

if (!Array.isArray(spec.components) || spec.components.length < 2) {
  fail('components must name at least 2 implementation surfaces');
}

const widths = new Set((spec.responsivePlan.viewports || []).map(Number));
for (const width of [390, 430, 768, 1024, 1440]) {
  if (!widths.has(width)) fail(`responsivePlan.viewports missing ${width}`);
}

if (!spec.firstViewport.mobile || !spec.firstViewport.desktop) {
  fail('firstViewport must define mobile and desktop content');
}

const directionText = JSON.stringify(spec.visualDirection).toLowerCase();
if (directionText.includes('generic dark saas') || directionText.includes('purple ai gradient')) {
  fail('visualDirection is too generic');
}

console.log(`OK: ${file}`);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
