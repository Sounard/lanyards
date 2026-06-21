import Phaser from 'phaser';
import { generateTextures } from '../textures.js';

// No external assets in v1 — bake all procedural textures, then cold-open.
export default class PreloadScene extends Phaser.Scene {
  constructor() { super('PreloadScene'); }

  create() {
    generateTextures(this);
    this.scene.start('BootScene');
  }
}
