// Screen flow: home ↔ puzzle, daily set, training sets, scoring.
import { S, T, P, G, PUZZLES, gradeOf, TG, type Mode } from '../state';
import { store } from '../storage/store';
import { CATS } from '../puzzles/catalog';
import { ID2CODE } from '../puzzles/codes';
import { getDaily, bumpStreak } from '../daily/plan';
import { ratingDelta } from '../daily/rating';
import { track } from '../analytics/goatcounter';
import { renderSVG } from '../court/render';
import { play, stopPlay } from '../court/animation';
import { $, homeEl, panel, toast } from './dom';
import { renderHeader } from './header';
import { renderHome, catIds } from './home';
import { renderPanel } from './panel';
import { applyPending } from './sheets';

function showScreen(play: boolean){S.screen=play?'play':'home';homeEl.hidden=play;$('playbar').hidden=!play;$('main').hidden=!play;}
export function showHome(){applyPending();stopPlay();S.t=1;S.ready=true;S.delta=null;showScreen(false);renderHeader();renderHome();homeEl.scrollTop=0;}
export function openPuzzle(i: number,mode: Mode){S.mode=mode;document.querySelectorAll<HTMLElement>('.stat').forEach(e=>{e.hidden=false;});showScreen(true);startPuzzle(i);}
export function openDaily(){S.sub=null;{const d0=getDaily();if(!d0.ids.some(id=>d0.res[id]!=null))track('daily/start','Daily set started');}const dd=getDaily(),id=dd.ids.find(x=>dd.res[x]==null);if(!id){showHome();return;}openPuzzle(PUZZLES.findIndex(p=>p.id===id),'daily');}
export function openSet(c: number,s: number){track(`train/${CATS[c].k}/set${s+1}`,'Training set opened');const ids=catIds(c,s);S.set={c,s,ids};S.sres={};S.sub='cat';S.cat=c;
  openPuzzle(PUZZLES.findIndex(p=>p.id===ids[0]),'set');}
export function nextInSet(){const id=S.set!.ids.find(x=>S.sres[x]==null);if(!id){setDone();return;}startPuzzle(PUZZLES.findIndex(p=>p.id===id));}
export function setDone(){const set=S.set!;track(`train/${CATS[set.c].k}/set${set.s+1}/done`,'Training set finished');const ids=set.ids, avg=Math.round(ids.reduce((a,id)=>a+(S.sres[id]||0),0)/ids.length*100);showHome();toast(T.setDone(avg));}
export function render(){renderHeader();renderSVG();renderPanel();}

export function startPuzzle(i: number){applyPending();S.corr=1;S.pi=i;S.si=0;S.answers=[];S.taps={};S.active=Object.keys(TG(PUZZLES[i].steps[0]))[0];S.view=null;S.phase='play';S.delta=null;S.t=0;S.ready=false;render();panel.scrollTop=0;play();}
export function nextStep(){S.corr=1;S.si++;S.taps={};S.active=Object.keys(TG(PUZZLES[S.pi].steps[S.si]))[0];S.view=null;S.phase='play';S.t=0;S.ready=false;render();panel.scrollTop=0;play();}
export function finish(){
  const p=P(), score=S.answers.reduce((s,x)=>s+G[x.g].v,0)/p.steps.length;
  const first=S.results[p.id]==null;
  if(S.mode==='daily'||first){S.delta=ratingDelta(S.rating,p.rating,score); S.rating+=S.delta;} else S.delta=null;
  S.results[p.id]=Math.max(S.results[p.id]??0,score);
  track(`task/${ID2CODE[p.id]}/${gradeOf(score)}`,`${p.id} · ${S.mode}`);
  if(S.mode==='set'&&S.sres) S.sres[p.id]=score;
  if(S.mode==='daily'){const dd=getDaily(); if(dd.res[p.id]==null){dd.res[p.id]=score; store.set('daily',dd);} if(dd.ids.every(id=>dd.res[id]!=null)){bumpStreak();track('daily/finish','Daily set finished');}}
  store.set('rating',S.rating);store.set('results',S.results);
  renderHeader();
}
