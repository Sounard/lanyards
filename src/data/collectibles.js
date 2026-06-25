// The collectibles shown on the Passport wall. `id` is what gets stored in
// save.collectibles; `icon` is a p5 drawing key (see p5assets.js), with a
// Phaser-texture fallback. Earned via gameplay events hooked in LevelScene, or
// the SUBMIT A CON / JOIN THE GUILD flows.

export const COLLECTIBLES = [
  { id: 'clear-inter-net',   name: 'inter-net cleared',  icon: 'lanyard', hint: 'beat the tutorial' },
  { id: 'clear-on-the-sauna',name: 'on-the-sauna cleared',icon: 'lanyard', hint: 'beat the AI conclave' },
  { id: 'amber',             name: 'amber phosphor',     icon: 'amber',   hint: 'a pit that gives back' },
  { id: 'agent',             name: 'an Agent familiar',  icon: 'agent',   hint: 'agents are baked in' },
  { id: 'secret',            name: 'secret room found',  icon: 'secret',  hint: 'depth = secrets' },
  { id: 'flamewar',          name: 'won a Flame War',    icon: 'flame',   hint: 'an argument became combat' },
  { id: 'contributor',       name: 'suggested a con',    icon: 'ribbon',  hint: 'SUBMIT A CON' },
  { id: 'guild',             name: 'joined the Guild',   icon: 'envelope',hint: 'JOIN THE GUILD' }
];

export function collectibleById(id) {
  return COLLECTIBLES.find(c => c.id === id);
}
