import Phaser from 'phaser';
import { VIEW, GREEN, TKEY, PLAYER } from '../config.js';
import { text, panel, COL, FONT } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';
import * as Save from '../save.js';
import Player from '../entities/Player.js';
import LagSlime from '../entities/LagSlime.js';
import { LEVEL_INTERNET } from '../data/levelInterNet.js';
import { getDuel } from '../data/duels.js';

// Level 1 — inter-net. Builds the world from data (so a future level is just
// "new data + a thin scene"), runs the platformer loop, and brokers the
// dialogue / duel / void sub-scenes by pausing itself while they play.

const FLAVOR = [
  { y: 300,  s: 'C:\\> _' },
  { y: 920,  s: 'PRESS ANY KEY' },
  { y: 1560, s: 'NO CARRIER' },
  { y: 1700, s: 'MOSAIC v0.9 loading...' },
  { y: 2360, s: 'blink blink blink' },
  { y: 3180, s: '~~~ sea of bits ~~~' },
  { y: 3700, s: 'deeper = better loot' },
  { y: 4100, s: 'gopher://port/1/' }
];

export default class InterNetScene extends Phaser.Scene {
  constructor() { super('InterNetScene'); }

  create(data) {
    this.L = LEVEL_INTERNET;
    this.finished = false;
    this.coins = 0;            // spendable packet currency
    this.earned = 0;           // total earned (for best-run record)
    this.shopBought = false;   // vendor stocks one good thing per run
    this.dialogLock = 0;
    this.devnullLock = 0;
    this.fisherDamage = 0;

    const W = this.L.world.w, H = this.L.world.h;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor(GREEN.bg);
    applyCRT(this);

    this.buildBackground(W, H);
    this.buildSolids();
    this.buildNets();
    this.buildWater();
    this.buildFloppies();
    this.buildPackets();
    this.buildNPCs();
    this.buildExit();

    // player + slimes
    this.player = new Player(this, this.L.spawn.x, this.L.spawn.y);
    this.respawn = { x: this.L.spawn.x, y: this.L.spawn.y };
    this.slimes = this.physics.add.group();
    this.spawnSlimes();

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.slimes, this.solids);
    this.physics.add.overlap(this.player, this.slimes, (pl, sl) => this.touchSlime(sl), null, this);

    // camera
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 120);

    // input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,J,F,E,SPACE,ESC,ENTER');
    this.input.keyboard.on('keydown-ESC', () => this.quitToMenu());

    // HUD overlay scene
    this.scene.launch('UIScene');
    this.scene.bringToTop('UIScene');
    this.pushHud();

    // intro flash
    this.flash('CONNECTED. descend to the sea. press E to speak, J to swing.');
  }

  // ---------------- world construction ----------------

  buildBackground(W, H) {
    // layer band labels stream past as you descend
    this.L.layers.forEach(l => {
      text(this, 24, l.y, `// ${l.name}`, { size: 15, color: COL.mid }).setAlpha(0.6);
      text(this, 24, l.y + 20, l.note, { size: 12, color: COL.dark }).setAlpha(0.7);
    });
    FLAVOR.forEach(f => {
      text(this, W - 240 + (f.y % 60), f.y, f.s, { size: 12, color: COL.dark }).setAlpha(0.55);
    });
    // a faint blinking cursor easter-egg far background
    const cur = text(this, W / 2, 60, '█', { size: 22, color: COL.dark, origin: 0.5 });
    this.tweens.add({ targets: cur, alpha: 0, duration: 600, yoyo: true, repeat: -1 });
  }

  buildSolids() {
    this.solids = this.physics.add.staticGroup();
    for (const p of this.L.platforms) {
      this.add.tileSprite(p.x, p.y, p.w, p.h, TKEY.block).setDepth(5);
      const body = this.solids.create(p.x, p.y, TKEY.block).setVisible(false);
      body.displayWidth = p.w; body.displayHeight = p.h;
      body.refreshBody();
    }
    // side walls
    const H = this.L.world.h, W = this.L.world.w;
    [[-12, H], [W + 12, H]].forEach(([x]) => {
      const wall = this.solids.create(x, H / 2, TKEY.block).setVisible(false);
      wall.displayWidth = 24; wall.displayHeight = H; wall.refreshBody();
    });
  }

  buildNets() {
    this.netRects = [];
    for (const n of this.L.nets) {
      const ts = this.add.tileSprite(n.x, n.y, n.w, n.h, TKEY.net).setDepth(6);
      ts.setAlpha(0.9);
      this.netRects.push(new Phaser.Geom.Rectangle(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h));
    }
  }

  buildWater() {
    const w = this.L.water;
    this.waterRect = new Phaser.Geom.Rectangle(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
    const ts = this.add.tileSprite(w.x, w.y, w.w, w.h, TKEY.water).setDepth(8).setAlpha(0.5);
    ts.setBlendMode(Phaser.BlendModes.ADD);
    // bright surface line
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(2, GREEN.bright, 0.6);
    g.lineBetween(this.waterRect.x, this.waterRect.y, this.waterRect.right, this.waterRect.y);
  }

  buildFloppies() {
    this.floppies = [];
    for (const f of this.L.floppies) {
      const spr = this.add.image(f.x, f.y, TKEY.floppy).setDepth(10);
      this.tweens.add({ targets: spr, y: f.y - 4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.floppies.push({ x: f.x, y: f.y, spr, active: false });
    }
  }

  buildPackets() {
    this.packets = [];
    for (const z of this.L.packetZones) {
      const n = Phaser.Math.Between(z.count[0], z.count[1]);
      for (let i = 0; i < n; i++) {
        const x = z.x + Phaser.Math.Between(-z.w / 2, z.w / 2);
        const y = z.y + Phaser.Math.Between(-z.h / 2, z.h / 2);
        const spr = this.add.image(x, y, TKEY.packet).setDepth(11);
        this.tweens.add({ targets: spr, angle: 8, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.packets.push({ x, y, value: z.value, spr });
      }
    }
  }

  buildNPCs() {
    this.npcs = [];
    for (const n of this.L.npcs) {
      const spr = this.add.image(n.x, n.y, n.key).setDepth(12).setOrigin(0.5, 1);
      const tag = text(this, n.x, n.y - spr.height - 6, n.note || `[ ${n.id.toUpperCase()} ]`,
        { size: 11, color: COL.mid, origin: 0.5 });
      tag.setAlpha(0.8);
      this.npcs.push({ data: n, spr });
    }
  }

  buildExit() {
    const e = this.L.exit;
    panel(this, e.x - 46, e.y - 70, 92, 78, { alpha: 0.5 });
    const lan = this.add.image(e.x, e.y - 30, TKEY.lanyard).setDepth(12);
    this.tweens.add({ targets: lan, y: e.y - 38, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    text(this, e.x, e.y + 6, 'EXIT', { size: 14, color: COL.glow, origin: 0.5 });
    text(this, e.x, e.y + 22, 'log off / earn LANYARD', { size: 10, color: COL.mid, origin: 0.5 });
    this.exitRect = new Phaser.Geom.Rectangle(e.x - 40, e.y - 60, 80, 80);

    // /dev/null — deliberately understated. The reward for the curious.
    const d = this.L.devnull;
    this.add.rectangle(d.x, d.y, d.w, d.h, GREEN.bg, 1).setDepth(9);
    const lbl = text(this, d.x, d.y - d.h / 2 - 14, '/dev/null', { size: 11, color: COL.dark, origin: 0.5 });
    lbl.setAlpha(0.7);
    this.devnullRect = new Phaser.Geom.Rectangle(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);

    // 404 pits — loud and punishing (the contrast).
    this.pit404Rects = [];
    for (const p of this.L.pits404) {
      this.add.rectangle(p.x, p.y, p.w, p.h, GREEN.bg, 1).setDepth(9);
      const t = text(this, p.x, p.y - p.h / 2 - 16, p.label, { size: 16, color: COL.bright, origin: 0.5 });
      text(this, p.x, p.y - p.h / 2 + 2, 'NOT FOUND', { size: 9, color: COL.mid, origin: 0.5 });
      this.tweens.add({ targets: t, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      this.pit404Rects.push(new Phaser.Geom.Rectangle(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h));
    }
  }

  findPlatformUnder(x, y) {
    let best = null, bestDy = 220;
    for (const p of this.L.platforms) {
      const top = p.y - p.h / 2;
      const dy = top - y;
      if (dy >= -8 && dy < bestDy && x > p.x - p.w / 2 && x < p.x + p.w / 2) {
        best = p; bestDy = dy;
      }
    }
    return best;
  }

  spawnSlimes() {
    for (const z of this.L.slimeZones) {
      if (Math.random() > z.chance) continue;
      const plat = this.findPlatformUnder(z.x, z.y);
      const x = z.x + Phaser.Math.Between(-40, 40);
      const y = plat ? plat.y - plat.h / 2 - 18 : z.y;
      const patrol = plat
        ? { min: plat.x - plat.w / 2 + 18, max: plat.x + plat.w / 2 - 18 }
        : { min: x - 70, max: x + 70 };
      const sl = new LagSlime(this, Phaser.Math.Clamp(x, patrol.min, patrol.max), y, {
        gen: 0, maxGen: z.type === 'split' ? 2 : 1, patrol
      });
      this.slimes.add(sl);
    }
  }

  // ---------------- main loop ----------------

  update(time, dtMs) {
    if (this.finished) return;
    const p = this.player;

    // environment probes
    const onNet = this.netRects.some(r => Phaser.Geom.Rectangle.Contains(r, p.x, p.y));
    const inWater = Phaser.Geom.Rectangle.Contains(this.waterRect, p.x, p.y) && p.y > this.waterRect.y + 28;

    const c = this.cursors, k = this.keys;
    const input = {
      left: c.left.isDown || k.A.isDown,
      right: c.right.isDown || k.D.isDown,
      up: c.up.isDown || k.W.isDown,
      down: c.down.isDown || k.S.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(c.up) || Phaser.Input.Keyboard.JustDown(k.W) || Phaser.Input.Keyboard.JustDown(k.SPACE),
      attackPressed: Phaser.Input.Keyboard.JustDown(k.J) || Phaser.Input.Keyboard.JustDown(k.F)
    };

    p.control(input, { onNet, inWater }, time);

    if (input.attackPressed) this.doAttack(time);
    if (Phaser.Input.Keyboard.JustDown(k.E)) this.tryTalk(time);

    // slimes
    this.slimes.children.iterate(s => { if (s && s.update) s.update(); });

    // pickups & zones
    this.checkPackets();
    this.checkFloppies();
    this.checkZones(time);

    // death plane
    if (p.y > this.L.world.h - 8) this.respawnAt404(time);
    if (p.health <= 0) this.gameOver();

    this.pushHud(inWater);
  }

  doAttack(time) {
    const rect = this.player.tryAttack(time);
    if (!rect) return;
    // snapshot first — splitOrDie mutates the group mid-loop
    const hit = this.slimes.getChildren().filter(s => {
      if (!s || !s.body) return false;
      const sr = new Phaser.Geom.Rectangle(s.body.x, s.body.y, s.body.width, s.body.height);
      return Phaser.Geom.Intersects.RectangleToRectangle(rect, sr);
    });
    hit.forEach(s => s.splitOrDie(this.slimes));
  }

  touchSlime(slime) {
    if (this.finished) return;
    const t = this.time.now;
    if (this.player.hurt(1, t)) { /* knockback handled in player */ }
  }

  checkPackets() {
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pk = this.packets[i];
      if (Phaser.Math.Distance.Between(pk.x, pk.y, this.player.x, this.player.y) < 22) {
        this.collectPacket(pk.value, pk.x, pk.y);
        pk.spr.destroy();
        this.packets.splice(i, 1);
      }
    }
  }

  collectPacket(value, x, y) {
    this.coins += value; this.earned += value;
    sfx.packet();
    const t = text(this, x, y, `+${value}`, { size: 13, color: COL.glow, origin: 0.5 });
    this.tweens.add({ targets: t, y: y - 24, alpha: 0, duration: 500, onComplete: () => t.destroy() });
  }

  checkFloppies() {
    for (const f of this.floppies) {
      if (!f.active && Phaser.Math.Distance.Between(f.x, f.y, this.player.x, this.player.y) < 28) {
        f.active = true;
        this.respawn = { x: f.x, y: f.y - 30 };
        Save.save();
        sfx.save();
        f.spr.setTint(0xaaffaa);
        const t = text(this, f.x, f.y - 26, 'SAVED', { size: 12, color: COL.glow, origin: 0.5 });
        this.tweens.add({ targets: t, y: f.y - 48, alpha: 0, duration: 700, onComplete: () => t.destroy() });
      }
    }
  }

  checkZones(time) {
    const p = this.player;
    // /dev/null — reward for jumping in on purpose
    if (time > this.devnullLock && Phaser.Geom.Rectangle.Contains(this.devnullRect, p.x, p.y)) {
      this.enterVoid();
      return;
    }
    // 404 pits — punish
    for (const r of this.pit404Rects) {
      if (Phaser.Geom.Rectangle.Contains(r, p.x, p.y)) { this.respawnAt404(time); return; }
    }
    // exit
    if (Phaser.Geom.Rectangle.Contains(this.exitRect, p.x, p.y)) this.completeLevel();
  }

  respawnAt404(time) {
    if (this.finished) return;
    this.player.hurt(1, time);
    this.cameras.main.flash(160, 8, 30, 8);
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.respawn.x, this.respawn.y);
    this.flash('404 // NOT FOUND. respawning at last floppy.');
  }

  // ---------------- NPC dialogue / duels / void ----------------

  tryTalk(time) {
    if (time < this.dialogLock) return;
    let near = null, best = 60;
    for (const n of this.npcs) {
      const d = Phaser.Math.Distance.Between(n.spr.x, n.spr.y, this.player.x, this.player.y);
      if (d < best) { best = d; near = n; }
    }
    if (!near) return;
    if (!near.data.dialogue) { this.flash(near.data.note || 'It says nothing.'); return; }
    this.openDialog(near.data.dialogue);
  }

  openDialog(dialogueKey) {
    this.scene.pause();
    this.scene.launch('DialogScene', {
      dialogueKey,
      getCoins: () => this.coins,
      shopBought: () => this.shopBought,
      onBuy: (item) => this.applyUpgrade(item),
      onDuel: (fighterId) => { this.scene.stop('DialogScene'); this.launchDuel(fighterId); },
      onClose: () => { this.scene.resume(); this.dialogLock = this.time.now + 350; }
    });
    this.scene.bringToTop('DialogScene');
  }

  applyUpgrade(item) {
    if (this.coins < item.cost) return false;
    this.coins -= item.cost;
    this.shopBought = true;
    if (item.id === 'heart') { this.player.maxHealth += 1; this.player.health = this.player.maxHealth; }
    if (item.id === 'pointer') { this.player.attackPower += 1; }
    if (item.id === 'bandwidth') { this.player.bandwidth = PLAYER.bandwidthMax; this._bwBoost = true; }
    sfx.save();
    return true;
  }

  launchDuel(fighterId) {
    const cfg = getDuel(fighterId);
    this.scene.launch('DuelScene', {
      fighter: cfg,
      onWin: (reward) => this.onDuelWin(cfg, reward),
      onLose: () => this.onDuelLose(cfg)
    });
    this.scene.bringToTop('DuelScene');
  }

  onDuelWin(cfg, reward) {
    this.scene.resume();
    this.dialogLock = this.time.now + 400;
    this.coins += reward; this.earned += reward;
    this.flash(`${cfg.name} RAGEQUIT. +${reward} packets.`);
  }

  onDuelLose(cfg) {
    this.scene.resume();
    this.dialogLock = this.time.now + 400;
    if (cfg.tutorial) {
      this.flash('DISCONNECTED — but it was only sparring. no harm done.');
    } else {
      // direct damage (avoid poisoning the invuln timer with a future timestamp)
      this.player.health = Math.max(0, this.player.health - 1);
      this.player.lastHurt = this.time.now;
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.respawn.x, this.respawn.y);
      this.flash('DISCONNECTED. respawning at last floppy.');
    }
  }

  enterVoid() {
    this.devnullLock = this.time.now + 4000;
    this.scene.pause();
    this.scene.launch('VoidScene', {
      alreadyAmber: Save.isUnlocked('amberPalette'),
      onReturn: (bonus) => {
        Save.unlock('amberPalette');
        this.coins += bonus; this.earned += bonus;
        this.player.setPosition(980, 4250);
        this.player.setVelocity(0, 0);
        this.scene.resume();
        this.devnullLock = this.time.now + 1500;
        this.flash(`/dev/null gave back: +${bonus} packets & the AMBER palette (toggle in menu).`);
      }
    });
    this.scene.bringToTop('VoidScene');
  }

  // ---------------- end states ----------------

  completeLevel() {
    if (this.finished) return;
    this.finished = true;
    Save.awardLanyard('inter-net');
    Save.recordRun(this.earned);
    sfx.secret();
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    // overlay lives in screen space (scrollFactor 0)
    const cx = VIEW.W / 2, cy = VIEW.H / 2;
    panel(this, cx - 260, cy - 130, 520, 260).setScrollFactor(0).setDepth(100);
    const lines = [
      '*** LANYARD #1 ACQUIRED ***',
      '',
      '   inter-net // CLEARED',
      `   packets routed: ${this.earned}`,
      '',
      '   you are logged on. the conferences',
      '   await. (more levels unlock as you',
      '   earn their Lanyards.)',
      '',
      '   press ENTER to return to the map'
    ];
    this.add.text(cx, cy, lines.join('\n'), {
      fontFamily: FONT, fontSize: '15px', color: COL.glow, align: 'center', lineSpacing: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    this.input.keyboard.once('keydown-ENTER', () => this.quitToMenu());
    this.input.keyboard.once('keydown-SPACE', () => this.quitToMenu());
  }

  gameOver() {
    if (this.finished) return;
    this.finished = true;
    sfx.lose();
    const cx = VIEW.W / 2, cy = VIEW.H / 2;
    panel(this, cx - 220, cy - 80, 440, 160).setScrollFactor(0).setDepth(100);
    this.add.text(cx, cy, 'CONNECTION TERMINATED\n\nyour health flatlined.\n\npress ENTER to redial', {
      fontFamily: FONT, fontSize: '16px', color: COL.bright, align: 'center', lineSpacing: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart());
  }

  quitToMenu() {
    Save.recordRun(this.earned);
    this.scene.stop('UIScene');
    this.scene.start('MenuScene');
  }

  // ---------------- hud bridge ----------------

  currentLayer() {
    let name = '';
    for (const l of this.L.layers) if (this.player.y >= l.y - 60) name = l.name;
    return name;
  }

  pushHud(inWater = false) {
    this.registry.set('hud', {
      hp: this.player.health,
      maxhp: this.player.maxHealth,
      coins: this.coins,
      bandwidth: this.player.bandwidth,
      maxbw: PLAYER.bandwidthMax,
      underwater: inWater,
      layer: this.currentLayer()
    });
  }

  flash(msg) {
    this.registry.set('toast', { msg, t: this.time.now });
  }
}
