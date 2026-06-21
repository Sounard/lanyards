// Procedural, in-engine art. Everything is drawn with Graphics in the green
// palette and baked to a texture; the CRT pipeline remaps luminance to the
// active tint, so the amber unlock costs no texture rebuild.
//
// To swap in real sprite sheets later: load them under these same TKEY keys and
// delete the matching maker — gameplay references keys, never pixels.

import { GREEN, TKEY } from './config.js';

const D = GREEN.dark;
const M = GREEN.mid;
const B = GREEN.bright;
const G = GREEN.glow;

function makeTex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

// scatter a few pixel dots for that dithered phosphor crust
function dither(g, color, w, h, n, seed) {
  g.fillStyle(color, 1);
  let s = seed || 7;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const x = s % w;
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const y = s % h;
    g.fillRect(x, y, 1, 1);
  }
}

export function generateTextures(scene) {
  // --- terrain block ---
  makeTex(scene, TKEY.block, 32, 32, g => {
    g.fillStyle(D, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(M, 1); g.fillRect(0, 0, 32, 4);          // lit top edge
    g.fillStyle(B, 1); g.fillRect(0, 0, 32, 1);
    dither(g, M, 32, 32, 26, 11);
    g.lineStyle(1, GREEN.bg, 1); g.strokeRect(0, 0, 32, 32);
  });

  // --- cave block (rougher, darker) ---
  makeTex(scene, TKEY.cave, 32, 32, g => {
    g.fillStyle(GREEN.bg, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(D, 1); g.fillRect(0, 0, 32, 32);
    g.fillStyle(M, 1); g.fillRect(0, 0, 32, 2);
    dither(g, GREEN.bg, 32, 32, 40, 5);
    dither(g, M, 32, 32, 14, 23);
  });

  // --- net / rigging (mostly transparent crosshatch) ---
  makeTex(scene, TKEY.net, 32, 32, g => {
    g.lineStyle(2, M, 1);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(32, 32);
    g.moveTo(32, 0); g.lineTo(0, 32);
    g.moveTo(16, 0); g.lineTo(16, 32);
    g.strokePath();
    g.fillStyle(B, 1);
    g.fillRect(15, 0, 2, 2); g.fillRect(15, 30, 2, 2);
  });

  // --- water tile (translucent) ---
  makeTex(scene, TKEY.water, 32, 32, g => {
    g.fillStyle(M, 0.18); g.fillRect(0, 0, 32, 32);
    g.fillStyle(B, 0.28); g.fillRect(0, 0, 32, 2);
    dither(g, G, 32, 32, 10, 31);
  });

  // --- player: a little knight with a rusty pointer ---
  makeTex(scene, TKEY.player, 24, 32, g => {
    g.fillStyle(M, 1); g.fillRect(7, 12, 10, 14);        // body/tunic
    g.fillStyle(B, 1); g.fillRect(8, 4, 8, 8);           // head
    g.fillStyle(G, 1); g.fillRect(10, 6, 4, 2);          // visor glow
    g.fillStyle(D, 1); g.fillRect(7, 26, 4, 6); g.fillRect(13, 26, 4, 6); // legs
    g.fillStyle(B, 1); g.fillRect(16, 14, 7, 3);         // arm -> pointer
    g.fillStyle(G, 1); g.fillRect(22, 13, 2, 5);         // pointer tip (cursor)
  });

  // --- lag-slime (big) ---
  makeTex(scene, TKEY.slime, 30, 24, g => {
    g.fillStyle(D, 1); g.fillRect(2, 8, 26, 16);
    g.fillStyle(M, 1); g.fillRect(4, 4, 22, 18);
    g.fillStyle(B, 1); g.fillRect(6, 4, 18, 4);
    g.fillStyle(GREEN.bg, 1); g.fillRect(9, 12, 4, 4); g.fillRect(18, 12, 4, 4); // eyes
    g.fillStyle(G, 1); g.fillRect(10, 13, 2, 2); g.fillRect(19, 13, 2, 2);
    dither(g, B, 30, 24, 10, 3);
  });

  // --- split slime (small) ---
  makeTex(scene, TKEY.slimeSmall, 18, 14, g => {
    g.fillStyle(M, 1); g.fillRect(1, 3, 16, 11);
    g.fillStyle(B, 1); g.fillRect(2, 3, 14, 3);
    g.fillStyle(GREEN.bg, 1); g.fillRect(5, 7, 2, 2); g.fillRect(11, 7, 2, 2);
  });

  // --- packet (TCP/IP collectible) ---
  makeTex(scene, TKEY.packet, 16, 12, g => {
    g.fillStyle(D, 1); g.fillRect(0, 0, 16, 12);
    g.lineStyle(1, B, 1); g.strokeRect(0, 0, 16, 12);
    g.fillStyle(G, 1);
    g.fillRect(2, 3, 2, 2); g.fillRect(6, 3, 2, 2); g.fillRect(10, 3, 2, 2);
    g.fillRect(2, 7, 2, 2); g.fillRect(8, 7, 2, 2); g.fillRect(12, 7, 2, 2);
  });

  // --- floppy (save / respawn) ---
  makeTex(scene, TKEY.floppy, 22, 22, g => {
    g.fillStyle(M, 1); g.fillRect(0, 0, 22, 22);
    g.fillStyle(B, 1); g.fillRect(0, 0, 22, 2);
    g.fillStyle(D, 1); g.fillRect(4, 0, 11, 8);          // shutter
    g.fillStyle(GREEN.bg, 1); g.fillRect(9, 1, 3, 6);
    g.fillStyle(G, 1); g.fillRect(4, 12, 14, 8);         // label
    g.fillStyle(D, 1); g.fillRect(6, 14, 10, 1); g.fillRect(6, 16, 10, 1);
  });

  // --- gopher (the protocol, a neutral critter) ---
  makeTex(scene, TKEY.gopher, 26, 26, g => {
    g.fillStyle(D, 1); g.fillRect(5, 8, 16, 16);
    g.fillStyle(M, 1); g.fillRect(6, 4, 14, 14);
    g.fillStyle(B, 1); g.fillRect(4, 2, 5, 5); g.fillRect(17, 2, 5, 5); // ears
    g.fillStyle(GREEN.bg, 1); g.fillRect(9, 9, 3, 3); g.fillRect(15, 9, 3, 3);
    g.fillStyle(G, 1); g.fillRect(11, 13, 4, 3);         // buck teeth
  });

  // --- robed Keeper / Sysop ---
  makeTex(scene, TKEY.keeper, 26, 36, g => {
    g.fillStyle(D, 1); g.fillRect(4, 12, 18, 24);        // robe
    g.fillStyle(M, 1); g.fillRect(6, 14, 14, 20);
    g.fillStyle(B, 1); g.fillRect(8, 4, 10, 10);         // hooded head
    g.fillStyle(GREEN.bg, 1); g.fillRect(10, 8, 6, 4);   // shadowed face
    g.fillStyle(G, 1); g.fillRect(11, 9, 2, 2); g.fillRect(14, 9, 1, 2);
    g.fillStyle(G, 1); g.fillRect(2, 16, 3, 14);         // staff/antenna
    g.fillStyle(B, 1); g.fillRect(1, 12, 5, 4);
  });

  // --- BBS vendor terminal ---
  makeTex(scene, TKEY.vendor, 30, 34, g => {
    g.fillStyle(D, 1); g.fillRect(2, 6, 26, 24);         // CRT case
    g.fillStyle(GREEN.bg, 1); g.fillRect(5, 9, 20, 14);  // screen
    g.fillStyle(B, 1); g.fillRect(7, 11, 12, 1); g.fillRect(7, 14, 16, 1); g.fillRect(7, 17, 9, 1);
    g.fillStyle(G, 1); g.fillRect(7, 20, 3, 2);          // cursor
    g.fillStyle(M, 1); g.fillRect(2, 30, 26, 4);         // base
  });

  // --- generic NPC (fisher etc.) ---
  makeTex(scene, TKEY.npc, 22, 32, g => {
    g.fillStyle(M, 1); g.fillRect(5, 12, 12, 16);
    g.fillStyle(B, 1); g.fillRect(7, 4, 8, 8);
    g.fillStyle(D, 1); g.fillRect(4, 10, 14, 3);         // shoulders
    g.fillStyle(G, 1); g.fillRect(9, 6, 3, 2);
    g.fillStyle(D, 1); g.fillRect(6, 28, 4, 4); g.fillRect(12, 28, 4, 4);
  });

  // --- lanyard reward (badge on a strap) ---
  makeTex(scene, TKEY.lanyard, 22, 30, g => {
    g.fillStyle(M, 1); g.fillRect(4, 0, 3, 14); g.fillRect(15, 0, 3, 14); // strap
    g.fillStyle(D, 1); g.fillRect(3, 12, 16, 16);        // badge
    g.lineStyle(1, B, 1); g.strokeRect(3, 12, 16, 16);
    g.fillStyle(G, 1); g.fillRect(6, 16, 10, 2); g.fillRect(6, 20, 7, 2);
    g.fillStyle(B, 1); g.fillRect(6, 23, 10, 1);
  });

  // --- rusty pointer (held weapon + slash arc) ---
  makeTex(scene, TKEY.pointer, 22, 8, g => {
    g.fillStyle(M, 1); g.fillRect(0, 3, 14, 2);          // blade
    g.fillStyle(B, 1); g.fillRect(13, 1, 6, 6);          // arrow-cursor head
    g.fillStyle(G, 1); g.fillRect(18, 2, 3, 4);
  });

  makeTex(scene, TKEY.slash, 36, 36, g => {
    g.lineStyle(3, B, 0.9);
    g.beginPath(); g.arc(8, 18, 22, -0.9, 0.9); g.strokePath();
    g.lineStyle(2, G, 0.9);
    g.beginPath(); g.arc(8, 18, 17, -0.8, 0.8); g.strokePath();
  });

  // --- particle spark ---
  makeTex(scene, TKEY.spark, 6, 6, g => {
    g.fillStyle(G, 1); g.fillRect(2, 0, 2, 6); g.fillRect(0, 2, 6, 2);
  });
}
