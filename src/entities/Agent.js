import Phaser from 'phaser';
import { TKEY } from '../config.js';

// An Agent familiar — "agents are baked in." A little homunculus orb that trails
// the player and vacuums up nearby packets (the actual pickup is done in the
// level's checkPackets, which checks proximity to this.x/this.y). Cosmetic AI.
export default class Agent {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x; this.y = y;
    this.spr = scene.add.image(x, y, TKEY.agent).setDepth(19);
    this.ring = scene.add.image(x, y, TKEY.agent).setDepth(18).setAlpha(0.25).setScale(1.8);
    scene.tweens.add({ targets: this.ring, scale: 2.4, alpha: 0, duration: 1100, repeat: -1 });
    scene.tweens.add({ targets: this.spr, angle: 360, duration: 4000, repeat: -1 });
  }

  // smooth trailing follow, hovering above-behind the player
  follow(player, dtMs) {
    const tx = player.x - player.facing * 26;
    const ty = player.y - 34 + Math.sin(this.scene.time.now / 300) * 4;
    const k = Math.min(1, dtMs / 1000 * 6);
    this.x += (tx - this.x) * k;
    this.y += (ty - this.y) * k;
    this.spr.setPosition(this.x, this.y);
    this.ring.setPosition(this.x, this.y);
  }

  destroy() {
    if (this.spr) this.spr.destroy();
    if (this.ring) this.ring.destroy();
  }
}
