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
