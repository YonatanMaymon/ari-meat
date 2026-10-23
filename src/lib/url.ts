/**
 * The public path of the current page.
 *
 * With build.format 'file', prerendered pages see "/index.html" or "/catering/weddings.html" in
 * Astro.url. This strips that so it matches the URL visitors see ("/" and "/catering/weddings").
 */
export function publicPath(url: URL): string {
  return url.pathname.replace(/(\/index)?\.html$/, '').replace(/(.)\/$/, '$1') || '/';
}

/** True if `href` is the current page or one of its ancestors (for nav highlighting). */
export function isActive(href: string, currentPath: string): boolean {
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}
