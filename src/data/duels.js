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
  }
};

export function getDuel(id) {
  return DUELS[id];
}
