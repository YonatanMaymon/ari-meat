import type { APIRoute } from 'astro';

// Rendered on demand by the Worker (not prerendered). Confirms the server entry works
// and doubles as an uptime-check URL.
export const prerender = false;

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
