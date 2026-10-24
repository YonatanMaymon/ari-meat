// Public keys for third-party services. None of these are secrets: they end up in the HTML.
// Secrets (TURNSTILE_SECRET_KEY, GOOGLE_PLACES_API_KEY) live in the Worker's settings, and locally in .dev.vars.

// Cloudflare's always-pass test key, used in dev and until the real widget exists.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA';

/** Cloudflare dashboard → Turnstile → "Ari Catering quote form" → Site key. */
const TURNSTILE_PRODUCTION_SITE_KEY = '0x4AAAAAAFixcKOEblwz5jiC';

export const turnstileSiteKey =
  import.meta.env.DEV || !TURNSTILE_PRODUCTION_SITE_KEY
    ? TURNSTILE_TEST_SITE_KEY
    : TURNSTILE_PRODUCTION_SITE_KEY;

/** Cloudflare dashboard → Web Analytics → site → "Manage site" → token in the JS snippet. Empty: no beacon. */
export const webAnalyticsToken = '';

/** Sender of the quote emails. Must be on a domain with Cloudflare Email Routing enabled. */
export const quoteEmailFrom = { name: 'אתר ארי קייטרינג', email: 'website@aricatering.com' };

/**
 * Google Business Profile of Ari Catering, for the reviews section (src/lib/reviews.ts). Not a
 * secret. Find it at https://developers.google.com/maps/documentation/places/web-service/place-id
 * Empty: no reviews section. The API key is the GOOGLE_PLACES_API_KEY secret.
 */
export const googlePlaceId = '';
