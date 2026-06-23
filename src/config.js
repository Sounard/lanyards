// Global constants. Tuning lives here so levels stay declarative.

export const VIEW = { W: 960, H: 540 };

// Green phosphor, ~5 shades. Textures are drawn in these greens; the CRT
// pipeline remaps luminance to a tint, so the amber alt-palette is a single
// uniform swap rather than a texture rebuild.
export const GREEN = {
  bg:    0x020a02,
  dark:  0x0b2f0b,
  mid:   0x1f7a1f,
  bright:0x39ff14,
  glow:  0xaaffaa
};

// Amber alt-palette (hidden /dev/null unlock): same brightness, shifted hue.
export const AMBER = {
  bg:    0x0a0602,
  dark:  0x2f1d0b,
  mid:   0x7a4f1f,
  bright:0xffb414,
  glow:  0xffe0aa
};

// Tint colours fed to the CRT shader (vec3). Source art is green, so the
// shader takes the green channel as luminance and multiplies by this.
export const TINT = {
  green: [0.18, 1.0, 0.12],
  amber: [1.0, 0.66, 0.12]
};

export const PHYS = {
  gravity: 1100,
  moveSpeed: 220,
  jumpVel: 470,
  climbSpeed: 160,
  swimSpeed: 150,
  swimGravity: 260
};

export const PLAYER = {
  maxHealth: 4,
  bandwidthMax: 100,
  attackCooldown: 280,
  invuln: 800
};

export const TKEY = {
  block: 'tile_block',
  cave: 'tile_cave',
  net: 'tile_net',
  water: 'tile_water',
  player: 'spr_player',
  slime: 'spr_slime',
  slimeSmall: 'spr_slime_small',
  packet: 'spr_packet',
  floppy: 'spr_floppy',
  gopher: 'spr_gopher',
  keeper: 'spr_keeper',
  vendor: 'spr_vendor',
  npc: 'spr_npc',
  lanyard: 'spr_lanyard',
  pointer: 'spr_pointer',
  slash: 'spr_slash',
  spark: 'spr_spark',
  fighter: 'spr_fighter',

  // on-the-sauna additions
  wood: 'tile_wood',
  gate: 'tex_gate',
  socket: 'tex_socket',
  agent: 'spr_agent',
  bot: 'spr_bot',
  botSmall: 'spr_bot_small',
  artificer: 'spr_artificer',
  golem: 'spr_golem',
  warden: 'spr_warden',
  patron: 'spr_patron',
  beast: 'spr_beast'
};
