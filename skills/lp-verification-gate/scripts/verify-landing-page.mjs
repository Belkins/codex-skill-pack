#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const url = process.argv[2];
if (!url || !/^(https?:\/\/|file:\/\/)/i.test(url)) {
  fail('Usage: node scripts/verify-landing-page.mjs <http-url-or-file-url> [--out <dir>]');
}

const outIndex = process.argv.indexOf('--out');
const outDir = outIndex >= 0 ? process.argv[outIndex + 1] : null;
if (outDir) fs.mkdirSync(outDir, { recursive: true });

const requireFromCwd = createRequire(path.join(process.cwd(), 'package.json'));
let chromium;
try {
  ({ chromium } = requireFromCwd('@playwright/test'));
} catch {
  try {
    ({ chromium } = requireFromCwd('playwright'));
  } catch {
    fail('Playwright is not available from the current working directory');
  }
}

const browser = await chromium.launch();
const errors = [];
const failures = [];
const viewports = [
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1440, 1000],
];

for (const [width, height] of viewports) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${width}] ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`[${width}] ${error.message}`));

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    textLength: document.body.innerText.trim().length,
    bodyText: document.body.innerText.trim().slice(0, 240),
    ctaCount: Array.from(document.querySelectorAll('a,button')).filter((node) =>
      /try|demo|start|account|book|join|get/i.test(node.textContent || '')
    ).length,
  }));

  if (metrics.scrollWidth > metrics.clientWidth + 1) {
    failures.push(`[${width}] horizontal overflow: ${metrics.scrollWidth} > ${metrics.clientWidth}`);
  }
  if (metrics.textLength < 120 || /^loading|^please wait|spinner/i.test(metrics.bodyText)) {
    failures.push(`[${width}] blank/spinner-like render: "${metrics.bodyText}"`);
  }
  if (metrics.ctaCount < 1) {
    failures.push(`[${width}] no visible CTA-like link or button`);
  }

  if (outDir) {
    await page.screenshot({ path: path.join(outDir, `landing-${width}.png`), fullPage: false });
  }
  await page.close();
}

await browser.close();

if (errors.length) failures.push(`console/page errors:\n${errors.join('\n')}`);
if (failures.length) fail(failures.join('\n'));

console.log(`OK: ${url}`);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
