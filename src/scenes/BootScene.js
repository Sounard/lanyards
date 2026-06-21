import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, COL, FONT } from '../ui.js';
import { applyCRT } from '../main.js';
import { playDialup, sfx } from '../audio/sfx.js';

// The cold open. A fake BIOS/modem boot sequence; on the first keypress
// (the autoplay gesture) the dial-up handshake SCREECHES while the connect
// lines type out. This is the first thing the player sees — make it land.

const BIOS = [
  'PHOSPHOR BIOS v1.99  (C) 199X DRAGONBYTE SYSTEMS',
  '',
  'CPU....... ARCANE 8086 @ 4 MHz   [ OK ]',
  'MEMORY.... 640K (ought to be enough)   [ OK ]',
  'PHOSPHOR.. GREEN  CRT  ONLINE   [ OK ]',
  'POINTER... RUSTY, FOUND          [ OK ]',
  'LANYARDS.. 0 OF MANY             [ -- ]',
  '',
  'DETECTING MODEM ON COM1 ......... HAYES-COMPATIBLE',
  ''
];

const CONNECT = [
  'ATDT 1-800-INTERNET',
  '',
  'DIALING.......',
  'RING... RING...',
  'CARRIER DETECTED @ 2400 BAUD',
  'NEGOTIATING.... LAP-M / V.42bis',
  'CONNECT 2400/ARQ',
  '',
  'LOGIN: traveller',
  'PASSWORD: ********',
  '',
  '*** WELCOME TO THE inter-net ***',
  '*** LANYARDS & DRAGONS ***',
  ''
];

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    applyCRT(this);
    this.cameras.main.setBackgroundColor(COL.bg);

    this.lineY = 40;
    this.x0 = 60;
    this.printed = [];

    this.txt = text(this, this.x0, this.lineY, '', { size: 16, color: COL.bright });
    this.txt.setLineSpacing(6);

    this.cursor = text(this, this.x0, this.lineY, '█', { size: 16, color: COL.glow });
    this.tweens.add({ targets: this.cursor, alpha: 0, duration: 450, yoyo: true, repeat: -1 });

    this.buffer = '';
    this.stage = 'bios';
    this.typeLines(BIOS, 0, () => {
      this.buffer += '\n';
      this.prompt = text(this, this.x0, 0, 'PRESS ANY KEY TO DIAL IN', { size: 18, color: COL.glow });
      this.layoutPrompt();
      this.tweens.add({ targets: this.prompt, alpha: 0.25, duration: 500, yoyo: true, repeat: -1 });
      this.stage = 'await';
      this.armStart();
    });

    // allow skipping the whole thing
    this.input.keyboard.on('keydown-ESC', () => this.finish());
  }

  layoutPrompt() {
    if (this.prompt) this.prompt.setPosition(this.x0, this.lineY + this.lineCount() * 22 + 20);
  }

  lineCount() { return this.buffer.split('\n').length; }

  typeLines(lines, i, done) {
    if (i >= lines.length) { done && done(); return; }
    const line = lines[i];
    // type char by char
    let c = 0;
    this.time.addEvent({
      delay: line.length ? 10 : 60,
      repeat: Math.max(0, line.length - 1),
      callback: () => {
        c++;
        this.render(this.buffer + line.slice(0, c));
      },
      callbackScope: this
    });
    const total = (line.length ? line.length * 10 : 60) + 70;
    this.time.delayedCall(total, () => {
      this.buffer += line + '\n';
      this.render(this.buffer);
      this.typeLines(lines, i + 1, done);
    });
  }

  render(s) {
    this.txt.setText(s);
    const lines = s.split('\n');
    const lastLine = lines[lines.length - 1];
    const ly = this.lineY + (lines.length - 1) * 22;
    // measure last line width roughly (monospace ~9.6px at 16px)
    this.cursor.setPosition(this.x0 + lastLine.length * 9.6, ly);
  }

  armStart() {
    const go = () => {
      if (this.stage !== 'await') return;
      this.stage = 'connect';
      if (this.prompt) this.prompt.destroy();
      this.input.keyboard.off('keydown', go);
      this.input.off('pointerdown', go);

      // THE SIGNAL — screech + connect text
      const dur = playDialup();
      this.buffer += '\n';
      this.typeLines(CONNECT, 0, () => {
        this.time.delayedCall(500, () => this.finish());
      });
      // safety: finish even if audio length was 0
      this.time.delayedCall(Math.max(3500, (dur || 4) * 1000 + 800), () => {
        if (this.stage === 'connect') this.finish();
      });
    };
    this.input.keyboard.on('keydown', go);
    this.input.on('pointerdown', go);
  }

  finish() {
    if (this._done) return;
    this._done = true;
    sfx.blip();
    this.cameras.main.fadeOut(450, 2, 10, 2);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }
}
