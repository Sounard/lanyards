# DATA_CAPTURE.md — brainstorm + plan

Goals the team wants:
1. Collect **suggestions** for which conferences to add.
2. Collect **contacts** of people (updates / playtest invites).
3. **Register** what each player completed / attended and which **collectibles** they earned.

The game is a **static client** (GitHub Pages at `play.lanyards.lol`, no backend yet),
and the team is in **Brussels (EU → GDPR matters)**. That shapes everything below.

---

## 1. Two kinds of data (keep them separate)

**A. Player-local profile** — lives in `localStorage`, belongs to the player, no
network. Already started (`lanyards`, `visited`, `completed`, `bestPackets`,
`unlocks`, `palette`). Grow it into a **Passport**:
- per level: `completed`, best packets, best time, deaths, secrets found
- **collectibles registry**: amber palette, Agent familiar, each secret room
  (`/dev/null`, latent space), "talked to all NPCs", "won a Flame War", lanyards
- meta: total runs, playtime, first/last seen, a random anonymous `clientId`
- powers a **Passport / Lanyard-wall** menu screen (also the place to "share run").

**B. Captured-to-you data** — needs an endpoint. Three streams:
- **Telemetry (anonymous):** `level_started`, `level_completed{packets,ms}`,
  `secret_found`, `duel_result`. Random `clientId`, **no PII, cookieless**.
- **Suggestions (low-PII):** free text (conference name) + optional handle.
- **Contacts (PII!):** email (+ optional name/role) with **explicit opt-in**.

---

## 2. Where to send B (Make.com is OUT — too buggy)

| Option | Effort | Own the data? | Good for | Notes |
|---|---|---|---|---|
| **Cloudflare Worker + D1/KV** ⭐ | med | yes | events + suggestions + contacts + **leaderboards** | own API at `api.lanyards.lol`; free tier; CORS easy; ~30-line `fetch` handler that inserts into D1 (SQLite). Grows into leaderboards / cloud sync. Best all-rounder. |
| **Supabase** | med | yes | structured DB + auth + **GDPR delete UI** | hosted Postgres + auto REST + row-level security + a table dashboard; nicest for contacts (built-in delete) and if you ever want accounts. Generous free tier. |
| **Google Apps Script → Sheet** | lowest | yes | suggestions + contacts | you have Google Drive; a ~20-line `doPost` appends to a Sheet, deploy as a Web App. Zero infra/cost. Use `text/plain` body to dodge CORS preflight. Weaker for high-volume telemetry. |
| No-code form (Tally / Airtable / Formspree) | lowest | yes | suggestions + contacts only | link/embed; no custom events. |
| Val.town / Pipedream | low | yes | a quick hosted function | middle ground if you don't want a CF account. |

**Recommendation:** a **Cloudflare Worker + D1** as the single ingest endpoint —
own the data, free, scales to leaderboards, and the client already speaks plain
JSON to one URL. If you want a click-through GDPR-delete dashboard for contacts,
use **Supabase** instead (or alongside, just for contacts). For a 10-minute MVP,
**Apps Script → Google Sheet** works today.

The client is endpoint-agnostic: set `ENDPOINT` in `src/telemetry.js` to the URL
and everything queued in `localStorage` starts flushing. One `type`-switched
payload (`kind`: `event` | `suggestion` | `contact`):
```json
{ "type":"level_completed", "clientId":"…", "level":"on-the-sauna", "packets":42, "ms":123456, "v":"0.1", "ts":… }
{ "type":"suggestion", "clientId":"…", "text":"NeurIPS", "handle":"", "ts":… }
{ "type":"collectible", "clientId":"…", "id":"latent-space", "level":"on-the-sauna", "ts":… }
{ "type":"contact", "email":"x@y.z", "name":"", "role":"", "consent":true, "source":"on-the-sauna", "ts":… }
```

---

## 3. In-game capture UX (keep the BBS/terminal vibe)

- **"SUBMIT A CON" terminal** — a menu option or an NPC; a tiny in-game text input
  ("type a conference name") → POST `suggestion`. Reward a packet/collectible for
  submitting. Fits the aesthetic perfectly (a BBS submission form).
- **"JOIN THE GUILD / GET UPDATES"** — optional, skippable prompt after clearing a
  level or in the menu: email + a consent line. POST `contact`. **Never gates play.**
- **Telemetry** — fire-and-forget POST on `level_completed` etc., behind a privacy
  toggle in settings.
- **Passport / Lanyard wall** — menu screen listing collectibles + completed levels;
  natural home for "share your run" (copies the `/<level>` URL + a result string).

---

## 4. Privacy / GDPR (Brussels)

- **Contacts = PII** → explicit opt-in (no pre-ticked boxes), clear purpose, minimal
  fields (email is enough), easy deletion ("forget me"). Store only what you use.
- **Telemetry = anonymous** → random `clientId`, cookieless, no IP retention, no
  cross-site trackers (avoid GA-style scripts without consent). A one-line notice +
  a settings toggle is respectful and likely sufficient under legitimate interest.
- Add a short privacy note and a `version` field on every event for clean analytics.

---

## 5. Phased plan

- **Phase 1 — shipped:** deep-link URLs (`/on-the-sauna`) + expanded local profile
  (`visited` / `completed`).
- **Phase 2 — shipped:** collectibles registry (`data/collectibles.js`, `save.js`)
  + the **Passport / Lanyard-wall** screen (`PassportScene`, key `P` from the map),
  with **p5.js** cute icons (`p5assets.js`, Phaser-drawn fallback). Client-only.
- **Phase 3 — shipped (client side):** `src/telemetry.js` — anonymous `clientId`,
  consent toggle, `localStorage` queue, fire-and-forget POST. Events wired:
  `level_started` / `level_completed` / `secret_found` / `duel_won`. **SUBMIT A CON**
  and **JOIN THE GUILD** flows live (`FormScene`). *Pending:* set `ENDPOINT` to a
  real URL (Cloudflare Worker) so the queue actually sends.
- **Phase 4 — shipped (client side):** consented **contact** capture (email-only,
  TAB-to-consent, erasable via `forgetContact`) + privacy notes in-UI.
- **Phase 5 (next / optional):** stand up the **Cloudflare Worker + D1** endpoint,
  set `ENDPOINT`, then build leaderboards / shareable run pages / cloud sync.

> Next concrete step: create the Worker (`POST /collect` → insert batch into D1),
> bind it to `api.lanyards.lol`, set `ENDPOINT` in `src/telemetry.js`. Everything
> queued in players' browsers flushes on their next event.
