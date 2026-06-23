import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, bar, COL } from '../ui.js';

// HUD = a shell. Runs as a TRANSPARENT overlay over the level. It must NOT run
// the CRT post-FX pass — that pass forces alpha=1 and would paint the whole
// screen opaque black over the world below. The level beneath already has CRT.
export default class UIScene extends Phaser.Scene {
  constructor() { super('UIScene'); }

  create() {
    this.hp = text(this, 16, 12, '', { size: 18, color: COL.bright });
    this.coins = text(this, 16, 36, '', { size: 15, color: COL.glow });
    this.bw = text(this, 16, 58, '', { size: 14, color: COL.mid });
    this.layer = text(this, VIEW.W - 16, 12, '', { size: 14, color: COL.mid }).setOrigin(1, 0);
    this.help = text(this, VIEW.W - 16, 34, 'MOVE ←→  JUMP ↑  CLIMB ↑↓  DIVE ↓  HIT J  TALK E', { size: 11, color: COL.dark }).setOrigin(1, 0);

    this.toast = text(this, VIEW.W / 2, VIEW.H - 40, '', { size: 14, color: COL.glow, origin: 0.5 });
    this.toast.setAlign('center');
    this._lastToast = 0;
  }

  update() {
    const h = this.registry.get('hud');
    if (h) {
      this.hp.setText('HEALTH ' + bar(h.hp, h.maxhp));
      this.coins.setText('PACKETS: ' + h.coins + (h.hasAgent ? '   [AGENT]' : ''));
      if (h.underwater) {
        this.bw.setVisible(true);
        const blocks = Math.round((h.bandwidth / h.maxbw) * 16);
        const low = h.bandwidth < 30;
        this.bw.setText((h.meterLabel || 'BANDWIDTH') + ' ' + bar(blocks, 16));
        this.bw.setColor(low ? COL.bright : COL.mid);
      } else {
        this.bw.setVisible(false);
      }
      this.layer.setText(h.layer ? '// ' + h.layer : '');
    }

    const t = this.registry.get('toast');
    if (t && t.t !== this._lastToast) {
      this._lastToast = t.t;
      this.toast.setText(t.msg).setAlpha(1);
      this.tweens.killTweensOf(this.toast);
      this.tweens.add({ targets: this.toast, alpha: 0, delay: 2600, duration: 700 });
    }
  }
}
