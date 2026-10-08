// Anonymous usage stats (GoatCounter, no cookies), only when stats are on, over http(s), not on claude/anthropic hosts.
import { PREFS } from '../state';

const GC_URL = 'https://badminton-daily-coach.goatcounter.com/count';
const TQ: [string, string | undefined][] = []; let gcLoaded = false;
declare global { interface Window { goatcounter?: { count?: (o: { path: string; title: string; event: boolean }) => void } } }

export function gcAllowed(): boolean { return PREFS.stats !== false && /^https?:$/.test(location.protocol) && !/claude|anthropic/.test(location.host); }
export function loadGC(): void {
  if (gcLoaded || !gcAllowed()) return; gcLoaded = true;
  const sc = document.createElement('script'); sc.async = true; sc.src = 'https://gc.zgo.at/count.js'; sc.setAttribute('data-goatcounter', GC_URL);
  sc.onload = () => { while (TQ.length) { const e = TQ.shift()!; track(e[0], e[1]); } }; document.head.appendChild(sc);
}
export function track(path: string, title?: string): void {
  if (!gcAllowed()) return;
  const gc = window.goatcounter; if (!gc || !gc.count) { if (TQ.length < 50) TQ.push([path, title]); return; }
  try { gc.count({ path: path, title: title || path, event: true }); } catch (e) { /* ignore */ }
}
