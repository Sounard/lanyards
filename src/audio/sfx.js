// Procedural audio via the Web Audio API (no asset files for v1). The headline
// act is the dial-up handshake screech for the cold open; everything else is
// short terminal blips. Created lazily on the first user gesture (autoplay).

let ctx = null;
let master = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(m) { muted = m; }
export function isMuted() { return muted; }

function tone(freq, t0, dur, type = 'square', vol = 0.2, glideTo = null) {
  const c = ac(); if (!c || muted) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.linearRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.02);
}

function noiseBurst(t0, dur, vol = 0.25, bandHz = 1800) {
  const c = ac(); if (!c || muted) return;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = bandHz; bp.Q.value = 0.7;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(t0); src.stop(t0 + dur);
}

// The iconic ~4.5s handshake. Returns total duration (s) so the boot scene can
// time the reveal. Roughly: dial tone -> DTMF dialing -> ring -> carrier screech.
export function playDialup() {
  const c = ac(); if (!c) return 0;
  const t = c.currentTime + 0.1;

  // dial tone (350 + 440 Hz)
  tone(350, t, 0.7, 'sine', 0.12);
  tone(440, t, 0.7, 'sine', 0.12);

  // DTMF-ish dialing
  let d = t + 0.9;
  const digits = [[697, 1209], [770, 1336], [852, 1477], [697, 1336], [941, 1209], [770, 1477], [852, 1209]];
  for (const [lo, hi] of digits) {
    tone(lo, d, 0.09, 'sine', 0.13);
    tone(hi, d, 0.09, 'sine', 0.13);
    d += 0.13;
  }

  // ring back
  tone(440, d + 0.1, 0.4, 'sine', 0.12);
  tone(480, d + 0.1, 0.4, 'sine', 0.12);

  // carrier handshake: alternating tones + bandpassed noise screeches
  let h = d + 0.7;
  tone(1200, h, 0.25, 'sine', 0.18);
  tone(2100, h + 0.25, 0.3, 'sine', 0.16);
  noiseBurst(h + 0.55, 0.5, 0.22, 1600);
  tone(1800, h + 0.55, 0.5, 'sawtooth', 0.08, 2400);
  noiseBurst(h + 1.05, 0.7, 0.26, 2200);
  tone(900, h + 1.05, 0.7, 'square', 0.06, 1500);
  noiseBurst(h + 1.8, 0.45, 0.28, 3000);
  tone(2400, h + 1.85, 0.35, 'sine', 0.14, 1100);

  const end = h + 2.4;
  return end - c.currentTime;
}

// --- short SFX ---
export const sfx = {
  blip()    { const c = ac(); if (!c) return; tone(880, c.currentTime, 0.05, 'square', 0.12); },
  jump()    { const c = ac(); if (!c) return; tone(420, c.currentTime, 0.12, 'square', 0.14, 760); },
  packet()  { const c = ac(); if (!c) return; tone(1200, c.currentTime, 0.06, 'square', 0.12); tone(1600, c.currentTime + 0.05, 0.06, 'square', 0.1); },
  hitSlime(){ const c = ac(); if (!c) return; noiseBurst(c.currentTime, 0.12, 0.18, 700); tone(220, c.currentTime, 0.1, 'sawtooth', 0.1, 90); },
  split()   { const c = ac(); if (!c) return; tone(300, c.currentTime, 0.12, 'square', 0.12, 600); tone(300, c.currentTime + 0.04, 0.12, 'square', 0.1, 520); },
  hurt()    { const c = ac(); if (!c) return; tone(200, c.currentTime, 0.22, 'sawtooth', 0.18, 70); },
  save()    { const c = ac(); if (!c) return; tone(700, c.currentTime, 0.08, 'sine', 0.14); tone(1050, c.currentTime + 0.08, 0.12, 'sine', 0.12); },
  dive()    { const c = ac(); if (!c) return; tone(500, c.currentTime, 0.4, 'sine', 0.12, 140); },
  win()     { const c = ac(); if (!c) return; [523, 659, 784, 1046].forEach((f, i) => tone(f, c.currentTime + i * 0.1, 0.18, 'square', 0.14)); },
  lose()    { const c = ac(); if (!c) return; [400, 320, 240, 160].forEach((f, i) => tone(f, c.currentTime + i * 0.12, 0.2, 'sawtooth', 0.14)); },
  secret()  { const c = ac(); if (!c) return; [880, 1175, 1568, 2093].forEach((f, i) => tone(f, c.currentTime + i * 0.08, 0.16, 'sine', 0.14)); },
  flame()   { const c = ac(); if (!c) return; noiseBurst(c.currentTime, 0.5, 0.2, 1200); tone(160, c.currentTime, 0.5, 'sawtooth', 0.12, 320); }
};
