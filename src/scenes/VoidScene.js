import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, typewriter, COL } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';

// /dev/null — the signature beat. The 404 pits punish; THIS one rewards the
// player who jumps in on purpose. Black screen, one blinking cursor, one joke,
// a guaranteed reward (amber palette unlock + bonus packets), then it returns
// you. The lesson the whole game teaches, in one move: depth = secrets.

const JOKES = [
  'you have reached /dev/null.',
  'everything written here is discarded.',
  'except, apparently, you.'
];

const BONUS = 25;

export default class VoidScene extends Phaser.Scene {
  constructor() { super('VoidScene'); }

  init(data) { this.cb = data; }

  create() {
    applyCRT(this);
    this.cameras.main.setBackgroundColor('#000000');
    this.cameras.main.fadeIn(400, 0, 0, 0);

    const cx = VIEW.W / 2, cy = VIEW.H / 2;

    // a single blinking cursor
    const cursor = text(this, 80, cy, '█', { size: 18, color: COL.glow });
    this.tweens.add({ targets: cursor, alpha: 0, duration: 420, yoyo: true, repeat: -1 });
    sfx.secret();

    this.line = text(this, 110, cy, '', { size: 18, color: COL.bright });
    const full = JOKES.join('  ');
    let idx = 0;
    const next = () => {
      if (idx >= JOKES.length) { this.showReward(cx, cy); return; }
      typewriter(this, this.line, JOKES[idx], 28, () => {
        cursor.setPosition(110 + this.line.width + 4, cy);
        this.time.delayedCall(900, () => { idx++; next(); });
      });
      cursor.setPosition(110, cy);
    };
    this.time.delayedCall(500, next);

    this.input.keyboard.on('keydown', () => { if (this.ready) this.leave(); });
  }

  showReward(cx, cy) {
    const granted = !this.cb.alreadyAmber;
    const msg = granted
      ? `>> reward: +${BONUS} packets & the AMBER phosphor palette.\n>> (toggle it on the world map with 'A'.)`
      : `>> reward: +${BONUS} packets. (you already found the amber.)`;
    text(this, 110, cy + 50, msg, { size: 15, color: COL.glow });
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
      this.cb.onReturn(BONUS);
    });
  }
}
