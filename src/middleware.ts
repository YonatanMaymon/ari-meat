import { defineMiddleware } from 'astro:middleware';

// The admin page comes from @keystatic/astro, so its HTML can't be edited directly. Add the script
// that shrinks phone photos before Keystatic saves them (public/admin/shrink-photos.js).
export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const { pathname } = context.url;
  const isAdmin = pathname === '/keystatic' || pathname.startsWith('/keystatic/');
  if (!isAdmin || !response.headers.get('content-type')?.includes('text/html')) return response;

  const html = await response.text();
  const tag = '<script src="/admin/shrink-photos.js"></script>';
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  // The page has no <head>, so the tag goes right after the doctype, before Keystatic's own scripts.
  const withTag = html.replace(/^(<!doctype html>)?/i, `$1${tag}`);
  return new Response(withTag, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
