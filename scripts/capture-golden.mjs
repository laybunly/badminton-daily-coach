// Captures the golden snapshot from legacy/index.html (the pre-refactor app).
// Usage: npm run golden   -> writes tests/golden/legacy.json
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const page = await (await chromium.launch()).newPage();
await page.route(/^https?:/, (r) => r.abort()); // no fonts / analytics
await page.goto(pathToFileURL(resolve('legacy/index.html')).href);
const src = readFileSync('tests/golden/dump.js', 'utf8');
const data = await page.evaluate(`${src}; goldenDump()`);
writeFileSync('tests/golden/legacy.json', JSON.stringify(data));
console.log('puzzles', data.PUZ_DE.length, 'plan days', data.PLAN.length, 'codes', Object.keys(data.ID2CODE).length);
process.exit(0);
