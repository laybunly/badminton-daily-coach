// Puzzle catalogue: bundled data plus the per-user transform (language, level, handedness).
import puzzlesDe from './data/puzzles.de.json' with { type: 'json' };
import textEn from './data/text.en.json' with { type: 'json' };
import categories from './data/categories.json' with { type: 'json' };
import { seeded } from '../lib/seeded';
import type { Category, Hand, Lang, Level, Puzzle, PuzzleText } from './types';

/** All puzzles in German, in their fixed order (the index is used by codes and the plan). */
export const PUZ_DE = puzzlesDe as unknown as Puzzle[];
export const PUZ_EN_TEXT = textEn as unknown as Record<string, PuzzleText>;
export const CATS = categories as Category[];
/** Generated training puzzles (5 sets × 5 per category). */
export const GEN = PUZ_DE.filter((p) => p.disc === 't');

export const PUZ_EN: Puzzle[] = JSON.parse(JSON.stringify(PUZ_DE));
PUZ_EN.forEach((p) => {
  const e = PUZ_EN_TEXT[p.id]; if (!e) return;
  p.theme = e.theme; p.title = e.title; p.lesson = e.lesson;
  p.steps.forEach((s: any, i) => {
    const es = e.steps[i]; if (!es) return;
    s.q = es.q; if (es.why) s.why = es.why;
    if (es.opts) s.options.forEach((o: any, j: number) => { o.t = es.opts![j][0]; o.why = es.opts![j][1]; });
  });
});

export const TOL: Record<Level, number> = { beg: 1.25, int: 1, adv: 0.8 };

/** Swaps forehand/backhand wording for left-handers. */
export function handText(t: string): string;
export function handText(t: string | undefined): string | undefined;
export function handText(t: string | undefined) {
  if (!t) return t;
  const sw = (w: string) => ({ Vorhand: 'Rückhand', Rückhand: 'Vorhand', forehand: 'backhand', backhand: 'forehand', Forehand: 'Backhand', Backhand: 'Forehand' } as Record<string, string>)[w] || w;
  return t.replace(/(\bdein(?:e|er|em|en)?\s+(?:(?:hintere|vordere|hinteren|vorderen)\s+)?)(Vorhand|Rückhand)/g, (m, a, b) => a + sw(b))
    .replace(/(^|[^A-Za-zÄÖÜäöüß])(Rückhand|Vorhand)-(Drop|Smash)/g, (m, a, b, c) => a + sw(b) + '-' + c)
    .replace(/(\byour\s+(?:(?:back|front)\s+)?)(forehand|backhand)/gi, (m, a, b) => a + sw(b))
    .replace(/\b(Backhand|Forehand) (drop|smash)/g, (m, b, c) => sw(b) + ' ' + c);
}

/**
 * Builds the playable puzzles: language → level variants → handedness text → backhand shift (bhY)
 * → seeded option shuffle → tolerance. Order and maths must stay exactly as they are.
 */
export function buildPuzzles(lang: Lang, lvl: Level, hand: Hand): Puzzle[] {
  const tol = TOL[lvl] || 1;
  const arr: Puzzle[] = JSON.parse(JSON.stringify(lang === 'de' ? PUZ_DE : PUZ_EN));
  arr.forEach((p, pi) => {
    const base = PUZ_DE[pi];
    if (base.lvLesson && base.lvLesson[lvl]) p.lesson = base.lvLesson[lvl]![lang];
    if (hand === 'L') { p.lesson = handText(p.lesson); p.title = handText(p.title); }
    p.steps.forEach((s: any, si) => {
      const o = base.steps[si].lv && base.steps[si].lv![lvl];
      if (o) {
        if (o.best) s.best = o.best;
        if (o.targets) for (const k in o.targets) s.targets[k].best = (o.targets as any)[k];
        if (o.why) s.why = o.why[lang];
        if (o.g) s.options.forEach((op: any, j: number) => { op.g = o.g![j]; const w = o.whys && o.whys[lang][j]; if (w) op.why = w; });
      }
      if (hand === 'L') {
        s.q = handText(s.q);
        if (s.why) s.why = { best: handText(s.why.best), good: handText(s.why.good) };
        if (s.options) s.options.forEach((op: any) => { op.t = handText(op.t); op.why = handText(op.why); });
      }
      if (s.bhY && lvl !== 'adv') {
        const d = lvl === 'beg' ? 30 : 20, sg = hand === 'L' ? 1 : -1;
        if (s.targets && s.targets.Y) s.targets.Y.best = [s.targets.Y.best[0] + sg * d, s.targets.Y.best[1]];
        else if (s.who === 'Y') s.best = [s.best[0] + sg * d, s.best[1]];
        if (s.why) s.why = { ...s.why, best: s.why.best + (lang === 'de'
          ? ` Als ${hand === 'L' ? 'Linkshänder' : 'Rechtshänder'} stehst du dabei leicht zur Rückhandseite, damit mehr Bälle auf deine Vorhand kommen.`
          : ` As a ${hand === 'L' ? 'left' : 'right'}-hander, stand slightly toward your backhand side so more shuttles come to your forehand.`) };
      }
      if (s.options) { let hh = 0; for (const ch of p.id + si) hh = (hh * 31 + ch.charCodeAt(0)) % 100000; s.options = seeded(s.options, hh + 3); }
      if (s.type === 'place') {
        if (s.targets) Object.values(s.targets).forEach((t: any) => { t.rBest *= tol; t.rGood *= tol; });
        else { s.rBest *= tol; s.rGood *= tol; }
      }
    });
  });
  return arr;
}
