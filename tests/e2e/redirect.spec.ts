// The old GitHub Pages address forwards to the new domain and keeps #CODE links.
import { test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const NEW = 'https://badminton-daily-coach.com/';

for (const file of ['index.html', '404.html']) for (const hash of ['', '#AB3K9', '#plan']) {
  test(`${file} forwards ${hash || 'home'}`, async ({ page }) => {
    await page.route(NEW + '**', (r) => r.fulfill({ body: 'new app', contentType: 'text/html' }));
    await page.goto(pathToFileURL(resolve('redirect', file)).href + hash);
    await page.waitForURL(NEW + hash);
  });
}
