// Captures the golden snapshot from legacy/index.html once (needs Playwright Chromium).
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export default function setup() {
  if (!existsSync('tests/golden/legacy.json')) execFileSync('node', ['scripts/capture-golden.mjs'], { stdio: 'inherit' });
}
