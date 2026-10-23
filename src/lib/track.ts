// Counts contact actions: WhatsApp, phone and email clicks, and the quote form's WhatsApp button.
// Cloudflare Web Analytics counts page views but has no custom events, so these are posted to
// /api/event and stored in D1 (src/lib/db.ts). Quote submissions are counted by /api/quote itself.

export const trackedEvents = [
  'whatsapp_click',
  'phone_click',
  'email_click',
  'quote_whatsapp',
] as const;
export type TrackedEvent = (typeof trackedEvents)[number];

export const isTrackedEvent = (name: unknown): name is TrackedEvent =>
  trackedEvents.includes(name as TrackedEvent);

/** Fire and forget: sendBeacon survives the page navigating away (tel:, wa.me). */
export function track(name: TrackedEvent) {
  const body = new Blob([JSON.stringify({ name, path: location.pathname })], {
    type: 'application/json',
  });
  navigator.sendBeacon?.('/api/event', body);
}

/** Tracks every contact link on the page, including ones added later, with one listener. */
export function trackContactLinks() {
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest?.('a[href]');
    const href = link?.getAttribute('href') ?? '';
    if (link?.hasAttribute('data-track-skip')) return;
    if (href.startsWith('https://wa.me/')) track('whatsapp_click');
    else if (href.startsWith('tel:')) track('phone_click');
    else if (href.startsWith('mailto:')) track('email_click');
  });
}
