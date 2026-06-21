// Branching NPC dialogue for inter-net. Each node has lines and 2-3 options.
// An option may: advance to another node (`to`), close (`end`), open the shop
// (`shop`), or drop into a Flame War duel (`duel`, naming a fighter config).
//
// Writing rule: SAFE options are self-aware/absurd (a chuckle, no fight). The
// ONE flame-bait option per provocative NPC is a real tribal holy-war take this
// 1990 crowd would actually throw hands over — marked `bait:true` so the UI can
// give it a hotter glow tell. Never punch down; the bait is always a holy-war.

export const DIALOGUE = {
  // ----- The Keeper / Sysop, atop the Signal Tower -----
  keeper: {
    name: 'THE KEEPER',
    start: 'tutorial',
    nodes: {
      tutorial: {
        lines: [
          'Welcome to the Signal Tower, traveller.',
          'To go online you must catch THE SIGNAL — hold still and let',
          'the modem sing. I already dialed you in. Hear that screech?',
          'That was a handshake. You are connected now.',
          '',
          'Move with the ARROWS. Leap with UP. Descend to the sea.'
        ],
        options: [
          { text: 'How do modems even work?', to: 'modem' },
          { text: 'Anything I should watch for out there?', to: 'warn' }
        ]
      },
      modem: {
        lines: [
          "Honestly? I don't get how modems work either.",
          'Two machines screaming at each other until they agree on a tune.',
          'Same as any good conversation.'
        ],
        options: [
          { text: 'Anything I should watch for?', to: 'warn' },
          { text: 'Thanks, Keeper.', end: true }
        ]
      },
      warn: {
        lines: [
          'Out here, words start fights. They call it a FLAME WAR.',
          'Say the wrong thing on the wire and someone logs on to settle it',
          'with fists. Let me show you — pick a fight with me. Safely.',
          "I won't really hurt you. Consider it a sparring lesson."
        ],
        options: [
          { text: '"BBS is dead. The Web is the future, old man."', bait: true, duel: 'keeper' },
          { text: 'Maybe later. Point me downhill.', end: true }
        ]
      }
    }
  },

  // ----- BBS Vendor, on the docks -----
  vendor: {
    name: 'BBS://VENDOR',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'You have reached SALTY SHORES BBS. 2400 baud. No carrier left behind.',
          'I trade in PACKETS. Spend them well — I only stock one good thing per run.'
        ],
        options: [
          { text: 'Show me the goods. [SHOP]', shop: true },
          { text: 'Gopher, Archie, the Web... what should I use?', to: 'protocols' },
          { text: '"AOL is the real internet."', bait: true, duel: 'vendor' }
        ]
      },
      protocols: {
        lines: [
          'Gopher, Archie, the Web... it is all the same to me.',
          'Menus, searches, pages. Pick whatever does not crash today.'
        ],
        options: [
          { text: 'Show me the goods. [SHOP]', shop: true },
          { text: 'Log off.', end: true }
        ]
      }
    }
  },

  // ----- Ambient NPCs (docks) — flavour, no fights -----
  fisher: {
    name: 'A FISHER',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Cast a net, catch a packet. Cast it twice, catch a cold.',
          'They say if you dive deep enough the treasure gets better.',
          'They also say the BANDWIDTH runs out down there. Both true.'
        ],
        options: [
          { text: 'How deep is too deep?', to: 'deep' },
          { text: 'Tight lines, friend.', end: true }
        ]
      },
      deep: {
        lines: [
          'Deep as your meter allows. Surface to refill it.',
          'And mind the pits marked 404 — fall in and you are NOT FOUND.',
          'But a pit marked /dev/null... that one, curiously, gives back.'
        ],
        options: [
          { text: 'Good to know.', end: true }
        ]
      }
    }
  }
};
