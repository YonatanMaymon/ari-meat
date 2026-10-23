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
- Target keywords (validate with Search Console data): קייטרינג בשרי, קייטרינג לחתונה בטבע, קייטרינג לאירועים בצפון, עמדות בשר, שולחן שוק בשרי, ארוחת שף פרטית בצפון, קייטרינג לאירועי חברה, יום גיבוש בגליל, אסאדו לאירועים
- Internal linking between related services and the menu
- Tighten and rewrite copy: shorter paragraphs, each page focused on its own search intent

### Off-site (outside the codebase, but where most local SEO wins come from)
- **Google Business Profile**: claim/optimize, category "Caterer", photos, service areas, ask clients for reviews
- Consistent name/address/phone everywhere (fix the two-email issue)
- Listings on Israeli event directories (e.g. wedding/event vendor sites) with links back

---

## 6. Project structure (proposed)

```
ari-meat/
├─ public/
│  ├─ _redirects            # 301s from old Wix URLs
│  ├─ robots.txt
│  ├─ llms.txt
│  └─ favicon.svg
├─ src/
│  ├─ assets/images/        # originals; optimized at build time
│  ├─ components/
│  │  ├─ Header.astro  Footer.astro  MobileCtaBar.astro
│  │  ├─ Hero.astro  Section.astro  ServiceCard.astro
│  │  ├─ FaqList.astro  Testimonials.astro  ServiceAreas.astro
│  │  ├─ Seo.astro          # title/meta/OG/canonical/JSON-LD
│  │  ├─ Gallery.tsx        # React island (lightbox, filter)
│  │  └─ QuoteForm.tsx      # React island
│  ├─ content/
│  │  ├─ services/*.md      # weddings, private-events, …, private-chef, team-building (frontmatter: group catering|matat)
│  │  ├─ menu.md
│  │  └─ testimonials/*.md
│  ├─ content.config.ts     # typed schemas for collections
│  ├─ data/site.ts          # phone, email, address, socials, regions (single source of truth)
│  ├─ layouts/BaseLayout.astro  ServiceLayout.astro
│  ├─ pages/
│  │  ├─ index.astro  menu.astro  about.astro  gallery.astro  contact.astro
│  │  ├─ catering/index.astro  catering/[service].astro   # hub + catering services
│  │  ├─ matat/index.astro     matat/[service].astro      # hub + Matat experiences
│  │  ├─ thank-you.astro  404.astro
│  │  └─ api/quote.ts       # on-demand: Turnstile verify + send email
│  └─ styles/global.css     # Tailwind + design tokens
├─ astro.config.mjs
├─ wrangler.jsonc
└─ plan.md
```

---

## 7. Phases & tasks

### Phase 0: Prep & assets (before coding)
- [ ] Get from brother: original high-res photos/videos, logo files (or decide on a new logo), testimonials, list of past clients, kosher certification details (if any)
- [ ] Decide the single official email + phone + WhatsApp number
- [ ] Find out where the domain is registered (Wix or external) and get access
- [ ] **Export a Search Console baseline**: current queries, impressions, top pages. Used to compare after launch. (If GSC isn't set up, set it up now on the Wix site.)
- [ ] Copy all current text content into Markdown (raw migration)
- [ ] Download all current images from Wix (Wix has no clean export; do it manually or by script)

### Phase 1: Project setup
- [x] `npm create astro@latest` (TypeScript strict), add Tailwind, React, sitemap, Cloudflare adapter
  - Astro 7 + Tailwind 4 + React 19 + `@astrojs/cloudflare` 14
  - `imageService: 'compile'` (Sharp at build time, no paid Images binding), `session: false` (no KV namespace)
  - `build.format: 'file'` + `trailingSlash: 'never'` so URLs have no trailing slash (`/catering/weddings`)
- [x] Prettier/ESLint, `astro check` (`npm run verify` runs all of them + build)
  - `eslint-plugin-jsx-a11y` skipped: doesn't support ESLint 10 yet; accessibility covered by axe in Phase 5
- [x] Base skeleton: `BaseLayout` (`lang="he" dir="rtl"`, skip link), `Seo` component (title/description/canonical/OG), `src/data/site.ts`, draft palette tokens, placeholder home + 404, `/api/health` Worker endpoint
- [x] `public/_redirects` (all old Wix URLs → new URL scheme, see section 4) and `robots.txt`
- [x] Verified in local workerd preview: redirects return 301, `/page/` and `/page.html` redirect to `/page`, canonicals clean
- [x] Initial git commit (branch: `master`)
- [x] `formatTitle()` in `src/lib/seo.ts`: decide the title format (currently a placeholder)
  - `<keyword> | ארי קייטרינג`; homepage uses `HOME_TITLE` ("קייטרינג בשרי על האש")
  - If keyword + brand exceeds 60 chars, the brand is dropped so the keyword is never truncated
- [ ] GitHub repo, push `master`, connect Cloudflare Workers Builds → preview deploys (needs your GitHub/Cloudflare accounts + `wrangler login`)
  - GitHub part done: `YonatanMaymon/ari-meat`, `master` pushed.
  - First manual deploy done on Ari's Cloudflare account: https://ari-catering.ari-catering.workers.dev
    (home 200, `/api/health` 200, old Wix URLs 301). Still to do: connect Workers Builds in the dashboard.
- [ ] `wrangler.jsonc` bindings for Turnstile secret + email (and D1 if used): moved to Phase 4, when the form is built

### Phase 2: Design system
- [ ] Moodboard + 2 design directions for the home hero → pick one with brother
  - Blocked: needs Ari's original photos (Phase 0) and his input. Components were built on the
    plan's palette in the meantime; `/styleguide` shows them for that review.
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
- [ ] Home
- [ ] `ServiceLayout` + six service pages from content collection (`/catering/*`, `/matat/*`)
- [ ] `/catering` and `/matat` hub pages + breadcrumbs
- [ ] Menu, About, Gallery, Contact, Thank-you, 404
- [ ] Copy rewrite pass (Hebrew), with FAQs per service page

### Phase 4: Forms & integrations
- [ ] Quote form fields: name, phone (required), email (optional), event type (select), date, guest count, region, message
- [ ] Client + server validation, Turnstile, honeypot
- [ ] Email delivery to brother; optional D1 log; WhatsApp deep link with prefilled message as alternative
- [ ] Cloudflare Web Analytics; track form submits / WhatsApp / call clicks as events

### Phase 5: SEO & QA
- [ ] JSON-LD on all pages, validated in Google Rich Results Test
- [ ] Titles/descriptions reviewed against keyword list
- [ ] `_redirects` for all old URLs; verify every old URL returns 200 or 301 (script it)
- [ ] Lighthouse (mobile) ≥ 95, axe accessibility check, test on real iPhone + Android
- [ ] Cross-browser (Safari iOS especially for RTL + fonts)

### Phase 6: Launch
- [ ] Move DNS to Cloudflare (or point domain), attach custom domain to the Worker
- [ ] Unify `www`/apex with a 301
- [ ] Submit new sitemap in Search Console, request indexing of key pages
- [ ] Keep Wix live (unpublished, not cancelled) for ~2 weeks as a rollback
- [ ] Monitor GSC for 404s/coverage errors daily for the first 2 weeks
- [ ] Cancel Wix plan once stable
- [ ] Delete `/styleguide` (internal component preview)

### Phase 7: Post-launch growth
- [ ] Google Business Profile optimization + review requests after each event
- [ ] Compare GSC metrics vs baseline at 4 and 12 weeks
- [ ] Consider region landing pages / a small blog (e.g. "how to plan an outdoor wedding menu") if data shows demand

---

## 8. Open questions for Ari
1. Is the catering **kosher-certified**? By whom? (Big decision factor for many clients. Show it prominently if yes.)
2. Which email is the real one?
3. Domain registrar: bought through Wix or elsewhere?
4. Does he have original photos/videos (not Instagram-compressed)?
5. Keep the current logo or refresh it as part of the redesign?
6. Should we show **price ranges** or "starting from" (big conversion + SEO lever), or stay quote-only?
7. Any testimonials / notable clients we can feature?
8. Hebrew only, or also an English version (tourists, international weddings)? Astro i18n can add `/en` later, with `hreflang`.
9. Who will edit content after launch? (If Ari wants to self-edit, consider a Git-based CMS like Decap/Keystatic on top of the Markdown files.)
