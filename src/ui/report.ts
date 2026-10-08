// Report a task: anonymous GoatCounter event `report/CODE/reasons`, copy text, or a prefilled GitHub issue.
import { S, T, P, ST, G, LET, LANG, PREFS } from '../state';
import { ID2CODE } from '../puzzles/codes';
import { gcAllowed, track } from '../analytics/goatcounter';
import { $, toast } from './dom';
import { openSheet, closeSheet } from './sheets';

const REPORT_REPO='https://github.com/laybunly/badminton-daily-coach/issues/new';
const REP_REASONS=['answer','pos','why','text','other'];
function reportText(){const p=P(), st=ST() as any, a=S.answers[S.si], code=ID2CODE[p.id];
  const rep=S.rep!, rs=[...rep.r].map(k=>(T.repR as Record<string,string>)[k]).join(', ')||'–';
  let ans='–'; if(a){ if(a.i!=null&&st.options) ans=`${LET[a.i]} · ${st.options[a.i].t} (${G[a.g].l})`; else ans=G[a.g].l+(S.taps?' '+JSON.stringify(S.taps):''); }
  return [`${T.repTitle}: ${code} · ${p.title}`,`${T.repReason}: ${rs}`,`${T.repComment}: ${rep.c||'–'}`,'',
    `Code: ${code} · ID: ${p.id} · ${T.step} ${S.si+1}/${p.steps.length}`,`${T.repAnswer}: ${ans}`,
    `${LANG.toUpperCase()} · ${PREFS.hand==='L'?'L':'R'} · ${PREFS.level} · ${new Date().toISOString().slice(0,10)}`].join('\n');}
export function reportHref(){const p=P();return REPORT_REPO+'?title='+encodeURIComponent(`[${ID2CODE[p.id]}] ${p.title}`)+'&body='+encodeURIComponent(reportText());}
export function showReport(){track('report/open');if(!S.rep||S.rep.id!==P().id)S.rep={id:P().id,r:new Set(),c:''};const p=P(), rep=S.rep!;
  openSheet(`<h3>${T.repTitle}</h3><p class="small">${p.title} · Code ${ID2CODE[p.id]}</p>
  <div class="plabel">${T.repReason}</div><div class="filters" role="group" aria-label="${T.repReason}">`+
  REP_REASONS.map(k=>`<button class="chip ${rep.r.has(k)?'on':''}" data-rep="${k}" aria-pressed="${rep.r.has(k)}">${(T.repR as Record<string,string>)[k]}</button>`).join('')+
  `</div><label class="plabel" for="repc">${T.repComment}</label><textarea id="repc" class="repc" rows="3" placeholder="${T.repPh}">${rep.c.replace(/</g,'&lt;')}</textarea>
  ${gcAllowed()?`<button class="btn" data-repsend="1" type="button">${T.repSend}</button><p class="small">${T.repSendNote}</p>`:`<p class="small">${T.repNoSend}</p>`}
  <div class="row"><button class="btn ghost" data-repcopy="1" type="button">${T.repCopy}</button><a class="btn ghost" id="repgh" href="${reportHref()}" target="_blank" rel="noopener">${T.repGh}</a></div><div id="sharebox3"></div>`);
  const ta=$('repc') as HTMLTextAreaElement; ta.addEventListener('input',()=>{rep.c=ta.value;($('repgh') as HTMLAnchorElement).href=reportHref();});}
export function sendReport(){const p=P(),code=ID2CODE[p.id],rs=[...S.rep!.r].join('+')||'none';
  const c=(S.rep!.c||'').replace(/\s+/g,' ').trim().slice(0,200);
  track(`report/${code}/${rs}`,`${p.title} · ${LANG} · ${c||'-'}`);S.rep={id:p.id,r:new Set(),c:''};closeSheet();toast(T.repThanks);}
export function copyReport(){track('report/copy');const txt=reportText();const fb=()=>{const b=$('sharebox3');if(b){b.innerHTML=`<textarea class="sharebox dark" readonly>${txt.replace(/</g,'&lt;')}</textarea>`;const t=b.firstChild as HTMLTextAreaElement;t.focus();t.select();}};
  try{navigator.clipboard.writeText(txt).then(()=>toast(T.repCopied),fb);}catch(e){fb();}}
