// Header (rating, streak) and the play bar (back, progress dots, mode).
import { S, T, PREFS, PUZZLES, gradeOf } from '../state';
import { PUZ_DE } from '../puzzles/catalog';
import { getDaily, streakNow } from '../daily/plan';
import { $ } from './dom';

export function renderHeader(){
  const r=$('rating');
  r.innerHTML=S.rating+(S.delta!=null?` <span class="${S.delta>=0?'delta-up':'delta-down'}" style="font-size:14px">${S.delta>=0?'+':''}${S.delta}</span>`:'');
  $('streak').textContent=String(streakNow());
  {const bb=$('backbtn');bb.textContent='←';bb.setAttribute('aria-label',T.back);bb.title=T.back;}
  const dots=$('dots'), pm=$('pmode');
  {const sg=(PUZ_DE[S.pi]||{}).disc==='s';const ly=$('l-you'),lo=$('l-opp');
   if(ly)ly.textContent=(sg?T.legYouS:T.legYou)+(PREFS.hand==='L'&&!sg?'':'' );if(ly&&PREFS.hand==='L')ly.textContent=sg?T.legYouSL:T.legYouL; if(lo)lo.textContent=sg?T.legOppS:T.legOpp;
   const lh=$('l-hand'); if(lh)lh.textContent=PREFS.hand==='L'?T.othersRight:T.allRight;}
  if(S.mode==='daily'){const dd=getDaily(), curId=PUZZLES[S.pi].id; pm.textContent=''; dots.hidden=false;
    dots.innerHTML=dd.ids.map((id,i)=>{const r=dd.res[id], cur=id===curId;
      return `<button class="dot ${cur?'cur':''} ${r!=null?'r-'+gradeOf(r):''}" data-id="${id}" ${r!=null&&!cur?'disabled':''} aria-label="${T.puzzle} ${i+1}">${i+1}</button>`}).join('');}
  else if(S.mode==='set'&&S.set){const curId=PUZZLES[S.pi].id; pm.textContent=''; dots.hidden=false;
    dots.innerHTML=S.set.ids.map((id,i)=>{const r=S.sres[id], cur=id===curId;
      return `<button class="dot ${cur?'cur':''} ${r!=null?'r-'+gradeOf(r):''}" data-id="${id}" ${r!=null&&!cur?'disabled':''} aria-label="${T.puzzle} ${i+1}">${i+1}</button>`}).join('');}
  else {dots.hidden=true; dots.innerHTML=''; pm.textContent=S.mode==='shared'?T.sharedMode:T.practice;}
}
