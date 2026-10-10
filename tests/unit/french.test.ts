// French has no legacy reference: it must match the English build in everything but the texts.
import { describe, expect, it } from 'vitest';
import { PUZ_DE, PUZ_EN_TEXT, PUZ_FR_TEXT, CATS, buildPuzzles } from '../../src/puzzles/catalog';
import { I18N } from '../../src/i18n/strings';
import { GLOSSARY } from '../../src/ui/glossary';
import type { Hand, Level } from '../../src/puzzles/types';

const TEXT_KEYS = new Set(['theme', 'title', 'lesson', 'q', 'why', 't']);
/** Puzzle data with every text replaced by a marker (keeps undefined vs. present). */
const shape = (v: unknown): unknown => JSON.parse(JSON.stringify(v), (k, x) => (TEXT_KEYS.has(k) && x != null ? '·' : x));
/** All texts of a build, in a fixed order (the raw level variants are skipped: they are German/English source data). */
function texts(v: unknown, out: string[] = [], key = ''): string[] {
  if (key === 'lv' || key === 'lvLesson') return out;
  if (typeof v === 'string') { if (TEXT_KEYS.has(key) || key === 'best' || key === 'good') out.push(v); }
  else if (Array.isArray(v)) v.forEach((x) => texts(x, out, key === 'why' ? key : ''));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) texts(x, out, k === 'why' && typeof x === 'object' ? 'why' : k);
  return out;
}

describe('French', () => {
  it('overlay covers every puzzle, step and option', () => {
    expect(Object.keys(PUZ_FR_TEXT)).toEqual(Object.keys(PUZ_EN_TEXT));
    for (const p of PUZ_DE) {
      const en = PUZ_EN_TEXT[p.id], fr = PUZ_FR_TEXT[p.id];
      expect(fr.steps.length, p.id).toBe(en.steps.length);
      en.steps.forEach((s, i) => {
        const f = fr.steps[i];
        if (!s) { expect(f, p.id).toBeNull(); return; }
        expect(!!f!.why, p.id).toBe(!!s.why);
        expect(f!.opts?.length, p.id).toBe(s.opts?.length);
      });
      for (const lvl of Object.keys(p.lvLesson || {}) as Level[]) expect(fr.lvLesson?.[lvl], `${p.id} ${lvl}`).toBeTruthy();
    }
  });

  for (const level of ['beg', 'int', 'adv'] as Level[]) for (const hand of ['R', 'L'] as Hand[]) {
    it(`build ${level}/${hand} equals English apart from the texts`, () => {
      const fr = buildPuzzles('fr', level, hand), en = buildPuzzles('en', level, hand);
      expect(shape(fr)).toEqual(shape(en));
      const tf = texts(fr), te = texts(en);
      expect(tf.length).toBe(te.length);
      tf.forEach((t, i) => {
        expect(t, te[i]).toBeTruthy();
        // longer texts must actually be translated
        if (te[i].length > 25) expect(t, te[i]).not.toBe(te[i]);
      });
    });
  }

  it('left-handed swap hits the same texts as in English', () => {
    for (const level of ['beg', 'int', 'adv'] as Level[]) {
      const fR = texts(buildPuzzles('fr', level, 'R')), fL = texts(buildPuzzles('fr', level, 'L'));
      const eR = texts(buildPuzzles('en', level, 'R')), eL = texts(buildPuzzles('en', level, 'L'));
      eR.forEach((e, i) => expect(fL[i] !== fR[i], `${level}: ${e}`).toBe(eL[i] !== e));
    }
  });

  it('UI strings, categories and glossary are complete', () => {
    expect(Object.keys(I18N.fr).sort()).toEqual(Object.keys(I18N.de).sort());
    for (const [k, v] of Object.entries(I18N.fr)) if (typeof v === 'function') expect(typeof (v as (...a: unknown[]) => unknown)(3, 7), k).toBe('string');
    for (const c of CATS) { expect(c.fr).toBeTruthy(); c.sets.forEach((s) => expect(s[2]).toBeTruthy()); }
    for (const g of GLOSSARY) { expect(g.fr.length, g.k).toBeGreaterThan(0); expect(g.t.fr && g.d.fr, g.k).toBeTruthy(); }
  });
});
