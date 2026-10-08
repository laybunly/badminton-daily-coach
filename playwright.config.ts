import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { ...devices['Pixel 7'], browserName: 'chromium' },
  webServer: [
    { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI, timeout: 120_000 },
    { command: 'node scripts/serve-legacy.mjs', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI },
  ],
});
