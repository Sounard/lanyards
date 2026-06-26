import Phaser from 'phaser';
import { VIEW, GREEN } from '../config.js';
import { text, panel, COL, isHelpOrClose } from '../ui.js';

// Controls + legend overlay, opened with ? / , (or h) from anywhere. Transparent
// overlay over a paused scene — so it must NOT run the CRT pass. Closes on any of
// the help keys, ESC, the [X], or a click anywhere — so it's never stuck open.

const COL1 = [
  'TRAVERSE',
  '  move       ← →  (A D)',
  '  jump       ↑ / W / Space',
  '  climb      ↑ ↓  (nets)',
  '  dive       ↓  (underwater)',
  '',
  'COMBAT',
  '  swing      J  (or F)',
  '  enemies split when hit',
  '',
  'INTERACT',
  '  talk / bind  E',
  '  help        ? / ,',
  '  close       Esc / X'
];

const COL2 = [
  'HUD',
  '  ████      health',
  '  PACKETS   currency',
  '  meter     air (diving)',
  '  [AGENT]   familiar',
  '',
  'LEGEND',
  '  floppy    save point',
  '  404 / CTX death pit (-1)',
  '  faint pit SECRET — jump in!',
  '  lanyard   exit / reward'
];

const COL3 = [
  'FLAME WAR (duel)',
  '  ← → move',
  '  J light   K heavy',
  '  L special  Space block',
  '',
  'WORLD MAP',
  '  Enter play   P passport',
  '  A amber  C crt  R reset',
  '',
  'PASSPORT (P)',
  '  S submit a con',
  '  G join the guild',
  '  T telemetry on/off'
];

export default class HelpScene extends Phaser.Scene {
  constructor() { super('HelpScene'); }

  init(data) { this.from = data && data.from; }

  create() {
    this.add.rectangle(0, 0, VIEW.W, VIEW.H, GREEN.bg, 0.92).setOrigin(0, 0);
    panel(this, 28, 44, VIEW.W - 56, VIEW.H - 92);

    text(this, VIEW.W / 2, 62, 'HELP — CONTROLS & LEGEND', { size: 18, color: COL.glow, origin: 0.5 });

    // close [X], top-right of the panel
    const x = text(this, VIEW.W - 58, 60, '[ X ]', { size: 16, color: COL.glow, origin: 0.5 });
    x.setInteractive({ useHandCursor: true });
    x.on('pointerover', () => x.setColor(COL.bright));
    x.on('pointerout', () => x.setColor(COL.glow));
    x.on('pointerdown', () => this.close());

    text(this, 60, 100, COL1.join('\n'), { size: 13, color: COL.bright, lineSpacing: 5 });
    text(this, 360, 100, COL2.join('\n'), { size: 13, color: COL.bright, lineSpacing: 5 });
    text(this, 650, 100, COL3.join('\n'), { size: 13, color: COL.bright, lineSpacing: 5 });

    const foot = text(this, VIEW.W / 2, VIEW.H - 60, 'press  ? / ,  or  ESC  ·  click  ·  [ X ]   to close', { size: 14, color: COL.glow, origin: 0.5 });
    this.tweens.add({ targets: foot, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown', e => { if (isHelpOrClose(e)) this.close(); });
    this.input.on('pointerdown', () => this.close());
  }

  close() {
    if (this._closing) return;
    this._closing = true;
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}
