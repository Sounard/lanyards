# Capture endpoint (Cloudflare Worker + D1)

Receives Guild emails, conference suggestions and anonymous telemetry from the
game and stores them in a D1 (SQLite) database you own. Emails are kept **only
here** (encrypted at rest); the browser never stores the address — just a random
deletion token.

## Deploy (≈5 minutes, one time)

From this `worker/` directory:

```bash
npm i -g wrangler            # or use: npx wrangler ...
wrangler login

# 1. create the database, then paste the printed database_id into wrangler.toml
wrangler d1 create lanyards

# 2. create the tables
wrangler d1 execute lanyards --remote --file=./schema.sql

# 3. set an admin password for the /stats read view
wrangler secret put ADMIN_KEY      # type any strong string

# 4. ship it
wrangler deploy
```

`wrangler deploy` prints your URL, e.g. `https://lanyards-collect.<you>.workers.dev`.

(Optional, if `lanyards.lol` is on Cloudflare: add a custom domain/route
`api.lanyards.lol` to the Worker for a prettier endpoint.)

## Point the game at it

In GitHub → repo **Settings → Secrets and variables → Actions → Variables → New
repository variable**:

- name: `VITE_COLLECT_ENDPOINT`
- value: `https://lanyards-collect.<you>.workers.dev/collect`  (note the `/collect`)

Then re-run the **Deploy to GitHub Pages** workflow (or push any commit). The
build inlines that URL; queued suggestions/telemetry flush and Guild signups
start landing in D1. No code change needed.

## Read what came in

```bash
curl "https://lanyards-collect.<you>.workers.dev/stats?key=YOUR_ADMIN_KEY"
```

Returns contact count, recent emails, recent suggestions, and event counts. Or
query D1 directly:

```bash
wrangler d1 execute lanyards --remote --command "SELECT email, ts FROM contacts ORDER BY ts DESC"
wrangler d1 execute lanyards --remote --command "SELECT text, ts FROM suggestions ORDER BY ts DESC"
```

## Privacy / GDPR

- The browser stores a random **token**, never the email.
- "Forget me" (F in the Passport) sends `{kind:'forget', token}` → the Worker
  deletes that contact row. A user can also be deleted by hand:
  `wrangler d1 execute lanyards --remote --command "DELETE FROM contacts WHERE email='x@y.z'"`.
- Telemetry rows carry only a random `client_id` (no PII).
- CORS is open; restrict `Access-Control-Allow-Origin` to `https://play.lanyards.lol`
  in `src/worker.js` if you prefer.
