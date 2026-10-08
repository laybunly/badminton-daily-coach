// localStorage with an in-memory fallback. Keys are prefixed `cs_`; existing keys must never change.
const MEM: Record<string, string> = {};

export const store = {
  get<T>(k: string, d: T): T {
    if (k in MEM) return JSON.parse(MEM[k]);
    try { const v = localStorage.getItem('cs_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
  },
  set(k: string, v: unknown): void {
    MEM[k] = JSON.stringify(v);
    try { localStorage.setItem('cs_' + k, MEM[k]); } catch (e) { /* storage blocked */ }
  },
};
