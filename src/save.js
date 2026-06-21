// localStorage persistence. Standalone browser project, so this is the
// expected store: Lanyards earned, unlock state, best run, palette toggle.

const KEY = 'lanyards_and_dragons_save_v1';

const DEFAULT = {
  lanyards: [],          // ids of conferences cleared, e.g. ['inter-net']
  unlocks: {
    amberPalette: false  // granted by the /dev/null secret
  },
  palette: 'green',      // current toggle: 'green' | 'amber'
  bestPackets: 0,        // best single-run packet haul
  settings: {
    crt: true
  }
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }

let cache = null;

export function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? Object.assign(clone(DEFAULT), JSON.parse(raw)) : clone(DEFAULT);
    // Re-merge nested defaults in case the schema grew.
    cache.unlocks = Object.assign(clone(DEFAULT.unlocks), cache.unlocks || {});
    cache.settings = Object.assign(clone(DEFAULT.settings), cache.settings || {});
  } catch (e) {
    cache = clone(DEFAULT);
  }
  return cache;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(load()));
  } catch (e) { /* private mode / quota — game still playable, just not saved */ }
}

export function hasLanyard(id) {
  return load().lanyards.includes(id);
}

export function awardLanyard(id) {
  const s = load();
  if (!s.lanyards.includes(id)) s.lanyards.push(id);
  save();
}

export function unlock(key) {
  load().unlocks[key] = true;
  save();
}

export function isUnlocked(key) {
  return !!load().unlocks[key];
}

export function setPalette(p) {
  load().palette = p;
  save();
}

export function recordRun(packets) {
  const s = load();
  if (packets > s.bestPackets) { s.bestPackets = packets; save(); }
}

export function resetSave() {
  cache = clone(DEFAULT);
  save();
}
