// One-off: expands the legacy puzzle data (hand-written + generated) into static JSON.
// Run `npm run golden` first. Re-running must not change the files.
import { readFileSync, writeFileSync } from 'node:fs';

const g = JSON.parse(readFileSync('tests/golden/legacy.json', 'utf8'));
const out = (f, v) => writeFileSync(`src/puzzles/data/${f}`, JSON.stringify(v, null, 1) + '\n');
out('puzzles.de.json', g.PUZ_DE);
out('text.en.json', g.PUZ_EN_TEXT);
out('categories.json', g.CATS);
console.log('ok');
