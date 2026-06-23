import Phaser from 'phaser';
import { VIEW, GREEN } from '../config.js';
import { text, panel, COL, FONT } from '../ui.js';

// Controls + legend overlay, opened with `?` from the menu, a level, or a duel.
// A transparent overlay over a paused scene — so it must NOT run the CRT pass
// (that pass forces alpha=1 and would black out everything below). It resumes
// whichever scene opened it (`from`) on close.
const LEFT = [
  'TRAVERSE',
  '  move        ← →   (A D)',
  '  jump        ↑  W  Space',
  '  climb nets  ↑ ↓',
  '  dive        ↓   underwater',
  '',
  'COMBAT',
  '  swing       J   (or F)',
  '  enemies split when hit',
  '',
  'INTERACT',
  '  talk NPC    E',
  '  bind MCP    E   at a socket',
  '  help        ?   (toggle)',
  '  back / quit  Esc'
];

const RIGHT = [
  'HUD',
  '  ████        health',
  '  PACKETS     currency',
  '  meter       air, when diving',
  '  [AGENT]     familiar active',
  '',
  'LEGEND',
  '  floppy      save / respawn',
  '  404 · CTX   death pit  (-1)',
  '  faint pit   SECRET — jump in!',
  '  lanyard     exit / reward',
  '',
  'FLAME WAR (duel)',
  '  ← → move   J light   K heavy',
  '  L special    Space block',
  '',
  'WORLD MAP',
  '  Enter play   A amber',
  '  C crt        R reset'
];

export default class HelpScene extends Phaser.Scene {
  constructor() { super('HelpScene'); }

  init(data) { this.from = data && data.from; }

  create() {
    // dim the world behind
    this.add.rectangle(0, 0, VIEW.W, VIEW.H, GREEN.bg, 0.9).setOrigin(0, 0);
    panel(this, 28, 50, VIEW.W - 56, VIEW.H - 100);

    text(this, VIEW.W / 2, 70, '?  HELP — CONTROLS & LEGEND', { size: 18, color: COL.glow, origin: 0.5 });

    text(this, 70, 108, LEFT.join('\n'), { size: 14, color: COL.bright, lineSpacing: 5 });
    text(this, 510, 108, RIGHT.join('\n'), { size: 14, color: COL.bright, lineSpacing: 5 });

    const foot = text(this, VIEW.W / 2, VIEW.H - 62, 'press  ?  or  ESC  to close', { size: 14, color: COL.mid, origin: 0.5 });
    this.tweens.add({ targets: foot, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown', e => {
      if (e.key === '?' || e.key === 'Escape' || e.key === 'h' || e.key === 'H') this.close();
    });
    this.input.on('pointerdown', () => this.close());
  }

  close() {
    if (this._closing) return;
    this._closing = true;
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}
