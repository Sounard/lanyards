import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, panel, typewriter, COL, FONT } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';
import { DIALOGUE } from '../data/dialogue.js';

// Branching NPC dialogue (2-3 options), terminal-styled. SAFE options chuckle;
// the ONE flame-bait option (glows hotter) drops into a Flame War duel. Also
// hosts the BBS vendor shop. Launched over a paused level; calls back via the
// data callbacks the level passed in.

const SHOP_ITEMS = [
  { id: 'bandwidth', name: 'BIGGER PIPE  (refill + boost bandwidth)', cost: 6 },
  { id: 'pointer',   name: 'SHARPEN THE RUSTY POINTER  (+1 damage)', cost: 15 },
  { id: 'heart',     name: 'REDUNDANT BACKUP  (+1 max health)',      cost: 10 }
];

export default class DialogScene extends Phaser.Scene {
  constructor() { super('DialogScene'); }

  init(data) { this.data = data; }

  create() {
    applyCRT(this);
    this.tree = DIALOGUE[this.data.dialogueKey];
    this.sel = 0;
    this.mode = 'talk';

    const px = 70, py = 296, pw = VIEW.W - 140, ph = 220;
    panel(this, px, py, pw, ph);
    this.header = text(this, px + 18, py + 12, '> ' + this.tree.name, { size: 16, color: COL.glow });
    this.body = text(this, px + 18, py + 42, '', { size: 14, color: COL.bright, wrap: pw - 36 });
    this.optY = py + 132;
    this.opts = [];

    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.showNode(this.tree.start);
  }

  clearOpts() { this.opts.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); }); this.opts = []; }

  showNode(key) {
    this.mode = 'talk';
    this.node = this.tree.nodes[key];
    this.sel = 0;
    this.clearOpts();
    this.tw = typewriter(this, this.body, this.node.lines.join('\n'), 12, () => this.renderOpts());
    this.renderOpts(); // render greyed; highlighted once typing done
  }

  renderOpts() {
    this.clearOpts();
    const ready = this.tw ? this.tw.done() : true;
    this.node.options.forEach((o, i) => {
      const t = text(this, 92, this.optY + i * 24, '', { size: 14 });
      t._opt = o;
      this.opts.push(t);
    });
    this.paintOpts(ready);
  }

  paintOpts(ready) {
    this.opts.forEach((t, i) => {
      const o = t._opt;
      const sel = i === this.sel;
      const prefix = sel ? '> ' : '  ';
      t.setText(prefix + o.text);
      if (!ready) { t.setColor(COL.dark); return; }
      // flame-bait tell: a hotter glow + flicker
      if (o.bait) {
        t.setColor(sel ? COL.glow : COL.bright);
        if (!t._flick) {
          t._flick = this.tweens.add({ targets: t, alpha: 0.55, duration: 220, yoyo: true, repeat: -1 });
        }
      } else {
        t.setColor(sel ? COL.glow : COL.mid);
      }
    });
  }

  showShop() {
    this.mode = 'shop';
    this.sel = 0;
    this.clearOpts();
    const bought = this.data.shopBought();
    const coins = this.data.getCoins();
    this.body.setText(bought
      ? `NO CARRIER. you already bought this run.\ncome back next time. PACKETS: ${coins}`
      : `SALTY SHORES // STOCK. one purchase per run.\nPACKETS: ${coins}`);
    this.tw = null;

    this.shopList = bought ? [] : SHOP_ITEMS.slice();
    this.shopList.forEach((it, i) => {
      const t = text(this, 92, this.optY + i * 24, '', { size: 14 });
      t._item = it;
      this.opts.push(t);
    });
    const back = text(this, 92, this.optY + (this.shopList.length) * 24, '', { size: 14 });
    back._item = null; // back
    this.opts.push(back);
    this.paintShop();
  }

  paintShop() {
    const coins = this.data.getCoins();
    this.opts.forEach((t, i) => {
      const sel = i === this.sel;
      const prefix = sel ? '> ' : '  ';
      if (t._item) {
        const afford = coins >= t._item.cost;
        t.setText(`${prefix}${t._item.name}  [${t._item.cost}p]`);
        t.setColor(sel ? COL.glow : afford ? COL.bright : COL.dark);
      } else {
        t.setText(`${prefix}< done >`);
        t.setColor(sel ? COL.glow : COL.mid);
      }
    });
  }

  onKey(e) {
    if (e.key === 'Escape') { this.close(); return; }

    // skip typewriter on first action
    if (this.mode === 'talk' && this.tw && !this.tw.done()) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this.tw.skip(); this.paintOpts(true); return;
      }
    }

    const list = this.opts;
    if (!list.length) { if (e.key === 'Enter') this.close(); return; }

    if (e.key === 'ArrowDown') { this.sel = (this.sel + 1) % list.length; sfx.blip(); this.repaint(); }
    else if (e.key === 'ArrowUp') { this.sel = (this.sel - 1 + list.length) % list.length; sfx.blip(); this.repaint(); }
    else if (e.key === 'Enter' || e.key === ' ') this.confirm();
  }

  repaint() {
    if (this.mode === 'shop') this.paintShop();
    else this.paintOpts(this.tw ? this.tw.done() : true);
  }

  confirm() {
    if (this.mode === 'shop') {
      const it = this.opts[this.sel]._item;
      if (!it) { this.showRoot(); return; }
      const ok = this.data.onBuy(it);
      sfx[ok ? 'save' : 'lose']();
      this.body.setText(ok
        ? `PURCHASED: ${it.name}. NO CARRIER on the rest — one per run.`
        : `INSUFFICIENT PACKETS for ${it.name}.`);
      if (ok) { this.clearOpts(); const back = text(this, 92, this.optY, '> < done >', { size: 14, color: COL.glow }); back._item = null; this.opts = [back]; this.sel = 0; }
      else this.paintShop();
      return;
    }

    const o = this.opts[this.sel]._opt;
    if (!o) return;
    sfx.blip();
    if (o.duel) { sfx.flame(); this.data.onDuel(o.duel); return; }   // level stops this scene
    if (o.shop) { this.showShop(); return; }
    if (o.end) { this.close(); return; }
    if (o.to) { this.showNode(o.to); return; }
  }

  showRoot() { this.showNode(this.tree.start); }

  close() {
    sfx.blip();
    this.data.onClose();
    this.scene.stop();
  }
}
