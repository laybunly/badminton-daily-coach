/** Deterministic shuffle (LCG). Used for option order and the daily plan; must never change. */
export function seeded<T>(a: T[], seed: number): T[] {
  a = a.slice(); let x = seed;
  const r = () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296; };
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
