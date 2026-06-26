import Phaser from 'phaser';
import { VIEW, TKEY } from '../config.js';
import { text, panel, bar, COL, FONT, isHelpKey } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';

// Flame War — a contained 1v1 fighting-game duel. The joke is "an internet
// argument became Mortal Kombat", not a deep engine. Reusable: launched with a
// fighter config { sprite, health, aggression, taunts, win/lose lines }. Each
// level supplies its own opponents; this engine is shared.
//
// Win  -> opponent RAGEQUITS (onWin(reward)).
// Lose -> DISCONNECTED (onLose()).

const GROUND_Y = 400;
const MOVES = {
  light:   { range: 78,  dmg: 6,  cd: 360,  lunge: 14 },
  heavy:   { range: 86,  dmg: 13, cd: 760,  lunge: 22 },
  special: { range: 130, dmg: 20, cd: 1900, lunge: 30 }
};

export default class DuelScene extends Phaser.Scene {
  constructor() { super('DuelScene'); }

  init(data) { this.cb = data; this.cfg = data.fighter; }

  create() {
    applyCRT(this);
    this.cameras.main.setBackgroundColor(COL.bg);
    this.phase = 'intro';

    // arena
    this.add.tileSprite(VIEW.W / 2, GROUND_Y + 60, VIEW.W, 120, TKEY.block).setDepth(1).setAlpha(0.8);
    text(this, VIEW.W / 2, 70, 'an argument has escalated', { size: 13, color: COL.mid, origin: 0.5 });

    // fighters
    this.you = this.makeFighter(280, true, TKEY.player, 100, 'YOU');
    this.foe = this.makeFighter(680, false, this.cfg.sprite, this.cfg.health, this.cfg.name);

    // health bars
    this.youBar = text(this, 24, 24, '', { size: 16, color: COL.bright });
    this.foeBar = text(this, VIEW.W - 24, 24, '', { size: 16, color: COL.bright }).setOrigin(1, 0);
    this.drawBars();

    text(this, VIEW.W / 2, VIEW.H - 26,
      'MOVE ←→   J light   K heavy   L special   SPACE block', { size: 12, color: COL.mid, origin: 0.5 });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('J,K,L,SPACE,ENTER');
    this.input.keyboard.on('keydown', e => {
      if (isHelpKey(e) && this.scene.isActive()) {
        this.scene.pause();
        this.scene.launch('HelpScene', { from: this.scene.key });
        this.scene.bringToTop('HelpScene');
      }
    });

    // taunt bubble
    this.bubble = text(this, this.foe.spr.x, 120, '', { size: 14, color: COL.glow, origin: 0.5 });
    this.bubble.setAlign('center');

    this.aiTimer = 0;
    this.introSplash();
  }

  makeFighter(x, isPlayer, key, hp, label) {
    const spr = this.add.image(x, GROUND_Y, key).setOrigin(0.5, 1).setDepth(10);
    spr.setScale(2);
    spr.setFlipX(!isPlayer);
    return { spr, x, hp, maxhp: hp, isPlayer, label, facing: isPlayer ? 1 : -1, atkCd: 0, blocking: false, stun: 0 };
  }

  introSplash() {
    const splash = text(this, VIEW.W / 2, 220, '⚔  FLAME WAR!  ⚔', { size: 40, color: COL.glow, origin: 0.5 });
    splash.setAlign('center');
    sfx.flame();
    this.tweens.add({ targets: splash, scale: 1.2, duration: 400, yoyo: true, repeat: 1 });
    this.say(this.cfg.openingTaunt, 1400);

    let n = 3;
    const count = text(this, VIEW.W / 2, 300, '', { size: 30, color: COL.bright, origin: 0.5 });
    this.time.addEvent({
      delay: 500, repeat: 3, callback: () => {
        if (n > 0) { count.setText(String(n)); sfx.blip(); n--; }
        else {
          count.setText('FLAME ON!'); sfx.win();
          splash.destroy();
          this.tweens.add({ targets: count, alpha: 0, delay: 400, duration: 300, onComplete: () => count.destroy() });
          this.phase = 'fight';
        }
      }
    });
  }

  drawBars() {
    const yb = Math.round(this.you.hp / this.you.maxhp * 18);
    const fb = Math.round(this.foe.hp / this.foe.maxhp * 18);
    this.youBar.setText('YOU        ' + bar(Math.max(0, yb), 18));
    const name = this.cfg.name.length > 14 ? this.cfg.name.slice(0, 14) : this.cfg.name;
    this.foeBar.setText(bar(Math.max(0, fb), 18) + '  ' + name);
  }

  say(msg, dur = 1200) {
    this.bubble.setText(msg).setAlpha(1).setPosition(this.foe.spr.x, 120);
    this.tweens.killTweensOf(this.bubble);
    this.tweens.add({ targets: this.bubble, alpha: 0, delay: dur, duration: 500 });
  }

  update(time, dtMs) {
    if (this.phase === 'intro') return;
    const dt = dtMs / 1000;

    if (this.phase === 'fight') {
      this.handlePlayer(time, dt);
      this.handleAI(time, dt);
      this.faceOff();
      this.drawBars();
      if (this.foe.hp <= 0) this.end(true);
      else if (this.you.hp <= 0) this.end(false);
    }
  }

  faceOff() {
    // keep them on their sides
    this.you.x = Phaser.Math.Clamp(this.you.x, 120, this.foe.x - 70);
    this.foe.x = Phaser.Math.Clamp(this.foe.x, this.you.x + 70, VIEW.W - 120);
    this.you.spr.x = this.you.x; this.foe.spr.x = this.foe.x;
  }

  handlePlayer(time, dt) {
    const k = this.keys, c = this.cursors;
    const f = this.you;
    f.blocking = k.SPACE.isDown;
    if (f.stun > time) return;
    if (!f.blocking) {
      if (c.left.isDown) f.x -= 180 * dt;
      if (c.right.isDown) f.x += 180 * dt;
    }
    if (time > f.atkCd) {
      if (Phaser.Input.Keyboard.JustDown(k.J)) this.attack(f, this.foe, 'light', time);
      else if (Phaser.Input.Keyboard.JustDown(k.K)) this.attack(f, this.foe, 'heavy', time);
      else if (Phaser.Input.Keyboard.JustDown(k.L)) this.attack(f, this.foe, 'special', time);
    }
  }

  handleAI(time, dt) {
    const f = this.foe, t = this.you;
    if (f.stun > time) { f.blocking = false; return; }
    const dist = Math.abs(f.x - t.x);

    // block when the player is mid-lunge and close
    f.blocking = (t._lunging && dist < 110 && Math.random() < this.cfg.aggression);

    if (!f.blocking) {
      if (dist > MOVES.light.range - 6) {
        f.x -= Math.sign(f.x - t.x) * (120 + 60 * this.cfg.aggression) * dt; // approach
      } else if (Math.random() < 0.01) {
        f.x += Math.sign(f.x - t.x) * 80 * dt; // occasional spacing
      }
    }

    if (time > this.aiTimer && time > f.atkCd && dist < MOVES.heavy.range + 10 && !f.blocking) {
      this.aiTimer = time + 300 + Math.random() * 600 * (1 - this.cfg.aggression);
      if (Math.random() < this.cfg.aggression) {
        const r = Math.random();
        const kind = r < 0.15 ? 'special' : r < 0.5 ? 'heavy' : 'light';
        this.attack(f, t, kind, time);
        if (Math.random() < 0.5 && this.cfg.taunts.length) {
          this.say(this.cfg.taunts[Phaser.Math.Between(0, this.cfg.taunts.length - 1)], 900);
        }
      }
    }
  }

  attack(attacker, target, kind, time) {
    const m = MOVES[kind];
    attacker.atkCd = time + m.cd;
    attacker.stun = time + Math.min(220, m.cd * 0.4);

    // lunge animation
    const dir = Math.sign(target.x - attacker.x) || attacker.facing;
    attacker._lunging = true;
    this.tweens.add({
      targets: attacker.spr, x: attacker.spr.x + dir * m.lunge, duration: 90, yoyo: true,
      onComplete: () => { attacker._lunging = false; }
    });
    const slash = this.add.image(attacker.spr.x + dir * 40, GROUND_Y - 36, TKEY.slash)
      .setDepth(12).setScale(1.4).setFlipX(dir < 0);
    this.tweens.add({ targets: slash, alpha: 0, duration: 180, onComplete: () => slash.destroy() });

    const dist = Math.abs(attacker.x - target.x);
    if (dist <= m.range) {
      let dmg = m.dmg;
      if (target.blocking) { dmg = Math.ceil(dmg * 0.2); sfx.hitSlime(); }
      else sfx.hurt();
      target.hp = Math.max(0, target.hp - dmg);
      target.stun = time + (target.blocking ? 120 : 200);
      target.spr.setTint(0xaaffaa);
      this.time.delayedCall(120, () => target.spr.clearTint());
      this.cameras.main.shake(90, 0.006);
      const fx = text(this, target.spr.x, GROUND_Y - 90, target.blocking ? 'BLOCK' : '-' + dmg,
        { size: 16, color: COL.glow, origin: 0.5 });
      this.tweens.add({ targets: fx, y: GROUND_Y - 130, alpha: 0, duration: 500, onComplete: () => fx.destroy() });
    } else {
      sfx.blip();
    }
  }

  end(win) {
    if (this.phase === 'over') return;
    this.phase = 'over';
    const lines = win ? this.cfg.winLines : this.cfg.loseLines;
    const banner = win ? 'OPPONENT RAGEQUIT' : 'DISCONNECTED';
    win ? sfx.win() : sfx.lose();

    panel(this, VIEW.W / 2 - 290, 146, 580, 210).setDepth(20);
    text(this, VIEW.W / 2, 178, banner, { size: 30, color: COL.glow, origin: 0.5 }).setDepth(21);
    text(this, VIEW.W / 2, 244, lines.join('\n'),
      { size: 15, color: COL.glow, origin: 0.5, align: 'center', wrap: 520, lineSpacing: 6 })
      .setDepth(21);
    text(this, VIEW.W / 2, 328, 'press  ENTER', { size: 15, color: COL.bright, origin: 0.5 }).setDepth(21);

    this.input.keyboard.once('keydown-ENTER', () => this.finish(win));
    this.input.keyboard.once('keydown-SPACE', () => this.finish(win));
  }

  finish(win) {
    this.scene.stop();
    if (win) this.cb.onWin(this.cfg.reward);
    else this.cb.onLose();
  }
}
