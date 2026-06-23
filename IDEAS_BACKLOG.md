# IDEAS_BACKLOG.md

Parking lot for good ideas that are **out of scope for the first shot** (Level 1
only). When something doesn't fit inter-net or the "ship one level" guardrail, it
goes here instead of stalling the build.

---

## Parked references (wrong era for inter-net, right for later)
- Trolls → forum / social-media level
- Cookies & cache → modern-web level (Bait & Cache shop)
- Lynx (cat = text browser), Archie (search NPC), IRC, daemons → Foss-Fae
- Phishers (fake-loot NPCs) → any market level
- Morris Worm cameo → unused alt easter egg

## Level concepts
- Foss-Fae (Brussels): Free Folk + helpful hob-daemons — cute chaotic-good
  freedom-lovers, gift economy, fork off into new courts. Home-turf insider
  level. NOT evil demons.
- Forum dungeon: bridge trolls = forum trolls
- Da-Boss summit: final-boss mountain of elites

## Mechanics to revisit
- Full procedural generation (inter-net stays fixed-layout tutorial)
- More palette unlocks as collectibles
- Phisher bait-and-damage NPC pattern
- Wall-jump / proper ladder snapping (current nets are zone-based hang/climb)
- Enemy variety beyond the splitting slime

## Dialogue / flame-bait seeds (per future crowd)
- Foss-Fae (FOSDEM): SAFE  "I don't understand Linux. No one really does."
                     BAIT  "Closed source is more secure."  -> Flame War
- Universal bait pool: vim vs emacs, tabs vs spaces, "is HTML a programming
  language", "JS is a real language", light mode vs dark mode

## Merch
- Lanyard as unlock token AND a real sticker/tee line
- inter-net green-CRT poster; baud-rate badge

---

## Deferred / discovered during the first-shot build (notes for next session)

- **Art pipeline:** all textures are procedural via `make.graphics()` →
  `generateTexture()` in `src/textures.js`, keyed by `TKEY` in `config.js`. To
  swap in real sprite sheets (e.g. an Aseprite MCP pipeline) later: load them
  under the same keys and delete the matching maker. Gameplay references keys,
  never pixels — no logic rewrite.
- **Palette swap is a shader uniform**, not a texture rebuild. Art is drawn in
  green; `CRTPipeline` remaps the green channel to the active tint. Amber =
  one uniform. Adding more palettes = add a `TINT` entry + an unlock.
- **Adding a level = add a scene + data, not a refactor.** Copy
  `data/levelInterNet.js`, point a thin scene at it, register the scene in
  `main.js`, and flip `playable` in `data/conferences.js`. The scene reads
  platforms / nets / water / zones / npcs generically.
- **Duels are fully reusable.** `DuelScene` takes a config from `data/duels.js`;
  any level supplies its own opponents + lines.
- **Possible polish later:** controller/gamepad support; a proper title-screen
  attract loop; mobile touch controls; persistent per-level best times; audio
  volume slider; the dial-up screech could be skippable-on-replay via a save
  flag (currently ESC-skippable each time).
- **Known simplifications (intentional for v1):** combat is single-button melee;
  the duel AI is deliberately shallow; nets are overlap-zones (climb/hang) rather
  than snapped ladders; loot/enemy randomization is light (per-run zone rolls).

---

## Shipped: on-the-sauna (level 2) — notes for next session

- **Refactored** the monolithic InterNetScene into a data-driven `LevelScene`
  base; inter-net and on-the-sauna are now thin subclasses + data. Future levels
  are data + a 3-line scene. Optional data sections: water, nets, mcpGates/
  mcpSockets, agentStart, skin (block/enemy textures), secret (typed reward).
- **Unlock plumbing** is now prereq-based: conferences carry `requires: <lanyardId>`;
  `MenuScene.isOpen` honors it. on-the-sauna requires `inter-net`.
- New mechanics to reuse/extend: Agent familiar (`entities/Agent.js`, vacuums
  packets), MCP socket→gate (press E to drop a forcefield), bot enemy skin.
- **Parked sauna ideas not built:** a real HEAT meter (steam rooms that damage
  unless you cold-plunge) — currently steam is flavor and the meter is the reused
  dive/BREATH system; a löyly "steam burst" jump-boost; agent that also fights;
  more MCP gates as a proper multi-tool puzzle; the "couple not printed yet"
  [REDACTED] NPCs could resolve to real names once the embargo lifts.
- **Roster fidelity:** companies are fantasy-pun reskins; speaker first names keep
  one letter flipped (Lélio→Lélia, Jeroen→Jeroan, Sébastien→Sébastier, Romain→
  Romair, Alexandre→Alexandro, David→Davod, Filip→Filop, Laurent→Lauront).

---

## Boss fights (future)

### The Metalord — a two-phase boss (parody of Zuckerberg / Meta)
Reference: the Meta founder's two hobbies — BJJ and the metaverse. Scramble the
name per the branding guardrail (no marks): e.g. **Lord Zuccarro, the Metalord**
/ "Zuck the Changeling" — recognizable, deniable. Fits a future Meta-Connect /
"Mirror Court" level (avatars = changeling reflections; the Hollow Bazaar /
metaverse hype is the satire target — never the person).

Two-phase fight, extending the reusable `DuelScene` into a `BossScene` (or a
`phases: []` option on DuelScene):

- **Phase 1 — BJJ (the mat).** Not the stand-up Flame War — a *grappling* duel.
  Moves reskinned: clinch / takedown / sweep / submission instead of light /
  heavy / special; a "submission" meter instead of a health bar (tap him out).
  Gi + belt sprite. He keeps trying to mount; you escape and reverse.
- **Phase 2 — the metaverse.** On winning the grapple he "jacks in": the arena
  flips to a neon wireframe metaverse and he fights you through waves of **robot
  avatars** (a short beat-'em-up / dodge-the-adds section) before the final blow.
  Boss has a VR-headset sprite; the robots are legless (the avatars-have-no-legs
  joke).

Easter eggs: legless avatars; he keeps insisting "the metaverse is the future"
(it is visibly empty); a "Year of Efficiency" banner; he challenges you to a
*cage match* on entry. Flame-bait (if a talk option precedes the fight):
"put some legs on your avatar, the metaverse is dead." Win → big Lanyard +
he mutters "we're pivoting to AI anyway."

Engine notes: DuelScene already does arena + health bars + FIGHT splash + win/
lose; a boss = (a) a `phases` array each with its own move-set/win-condition, and
(b) a wave-spawner for phase 2 (reuse the LagSlime/bot enemy + patrol). Keep it
light — the comedy is "a billionaire made me do jiu-jitsu then logged into an
empty metaverse," not a deep fighter.
