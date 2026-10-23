#!/usr/bin/env node
// Checks the old Wix URLs and the sitemap against a running copy of the site (plan.md Phase 5).
//
// - Every rule in public/_redirects answers 301 to its target, and the target answers 200.
//   Splat rules (/service-page/*) are tested with a sample path.
// - Every URL in the sitemap answers 200, and its "/page/" and "/page.html" spellings redirect to
//   it. Cloudflare's html_handling sends those with 307, which is fine: nothing links to them, and
//   the canonical tag names the clean URL.
//
// Usage: node scripts/check-redirects.mjs [base-url]
//   base-url defaults to http://localhost:4321 (`npm run preview`, which listens on IPv6
//   localhost). Pass a preview or production URL to check a deployed copy.

import { readFileSync } from 'node:fs';

const base = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const SPLAT_SAMPLE = 'full-package';

const problems = [];
let checks = 0;

/** `status` is one code, or a list of acceptable codes. */
async function expect(path, status, location) {
  checks++;
  let res;
  try {
    res = await fetch(base + path, { redirect: 'manual' });
  } catch (error) {
    problems.push(`${path}: request failed (${error.cause?.code ?? error.message})`);
    return;
  }
  const got = res.headers.get('location');
  // Location can be relative or absolute; compare the path only.
  const gotPath = got ? new URL(got, base).pathname : null;
  const statuses = [status].flat();
  if (!statuses.includes(res.status)) {
    problems.push(
      `${path}: expected ${statuses.join(' or ')}, got ${res.status}${got ? ` → ${got}` : ''}`,
    );
  } else if (location && gotPath !== location) {
    problems.push(`${path}: redirects to ${got}, expected ${location}`);
  }
}

const rules = readFileSync('public/_redirects', 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => {
    const [from, to, status] = line.split(/\s+/);
    return { from: from.replace('*', SPLAT_SAMPLE), to, status: Number(status) };
  });

for (const rule of rules) await expect(rule.from, rule.status, rule.to);
for (const target of new Set(rules.map((rule) => rule.to))) await expect(target, 200);

const sitemapIndex = await (await fetch(`${base}/sitemap-index.xml`)).text();
const pages = [];
for (const [, loc] of sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = await (await fetch(base + new URL(loc).pathname)).text();
  for (const [, url] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) pages.push(new URL(url).pathname);
}
if (pages.length === 0) problems.push('sitemap has no URLs');

for (const page of pages) {
  await expect(page, 200);
  if (page !== '/') {
    await expect(`${page}/`, [301, 307, 308], page);
    await expect(`${page}.html`, [301, 307, 308], page);
  }
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} of ${checks} checks failed against ${base}.`);
  process.exit(1);
}
console.log(
  `All ${checks} checks passed against ${base}: ${rules.length} redirects, ${pages.length} sitemap pages.`,
);
