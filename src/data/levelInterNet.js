// inter-net — "a fishermen's port." Fixed layout (tutorial), but loot drops and
// enemy placement are randomized per run (roguelike-light). All coordinates are
// CENTRES. The descending spine of platforms overlaps horizontally so the player
// can always fall to the next one; the single real 404 gap (with a floppy right
// before it) is the teaching hazard.
//
// To add a future level: copy this shape, point a new scene at it. No engine
// changes — the scene reads platforms/nets/water/zones generically.

import { TKEY } from '../config.js';

export const LEVEL_INTERNET = {
  id: 'inter-net',
  title: 'inter-net',
  lanyardNo: 1,
  world: { w: 1280, h: 4900 },
  spawn: { x: 640, y: 180 },
  meterLabel: 'BANDWIDTH',
  pitMsg: '404 // NOT FOUND. respawning at last floppy.',

  // Guided tutorial — a sticky top banner that advances as the player actually
  // does each thing (move+jump -> talk -> collect a packet -> head for the exit).
  tutorial: [
    { msg: 'MOVE  ← →      JUMP  ↑   (or W / Space)', done: 'movejump' },
    { msg: 'The KEEPER is right beside you — press  E  to talk.', done: 'talk' },
    { msg: 'PACKETS are your currency — grab one (the blinking pickups).', done: 'packets', arg: 1 },
    { msg: 'DESCEND ↓  to the bottom and reach the EXIT for LANYARD #1.', done: 'descend', arg: 1700 }
  ],
  completeNote: ['   you are logged on. the conferences', '   await. (more levels unlock as you', '   earn their Lanyards.)'],

  // background ASCII flavour (no mechanics)
  flavor: [
    { y: 300,  s: 'C:\\> _' },
    { y: 920,  s: 'PRESS ANY KEY' },
    { y: 1560, s: 'NO CARRIER' },
    { y: 1700, s: 'MOSAIC v0.9 loading...' },
    { y: 2360, s: 'blink blink blink' },
    { y: 3180, s: '~~~ sea of bits ~~~' },
    { y: 3700, s: 'deeper = better loot' },
    { y: 4100, s: 'gopher://port/1/' }
  ],

  // Vertical layer bands — used for the descending flavour labels / parallax.
  layers: [
    { name: 'SIGNAL TOWER',     y: 120,  note: '~ dial in. press UP to leap. ~' },
    { name: 'CLIFF PATH',       y: 760,  note: '~ mind the 404. NOT FOUND. ~' },
    { name: 'THE DOCKS // BBS',  y: 1500, note: '~ SALTY SHORES BBS // 2400 baud ~' },
    { name: 'UNDER THE PIER',   y: 2240, note: '~ climb the rigging. press UP/DOWN ~' },
    { name: 'BELOW THE WATERLINE', y: 2980, note: '~ DIVE. watch your bandwidth ~' },
    { name: 'GOPHER TUNNELS',   y: 3900, note: '~ depth = secrets ~' }
  ],

  // Solid platforms {x,y,w,h} (centres).
  platforms: [
    { x: 640, y: 240,  w: 340, h: 26 },   // P1 spawn / Signal Tower top
    { x: 480, y: 400,  w: 380, h: 24 },   // P2
    { x: 780, y: 540,  w: 380, h: 24 },   // P3
    { x: 480, y: 690,  w: 420, h: 26 },   // P4 (F1)
    { x: 800, y: 850,  w: 420, h: 24 },   // P5 (slime)
    { x: 470, y: 1010, w: 440, h: 24 },   // P6
    { x: 200, y: 1150, w: 360, h: 24 },   // P7
    { x: 500, y: 1290, w: 460, h: 24 },   // P8
    { x: 430, y: 1440, w: 560, h: 28 },   // P9a dock approach (F2) — 404 gap follows (right edge 710)
    { x: 1020,y: 1440, w: 480, h: 28 },   // P9b (left edge 780) -> 70px teaching gap
    { x: 540, y: 1640, w: 940, h: 30 },   // P10 main dock (vendor, fisher)
    { x: 1080,y: 1800, w: 300, h: 24 },   // P11
    { x: 820, y: 1960, w: 360, h: 24 },   // P12
    { x: 540, y: 2110, w: 460, h: 24 },   // P13 (F3)
    { x: 820, y: 2300, w: 360, h: 24 },   // P14 under-pier top
    { x: 900, y: 2820, w: 320, h: 24 },   // P15 net bottom
    { x: 520, y: 2680, w: 260, h: 24 },   // P16 splitting-slime ledge (branch)
    { x: 600, y: 2920, w: 380, h: 24 },   // P18 (F4)
    { x: 300, y: 3060, w: 540, h: 24 },   // P19a water surface (left)
    { x: 1000,y: 3060, w: 540, h: 24 },   // P19b water surface (right) — dive hole between
    { x: 240, y: 3360, w: 220, h: 20 },   // P20 shallow ledge
    { x: 1020,y: 3460, w: 240, h: 20 },   // P21 mid ledge
    { x: 640, y: 3840, w: 1040,h: 28 },   // P22 deep floor (F5, best treasure)
    { x: 1160,y: 3860, w: 240, h: 26 },   // P23 tunnel mouth (gopher)
    { x: 960, y: 4020, w: 320, h: 24 },   // P24 cave
    { x: 680, y: 4160, w: 380, h: 24 },   // P25 cave
    { x: 980, y: 4300, w: 320, h: 24 },   // P26 cave (devnull to the right)
    { x: 650, y: 4440, w: 460, h: 24 },   // P28 cave
    { x: 340, y: 4580, w: 460, h: 30 }    // P29 exit floor
  ],

  // Climbable rigging / nets {x,y,w,h}.
  nets: [
    { x: 900, y: 2560, w: 60, h: 540 }    // N1 under-pier rigging (P14 -> P15)
  ],

  // Underwater zone (centre rect). Caves sit to the right of it (dry).
  water: { x: 520, y: 3480, w: 1040, h: 920 },

  // Save / respawn points.
  floppies: [
    { x: 420, y: 663 },    // F1 cliff lip
    { x: 200, y: 1412 },   // F2 before the 404 gap
    { x: 360, y: 2082 },   // F3 docks descent
    { x: 470, y: 2892 },   // F4 under pier
    { x: 360, y: 3812 }    // F5 deep air-pocket
  ],

  // 404 death-pits (punishing) — contrast with /dev/null.
  pits404: [
    { x: 745, y: 1520, w: 70, h: 160, label: '404' }   // sits exactly in the P9a/P9b gap
  ],

  // The signature beat: jump in ON PURPOSE → hidden void room → reward.
  secret: {
    x: 1200, y: 4450, w: 120, h: 170,
    label: '/dev/null',
    type: 'amber',
    bonus: 25,
    returnPos: { x: 980, y: 4250 },
    lines: ['you have reached /dev/null.', 'everything written here is discarded.', 'except, apparently, you.'],
    rewardText: 'the AMBER phosphor palette',
    returnMsg: '/dev/null gave back: +25 packets & the AMBER palette (toggle in menu).'
  },

  // NPCs {id, x, y, key, dialogue}.
  npcs: [
    { id: 'keeper', x: 700,  y: 226,  key: TKEY.keeper, dialogue: 'keeper' },
    { id: 'vendor', x: 430,  y: 1624, key: TKEY.vendor, dialogue: 'vendor' },
    { id: 'fisher', x: 880,  y: 1624, key: TKEY.npc,    dialogue: 'fisher' },
    { id: 'gopher', x: 1200, y: 3846, key: TKEY.gopher, dialogue: null, note: 'GOPHER // dug these tunnels' }
  ],

  // Randomized-per-run loot zones {x,y,w,h,count:[min,max],value}.
  packetZones: [
    { x: 800, y: 800,  w: 380, h: 50, count: [3, 6], value: 1 },   // cliff
    { x: 820, y: 2270, w: 300, h: 40, count: [2, 5], value: 1 },   // under pier
    { x: 240, y: 3330, w: 220, h: 30, count: [2, 4], value: 2 },   // shallow water
    { x: 640, y: 3800, w: 900, h: 40, count: [5, 9], value: 3 },   // DEEP (best)
    { x: 760, y: 4120, w: 420, h: 60, count: [3, 6], value: 2 }    // caves
  ],

  // Randomized-per-run enemy spawns {x,y,type, chance}.
  slimeZones: [
    { x: 800,  y: 800,  type: 'lag',   chance: 1.0 },
    { x: 1000, y: 980,  type: 'lag',   chance: 0.7 },
    { x: 520,  y: 2640, type: 'split', chance: 1.0 },
    { x: 680,  y: 4120, type: 'split', chance: 0.8 },
    { x: 540,  y: 1600, type: 'lag',   chance: 0.5 }
  ],

  // Level exit → award Lanyard #1.
  exit: { x: 300, y: 4536 }
};
