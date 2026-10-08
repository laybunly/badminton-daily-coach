// Glossary of badminton terms; linkify() makes terms in questions and explanations tappable.
import { LANG } from '../state';
import type { Lang } from '../puzzles/types';

export const GLOSSARY: {k:string; de:string[]; en:string[]; x?:boolean; t:Record<Lang,string>; d:Record<Lang,string>}[]=[
 {k:'clear',de:['Clear'],en:['clear'],t:{de:'Clear',en:'Clear'},d:{de:'Hoher, weiter Schlag von oben bis ins gegnerische Hinterfeld. Verschafft dir Zeit.',en:'A high, deep overhead shot to the opponent’s back court. Buys you time.'}},
 {k:'lift',de:['Lift'],en:['lift'],t:{de:'Lift',en:'Lift'},d:{de:'Hoher Schlag von unten, meist aus dem Vorderfeld, bis ins gegnerische Hinterfeld. Ein Verteidigungsschlag.',en:'A high shot hit from below, usually from the forecourt, to the opponent’s back court. A defensive shot.'}},
 {k:'smash',de:['Smash'],en:['smash'],t:{de:'Smash',en:'Smash'},d:{de:'Harter Schlag von oben steil nach unten. Der wichtigste Angriffsschlag.',en:'A hard overhead shot hit steeply down. The main attacking shot.'}},
 {k:'half',de:['Halbsmash'],en:['half smash'],t:{de:'Halbsmash',en:'Half smash'},d:{de:'Ein Smash mit weniger Kraft, dafür kontrollierter und oft steiler.',en:'A smash with less power, but more control and often steeper.'}},
 {k:'drop',de:['Drop'],en:['drop'],t:{de:'Drop',en:'Drop'},d:{de:'Langsamer Schlag von oben, der knapp hinter dem Netz herunterfällt.',en:'A slow overhead shot that falls just behind the net.'}},
 {k:'net',de:['Netzdrop'],en:['net shot'],t:{de:'Netzdrop',en:'Net shot'},d:{de:'Kurzer Schlag am Netz, der knapp über die Netzkante geht und auf der anderen Seite herunterfällt.',en:'A short shot at the net that skims the tape and falls on the other side.'}},
 {k:'drive',de:['Drive'],en:['drive'],t:{de:'Drive',en:'Drive'},d:{de:'Schneller, flacher Schlag etwa auf Netzhöhe, parallel zum Boden.',en:'A fast, flat shot at about net height, parallel to the floor.'}},
 {k:'push',de:['Push'],en:['push'],t:{de:'Push',en:'Push'},d:{de:'Kurzer, flacher Schlag aus dem Vorderfeld ins gegnerische Mittelfeld.',en:'A short, flat shot from the forecourt into the opponent’s mid-court.'}},
 {k:'block',de:['Block'],en:['block'],t:{de:'Block',en:'Block'},d:{de:'Kurzer Abwehrschlag gegen einen Smash, der knapp hinter das Netz fällt.',en:'A short defensive reply to a smash that drops just behind the net.'}},
 {k:'kill',de:['Kill'],en:['kill'],t:{de:'Kill',en:'Kill'},d:{de:'Harter Schlag nach unten aus Netznähe, der den Ballwechsel beendet.',en:'A hard downward shot near the net that ends the rally.'}},
 {k:'flick',de:['Flick'],en:['flick'],t:{de:'Flick',en:'Flick'},d:{de:'Aufschlag oder Schlag, der kurz aussieht, dann aber schnell hoch über den Gegner geht.',en:'A serve or shot that looks short but then goes quickly up and over the opponent.'}},
 {k:'tee',de:['T'],en:['T'],x:true,t:{de:'T',en:'T'},d:{de:'Punkt, an dem vordere Aufschlaglinie und Mittellinie sich treffen. Im Doppel schlägt man meist von hier auf.',en:'The point where the short service line meets the centre line. In doubles you usually serve from here.'}},
 {k:'tape',de:['Netzkante'],en:['tape'],t:{de:'Netzkante',en:'Tape'},d:{de:'Oberkante des Netzes (1,55 m). Ist der Ball darüber, kannst du nach unten schlagen, darunter nicht.',en:'The top edge of the net (1.55 m). Above it you can hit down, below it you cannot.'}},
 {k:'fore',de:['Vorderfeld'],en:['forecourt'],t:{de:'Vorderfeld',en:'Forecourt'},d:{de:'Bereich zwischen Netz und vorderer Aufschlaglinie.',en:'The area between the net and the short service line.'}},
 {k:'mid',de:['Mittelfeld'],en:['mid-court'],t:{de:'Mittelfeld',en:'Mid-court'},d:{de:'Mittlerer Bereich zwischen Vorderfeld und Hinterfeld.',en:'The middle area between forecourt and back court.'}},
 {k:'back',de:['Hinterfeld'],en:['back court'],t:{de:'Hinterfeld',en:'Back court'},d:{de:'Hinterer Bereich des Feldes bis zur Grundlinie.',en:'The rear area of the court up to the baseline.'}},
 {k:'fh',de:['Vorhand'],en:['forehand'],t:{de:'Vorhand',en:'Forehand'},d:{de:'Die Schlägerseite: für Rechtshänder rechts vom Körper.',en:'The racket side: for right-handers, to the right of the body.'}},
 {k:'bh',de:['Rückhand'],en:['backhand'],t:{de:'Rückhand',en:'Backhand'},d:{de:'Die andere Seite: für Rechtshänder links vom Körper.',en:'The other side: for right-handers, to the left of the body.'}},
 {k:'cross',de:['Cross'],en:['cross-court'],t:{de:'Cross',en:'Cross-court'},d:{de:'Diagonal über das Feld gespielt, statt gerade die Linie entlang.',en:'Played diagonally across the court instead of straight down the line.'}},
 {k:'fb',de:['vorne-hinten'],en:['front and back'],t:{de:'Vorne-hinten',en:'Front and back'},d:{de:'Angriffsaufstellung im Doppel: ein Spieler vorne am Netz, einer hinten.',en:'The attacking formation in doubles: one player at the net, one at the back.'}},
 {k:'sbs',de:['nebeneinander'],en:['side by side'],t:{de:'Nebeneinander',en:'Side by side'},d:{de:'Verteidigungsaufstellung im Doppel: beide auf halber Tiefe, jeder deckt eine Seite.',en:'The defensive formation in doubles: both at mid depth, each covering one side.'}},
 {k:'rot',de:['Rotation'],en:['rotation'],t:{de:'Rotation',en:'Rotation'},d:{de:'Wechsel zwischen Angriff (vorne-hinten) und Verteidigung (nebeneinander) im Doppel.',en:'Switching between attack (front and back) and defence (side by side) in doubles.'}},
 {k:'ssl',de:['Aufschlaglinie'],en:['short service line','service line'],t:{de:'Vordere Aufschlaglinie',en:'Short service line'},d:{de:'Linie 1,98 m vor dem Netz. Der Aufschlag muss dahinter landen.',en:'The line 1.98 m from the net. The serve has to land beyond it.'}},
 {k:'base',de:['Grundlinie'],en:['baseline'],t:{de:'Grundlinie',en:'Baseline'},d:{de:'Die hintere Begrenzungslinie des Feldes.',en:'The back boundary line of the court.'}},
 {k:'centre',de:['Mittellinie'],en:['centre line'],t:{de:'Mittellinie',en:'Centre line'},d:{de:'Linie, die die beiden Aufschlagfelder trennt.',en:'The line that separates the two service courts.'}},
 {k:'frontp',de:['Vorderspieler','Netzspieler'],en:['front player','net player'],t:{de:'Vorderspieler',en:'Front player'},d:{de:'Der Spieler, der im Angriff vorne am Netz steht.',en:'The player at the net when your team attacks.'}},
 {k:'backp',de:['Hinterspieler'],en:['back player'],t:{de:'Hinterspieler',en:'Back player'},d:{de:'Der Spieler, der im Angriff hinten steht und meist smasht.',en:'The player at the back when your team attacks, usually the one who smashes.'}},
 {k:'recv',de:['Rückschläger'],en:['receiver'],t:{de:'Rückschläger',en:'Receiver'},d:{de:'Der Spieler, der den Aufschlag annimmt.',en:'The player who receives the serve.'}},
 {k:'ret',de:['Return'],en:['return of'],x:true,t:{de:'Return',en:'Return'},d:{de:'Der erste Schlag nach dem Aufschlag.',en:'The first shot after the serve.'}},
 {k:'counter',de:['Konter'],en:['counter'],t:{de:'Konter',en:'Counter'},d:{de:'Ein schneller Gegenangriff aus der Verteidigung heraus.',en:'A fast counter-attack out of defence.'}}
];
const GL_L='A-Za-zÄÖÜäöüß';
const GLRX={} as Record<Lang,RegExp>;
(['de','en'] as Lang[]).forEach(l=>{const alts: {v:string;x?:boolean}[]=[];GLOSSARY.forEach(g=>g[l].forEach(v=>alts.push({v,x:g.x})));
  alts.sort((a,b)=>b.v.length-a.v.length);
  GLRX[l]=new RegExp('(^|[^'+GL_L+'])('+alts.map(a=>a.v.replace(/[.*+?^${}()|[\]\\-]/g,'\\$&')+(a.x?'(?!['+GL_L+'])':'['+GL_L+']*')).join('|')+')','gi');});
function glKey(word: string){const w=word.toLowerCase();let best: string|null=null,len=0;
  GLOSSARY.forEach(g=>g[LANG].forEach(v=>{if(w.startsWith(v.toLowerCase())&&v.length>len){best=g.k;len=v.length;}}));return best;}
export function linkify(txt: string){if(!txt)return txt;const seen=new Set<string>();
  return txt.replace(GLRX[LANG],(all: string,pre: string,word: string)=>{const k=glKey(word);if(!k||seen.has(k))return all;seen.add(k);
    return pre+`<span role="button" tabindex="0" class="term" data-term="${k}">${word}</span>`;});}
