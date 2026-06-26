// Endpoint-agnostic capture. Set VITE_COLLECT_ENDPOINT (the Worker's /collect
// URL) as a build var and everything flows. See worker/README.md.
//
// Privacy:
//  - Telemetry is anonymous (random clientId, no PII) and honours the toggle;
//    events + suggestions are queued in localStorage and flushed (retried).
//  - CONTACTS (emails) are NEVER stored in the browser. They are POSTed straight
//    to the server; only a random deletion TOKEN is kept locally, so "forget me"
//    works without holding any PII client-side.

import * as Save from './save.js';

const ENDPOINT = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_COLLECT_ENDPOINT) || '';
const QKEY = 'ld_capture_queue_v1';
const VERSION = '0.3';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; }
}
function saveQueue(q) {
  try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-200))); } catch (e) { /* full/private */ }
}

// Privacy: older builds queued contact payloads (with email) here. Purge any
// such legacy PII from the local queue on load — emails never belong in storage.
(function purgeLegacyPII() {
  try {
    const q = loadQueue();
    const clean = q.filter(p => p && p.kind !== 'contact');
    if (clean.length !== q.length) saveQueue(clean);
  } catch (e) { /* ignore */ }
})();

// queue is for NON-PII only (events, suggestions)
function enqueue(payload) {
  const q = loadQueue();
  q.push(Object.assign({ ts: Date.now(), v: VERSION }, payload));
  saveQueue(q);
  flush();
}

export function flush() {
  if (!ENDPOINT || typeof fetch === 'undefined') return;
  const q = loadQueue();
  if (!q.length) return;
  const batch = q.slice();
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(batch), keepalive: true })
    .then(r => { if (r.ok) saveQueue(loadQueue().slice(batch.length)); })
    .catch(() => { /* stay queued, retry next event */ });
}

// one-shot POST that is NEVER persisted locally (used for PII / deletions)
async function postNow(payload) {
  if (!ENDPOINT || typeof fetch === 'undefined') return false;
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(Object.assign({ ts: Date.now(), v: VERSION }, payload))
    });
    return r.ok;
  } catch (e) { return false; }
}

function telemetryOn() { return Save.load().settings.telemetry !== false; }
function uuid() {
  return (self.crypto && self.crypto.randomUUID)
    ? self.crypto.randomUUID()
    : 't-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// --- public API ---

export function track(type, data = {}) {
  if (!telemetryOn()) return;
  enqueue(Object.assign({ kind: 'event', type, clientId: Save.clientId() }, data));
}

export function submitSuggestion(text) {
  const t = String(text || '').trim().slice(0, 80);
  if (!t) return false;
  enqueue({ kind: 'suggestion', text: t, clientId: Save.clientId() });
  return true;
}

export function endpointConfigured() { return !!ENDPOINT; }
export function inGuild() { return !!Save.load().guild; }

// Sends the email to the server; stores ONLY a random token locally.
export async function submitContact(email) {
  const e = String(email || '').trim().slice(0, 160);
  if (!validEmail(e)) return { ok: false, error: 'that email looks off.' };
  if (!ENDPOINT) return { ok: false, error: 'the Guild mailbox is not set up yet.' };
  const token = uuid();
  const ok = await postNow({ kind: 'contact', email: e, token, consent: true, source: 'game' });
  if (ok) { Save.load().guild = { token, ts: Date.now() }; Save.save(); }   // token only — never the email
  return { ok, error: ok ? null : 'could not reach the Guild — try again.' };
}

// Asks the server to delete the contact (by token) and clears the local flag.
export async function forgetGuild() {
  const g = Save.load().guild;
  if (g && g.token) { await postNow({ kind: 'forget', token: g.token }); }   // best-effort
  Save.load().guild = null;
  Save.save();
  return true;
}

export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}
