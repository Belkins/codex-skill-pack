#!/usr/bin/env node
import fs from 'node:fs';

const target = process.argv[2];
if (!target) {
  fail('Usage: node scripts/check-cta-paths.mjs <file-or-url>');
}

const text = await readTarget(target);
const ctaTextPattern = /(try (the )?(voice )?demo|create free account|get started|book demo|start|join waitlist)/i;
if (!ctaTextPattern.test(text)) {
  fail('No recognizable CTA text found');
}

const badHrefPattern = /href=["'](?:#|javascript:|)["']/i;
if (badHrefPattern.test(text)) {
  fail('Found empty, javascript, or placeholder href');
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
