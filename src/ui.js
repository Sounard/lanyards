// Terminal-styled UI helpers shared across scenes. Everything is drawn bright
// green; the CRT pipeline handles glow/scanlines/amber. Keep text monospace.

export const FONT = '"Courier New", "Lucida Console", monospace';

// Keys that toggle Help. Several chars so it works whatever the layout produces
// for that physical key (QWERTY '?' '/', AZERTY ',' etc.) plus 'h'. ESC closes.
export const HELP_KEYS = ['?', '/', ',', 'h', 'H'];
export function isHelpKey(e) { return HELP_KEYS.includes(e.key); }
export function isHelpOrClose(e) { return e.key === 'Escape' || HELP_KEYS.includes(e.key); }

export const COL = {
  bg:     '#020a02',
  dark:   '#0b2f0b',
  mid:    '#1f7a1f',
  bright: '#39ff14',
  glow:   '#aaffaa'
};

export function text(scene, x, y, str, opts = {}) {
  const t = scene.add.text(x, y, str, {
    fontFamily: FONT,
    fontSize: (opts.size || 16) + 'px',
    color: opts.color || COL.bright,
    align: opts.align || 'left',
    lineSpacing: opts.lineSpacing != null ? opts.lineSpacing : 4,
    wordWrap: opts.wrap ? { width: opts.wrap } : undefined
  });
  if (opts.origin != null) t.setOrigin(opts.origin);
  if (opts.originX != null || opts.originY != null) t.setOrigin(opts.originX || 0, opts.originY || 0);
  return t;
}

// A bordered terminal panel (returns the Graphics so the caller can place it).
export function panel(scene, x, y, w, h, opts = {}) {
  const g = scene.add.graphics();
  const fill = opts.fill != null ? opts.fill : 0x020a02;
  const border = opts.border != null ? opts.border : 0x39ff14;
  g.fillStyle(fill, opts.alpha != null ? opts.alpha : 0.92);
  g.fillRect(x, y, w, h);
  g.lineStyle(2, border, 1);
  g.strokeRect(x, y, w, h);
  // corner ticks for that BBS frame feel
  g.lineStyle(2, 0xaaffaa, 1);
  const c = 8;
  g.beginPath();
  g.moveTo(x, y + c); g.lineTo(x, y); g.lineTo(x + c, y);
  g.moveTo(x + w - c, y); g.lineTo(x + w, y); g.lineTo(x + w, y + c);
  g.moveTo(x, y + h - c); g.lineTo(x, y + h); g.lineTo(x + c, y + h);
  g.moveTo(x + w - c, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w, y + h - c);
  g.strokePath();
  return g;
}

// hp as ████░░ ; len defaults to max
export function bar(value, max, full = '█', empty = '░') {
  let s = '';
  for (let i = 0; i < max; i++) s += i < value ? full : empty;
  return s;
}

// Typewriter onto an existing Text object. Returns a small handle with skip().
export function typewriter(scene, textObj, full, speed = 18, onDone) {
  textObj.setText('');
  if (!full || full.length === 0) {
    if (onDone) onDone();
    return { done: () => true, skip: () => { if (onDone) onDone(); } };
  }
  let i = 0;
  const ev = scene.time.addEvent({
    delay: speed,
    repeat: full.length - 1,
    callback: () => {
      i++;
      textObj.setText(full.slice(0, i));
      if (i >= full.length && onDone) onDone();
    }
  });
  return {
    done: () => i >= full.length,
    skip: () => { ev.remove(); textObj.setText(full); i = full.length; if (onDone) onDone(); }
  };
}
