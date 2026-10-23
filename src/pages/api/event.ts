import type { APIRoute } from 'astro';
import { saveEvent } from '../../lib/db';
import { isTrackedEvent } from '../../lib/track';

// Stores the click events sent by src/lib/track.ts.
export const prerender = false;

export const POST: APIRoute = async ({ request, url, locals }) => {
  // Only from our own pages. Browsers always send Origin on a cross-site POST.
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return new Response(null, { status: 403 });

  let body: { name?: unknown; path?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const { name, path } = body;
  if (!isTrackedEvent(name)) {
    return new Response(null, { status: 400 });
  }

  locals.cfContext.waitUntil(
    saveEvent(name, typeof path === 'string' ? path.slice(0, 200) : null).catch((error: unknown) =>
      console.error('event: saving failed', error),
    ),
  );
  return new Response(null, { status: 204 });
};
