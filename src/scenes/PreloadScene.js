import Phaser from 'phaser';
import { generateTextures } from '../textures.js';
import { currentSlug, levelForSlug } from '../router.js';
import * as Save from '../save.js';

// No external assets in v1 — bake all procedural textures, then route:
//  - no slug (/)            -> the dial-up cold open, then the menu
//  - valid level (/<slug>)  -> straight into that level (no gatekeeping in V1)
//  - unknown/mistyped slug  -> the level-select menu
export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  create() {
    generateTextures(this);

    const slug = currentSlug();
    if (!slug) { this.scene.start('BootScene'); return; }

    const lvl = levelForSlug(slug);
    if (lvl) {
      Save.markVisited(lvl.id);
      this.scene.start(lvl.scene, { levelId: lvl.id });
    } else {
      this.scene.start('MenuScene', { badRoute: slug });
    }
  }
}
