// Court SVG: top view (cm) plus a side strip showing the shuttle height.
import { S, T, P, ST, TG, MAT, LABEL, LET } from '../state';
import { svg } from '../ui/dom';
import type { Pt, Shuttle, Target } from '../puzzles/types';

export const SX=660, HS=300/700;

export function shPos(sh: Shuttle,t: number): [number,number,number]{const [x0,y0,h0]=sh.from,[x1,y1,h1]=sh.to;
  const bump=Math.max(0,sh.peak-Math.max(h0,h1))*4*t*(1-t);
  return [x0+(x1-x0)*t, y0+(y1-y0)*t, h0+(h1-h0)*t+bump];}
function trail(sh: Shuttle,side: boolean){let d='';for(let i=0;i<=30;i++){const [x,y,h]=shPos(sh,i/30);d+=(i?'L':'M')+(side?(SX+h*HS).toFixed(1):x.toFixed(1))+' '+y.toFixed(1);}return d;}
function tok(x: number,y: number,k: string,cls: string){return `<g class="tok ${cls}" transform="translate(${x} ${y})"><circle r="42"/><text y="17" text-anchor="middle">${LABEL[k]}</text></g>`;}

function court(){
  return `<rect x="-24" y="-24" width="658" height="1388" rx="14" class="mat"/>
  <rect x="0" y="670" width="610" height="670" class="myhalf ${ST().type==='place'&&S.phase==='play'?'on':''}"/>
  ${P().disc==='s'?'<rect x="0" y="0" width="46" height="1340" class="alley"/><rect x="564" y="0" width="46" height="1340" class="alley"/>':''}
  <g class="cl"><rect x="0" y="0" width="610" height="1340"/>
   <line x1="46" y1="0" x2="46" y2="1340"/><line x1="564" y1="0" x2="564" y2="1340"/>
   <line x1="0" y1="76" x2="610" y2="76"/><line x1="0" y1="1264" x2="610" y2="1264"/>
   <line x1="0" y1="472" x2="610" y2="472"/><line x1="0" y1="868" x2="610" y2="868"/>
   <line x1="305" y1="0" x2="305" y2="472"/><line x1="305" y1="868" x2="305" y2="1340"/></g>
  <line x1="-16" y1="670" x2="626" y2="670" class="net"/>
  <text class="lbl-half" transform="translate(-32 335) rotate(-90)" text-anchor="middle">${T.opp}</text>
  <text class="lbl-half" transform="translate(-32 1005) rotate(-90)" text-anchor="middle">${T.mine}</text>`;
}
function sideView(sh: Shuttle){
  let g=`<rect x="${SX-8}" y="-24" width="${300+28}" height="1388" rx="12" class="side-bg"/>
  <text class="side-txt" x="${SX+150}" y="-30" text-anchor="middle">${T.height}</text>`;
  for(let m=1;m<=6;m++){const x=SX+m*100*HS;g+=`<line x1="${x}" y1="-10" x2="${x}" y2="1350" class="side-grid"/>${m%2?'':`<text class="side-txt" x="${x}" y="1380" text-anchor="middle">${m} m</text>`}`;}
  g+=`<line x1="${SX}" y1="-10" x2="${SX}" y2="1350" stroke="var(--side-ink)" stroke-width="4"/>
  <line x1="${SX}" y1="670" x2="${SX+155*HS}" y2="670" class="side-net"/>
  <text class="side-txt" x="${SX+155*HS+8}" y="664">${T.net}</text>
  <path d="${trail(sh,true)}" class="side-trail"/>
  <circle id="sh-side" r="11" class="side-sh"/>
  <text id="sh-side-lbl" class="side-txt" x="0" y="0"></text>`;
  return g;
}
function defs(){
  let d='<defs>';
  for(const [k,c] of Object.entries({n:'var(--m-neutral)',...MAT}))
    d+=`<marker id="ah-${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:${c}"/></marker>`;
  return d+'</defs>';
}

export function renderSVG(){
  const st=ST() as any, sh=st.shuttle, answered=S.phase!=='play';
  let s=defs()+court()+sideView(sh)+`<path d="${trail(sh,false)}" class="trail"/>`;
  if(st.type==='shot'){
    const [cx,cy]=sh.to;
    st.options.forEach((o,i)=>{
      const [tx,ty]=o.d, L=Math.hypot(tx-cx,ty-cy), ex=tx-(tx-cx)/L*34, ey=ty-(ty-cy)/L*34;
      const k=answered?o.g:'n', col=answered?MAT[o.g]:'var(--m-neutral)';
      const a0=S.answers[S.si], hi=answered&&a0?(S.view!=null?S.view:a0.i):-1, on=i===hi;
      s+=`<line x1="${cx}" y1="${cy}" x2="${ex}" y2="${ey}" class="arrow ${answered?'':'n'}" style="stroke:${col};${answered?(on?'stroke-width:10;':'opacity:.28;'):''}" marker-end="url(#ah-${k})"/>`;
      s+=`<g class="tgt${on?' on':''}" transform="translate(${tx} ${ty})" style="${answered&&!on?'opacity:.45':''}"><circle r="${on?30:22}" style="fill:${col}"/><text y="${on?11:9}" text-anchor="middle">${LET[i]}</text></g>`;
    });
  }
  if(st.type==='place'&&answered){
    for(const t of Object.values(TG(st)) as Target[]){
      s+=`<circle cx="${t.best[0]}" cy="${t.best[1]}" r="${t.rGood}" class="zone-good"/><circle cx="${t.best[0]}" cy="${t.best[1]}" r="${t.rBest}" class="zone-best"/>`;}
  }
  s+=`<ellipse id="sh-shadow" rx="13" ry="8" fill="rgba(0,0,0,.35)"/><g id="sh-top"><circle r="12" fill="#FFFFFF" stroke="#1A1A1A" stroke-width="3"/><circle r="5" fill="#1A1A1A"/></g>`;
  for(const [k,v] of Object.entries(st.players as Record<string,Pt>)){
    const cls=(k==='Y'||k==='P')?'y':'o';
    if(st.type==='place'&&TG(st)[k]){
      s+=tok(v[0],v[1],k,cls+' faded');
      const tp=S.taps[k];
      if(tp) s+=tok(tp[0],tp[1],k,cls);
      if(S.phase==='play'&&S.active===k&&Object.keys(TG(st)).length>1){const c=tp||v;s+=`<circle cx="${c[0]}" cy="${c[1]}" r="56" class="ring"/>`;}
    } else s+=tok(v[0],v[1],k,cls);
  }
  if(st.type==='shot') s+=`<circle cx="${st.players.Y[0]}" cy="${st.players.Y[1]}" r="56" class="ring"/>`;
  if(st.type==='place'&&answered){const e=1-Math.pow(1-(S.corr==null?1:S.corr),3);
    for(const [k,t] of Object.entries(TG(st))){const f=S.taps[k]||t.best, x=f[0]+(t.best[0]-f[0])*e, y=f[1]+(t.best[1]-f[1])*e;
      if(Math.hypot(t.best[0]-f[0],t.best[1]-f[1])>20) s+=`<line x1="${f[0]}" y1="${f[1]}" x2="${x}" y2="${y}" class="corr-line"/>`;
      s+=tok(Math.round(x),Math.round(y),k,'ideal');}}
  svg.innerHTML=s;
  drawShuttle(S.t);
}
export function drawShuttle(t: number){
  const sh=ST().shuttle, [x,y,h]=shPos(sh,t);
  const top=document.getElementById('sh-top'), sd=document.getElementById('sh-shadow')!, sv=document.getElementById('sh-side')!, lb=document.getElementById('sh-side-lbl')!;
  if(!top) return;
  top.setAttribute('transform',`translate(${x} ${y}) scale(${1+h/600})`);
  sd.setAttribute('cx',String(x)); sd.setAttribute('cy',String(y+6));
  sv.setAttribute('cx',String(SX+h*HS)); sv.setAttribute('cy',String(y));
  lb.textContent=t>=1?(h/100).toFixed(1).replace('.',T.dec)+' m':'';
  lb.setAttribute('x',String(Math.min(SX+h*HS+18,SX+220))); lb.setAttribute('y',String(y+(t>=1?-16:0)));
}
