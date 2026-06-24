// Tiny client-side router for clean deep-link paths (e.g. /on-the-sauna).
// No framework — just reads/writes location.pathname. V1 does NOT gatekeep:
// a valid level slug loads that level regardless of unlock state; a mistyped or
// unknown slug falls through to the level-select menu.

import { CONFERENCES } from './data/conferences.js';

// "/on-the-sauna/" -> "on-the-sauna" ; "/" -> ""
export function currentSlug() {
  const p = (typeof location !== 'undefined' ? location.pathname : '/');
  const s = p.replace(/^\/+|\/+$/g, '');
  try { return decodeURIComponent(s).toLowerCase(); } catch (e) { return s.toLowerCase(); }
}

// A conference that is actually playable (has a built scene). null otherwise.
export function levelForSlug(slug) {
  if (!slug) return null;
  return CONFERENCES.find(c => c.id === slug && c.playable && c.scene) || null;
}

// Reflect navigation in the address bar so the URL is shareable.
export function setUrl(slug) {
  try {
    const path = slug ? '/' + slug : '/';
    if (location.pathname !== path) history.pushState({ slug: slug || '' }, '', path);
  } catch (e) { /* non-browser / blocked */ }
}
