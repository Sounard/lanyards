// Cute collectible icons drawn with p5.js (instance mode, offscreen) and handed
// to Phaser as canvas textures. Drawn in the green palette so the CRT pipeline
// still tints them. FULLY DEFENSIVE: if p5 throws for any reason, the caller
// falls back to Phaser-drawn textures — p5 never touches the core game loop.

import p5 from 'p5';

let inst = null;
function p5inst() {
  if (!inst) inst = new p5((s) => { s.setup = () => s.noCanvas(); });
  return inst;
}

// green palette as [r,g,b]
const D = [11, 47, 11], M = [31, 122, 31], B = [57, 255, 20], G = [170, 255, 170];

function make(scene, key, draw) {
  if (scene.textures.exists(key)) return;
  const s = p5inst();
  const S = 48;
  const g = s.createGraphics(S, S);
  g.clear();
  g.noStroke();
  draw(g, S);
  const canvas = g.canvas || g.elt;
  scene.textures.addCanvas(key, canvas);
}

// Returns true if the p5 textures were generated (so the Passport uses them).
export function generateP5Assets(scene) {
  let ok = false;
  try {
    p5inst();           // throws here => bail to fallbacks
    ok = true;
  } catch (e) {
    return false;
  }

  const safe = (key, draw) => { try { make(scene, key, draw); } catch (e) { ok = false; } };

  // lanyard — strap + rounded badge + clip + a little sparkle
  safe('p5_lanyard', (g, S) => {
    g.stroke(M[0], M[1], M[2]); g.strokeWeight(4); g.noFill();
    g.line(14, 2, 24, 20); g.line(34, 2, 24, 20);              // strap V
    g.noStroke(); g.fill(G[0], G[1], G[2]); g.rect(21, 16, 6, 6, 2); // clip
    g.fill(D[0], D[1], D[2]); g.rect(10, 20, 28, 24, 5);        // badge
    g.fill(M[0], M[1], M[2]); g.rect(13, 23, 22, 18, 3);
    g.fill(B[0], B[1], B[2]); g.rect(16, 27, 16, 3, 1); g.rect(16, 33, 11, 3, 1);
    g.fill(G[0], G[1], G[2]); g.circle(33, 24, 4);             // sparkle
  });

  // amber phosphor — a gem / droplet with a shine
  safe('p5_amber', (g, S) => {
    g.fill(M[0], M[1], M[2]);
    g.beginShape(); g.vertex(24, 6); g.vertex(40, 22); g.vertex(24, 44); g.vertex(8, 22); g.endShape(g.CLOSE);
    g.fill(B[0], B[1], B[2]);
    g.beginShape(); g.vertex(24, 12); g.vertex(34, 22); g.vertex(24, 38); g.vertex(14, 22); g.endShape(g.CLOSE);
    g.fill(G[0], G[1], G[2]); g.triangle(24, 14, 20, 22, 28, 22);
  });

  // agent — an orb / eye with a pulsing ring
  safe('p5_agent', (g, S) => {
    g.noFill(); g.stroke(M[0], M[1], M[2]); g.strokeWeight(2); g.circle(24, 24, 40);
    g.noStroke(); g.fill(D[0], D[1], D[2]); g.circle(24, 24, 28);
    g.fill(M[0], M[1], M[2]); g.circle(24, 24, 20);
    g.fill(B[0], B[1], B[2]); g.circle(24, 24, 9);
    g.fill(G[0], G[1], G[2]); g.circle(22, 22, 3);
  });

  // secret — a portal / keyhole
  safe('p5_secret', (g, S) => {
    g.fill(D[0], D[1], D[2]); g.circle(24, 24, 40);
    g.fill(M[0], M[1], M[2]); g.circle(24, 24, 30);
    g.fill(B[0], B[1], B[2]); g.circle(24, 20, 12);
    g.fill(B[0], B[1], B[2]); g.triangle(20, 24, 28, 24, 24, 38);
    g.fill(D[0], D[1], D[2]); g.circle(24, 20, 5);
  });

  // flame — a curvy flame
  safe('p5_flame', (g, S) => {
    g.fill(M[0], M[1], M[2]);
    g.beginShape(); g.curveVertex(24, 44); g.curveVertex(12, 30); g.curveVertex(20, 18);
    g.curveVertex(24, 4); g.curveVertex(34, 22); g.curveVertex(36, 32); g.curveVertex(24, 44); g.endShape(g.CLOSE);
    g.fill(B[0], B[1], B[2]);
    g.beginShape(); g.curveVertex(24, 42); g.curveVertex(18, 30); g.curveVertex(24, 18);
    g.curveVertex(28, 26); g.curveVertex(30, 34); g.curveVertex(24, 42); g.endShape(g.CLOSE);
    g.fill(G[0], G[1], G[2]); g.ellipse(24, 34, 6, 9);
  });

  // ribbon — award medal with two tails
  safe('p5_ribbon', (g, S) => {
    g.fill(M[0], M[1], M[2]); g.triangle(16, 30, 24, 30, 18, 46); g.triangle(32, 30, 24, 30, 30, 46);
    g.fill(D[0], D[1], D[2]); g.circle(24, 20, 28);
    g.fill(B[0], B[1], B[2]); g.circle(24, 20, 18);
    g.fill(G[0], G[1], G[2]); g.circle(24, 20, 7);
  });

  // envelope — a letter
  safe('p5_envelope', (g, S) => {
    g.fill(M[0], M[1], M[2]); g.rect(8, 14, 32, 22, 3);
    g.fill(D[0], D[1], D[2]); g.triangle(8, 16, 40, 16, 24, 30);
    g.stroke(G[0], G[1], G[2]); g.strokeWeight(2); g.noFill();
    g.line(8, 16, 24, 30); g.line(40, 16, 24, 30);
  });

  return ok;
}
