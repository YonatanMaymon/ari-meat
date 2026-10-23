# Search Console baseline (Wix site, before launch)

Google Search Console export for `https://www.aricatering.com/`, web search, last 16 months
(2025-06-22 to 2026-10-21), downloaded 2026-10-23. Converted from the original `.xlsx` to CSV
(column headers are Search Console's Hebrew ones: clicks, impressions, CTR, position).
Compare against this at 4 and 12 weeks after launch (plan.md Phase 7).

| File                           | Contents                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `daily.csv`                    | Clicks, impressions, CTR and average position per day                                |
| `queries.csv`                  | Top 573 queries                                                                      |
| `pages.csv`                    | Every URL with impressions, including old Wix URLs that are no longer in the sitemap |
| `countries.csv`, `devices.csv` | Breakdowns                                                                           |
| `filters.csv`                  | Export settings                                                                      |

## Key numbers

- **Total:** 385 clicks, 34,651 impressions, average position ~40.
- **Last 3 full months (Jul–Sep 2026):** 107 clicks, 4,929 impressions.
- **Clicks are almost all branded.** Of the clicks Google attributes to a query (39; the rest are
  anonymised), 28 are for the brand (ארי קייטרינג, ari catering, "ארי חווית בשר ייחודית ביקורות").
  The other 545 queries got 28,480 impressions and 11 clicks.
- **Target keywords show up but rank too low to be clicked**, e.g.
  קייטרינג לחתונה בטבע (3,052 impressions, position 25), קייטרינג בטבע (1,304, pos. 55),
  קייטרינג לאירועי חברה (1,060, pos. 36), קייטרינג בעמק יזרעאל (660, pos. 25),
  קייטרינג לאירועים בעמק יזרעאל (320, pos. 18). Regional demand (Jezreel Valley especially) is real,
  which supports the Phase 7 region landing pages idea.
- **Mobile converts, desktop doesn't:** mobile CTR 3.5% (270 clicks / 7,643 impressions) vs desktop
  0.4% (114 / 26,882).
- **The most-searched branded query is about reviews** (328 impressions), and the old `/reviews` page
  ranked at position 2. It now returns 404 on Wix. See `public/_redirects`.

## Old URLs found here (not in the Wix sitemap)

Status checked on 2026-10-23. All now have a 301 in `public/_redirects`.

| Old URL           | Impressions | Wix today               | New target                              |
| ----------------- | ----------- | ----------------------- | --------------------------------------- |
| `/about-3-2`      | 7,410       | 404                     | `/catering` (old page, content unknown) |
| `/גלרייה`         | 5,709       | 301 → `/gallery`        | `/gallery`                              |
| `/about-3`        | 5,049       | 301 → `/weddings`       | `/catering/weddings`                    |
| `/about-3-1`      | 1,608       | 301 → `/businessevents` | `/catering/corporate-events`            |
| `/ביקורות`        | 991         | 301 → `/reviews`        | `/` (testimonials)                      |
| `/reviews`        | 361         | 404                     | `/` (testimonials)                      |
| `/דרכי-התקשרות`   | 302         | 301 → `/contacts`       | `/contact`                              |
| `/service-page/*` | 126         | 404                     | `/catering`                             |
| `/event-list`     | 109         | 301 → `/blank`          | `/`                                     |
| `/booking`        | 31          | 404                     | `/contact`                              |
