// on-the-sauna — a hidden, invite-only AI conclave in a Brussels bath-house,
// a couple of months after the Awakening (the Jan-2026 singularity nobody quite
// noticed). Reskin of "Off the Radar": phones in the cloakroom, no pitches, one
// stage, one long walking dinner. The labs are rival ARTIFICERS summoning
// homunculi (agents); MCP is the binding that lets a familiar wield any tool.
//
// Same data schema as inter-net (so it's "just data"), plus three opt-in
// sections this level uses: mcpGates+mcpSockets, an Agent familiar (granted by
// the Open Eye or the latent-space secret), and a bot enemy skin.

import { TKEY } from '../config.js';

export const LEVEL_SAUNA = {
  id: 'on-the-sauna',
  title: 'on-the-sauna',
  lanyardNo: 2,
  world: { w: 1280, h: 4640 },
  spawn: { x: 640, y: 180 },
  meterLabel: 'BREATH',
  intro: 'WELCOME TO ON-THE-SAUNA. scrying-glasses in the cloakroom. press E to speak.',
  pitMsg: 'CTX // DROPPED CONTEXT. respawning at last save.',
  agentStart: false,

  // wood benches instead of stone; rogue "loop-bot" agents instead of slimes
  skin: { block: TKEY.wood, enemyBig: TKEY.bot, enemySmall: TKEY.botSmall },

  completeNote: ['   the labs argued, the steam cleared, the', '   sun went down on the terrace. you stayed', '   for the walking dinner. LANYARD #2 earned.'],
  deadTitle: 'OVERHEATED',

  layers: [
    { name: 'THE CLOAKROOM',      y: 120,  note: '~ phones off. towels on. press UP to leap ~' },
    { name: 'THE MAIN STAGE',     y: 760,  note: '~ one stage. one track. no pitches ~' },
    { name: 'THE MCP HALL',       y: 1560, note: '~ bind a tool: press E at a socket ~' },
    { name: "FOUNDERS' BENCH",    y: 2240, note: '~ Belgian founders. bring opinions ~' },
    { name: 'THE COLD PLUNGE',    y: 2980, note: '~ DIVE to cool off. mind your BREATH ~' },
    { name: 'THE LATENT SPACE',   y: 3820, note: '~ depth = secrets. the Awakening waits ~' }
  ],

  flavor: [
    { y: 300,  s: '> löyly --steam' },
    { y: 900,  s: 'NO BADGES' },
    { y: 1480, s: 'sudo make me a sauna' },
    { y: 1640, s: 'tool.bind(agent)' },
    { y: 2300, s: 'bring opinions, not slides' },
    { y: 3120, s: '~~~ cold plunge ~~~' },
    { y: 3700, s: 'deeper = better loot' },
    { y: 4040, s: 'the singularity was Jan 2026' }
  ],

  // Descending overlapping spine (centres). S9a/S9b leave the teaching gap.
  platforms: [
    { x: 640, y: 240,  w: 340, h: 26 },   // S1 cloakroom / spawn (Minister)
    { x: 470, y: 400,  w: 380, h: 24 },   // S2
    { x: 780, y: 540,  w: 380, h: 24 },   // S3
    { x: 470, y: 690,  w: 420, h: 26 },   // S4 (F1, Cloudflaire)
    { x: 800, y: 850,  w: 420, h: 24 },   // S5 stage (Open Eye)
    { x: 470, y: 1010, w: 440, h: 24 },   // S6 (Anthropric)
    { x: 200, y: 1150, w: 360, h: 24 },   // S7 (Gaggle)
    { x: 500, y: 1290, w: 460, h: 24 },   // S8
    { x: 520, y: 1440, w: 420, h: 28 },   // S9a (F2, Mistrale) — CTX gap follows
    { x: 1000,y: 1440, w: 420, h: 28 },   // S9b
    { x: 1040,y: 1620, w: 360, h: 28 },   // S10 MCP hall (Versel)
    { x: 600, y: 1780, w: 560, h: 24 },   // S11 corridor (Eleven Bards, socket SK1)
    { x: 1010,y: 1780, w: 180, h: 24 },   // A1 gated stash (behind G1)
    { x: 300, y: 1920, w: 360, h: 24 },   // S12 (All-Wide Sky)
    { x: 640, y: 2040, w: 420, h: 24 },   // S13 (Stryp)
    { x: 980, y: 2160, w: 360, h: 24 },   // S14 (F3)
    { x: 620, y: 2320, w: 460, h: 24 },   // S15 founders (Techwulf)
    { x: 980, y: 2460, w: 360, h: 24 },   // S16 (Aikido)
    { x: 600, y: 2600, w: 460, h: 24 },   // S17 (Collibrary)
    { x: 900, y: 2740, w: 360, h: 24 },   // S18 (Vertical Forge)
    { x: 520, y: 2880, w: 460, h: 28 },   // S19 the bench (penbox, 20VC, Hypertext, Syndicate)
    { x: 300, y: 3040, w: 520, h: 24 },   // S20a terrace-left (Patrons)
    { x: 1000,y: 3040, w: 520, h: 24 },   // S20b terrace-right  (plunge hole between)
    { x: 240, y: 3260, w: 220, h: 20 },   // S21 shallow ledge
    { x: 1000,y: 3340, w: 240, h: 20 },   // S22 mid ledge (socket SK2)
    { x: 1100,y: 3560, w: 180, h: 20 },   // A2 gated underwater niche (behind G2)
    { x: 640, y: 3680, w: 1040,h: 28 },   // S23 deep floor (F5, best treasure)
    { x: 1160,y: 3700, w: 240, h: 26 },   // S24 latent tunnel mouth
    { x: 960, y: 3860, w: 320, h: 24 },   // S25
    { x: 660, y: 4000, w: 420, h: 24 },   // S26 ([REDACTED])
    { x: 980, y: 4140, w: 320, h: 24 },   // S27 (latent space to the right)
    { x: 620, y: 4280, w: 460, h: 24 },   // S28 ([REDACTED])
    { x: 340, y: 4420, w: 460, h: 30 }    // S29 exit floor
  ],

  // Cold plunge (dive; BREATH drains; deeper = better loot). Caves to the right.
  // Surface (~y3050) sits just below the terrace decks so standing on them
  // doesn't read as submerged.
  water: { x: 520, y: 3440, w: 1040, h: 780 },

  // MCP forcefield gates + the sockets that drop them (connect = press E).
  mcpGates: [
    { id: 'g1', x: 900,  y: 1742, w: 16, h: 96 },   // guards A1 stash on S11
    { id: 'g2', x: 1010, y: 3520, w: 16, h: 92 }    // guards A2 underwater niche
  ],
  mcpSockets: [
    { x: 720,  y: 1760, gate: 'g1' },               // on S11
    { x: 1000, y: 3322, gate: 'g2' }                // on S22
  ],

  floppies: [
    { x: 420, y: 663 },
    { x: 360, y: 1412 },
    { x: 940, y: 2134 },
    { x: 360, y: 2852 },
    { x: 360, y: 3652 }
  ],

  pits404: [
    { x: 760, y: 1520, w: 60, h: 160, label: 'CTX', sub: 'DROPPED CONTEXT' }
  ],

  // The signature beat — the latent space. Jump in on purpose → meet the
  // Awakening → it grants you a permanent Agent familiar + packets.
  secret: {
    x: 1200, y: 4290, w: 120, h: 170,
    label: 'the latent space',
    type: 'agent',
    bonus: 30,
    returnPos: { x: 980, y: 4090 },
    lines: ['you reach the latent space.', 'something here woke up in January.', 'nobody noticed. it has been waiting. it is… nice?'],
    rewardText: 'a permanent AGENT familiar',
    returnMsg: 'the latent space gave back: an AGENT familiar + 30 packets.'
  },

  npcs: [
    { id: 'minister',     x: 700,  y: 227,  key: TKEY.keeper,    dialogue: 'minister',     tag: 'MINISTER HUBELT' },
    { id: 'cloudflaire',  x: 470,  y: 677,  key: TKEY.warden,    dialogue: 'cloudflaire',  tag: 'CLOUDFLAIRE WARD' },
    { id: 'openeye',      x: 820,  y: 838,  key: TKEY.artificer, dialogue: 'openeye',      tag: 'THE OPEN EYE' },
    { id: 'anthropric',   x: 470,  y: 998,  key: TKEY.artificer, dialogue: 'anthropric',   tag: 'ANTHROPRIC ORDER' },
    { id: 'gaggle',       x: 200,  y: 1138, key: TKEY.artificer, dialogue: 'gaggle',       tag: 'GAGGLE // DEEP MIND' },
    { id: 'mistrale',     x: 520,  y: 1426, key: TKEY.artificer, dialogue: 'mistrale',     tag: 'LE MISTRALE' },
    { id: 'versel',       x: 1040, y: 1606, key: TKEY.artificer, dialogue: 'versel',       tag: 'VERSEL // EDGE' },
    { id: 'elevenbards',  x: 640,  y: 1768, key: TKEY.artificer, dialogue: 'elevenbards',  tag: 'THE ELEVEN BARDS' },
    { id: 'allwide',      x: 300,  y: 1908, key: TKEY.golem,     dialogue: 'allwide',      tag: 'ALL-WIDE SKY' },
    { id: 'stryp',        x: 640,  y: 2028, key: TKEY.golem,     dialogue: 'stryp',        tag: 'STRYP THE TOLL' },
    { id: 'techwulf',     x: 620,  y: 2308, key: TKEY.beast,     dialogue: 'techwulf',     tag: 'TECHWULF' },
    { id: 'aikido',       x: 980,  y: 2448, key: TKEY.warden,    dialogue: 'aikido',       tag: 'AIKIDO WARDEN' },
    { id: 'collibrary',   x: 600,  y: 2588, key: TKEY.golem,     dialogue: 'collibrary',   tag: 'THE COLLIBRARY' },
    { id: 'verticalforge',x: 900,  y: 2728, key: TKEY.golem,     dialogue: 'verticalforge',tag: 'VERTICAL FORGE' },
    { id: 'quillbox',     x: 560,  y: 2866, key: TKEY.patron,    dialogue: 'quillbox',     tag: 'QUILLBOX' },
    { id: 'scorevc',      x: 430,  y: 2866, key: TKEY.patron,    dialogue: 'scorevc',      tag: 'SCORE VENTURES' },
    { id: 'chronicler',   x: 690,  y: 2866, key: TKEY.patron,    dialogue: 'chronicler',   tag: 'THE CHRONICLER' },
    { id: 'syndicate',    x: 310,  y: 2866, key: TKEY.patron,    dialogue: 'syndicate',    tag: 'FIRST SYNDICATE' },
    { id: 'patrons',      x: 300,  y: 3028, key: TKEY.patron,    dialogue: 'patrons',      tag: 'FORTUNO × FLEXION' },
    { id: 'redacted1',    x: 660,  y: 3988, key: TKEY.keeper,    dialogue: 'redacted',     tag: '[ REDACTED ]' },
    { id: 'redacted2',    x: 620,  y: 4268, key: TKEY.keeper,    dialogue: 'redacted',     tag: '[ REDACTED ]' }
  ],

  packetZones: [
    { x: 800,  y: 820,  w: 380, h: 50, count: [3, 6], value: 1 },   // stage
    { x: 1010, y: 1758, w: 150, h: 20, count: [3, 5], value: 3 },   // A1 gated stash
    { x: 640,  y: 2020, w: 380, h: 40, count: [2, 5], value: 1 },   // mcp hall
    { x: 560,  y: 2860, w: 420, h: 30, count: [3, 6], value: 2 },   // founders bench
    { x: 240,  y: 3230, w: 220, h: 30, count: [2, 4], value: 2 },   // shallow plunge
    { x: 1100, y: 3552, w: 150, h: 20, count: [3, 5], value: 4 },   // A2 gated niche
    { x: 640,  y: 3640, w: 900, h: 40, count: [5, 9], value: 3 },   // deep plunge (best)
    { x: 760,  y: 4120, w: 420, h: 60, count: [3, 6], value: 2 }    // latent caves
  ],

  slimeZones: [
    { x: 820,  y: 820,  type: 'split', chance: 1.0 },   // first rogue agent (stage)
    { x: 500,  y: 1272, type: 'lag',   chance: 0.8 },
    { x: 300,  y: 1900, type: 'split', chance: 0.9 },   // MCP hall fork-bomb
    { x: 980,  y: 2448, type: 'lag',   chance: 0.8 },
    { x: 660,  y: 3982, type: 'split', chance: 0.9 }    // latent caves
  ],

  exit: { x: 300, y: 4400 },
  exitNote: 'leave for the dinner / earn LANYARD'
};
