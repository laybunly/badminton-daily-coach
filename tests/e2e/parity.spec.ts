// Side by side: the new build must render exactly the same DOM as the original single-file app.
import { test, expect } from '@playwright/test';
import { LEGACY, NEXT, openApp, both, settle, answer } from './helpers';

for (const lang of ['de', 'en'] as const) {
  test(`daily flow is identical (${lang})`, async ({ browser }) => {
    const a = await openApp(browser, LEGACY, { lang }), b = await openApp(browser, NEXT, { lang });
    await both(a, b, async () => {}, 'home');
    await both(a, b, (p) => p.click('[data-act="dstart"]'), 'start');
    for (let i = 0; i < 5; i++) {
      for (let step = 0; step < 4; step++) {
        await both(a, b, settle, `p${i} s${step} ready`);
        await both(a, b, (p) => answer(p, (i + step) % 4), `p${i} s${step} answered`);
        if (await b.page.locator('[data-act="cont"]').count()) await both(a, b, (p) => p.click('[data-act="cont"]'), `p${i} next step`);
        else break;
      }
      const next = (await b.page.locator('[data-act="dnext"]').count()) ? 'dnext' : 'home';
      await both(a, b, (p) => p.click(`[data-act="${next}"]`), `p${i} → ${next}`);
    }
    await both(a, b, (p) => p.click('.lessons summary'), 'lessons');
    await both(a, b, async (p) => { await p.click('[data-act="share"]'); await p.locator('#sharebox textarea, #toast:not([hidden])').first().waitFor(); }, 'share');
    expect(await b.page.evaluate(() => (window as any).__gc)).toEqual(await a.page.evaluate(() => (window as any).__gc));
    expect(b.errors).toEqual([]);
  });
}

test('training, practice, plan, settings, glossary are identical', async ({ browser }) => {
  const a = await openApp(browser, LEGACY), b = await openApp(browser, NEXT);
  await both(a, b, (p) => p.click('[data-act="practice"]'), 'training');
  await both(a, b, (p) => p.click('[data-cat="3"]'), 'category');
  await both(a, b, (p) => p.click('[data-set="2"]'), 'set');
  for (let i = 0; i < 5; i++) {
    await both(a, b, settle, `set p${i}`);
    await both(a, b, (p) => answer(p, i % 4), `set p${i} answered`);
    while (await b.page.locator('[data-act="cont"]').count()) { await both(a, b, (p) => p.click('[data-act="cont"]'), 'cont'); await both(a, b, settle, 'settle'); await both(a, b, (p) => answer(p, 1), 'ans'); }
    const act = (await b.page.locator('[data-act="snext"]').count()) ? 'snext' : 'setdone';
    await both(a, b, (p) => p.click(`[data-act="${act}"]`), act);
  }
  await both(a, b, (p) => p.click('[data-act="totrain"]'), 'training again');
  await both(a, b, (p) => p.click('[data-act="pool"]'), 'pool');
  await both(a, b, (p) => p.click('[data-pf="miss"]'), 'mistakes filter');
  await both(a, b, (p) => p.click('[data-pf="all"]'), 'all filter');
  await both(a, b, (p) => p.click('[data-pid]'), 'practice puzzle');
  await both(a, b, settle, 'practice ready');
  await both(a, b, (p) => answer(p, 2), 'practice answered');
  await both(a, b, (p) => p.click('#setbtn'), 'settings sheet (play)');
  await both(a, b, (p) => p.click('[data-hand="L"]'), 'left-handed pending');
  await both(a, b, (p) => p.click('[data-lvl="beg"]'), 'beginner pending');
  await both(a, b, (p) => p.click('#sheet-close'), 'close');
  await both(a, b, (p) => p.click('[data-act="pnext"]'), 'practice next (applies pending)');
  await both(a, b, settle, 'ready');
  await both(a, b, (p) => p.click('#helpbtn'), 'glossary');
  await both(a, b, (p) => p.click('#sheet-close'), 'close');
  await both(a, b, (p) => p.click('#backbtn'), 'back to pool');
  await both(a, b, (p) => p.click('[data-act="totrain"]'), 'back to training');
  await both(a, b, (p) => p.click('[data-act="tohome"]'), 'home');
  await both(a, b, (p) => p.click('[data-act="settings"]'), 'settings (home)');
  await both(a, b, (p) => p.click('[data-lang="en"]'), 'english');
  await both(a, b, (p) => p.click('[data-lvl="adv"]'), 'advanced');
  await both(a, b, (p) => p.click('[data-stats="0"]'), 'stats off');
  await both(a, b, (p) => p.click('[data-plan-open]'), 'plan');
  await both(a, b, (p) => p.click('[data-plan]'), 'plan puzzle');
  await both(a, b, settle, 'ready');
  const ls = (p: typeof a.page) => p.evaluate(() => Object.fromEntries(Object.keys(localStorage).sort().map((k) => [k, localStorage.getItem(k)])));
  const la = await ls(a.page), lb = await ls(b.page);
  delete la.cs_view3d; // only written by the removed 3D view
  expect(lb).toEqual(la);
  expect(b.errors).toEqual([]);
});
