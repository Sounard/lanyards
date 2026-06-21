import Phaser from 'phaser';
import { PHYS, PLAYER, TKEY } from '../config.js';
import { sfx } from '../audio/sfx.js';

// The player: a little knight with a Rusty Pointer. Walks, jumps, climbs nets,
// swims (with a depleting bandwidth meter), and swings a melee slash. World
// gravity is 0; the body carries its own gravity so we can flip between
// walking / climbing / swimming cleanly.

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, TKEY.player);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.body.setSize(16, 28).setOffset(4, 4);
    this.body.setGravityY(PHYS.gravity);
    this.setDepth(20);

    this.facing = 1;
    this.lastAttack = -9999;
    this.lastHurt = -9999;
    this.onNet = false;
    this.inWater = false;
    this.climbing = false;

    this.maxHealth = PLAYER.maxHealth;
    this.health = PLAYER.maxHealth;
    this.bandwidth = PLAYER.bandwidthMax;
    this.attackPower = 1;

    // held pointer weapon (purely cosmetic; follows the body)
    this.weapon = scene.add.image(x, y, TKEY.pointer).setDepth(21);
  }

  get grounded() {
    return this.body.blocked.down || this.body.touching.down;
  }

  control(input, env, time) {
    this.onNet = env.onNet;
    this.inWater = env.inWater;
    const speed = this.inWater ? PHYS.swimSpeed : PHYS.moveSpeed;

    // --- climbing nets ---
    if (this.onNet && (input.up || input.down)) {
      this.climbing = true;
    } else if (!this.onNet) {
      this.climbing = false;
    }

    if (this.climbing && this.onNet) {
      this.body.setAllowGravity(false);
      this.setVelocityY(input.up ? -PHYS.climbSpeed : input.down ? PHYS.climbSpeed : 0);
      this.setVelocityX(input.left ? -speed * 0.6 : input.right ? speed * 0.6 : 0);
    } else {
      this.body.setAllowGravity(true);
      this.body.setGravityY(this.inWater ? PHYS.swimGravity : PHYS.gravity);

      // horizontal
      if (input.left) { this.setVelocityX(-speed); this.facing = -1; }
      else if (input.right) { this.setVelocityX(speed); this.facing = 1; }
      else this.setVelocityX(this.inWater ? this.body.velocity.x * 0.85 : 0);

      // jump / swim-up
      if (this.inWater) {
        if (input.up) this.setVelocityY(-PHYS.swimSpeed);
        if (input.down) this.setVelocityY(PHYS.swimSpeed * 0.8);
        // clamp sink/rise
        this.setVelocityY(Phaser.Math.Clamp(this.body.velocity.y, -PHYS.swimSpeed, PHYS.swimSpeed));
      } else if (input.jumpPressed && this.grounded) {
        this.setVelocityY(-PHYS.jumpVel);
        sfx.jump();
      }
    }

    this.setFlipX(this.facing < 0);

    // bandwidth: depletes underwater, refills at surface/air
    if (this.inWater) {
      this.bandwidth = Math.max(0, this.bandwidth - 0.18);
      if (this.bandwidth <= 0 && time - this.lastHurt > PLAYER.invuln) this.hurt(1, time);
    } else {
      this.bandwidth = Math.min(PLAYER.bandwidthMax, this.bandwidth + 0.6);
    }

    // weapon follows
    this.weapon.setPosition(this.x + this.facing * 10, this.y + 2).setFlipX(this.facing < 0);

    // invuln flicker
    if (time - this.lastHurt < PLAYER.invuln) {
      this.setAlpha(Math.floor(time / 60) % 2 ? 0.35 : 1);
    } else {
      this.setAlpha(1);
    }
  }

  // Returns a hit rectangle if the swing fired (respecting cooldown), else null.
  tryAttack(time) {
    if (time - this.lastAttack < PLAYER.attackCooldown) return null;
    this.lastAttack = time;
    sfx.blip();

    const reach = 30;
    const slash = this.scene.add.image(this.x + this.facing * 22, this.y, TKEY.slash)
      .setDepth(22).setFlipX(this.facing < 0);
    this.scene.tweens.add({
      targets: slash, alpha: 0, scale: 1.3, duration: 160,
      onComplete: () => slash.destroy()
    });

    return new Phaser.Geom.Rectangle(
      this.facing < 0 ? this.x - reach - 6 : this.x + 6,
      this.y - 18, reach, 36
    );
  }

  hurt(amount, time) {
    if (time - this.lastHurt < PLAYER.invuln) return false;
    this.lastHurt = time;
    this.health = Math.max(0, this.health - amount);
    sfx.hurt();
    this.scene.cameras.main.shake(140, 0.008);
    this.setVelocity(this.facing * -120, -160);
    return true;
  }

  healFull() {
    this.health = this.maxHealth;
    this.bandwidth = PLAYER.bandwidthMax;
  }

  destroy(fromScene) {
    if (this.weapon) this.weapon.destroy();
    super.destroy(fromScene);
  }
}
