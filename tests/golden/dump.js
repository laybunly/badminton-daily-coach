// Runs inside the legacy page (classic script globals are reachable by name).
// Returns everything that must stay identical after the refactor.
// eslint-disable-next-line no-unused-vars
function goldenDump() {
  const sample = (fn) => {
    try { return fn(3, 7, 'X', 'Y'); } catch (e) { return 'ERR:' + e.message; }
  };
  const i18n = {};
  for (const l of ['de', 'en']) {
    i18n[l] = {};
    for (const [k, v] of Object.entries(I18N[l])) i18n[l][k] = typeof v === 'function' ? { fn: sample(v) } : v;
  }
  const saved = { LANG, prefs: JSON.parse(JSON.stringify(PREFS)) };
  const built = {};
  for (const lang of ['de', 'en']) for (const level of ['beg', 'int', 'adv']) for (const hand of ['R', 'L']) {
    LANG = lang; PREFS.level = level; PREFS.hand = hand;
    built[`${lang}-${level}-${hand}`] = buildPuzzles();
  }
  LANG = saved.LANG; Object.assign(PREFS, saved.prefs); PUZZLES = buildPuzzles();
  const daily = {};
  for (let d = 0; d < 400; d++) daily[d] = dailyIds(d);
  return {
    PUZ_DE, PUZ_EN, PUZ_EN_TEXT, CATS, GEN_IDS: GEN.map((p) => p.id), GLOSSARY, I18N: i18n,
    ID2CODE, CODE2IDX, PLAN: buildPlan(), PLAN_START, daily, PRACT, built,
  };
}
