import { expect, type Browser, type Page } from '@playwright/test';

export const LEGACY = 'http://127.0.0.1:4174/';
export const NEXT = 'http://localhost:4173/';
/** Fixed "today": day 8 of the plan. */
export const NOW = new Date(2026, 9, 8, 10, 0, 0);

export interface AppPage { page: Page; errors: string[]; url: string }

/** Opens an app with a fake clock, blocked fonts/analytics and a GoatCounter stub that records events. */
export async function openApp(browser: Browser, url: string, opts: { lang?: 'de' | 'en'; hash?: string; storage?: Record<string, unknown> } = {}): Promise<AppPage> {
  const ctx = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.clock.install({ time: NOW });
  await page.route(/fonts\.(googleapis|gstatic)\.com|gc\.zgo\.at/, (r) => r.abort());
  const storage: Record<string, unknown> = { ...(opts.lang ? { cs_lang: JSON.stringify(opts.lang) } : {}), ...(opts.storage || {}) };
  await page.addInitScript((st) => {
    if (!sessionStorage.getItem('seeded')) { for (const [k, v] of Object.entries(st)) localStorage.setItem(k, String(v)); sessionStorage.setItem('seeded', '1'); }
    (window as any).__gc = [];
    (window as any).goatcounter = { count: (e: unknown) => (window as any).__gc.push(e) };
  }, storage);
  await page.goto(url + (opts.hash ? '#' + opts.hash : ''));
  return { page, errors, url };
}

/** Normalised DOM of the whole app (the removed 3D container is ignored). */
export async function snap(page: Page): Promise<string> {
  return page.evaluate(() => {
    const c = document.querySelector('.app')!.cloneNode(true) as HTMLElement;
    c.querySelector('#three')?.remove();
    // the moving shuttle depends on frame timing, not on app logic
    for (const id of ['sh-side', 'sh-side-lbl', 'sh-shadow', 'sh-top']) {
      const e = c.querySelector('#' + id);
      if (e) for (const a of ['cx', 'cy', 'x', 'y', 'transform']) e.removeAttribute(a);
      if (e && id === 'sh-side-lbl') e.textContent = '';
    }
    return (document.documentElement.lang + '|' + c.outerHTML.replace(/>\s+</g, '><')).split(location.origin).join('ORIGIN');
  });
}

/** Lets the shuttle flight finish so answers are enabled. */
export async function settle(page: Page) { await page.clock.runFor(1500); }

/** Taps the court at court coordinates (cm). */
export async function tapCourt(page: Page, x: number, y: number) {
  const pt = await page.evaluate(([x, y]) => {
    const svg = document.getElementById('svg') as unknown as SVGSVGElement;
    const p = svg.createSVGPoint(); p.x = x; p.y = y; const s = p.matrixTransform(svg.getScreenCTM()!);
    return [s.x, s.y];
  }, [x, y]);
  await page.mouse.click(pt[0], pt[1]);
}

/** Answers the current step: option `opt` for shot steps, or taps spots and locks for place steps. */
export async function answer(page: Page, opt = 0) {
  if (await page.locator('#panel .opt').count()) { await page.click(`#panel .opt[data-opt="${opt}"]`); return; }
  // grid of spots on the user's half; taps close to a player only select it, so keep trying
  const spots: [number, number][] = [];
  for (const y of [1000, 1200, 760, 1300]) for (const x of [80, 530, 305, 200, 420]) spots.push([x + opt * 7, y]);
  for (const [x, y] of spots) { if (!(await page.locator('[data-act="lock"]:disabled').count())) break; await tapCourt(page, x, y); }
  await page.click('[data-act="lock"]');
}

/** Runs the same step on both apps and expects identical DOM afterwards. */
export async function both(a: AppPage, b: AppPage, step: (p: Page) => Promise<unknown>, label: string) {
  await step(a.page); await step(b.page);
  expect(await snap(b.page), label).toBe(await snap(a.page));
}
