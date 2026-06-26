import Phaser from 'phaser';
import { VIEW, GREEN } from './config.js';
import * as Save from './save.js';
import * as Telemetry from './telemetry.js';
import CRTPipeline from './pipelines/CRTPipeline.js';

import PreloadScene from './scenes/PreloadScene.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import InterNetScene from './scenes/InterNetScene.js';
import OnTheSaunaScene from './scenes/OnTheSaunaScene.js';
import UIScene from './scenes/UIScene.js';
import DialogScene from './scenes/DialogScene.js';
import DuelScene from './scenes/DuelScene.js';
import VoidScene from './scenes/VoidScene.js';
import HelpScene from './scenes/HelpScene.js';
import PassportScene from './scenes/PassportScene.js';
import FormScene from './scenes/FormScene.js';

const save = Save.load();

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: GREEN.bg,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: VIEW.W,
    height: VIEW.H
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [PreloadScene, BootScene, MenuScene, InterNetScene, OnTheSaunaScene, UIScene, DialogScene, DuelScene, VoidScene, HelpScene, PassportScene, FormScene]
};

const game = new Phaser.Game(config);

// Seed shared render state read by the CRT shader every frame.
game.registry.set('amber', save.palette === 'amber' && save.unlocks.amberPalette);
game.registry.set('crt', save.settings.crt !== false);

// Register the CRT post-FX pipeline once WebGL is ready. Degrades to no-FX on
// the canvas fallback (or if registration throws).
game.events.once('ready', () => {
  try {
    if (game.renderer && game.renderer.pipelines) {
      game.renderer.pipelines.addPostPipeline('CRT', CRTPipeline);
      game.registry.set('crtAvailable', true);
    }
  } catch (e) {
    game.registry.set('crtAvailable', false);
    console.warn('CRT pipeline unavailable, running flat:', e);
  }
  const pre = document.getElementById('preboot');
  if (pre) pre.remove();
  Telemetry.flush();   // send any queued (non-PII) events/suggestions from past sessions
});

// Apply the CRT post-pipeline to a scene's main camera (call from create()).
export function applyCRT(scene) {
  try {
    if (scene.game.registry.get('crtAvailable')) {
      scene.cameras.main.setPostPipeline('CRT');
    }
  } catch (e) { /* flat render is fine */ }
}

// Back/forward buttons change the path; simplest correct behaviour is to
// re-boot so the router (in PreloadScene) re-reads the new path.
window.addEventListener('popstate', () => location.reload());

window.__LD = game; // handy for debugging in the console
