#!/usr/bin/env node
// SEO checks on the built pages in dist/client (plan.md Phase 5). Run after `npm run build`.
//
// Every page: one <title> (≤ 60 chars), a meta description (≤ 155 chars), a canonical, exactly
// one <h1>, lang="he" dir="rtl", alt text on every <img>. Indexable pages also need a unique title,
// description and canonical, and valid JSON-LD with the fields Google asks for per type.
//
// Usage: node scripts/check-seo.mjs [--verbose]

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'dist/client';
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;
const verbose = process.argv.includes('--verbose');

const decode = (s) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '_astro' ? [] : htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const meta = (html, attr, value) =>
  html.match(new RegExp(`<meta[^>]*${attr}="${value}"[^>]*content="([^"]*)"`))?.[1];

// Fields Google's rich-result docs require (or that Search Console flags as missing) per type.
const required = {
  BreadcrumbList: (d) =>
    d.itemListElement?.length > 0 &&
    d.itemListElement.every(
      (item, i, all) => item.position === i + 1 && item.name && (item.item || i === all.length - 1),
    ),
  FAQPage: (d) =>
    d.mainEntity?.length > 0 &&
    d.mainEntity.every((q) => q['@type'] === 'Question' && q.name && q.acceptedAnswer?.text),
  FoodEstablishment: (d) => d.name && d.address?.streetAddress && d.telephone && d.image && d.url,
  WebSite: (d) => d.name && d.url,
  Service: (d) => d.name && d.provider?.name && d.url,
  Menu: (d) => d.hasMenuSection?.every((s) => s.name && s.hasMenuItem?.every((i) => i.name)),
};

const problems = [];
const seen = { title: new Map(), description: new Map(), canonical: new Map() };
let pageCount = 0;

for (const file of htmlFiles(ROOT)) {
  const page = '/' + relative(ROOT, file).replace(/(index)?\.html$/, '');
  const html = readFileSync(file, 'utf8');
  const fail = (message) => problems.push(`${page}: ${message}`);
  pageCount++;

  const noindex = /<meta name="robots" content="noindex/.test(html);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const description = decode(meta(html, 'name', 'description') ?? '');
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? '';
  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;

  if (!/<html lang="he" dir="rtl"/.test(html)) fail('missing <html lang="he" dir="rtl">');
  if (!title) fail('no <title>');
  else if (title.length > TITLE_MAX) fail(`title is ${title.length} chars: ${title}`);
  if (!description) fail('no meta description');
  else if (description.length > DESCRIPTION_MAX) fail(`description is ${description.length} chars`);
  if (!canonical) fail('no canonical');
  else if (canonical.endsWith('/') && new URL(canonical).pathname !== '/')
    fail(`canonical has a trailing slash: ${canonical}`);
  if (h1s !== 1) fail(`${h1s} <h1> elements`);
  for (const img of html.match(/<img\b[^>]*>/g) ?? []) {
    const alt = img.match(/\balt="([^"]*)"/);
    // An empty alt is allowed only on images marked decorative.
    if (!alt || (!alt[1] && !/aria-hidden="true"/.test(img))) fail(`<img> without alt: ${img}`);
  }

  const types = [];
  for (const [, json] of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    let data;
    try {
      data = JSON.parse(json);
    } catch (error) {
      fail(`JSON-LD doesn't parse: ${error.message}`);
      continue;
    }
    for (const item of Array.isArray(data) ? data : [data]) {
      types.push(item['@type']);
      if (item['@context'] !== 'https://schema.org') fail(`${item['@type']} has no @context`);
      const check = required[item['@type']];
      if (!check) fail(`no check for JSON-LD type ${item['@type']}`);
      else if (!check(item)) fail(`${item['@type']} is missing required fields`);
    }
  }

  if (noindex) {
    if (verbose) console.log(`${page}  (noindex)`);
    continue;
  }
  if (types.length === 0) fail('indexable page without JSON-LD');
  for (const [key, value] of Object.entries({ title, description, canonical })) {
    if (!value) continue;
    if (seen[key].has(value)) fail(`same ${key} as ${seen[key].get(value)}`);
    else seen[key].set(value, page);
  }
  if (verbose) console.log(`${page}  [${types.join(', ')}]\n  ${title}\n  ${description}`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  console.error(`\n${problems.length} problem(s) in ${pageCount} pages.`);
  process.exit(1);
}
console.log(`SEO checks passed on ${pageCount} pages.`);
