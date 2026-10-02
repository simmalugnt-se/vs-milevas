/**
 * Redirects expire at once instead of being served stale while they refresh: a visitor to an old
 * address right after a change must get the redirect, not a 404.
 */
export const REDIRECTS_CACHE_TAG = "redirects";
export const REDIRECTS_CACHE_PROFILE = { expire: 0 };
