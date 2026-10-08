// Boot. The order below mirrors the original single-file app.
import './styles.css';
import { S, T, PUZZLES, PREFS, LANG, curPrefs } from './state';
import { store } from './storage/store';
import { loadGC, track } from './analytics/goatcounter';
import { statsHash } from './analytics/optout';
import { initCourtInput } from './court/input';
import { pause, play } from './court/animation';
import { $, homeEl, toast } from './ui/dom';
import { applyLang, detectLang } from './ui/lang';
import { initPanel } from './ui/panel';
import { initHome, renderHome } from './ui/home';
import { renderHeader } from './ui/header';
import { render, showHome, startPuzzle } from './ui/flow';
import { closeSheet, setPref, showGlossary, showSettings } from './ui/sheets';
import { checkHash, doShareTask } from './ui/share';
import { copyReport, reportHref, sendReport } from './ui/report';

applyLang(detectLang(), false);
{ const i = PUZZLES.findIndex((p) => S.results[p.id] == null); S.pi = i < 0 ? 0 : i; }

initCourtInput();
$('replay').addEventListener('click', () => { if (S.paused) play(); else pause(); });
initPanel();
$('dots').addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>('.dot'); if (!b || b.disabled) return;
  const i = PUZZLES.findIndex((p) => p.id === b.dataset.id); if (i >= 0 && i !== S.pi) startPuzzle(i);
});
$('backbtn').addEventListener('click', showHome);
$('helpbtn').addEventListener('click', showGlossary);
$('setbtn').addEventListener('click', showSettings);
window.addEventListener('hashchange', checkHash);
$('sheet').addEventListener('click', (e) => {
  const tg = e.target as HTMLElement;
  if (tg.id === 'sheet' || tg.id === 'sheet-close') { closeSheet(); return; }
  const b = tg.closest('button'); if (!b) return;
  if (b.dataset.gl) showGlossary();
  else if (b.dataset.share) doShareTask();
  else if (b.dataset.rep) {
    const k = b.dataset.rep, r = S.rep!.r; r.has(k) ? r.delete(k) : r.add(k);
    b.classList.toggle('on'); b.setAttribute('aria-pressed', String(r.has(k))); ($('repgh') as HTMLAnchorElement).href = reportHref();
  }
  else if (b.dataset.repcopy) copyReport();
  else if (b.dataset.repsend) sendReport();
  else if (b.dataset.planOpen) { closeSheet(); S.sub = 'plan'; if (S.screen === 'play') showHome(); else { renderHeader(); renderHome(); homeEl.scrollTop = 0; } }
  else if (b.dataset.stats != null) {
    PREFS.stats = b.dataset.stats === '1';
    store.set('prefs3', { level: curPrefs().level, hand: curPrefs().hand, stats: PREFS.stats });
    if (PREFS.stats) { loadGC(); track('settings/stats-on'); }
    showSettings();
  }
  else if (b.dataset.lang) setPref('lang', b.dataset.lang);
  else if (b.dataset.hand) setPref('hand', b.dataset.hand);
  else if (b.dataset.lvl) setPref('level', b.dataset.lvl);
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); });
$('sheet').addEventListener('click', (e) => {
  const tg = e.target as HTMLElement;
  if (tg.closest && tg.closest('#repgh')) { track('report/github'); setTimeout(() => { closeSheet(); toast(T.repThanks); }, 300); }
});
initHome();
$('lang').addEventListener('click', () => { applyLang(LANG === 'de' ? 'en' : 'de', true); if (S.screen === 'home') { renderHeader(); renderHome(); } else render(); });

const statsMsg = statsHash();
window.addEventListener('hashchange', () => { const m = statsHash(); if (m) { if (PREFS.stats) loadGC(); toast(m); } });
loadGC();
showHome();
checkHash();
if (statsMsg) setTimeout(() => toast(statsMsg), 300);
