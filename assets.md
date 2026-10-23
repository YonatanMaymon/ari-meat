# Assets needed from Ari

What we already have from the Wix site, and exactly what's still missing. Phase 3 (pages) can start
with what we have; the **must-have** items are needed before launch.

**How to send files:** original files from the camera/phone (HEIC is fine), via Google Drive or
WeTransfer. Not over WhatsApp: it compresses photos to ~1600px and strips quality.

---

## Already have (from the Wix site)

| Asset                    | Notes                                                                                                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All page text            | `content-migration/pages/`                                                                                                                                                                                                                                    |
| 57 photos (66 Wix files) | Full-size uploads, mostly 3000–8000px. Run `python3 scripts/wix-export.py` to download (not in git). Index: `content-migration/images.csv`. Covers dishes, cuts on the grill, guests at events, set tables, the view from Matat, the olive grove, the grills. |
| Logo                     | `content-migration/logo-wix.png`: black on transparent, 917×911px. Usable for the favicon, too small and too dark for the site header (see below).                                                                                                            |
| Phone, email, WhatsApp   | Confirmed: 052-8580775, arielmaykab@gmail.com                                                                                                                                                                                                                 |
| Address, service areas   | From the Wix footer                                                                                                                                                                                                                                           |
| Instagram                | https://www.instagram.com/_ari_catering_/                                                                                                                                                                                                                     |
| Search Console baseline  | `docs/gsc-baseline-2026-10-23/`                                                                                                                                                                                                                               |

What the Wix photos don't cover: 30 of the 57 are portrait (phone) shots and only 15 are landscape
and at least 2400px wide, which is what a full-width hero needs. Those 16 are mostly dishes and guests,
not the scenes each page needs (list below). No dessert photos, no team photo, and it's not clear
which person in the photos is Ari.

---

## Must-have (before launch)

### 1. Logo, in a usable format

- [ ] **Vector file** (SVG, AI, EPS or PDF) of the current logo (the grape leaf + "ארי" + "חווית בשר ייחודית").
      If there's no vector, a PNG at least 2000px wide.
- [ ] **Light version** (white or cream) for dark backgrounds. The site header and footer are charcoal,
      so the current black logo is invisible there.
- [ ] Or decide on a new logo instead (open question 5 in plan.md).

### 2. Hero photo for each page

Landscape, at least 2400px wide, with some calm area (sky, dark background, table) where the page title
can sit. One per page; the same photo can't be the hero on two pages.

| Page                                          | What the photo should show                                       | From Wix?                                                  |
| --------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Home `/`                                      | Live fire: asado on the cross / meat over open flames, wide shot | No wide fire shot (closest are portrait)                   |
| Catering hub `/catering`                      | A full outdoor event set up: tables, grills, guests              | Maybe `home-13` (set tables)                               |
| Weddings `/catering/weddings`                 | Outdoor wedding at sunset: long tables, string lights, the grill | `weddings-01` is guests, not a wedding scene               |
| Private events `/catering/private-events`     | A backyard meal: small group around a table, Ari grilling        | Maybe `privateevents-06`                                   |
| Corporate events `/catering/corporate-events` | A company event: a larger group, a meat station in action        | No                                                         |
| Market tables `/catering/market-tables`       | The full market table spread, from above or the side             | Maybe `home-09` / `home-14`                                |
| Matat hub `/matat`                            | The terrace/orchards in Matat with the view to the sea           | Portrait sunsets only (`home-02`, `priveteventinmatat-09`) |
| Private chef `/matat/private-chef`            | A set table on the terrace at dusk                               | No (`home-05` / `home-08` are guests, not the table)       |
| Team building `/matat/team-building`          | A group in the orchards / at a workshop                          | No                                                         |
| About `/about`                                | Ari at his grill (see 3)                                         | No                                                         |

### 3. Ari

- [ ] **2–3 portraits of Ari**: one close (head and shoulders), one at the fire / with the grills he built.
      Landscape and portrait versions.
- [ ] **Which person is Ari** in the existing photos (e.g. `home-01`, `about-04`, `privateevents-04`),
      so we can use the right ones and write correct alt text.

### 4. Kosher

The current site says "קייטרינג בשרי כשר", which can't go live without backing.

- [ ] Name of the kashrut supervision (השגחה) and a photo/scan of the certificate, **or**
- [ ] confirmation that it isn't certified (then we remove "כשר" or phrase it accurately, e.g. "kosher meat").

### 5. Testimonials

- [ ] **3–6 testimonials**, each with: the text, the client's name (or first name + last initial), event type,
      location and month/year. Screenshots of WhatsApp messages are fine as a source.
- [ ] Permission to publish each one with the name.
- [ ] Link to the Google Business Profile, if there is one (to show the rating and link to reviews).

### 6. Social profiles

- [ ] Facebook page URL
- [ ] TikTok URL
- [ ] Any other profile (YouTube, Google Business Profile)

---

## Nice to have

- [ ] **Short video** (5–15 seconds, landscape, sound not needed) of the fire / asado cross, for a muted
      looping hero on the homepage.
- [ ] **Past clients**: list of companies, and logos with permission to show them ("they trusted us").
- [ ] **Numbers** for the trust section: years in business, number of events, largest event (guests).
- [ ] **Team photo** (the crew in aprons at an event).
- [ ] **Menu photos per category**: starters, cuts, vegetarian/vegan, desserts (no dessert photos at all yet).
- [ ] **The grills and smokers he built**, photographed on their own (we have them in use: `about-02`,
      `markettables-01`).
- [ ] **Matat produce**: olive oil, wine, the vegetable garden, cherries/figs in season.
- [ ] Photos from **specific locations** (desert, beach, forest), to back the "anywhere in Israel" claim.

---

## Decisions (not files)

Open questions in plan.md section 8 that change what we build: price ranges or quote-only (6),
English version (8), who edits content after launch (9), and whether there are enough reviews for a
`/reviews` page (10).
