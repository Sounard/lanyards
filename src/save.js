// localStorage persistence. Standalone browser project, so this is the
// expected store: Lanyards earned, unlock state, best run, palette toggle.

const KEY = 'lanyards_and_dragons_save_v1';

const DEFAULT = {
  lanyards: [],          // ids of conferences cleared, e.g. ['inter-net']
  visited: [],           // ids of levels entered (by menu or deep link)
  completed: [],         // ids of levels reached-the-exit (may differ from lanyards later)
  collectibles: [],      // ids of Passport collectibles earned (see data/collectibles.js)
  clientId: '',          // random anonymous id for telemetry (no PII)
  contact: null,         // { email, ts } if the player joined the Guild
  unlocks: {
    amberPalette: false  // granted by the /dev/null secret
  },
  palette: 'green',      // current toggle: 'green' | 'amber'
  bestPackets: 0,        // best single-run packet haul
  settings: {
    crt: true,
    telemetry: true      // anonymous, cookieless; toggle in the Passport
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

export function markVisited(id) {
  const s = load();
  if (!s.visited.includes(id)) { s.visited.push(id); save(); }
}

export function isVisited(id) {
  return load().visited.includes(id);
}

export function markCompleted(id) {
  const s = load();
  if (!s.completed.includes(id)) { s.completed.push(id); save(); }
}

export function isCompleted(id) {
  return load().completed.includes(id);
}

export function addCollectible(id) {
  const s = load();
  if (!s.collectibles.includes(id)) { s.collectibles.push(id); save(); return true; }
  return false;
}

export function hasCollectible(id) {
  return load().collectibles.includes(id);
}

// stable anonymous client id (no PII) for telemetry
export function clientId() {
  const s = load();
  if (!s.clientId) {
    s.clientId = (self.crypto && self.crypto.randomUUID)
      ? self.crypto.randomUUID()
      : 'c-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    save();
  }
  return s.clientId;
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
