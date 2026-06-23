# Lanyards & Dragons

A funny, very playable **2D side-view platformer roguelike-RPG** where the meta-
theme — *going to tech conferences* — is reskinned as **medieval fantasy**. Clear
a level, earn a **Lanyard**, and Lanyards unlock conference levels. Two levels
ship today: **inter-net** (a 1990 fishermen's port — your first time online) and
**on-the-sauna** (a hidden, post-singularity AI conclave in a Brussels bath-house
— a parody of the *Off the Radar* event, with the labs as artificers and agents
as homunculi). Both rendered in green-phosphor CRT glow, opening on a fake BIOS
boot and a dial-up handshake screech.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default <http://localhost:5173>) in a browser.
That's the whole build — no native step, all art is generated procedurally
in-engine, and progress saves to `localStorage`.

> Audio (the dial-up screech + SFX) starts on your first keypress — browsers
> require a user gesture before playing sound. The cold open's *"PRESS ANY KEY TO
> DIAL IN"* is that gesture.

## Controls

| Action | Keys |
|--------|------|
| Move | `←` `→` (or `A` `D`) |
| Jump | `↑` / `W` / `Space` |
| Climb nets / Dive | `↑` `↓` (on rigging / underwater) |
| Swing Rusty Pointer | `J` / `F` |
| Talk to NPC | `E` |
| Skip cold open | `Esc` |
| **Menu:** navigate / play | arrows / `Enter` |
| **Menu:** amber palette · CRT · reset | `A` · `C` · `R` |
| **Flame War duel** | `←` `→` move · `J` light · `K` heavy · `L` special · `Space` block |

## The first level — inter-net

Descend six layers: **Signal Tower** (the Keeper teaches you the dial-up
*Signal*) → **Cliff path** (lag-slimes that *split in two when you hit them*; 404
death-pits) → **Docks + BBS** (a vendor; ambient NPCs) → **Under the pier** (climb
nets/rigging) → **Below the waterline** (dive; a *bandwidth* meter drains while
submerged; deeper = better loot) → **Gopher tunnels** (the `/dev/null` secret and
the exit). Reach the exit to earn **Lanyard #1**.

Collect **packets** (TCP/IP) as currency, **floppies** save your respawn point,
and one **flame-bait** dialogue option per provocative NPC drops you into a
**Flame War** — a tongue-in-cheek 1v1 fighting-game duel. Somewhere deep in the
tunnels, a pit marked `/dev/null` *rewards* the player curious enough to jump in
on purpose. Depth = secrets.

## Project shape

```
src/
  main.js            game config, CRT pipeline registration, applyCRT()
  config.js          palettes, physics tuning, texture keys (TKEY)
  save.js            localStorage: lanyards, unlocks, best run, palette toggle
  textures.js        procedural 32x32 art -> generateTexture()
  ui.js              terminal text / panels / typewriter / ████ bars
  pipelines/CRTPipeline.js   green-phosphor post-FX (scanlines, curvature, bloom)
  audio/sfx.js       Web Audio: dial-up handshake + blips (no asset files)
  entities/          Player, LagSlime, Agent (familiar)
  data/              conferences, level layouts, dialogue, duel configs
  scenes/            Preload, Boot (cold open), Menu (world map),
                     LevelScene (data-driven base), InterNet + OnTheSauna
                     (thin subclasses), UI (HUD), Dialog, Duel, Void (secret room)
```

**Adding a conference level** = add a data file (copy `data/levelInterNet.js`),
a 3-line scene subclass of `LevelScene`, register it in `main.js`, and add the
entry (with `requires:` prereq) in `data/conferences.js`. No engine changes —
`LevelScene` builds everything from data, and optional sections light up extra
mechanics (water/dive, nets, MCP gates/sockets, an Agent familiar, enemy skins,
a secret reward room). Swapping procedural art for real sprite
sheets = load them under the same `TKEY` keys. See `IDEAS_BACKLOG.md` and
`CONFERENCES.md` for the design docs.

## Tech

Phaser 3 (Arcade Physics) + Vite. WebGL for the CRT post-FX (degrades gracefully
to a flat render on the canvas fallback). Parody only — no real logos or
trademarks; all art is original/procedural.
