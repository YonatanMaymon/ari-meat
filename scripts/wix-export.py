#!/usr/bin/env python3
"""Raw content export from the current Wix site (plan.md Phase 0).

Fetches every page in the Wix sitemap and writes:
  content-migration/pages/<old-slug>.md   page text as Markdown, with the old title/description
  content-migration/images/<page>-NN.jpg  web copies of every image (max 2560px, EXIF stripped)
  content-migration/images.csv            image index: file, Wix id, old alt text, pages, original size
  content-migration/logo-wix.png          the logo (Wix uses it as favicon and share image)

Images except the logo are gitignored (web copies and the ~270 MB of full-size originals in the cache directory).
Re-running skips anything already in the cache.

Requires: Python 3.10+, beautifulsoup4, Pillow (with AVIF support).
Usage:    python3 scripts/wix-export.py [--cache .wix-cache] [--out content-migration]
"""

import argparse
import csv
import json
import re
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image, ImageOps

ORIGIN = 'https://www.aricatering.com'
MEDIA = 'https://static.wixstatic.com/media/'
MAX_EDGE = 2560
MEDIA_RE = re.compile(r'https://static\.wixstatic\.com/media/([^/"?\s]+)')

# Old Wix slug -> new URL (plan.md section 4). Also fixes the order images are numbered in.
NEW_URL = {
    'home': '/',
    'weddings': '/catering/weddings',
    'privateevents': '/catering/private-events',
    'businessevents': '/catering/corporate-events',
    'markettables': '/catering/market-tables',
    'priveteventinmatat': '/matat/private-chef',
    'offsitematat': '/matat/team-building',
    'menu': '/menu',
    'about': '/about',
    'gallery': '/gallery',
    'contacts': '/contact',
    'blank': '/ (duplicate of home)',
    'llms': '/llms.txt',
}


def fetch(url: str, dest: Path) -> Path:
    if not dest.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        req = urllib.request.Request(url, headers={'User-Agent': 'ari-catering-migration'})
        with urllib.request.urlopen(req, timeout=120) as res:
            dest.write_bytes(res.read())
    return dest


def clean(text: str) -> str:
    # Wix text has zero-width spaces and the odd stray control character mid-word.
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    return ' '.join(text.replace('\u200b', ' ').split())


def text_blocks(root) -> list[str]:
    """Wix rich-text elements -> Markdown headings, paragraphs and list items, in page order."""
    lines: list[str] = []
    for rt in root.select('[data-testid="richTextElement"]'):
        for el in rt.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li']):
            if el.name == 'p' and el.find_parent('li'):
                continue
            text = clean(el.get_text(' ', strip=True))
            if not text:
                continue
            if el.name.startswith('h'):
                lines.append(f"{'#' * int(el.name[1])} {text}")
            elif el.name == 'li':
                lines.append(f'- {text}')
            else:
                lines.append(text)
        lines.append('')
    return lines


def collapse(lines: list[str]) -> str:
    return re.sub(r'\n{3,}', '\n\n', '\n'.join(lines)).strip() + '\n'


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('--cache', type=Path, default=Path('.wix-cache'))
    parser.add_argument('--out', type=Path, default=Path('content-migration'))
    args = parser.parse_args()

    sitemap = fetch(f'{ORIGIN}/pages-sitemap.xml', args.cache / 'pages-sitemap.xml').read_text()
    slugs = [
        u.removeprefix(ORIGIN).strip('/') or 'home'
        for u in re.findall(r'<loc>([^<]+)</loc>', sitemap)
        if u.startswith(ORIGIN)
    ]
    slugs.sort(key=lambda s: list(NEW_URL).index(s) if s in NEW_URL else len(NEW_URL))

    pages_dir, images_dir = args.out / 'pages', args.out / 'images'
    pages_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    images: dict[str, dict] = {}  # Wix media id -> row for images.csv
    shared: list[str] | None = None
    logo_id: str | None = None

    for slug in slugs:
        url = ORIGIN if slug == 'home' else f'{ORIGIN}/{slug}'
        html = fetch(url, args.cache / 'html' / f'{slug}.html').read_text(encoding='utf-8')
        soup = BeautifulSoup(html, 'html.parser')
        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()

        title = soup.title.get_text(strip=True) if soup.title else ''
        icon = soup.find('link', rel='apple-touch-icon')
        if logo_id is None and icon and (m := MEDIA_RE.search(icon['href'].replace('%7E', '~'))):
            logo_id = m.group(1)
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        desc = clean(desc_tag['content']) if desc_tag else ''

        # Header and footer repeat on every page: export them once, then drop them.
        header, footer = soup.find(id='SITE_HEADER'), soup.find(id='SITE_FOOTER')
        if shared is None:
            shared = ['# Shared header & footer (every page)', '', '## Header', '']
            shared += text_blocks(header) if header else []
            shared += ['## Footer', ''] + (text_blocks(footer) if footer else [])
        for part in (header, footer):
            if part:
                part.decompose()
        body = soup.body

        page_images: list[str] = []
        for img in body.find_all('img'):
            m = MEDIA_RE.search(img.get('src') or '')
            if not m:
                continue
            media_id = m.group(1)
            if media_id not in images:
                n = sum(1 for r in images.values() if r['first_page'] == slug) + 1
                images[media_id] = {
                    'file': f'{slug}-{n:02d}.jpg',
                    'wix_id': media_id,
                    'old_alt': (img.get('alt') or '').strip(),
                    'pages': [],
                    'first_page': slug,
                }
            row = images[media_id]
            if slug not in row['pages']:
                row['pages'].append(slug)
                page_images.append(row['file'])

        fields = [
            (i.get('aria-label') or i.get('placeholder') or i.get('name') or '').strip()
            for i in body.find_all(['input', 'textarea', 'select'])
            if i.get('type') not in ('hidden', 'submit')
        ]

        md = [
            '---',
            f'old_url: {url}',
            f'new_url: {NEW_URL.get(slug, "?")}',
            f'old_title: {json.dumps(title, ensure_ascii=False)}',
            f'old_description: {json.dumps(desc, ensure_ascii=False)}',
            f'old_h1_count: {len(body.find_all("h1"))}',
            '---',
            '',
        ] + text_blocks(body)
        if any(fields):
            md += ['## [Form fields]', ''] + [f'- {f}' for f in fields if f] + ['']
        if page_images:
            md += ['## [Images on this page]', ''] + [f'- images/{f}' for f in page_images]
        (pages_dir / f'{slug}.md').write_text(collapse(md), encoding='utf-8')

    (pages_dir / '_shared-header-footer.md').write_text(collapse(shared or []), encoding='utf-8')

    if logo_id:
        logo = fetch(MEDIA + logo_id, args.cache / 'originals' / logo_id)
        (args.out / 'logo-wix.png').write_bytes(logo.read_bytes())

    for row in images.values():
        original = fetch(MEDIA + row['wix_id'], args.cache / 'originals' / row['wix_id'])
        with Image.open(original) as im:
            row['original_size'] = f'{im.width}x{im.height}'
            web = images_dir / row['file']
            if not web.exists():
                im = ImageOps.exif_transpose(im).convert('RGB')
                im.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
                # No exif= argument: drops camera metadata, including any GPS location.
                im.save(web, 'JPEG', quality=85, optimize=True, progressive=True)

    with (args.out / 'images.csv').open('w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerow(['file', 'wix_id', 'old_alt', 'pages', 'original_size'])
        for row in images.values():
            writer.writerow([row['file'], row['wix_id'], row['old_alt'],
                             ' '.join(row['pages']), row['original_size']])

    print(f'{len(slugs)} pages, {len(images)} images -> {args.out}/')


if __name__ == '__main__':
    main()
