// The world-map roster. inter-net is the only playable entry; everything else
// is a stub shown [LOCKED] in level-select. Adding a real level later =
// add a scene + flip `scene`/`playable` here. No refactor.
//
// Keep this in sync with CONFERENCES.md (the design doc has the full culture key).

export const CONFERENCES = [
  { id: 'inter-net',   name: 'inter-net',              real: '(tutorial)',        feel: "1990 fishermen's port; first time online", scene: 'InterNetScene', playable: true },
  { id: 'on-the-sauna',name: 'on-the-sauna',           real: 'Off the Radar (Brussels)', feel: 'hidden AI conclave in a bath-house; post-singularity 2026; labs as artificers, agents as homunculi', scene: 'OnTheSaunaScene', playable: true, requires: 'inter-net' },
  { id: 'webb-summit', name: 'Webb Summit',            real: 'Web Summit',        feel: 'spider-web metropolis of frantic web-weavers', playable: false },
  { id: 'interstolar', name: 'Interstolar',            real: 'Intersolar',        feel: 'earnest solar-druids; bright, hopeful, utopian', playable: false },
  { id: 'foss-fae',    name: 'Foss-Fae',               real: 'FOSDEM',            feel: 'Free Folk & hearth-daemons; chaotic-good gift economy', playable: false },
  { id: 'chaos-coven', name: 'Chaos Coven',            real: 'CCC',               feel: 'anarchic spell-hackers; anti-tyranny', playable: false },
  { id: 'cube-con',    name: 'Cube Con',               real: 'KubeCon',           feel: 'earth-golems herding cube-golems by unread runes (YAML)', playable: false },
  { id: 'py-con',      name: 'Py Con',                 real: 'PyCon',             feel: 'gentle serpent-sages; wholesome teachers', playable: false },
  { id: 'deft-con',    name: 'Deft Con',               real: 'DEF CON',           feel: "thieves' guild; lockpicks, sigil-badges, trust no one", playable: false },
  { id: 'iridescent',  name: 'Iridescent Conclave',    real: 'Lesbians Who Tech', feel: 'Prism Court; joyous true-self glamour, found-family', playable: false },
  { id: 'masquerade',  name: 'The Masquerade',         real: 'Gamescom / Comic-Con', feel: 'Changeling faire; everyone is someone else for a day', playable: false },
  { id: 'dreamforge',  name: 'Dreamforge',             real: 'Dreamforce',        feel: 'Hollow Bazaar crown jewel; cult mascot-golem upsell', playable: false },
  { id: 'guild-dc',    name: 'G.D.C.',                 real: 'GDC',               feel: 'Guild of Dungeon Crafters; weary makers, war stories', playable: false },
  { id: 'da-boss',     name: 'Da-Boss',               real: 'Davos / WEF',       feel: 'archmages & kings deciding the realm; final boss', playable: false },
  { id: 'black-hat',   name: 'Black Hat',              real: 'Black Hat',         feel: 'sinister-but-professional dark-mage cabal', playable: false },
  { id: 'sx-southwild',name: 'South by Southwild',     real: 'SXSW',              feel: 'frontier jamboree of bards, tinkers & players', playable: false },
  { id: 're-enchant',  name: 'Re-Enchant',             real: 're:Invent (AWS)',   feel: 'artificers unveiling enchantments nobody asked for', playable: false },
  { id: 'mwc',         name: 'Mobile World Conjurers',  real: 'MWC',               feel: 'portal-conjurers & far-speakers; grand connection magic', playable: false }
];

export function getConference(id) {
  return CONFERENCES.find(c => c.id === id);
}
