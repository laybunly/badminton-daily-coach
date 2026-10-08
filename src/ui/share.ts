// Task codes and sharing: #CODE opens a shared task, #plan opens the plan preview.
import { S, T, P } from '../state';
import { ID2CODE, CODE2IDX } from '../puzzles/codes';
import { track } from '../analytics/goatcounter';
import { $, toast, isTop } from './dom';
import { openSheet, closeSheet } from './sheets';
import { openPuzzle, showHome } from './flow';

function taskLink(code: string){return (/^https?:$/.test(location.protocol)&&!/claude|anthropic/.test(location.host))?location.origin+location.pathname+'#'+code:'';}
export function showShareTask(){const p=P(),code=ID2CODE[p.id],link=taskLink(code);
  openSheet(`<h3>${T.shareTask}</h3><p class="small">${T.shareTaskSub}</p><div class="codebox" aria-label="Code">${code}</div>`+
    (link?`<p class="small linkline">${link}</p>`:`<p class="small">${T.codeHint}</p>`)+
    `<button class="btn ghost" data-share="1" type="button">${T.shareBtn}</button><div id="sharebox2"></div>`);}
export function doShareTask(){track('share/task');const p=P(),code=ID2CODE[p.id],link=taskLink(code),txt=T.shareMsg(p.title,code)+(link?'\n'+link:'');
  if(isTop()&&navigator.share){navigator.share({text:txt}).catch(()=>{});return;}
  const fb=()=>{const b=$('sharebox2');if(b){b.innerHTML=`<textarea class="sharebox dark" readonly aria-label="${T.shareBtn}">${txt}</textarea>`;const ta=b.firstChild as HTMLTextAreaElement;ta.focus();ta.select();}};
  try{navigator.clipboard.writeText(txt).then(()=>toast(T.copied),fb);}catch(e){fb();}}
export function openCode(raw: unknown){const c=String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,'');const i=CODE2IDX[c];
  if(i==null){toast(T.codeNotFound);return false;} track('code/open/'+c); closeSheet(); openPuzzle(i,'shared'); return true;}
export function checkHash(){let h='';try{h=decodeURIComponent(location.hash.slice(1));}catch(e){}
  if(h.toLowerCase()==='plan'){S.sub='plan';showHome();try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}return;}
  if(h&&CODE2IDX[h.toUpperCase()]!=null){openCode(h);try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}}
