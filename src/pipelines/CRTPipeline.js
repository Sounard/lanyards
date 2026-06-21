// Green-phosphor CRT post-FX: luminance->tint remap (this is what makes the
// amber unlock a one-uniform swap), scanlines, barrel curvature, vignette,
// phosphor bloom and a faint flicker/noise. Taste over intensity — stays
// readable. Source art is green, so we treat the green channel as luminance.
//
// Degrades gracefully: if WebGL/pipeline registration fails, the game runs
// without it (see main.js try/catch).

import Phaser from 'phaser';
import { TINT } from '../config.js';

const frag = `
precision mediump float;
uniform sampler2D uMainSampler;
uniform vec2  uResolution;
uniform float uTime;
uniform vec3  uTint;
uniform float uCrt;        // 0 = off (flat), 1 = full CRT
varying vec2 outTexCoord;

// cheap hash noise
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }

void main() {
  vec2 uv = outTexCoord;

  // barrel curvature
  vec2 cc = uv - 0.5;
  float dist = dot(cc, cc);
  vec2 cuv = uv + cc * dist * 0.18 * uCrt;

  // off-screen after curve -> black border
  if (cuv.x < 0.0 || cuv.x > 1.0 || cuv.y < 0.0 || cuv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 src = texture2D(uMainSampler, cuv);

  // luminance from the green-dominant source, then remap to active tint
  float lum = max(src.g, max(src.r * 0.6, src.b * 0.4));

  // phosphor bloom: sample a small neighbourhood, add the bright bits back
  vec2 px = 1.0 / uResolution;
  float bloom = 0.0;
  bloom += texture2D(uMainSampler, cuv + vec2( px.x, 0.0)).g;
  bloom += texture2D(uMainSampler, cuv + vec2(-px.x, 0.0)).g;
  bloom += texture2D(uMainSampler, cuv + vec2(0.0,  px.y)).g;
  bloom += texture2D(uMainSampler, cuv + vec2(0.0, -px.y)).g;
  lum += bloom * 0.09 * uCrt;

  vec3 col = uTint * lum;

  // scanlines
  float scan = 1.0 - 0.18 * uCrt * (0.5 + 0.5 * sin(cuv.y * uResolution.y * 3.14159));
  col *= scan;

  // subtle aperture-grille (per-column tint)
  float grille = 1.0 - 0.06 * uCrt * (0.5 + 0.5 * sin(cuv.x * uResolution.x * 1.5708));
  col *= grille;

  // vignette
  float vig = smoothstep(0.85, 0.2, dist * 2.2);
  col *= mix(1.0, vig, 0.6 * uCrt);

  // faint flicker + noise
  float flick = 1.0 + 0.02 * uCrt * sin(uTime * 9.0);
  float noise = (hash(cuv * uResolution + uTime) - 0.5) * 0.05 * uCrt;
  col = col * flick + noise;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({ game, fragShader: frag });
    this._t = 0;
  }

  onPreRender() {
    this._t += 0.016;
    const reg = this.game.registry;
    const amber = reg.get('amber');
    const crtOn = reg.get('crt');
    const tint = amber ? TINT.amber : TINT.green;
    this.set1f('uTime', this._t);
    this.set3f('uTint', tint[0], tint[1], tint[2]);
    this.set1f('uCrt', crtOn === false ? 0.0 : 1.0);
    this.set2f('uResolution', this.renderer.width, this.renderer.height);
  }
}
