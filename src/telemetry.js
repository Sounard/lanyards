// Endpoint-agnostic capture: anonymous telemetry + conference suggestions +
// (consented) contacts. Make.com is OUT. Set ENDPOINT to any POST URL later
// (Cloudflare Worker recommended — see DATA_CAPTURE.md) and everything starts
// flowing. Until then, payloads are queued in localStorage so nothing is lost.
//
// Privacy: telemetry is anonymous (random clientId, no PII, cookieless) and
// honours the settings toggle. Contacts are explicit opt-in, email-only, and
// locally erasable (forgetContact()).

import * as Save from './save.js';

// e.g. 'https://api.lanyards.lol/collect' once the endpoint exists. Empty = queue only.
const ENDPOINT = '';
const QKEY = 'ld_capture_queue_v1';
const VERSION = '0.2';

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QKEY) || '[]'); } catch (e) { return []; }
}
function saveQueue(q) {
  try { localStorage.setItem(QKEY, JSON.stringify(q.slice(-200))); } catch (e) { /* full/private */ }
}

function enqueue(payload) {
  const q = loadQueue();
  q.push(Object.assign({ ts: Date.now(), v: VERSION }, payload));
  saveQueue(q);
  flush();
}

// best-effort, fire-and-forget; keeps unsent items queued
export function flush() {
  if (!ENDPOINT || typeof fetch === 'undefined') return;
  const q = loadQueue();
  if (!q.length) return;
  const batch = q.slice();
  // text/plain avoids a CORS preflight for simple serverless endpoints
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(batch), keepalive: true })
    .then(r => { if (r.ok) saveQueue(loadQueue().slice(batch.length)); })
    .catch(() => { /* stay queued, retry next event */ });
}

function telemetryOn() {
  return Save.load().settings.telemetry !== false;
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

export function submitContact(email) {
  const e = String(email || '').trim().slice(0, 120);
  if (!validEmail(e)) return false;
  Save.load().contact = { email: e, ts: Date.now() };
  Save.save();
  enqueue({ kind: 'contact', email: e, consent: true });   // PII: only sent with explicit opt-in upstream
  return true;
}

export function forgetContact() {
  Save.load().contact = null;
  Save.save();
}

export function validEmail(e) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
}

export function endpointConfigured() {
  return !!ENDPOINT;
}
