// Lanyards & Dragons — capture endpoint (Cloudflare Worker + D1).
//
//   POST /collect  body: JSON object or array of payloads, each with `kind`:
//     - { kind:'event',      type, clientId, level?, packets? }   (anonymous telemetry)
//     - { kind:'suggestion', text, clientId }                     (a conference idea)
//     - { kind:'contact',    email, token, consent }              (Guild signup)
//     - { kind:'forget',     token }                              (GDPR delete by token)
//   GET  /stats?key=ADMIN_KEY   -> counts + recent rows (admin only)
//
// CORS is open (no credentials are ever sent). Emails live only here (D1 is
// encrypted at rest); the browser keeps a random token, never the address.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { 'Content-Type': 'application/json', ...CORS }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    if (url.pathname === '/collect' && request.method === 'POST') {
      let body;
      try { body = JSON.parse(await request.text()); }
      catch (e) { return json({ ok: false, error: 'bad json' }, 400); }
      const items = Array.isArray(body) ? body : [body];
      if (items.length > 100) return json({ ok: false, error: 'too many' }, 413);
      try { for (const p of items) await handle(p, env); }
      catch (e) { return json({ ok: false, error: String(e && e.message || e) }, 500); }
      return json({ ok: true, n: items.length });
    }

    if (url.pathname === '/stats' && request.method === 'GET') {
      if (!env.ADMIN_KEY || url.searchParams.get('key') !== env.ADMIN_KEY) {
        return json({ ok: false, error: 'unauthorized' }, 401);
      }
      const contacts = await env.DB.prepare('SELECT COUNT(*) AS n FROM contacts').first();
      const emails = await env.DB.prepare('SELECT email, source, ts FROM contacts ORDER BY ts DESC LIMIT 500').all();
      const suggestions = await env.DB.prepare('SELECT text, ts FROM suggestions ORDER BY ts DESC LIMIT 500').all();
      const events = await env.DB.prepare('SELECT type, COUNT(*) AS n FROM events GROUP BY type').all();
      return json({
        ok: true,
        contacts: contacts ? contacts.n : 0,
        emails: emails.results,
        suggestions: suggestions.results,
        events: events.results
      });
    }

    if (url.pathname === '/') return json({ ok: true, service: 'lanyards-collect' });
    return json({ ok: false, error: 'not found' }, 404);
  }
};

async function handle(p, env) {
  const ts = Number(p.ts) || Date.now();
  const s = (v, n) => String(v == null ? '' : v).slice(0, n);
  if (p.kind === 'contact') {
    if (!p.email || !p.token) return;
    await env.DB.prepare('INSERT INTO contacts (email, token, consent, source, ts) VALUES (?,?,?,?,?)')
      .bind(s(p.email, 160), s(p.token, 80), p.consent ? 1 : 0, s(p.source, 40), ts).run();
  } else if (p.kind === 'forget') {
    if (!p.token) return;
    await env.DB.prepare('DELETE FROM contacts WHERE token = ?').bind(s(p.token, 80)).run();
  } else if (p.kind === 'suggestion') {
    await env.DB.prepare('INSERT INTO suggestions (text, client_id, ts) VALUES (?,?,?)')
      .bind(s(p.text, 200), s(p.clientId, 80), ts).run();
  } else if (p.kind === 'event') {
    await env.DB.prepare('INSERT INTO events (type, client_id, level, packets, ts) VALUES (?,?,?,?,?)')
      .bind(s(p.type, 40), s(p.clientId, 80), s(p.level, 60), Number(p.packets) || 0, ts).run();
  }
}
