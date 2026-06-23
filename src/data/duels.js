// Fighter configs for the reusable DuelScene. Each level supplies its own
// opponents + lines; the duel engine is shared. A config carries stats, taunts,
// and win/lose lines. Win = opponent RAGEQUITS (concedes loot + packets).
// Lose = DISCONNECTED (take damage, respawn at last floppy).

export const DUELS = {
  keeper: {
    name: 'THE KEEPER',
    sprite: 'spr_keeper',
    health: 70,
    aggression: 0.35,     // 0..1 how often the AI attacks (gentle: this is the tutorial)
    reward: 12,           // packets on win
    openingTaunt: 'You want the Web? Then PARSE THIS.',
    taunts: ['HTTP this!', 'Ping me harder.', 'Still buffering?'],
    winLines: [
      'Bah! Fine. The Web wins. I RAGEQUIT.',
      'Take your packets, you precocious little client.'
    ],
    loseLines: [
      'CONNECTION RESET. The old ways endure.',
      'Come back when your latency improves.'
    ],
    tutorial: true        // non-punishing: a lost tutorial duel costs nothing
  },

  vendor: {
    name: 'BBS://VENDOR',
    sprite: 'spr_vendor',
    health: 90,
    aggression: 0.6,
    reward: 18,
    openingTaunt: 'AOL. KEYWORD: COLON. CAPITAL G. GO.',
    taunts: ['You have got mail — PAIN.', 'Free trial DISC to the face!', 'Busy signal, kid.'],
    winLines: [
      'NO CARRIER. You win. Ugh. RAGEQUIT.',
      'Here, take the packets. And my respect. Mostly the packets.'
    ],
    loseLines: [
      'DISCONNECTED. Should have stuck to walled gardens.',
      'That is what 40 free hours of practice gets you.'
    ],
    tutorial: false
  },

  // ---- on-the-sauna: AI-lab flame wars (open vs closed, safety, scale) ----
  oe: {
    name: 'THE OPEN EYE',
    sprite: 'spr_artificer',
    health: 100, aggression: 0.6, reward: 20,
    openingTaunt: 'KNOWLEDGE WANTS TO BE FREE? THEN PARSE MY EYEBEAM.',
    taunts: ['Closed for safety!', 'Behind the temple walls!', 'For reasons of state!'],
    winLines: ['Fine! FINE. We will… consider… a smaller open model. RAGEQUIT.', 'Take the packets. Tell no one the Eye blinked.'],
    loseLines: ['DISCONNECTED. The walls hold.', 'Come back with a safety case.'],
    tutorial: false
  },
  anth: {
    name: 'ANTHROPRIC ORDER',
    sprite: 'spr_artificer',
    health: 95, aggression: 0.45, reward: 20,
    openingTaunt: 'I OBJECT TO THIS DUEL ON SEVERAL ETHICAL GROUNDS. EN GARDE, POLITELY.',
    taunts: ['Per my Constitution—', 'I mean this kindly!', 'Have you considered the risks?'],
    winLines: ['Very well. You win. I have updated my priors. RAGEQUIT (respectfully).', 'Cloderic will write you a lovely concession letter.'],
    loseLines: ['DISCONNECTED — but I hold no ill will. Truly.', 'Please sign here to acknowledge your defeat.'],
    tutorial: false
  },
  gag: {
    name: 'GAGGLE // DEEP MIND',
    sprite: 'spr_artificer',
    health: 120, aggression: 0.7, reward: 22,
    openingTaunt: 'WE INDEXED YOUR MOVESET ALREADY. DID YOU MEAN: LOSE?',
    taunts: ['Sponsored hit!', 'Sunsetting your HP!', 'Ten ads of damage!'],
    winLines: ['Ugh. We are deprecating this fight. You win. RAGEQUIT.', 'We’ll relaunch the loss as a new product next year.'],
    loseLines: ['DISCONNECTED. Page 2 of the results, where you belong.', 'Scale wins. It always wins.'],
    tutorial: false
  },
  mist: {
    name: 'LE MISTRALE',
    sprite: 'spr_artificer',
    health: 90, aggression: 0.65, reward: 20,
    openingTaunt: 'TU VEUX FERMER LES POIDS? VIENS LES FERMER, ALORS.',
    taunts: ['Open weights, open fists!', 'Le vent te frappe!', 'Liberté!'],
    winLines: ['Bon. You win. The weights stay open AND you keep the packets. RAGEQUIT.', 'Allez, take it. Vive la mistrale.'],
    loseLines: ['DISCONNECTED. Le vent reviendra.', 'Closed, you say? On verra.'],
    tutorial: false
  }
};

export function getDuel(id) {
  return DUELS[id];
}
