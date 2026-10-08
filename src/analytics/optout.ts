// Opt-out links: #toggle-goatcounter, #nostats, #stats (with a visible confirmation toast).
import { store } from '../storage/store';
import { PREFS, T } from '../state';

export function statsHash(): string | null {
  let h = ''; try { h = decodeURIComponent(location.hash.slice(1)).toLowerCase(); } catch (e) { /* bad hash */ }
  if (h !== 'toggle-goatcounter' && h !== 'nostats' && h !== 'stats') return null;
  PREFS.stats = h === 'stats' ? true : (h === 'nostats' ? false : !PREFS.stats);
  store.set('prefs3', { level: PREFS.level, hand: PREFS.hand, stats: PREFS.stats });
  try { if (!PREFS.stats) localStorage.setItem('skipgc', 't'); else localStorage.removeItem('skipgc'); } catch (e) { /* storage blocked */ }
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
  return PREFS.stats ? T.statsOnMsg : T.statsOffMsg;
}
