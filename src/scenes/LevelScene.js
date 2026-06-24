import Phaser from 'phaser';
import { VIEW, GREEN, TKEY, PLAYER } from '../config.js';
import { text, panel, COL, FONT } from '../ui.js';
import { applyCRT } from '../main.js';
import { sfx } from '../audio/sfx.js';
import * as Save from '../save.js';
import Player from '../entities/Player.js';
import LagSlime from '../entities/LagSlime.js';
import Agent from '../entities/Agent.js';
import { getDuel } from '../data/duels.js';

// Data-driven base level. Each concrete level is a thin subclass that returns a
// level-data object from levelData(); the world is built entirely from that data
// so "add a level = add data + a 3-line subclass". Optional data sections light
// up extra mechanics: water/dive, climbable nets, 404 pits, a /dev/null-style
// secret room, MCP sockets→gates, an Agent familiar, and enemy skins.

export default class LevelScene extends Phaser.Scene {
  // subclasses override these two
  levelData() { throw new Error('levelData() not implemented'); }

  create() {
    this.L = this.levelData();
    const L = this.L;
    this.skin = Object.assign({ block: TKEY.block, enemyBig: TKEY.slime, enemySmall: TKEY.slimeSmall }, L.skin || {});

    this.finished = false;
    this.coins = 0;
    this.earned = 0;
    this.shopBought = false;
    this.dialogLock = 0;
    this.secretLock = 0;
    this.agent = null;

    const W = L.world.w, H = L.world.h;
    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.setBackgroundColor(GREEN.bg);
    applyCRT(this);

    this.buildBackground(W, H);
    this.buildSolids();
    this.buildNets();
    this.buildWater();
    this.buildGates();
    this.buildSockets();
    this.buildFloppies();
    this.buildPackets();
    this.buildNPCs();
    this.buildExit();

    this.player = new Player(this, L.spawn.x, L.spawn.y);
    this.respawn = { x: L.spawn.x, y: L.spawn.y };
    if (L.agentStart) this.grantAgent(false);

    this.slimes = this.physics.add.group();
    this.spawnSlimes();

    this.physics.add.collider(this.player, this.solids);
    this.physics.add.collider(this.slimes, this.solids);
    if (this.gateGroup) this.physics.add.collider(this.player, this.gateGroup);
    this.physics.add.overlap(this.player, this.slimes, (pl, sl) => this.touchSlime(sl), null, this);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(180, 120);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,J,F,E,SPACE,ESC,ENTER');
    // guard with isActive() so these don't fire while the Help overlay is up
    this.input.keyboard.on('keydown-ESC', () => { if (this.scene.isActive()) this.quitToMenu(); });
    this.input.keyboard.on('keydown', e => {
      if ((e.key === '?' || e.key === 'h' || e.key === 'H') && this.scene.isActive() && !this.finished) this.openHelp();
    });

    this.scene.launch('UIScene');
    this.scene.bringToTop('UIScene');
    this.pushHud();

    // optional guided tutorial (inter-net only)
    this.tut = null;
    if (L.tutorial) {
      this.tut = { step: 0, moved: false, jumped: false, talked: false, packets: 0, doneAt: this.time.now + 300 };
      this.tutBanner = text(this, VIEW.W / 2, 92, '', { size: 15, color: COL.glow, origin: 0.5 });
      this.tutBanner.setScrollFactor(0).setDepth(60).setAlign('center');
      this.showTutStep(0);
    } else if (L.intro) {
      this.flash(L.intro);
    }
  }

  // ---------------- world construction ----------------

  buildBackground(W, H) {
    this.L.layers.forEach(l => {
      text(this, 24, l.y, `// ${l.name}`, { size: 15, color: COL.mid }).setAlpha(0.6);
      if (l.note) text(this, 24, l.y + 20, l.note, { size: 12, color: COL.dark }).setAlpha(0.7);
    });
    (this.L.flavor || []).forEach(f => {
      text(this, W - 240 + (f.y % 60), f.y, f.s, { size: 12, color: COL.dark }).setAlpha(0.55);
    });
    if (this.L.bgCursor !== false) {
      const cur = text(this, W / 2, 60, '█', { size: 22, color: COL.dark, origin: 0.5 });
      this.tweens.add({ targets: cur, alpha: 0, duration: 600, yoyo: true, repeat: -1 });
    }
  }

  buildSolids() {
    this.solids = this.physics.add.staticGroup();
    for (const p of this.L.platforms) {
      this.add.tileSprite(p.x, p.y, p.w, p.h, this.skin.block).setDepth(5);
      const body = this.solids.create(p.x, p.y, this.skin.block).setVisible(false);
      body.displayWidth = p.w; body.displayHeight = p.h;
      body.refreshBody();
    }
    const H = this.L.world.h, W = this.L.world.w;
    [[-12, H], [W + 12, H]].forEach(([x]) => {
      const wall = this.solids.create(x, H / 2, this.skin.block).setVisible(false);
      wall.displayWidth = 24; wall.displayHeight = H; wall.refreshBody();
    });
  }

  buildNets() {
    this.netRects = [];
    for (const n of (this.L.nets || [])) {
      this.add.tileSprite(n.x, n.y, n.w, n.h, TKEY.net).setDepth(6).setAlpha(0.9);
      this.netRects.push(new Phaser.Geom.Rectangle(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h));
    }
  }

  buildWater() {
    this.waterRect = null;
    const w = this.L.water;
    if (!w) return;
    this.waterRect = new Phaser.Geom.Rectangle(w.x - w.w / 2, w.y - w.h / 2, w.w, w.h);
    this.add.tileSprite(w.x, w.y, w.w, w.h, TKEY.water).setDepth(8).setAlpha(0.5)
      .setBlendMode(Phaser.BlendModes.ADD);
    const g = this.add.graphics().setDepth(8);
    g.lineStyle(2, GREEN.bright, 0.6);
    g.lineBetween(this.waterRect.x, this.waterRect.y, this.waterRect.right, this.waterRect.y);
  }

  // MCP gates: removable forcefield barriers, dissolved by connecting a socket.
  buildGates() {
    this.gates = [];
    this.gateGroup = null;
    if (!this.L.mcpGates || !this.L.mcpGates.length) return;
    this.gateGroup = this.physics.add.staticGroup();
    for (const g of this.L.mcpGates) {
      const vis = this.add.tileSprite(g.x, g.y, g.w, g.h, TKEY.gate).setDepth(7).setAlpha(0.8)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: vis, alpha: 0.45, duration: 500, yoyo: true, repeat: -1 });
      const body = this.gateGroup.create(g.x, g.y, TKEY.gate).setVisible(false);
      body.displayWidth = g.w; body.displayHeight = g.h; body.refreshBody();
      this.gates.push({ id: g.id, vis, body });
    }
  }

  buildSockets() {
    this.sockets = [];
    for (const s of (this.L.mcpSockets || [])) {
      const spr = this.add.image(s.x, s.y, TKEY.socket).setDepth(11);
      this.tweens.add({ targets: spr, alpha: 0.6, duration: 700, yoyo: true, repeat: -1 });
      const lbl = text(this, s.x, s.y - 22, 'MCP //', { size: 10, color: COL.mid, origin: 0.5 });
      this.sockets.push({ x: s.x, y: s.y, gate: s.gate, spr, lbl, connected: false });
    }
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
      const tag = text(this, n.x, n.y - spr.height - 6, n.tag || n.note || `[ ${n.id.toUpperCase()} ]`,
        { size: 11, color: COL.mid, origin: 0.5 });
      tag.setAlpha(0.85);
      this.npcs.push({ data: n, spr });
    }
  }

  buildExit() {
    const e = this.L.exit;
    panel(this, e.x - 46, e.y - 70, 92, 78, { alpha: 0.5 });
    const lan = this.add.image(e.x, e.y - 30, TKEY.lanyard).setDepth(12);
    this.tweens.add({ targets: lan, y: e.y - 38, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    text(this, e.x, e.y + 6, 'EXIT', { size: 14, color: COL.glow, origin: 0.5 });
    text(this, e.x, e.y + 22, this.L.exitNote || 'log off / earn LANYARD', { size: 10, color: COL.mid, origin: 0.5 });
    this.exitRect = new Phaser.Geom.Rectangle(e.x - 40, e.y - 60, 80, 80);

    // secret room — the reward for the curious (jump in on purpose)
    this.secretRect = null;
    const d = this.L.secret;
    if (d) {
      this.add.rectangle(d.x, d.y, d.w, d.h, GREEN.bg, 1).setDepth(9);
      const lbl = text(this, d.x, d.y - d.h / 2 - 14, d.label || '???', { size: 11, color: COL.dark, origin: 0.5 });
      lbl.setAlpha(0.7);
      this.secretRect = new Phaser.Geom.Rectangle(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);
    }

    // punishing pits (the contrast to the secret)
    this.pit404Rects = [];
    for (const p of (this.L.pits404 || [])) {
      this.add.rectangle(p.x, p.y, p.w, p.h, GREEN.bg, 1).setDepth(9);
      const t = text(this, p.x, p.y - p.h / 2 - 16, p.label, { size: 16, color: COL.bright, origin: 0.5 });
      text(this, p.x, p.y - p.h / 2 + 2, p.sub || 'NOT FOUND', { size: 9, color: COL.mid, origin: 0.5 });
      this.tweens.add({ targets: t, alpha: 0.3, duration: 400, yoyo: true, repeat: -1 });
      this.pit404Rects.push(new Phaser.Geom.Rectangle(p.x - p.w / 2, p.y - p.h / 2, p.w, p.h));
    }
  }

  findPlatformUnder(x, y) {
    let best = null, bestDy = 220;
    for (const p of this.L.platforms) {
      const top = p.y - p.h / 2;
      const dy = top - y;
      if (dy >= -8 && dy < bestDy && x > p.x - p.w / 2 && x < p.x + p.w / 2) { best = p; bestDy = dy; }
    }
    return best;
  }

  spawnSlimes() {
    for (const z of (this.L.slimeZones || [])) {
      if (Math.random() > z.chance) continue;
      const plat = this.findPlatformUnder(z.x, z.y);
      const x = z.x + Phaser.Math.Between(-40, 40);
      const y = plat ? plat.y - plat.h / 2 - 18 : z.y;
      const patrol = plat
        ? { min: plat.x - plat.w / 2 + 18, max: plat.x + plat.w / 2 - 18 }
        : { min: x - 70, max: x + 70 };
      const sl = new LagSlime(this, Phaser.Math.Clamp(x, patrol.min, patrol.max), y, {
        gen: 0, maxGen: z.type === 'split' ? 2 : 1, patrol,
        skin: { big: this.skin.enemyBig, small: this.skin.enemySmall }
      });
      this.slimes.add(sl);
    }
  }

  // ---------------- main loop ----------------

  update(time, dtMs) {
    if (this.finished) return;
    const p = this.player;

    const onNet = this.netRects.some(r => Phaser.Geom.Rectangle.Contains(r, p.x, p.y));
    const inWater = !!this.waterRect &&
      Phaser.Geom.Rectangle.Contains(this.waterRect, p.x, p.y) && p.y > this.waterRect.y + 28;

    const c = this.cursors, k = this.keys;
    const input = {
      left: c.left.isDown || k.A.isDown,
      right: c.right.isDown || k.D.isDown,
      up: c.up.isDown || k.W.isDown,
      down: c.down.isDown || k.S.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(c.up) || Phaser.Input.Keyboard.JustDown(k.W) || Phaser.Input.Keyboard.JustDown(k.SPACE),
      attackPressed: Phaser.Input.Keyboard.JustDown(k.J) || Phaser.Input.Keyboard.JustDown(k.F)
    };

    const wasGrounded = p.grounded;
    p.control(input, { onNet, inWater }, time);
    if (this.agent) this.agent.follow(p, dtMs);
    if (this.tut) this.updateTutorial(input, wasGrounded);

    if (input.attackPressed) this.doAttack(time);
    if (Phaser.Input.Keyboard.JustDown(k.E)) this.tryInteract(time);

    this.slimes.children.iterate(s => { if (s && s.update) s.update(); });

    this.checkPackets();
    this.checkFloppies();
    this.checkZones(time);

    if (p.y > this.L.world.h - 8) this.respawnAtSave(time, this.L.pitMsg || '404 // NOT FOUND. respawning.');
    if (p.health <= 0) this.gameOver();

    this.pushHud(inWater);
  }

  doAttack(time) {
    const rect = this.player.tryAttack(time);
    if (!rect) return;
    const hit = this.slimes.getChildren().filter(s => {
      if (!s || !s.body) return false;
      const sr = new Phaser.Geom.Rectangle(s.body.x, s.body.y, s.body.width, s.body.height);
      return Phaser.Geom.Intersects.RectangleToRectangle(rect, sr);
    });
    hit.forEach(s => s.splitOrDie(this.slimes));
  }

  touchSlime() {
    if (this.finished) return;
    this.player.hurt(1, this.time.now);
  }

  checkPackets() {
    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pk = this.packets[i];
      const byPlayer = Phaser.Math.Distance.Between(pk.x, pk.y, this.player.x, this.player.y) < 22;
      const byAgent = this.agent && Phaser.Math.Distance.Between(pk.x, pk.y, this.agent.x, this.agent.y) < 58;
      if (byPlayer || byAgent) {
        this.collectPacket(pk.value, pk.x, pk.y);
        pk.spr.destroy();
        this.packets.splice(i, 1);
      }
    }
  }

  collectPacket(value, x, y) {
    this.coins += value; this.earned += value;
    if (this.tut) this.tut.packets++;
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
    if (this.secretRect && time > this.secretLock && Phaser.Geom.Rectangle.Contains(this.secretRect, p.x, p.y)) {
      this.enterSecret(); return;
    }
    for (const r of this.pit404Rects) {
      if (Phaser.Geom.Rectangle.Contains(r, p.x, p.y)) { this.respawnAtSave(time, this.L.pitMsg || '404 // NOT FOUND.'); return; }
    }
    if (Phaser.Geom.Rectangle.Contains(this.exitRect, p.x, p.y)) this.completeLevel();
  }

  respawnAtSave(time, msg) {
    if (this.finished) return;
    this.player.hurt(1, time);
    this.cameras.main.flash(160, 8, 30, 8);
    this.player.setVelocity(0, 0);
    this.player.setPosition(this.respawn.x, this.respawn.y);
    this.flash(msg);
  }

  // ---------------- interaction: NPCs, sockets ----------------

  tryInteract(time) {
    if (time < this.dialogLock) return;
    let nearNpc = null, bestN = 62;
    for (const n of this.npcs) {
      const d = Phaser.Math.Distance.Between(n.spr.x, n.spr.y, this.player.x, this.player.y);
      if (d < bestN) { bestN = d; nearNpc = n; }
    }
    let nearSock = null, bestS = 64;
    for (const s of this.sockets) {
      if (s.connected) continue;
      const d = Phaser.Math.Distance.Between(s.x, s.y, this.player.x, this.player.y);
      if (d < bestS) { bestS = d; nearSock = s; }
    }

    if (nearNpc && (!nearSock || bestN <= bestS)) {
      if (!nearNpc.data.dialogue) { this.flash(nearNpc.data.note || 'It says nothing.'); return; }
      this.openDialog(nearNpc.data.dialogue);
    } else if (nearSock) {
      this.connectSocket(nearSock);
    }
  }

  connectSocket(s) {
    s.connected = true;
    s.spr.setTint(0xaaffaa);
    s.lbl.setText('CONNECTED').setColor(COL.glow);
    sfx.save();
    const gate = this.gates.find(g => g.id === s.gate);
    if (gate) {
      if (gate.body) gate.body.body.enable = false;
      this.tweens.add({ targets: gate.vis, alpha: 0, scaleX: 0.2, duration: 400, onComplete: () => gate.vis.destroy() });
    }
    this.flash('MCP // tool bound. the forcefield drops.');
  }

  grantAgent(announce = true) {
    if (this.agent) return;
    this.agent = new Agent(this, this.player.x, this.player.y - 40);
    if (announce) this.flash('an AGENT joins you. it fetches packets nearby.');
  }

  openDialog(dialogueKey) {
    if (this.tut) this.tut.talked = true;
    this.scene.pause();
    this.scene.launch('DialogScene', {
      dialogueKey,
      getCoins: () => this.coins,
      shopBought: () => this.shopBought,
      onBuy: (item) => this.applyUpgrade(item),
      onGrant: (what) => this.applyGrant(what),
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
    if (item.id === 'bandwidth') { this.player.bandwidth = PLAYER.bandwidthMax; }
    sfx.save();
    return true;
  }

  applyGrant(what) {
    if (what === 'agent') this.grantAgent(true);
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
      this.player.health = Math.max(0, this.player.health - 1);
      this.player.lastHurt = this.time.now;
      this.player.setVelocity(0, 0);
      this.player.setPosition(this.respawn.x, this.respawn.y);
      this.flash('DISCONNECTED. respawning at last save.');
    }
  }

  enterSecret() {
    const d = this.L.secret;
    this.secretLock = this.time.now + 4000;
    this.scene.pause();
    this.scene.launch('VoidScene', {
      lines: d.lines,
      rewardText: d.rewardText,
      bonus: d.bonus || 25,
      alreadyHave: d.type === 'amber' ? Save.isUnlocked('amberPalette') : false,
      onReturn: (bonus) => {
        if (d.type === 'amber') Save.unlock('amberPalette');
        if (d.type === 'agent') this.grantAgent(false);
        this.coins += bonus; this.earned += bonus;
        if (d.returnPos) { this.player.setPosition(d.returnPos.x, d.returnPos.y); this.player.setVelocity(0, 0); }
        this.scene.resume();
        this.secretLock = this.time.now + 1500;
        this.flash(d.returnMsg || `the secret gave back: +${bonus} packets.`);
      }
    });
    this.scene.bringToTop('VoidScene');
  }

  // ---------------- end states ----------------

  completeLevel() {
    if (this.finished) return;
    this.finished = true;
    Save.awardLanyard(this.L.id);
    Save.recordRun(this.earned);
    sfx.secret();
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    const cx = VIEW.W / 2, cy = VIEW.H / 2;
    panel(this, cx - 260, cy - 140, 520, 280).setScrollFactor(0).setDepth(100);
    const note = this.L.completeNote || ['   you are logged on. more conferences', '   await as you earn their Lanyards.'];
    const lines = [
      `*** LANYARD #${this.L.lanyardNo} ACQUIRED ***`, '',
      `   ${this.L.title} // CLEARED`,
      `   packets routed: ${this.earned}`, '',
      ...note, '',
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
    this.add.text(cx, cy, (this.L.deadTitle || 'CONNECTION TERMINATED') + '\n\nyour health flatlined.\n\npress ENTER to retry', {
      fontFamily: FONT, fontSize: '16px', color: COL.bright, align: 'center', lineSpacing: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.input.keyboard.once('keydown-ENTER', () => this.scene.restart());
  }

  openHelp() {
    this.scene.pause();
    this.scene.launch('HelpScene', { from: this.scene.key });
    this.scene.bringToTop('HelpScene');
  }

  // ---------------- guided tutorial ----------------

  showTutStep(i) {
    const s = this.L.tutorial[i];
    if (!s || !this.tutBanner) return;
    this.tutBanner.setText('» ' + s.msg).setColor(COL.glow).setAlpha(1);
  }

  updateTutorial(input, wasGrounded) {
    const t = this.tut;
    if (input.left || input.right) t.moved = true;
    if (input.jumpPressed && wasGrounded) t.jumped = true;

    const s = this.L.tutorial[t.step];
    if (!s || this.time.now < t.doneAt) return;

    let done = false;
    switch (s.done) {
      case 'movejump': done = t.moved && t.jumped; break;
      case 'talk':     done = t.talked; break;
      case 'packets':  done = t.packets >= (s.arg || 1); break;
      case 'descend':  done = this.player.y > (s.arg || 1700); break;
    }
    if (done) this.advanceTut();
  }

  advanceTut() {
    const t = this.tut;
    t.step++;
    t.doneAt = this.time.now + 600;
    if (t.step < this.L.tutorial.length) {
      sfx.save();
      this.tutBanner.setText('» ok').setColor(COL.glow);
      this.time.delayedCall(500, () => { if (this.tut) this.showTutStep(this.tut.step); });
    } else {
      sfx.secret();
      this.tutBanner.setText('» tutorial complete — descend and earn your Lanyard').setAlpha(1);
      this.time.delayedCall(2600, () => {
        if (this.tutBanner) this.tweens.add({ targets: this.tutBanner, alpha: 0, duration: 700 });
      });
      this.tut = null;
    }
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
      meterLabel: this.L.meterLabel || 'BANDWIDTH',
      underwater: inWater,
      hasAgent: !!this.agent,
      layer: this.currentLayer()
    });
  }

  flash(msg) {
    this.registry.set('toast', { msg, t: this.time.now });
  }
}
