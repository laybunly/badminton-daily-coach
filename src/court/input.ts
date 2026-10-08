// Placing players: drag (75-unit touch offset) or tap on your half of the court.
import { S, ST, TG } from '../state';
import { svg } from '../ui/dom';
import { renderSVG } from './render';
import { renderPanel } from '../ui/panel';

function placeAt(qx: number,qy: number){
  const st=ST() as any; if(st.type!=='place'||S.phase!=='play'||!S.ready) return;
  if(qx<-30||qx>640||qy<640||qy>1380) return;
  S.taps[S.active]=[Math.round(Math.max(20,Math.min(590,qx))),Math.round(Math.max(700,Math.min(1320,qy)))];
  const nxt=Object.keys(TG(st)).find(k=>!S.taps[k]); if(nxt) S.active=nxt;
  renderSVG(); renderPanel();
}
let drag: {k: string|null; x0: number; y0: number; moved: boolean; off: number}|null=null;
function svgPt(e: PointerEvent){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM()!.inverse());}
function canPlace(){const st=ST();return st.type==='place'&&S.phase==='play'&&S.ready;}

export function initCourtInput(){
  svg.addEventListener('pointerdown',e=>{
    if(!canPlace())return; const q=svgPt(e), st=ST() as any; let hit: string|null=null, bd=80;
    for(const k of Object.keys(TG(st))){const p=S.taps[k]||st.players[k], d=Math.hypot(p[0]-q.x,p[1]-q.y); if(d<bd){bd=d;hit=k;}}
    drag={k:hit,x0:e.clientX,y0:e.clientY,moved:false,off:e.pointerType==='mouse'?0:75};
    if(hit){try{svg.setPointerCapture(e.pointerId);}catch(_){}}
    e.preventDefault();
  });
  svg.addEventListener('pointermove',e=>{
    if(!drag||!drag.k)return;
    if(!drag.moved&&Math.hypot(e.clientX-drag.x0,e.clientY-drag.y0)<6)return;
    drag.moved=true; S.active=drag.k; const q=svgPt(e);
    S.taps[drag.k]=[Math.round(Math.max(20,Math.min(590,q.x))),Math.round(Math.max(700,Math.min(1320,q.y-drag.off)))];
    renderSVG();
  });
  svg.addEventListener('pointerup',e=>{
    if(!drag)return; const d=drag; drag=null;
    if(d.k&&d.moved){const nxt=Object.keys(TG(ST())).find(k=>!S.taps[k]); if(nxt)S.active=nxt; renderSVG(); renderPanel(); return;}
    if(d.k&&Object.keys(TG(ST())).length>1){S.active=d.k; renderSVG(); renderPanel(); return;}
    if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)<12){const q=svgPt(e); placeAt(q.x,q.y);}
  });
  svg.addEventListener('pointercancel',()=>{drag=null;});
}
