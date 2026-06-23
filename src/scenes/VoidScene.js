import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, typewriter, COL } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';

// The secret room — the signature beat, now data-driven. The punishing pits
// punish; THIS one rewards the player who jumps in on purpose. Black screen,
// one blinking cursor, a short joke, a guaranteed reward, then it returns you.
// Content (lines / reward text / bonus) comes from the level's `secret` data.
export default class VoidScene extends Phaser.Scene {
  constructor() { super('VoidScene'); }

  init(data) { this.cb = data; }

  create() {
    applyCRT(this);
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const cy = VIEW.H / 2;
    const jokes = this.cb.lines || ['...'];

    const cursor = text(this, 80, cy, '█', { size: 18, color: COL.glow });
    this.tweens.add({ targets: cursor, alpha: 0, duration: 420, yoyo: true, repeat: -1 });
    sfx.secret();

    this.line = text(this, 110, cy, '', { size: 18, color: COL.bright });
    let idx = 0;
    const next = () => {
      if (idx >= jokes.length) { this.showReward(cy); return; }
      typewriter(this, this.line, jokes[idx], 28, () => {
        cursor.setPosition(110 + this.line.width + 4, cy);
        this.time.delayedCall(900, () => { idx++; next(); });
      });
      cursor.setPosition(110, cy);
    };
    this.time.delayedCall(500, next);

    this.input.keyboard.on('keydown', () => { if (this.ready) this.leave(); });
  }

  showReward(cy) {
    const bonus = this.cb.bonus || 25;
    const reward = this.cb.rewardText || 'a small fortune';
    const msg = this.cb.alreadyHave
      ? `>> reward: +${bonus} packets. (you already found ${reward}.)`
      : `>> reward: +${bonus} packets & ${reward}.`;
    text(this, 110, cy + 50, msg, { size: 15, color: COL.glow, wrap: VIEW.W - 220 });
    text(this, 110, cy + 120, 'press any key to cat yourself back out', { size: 13, color: COL.mid });
    this.ready = true;
    sfx.win();
  }

  leave() {
    if (this._left) return;
    this._left = true;
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop();
      this.cb.onReturn(this.cb.bonus || 25);
    });
  }
}
