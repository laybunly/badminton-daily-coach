// Daily set: a fixed plan of 5 puzzles per day (2 easy, 2 medium, 1 hard), no repeated category per day.
// The plan, its seeds and `prefKey()` must stay unchanged, or testers get a different "today".
import { store } from '../storage/store';
import { PUZ_DE } from '../puzzles/catalog';
import { seeded } from '../lib/seeded';
import { PREFS, T } from '../state';
import type { Puzzle } from '../puzzles/types';

export const LAUNCH = new Date(2026, 9, 1);
export function todayStr(d?: Date): string { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
export function yesterdayStr(): string { const n = new Date(); return todayStr(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1)); }
export function dayIndex(): number { const n = new Date(); return Math.max(0, Math.round((+new Date(n.getFullYear(), n.getMonth(), n.getDate()) - +LAUNCH) / 864e5)); }
const LVL_MIX = { beg: [3, 2, 0], int: [2, 2, 1], adv: [1, 2, 2] };
export function tierOf(p: Puzzle): number { return p.rating <= 1050 ? 0 : p.rating < 1250 ? 1 : 2; }
/** `-p2`: plan version; bumping it forces a new set for today. */
export function prefKey(): string { return PREFS.discs.slice().sort().join('') + '-p2'; }

/** dayIndex 4 = day 5 = 5 October 2026, the first day taken from the plan. */
export const PLAN_START = 4;
let PLAN: string[][] | null = null;
export function buildPlan(): string[][] {
  const pool = PUZ_DE.filter((p) => (p.disc || 'd') === 'd' || p.disc === 't');
  const catOf = (p: Puzzle) => p.disc === 't' ? 'c' + p.cat : 'd' + p.theme;
  // hand-written puzzles first, then the training puzzles, each shuffled
  const tiers = [0, 1, 2].map((t) => [...seeded(pool.filter((p) => tierOf(p) === t && p.disc !== 't'), 97 + t), ...seeded(pool.filter((p) => tierOf(p) === t && p.disc === 't'), 197 + t)]);
  const used = new Set<string>(), days: string[][] = [];
  for (let d = 0; d < 300; d++) {
    const out: Puzzle[] = [], cats = new Set<string>();
    for (const [t, n] of [[0, 2], [1, 2], [2, 1]]) for (let j = 0; j < n; j++) {
      let pick = tiers[t].find((p) => !used.has(p.id) && !cats.has(catOf(p))) || tiers[t].find((p) => !used.has(p.id));
      if (!pick) for (const tt of [1, 0, 2]) { pick = tiers[tt].find((p) => !used.has(p.id) && !cats.has(catOf(p))) || tiers[tt].find((p) => !used.has(p.id)); if (pick) break; }
      if (!pick) return days;
      used.add(pick.id); cats.add(catOf(pick)); out.push(pick);
    }
    days.push(out.sort((a, b) => a.rating - b.rating).map((p) => p.id));
  }
  return days;
}
export function planFor(d: number): string[] | null { if (!PLAN) PLAN = buildPlan(); const k = d - PLAN_START; return k >= 0 && k < PLAN.length ? PLAN[k] : null; }

/** Puzzle ids for day d: from the plan, or a seeded fallback once the plan runs out. */
export function dailyIds(d: number): string[] {
  const pl = planFor(d); if (pl) return pl;
  const pool = PUZ_DE.filter((p) => PREFS.discs.includes(p.disc || 'd'));
  let seed = 7; for (const c of PREFS.discs.slice().sort().join('')) seed = (seed * 31 + c.charCodeAt(0)) % 100000;
  const tiers = [0, 1, 2].map((t) => seeded(pool.filter((p) => tierOf(p) === t).map((p) => p.id), seed + 11 + t));
  const want = LVL_MIX.int, order = [[0, 1, 2], [1, 0, 2], [2, 1, 0]], out: string[] = [];
  want.forEach((n, t) => { for (let j = 0; j < n; j++) { for (const tt of order[t]) { const L = tiers[tt].filter((id) => !out.includes(id)); if (L.length) { out.push(L[(d * Math.max(n, 1) + j) % L.length]); break; } } } });
  const rt = (id: string) => PUZ_DE.find((p) => p.id === id)!.rating;
  return out.sort((a, b) => rt(a) - rt(b));
}

export interface Daily { date: string; day: number; key: string; ids: string[]; res: Record<string, number> }
/** Today's set and results (store key `daily`). */
export function getDaily(): Daily {
  let dd = store.get<Daily | null>('daily', null); const t = todayStr(), key = prefKey();
  if (!dd || dd.date !== t || dd.key !== key) { const d = dayIndex(); dd = { date: t, day: d + 1, key, ids: dailyIds(d), res: {} }; store.set('daily', dd); }
  return dd;
}

// Streak by days (store key `streakDays`)
export function streakNow(): number { const k = store.get('streakDays', { n: 0, last: null as string | null }); return (k.last === todayStr() || k.last === yesterdayStr()) ? k.n : 0; }
export function bumpStreak(): void {
  const k = store.get('streakDays', { n: 0, last: null as string | null }), t = todayStr(); if (k.last === t) return;
  k.n = (k.last === yesterdayStr() ? k.n : 0) + 1; k.last = t; store.set('streakDays', k);
}
export function untilMidnight(): string { const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), mins = Math.max(1, Math.ceil((+m - +n) / 6e4)); return T.hm(Math.floor(mins / 60), mins % 60); }

/** Practice order: hand-written doubles puzzles by rating (indexes into PUZ_DE). */
export const PRACT = PUZ_DE.map((p, i) => i).filter((i) => (PUZ_DE[i].disc || 'd') === 'd').sort((a, b) => PUZ_DE[a].rating - PUZ_DE[b].rating || a - b);
