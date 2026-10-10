// Flows on the new build: every puzzle, code links, report, opt-out hashes, PWA.
import { test, expect } from '@playwright/test';
import { NEXT, openApp, settle, answer } from './helpers';
import { ID2CODE } from '../../src/puzzles/codes';
import { I18N } from '../../src/i18n/strings';

const CODES = Object.values(ID2CODE) as string[];
const gc = (p: import('@playwright/test').Page) => p.evaluate(() => (window as any).__gc.map((e: any) => e.path));

for (const [lang, level, hand] of [['de', 'int', 'R'], ['en', 'beg', 'L'], ['de', 'adv', 'R'], ['fr', 'beg', 'L']] as const) {
  test(`all ${CODES.length} puzzles play through without errors (${lang}/${level}/${hand})`, async ({ browser }) => {
    test.setTimeout(240_000);
    const { page, errors } = await openApp(browser, NEXT, { lang, storage: { cs_prefs3: JSON.stringify({ level, hand, stats: true }) } });
    for (const code of CODES) {
      await page.evaluate((c) => { location.hash = c; }, code);
      await expect(page.locator('#main'), code).toBeVisible();
      for (let s = 0; s < 6; s++) {
        await settle(page);
        await answer(page, s % 4);
        await expect(page.locator('#panel .verdict'), `${code} step ${s}`).toBeVisible();
        if (!(await page.locator('[data-act="cont"]').count())) break;
        await page.click('[data-act="cont"]');
      }
    }
    expect((await gc(page)).filter((p: string) => p.startsWith('code/open/')).length).toBe(CODES.length);
    expect(errors).toEqual([]);
  });
}

test('French: chosen in settings, stored, browser language detected, glossary links', async ({ browser }) => {
  const { page, errors } = await openApp(browser, NEXT, { lang: 'de' });
  await page.click('[data-act="settings"]');
  await page.click('[data-lang="fr"]');
  await expect(page.locator('[data-lang="fr"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#sheet-body h3')).toHaveText(I18N.fr.settingsT);
  expect(await page.evaluate(() => [document.documentElement.lang, localStorage.getItem('cs_lang')])).toEqual(['fr', '"fr"']);
  await page.click('#sheet-close');
  await expect(page.locator('.app')).toContainText(I18N.fr.heroTitle);
  await page.click('[data-act="dstart"]');
  await settle(page);
  await answer(page, 0);
  await expect(page.locator('#panel .verdict')).toBeVisible();
  await expect(page.locator('#panel .term').first()).toBeVisible();
  expect(errors).toEqual([]);
  const ctx = await browser.newContext({ locale: 'fr-FR', serviceWorkers: 'block' });
  const p2 = await ctx.newPage();
  await p2.goto(NEXT);
  expect(await p2.evaluate(() => document.documentElement.lang)).toBe('fr');
});

test('privacy page: linked from home and settings in the current language, no Google requests', async ({ browser }) => {
  const { page, errors } = await openApp(browser, NEXT, { lang: 'fr' });
  const hosts = new Set<string>();
  page.on('request', (r) => hosts.add(new URL(r.url()).host));
  await page.reload();
  await expect(page.locator('a.privlink')).toHaveAttribute('href', './datenschutz.html#fr');
  await page.click('[data-act="settings"]');
  await expect(page.locator('#sheet-body a.privlink')).toHaveText('Confidentialité');
  await page.click('#sheet-body a.privlink');
  await expect(page).toHaveURL(/datenschutz\.html#fr$/);
  for (const id of ['de', 'en', 'fr']) await expect(page.locator('#' + id)).toContainText('Bunly Lay');
  expect([...hosts].filter((h) => /google|gstatic/.test(h))).toEqual([]);
  expect(errors).toEqual([]);
});

test('shared code link opens the task and clears the hash', async ({ browser }) => {
  const code = CODES[42];
  const { page, errors } = await openApp(browser, NEXT, { hash: code.toLowerCase() });
  await expect(page.locator('#main')).toBeVisible();
  await expect(page.locator('#pmode')).not.toBeEmpty();
  expect(new URL(page.url()).hash).toBe('');
  expect(await gc(page)).toContain('code/open/' + code);
  await page.click('[data-act="sharetask"]');
  await expect(page.locator('.codebox')).toHaveText(code);
  await expect(page.locator('.linkline')).toHaveText(NEXT + '#' + code);
  expect(errors).toEqual([]);
});

test('unknown code is ignored, #plan opens the plan', async ({ browser }) => {
  const { page } = await openApp(browser, NEXT, { hash: 'ZZZZZ' });
  await expect(page.locator('[data-act="dstart"]')).toBeVisible();
  await page.evaluate(() => { location.hash = 'plan'; });
  await expect(page.locator('[data-plan]').first()).toBeVisible();
  expect(await page.locator('[data-plan]').count()).toBeGreaterThan(0);
});

test('report sends a GoatCounter event with code and reasons', async ({ browser }) => {
  const code = CODES[7];
  const { page, errors } = await openApp(browser, NEXT, { hash: code });
  await page.click('[data-act="report"]');
  await page.click('[data-rep="pos"]'); await page.click('[data-rep="why"]');
  await page.fill('#repc', 'Test');
  await expect(page.locator('#repgh')).toHaveAttribute('href', /Test/);
  await page.click('[data-repsend]');
  await expect(page.locator('#sheet')).toBeHidden();
  await expect(page.locator('#toast')).toHaveText(I18N.de.repThanks);
  expect(await gc(page)).toEqual(expect.arrayContaining(['report/open', `report/${code}/pos+why`]));
  expect(errors).toEqual([]);
});

test('report without stats offers no send button', async ({ browser }) => {
  const { page } = await openApp(browser, NEXT, { hash: CODES[7], storage: { cs_prefs3: JSON.stringify({ level: 'int', hand: 'R', stats: false }) } });
  await page.click('[data-act="report"]');
  await expect(page.locator('[data-repsend]')).toHaveCount(0);
  await expect(page.locator('#sheet-body')).toContainText(I18N.de.repNoSend);
  expect(await gc(page)).toEqual([]);
});

test('opt-out hashes switch stats with a toast', async ({ browser }) => {
  const { page } = await openApp(browser, NEXT, { hash: 'nostats' });
  const state = () => page.evaluate(() => ({ skip: localStorage.getItem('skipgc'), prefs: JSON.parse(localStorage.getItem('cs_prefs3') || '{}'), hash: location.hash }));
  await expect(page.locator('#toast')).toHaveText(I18N.de.statsOffMsg);
  expect(await state()).toMatchObject({ skip: 't', prefs: { stats: false }, hash: '' });
  await page.click('[data-act="dstart"]');
  expect(await gc(page)).toEqual([]);
  await page.evaluate(() => { location.hash = 'stats'; });
  await expect(page.locator('#toast')).toHaveText(I18N.de.statsOnMsg);
  expect(await state()).toMatchObject({ skip: null, prefs: { stats: true }, hash: '' });
  await page.evaluate(() => { location.hash = 'toggle-goatcounter'; });
  await expect(page.locator('#toast')).toHaveText(I18N.de.statsOffMsg);
  expect(await state()).toMatchObject({ skip: 't', prefs: { stats: false } });
});

test('only the known localStorage keys are written', async ({ browser }) => {
  const { page } = await openApp(browser, NEXT);
  await page.click('[data-act="dstart"]');
  await settle(page); await answer(page, 0);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.sort()).toEqual(['cs_daily', 'cs_rating', 'cs_results']);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cs_daily')!).key)).toMatch(/^d-p2/);
});

test('PWA: manifest, icons and service worker', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(NEXT);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const m = await (await page.request.get(new URL(href!, NEXT).href)).json();
  expect(m).toMatchObject({ name: 'Badminton Daily Coach', short_name: 'Daily Coach', display: 'standalone' });
  for (const i of m.icons) expect((await page.request.get(new URL(i.src, NEXT).href)).ok(), i.src).toBe(true);
  await expect.poll(() => page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.active), { timeout: 15_000 }).toBe(true);
  await ctx.close();
});
