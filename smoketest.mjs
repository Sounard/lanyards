// Headless runtime smoke test: boot the game, drive it through the cold open and
// into a level, and fail on any console error / page error. Not shipped — a dev
// self-test. Run with the dev server up: `node smoketest.mjs <url>`.
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173';
const errors = [];

const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });

page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));

await page.goto(url, { waitUntil: 'networkidle' });

// probe the live game state via the window.__LD handle
async function state() {
  return await page.evaluate(() => {
    const g = window.__LD;
    if (!g) return { ready: false };
    const active = g.scene.getScenes(true).map(s => s.scene.key);
    return { ready: true, active, webgl: g.renderer && g.renderer.type === 2 };
  });
}

const log = (...a) => console.log('[smoke]', ...a);

await page.waitForTimeout(1500);
log('after load:', JSON.stringify(await state()));

// cold open: press a key to dial in, then ESC to skip to menu fast
await page.keyboard.press('Enter');
await page.waitForTimeout(800);
await page.keyboard.press('Escape');
await page.waitForTimeout(1500);
log('after boot:', JSON.stringify(await state()));

// menu -> start inter-net (inter-net is the first item, already selected)
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
let st = await state();
log('after select:', JSON.stringify(st));

// drive the player a bit: walk, jump, attack
for (let i = 0; i < 30; i++) {
  await page.keyboard.down('ArrowRight');
  await page.keyboard.press('Space');
  await page.keyboard.press('KeyJ');
  await page.waitForTimeout(60);
}
await page.keyboard.up('ArrowRight');
await page.waitForTimeout(500);

// read gameplay state out of the scene
const lvl = await page.evaluate(() => {
  const g = window.__LD;
  const s = g.scene.getScene('InterNetScene');
  if (!s || !s.player) return null;
  return {
    px: Math.round(s.player.x), py: Math.round(s.player.y),
    hp: s.player.health, slimes: s.slimes ? s.slimes.getLength() : -1,
    packets: s.packets ? s.packets.length : -1, coins: s.coins
  };
});
log('gameplay:', JSON.stringify(lvl));

await page.screenshot({ path: 'smoke-shot.png' });

await browser.close();

if (errors.length) {
  console.error('\nFAIL — runtime errors:\n' + errors.join('\n'));
  process.exit(1);
}
if (!lvl) { console.error('\nFAIL — never reached gameplay'); process.exit(1); }
console.log('\nPASS — booted, reached gameplay, no console errors.');
