// Home screen: today's set, training categories and sets, practice pool, plan preview.
import { S, T, LANG, PREFS, PUZZLES, G, gradeOf } from '../state';
import { store } from '../storage/store';
import { PUZ_DE, CATS, GEN } from '../puzzles/catalog';
import { ID2CODE } from '../puzzles/codes';
import { LAUNCH, PRACT, dayIndex, planFor, dailyIds, getDaily, streakNow, untilMidnight, todayStr, type Daily } from '../daily/plan';
import { track } from '../analytics/goatcounter';
import { $, homeEl, toast, isTop } from './dom';
import { renderHeader } from './header';
import { openDaily, openPuzzle, openSet } from './flow';
import { showGlossary, showSettings } from './sheets';
import { openCode } from './share';
import type { Lang } from '../puzzles/types';

const LOCALE: Record<Lang, string> = { de: 'de-DE', en: 'en-GB', fr: 'fr-FR' };

function renderPlan(){const d0=dayIndex(), rows: string[]=[];
  for(let d=d0+1;d<=d0+20;d++){const ids=planFor(d)||dailyIds(d);
    const dt=new Date(LAUNCH.getFullYear(),LAUNCH.getMonth(),LAUNCH.getDate()+d);
    let ds='';try{ds=dt.toLocaleDateString(LOCALE[LANG],{weekday:'short',day:'numeric',month:'short'});}catch(e){}
    rows.push(`<section class="card"><h3>${T.day} ${d+1} · ${ds}</h3><div class="plist">`+ids.map(id=>{const i=PUZZLES.findIndex(p=>p.id===id),p=PUZZLES[i],r=S.results[id];
      return `<button class="prow" data-plan="${i}"><span class="pt">${p.title}<small>${p.theme} · ${T.level} ${p.rating} · Code ${ID2CODE[id]}</small></span>${r!=null?`<span class="g g-${gradeOf(r)}">${G[gradeOf(r)].l}</span>`:''}</button>`;}).join('')+`</div></section>`);}
  const all=rows.length*5, uniq=new Set<string>();for(let d=d0+1;d<=d0+20;d++)(planFor(d)||dailyIds(d)).forEach(id=>uniq.add(id));
  homeEl.innerHTML=`<div class="row"><button class="backbtn" data-act="tohome">← ${T.back}</button></div><section class="card"><h3>${T.planT}</h3><p class="small">${T.planSub(uniq.size,all)}</p></section>`+rows.join('');}

function shareText(){const dd=getDaily(),em={best:'🟩',good:'🟦',inacc:'🟨',mistake:'🟥'};
  const avg=Math.round(dd.ids.reduce((s,id)=>s+(dd.res[id]||0),0)/dd.ids.length*100);
  let txt=`Badminton Daily Coach · ${T.day} ${dd.day}\n${dd.ids.map(id=>em[gradeOf(dd.res[id]||0)]).join('')} ${avg} %\n🔥 ${T.streakDays(streakNow())}`;
  if(/^https?:$/.test(location.protocol)&&!/claude|anthropic/.test(location.host))txt+='\n'+location.origin+location.pathname;
  return txt;}
export function shareDaily(){track('share/daily');const txt=shareText();
  if(isTop()&&navigator.share){navigator.share({text:txt}).catch(()=>{});return;}
  const fallback=()=>{const b=$('sharebox');if(b){b.innerHTML=`<textarea class="sharebox" readonly aria-label="${T.share}">${txt}</textarea>`;const ta=b.firstChild as HTMLTextAreaElement;ta.focus();ta.select();}};
  try{navigator.clipboard.writeText(txt).then(()=>toast(T.copied),fallback);}catch(e){fallback();}}
export function catIds(c: number,s?: number){return GEN.filter(p=>p.cat===c&&(s==null||p.set===s)).map(p=>p.id);}
function miniSq(ids: string[]){return `<span class="mini">`+ids.map(id=>{const r=S.results[id];return `<span class="${r==null?'':'r-'+gradeOf(r)}"></span>`;}).join('')+`</span>`;}
function renderTraining(){
  homeEl.innerHTML=`<div class="row"><button class="backbtn" data-act="tohome">← ${T.back}</button></div>
  <section class="card"><h3>${T.training}</h3><p class="small">${T.trainSub}</p><div class="codeform"><label class="plabel" for="codein">${T.codeLabel}</label><div class="row" style="flex-wrap:nowrap"><input id="codein" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="K7Q2X"><button class="btn ghost" data-act="opencode" type="button">${T.openCode}</button></div></div><div class="clist">`+
  CATS.map((c,i)=>{const ids=catIds(i), done=ids.filter(id=>S.results[id]!=null).length;
    return `<button class="ccard" data-cat="${i}"><span class="row" style="justify-content:space-between"><b>${c[LANG]}</b><span class="small">${done}/${ids.length}</span></span><span class="pbar"><i style="width:${Math.round(done/ids.length*100)}%"></i></span></button>`;}).join('')+
  `</div></section><button class="linkrow" data-act="pool">${T.poolLink} →</button>`;}
function renderCat(){const c=CATS[S.cat];
  homeEl.innerHTML=`<div class="row"><button class="backbtn" data-act="totrain">← ${T.training}</button></div>
  <section class="card"><h3>${c[LANG]}</h3><div class="plist">`+
  c.sets.map((nm,s)=>{const ids=catIds(S.cat,s), done=ids.filter(id=>S.results[id]!=null).length;
    return `<button class="prow" data-set="${s}"><span class="pt">${T.setN(s+1)} · ${nm[LANG==='de'?0:LANG==='en'?1:2]}<small>${miniSq(ids)}</small></span><span class="g ${done===ids.length?'g-best':'g-new'}">${done?done+'/5':T.newTag}</span></button>`;}).join('')+`</div></section>`;}
export function renderHome(){
  document.querySelectorAll<HTMLElement>('.stat').forEach(e=>{e.hidden=!S.sub;});
  homeEl.classList.toggle('center',!S.sub);
  if(S.sub==='plan'){renderPlan();return;} if(S.sub==='train'){renderTraining();return;} if(S.sub==='cat'){renderCat();return;} if(S.sub==='pool'){renderPractice();return;}
  const dd=getDaily(), done=dd.ids.filter(id=>dd.res[id]!=null).length, fin=done===dd.ids.length, sk=streakNow();
  let date='';try{date=new Date().toLocaleDateString(LOCALE[LANG],{weekday:'long',day:'numeric',month:'long'});}catch(e){}
  const sq=dd.ids.map(id=>{const r=dd.res[id];return `<span class="sq ${r==null?'':'r-'+gradeOf(r)}"></span>`;}).join('');
  let h=`<div class="hero hero-big"><div class="eyebrow">${T.day} ${dd.day}${date?' · '+date:''}</div>
    <h1>${fin?T.doneTitle:T.heroTitle}</h1><div class="sqs" role="img" aria-label="${done}/5">${sq}</div>`;
  if(!fin) h+=`<p>${done?T.progress(done):T.heroSub}</p><button class="btn light big" data-act="dstart">${done?T.cont(done):T.start}</button>${sk?`<p class="cd">${T.streakDays(sk)}</p>`:''}`;
  else{const avg=Math.round(dd.ids.reduce((s,id)=>s+dd.res[id],0)/dd.ids.length*100);
    h+=`<div class="row" style="gap:14px"><span class="bigscore">${avg} %</span><span>${T.streakDays(sk)}</span></div>
    <button class="btn light big" data-act="share">${T.share}</button><div id="sharebox"></div><p class="cd" id="cd" data-live="1">${T.newIn(untilMidnight())}</p>`;}
  h+=`</div>`;
  if(fin) h+=`<details class="card lessons"><summary>${T.lessons}</summary>`+dd.ids.map(id=>{const p=PUZZLES.find(x=>x.id===id)!;
    return `<div class="lrow"><span class="sq r-${gradeOf(dd.res[id])}"></span><div><b>${p.title}</b>${p.lesson}</div></div>`;}).join('')+`</details>`;
  h+=`<div class="links"><button class="linkrow" data-act="practice">${T.practiceLink} →</button><button class="linkrow" data-act="glossary">${T.glossary}</button><button class="linkrow" data-act="settings">${T.settingsT}</button></div>`;
  homeEl.innerHTML=h;
}
function renderPractice(){
  const list=PRACT.filter(i=>{if(!PREFS.discs.includes(PUZ_DE[i].disc||'d'))return false;const r=S.results[PUZZLES[i].id];return S.pf==='all'||(r!=null&&r<.6);});
  homeEl.innerHTML=`<div class="row"><button class="backbtn" data-act="totrain">← ${T.training}</button></div>
  <section class="card"><h3>${T.poolLink}</h3><p class="small">${T.practiceSub}</p>
    <div class="filters" role="group"><button class="chip ${S.pf==='all'?'on':''}" data-pf="all" aria-pressed="${S.pf==='all'}">${T.all}</button><button class="chip ${S.pf==='miss'?'on':''}" data-pf="miss" aria-pressed="${S.pf==='miss'}">${T.mistakesF}</button></div>
    <div class="plist">`+(list.length?list.map(i=>{const p=PUZZLES[i], r=S.results[p.id], g=r==null?null:gradeOf(r);
      return `<button class="prow" data-pid="${i}"><span class="pt">${p.title}<small>${p.theme} · ${T.level} ${p.rating}</small></span><span class="g ${g?'g-'+g:'g-new'}">${g?G[g].l:T.newTag}</span></button>`;}).join(''):`<p class="small">${T.noMistakes}</p>`)+`</div></section>`;
}

export function initHome(){
  homeEl.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest('button');if(!b)return;
    if(b.dataset.act==='dstart')openDaily();
    else if(b.dataset.act==='glossary'){showGlossary();}
    else if(b.dataset.act==='opencode'){const v=$('codein') as HTMLInputElement;if(v)openCode(v.value);}
    else if(b.dataset.act==='settings'){showSettings();}
    else if(b.dataset.plan!=null){openPuzzle(+b.dataset.plan,'shared');}
    else if(b.dataset.cat!=null){S.sub='cat';S.cat=+b.dataset.cat;renderHome();homeEl.scrollTop=0;}
    else if(b.dataset.set!=null){openSet(S.cat,+b.dataset.set);}
    else if(b.dataset.act==='pool'){S.sub='pool';renderHome();homeEl.scrollTop=0;}
    else if(b.dataset.act==='totrain'){S.sub='train';renderHeader();renderHome();homeEl.scrollTop=0;}
    else if(b.dataset.act==='practice'){S.sub='train';renderHeader();renderHome();homeEl.scrollTop=0;}
    else if(b.dataset.act==='tohome'){S.sub=null;renderHeader();renderHome();homeEl.scrollTop=0;}
    else if(b.dataset.act==='share')shareDaily();
    else if(b.dataset.pf){S.pf=b.dataset.pf as 'all'|'miss';renderHome();}
    else if(b.dataset.pid!=null)openPuzzle(+b.dataset.pid,'practice');});
  homeEl.addEventListener('keydown',e=>{const t=e.target as HTMLInputElement;if(t.id==='codein'&&e.key==='Enter'){e.preventDefault();openCode(t.value);}});
  setInterval(()=>{if(S.screen!=='home')return;const dd=store.get<Daily|null>('daily',null);if(!dd||dd.date!==todayStr()){renderHeader();renderHome();return;}
    const e=$('cd');if(e&&e.dataset.live)e.textContent=T.newIn(untilMidnight());},30000);
}
