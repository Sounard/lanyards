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

## 2. Where to send B (pick one to start)

| Option | Effort | Own the data? | Good for | Notes |
|---|---|---|---|---|
| **Make.com webhook** ⭐ | low | yes | events + suggestions + contacts | team already uses Make; one `fetch()` → Make routes to Sheet/Airtable/email/Slack. Can scaffold via the Make MCP. |
| No-code form (Tally / Airtable / Formspree) | lowest | yes | suggestions + contacts only | link or embed; no events; fastest for the two forms. |
| Cloudflare Worker + KV/D1 | med | yes | events + **leaderboards** + cloud profile | own API at `api.lanyards.lol`; best if you want leaderboards/sync later. |
| Supabase / Firebase | med | yes | structured DB + auth + realtime | if you want accounts / cloud profiles. |

**Recommendation:** start with a **Make webhook** as a single ingest endpoint for
all three streams (you already run Make, minimal client code, easy fan-out).
Graduate to a **Cloudflare Worker** when you want leaderboards / cloud sync.

One endpoint, `type`-switched payloads:
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
  (`visited` / `completed`). Foundation for the Passport and telemetry payloads.
- **Phase 2:** collectibles registry in `save.js` + a **Passport / Lanyard-wall**
  menu screen (client-only, no network).
- **Phase 3:** `src/telemetry.js` (consent-gated, fire-and-forget POST) + a Make
  webhook; wire `level_completed` / `secret_found` / `collectible` events and the
  **"Suggest a con"** in-game form.
- **Phase 4:** consented **contact** capture form + privacy note.
- **Phase 5 (optional):** Cloudflare Worker backend → leaderboards, cloud profile
  sync, shareable run pages.

> Next concrete step when ready: stand up the Make webhook (can be scaffolded via
> the Make MCP), add `src/telemetry.js`, and ship the "Suggest a con" form.
