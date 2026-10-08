// Shuttle flight loops: 1.3 s flight, 0.9 s hold at the hitting point, then again.
import { S, T } from '../state';
import { drawShuttle, renderSVG } from './render';
import { renderPanel } from '../ui/panel';

const FLY = 1300, HOLD = 900;
let rafId = 0;

export function play(): void {
  cancelAnimationFrame(rafId); S.paused = false; updPlayBtn();
  const t0 = performance.now() - (S.ready ? FLY : 0);
  const f = (now: number) => {
    const e = (now - t0) % (FLY + HOLD); S.t = Math.min(1, e / FLY); drawShuttle(S.t);
    if (!S.ready && now - t0 >= FLY) { S.ready = true; S.t = 1; renderPanel(); }
    if (!S.paused) rafId = requestAnimationFrame(f);
  };
  rafId = requestAnimationFrame(f);
}
export function stopPlay(): void { cancelAnimationFrame(rafId); }
/** The correction animation was removed on purpose: the ideal position shows at once. */
export function startCorr(): void { S.corr = 1; renderSVG(); }
export function pause(): void { cancelAnimationFrame(rafId); S.paused = true; S.ready = true; S.t = 1; drawShuttle(1); updPlayBtn(); renderPanel(); }
export function updPlayBtn(): void {
  const paused = S.paused, b = document.getElementById('replay'); if (!b || !T) return;
  b.textContent = paused ? '▶' : '❚❚'; b.setAttribute('aria-label', paused ? T.resume : T.pause); b.title = paused ? T.resume : T.pause;
}
