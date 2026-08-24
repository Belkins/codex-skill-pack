#!/usr/bin/env node
import fs from 'node:fs';

const target = process.argv[2];
if (!target) {
  fail('Usage: node scripts/check-html-leaks.mjs <file-or-url>');
}

const text = await readTarget(target);
const patterns = [
  /\blocalhost\b/i,
  /\b127\.0\.0\.1\b/i,
  /\bstaging\b/i,
  /\bdev\./i,
  /\bsk_live_[A-Za-z0-9]+/,
  /\bSUPABASE_SERVICE_ROLE_KEY\b/,
];

for (const pattern of patterns) {
  if (pattern.test(text)) fail(`Leak-like pattern found: ${pattern}`);
}

console.log(`OK: ${target}`);

async function readTarget(value) {
  if (/^https?:\/\//i.test(value)) {
    const response = await fetch(value);
    if (!response.ok) fail(`Fetch failed: ${response.status} ${response.statusText}`);
    return response.text();
  }
  return fs.readFileSync(value, 'utf8');
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
