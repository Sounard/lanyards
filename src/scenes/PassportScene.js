import Phaser from 'phaser';
import { VIEW, TKEY } from '../config.js';
import { text, panel, COL, FONT, isHelpKey } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';
import * as Save from '../save.js';
import * as Telemetry from '../telemetry.js';
import { generateP5Assets } from '../p5assets.js';
import { COLLECTIBLES } from '../data/collectibles.js';

// The Passport / Lanyard wall — the client-side "storage" made visible. Shows
// earned collectibles (cute p5 art, with Phaser-drawn fallbacks), completed
// levels, best run, and the hubs for SUBMIT A CON / JOIN THE GUILD / telemetry.
const FALLBACK = {
  lanyard: TKEY.lanyard, amber: TKEY.packet, agent: TKEY.agent,
  secret: TKEY.spark, flame: TKEY.slash, ribbon: TKEY.lanyard, envelope: TKEY.packet
};

export default class PassportScene extends Phaser.Scene {
  constructor() { super('PassportScene'); }

  create() {
    applyCRT(this);
    this.cameras.main.setBackgroundColor(COL.bg);
    this.p5ok = generateP5Assets(this);     // defensive; falls back if p5 throws

    const save = Save.load();
    const cx = VIEW.W / 2;

    text(this, cx, 36, 'P A S S P O R T', { size: 22, color: COL.glow, origin: 0.5 });
    text(this, cx, 64,
      `lanyards ${save.lanyards.length}    ·    collectibles ${save.collectibles.length}/${COLLECTIBLES.length}    ·    best run ${save.bestPackets}`,
      { size: 13, color: COL.bright, origin: 0.5 });

    panel(this, 60, 88, VIEW.W - 120, 320);

    // collectibles grid: 4 cols
    const cols = 4, cw = (VIEW.W - 160) / cols, x0 = 100, y0 = 150, rh = 132;
    COLLECTIBLES.forEach((c, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = x0 + col * cw, y = y0 + row * rh;
      const earned = save.collectibles.includes(c.id);
      const key = (this.p5ok && this.textures.exists('p5_' + c.icon)) ? 'p5_' + c.icon : FALLBACK[c.icon];
      const img = this.add.image(x, y, key).setOrigin(0.5);
      img.setDisplaySize(44, 44);
      img.setAlpha(earned ? 1 : 0.18);
      if (earned) this.tweens.add({ targets: img, scale: img.scale * 1.08, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      else text(this, x, y, '?', { size: 22, color: COL.mid, origin: 0.5 });
      text(this, x, y + 30, earned ? c.name : '— locked —', { size: 12, color: earned ? COL.glow : COL.mid, origin: 0.5, align: 'center', wrap: cw - 16 });
      if (earned) text(this, x, y + 48, c.hint, { size: 10, color: COL.bright, origin: 0.5, align: 'center', wrap: cw - 16 });
    });

    // status / privacy
    const tele = save.settings.telemetry !== false;
    const joined = !!save.guild;
    text(this, cx, 426,
      `telemetry: ${tele ? 'ON' : 'OFF'} (anonymous, cookieless)    ·    ${joined ? 'in the Guild ✓ (no email kept here)' : 'not in the Guild'}`,
      { size: 12, color: COL.bright, origin: 0.5 });

    const guildKey = joined ? 'F  leave guild (delete my email)' : 'G  join the guild';
    text(this, cx, 470, `S  submit a con      ${guildKey}      T  telemetry on/off`, { size: 13, color: COL.glow, origin: 0.5 });
    text(this, cx, 494, 'Esc  back to the map        ? / ,  help', { size: 12, color: COL.bright, origin: 0.5 });
    this.note = text(this, cx, 516, '', { size: 11, color: COL.glow, origin: 0.5 });

    this.input.keyboard.on('keydown', e => this.onKey(e));
    this.events.on('resume', () => this.scene.restart());   // refresh after a form/help closes
  }

  flash(msg) {
    this.note.setText(msg);
    this.time.delayedCall(2200, () => { if (this.note) this.note.setText(''); });
  }

  forget() {
    if (!Save.load().guild) { this.flash('you are not in the Guild.'); return; }
    sfx.blip();
    this.flash('leaving the Guild — deletion requested…');
    Telemetry.forgetGuild().then(() => { Save.removeCollectible('guild'); this.scene.restart(); });
  }

  onKey(e) {
    if (!this.scene.isActive()) return;
    const k = (e.key || '').toLowerCase();
    if (e.key === 'Escape') { sfx.blip(); this.scene.start('MenuScene'); }
    else if (k === 's') this.openForm('suggest');
    else if (k === 'g') { if (Save.load().guild) this.flash('already in the Guild — press F to leave.'); else this.openForm('contact'); }
    else if (k === 'f') this.forget();
    else if (k === 't') this.toggleTelemetry();
    else if (isHelpKey(e)) { this.scene.pause(); this.scene.launch('HelpScene', { from: this.scene.key }); this.scene.bringToTop('HelpScene'); }
  }

  openForm(mode) {
    sfx.blip();
    this.scene.pause();
    this.scene.launch('FormScene', { mode, from: 'PassportScene' });
    this.scene.bringToTop('FormScene');
  }

  toggleTelemetry() {
    const s = Save.load();
    s.settings.telemetry = !(s.settings.telemetry !== false);
    Save.save();
    sfx.blip();
    this.scene.restart();
  }
}
