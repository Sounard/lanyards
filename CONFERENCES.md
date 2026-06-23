# CONFERENCES.md

The roster of conference-levels for *Lanyards & Dragons*. Each is a real tech
conference reskinned as a medieval-fantasy faction. **inter-net** is the only
built level (the tutorial); everything else is a seeded stub awaiting a scene.

> **Branding guardrail:** parody, never infringement. No real logos, no
> trademarked names, no real-company assets. Names are puns; recognition comes
> from *vibe*, not from copying marks.

---

## Design rule — translate the *feel*, not just the name

The pun is the doorway; the fantasy faction must match the real crowd's culture
and ethos. Lock the **vibe** first, then find the name. Celebrate the
subcultures; aim the satire at hype, slop, and vaporware — **never at people**.

```
REAL CROWD VIBE          ->  FANTASY TRANSLATION (feel)
open-source / free sw    ->  Free Folk & hearth-daemons: cute chaotic-good fae/hob
                             spirits, gift economy, refuse to be owned, "fork" into
                             new courts when they disagree. Idealistic, communal.
hacker / chaos / infosec ->  thieves' guild & chaos-covens: hoods, lockpicks, ward-
                             breaking, grey morality, prestige in cleverness, paranoid.
heavy cosplay            ->  the Masquerade / Changeling Faire: glamour & shapeshifting,
                             everyone wears another's face for a day. Joyful transformation.
furry-coded              ->  Beastfolk / the Menagerie: proud, warm anthro animal-folk,
                             famous found-family. Dignified — never the punchline.
LGBTQ-forward            ->  the Iridescent / Prism Court: true-self glamour, shedding an
                             assigned form for one's real one. Celebratory, defiant, warm.
marketing / corp slop    ->  the Hollow Bazaar: gilded golems, hot-air djinn, snake-oil
                             alchemists. Buzzwords = incantations that do nothing.
                             Mock the hype & vaporware, never the people.
futuristic WOW           ->  the Artificers' Exposition: dazzling enchanted contraptions,
                             talking mirrors, homunculus servants — half of them demos
                             that break on stage. Steampunk-arcane wonder.
```

---

## The roster (seed — grow toward 100+)

| Game name              | Real conf (place)      | Culture-matched feel | Status |
|------------------------|------------------------|----------------------|--------|
| inter-net              | (none — tutorial)      | 1990 fishermen's port; first time online | **BUILT** |
| on-the-sauna           | Off the Radar (Brussels) | hidden, invite-only AI conclave in a bath-house, a couple of months after the Awakening (Jan-2026 singularity). Labs as rival ARTIFICERS summoning homunculi (agents); MCP as the binding that lets a familiar wield any tool. Phones in the cloakroom, one stage, one walking dinner. | **BUILT** |
| Webb Summit            | Web Summit (Lisbon)    | sprawling spider-web metropolis on a hill; thousands of web-weavers (startups) spin frantically to snare investors | stub |
| Interstolar            | Intersolar (Munich)    | earnest solar-druids & sun-mages; bright, hopeful, utopian | stub |
| Foss-Fae               | FOSDEM (Brussels)      | Free Folk + helpful hob-daemons; chaotic-good, gift economy, anti-corporate, "fork" off into new courts. NOT evil demons. | stub |
| Chaos Coven            | CCC (Germany)          | anarchic spell-hackers; anti-tyranny, chaotic, very political | stub |
| Cube Con               | KubeCon                | earth-golem orchestrators herding identical cube-golems into shifting formations; arcane runes (YAML) nobody fully reads | stub |
| Py Con                 | PyCon                  | gentle serpent-sages; wholesome, beginner-friendly teachers | stub |
| Deft Con               | DEF CON (Vegas)        | thieves' guild; lockpicking, enchanted puzzle-sigil badges, trust no one | stub |
| Iridescent Conclave    | Lesbians Who Tech      | Prism Court; joyous true-self glamour, found-family. Warm, celebratory | stub |
| The Masquerade         | Gamescom / Comic-Con   | Changeling faire; glamour magic, everyone is someone else for a day | stub |
| Dreamforge             | Dreamforce (SF)        | Hollow Bazaar crown jewel; colossal upsell-faire ruled by a cult mascot-golem; everything shiny, nothing real | stub |
| G.D.C.                 | GDC                    | "Guild of Dungeon Crafters" — weary makers behind the curtain, war stories | stub |
| Da-Boss                | Davos / WEF            | archmages & kings on the peak deciding the realm's fate; final-boss | stub |
| Black Hat              | Black Hat (Vegas)      | a sinister-but-professional dark-mage cabal | stub |
| South by Southwild     | SXSW (Austin)          | frontier jamboree of bards, tinkers & wandering players; eclectic crossroads | stub |
| Re-Enchant             | re:Invent (AWS)        | artificers unveiling a thousand enchantments nobody asked for; Vegas excess | stub |
| Mobile World Conjurers | MWC (Barcelona)        | portal-conjurers & far-speakers; grand connection magic, Gaudí spires | stub |

> Goal: grow toward 100+. For each new entry, lock the *feel* from the key above
> first, then the name. The data lives in `src/data/conferences.js`; this file is
> the design source of truth. Keep the two in sync.

---

## Built level — inter-net ("a fishermen's port")

The pun does the work: cast **nets**, a harbor is a **port**, going online = going
out on the water. Modeled on the **1990 internet experience and tech stack**.
Reference density is deliberately low — the joke is the setting, not a wall of puns.

**Six descending vertical layers:** Signal Tower (lighthouse spawn) → Cliff path
→ Docks + BBS board → Under the pier (nets/rigging) → Below the waterline (dive +
bandwidth) → Gopher tunnels (caves, `/dev/null`, exit + Lanyard).

**Curated reference set:** the Signal (dial-up), lag-slimes (latency + fork bomb,
split on hit), packets (TCP/IP currency), 404 (death pits), floppy (save points),
Gopher (the protocol), Lanyard (conferences), Rusty Pointer (sword + cursor + C
pointer). Background ASCII flavor only: BBS, baud rate, Mosaic, blinking cursor,
"Press any key."

**Signature easter egg:** `/dev/null` — a dark pit deep in the tunnels that,
unlike the 404 pits, *rewards* the player who jumps in on purpose (amber palette
unlock + bonus packets). Depth = secrets.

**Flame Wars (built, reusable):** NPCs talk in a branching menu; one flame-bait
option per provocative NPC drops into a 1v1 `DuelScene`. Tutorial bait lines:
- The Keeper/Sysop — *"BBS is dead. The Web is the future, old man."*
- BBS Vendor — *"AOL is the real internet."*

---

## Built level — on-the-sauna ("Off the Radar," Brussels)

A hidden, invite-only AI conclave in a bath-house, a couple of months after the
Awakening (the Jan-2026 singularity nobody quite noticed). Six layers: **The
Cloakroom** (Minister opens the day; "phones to the cloakroom") → **The Main
Stage** (one track; first rogue agents) → **The MCP Hall** (bind a tool at a
socket to drop a forcefield gate; gain an Agent familiar) → **Founders' Bench**
(Belgian founders + VC/media, crowded) → **The Cold Plunge** (dive; BREATH meter;
deeper = better loot) → **The Latent Space** (the secret room: meet the Awakening,
get a permanent Agent familiar). Clear it → **Lanyard #2**.

**New mechanics:** Agent familiar (auto-vacuums nearby packets), MCP sockets→gates
(press E at a socket to dissolve a forcefield over a stash), rogue "loop-bot"
agents (the splitting enemy, reskinned). Cold plunge reuses the dive/meter system.

**Branding:** parody only — companies are fantasy-pun reskins (no marks); speaker
first names keep one letter flipped. Satire aimed at hype/closed-vs-open holy wars,
never at people.

| Real | In-game NPC | Easter egg | Flame-bait duel |
|---|---|---|---|
| Laurent Hublet (Min.) | Minister **Lauront** Hubelt | cuts the ribbon, opens the day / tutorial | — |
| Cloudflare | the **Cloudflaire** Ward | "checking that thou art human…" | — |
| OpenAI | the **Open Eye** | finishes your sentence; gives an Agent | ✅ open vs closed |
| Anthropic | the **Anthropric** Order (*Cloderic*) | makes you sign a Constitution | ✅ safety |
| Google DeepMind | the **Gaggle** // Deep Mind | answer buried under sponsored runes | ✅ scale |
| Mistral | **Le Mistrale** (*Lélia*) | free open "gust"; speaks French | ✅ open weights |
| Vercel | **Versel** // Edge | deploys a copy of you; "Ready." | — |
| ElevenLabs | the **Eleven Bards** | repeats your line in your own voice | — |
| AWS | the **All-Wide Sky** | bills you for standing near it | — |
| Stripe | **Stryp** the Toll | skims 2.9% + 30 off packets | — |
| TechWolf | **Techwulf** (*Jeroan*) | reads your "skill-pelt" | — |
| Aikido | the **Aikido** Warden | finds a vuln in your Pointer | — |
| Collibra | the **Collibrary** | governance scroll before the loot | — |
| Vertical Compute | the **Vertical Forge** (*Sébastier*) | cube-tower grows as you talk | — |
| penbox | **Quillbox** | a form that auto-fills + drops a packet | — |
| 20VC | **Score Ventures** (*Alexandro*) | "what's thy ARR?"; 20 for 20% | — |
| Hypertext | the **Chronicler** (*Romair*) | live-writes a snarky chronicle | — |
| Syndicate One | the **First Syndicate** | "I know a guy" → stash hint | — |
| Fortino × Flexion | the **Patrons' Bench** (*Filop & Davod*) | interview each other forever | — |
| (not printed yet) | two **[REDACTED]** cloaks | point you to the latent space | — |
