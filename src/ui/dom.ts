export const $ = (id: string): HTMLElement => document.getElementById(id)!;
export const svg = document.getElementById('svg') as unknown as SVGSVGElement;
export const panel = $('panel');
export const homeEl = $('home');

let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string): void {
  const t = $('toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/** Copy/share fallbacks only use the native share sheet in a top-level window. */
export function isTop(): boolean { let top = true; try { top = window.self === window.top; } catch (e) { top = false; } return top; }
