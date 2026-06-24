import Phaser from 'phaser';
import { VIEW } from '../config.js';
import { text, panel, COL, FONT } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';
import * as Save from '../save.js';
import { setUrl } from '../router.js';
import { CONFERENCES } from '../data/conferences.js';

// Title + world map. Lists every conference; only those with a playable scene
// and an unlock can be entered. inter-net is always open. Adding a level later
// = flip `playable` in conferences.js and ship the scene — this menu adapts.

const TITLE = [
  ' _    ____ _  _ _   _ ____ ____ ___  ____ ',
  ' |    |__| |\\ | \\_/  |__| |__/ |  \\ [__  ',
  ' |___ |  | | \\|  |   |  | |  \\ |__/ ___] ',
  '        &  D R A G O N S                  '
];

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create(data) {
    applyCRT(this);
    this.cameras.main.setBackgroundColor(COL.bg);
    this.badRoute = data && data.badRoute;
    setUrl('');   // the map lives at /
    const cx = VIEW.W / 2;

    // title
    this.add.text(cx, 70, TITLE.join('\n'), {
      fontFamily: FONT, fontSize: '16px', color: COL.bright, align: 'center', lineSpacing: 2
    }).setOrigin(0.5, 0.5);

    const save = Save.load();
    text(this, cx, 150, `LANYARDS: ${save.lanyards.length}    BEST RUN: ${save.bestPackets} packets`,
      { size: 14, color: COL.glow, origin: 0.5 });

    text(this, cx, 178, '/ W O R L D   M A P /   select a conference', { size: 14, color: COL.mid, origin: 0.5 });

    // scrollable-ish list (fits on one screen for the seeded roster)
    panel(this, cx - 410, 200, 820, 280);
    this.items = [];
    this.idx = 0;

    const cols = 2;
    const colW = 400;
    const rowH = 26;
    const startX = cx - 400;
    const startY = 212;
    CONFERENCES.forEach((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * colW;
      const y = startY + row * rowH;
      const open = this.isOpen(c);
      const tag = open ? '[OPEN]' : '[LOCKED]';
      const t = text(this, x, y, '', { size: 13 });
      t._conf = c; t._open = open; t._tag = tag;
      this.items.push(t);
    });

    // footer / controls
    this.hint = text(this, cx, 500,
      '↑↓←→ move   ENTER play   ? help   A amber   C crt   R reset',
      { size: 13, color: COL.mid, origin: 0.5 });
    this.status = text(this, cx, 522, '', { size: 13, color: COL.glow, origin: 0.5 });

    this.renderList();
    if (this.badRoute) {
      this.status.setText(`>> "${this.badRoute}" is not a level — choose one below.`).setColor(COL.bright);
    }

    // input
    this.input.keyboard.on('keydown', e => this.onKey(e));
  }

  isOpen(c) {
    if (!c.playable) return false;
    if (!c.requires) return true;                              // e.g. inter-net is always open
    return Save.hasLanyard(c.requires) || Save.isVisited(c.id); // prereq Lanyard OR already entered (V1: deep links unlock)
  }

  renderList() {
    this.items.forEach((t, i) => {
      const sel = i === this.idx;
      const c = t._conf;
      const name = c.name.length > 22 ? c.name.slice(0, 21) + '…' : c.name;
      const label = `${sel ? '>' : ' '} ${name}`.padEnd(26, ' ') + t._tag;
      t.setText(label);
      t.setColor(sel ? COL.glow : (t._open ? COL.bright : COL.mid));
    });
    const c = this.items[this.idx]._conf;
    let s = `${c.real}  —  ${c.feel}`;
    if (c.playable) s += `   ·   play.lanyards.lol/${c.id}`;
    this.status.setText(s).setColor(COL.glow);
  }

  onKey(e) {
    if (!this.scene.isActive()) return;   // Help overlay is up
    const cols = 2;
    if (e.key === '?' || e.key === 'h' || e.key === 'H') { this.openHelp(); return; }
    if (e.key === 'ArrowDown') { this.idx = Math.min(this.items.length - 1, this.idx + cols); sfx.blip(); this.renderList(); }
    else if (e.key === 'ArrowUp') { this.idx = Math.max(0, this.idx - cols); sfx.blip(); this.renderList(); }
    else if (e.key === 'ArrowRight') { this.idx = Math.min(this.items.length - 1, this.idx + 1); sfx.blip(); this.renderList(); }
    else if (e.key === 'ArrowLeft') { this.idx = Math.max(0, this.idx - 1); sfx.blip(); this.renderList(); }
    else if (e.key === 'Enter') this.choose();
    else if (e.key === 'a' || e.key === 'A') this.toggleAmber();
    else if (e.key === 'c' || e.key === 'C') this.toggleCrt();
    else if (e.key === 'r' || e.key === 'R') this.resetSave();
  }

  choose() {
    const item = this.items[this.idx];
    if (!item._open) { sfx.lose(); this.flashStatus('>> LOCKED. earn the Lanyard that opens this gate.'); return; }
    sfx.win();
    this.cameras.main.fadeOut(350, 2, 10, 2);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(item._conf.scene, { levelId: item._conf.id });
    });
  }

  toggleAmber() {
    if (!Save.isUnlocked('amberPalette')) { sfx.lose(); this.flashStatus('>> amber palette is locked. some pits give back...'); return; }
    const save = Save.load();
    const next = save.palette === 'amber' ? 'green' : 'amber';
    Save.setPalette(next);
    this.registry.set('amber', next === 'amber');
    sfx.secret();
    this.flashStatus(`>> palette: ${next.toUpperCase()}`);
  }

  toggleCrt() {
    const save = Save.load();
    save.settings.crt = !save.settings.crt;
    Save.save();
    this.registry.set('crt', save.settings.crt);
    sfx.blip();
    this.flashStatus(`>> CRT FX: ${save.settings.crt ? 'ON' : 'OFF'}`);
  }

  resetSave() {
    Save.resetSave();
    this.registry.set('amber', false);
    this.registry.set('crt', true);
    sfx.save();
    this.scene.restart();
  }

  openHelp() {
    sfx.blip();
    this.scene.pause();
    this.scene.launch('HelpScene', { from: 'MenuScene' });
    this.scene.bringToTop('HelpScene');
  }

  flashStatus(msg) {
    this.status.setText(msg);
    this.time.delayedCall(1600, () => { if (this.items[this.idx]) this.renderList(); });
  }
}
