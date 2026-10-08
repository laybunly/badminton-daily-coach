// Language: stored choice, else browser language, else English.
import { T, G, NAME, LABEL, setLangState } from '../state';
import { store } from '../storage/store';
import { updPlayBtn } from '../court/animation';
import { $ } from './dom';
import type { Lang } from '../puzzles/types';

export function detectLang(): Lang{const st=store.get<string|null>('lang',null);if(st==='de'||st==='en')return st;
  const ls=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||'en']);
  for(const l of ls){const p=String(l).slice(0,2).toLowerCase();if(p==='de'||p==='en')return p;}return 'en';}
export function applyLang(l: Lang,save: boolean){
  setLangState(l); if(save)store.set('lang',l);
  document.documentElement.lang=l;
  const GSYM={best:'✓',good:'○',inacc:'!',mistake:'✗'};
  (['best','good','inacc','mistake'] as const).forEach((k,i)=>G[k].l=GSYM[k]+' '+T.grades[i]);
  NAME.Y=T.you; LABEL.Y=T.you;
  const set=(id: string,v: string)=>{const e=$(id);if(e)e.textContent=v;};
  set('l-rating',T.rating);{const hb=$('helpbtn');if(hb){hb.setAttribute('aria-label',T.glossary);hb.title=T.glossary;}const sb=$('setbtn');if(sb){sb.setAttribute('aria-label',T.settingsT);sb.title=T.settingsT;}}set('l-streak',T.streak);set('l-you',T.legYou);set('l-opp',T.legOpp);
  $('dots').setAttribute('aria-label',T.puzzles);
  
  updPlayBtn();
  $('svg').setAttribute('aria-label',T.svg);
  const lb=$('lang');lb.textContent=T.langBtn;lb.setAttribute('aria-label',T.langAria);lb.title=T.langAria;
}
