// The refactored modules must produce exactly what the original single-file app produced.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PUZ_DE, PUZ_EN, PUZ_EN_TEXT, CATS, GEN, buildPuzzles } from '../../src/puzzles/catalog';
import { ID2CODE, CODE2IDX } from '../../src/puzzles/codes';
import { buildPlan, dailyIds, PLAN_START, PRACT } from '../../src/daily/plan';
import { I18N } from '../../src/i18n/strings';
import { GLOSSARY } from '../../src/ui/glossary';
import type { Hand, Lang, Level } from '../../src/puzzles/types';

const golden = JSON.parse(readFileSync('tests/golden/legacy.json', 'utf8'));
// same JSON round trip as the snapshot
const j = (v: unknown) => JSON.parse(JSON.stringify(v));
// French was added after the original app: compare everything else
const noFr = (v: unknown): any => JSON.parse(JSON.stringify(v), (k, x) => (k === 'fr' ? undefined : x));

describe('golden comparison with the original app', () => {
  it('puzzle data', () => {
    expect(PUZ_DE.length).toBe(287);
    expect(j(PUZ_DE)).toEqual(golden.PUZ_DE);
    expect(j(PUZ_EN)).toEqual(golden.PUZ_EN);
    expect(j(PUZ_EN_TEXT)).toEqual(golden.PUZ_EN_TEXT);
    expect(noFr(CATS).map((c: any) => ({ ...c, sets: c.sets.map((s: string[]) => s.slice(0, 2)) }))).toEqual(golden.CATS);
    expect(GEN.map((p) => p.id)).toEqual(golden.GEN_IDS);
  });
  it('all 5-character codes', () => {
    expect(ID2CODE).toEqual(golden.ID2CODE);
    expect(CODE2IDX).toEqual(golden.CODE2IDX);
  });
  it('55-day plan and daily sets', () => {
    expect(PLAN_START).toBe(golden.PLAN_START);
    expect(buildPlan()).toEqual(golden.PLAN);
    expect(golden.PLAN.length).toBe(55);
    for (let d = 0; d < 400; d++) expect(dailyIds(d), `day ${d}`).toEqual(golden.daily[d]);
    expect(PRACT).toEqual(golden.PRACT);
  });
  for (const lang of ['de', 'en'] as Lang[]) for (const level of ['beg', 'int', 'adv'] as Level[]) for (const hand of ['R', 'L'] as Hand[]) {
    it(`built puzzles ${lang}/${level}/${hand}`, () => {
      expect(j(buildPuzzles(lang, level, hand))).toEqual(golden.built[`${lang}-${level}-${hand}`]);
    });
  }
  it('UI strings and glossary', () => {
    const sample = (fn: (...a: unknown[]) => unknown) => { try { return fn(3, 7, 'X', 'Y'); } catch (e) { return 'ERR:' + (e as Error).message; } };
    const i18n: Record<string, Record<string, unknown>> = {};
    for (const l of ['de', 'en'] as const) {
      i18n[l] = {};
      for (const [k, v] of Object.entries(I18N[l])) i18n[l][k] = typeof v === 'function' ? { fn: sample(v as never) } : v;
    }
    expect(j(i18n)).toEqual(golden.I18N);
    expect(noFr(GLOSSARY)).toEqual(golden.GLOSSARY);
  });
});
