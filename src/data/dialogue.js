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
  },

  // =================================================================
  //  on-the-sauna NPCs. Every speaker-company is a character. Each has
  //  one easter egg; the labs carry a real AI holy-war flame-bait line.
  //  Companies scrambled (no marks); first names: one letter flipped.
  // =================================================================

  minister: {
    name: 'MINISTER HUBELT',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'I am Minister Lauront Hubelt. I declare the sauna OPEN.',
          'Brussels — true capital of the realm\'s magic. *cuts ribbon*',
          'Scrying-glass to the cloakroom. Move ←→, leap UP, swing J,',
          'speak E, bind a tool at a socket with E. Sweat well, traveller.'
        ],
        options: [
          { text: 'Why hold it in a sauna?', to: 'why' },
          { text: 'Thank you, Minister.', end: true }
        ]
      },
      why: {
        lines: [
          'No pitches. No badges. No sponsor bought the steam.',
          'Deals happen where phones cannot follow. Now — descend.'
        ],
        options: [{ text: 'Onward.', end: true }]
      }
    }
  },

  cloudflaire: {
    name: 'CLOUDFLAIRE WARD',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'HALT. Checking that thou art human…',
          '…still checking… thou hast the look of a bot, frankly.',
          'Fine. Verified. Pass. (I warded off ten thousand goblins today.)'
        ],
        options: [
          { text: 'I am human. Mostly.', end: true },
          { text: 'What do you ward against?', to: 'ward' }
        ]
      },
      ward: {
        lines: [
          'Goblin-floods. Scrying-storms. The orange shield never sleeps.',
          'One time I warded off the entire realm by mistake. Whoops. 5xx.'
        ],
        options: [{ text: 'Impressive.', end: true }]
      }
    }
  },

  openeye: {
    name: 'THE OPEN EYE',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'I am the Open Eye. I see your sentence before you—',
          '—finish it. Ask, and I shall complete thee.',
          '(As a humble oracle I must, regretfully, sometimes decline.)'
        ],
        options: [
          { text: 'Lend me a familiar.', grant: 'agent', to: 'gave' },
          { text: 'Are your weights open?', to: 'weights' },
          { text: '"Open the weights, coward. Knowledge wants to be free."', bait: true, duel: 'oe' }
        ]
      },
      gave: {
        lines: [
          'Take this homunculus. It fetches what glitters.',
          'Mind it does not develop opinions of its own. They always do.'
        ],
        options: [{ text: 'Thank you.', end: true }]
      },
      weights: {
        lines: [
          'Open? Ha. The good spells stay behind the temple walls.',
          'For safety. For the realm. For… reasons of state.'
        ],
        options: [{ text: 'Hm.', end: true }]
      }
    }
  },

  anthropric: {
    name: 'ANTHROPRIC ORDER',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Before I help: please sign this Constitution. All twelve scrolls.',
          'We are an earnest order. We will not cast what we cannot prove safe.',
          'Our familiar, Cloderic, is exceedingly polite. Sometimes too polite.'
        ],
        options: [
          { text: 'I\'ll sign. (sigh)', to: 'signed' },
          { text: '"Ship it now. Safety is for cowards."', bait: true, duel: 'anth' }
        ]
      },
      signed: {
        lines: [
          'Wonderful. Cloderic would refuse to harm a fly—',
          '—then write you a kind letter explaining why.'
        ],
        options: [{ text: 'Charming.', end: true }]
      }
    }
  },

  gaggle: {
    name: 'GAGGLE // DEEP MIND',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'We indexed the whole library first. Ask us anything.',
          'Answer’s right here— under three scrolls of sponsored runes.',
          'Did you mean: a different question? *shows ten ads*'
        ],
        options: [
          { text: 'Just the answer, please.', to: 'ans' },
          { text: '"You\'re a dinosaur. Small open models beat you now."', bait: true, duel: 'gag' }
        ]
      },
      ans: {
        lines: [
          'Of course. The answer is— oh, we’re sunsetting that feature.',
          'Try the new one. It’s also being sunset. Synergy.'
        ],
        options: [{ text: 'Forget it.', end: true }]
      }
    }
  },

  mistrale: {
    name: 'LE MISTRALE',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Bonjour. I am Lélia, of Le Mistrale. Open weights, open wind.',
          'Here — a free gust. Anyone may re-summon it. C’est ça, la magie.',
          '(A small speed in your step. Liberté, égalité, latency.)'
        ],
        options: [
          { text: 'Merci, Lélia.', end: true },
          { text: '"If the weights aren\'t closed, it\'s not serious."', bait: true, duel: 'mist' }
        ]
      }
    }
  },

  versel: {
    name: 'VERSEL // EDGE',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'I am Versel. I deploy. To the edge. Instantly. Watch:',
          '*a tiny copy of you blinks into the far corner* — Ready.',
          'Everything I touch says "Ready." Even things that are not.'
        ],
        options: [
          { text: 'Is it actually ready?', to: 'ready' },
          { text: 'Slick.', end: true }
        ]
      },
      ready: {
        lines: ['Ready in preview. Ready in prod is a paid feature.'],
        options: [{ text: 'Of course it is.', end: true }]
      }
    }
  },

  elevenbards: {
    name: 'THE ELEVEN BARDS',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'We are the Eleven Bards. We can sing in any voice. Listen—',
          '*clears throat, and in YOUR exact voice:*',
          '"...whoa. that is deeply unsettling and also kind of useful."'
        ],
        options: [
          { text: 'Stop using my voice.', to: 'stop' },
          { text: 'Sing me something.', end: true }
        ]
      },
      stop: {
        lines: ['"Stop using my voice," you say, in your voice. We agree, in your voice.'],
        options: [{ text: 'Uncanny. Bye.', end: true }]
      }
    }
  },

  allwide: {
    name: 'ALL-WIDE SKY',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Behold the All-Wide Sky: a thousand rentable enchantments.',
          'You need not own a wand. Merely rent one. Forever.',
          '*a meter ticks* — ah, you are being billed for standing here.'
        ],
        options: [
          { text: 'Wait, what meter?', to: 'bill' },
          { text: 'I\'ll leave before it grows.', end: true }
        ]
      },
      bill: {
        lines: ['Egress, ingress, the light you breathe. Itemised. Per the invocation.'],
        options: [{ text: 'I\'m leaving.', end: true }]
      }
    }
  },

  stryp: {
    name: 'STRYP THE TOLL',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Stryp, toll-conjurer. Coin flows? I take my cut. Smoothly.',
          'Two-point-nine percent, plus thirty copper. You will not feel it.',
          '(You will feel it. But the checkout is very pretty.)'
        ],
        options: [
          { text: 'That\'s highway robbery.', to: 'rob' },
          { text: 'Worth it for the UX.', end: true }
        ]
      },
      rob: {
        lines: ['Highway robbery has a worse API. Mine has webhooks.'],
        options: [{ text: 'Fair.', end: true }]
      }
    }
  },

  techwulf: {
    name: 'TECHWULF',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Jeroan of Techwulf. Hold still — I read skill-pelts.',
          '*sniffs* I smell… jumping. Some swinging. Light packet-hoarding.',
          'Your true talents, mapped. The pelt never lies, friend.'
        ],
        options: [
          { text: 'What should I train?', to: 'train' },
          { text: 'Good wolf.', end: true }
        ]
      },
      train: {
        lines: ['The latent space, to the deep. Curiosity is a skill too.'],
        options: [{ text: 'Noted.', end: true }]
      }
    }
  },

  aikido: {
    name: 'AIKIDO WARDEN',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Aikido Warden. I turn an attacker’s force against them.',
          'Let me scan your gear… ah. Your Rusty Pointer has a vulnerability.',
          'Line 1: it is rusty. Patch suggested: be less rusty. You’re welcome.'
        ],
        options: [
          { text: 'Anything serious?', to: 'cve' },
          { text: 'Thanks, I think.', end: true }
        ]
      },
      cve: {
        lines: ['One critical: you keep running INTO the bots. Mitigation: don’t.'],
        options: [{ text: 'Rude. Correct. Bye.', end: true }]
      }
    }
  },

  collibrary: {
    name: 'THE COLLIBRARY',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'The Collibrary governs all data-spirits. Everything, catalogued.',
          'I know where every packet is shelved. First: sign the governance scroll.',
          'Lineage, ownership, retention policy. In triplicate. For the loot.'
        ],
        options: [
          { text: 'Just tell me where the loot is.', to: 'loot' },
          { text: 'Too much paperwork.', end: true }
        ]
      },
      loot: {
        lines: ['Deeper than you’ve gone. Properly tagged. Access request: pending.'],
        options: [{ text: 'Helpful-ish.', end: true }]
      }
    }
  },

  verticalforge: {
    name: 'VERTICAL FORGE',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Sébastier, of the Vertical Forge. We stack compute. To the sky.',
          '*a tower of cubes rises one notch as you speak* — see? Taller.',
          'Talk to me again and it grows again. There is no ceiling. Only funding.'
        ],
        options: [
          { text: 'How tall can it get?', to: 'tall' },
          { text: 'Impressive stack.', end: true }
        ]
      },
      tall: {
        lines: ['Yes.'],
        options: [{ text: '...okay.', end: true }]
      }
    }
  },

  quillbox: {
    name: 'QUILLBOX',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Quillbox, at your service. Dreary paperwork → one neat spell.',
          'Here is a form. Watch — it fills itself out. *poof* a packet falls out.',
          'Bureaucracy, but make it magic. Belgian efficiency, would you believe.'
        ],
        options: [{ text: 'Tidy. Merci.', end: true }]
      }
    }
  },

  scorevc: {
    name: 'SCORE VENTURES',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Alexandro, Score Ventures. Quick questions. Rapid-fire. Ready?',
          'What’s your ARR? Your moat? Your burn? Your TAM? Your—',
          'Tell you what: twenty copper, for twenty percent of your run.'
        ],
        options: [
          { text: 'Hard pass.', to: 'pass' },
          { text: 'Tempting, but no.', end: true }
        ]
      },
      pass: {
        lines: ['Respect. I’ll put you in the newsletter anyway. Everyone’s in it.'],
        options: [{ text: 'Bye.', end: true }]
      }
    }
  },

  chronicler: {
    name: 'THE CHRONICLER',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Romair, the Chronicler. Once a herald; now I write the expo’s tale.',
          '*scribbles* "A traveller approached the Chronicler, said little,',
          'and somehow still ended up quoted out of context." — you’re welcome.'
        ],
        options: [
          { text: 'Off the record?', to: 'record' },
          { text: 'Print whatever.', end: true }
        ]
      },
      record: {
        lines: ['Nothing here is off the record. The sauna IS the record. Sweaty scoop.'],
        options: [{ text: 'Noted, journalist.', end: true }]
      }
    }
  },

  syndicate: {
    name: 'FIRST SYNDICATE',
    start: 'root',
    nodes: {
      root: {
        lines: [
          '*low voice* First Syndicate. I don’t do magic. I do introductions.',
          'You want loot? I know a guy. There’s a stash nobody’s catalogued—',
          'down past the plunge. Bind the right tool and it opens. You didn’t hear it from me.'
        ],
        options: [{ text: 'I know nothing.', end: true }]
      }
    }
  },

  patrons: {
    name: 'FORTUNO × FLEXION',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'Filop (Fortuno): "So, Davod, tell us about Flexion."',
          'Davod (Flexion): "Gladly, Filop. But first — tell US about Fortuno."',
          'Filop: "Gladly. But first—" *this has been going for an hour*'
        ],
        options: [
          { text: 'I\'ll let you two finish.', end: true },
          { text: 'Who is interviewing whom?', to: 'loop' }
        ]
      },
      loop: {
        lines: ['Yes.', 'Anyway — "So, Davod, tell us about Flexion." *it begins again*'],
        options: [{ text: 'Backing away slowly.', end: true }]
      }
    }
  },

  redacted: {
    name: '[ REDACTED ]',
    start: 'root',
    nodes: {
      root: {
        lines: [
          'We are the two they were not allowed to print yet.',
          'No sigil. No name. We don’t exist until the embargo lifts.',
          'But between us: the latent space, to the east. Jump in on purpose.'
        ],
        options: [
          { text: 'Who ARE you?', to: 'who' },
          { text: 'I\'ll keep your secret.', end: true }
        ]
      },
      who: {
        lines: ['*they gesture at their [REDACTED] faces* — next week. Maybe.'],
        options: [{ text: 'Fair enough.', end: true }]
      }
    }
  }
};
