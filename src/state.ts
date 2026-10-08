// Shared app state. `LANG`, `T`, `PUZZLES` and `PREFS` are live bindings: read them anywhere,
// change them only through the setters below.
import { store } from './storage/store';
import { buildPuzzles } from './puzzles/catalog';
import { I18N, type Strings } from './i18n/strings';
import type { Grade, Lang, Prefs, PlaceStep, PlayerKey, Pt, Puzzle, Step, Target } from './puzzles/types';

export let LANG: Lang;
export let T: Strings;
export let PUZZLES: Puzzle[];

const _pp = store.get<Partial<Prefs> | null>('prefs3', null) || {};
export let PREFS: Prefs = { discs: ['d'], level: _pp.level || 'int', hand: _pp.hand || 'R', stats: _pp.stats !== false, set: true };

export function rebuildPuzzles(): void { PUZZLES = buildPuzzles(LANG, PREFS.level, PREFS.hand); }
export function setLangState(l: Lang): void { LANG = l; T = I18N[l] as Strings; rebuildPuzzles(); }

/** Grade labels (set per language in applyLang) and scores. */
export const G: Record<Grade, { l: string; v: number }> = { best: { l: 'Am besten', v: 1 }, good: { l: 'Gut', v: 0.7 }, inacc: { l: 'Ungenau', v: 0.35 }, mistake: { l: 'Fehler', v: 0 } };
export const MAT: Record<Grade, string> = { best: 'var(--m-best)', good: 'var(--m-good)', inacc: 'var(--m-inacc)', mistake: 'var(--m-mistake)' };
export const NAME: Record<string, string> = { Y: 'Du', P: 'Partner' };
export const LABEL: Record<string, string> = { Y: 'Du', P: 'P', A: 'A', B: 'B' };
export const LET = '1234';

export type Mode = 'daily' | 'set' | 'shared' | 'practice';
export interface Answer { i?: number; g: Grade; per?: Record<string, Grade> }

export interface AppState {
  rating: number;
  results: Record<string, number>;
  pi: number; si: number;
  answers: Answer[];
  taps: Record<string, Pt>;
  active: string;
  view: number | null;
  phase: 'play' | 'answered' | 'done';
  t: number;
  delta: number | null;
  mode: Mode;
  screen: 'home' | 'play';
  pf: 'all' | 'miss';
  sub: 'plan' | 'train' | 'cat' | 'pool' | null;
  cat: number;
  set: { c: number; s: number; ids: string[] } | null;
  sres: Record<string, number>;
  rep: { id: string; r: Set<string>; c: string } | null;
  pend: Partial<Prefs> | null;
  ready: boolean;
  paused: boolean;
  corr: number;
}

export const S: AppState = {
  rating: store.get('rating', 1200), results: store.get('results', {}),
  pi: 0, si: 0, answers: [], taps: {}, active: 'Y', view: null, phase: 'play', t: 1, delta: null,
  mode: 'daily', screen: 'home', pf: 'all', sub: null, cat: 0, set: null, sres: {}, rep: null, pend: null,
  ready: false, paused: false, corr: 1,
};

export const P = (): Puzzle => PUZZLES[S.pi];
export const ST = (): Step => P().steps[S.si];
/** Players to place in a step, with their target zones. */
export function TG(st: Step): Partial<Record<PlayerKey, Target>> {
  const s = st as PlaceStep;
  return s.targets || { [s.who!]: { best: s.best!, rBest: s.rBest!, rGood: s.rGood! } };
}
export function gradeOf(s: number): Grade { return s >= 0.85 ? 'best' : s >= 0.6 ? 'good' : s >= 0.3 ? 'inacc' : 'mistake'; }
export function curPrefs(): Prefs { return { ...PREFS, ...(S.pend || {}) }; }
export function setPrefs(p: Prefs): void { PREFS = p; }
