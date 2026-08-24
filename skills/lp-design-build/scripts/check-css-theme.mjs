#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  fail('Usage: node scripts/check-css-theme.mjs <css-or-tsx-file>');
}

const text = fs.readFileSync(file, 'utf8');
const checks = [
  [/letter-spacing\s*:\s*-\d/i, 'negative CSS letter-spacing'],
  [/\btracking-\[-/i, 'negative Tailwind tracking'],
  [/\btext-\[[^\]]*vw[^\]]*\]/i, 'viewport-width font sizing'],
  [/\b(from|via|to)-purple-\d+.*\b(from|via|to)-(blue|indigo)-\d+/is, 'default purple-blue gradient palette'],
];

for (const [pattern, label] of checks) {
  if (pattern.test(text)) fail(`Found ${label}`);
}

console.log(`OK: ${file}`);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
