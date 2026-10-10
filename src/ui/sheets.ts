// Bottom sheet: glossary terms, settings.
import { S, LANG, T, PREFS, curPrefs, rebuildPuzzles } from '../state';
import { store } from '../storage/store';
import { track } from '../analytics/goatcounter';
import { GLOSSARY } from './glossary';
import { applyLang } from './lang';
import { $ } from './dom';
import { renderHeader } from './header';
import { renderHome } from './home';
import { renderPanel } from './panel';
import { renderSVG } from '../court/render';
import { privacyLink } from './privacy';
import type { Lang } from '../puzzles/types';

export function openSheet(html: string){const sh=$('sheet');$('sheet-body').innerHTML=html;sh.hidden=false;const c=sh.querySelector('.sheet-card')!;c.scrollTop=0;try{$('sheet-close').focus({preventScroll:true});}catch(e){}c.scrollTop=0;}
export function closeSheet(){$('sheet').hidden=true;}
export function showTerm(k: string){const g=GLOSSARY.find(x=>x.k===k);if(!g)return;
  openSheet(`<h3>${g.t[LANG]}</h3><p>${g.d[LANG]}</p><button class="linkbtn small" data-gl="all">${T.allTerms}</button>`);}
export function showSettings(){const cp=curPrefs();
  openSheet(`<h3>${T.settingsT}</h3><div class="plabel">${T.langQ}</div><div class="filters" role="group" aria-label="${T.langQ}">`+
   [['de','Deutsch'],['en','English'],['fr','Français']].map(([k,l])=>`<button class="chip ${LANG===k?'on':''}" data-lang="${k}" aria-pressed="${LANG===k}" lang="${k}">${l}</button>`).join('')+
   `</div><div class="plabel">${T.handQ}</div><div class="filters" role="group" aria-label="${T.handQ}">`+
   [['R',T.handR],['L',T.handL]].map(([k,l])=>`<button class="chip ${cp.hand===k?'on':''}" data-hand="${k}" aria-pressed="${cp.hand===k}">${l}</button>`).join('')+
   `</div><div class="plabel">${T.yourLevel}</div><div class="levels" role="group" aria-label="${T.yourLevel}">`+
   ['beg','int','adv'].map(k=>`<button class="lvl ${cp.level===k?'on':''}" data-lvl="${k}" aria-pressed="${cp.level===k}">${T.lvl[k]}<span>${T.lvlD[k]}</span></button>`).join('')+
   `</div>${S.pend?`<p class="small"><b>${T.pendNote}</b></p>`:''}<p class="small">${T.settingsNote}</p>`+
   `<div class="plabel">${T.statsQ}</div><div class="filters" role="group" aria-label="${T.statsQ}"><button class="chip ${PREFS.stats?'on':''}" data-stats="1" aria-pressed="${PREFS.stats}">${T.on}</button><button class="chip ${PREFS.stats?'':'on'}" data-stats="0" aria-pressed="${!PREFS.stats}">${T.off}</button></div><p class="small">${T.statsNote}</p><button class="linkbtn small" data-plan-open="1" type="button">${T.planLink}</button>`+privacyLink('linkbtn small'));}
export function refreshView(){if(S.screen==='home'){renderHeader();renderHome();}else{renderSVG();renderPanel();renderHeader();}}
export function setPref(k: 'lang'|'hand'|'level',v: string){
  track('settings/'+k+'-'+v);
  if(k==='lang'){applyLang(v as Lang,true);showSettings();refreshView();return;}
  const answered=S.screen==='play'&&S.answers.some(Boolean);
  if(answered){const pend: any={...(S.pend||{}),[k]:v}; S.pend=pend; if(pend[k]===(PREFS as any)[k]){delete pend[k]; if(!Object.keys(pend).length) S.pend=null;}}
  else {(PREFS as any)[k]=v;rebuildPuzzles();}
  const cp=curPrefs(); store.set('prefs3',{level:cp.level,hand:cp.hand,stats:PREFS.stats});
  showSettings(); refreshView();}
export function applyPending(){if(S.pend){Object.assign(PREFS,S.pend);S.pend=null;rebuildPuzzles();}}
export function showGlossary(){track('glossary/open');const items=GLOSSARY.slice().sort((a,b)=>a.t[LANG].localeCompare(b.t[LANG],LANG));
  openSheet(`<h3>${T.glossary}</h3><p class="small">${T.glossarySub}</p><div class="gl-list">`+items.map(g=>`<div class="gl-item"><b>${g.t[LANG]}</b>${g.d[LANG]}</div>`).join('')+`</div>`);}
