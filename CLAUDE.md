# Ari Catering website

Rebuild + redesign of https://www.aricatering.com (currently Wix): a Hebrew, RTL, SEO-first
marketing site for a live-fire meat catering business, hosted on Cloudflare Workers.

## Work from plan.md, step by step

[plan.md](plan.md) is the source of truth for what to build and in what order.

1. Before starting work, read plan.md and find the first unchecked `- [ ]` step in the current phase.
2. Work on **one step at a time**. Don't start the next step or jump ahead to a later phase
   unless the user asks.
3. When a step is finished **and verified** (`npm run verify` passes, and it has been checked in
   the preview where relevant), mark it done in plan.md: `- [ ]` → `- [x]`.
   Add a short indented note under it if something important was decided or changed.
4. If a step can't be finished (blocked, needs the user's accounts, or an open question for Ari),
   leave it unchecked and add a note saying why, instead of marking it done.
5. If the plan turns out to be wrong or incomplete, update plan.md, then tell the user what changed.
6. Commit only when the user asks.

## Commands

- `npm run dev`: dev server
- `npm run build`: production build into `dist/`
- `npm run preview`: serve the build locally in workerd (Cloudflare's runtime). Listens on
  `localhost` (IPv6), not `127.0.0.1`.
- `npm run verify`: format check, lint, `astro check`, build. Must pass before a step is marked done.
- `npm run format`: apply Prettier
- `npm run deploy`: build + `wrangler deploy`

## Stack and conventions

- Astro 7 (static pages + on-demand routes via `export const prerender = false`), Tailwind 4,
  React 19 only for interactive islands, `@astrojs/cloudflare` adapter.
- The site is **Hebrew and RTL**: `lang="he" dir="rtl"` is set in `src/layouts/BaseLayout.astro`.
  Use Tailwind logical utilities (`ms-*`, `pe-*`, `start-*`, `text-start`) instead of `ml-*`, `left-*`, etc.
- Business details (phone, email, address, socials, service areas) live only in `src/data/site.ts`.
  Never hard-code them in pages.
- Every page uses `BaseLayout` with a unique `title` (keyword, without the brand) and `description`.
  Titles are built by `formatTitle()` in `src/lib/seo.ts`.
- URLs follow the scheme in plan.md section 4: lowercase English, hyphenated, no trailing slash
  (`build.format: 'file'`, `trailingSlash: 'never'`). Off-site services live under `/catering/*`,
  experiences at the farm under `/matat/*`. Every old Wix URL and any URL that later changes
  needs a 301 in `public/_redirects`.
- Images go through `astro:assets` and are optimised at build time (`imageService: 'compile'`).
  Every image needs Hebrew alt text.
- Keep client JS minimal: prefer `.astro` components, and use React islands (`client:visible`)
  only where interactivity is needed.

## Astro docs

@AGENTS.md
