// Question / answer panel below the court.
import { S, T, P, ST, TG, G, MAT, NAME, LET, LANG, gradeOf } from '../state';
import type { Grade, Pt, ShotOption, Target } from '../puzzles/types';
import { CATS } from '../puzzles/catalog';
import { PRACT, getDaily } from '../daily/plan';
import { renderSVG } from '../court/render';
import { startCorr } from '../court/animation';
import { panel } from './dom';
import { linkify } from './glossary';
import { showTerm } from './sheets';
import { showShareTask } from './share';
import { showReport } from './report';
import { finish, nextStep, startPuzzle, openDaily, nextInSet, setDone, showHome } from './flow';

function dirHint(tap: Pt,best: Pt){
  const dx=tap[0]-best[0], dy=tap[1]-best[1], p: string[]=[];
  if(dy>45)p.push(T.dirBack); if(dy<-45)p.push(T.front);
  if(dx>45)p.push(T.right); if(dx<-45)p.push(T.left);
  if(!p.length)return '';const t=p.join(T.and);return t[0].toUpperCase()+t.slice(1)+'.';
}

export function renderPanel(){
  const p=P(), st=ST() as any, n=p.steps.length, a=S.answers[S.si];
  const pos=S.mode==='shared'?`${T.sharedMode} · `:S.mode==='daily'?(getDaily().ids.indexOf(p.id)+1)+'/5 · ':S.mode==='set'&&S.set?`${CATS[S.set.c][LANG]} · ${S.set.ids.indexOf(p.id)+1}/5 · `:'';
  let h=`<div class="ebrow"><div class="eb">${pos}${p.title}${n>1&&S.phase!=='done'?` · ${T.step} ${S.si+1}/${n}`:''}</div><span class="ebacts"><button class="sharelink" data-act="report" type="button" aria-label="${T.repTitle}">⚑ ${T.repShort}</button><button class="sharelink" data-act="sharetask" type="button" aria-label="${T.shareTask}">↗ ${T.shareBtn}</button></span></div>`;
  if(S.phase==='done'){
    const score=S.answers.reduce((s,x)=>s+G[x.g].v,0)/n, g=gradeOf(score);
    h+=`<div class="row" style="gap:12px"><span class="score">${Math.round(score*100)} %</span><span class="badge g-${g}">${G[g].l}</span></div>
    <div class="lesson">${linkify(p.lesson)}</div>
    <p class="small">${S.delta==null?T.noRating:T.saved((S.delta>=0?'+':'')+S.delta,S.rating)}</p>`;
    if(S.mode==='daily'){const dd=getDaily(), left=dd.ids.filter(id=>dd.res[id]==null).length;
      h+=`<div class="row stick">${left?`<button class="btn" data-act="dnext">${T.next}</button>`:`<button class="btn" data-act="home">${T.toSummary}</button>`}</div>`;}
    else h+=`<div class="row stick"><button class="btn" data-act="pnext">${T.practiceNext}</button><button class="btn ghost" data-act="retry">${T.retry}</button></div>`;
    panel.innerHTML=h; return;
  }
  let next;
  if(S.si<n-1) next=`<div class="row stick"><button class="btn" data-act="cont">${T.nextStep}</button></div>`;
  else if(S.mode==='daily'){const dd=getDaily(), left=dd.ids.filter(id=>dd.res[id]==null).length;
    next=`<div class="row stick">${left?`<button class="btn" data-act="dnext">${T.next}</button>`:`<button class="btn" data-act="home">${T.toSummary}</button>`}</div>`;}
  else if(S.mode==='shared') next=`<div class="row stick"><button class="btn" data-act="home">${T.toOverview}</button></div>`;
  else if(S.mode==='set'){const left=S.set!.ids.filter(id=>S.sres[id]==null).length;
    next=`<div class="row stick">${left?`<button class="btn" data-act="snext">${T.nextTask}</button>`:`<button class="btn" data-act="setdone">${T.finishSet}</button>`}</div>`;}
  else next=`<div class="row stick" style="flex-wrap:nowrap"><button class="btn" data-act="pnext">${T.practiceNext}</button><button class="btn ghost" data-act="retry" aria-label="${T.retry}" title="${T.retry}">↻</button></div>`;
  if(st.type==='place'){
    if(S.phase==='play'){
      const ks=Object.keys(TG(st)), all=ks.every(k=>S.taps[k]);
      h+=`<p class="q">${linkify(st.q)}</p>`;
      const hint=!S.ready?T.watch:(!all?(ks.length>1?T.dragBoth:(ks[0]==='Y'?T.dragY:T.dragP)):'');
      h+=`${hint?`<p class="hint">${hint}</p>`:''}<div class="row stick"><button class="btn" data-act="lock" ${all?'':'disabled'}>${ks.length>1?T.lockN:T.lock1}</button></div>`;
    } else {
      const TT=TG(st) as Record<string,Target>, per0=a.per!, why=a.g==='good'?st.why.good+' '+st.why.best:st.why.best;
      const per=Object.keys(TT).filter(k=>per0[k]!=='best'||Object.keys(TT).length===1&&false).map(k=>`<div class="per"><span class="g g-${per0[k]}">${G[per0[k]].l}</span><b>${NAME[k]}</b><span>${dirHint(S.taps[k],TT[k].best)||T.exact}</span></div>`).join('');
      h+=`<div class="verdict"><span class="badge g-${a.g}">${G[a.g].l}</span>${per}<p>${linkify(why)}</p></div>`+next;
    }
  } else if(!a){
    h+=`<p class="q">${linkify(st.q)}</p><div class="opts">`+st.options.map((o: ShotOption,i: number)=>
      `<button class="opt" data-opt="${i}" ${!S.ready?'disabled':''}><span class="k">${LET[i]}</span><span class="lbl">${o.t}</span></button>`).join('')+`</div>`;
  } else {
    const vi=S.view!=null?S.view:a.i!, o=st.options[vi];
    h+=`<div class="ochips"><span class="small">${T.otherOpts}</span>`+st.options.map((x: ShotOption,i: number)=>
      `<button class="ochip ${i===vi?'on':''}" data-opt="${i}" style="background:${MAT[x.g]}" aria-label="${LET[i]} · ${x.t} · ${G[x.g].l}" aria-pressed="${i===vi}">${LET[i]}</button>`).join('')+`</div>
    <div class="verdict"><div class="row" style="gap:8px"><span class="badge g-${o.g}">${LET[vi]} · ${G[o.g].l}</span><b>${o.t}</b></div><p>${linkify(o.why)}</p>`+
    (vi===a.i&&o.g!=='best'?(()=>{const bi=st.options.findIndex((x: ShotOption)=>x.g==='best'),bo=st.options[bi];
      return `<div class="bestbox"><div class="row" style="gap:8px"><span class="badge g-best">${LET[bi]} · ${G.best.l}</span><b>${bo.t}</b></div><p>${linkify(bo.why)}</p></div>`;})():'')+`</div>`+next;
  }
  panel.innerHTML=h;
}

export function initPanel(){
  panel.addEventListener('keydown',e=>{const tg=e.target as HTMLElement, t=tg.closest&&tg.closest<HTMLElement>('.term');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showTerm(t.dataset.term!);}});
  panel.addEventListener('click',e=>{
    const tg=e.target as HTMLElement, tm=tg.closest<HTMLElement>('.term'); if(tm){showTerm(tm.dataset.term!);return;}
    const b=tg.closest('button'); if(!b) return;
    const st=ST() as any;
    if(b.dataset.opt!=null){
      const i=+b.dataset.opt;
      if(!S.answers[S.si]){S.answers[S.si]={i,g:st.options[i].g};S.phase='answered';S.view=null;if(S.si===P().steps.length-1)finish();}
      else S.view=i;
      renderSVG(); renderPanel(); panel.scrollTop=0; return;
    }
    if(b.dataset.who){S.active=b.dataset.who;renderSVG();renderPanel();return;}
    const act=b.dataset.act;
    if(act==='lock'){
      const T=TG(st) as Record<string,Target>, per: Record<string,Grade>={}; let sum=0;
      for(const [k,t] of Object.entries(T)){const tp=S.taps[k]; if(!tp) return;
        const d=Math.hypot(tp[0]-t.best[0],tp[1]-t.best[1]);
        per[k]=d<=t.rBest?'best':d<=t.rGood?'good':d<=t.rGood*1.8?'inacc':'mistake'; sum+=G[per[k]].v;}
      S.answers[S.si]={g:gradeOf(sum/Object.keys(T).length),per}; S.phase='answered'; if(S.si===P().steps.length-1)finish(); renderSVG(); renderPanel(); panel.scrollTop=0; startCorr();
    }
    if(act==='cont'&&S.si<P().steps.length-1) nextStep();
    if(act==='sharetask'){showShareTask();return;}
    if(act==='report'){showReport();return;}
    if(act==='dnext') openDaily();
    if(act==='snext') nextInSet();
    if(act==='setdone') setDone();
    if(act==='pnext'){const k=PRACT.indexOf(S.pi); startPuzzle(PRACT[(k+1)%PRACT.length]);}
    if(act==='retry') startPuzzle(S.pi);
    if(act==='home') showHome();
  });
}
