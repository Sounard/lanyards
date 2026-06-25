import Phaser from 'phaser';
import { VIEW, GREEN } from '../config.js';
import { text, panel, COL } from '../ui.js';
import { sfx } from '../audio/sfx.js';
import * as Save from '../save.js';
import * as Telemetry from '../telemetry.js';

// A terminal-styled text-input overlay. Two modes:
//   'suggest' — SUBMIT A CON (a conference name) -> queues + earns Contributor.
//   'contact' — JOIN THE GUILD (email + explicit consent) -> queues + earns Guild.
// Transparent overlay over a paused scene => NO CRT pass. GDPR: contact is opt-in,
// email-only, and erasable from the Passport.
export default class FormScene extends Phaser.Scene {
  constructor() { super('FormScene'); }

  init(data) { this.mode = (data && data.mode) || 'suggest'; this.from = data && data.from; }

  create() {
    this.value = '';
    this.consent = false;
    this.done = false;
    const suggest = this.mode === 'suggest';

    this.add.rectangle(0, 0, VIEW.W, VIEW.H, GREEN.bg, 0.88).setOrigin(0, 0);
    panel(this, 120, 150, VIEW.W - 240, 240);

    const cx = VIEW.W / 2;
    text(this, cx, 174, suggest ? 'SUBMIT A CON' : 'JOIN THE GUILD', { size: 20, color: COL.glow, origin: 0.5 });
    text(this, cx, 206,
      suggest ? 'which conference should we add? (type it)'
              : 'email me when new levels drop (totally optional)',
      { size: 13, color: COL.mid, origin: 0.5 });

    // input line with a blinking caret
    text(this, 150, 250, suggest ? 'con>' : 'mail>', { size: 16, color: COL.bright });
    this.field = text(this, 215, 250, '', { size: 16, color: COL.glow });
    this.caret = text(this, 215, 250, '_', { size: 16, color: COL.glow });
    this.tweens.add({ targets: this.caret, alpha: 0, duration: 450, yoyo: true, repeat: -1 });

    // consent (contact only) + GDPR note
    if (!suggest) {
      this.consentText = text(this, 150, 292, '', { size: 13, color: COL.bright });
      this.paintConsent();
      text(this, 150, 318, 'email only · unsubscribe anytime · never shared · TAB toggles consent', { size: 10, color: COL.mid });
    } else {
      text(this, 150, 296, 'we read every suggestion. anonymous.', { size: 11, color: COL.mid });
    }

    this.msg = text(this, cx, 352, 'ENTER submit    ·    ESC cancel', { size: 12, color: COL.mid, origin: 0.5 });

    this.input.keyboard.on('keydown', e => this.onKey(e));
  }

  paintConsent() {
    if (this.consentText) this.consentText.setText(`[${this.consent ? 'x' : ' '}] yes, email me about new levels`);
  }

  onKey(e) {
    if (this.done) { if (e.key === 'Enter' || e.key === 'Escape') this.close(); return; }
    if (e.key === 'Escape') { this.close(); return; }
    if (e.key === 'Tab') { e.preventDefault && e.preventDefault(); if (this.mode === 'contact') { this.consent = !this.consent; this.paintConsent(); sfx.blip(); } return; }
    if (e.key === 'Backspace') { this.value = this.value.slice(0, -1); this.repaint(); return; }
    if (e.key === 'Enter') { this.submit(); return; }
    if (e.key.length === 1 && this.value.length < (this.mode === 'suggest' ? 40 : 60)) {
      // allow sane characters
      if (/[\w @.\-+'&!?]/.test(e.key)) { this.value += e.key; this.repaint(); }
    }
  }

  repaint() {
    this.field.setText(this.value);
    this.caret.setX(215 + this.field.width + 2);
  }

  submit() {
    if (this.mode === 'suggest') {
      if (!Telemetry.submitSuggestion(this.value)) { this.flash('type something first.'); return; }
      Save.addCollectible('contributor');
      sfx.win();
      this.finish('thanks! logged. you earned the CONTRIBUTOR badge.');
    } else {
      if (!this.consent) { this.flash('tick consent (TAB) to join.'); return; }
      if (!Telemetry.submitContact(this.value)) { this.flash('that email looks off.'); return; }
      Save.addCollectible('guild');
      sfx.win();
      this.finish('welcome to the Guild. you earned the GUILD badge.');
    }
  }

  flash(m) { this.msg.setText(m).setColor(COL.bright); }

  finish(m) {
    this.done = true;
    this.value = '';
    this.field.setText('');
    this.caret.setVisible(false);
    if (this.consentText) this.consentText.setVisible(false);
    this.msg.setText(m + '   (ENTER / ESC)').setColor(COL.glow);
  }

  close() {
    if (this._closing) return;
    this._closing = true;
    sfx.blip();
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}
