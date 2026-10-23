# Content migration (raw export from Wix)

Raw copy of the current Wix site, exported on 2026-10-23 by `scripts/wix-export.py`.
It's the source material for Phase 3, not site content: nothing here is built or deployed.
Phase 3 rewrites the copy and copies the chosen photos into `src/assets/images/` with descriptive
names. Only those photos are committed; the rest of the images stay local.

| Path                             | What                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/<old-slug>.md`            | Page text in reading order. Frontmatter has the old URL, the new URL (plan.md §4), and the old title, description and H1 count.                      |
| `pages/_shared-header-footer.md` | Text that repeats on every page (footer service areas, contact details).                                                                             |
| `images/<page>-NN.jpg`           | **Not in git** (run the script). Every image on the site, numbered by the first page it appears on. Max 2560px, JPEG q85, EXIF (incl. GPS) stripped. |
| `images.csv`                     | Image index: file, Wix media id, old alt text, every page it's used on, original size.                                                               |

To get the images: `pip install beautifulsoup4 "pillow>=11.3"`, then `python3 scripts/wix-export.py`
from the repo root. It writes the web copies to `images/` (43 MB) and the full-size originals (66 files,
~270 MB, up to 8192px) to `.wix-cache/originals/`. Both folders are gitignored.

## Notes from the export

- **Two emails confirmed:** the footer shows `arielmaykab@gmail.com`, the homepage body
  `Aricatering1998@gmail.com` (confirmed: `arielmaykab@gmail.com` is the official one).
- **Service areas:** the footer list is more detailed than `src/data/site.ts` (e.g. קריות, זכרון יעקב,
  רעננה, מכבים-רעות). Reconcile when the service-areas section is built.
- **Meta descriptions:** five pages (about, menu, contacts, blank, llms) share one generic site-wide description, so in practice they have none of their own.
- **Alt text:** mostly camera file names (`IMG_8779.HEIC`, `1h2a8224_optimized.jpg`); the 9 gallery
  images have none. All new alt text gets written in Phase 3.
- **Duplicates:** 9 photos were uploaded twice under different Wix ids (matched by image hash):
  `about-02`/`privateevents-03`, `gallery-02`/`home-04`, `gallery-05`/`privateevents-05`,
  `home-02`/`priveteventinmatat-01`, `home-07`/`offsitematat-03`, `home-13`/`privateevents-02`,
  `markettables-03`/`weddings-02`, `menu-02`/`weddings-04`, `menu-03`/`weddings-03`.
- **Empty pages:** `gallery` (images only), `contacts` (one line + form), `blank` and `llms` have no real text.
- **Contact form fields:** first name, last name, phone, email, message.
