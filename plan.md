# Ari Catering — Rebuild & Redesign Plan

Rebuild of https://www.aricatering.com (currently Wix) as a fast, SEO-first, Hebrew/RTL site with a new visual identity, hosted on Cloudflare.

---

## 1. Audit of the current site (Oct 2026)

What's there today: a Hebrew-language meat catering site with 11 real pages. It covers chef Ari from Moshav Matat, live-fire cooking, Argentine + Galilean cuisine, and service across Israel.

| Page | Current URL | Notes |
|---|---|---|
| Home | `/` | 3× `<h1>` |
| **Duplicate home** | `/blank` | Wix leftover. No H1, no meta description, self-canonical, **listed in the sitemap**, so it competes with `/` |
| Outdoor weddings | `/weddings` | Best page: ~1,300 words, logistics, menu |
| Small events / private meals | `/privateevents` | |
| Business events | `/businessevents` | |
| Market tables & meat stations | `/markettables` | |
| Team-building days in the orchards | `/offsitematat` | Title mixes English ("off-site & retreat") |
| Private chef dinner in Matat | `/priveteventinmatat` | **Typo in slug** ("privet") |
| Menu | `/menu` | No meta description; prose, no structured list |
| About | `/about` | No meta description |
| Gallery | `/gallery` | No H1, no meta description, 9 images without alt text |
| Contact | `/contacts` | No H1; form: first/last name, phone, email, free text |
| `/llms` | in sitemap | Wix-generated LLM page |

### SEO problems found
1. **`<html lang="en">` on a Hebrew site.** Google and screen readers are told the content is English. This is probably the single biggest technical issue.
2. **Every title starts with the same brand phrase** ("ארי חווית בשר ייחודית | …"). The keyword the page should rank for comes last and is often cut off in results.
3. **Missing meta descriptions** on `/blank`, `/menu`, `/about`, `/gallery`.
4. **Broken heading structure**: 0 or 3 H1s on several pages.
5. **Heavy pages**: 1.1–1.3 MB of HTML per page *before* images/JS (Wix runtime + Instagram embed). Hurts Core Web Vitals, especially on mobile.
6. **Duplicate content**: `/blank` duplicates the homepage.
7. **No structured data** (no LocalBusiness / FAQ / Service schema).
8. **No FAQs, no testimonials/reviews.** These are missed ranking and trust signals.
9. **Inconsistent contact info**: two different email addresses (`arielmaykab@…` and `Aricatering1998@…`).
10. **Footer links to Wix's own social accounts** (template leftover).
11. Kosher: the homepage says "קייטרינג בשרי כשר", but no certification or supervision details appear anywhere.

### Design problems (summary)
Template look, weak hierarchy, walls of text, the same contact block repeated everywhere, an Instagram widget doing the job of a real gallery, and no clear primary call to action on mobile.

---

## 2. Tech stack decision

### Do we need Next.js? **No.**
This is a ~12-page brochure/marketing site. Content changes rarely, there are no user accounts, and the only dynamic part is a contact form. Next.js's strengths (server components, ISR, middleware, app-level data fetching) don't buy us anything here. On Cloudflare it also needs the OpenNext adapter running on Workers, which adds build complexity and edge cases.

A plain **React SPA (Vite) is worse**: content would render client-side, which is bad for SEO, the main problem we're solving.

### Recommendation: **Astro + Tailwind CSS, deployed to Cloudflare Workers (static assets)**

| | Astro | Next.js | React SPA |
|---|---|---|---|
| Output | Static HTML, zero JS by default | SSR/SSG + React runtime on every page | Client-rendered |
| SEO | Excellent | Excellent | Poor |
| JS shipped | Only for interactive "islands" | ~80–100 KB+ framework baseline | Everything |
| Cloudflare | First-party `@astrojs/cloudflare` adapter, or pure static | Via OpenNext adapter | Static |
| Uses React? | Yes, optional, as islands | Yes | Yes |
| Complexity for this site | Low | Medium | Low, but wrong tool |

**Why Astro fits:**
- Pages ship as plain HTML/CSS, so near-perfect Lighthouse scores are easy.
- **We can still write React components** where interactivity is needed (gallery lightbox, contact form, mobile menu) via `client:visible` / `client:load` islands. React skills carry over.
- **Content collections**: each service page is a Markdown/MDX file with typed frontmatter (title, description, hero image, FAQs). One `ServicePage` layout renders all six service pages, and the brother can edit copy without touching components.
- Built-in image optimization (`astro:assets`): AVIF/WebP, responsive `srcset`, width/height to prevent layout shift.
- Built-in sitemap (`@astrojs/sitemap`), RSS if we ever add a blog.

### Full stack
- **Framework**: Astro (latest) + TypeScript
- **Styling**: Tailwind CSS v4, using logical properties (`ms-*`, `pe-*`, `start-*`) so RTL works naturally
- **Interactive islands**: React (only where needed) or vanilla `<script>` for tiny bits
- **Fonts**: self-hosted via Fontsource (no Google Fonts request). Hebrew-capable candidates below.
- **Hosting**: Cloudflare Workers with static assets (Cloudflare's recommended path for new projects; Pages also works)
- **Contact form backend**: an Astro on-demand route / Worker endpoint →
  - spam protection with **Cloudflare Turnstile**
  - delivery via **Cloudflare Email Routing `send_email` binding** to the brother's verified inbox (free), or Resend as a fallback
  - optional: log submissions to **Cloudflare D1** so no lead is ever lost
- **Analytics**: Cloudflare Web Analytics (free, cookie-less, so no consent banner needed) + Google Search Console
- **CI/CD**: GitHub repo → Cloudflare Workers Builds (auto-deploy on push to `master`, preview URLs per branch)
- **Quality**: Prettier, ESLint, `astro check`, Lighthouse CI on PRs

---

## 3. Redesign direction

### Brand idea: **"Fire, earth & the Galilee"**
The story is strong and currently buried: a chef who builds his own grills and smokers, grows olives in Matat, and cooks Argentine-style asado over live fire. The design should feel **warm, smoky, rustic-premium**. Think high-end asado restaurant, not generic event catering.

### Visual language
- **Palette** (draft):
  - Charcoal `#1C1A17`: primary dark background
  - Ember `#C8552B`: primary accent / CTAs
  - Olive `#5E6B3A`: secondary (the orchards)
  - Ash/cream `#F3EDE3`: light sections
  - Smoke `#8A8278`: muted text
- **Typography** (Hebrew-first, all open source):
  - Display: *Frank Ruhl Libre* or *Suez One* (character, serif warmth)
  - Body: *Heebo* or *Assistant* (clean, highly legible Hebrew sans)
- **Photography-led**: full-bleed hero (photo or short muted loop of fire/asado cross), large imagery, real event photos. *This depends on getting original high-res photos from the brother.*
- Texture: subtle grain/charcoal textures, generous whitespace, short paragraphs, clear section rhythm.
- Dark/light alternating sections to break up long service pages.

### UX principles
- **Mobile-first.** Most traffic will be phones (WhatsApp culture).
- **Sticky bottom CTA bar on mobile**: [WhatsApp] [Call] [Get a quote].
- One clear primary action per page: **"Get a quote"** (form) with WhatsApp as the instant alternative.
- Replace repeated contact blocks with one strong closing CTA section + footer.
- Break long copy into scannable blocks: icons + short headings, "what's included" lists, a logistics timeline ("we arrive 5 hours before…").
- Show **social proof**: testimonials, logos of companies served, number of events.
- **Service areas** shown as a simple map/visual instead of four text lists on every page.

### Page templates
1. **Home**: hero → short intro to Ari → service cards (6) → "how it works" (3–4 steps) → featured dishes → gallery strip → testimonials → service areas → CTA
2. **Service page** (shared layout ×6): hero → who it's for → what's included → sample menu → logistics → gallery → FAQs → CTA
3. **Menu**: philosophy → categories (starters / cuts from the fire / from the earth: veg & vegan / desserts) as structured cards, with "every menu is built per event" messaging
4. **About**: Ari's story, the grills he builds, the orchards in Matat, values
5. **Gallery**: masonry grid, filterable by event type, lightbox, all with Hebrew alt text
6. **Contact**: short form + WhatsApp + phone + map of Matat

---

## 4. Information architecture & URLs

New, clean URL scheme: lowercase English, words separated by hyphens, no trailing slash. The
structure follows the two kinds of service:
- `/catering/*`: Ari comes to your event, anywhere in Israel
- `/matat/*`: you come to Ari, at the moshav and orchards in Matat

Every old Wix URL gets a **301** to its new home, so existing links and whatever ranking history
there is carry over. (Expect a few weeks of ranking movement after launch while Google re-crawls;
the current SEO is weak enough that the cleaner structure is worth it.)

| New URL | Page | Old Wix URL (301 →) |
|---|---|---|
| `/` | Home | `/`, `/blank` |
| `/catering` | Catering hub: overview of all off-site services *(new)* | n/a |
| `/catering/weddings` | Outdoor weddings | `/weddings` |
| `/catering/private-events` | Small events & private meals | `/privateevents` |
| `/catering/corporate-events` | Business & company events | `/businessevents` |
| `/catering/market-tables` | Market tables & meat stations | `/markettables` |
| `/matat` | Matat hub: the orchards, experiences at the farm *(new)* | n/a |
| `/matat/private-chef` | Private chef dinner & boutique events in Matat | `/priveteventinmatat` |
| `/matat/team-building` | Team-building days in the orchards | `/offsitematat` |
| `/menu` | Menu | `/menu` (unchanged) |
| `/about` | About Ari | `/about` (unchanged) |
| `/gallery` | Gallery | `/gallery` (unchanged) |
| `/contact` | Contact / get a quote | `/contacts` |
| `/thank-you` | Form success page (`noindex`) *(new)* | n/a |
| `/llms.txt` | LLM summary of the site | `/llms` |
| | *Older Wix URLs found in Search Console* | `/about-3` → weddings, `/about-3-1` → corporate-events, `/about-3-2` & `/service-page/*` → `/catering`, `/גלרייה` → `/gallery`, `/דרכי-התקשרות` & `/booking` → `/contact`, `/reviews`, `/ביקורות` & `/event-list` → `/` |
| `/404` | Branded 404 *(new)* | n/a |

Breadcrumbs (`בית › קייטרינג › חתונות בטבע`) come from this structure, both visible and as
`BreadcrumbList` JSON-LD.

Redirects live in `public/_redirects` (Cloudflare applies them before serving assets).

*Phase 2 option:* region landing pages (e.g. "קייטרינג בשרי בצפון", "…במרכז"). Only if each can have genuinely unique content, otherwise they become thin pages.

---

## 5. SEO plan

### Technical
- `<html lang="he" dir="rtl">` on every page
- Titles: **keyword first, brand last**, ≤ 60 chars, unique per page
  e.g. `קייטרינג לחתונה בטבע – בשרים על האש | ארי קייטרינג`
- Unique meta description per page (≤ 155 chars, with a call to action)
- Exactly one H1 per page, logical H2/H3 structure
- Self-referencing canonical, `www` vs apex unified with a 301 (pick one)
- Auto-generated `sitemap.xml` (via `@astrojs/sitemap`) + clean `robots.txt`
- Open Graph + Twitter cards with a per-page share image (good for WhatsApp link previews)
- Hebrew alt text on every image; descriptive file names
- Core Web Vitals targets: LCP < 2.0s, CLS < 0.05, INP < 200ms; Lighthouse ≥ 95 in all categories
- Preload the hero image and display font; no render-blocking third-party scripts

### Structured data (JSON-LD)
- `LocalBusiness` / `FoodEstablishment`: name, phone, address (Matat), geo, `areaServed` (North, Center, Shfela & Jerusalem, South), `sameAs` (Instagram, Facebook, TikTok)
- `Service` on each service page
- `FAQPage` on pages with FAQs
- `BreadcrumbList`
- `Menu` on the menu page (optional)

### Content
- Add an **FAQ section** to each service page (price range factors, minimum guests (15+), how far in advance to book, kosher, vegan options, what logistics are included, travel to remote locations)
- Add **testimonials** (ask brother for real ones; also pull Google reviews)
- Target keywords (Search Console baseline in `docs/gsc-baseline-2026-10-23/`: the main ones already get
  impressions but rank ~25–60, so no clicks yet): קייטרינג בשרי, קייטרינג לחתונה בטבע, קייטרינג לאירועים בצפון, עמדות בשר, שולחן שוק בשרי, ארוחת שף פרטית בצפון, קייטרינג לאירועי חברה, יום גיבוש בגליל, אסאדו לאירועים
- Internal linking between related services and the menu
- Tighten and rewrite copy: shorter paragraphs, each page focused on its own search intent

### Off-site (outside the codebase, but where most local SEO wins come from)
- **Google Business Profile**: claim/optimize, category "Caterer", photos, service areas, ask clients for reviews
- Consistent name/address/phone everywhere (fix the two-email issue)
- Listings on Israeli event directories (e.g. wedding/event vendor sites) with links back

---

## 6. Project structure

Current layout. Items marked *(planned)* are built in later phases.

```
ari-meat/
├─ assets.md                # what we still need from Ari (photos, logo, testimonials, …)
├─ content-migration/       # raw Wix export: page text, images.csv, logo (images themselves gitignored)
├─ docs/gsc-baseline-*/     # Search Console baseline before launch (CSV)
├─ scripts/wix-export.py    # re-downloads the Wix text + images
├─ public/
│  ├─ _redirects            # 301s from old Wix URLs (incl. the ones found in Search Console)
│  ├─ robots.txt
│  ├─ llms.txt              # (planned)
│  └─ favicon.svg
├─ src/
│  ├─ assets/images/        # photos used on the site; optimized at build time
│  ├─ components/
│  │  ├─ ui/Button.astro  ui/Icon.astro
│  │  ├─ Header.astro  Footer.astro  MobileCtaBar.astro
│  │  ├─ Hero.astro  Section.astro  ServiceCard.astro
│  │  ├─ FaqList.astro  Testimonial.astro  ServiceAreas.astro  StepList.astro  CtaSection.astro  Breadcrumbs.astro
│  │  ├─ Seo.astro          # title/meta/OG/canonical/JSON-LD
│  │  ├─ Gallery.tsx        # (planned) React island (lightbox, filter)
│  │  └─ QuoteForm.astro    # quote form + small enhancement script
│  ├─ content/
│  │  ├─ services/*.md      # weddings, private-events, …, private-chef, team-building (frontmatter: group catering|matat)
│  │  ├─ menu.md
│  │  └─ testimonials/*.md
│  ├─ content.config.ts     # typed schemas for collections
│  ├─ data/site.ts          # phone, email, address, socials, regions (single source of truth)
│  ├─ data/nav.ts           # header/footer navigation
│  ├─ lib/seo.ts            # formatTitle()
│  ├─ lib/url.ts            # publicPath(), isActive()
│  ├─ lib/quote.ts          # quote fields + validation (browser and server)
│  ├─ lib/db.ts  lib/track.ts  lib/config.ts   # D1 storage, click events, public service keys
│  ├─ layouts/BaseLayout.astro  ServiceLayout.astro
│  ├─ pages/
│  │  ├─ index.astro  404.astro  styleguide.astro + styleguide/hero.astro (internal, delete before launch)
│  │  ├─ menu.astro  about.astro  gallery.astro  contact.astro  thank-you.astro
│  │  ├─ catering/index.astro  catering/[service].astro   # hub + catering services
│  │  ├─ matat/index.astro     matat/[service].astro      # hub + Matat experiences
│  │  └─ api/health.ts  api/quote.ts (Turnstile, D1, email)  api/event.ts (click events)
│  └─ styles/global.css     # Tailwind + design tokens
├─ astro.config.mjs
├─ wrangler.jsonc
└─ plan.md
```

---

## 7. Phases & tasks

### Phase 0: Prep & assets (before coding)
- [ ] Get from brother: original high-res photos/videos, logo files (or decide on a new logo), testimonials, list of past clients, kosher certification details (if any)
  - Skipped for now. Exact list of what's needed (and what the Wix export already covers) in
    [assets.md](assets.md). Logo PNG downloaded to `content-migration/logo-wix.png`.
- [x] Decide the single official email + phone + WhatsApp number
  - Email `arielmaykab@gmail.com`, phone `052-8580775` (also the WhatsApp number). Already in `site.ts`.
- [ ] Find out where the domain is registered (Wix or external) and get access
  - Blocked: needs Ari's (or your) accounts, and the cloud workspace can't reach WHOIS/DNS.
    To find out: look up `aricatering.com` at https://lookup.icann.org (the "Registrar" field), and
    in the Wix dashboard check *Settings → Domains*. If it says "Purchased from Wix", it's
    registered through Wix (transfer out or point DNS at launch); otherwise, get a login for the
    named registrar. Also run `nslookup -type=NS aricatering.com` to see who hosts DNS today.
    Needed before Phase 6 (DNS move), not before coding. Open question 3 in section 8.
- [x] **Export a Search Console baseline**: current queries, impressions, top pages. Used to compare after launch. (If GSC isn't set up, set it up now on the Wix site.)
  - 16 months, saved as CSV in `docs/gsc-baseline-2026-10-23/` with a summary README.
    385 clicks / 34,651 impressions; nearly all clicks are branded, target keywords rank ~25–60.
  - Revealed 10 old Wix URLs not in the sitemap (`/about-3*`, `/reviews`, Hebrew URLs, …),
    two of them 404 on Wix today. All now 301 in `public/_redirects` (section 4 table updated).
- [x] Copy all current text content into Markdown (raw migration)
  - `scripts/wix-export.py` → `content-migration/pages/*.md` (13 pages, old title/description in
    frontmatter). Findings in `content-migration/README.md`: both emails confirmed live, footer
    service-area list is more detailed than `site.ts`, 5 pages share one generic description.
- [x] Download all current images from Wix (Wix has no clean export; do it manually or by script)
  - 66 images (57 distinct photos; 9 uploaded twice). Wix kept the full-size uploads (up to 8192px),
    so these may be good enough without separate originals from Ari.
  - Images are not in git: run `python3 scripts/wix-export.py` to get web copies in
    `content-migration/images/` (max 2560px, EXIF/GPS stripped) and full-size originals in
    `.wix-cache/`. `images.csv` (committed) indexes them. Phase 3 commits only the photos it uses.

### Phase 1: Project setup
- [x] `npm create astro@latest` (TypeScript strict), add Tailwind, React, sitemap, Cloudflare adapter
  - Astro 7 + Tailwind 4 + React 19 + `@astrojs/cloudflare` 14
  - `imageService: 'compile'` (Sharp at build time, no paid Images binding), `session: false` (no KV namespace)
  - `build.format: 'file'` + `trailingSlash: 'never'` so URLs have no trailing slash (`/catering/weddings`)
- [x] Prettier/ESLint, `astro check` (`npm run verify` runs all of them + build)
  - Needs Node ≥ 22.23.4 (Astro refuses to run on older versions)
  - `eslint-plugin-jsx-a11y` skipped: doesn't support ESLint 10 yet; accessibility covered by axe in Phase 5
- [x] Base skeleton: `BaseLayout` (`lang="he" dir="rtl"`, skip link), `Seo` component (title/description/canonical/OG), `src/data/site.ts`, draft palette tokens, placeholder home + 404, `/api/health` Worker endpoint
- [x] `public/_redirects` (all old Wix URLs → new URL scheme, see section 4) and `robots.txt`
- [x] Verified in local workerd preview: redirects return 301, `/page/` and `/page.html` redirect to `/page`, canonicals clean
- [x] Initial git commit (branch: `master`)
- [x] `formatTitle()` in `src/lib/seo.ts`: decide the title format (currently a placeholder)
  - `<keyword> | ארי קייטרינג`; homepage uses `HOME_TITLE` ("קייטרינג בשרי על האש")
  - If keyword + brand exceeds 60 chars, the brand is dropped so the keyword is never truncated
- [x] GitHub repo, push `master`, connect Cloudflare Workers Builds → preview deploys (needs your GitHub/Cloudflare accounts + `wrangler login`)
  - GitHub `YonatanMaymon/ari-meat`; Worker `ari-catering` on Ari's Cloudflare account
    (`arielmaykab@gmail.com`), live at https://ari-catering.ari-catering.workers.dev
  - Workers Builds: push to `master` → `npm run build` + `npx wrangler deploy`; any other branch →
    `npx wrangler versions upload`, served at `<branch>-ari-catering.ari-catering.workers.dev`.
    `.nvmrc` pins Node 22.23.4 for the build image. Build status shows as a GitHub check.
  - `preview_urls: true` in `wrangler.jsonc` is required (defaults to false). Canonicals point to
    www.aricatering.com, so the workers.dev copies don't compete in search.
  - Verified 2026-10-23: merge of PR #5 auto-deployed to production; branch
    `claude/phase1-preview-urls` served on its preview alias (unknown aliases 404).

### Phase 2: Design system
- [x] Moodboard + 2 design directions for the home hero → pick one with brother
  - Built from the Wix photos (`content-migration/`) without waiting for Ari's originals.
    Components were built on the plan's palette in the meantime; `/styleguide` shows them for review.
  - Moodboard + 2 directions done: `/styleguide/hero` (noindex, out of the sitemap). A: "fire at
    night", full-bleed dark photo. B: "the Galilee by day", light split layout with a portrait photo
    in an arch, which fits the mostly-portrait Wix photos. Photo areas are placeholders named after
    the Wix photo each would use (the Wix CDN isn't reachable from the cloud workspace).
  - **Chosen (2026-10-23): A, "fire at night"** for the home hero. Phase 3 builds it on the
    existing `Hero` component; until Ari sends a wide fire photo or short video (assets.md), it
    runs on the ember glow. B's arched portrait frame stays available for About.
- [x] Tokens in Tailwind theme (colors, fonts, spacing, radii)
  - Fonts: Frank Ruhl Libre (display) + Heebo (body), self-hosted via `@fontsource-variable`,
    Hebrew subsets preloaded
  - Added AA-safe shades: `ember-deep` (buttons/links on light), `ember-light` (on dark),
    `smoke-deep` (muted text on light). Plain ember/smoke fail 4.5:1 for small text on cream.
    Ratios documented in `global.css`. WhatsApp green darkened to `#0f7a41` for white text.
  - Utilities: `container-content`, `grain` (inline SVG noise), `py-(--spacing-section)`
- [x] Base components: Button, Section, Header (with mobile menu), Footer, MobileCtaBar, Hero, ServiceCard, FAQ, Testimonial
  - Mobile menu uses the Popover API (open/close, Escape, light dismiss with zero JS)
  - Nav lives in `src/data/nav.ts`; `Icon.astro` holds inline SVG icons
  - `/styleguide` (noindex, out of the sitemap) previews all components; delete before launch
- [x] RTL check on every component (icons that imply direction flipped, etc.)
  - Logical utilities throughout; `arrow` icon mirrors with `rtl:-scale-x-100`; phone numbers and
    email wrapped in `dir="ltr"`. Checked at 390px and 1280px: no horizontal scroll.

### Phase 3: Pages & content
- [x] `BaseLayout` + `Seo` component
  - BaseLayout renders Header, Footer, MobileCtaBar (body padded on phones so the bar never covers
    the footer) and a `head` slot
  - Seo adds `jsonLd` (escaped JSON-LD), `og:image:alt`, and a dev warning for descriptions over 155
    chars. No default share image yet (needs a photo from Ari).
- [x] Home
  - Hero direction A with the ember glow; sections: Ari, six service cards, how it works, dishes,
    service areas, closing CTA. Gallery strip and testimonials wait for photos/testimonials.
- [x] `ServiceLayout` + six service pages from content collection (`/catering/*`, `/matat/*`)
  - `src/content/services/*.md` (schema in `content.config.ts`): hero → intro → who it's for →
    what's included → sample menu → how it works → FAQs → related → CTA.
  - JSON-LD added already: `BreadcrumbList`, `Service`, `FAQPage` (`src/lib/schema.ts`).
- [x] `/catering` and `/matat` hub pages + breadcrumbs
  - Visible breadcrumbs in the hero (`Breadcrumbs.astro`) on every inner page, plus JSON-LD.
- [x] Menu, About, Gallery, Contact, Thank-you, 404
  - Contact lists WhatsApp, phone and email until the quote form lands in Phase 4.
  - Gallery reads `src/assets/images/gallery/`; alt text and category per photo in
    `src/data/gallery.ts` (the build fails without it). Empty for now, so it links to Instagram.
- [x] Copy rewrite pass (Hebrew), with FAQs per service page
  - Rewritten from `content-migration/pages/`: shorter, one intent per page, no invented facts
    (no prices, guest minimums or booking lead times). "כשר" left out until Ari confirms
    certification (assets.md 4). Price FAQs say "depends on guests, menu and location".
- [x] Photos: hero, service cards and gallery
  - From the Wix export (pushed once on the temporary `tmp/wix-photos` branch). 12 heroes in
    `src/assets/images/heroes/` (max 2560px), 41 gallery photos in `src/assets/images/gallery/`
    (max 1600px), EXIF stripped, descriptive file names, Hebrew alt text on every image.
  - Alt text doesn't name Ari: we still don't know which person in the photos he is (assets.md 3).

### Phase 4: Forms & integrations
- [x] Quote form fields: name, phone (required), email (optional), event type (select), date, guest count, region, message
  - `QuoteForm.astro` on `/contact` (an `.astro` form + small script, not a React island: no React
    runtime needed). Name, phone and event type are required. Service pages link to
    `/contact?service=<slug>#quote-form`, which preselects the event type.
- [x] Client + server validation, Turnstile, honeypot
  - One validator in `src/lib/quote.ts`, used by the browser and `/api/quote`; Hebrew inline
    errors. Phone accepts any common Israeli spelling (+972, dashes) or an international number.
  - Turnstile loads only when the form is near the screen. Dev uses Cloudflare's test keys
    (`.dev.vars.example`). Production keys: see the bindings step below.
  - Honeypot field `company_website`: bots get a fake success, nothing is stored or sent.
- [x] Email delivery to brother; optional D1 log; WhatsApp deep link with prefilled message as alternative
  - Every quote is saved to D1 first (tables `quotes`, `events`, created on first use by
    `src/lib/db.ts`), then emailed with the `send_email` binding (reply-to = client's email, plus a
    wa.me link to the client). If either works the client sees success.
  - Email can't actually send until aricatering.com is on Cloudflare with Email Routing (added to
    Phase 6). Until then leads are in D1: dashboard → D1 → the Worker's database → Explore data.
  - "או שלחו את הפרטים בוואטסאפ" builds a prefilled wa.me message from whatever is filled in.
  - Verified in the local workerd preview: D1 rows, email content, honeypot, invalid input (422).
    Turnstile's siteverify call can't be reached from the cloud workspace, so it was stubbed there.
- [ ] `wrangler.jsonc` bindings for Turnstile secret + email (and D1 if used) (moved here from Phase 1)
  - Done in code: `DB` (D1, created automatically by `wrangler deploy`, no id needed) and
    `QUOTE_EMAIL` (`send_email`, restricted to arielmaykab@gmail.com).
  - Turnstile widget created (2026-10-23); its site key is in `src/lib/config.ts`.
  - Waiting on yonatan: the secret key in the Worker as `TURNSTILE_SECRET_KEY` (dashboard → Workers
    → ari-catering → Settings → Variables and Secrets), then a test submit on the preview. Until
    then the deployed form refuses submissions (fails closed) and points people to WhatsApp.
- [ ] Cloudflare Web Analytics; track form submits / WhatsApp / call clicks as events
  - Events done: Web Analytics has no custom events, so `src/lib/track.ts` sends WhatsApp / phone /
    email clicks and the form's WhatsApp button to `/api/event` (D1 `events` table); `/api/quote`
    logs `quote_submit`.
  - Decided (2026-10-23): turn Web Analytics on after the DNS move (Phase 6), with Cloudflare's
    automatic setup for the zone, so no token is needed. Then drop `webAnalyticsToken`.

### Phase 5: SEO & QA
- [ ] JSON-LD on all pages, validated in Google Rich Results Test
- [ ] Titles/descriptions reviewed against keyword list
- [ ] `_redirects` for all old URLs; verify every old URL returns 200 or 301 (script it)
  - Rules done: 19, covering the Wix sitemap plus the old URLs found in Search Console. Checked by hand
    with curl in the local preview; the script is still to do.
- [ ] Lighthouse (mobile) ≥ 95, axe accessibility check, test on real iPhone + Android
- [ ] Cross-browser (Safari iOS especially for RTL + fonts)

### Phase 6: Launch
- [ ] Move DNS to Cloudflare (or point domain), attach custom domain to the Worker
- [ ] Unify `www`/apex with a 301
- [ ] Web Analytics: enable automatic setup for aricatering.com (dashboard → Web Analytics), remove
      `webAnalyticsToken` from `src/lib/config.ts`
- [ ] Email Routing on aricatering.com: enable it, add + verify arielmaykab@gmail.com as a destination,
      then send a test quote from the live form and check it arrives (Phase 4 email code is ready)
- [ ] Submit new sitemap in Search Console, request indexing of key pages
- [ ] Keep Wix live (unpublished, not cancelled) for ~2 weeks as a rollback
- [ ] Monitor GSC for 404s/coverage errors daily for the first 2 weeks
- [ ] Cancel Wix plan once stable
- [ ] Delete `/styleguide` and `/styleguide/hero` (internal previews)

### Phase 7: Post-launch growth
- [ ] Google Business Profile optimization + review requests after each event
- [ ] Compare GSC metrics vs baseline at 4 and 12 weeks
- [ ] Consider region landing pages / a small blog (e.g. "how to plan an outdoor wedding menu") if data shows demand
  - The baseline already shows regional demand: ~1,800 impressions for Jezreel Valley / north queries

---

## 8. Open questions for Ari
1. Is the catering **kosher-certified**? By whom? (Big decision factor for many clients. Show it prominently if yes.)
2. ~~Which email is the real one?~~ Answered: `arielmaykab@gmail.com`.
3. Domain registrar: bought through Wix or elsewhere?
4. Does he have original photos/videos (not Instagram-compressed)?
5. Keep the current logo or refresh it as part of the redesign?
6. Should we show **price ranges** or "starting from" (big conversion + SEO lever), or stay quote-only?
7. Any testimonials / notable clients we can feature?
8. Hebrew only, or also an English version (tourists, international weddings)? Astro i18n can add `/en` later, with `hreflang`.
9. Who will edit content after launch? (If Ari wants to self-edit, consider a Git-based CMS like Decap/Keystatic on top of the Markdown files.)
10. The old `/reviews` page ranked #2 and "ארי חווית בשר ייחודית ביקורות" is the top branded query.
    Does Ari have reviews to show? If yes, consider a dedicated `/reviews` page instead of redirecting it home.
