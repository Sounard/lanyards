import Phaser from 'phaser';
import { PHYS, TKEY } from '../config.js';
import { sfx } from '../audio/sfx.js';

// Lag-slime: latency made flesh + a fork bomb. When you hit it, it SPLITS in
// two (until it runs out of generations), each half smaller and faster.
// Patrols a fixed range so it never wanders off its platform.

export default class LagSlime extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, opts = {}) {
    const gen = opts.gen || 0;
    const maxGen = opts.maxGen != null ? opts.maxGen : 1;
    const big = gen === 0;
    const skin = opts.skin || { big: TKEY.slime, small: TKEY.slimeSmall };
    super(scene, x, y, big ? skin.big : skin.small);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.gen = gen;
    this.maxGen = maxGen;
    this.skin = skin;
    this.body.setGravityY(PHYS.gravity);
    this.body.setSize(this.width - 4, this.height - 2);
    this.setDepth(15);

    const sp = 40 + gen * 28 + Phaser.Math.Between(0, 20);
    this.speed = sp;
    this.dir = opts.dir || (Phaser.Math.Between(0, 1) ? 1 : -1);
    this.patrol = opts.patrol || { min: x - 80, max: x + 80 };
    this.setVelocityX(this.speed * this.dir);

    // tiny idle bob via scale wobble
    scene.tweens.add({
      targets: this, scaleY: 0.86, duration: 320, yoyo: true, repeat: -1, ease: 'Sine.inOut'
    });
  }

  update() {
    if (!this.body) return;
    // bounce within patrol range or off walls
    if (this.x <= this.patrol.min || this.body.blocked.left) { this.dir = 1; }
    else if (this.x >= this.patrol.max || this.body.blocked.right) { this.dir = -1; }
    this.setVelocityX(this.speed * this.dir);
    this.setFlipX(this.dir < 0);
  }

  // Returns an array of newly spawned child slimes (possibly empty) on death.
  splitOrDie(group) {
    sfx.hitSlime();
    const kids = [];
    if (this.gen < this.maxGen) {
      sfx.split();
      for (const d of [-1, 1]) {
        const kid = new LagSlime(this.scene, this.x + d * 10, this.y - 6, {
          gen: this.gen + 1, maxGen: this.maxGen, dir: d,
          patrol: this.patrol, skin: this.skin
        });
        kid.setVelocityY(-160);
        group.add(kid);
        kids.push(kid);
      }
    } else {
      // death pop
      this.popFx();
    }
    this.destroy();
    return kids;
  }

  popFx() {
    const e = this.scene.add.particles(this.x, this.y, TKEY.spark, {
      speed: { min: 40, max: 120 }, lifespan: 300, quantity: 6,
      scale: { start: 1, end: 0 }, emitting: false
    });
    e.explode(6);
    this.scene.time.delayedCall(320, () => e.destroy());
  }
}
