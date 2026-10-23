// Typed content collections. Service pages (/catering/*, /matat/*) are generated from these files.
// Ari edits gallery.yaml through the admin at /keystatic (keystatic.config.ts).
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { galleryCategories, type GalleryCategory } from './data/gallery';

const titledText = z.object({ title: z.string(), text: z.string() });

const services = defineCollection({
  // The file name is the URL slug: weddings.md → /catering/weddings.
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      /** catering: Ari comes to your event. matat: you come to Ari, at the farm in Matat. */
      group: z.enum(['catering', 'matat']),
      /** Position on the hub pages and the homepage. */
      order: z.number(),
      /** The page's <h1>. */
      title: z.string(),
      /** Keyword title for <title>, without the brand (formatTitle() adds it). */
      seoTitle: z.string(),
      description: z.string().max(155),
      /** Short name for breadcrumbs and links. */
      label: z.string(),
      /** One or two sentences for the service card. */
      summary: z.string(),
      /** Under the <h1> in the hero. */
      subtitle: z.string(),
      audience: z.array(z.string()),
      included: z.array(titledText),
      menu: z.array(z.object({ title: z.string(), items: z.array(z.string()) })).optional(),
      steps: z.array(titledText),
      faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
      /** Ids of related services, linked at the bottom of the page. */
      related: z.array(z.string()),
      /** Hero and card photo, relative to this file (src/assets/images/heroes/). */
      image: image(),
      /** Hebrew alt text for `image`. */
      imageAlt: z.string(),
    }),
});

const gallery = defineCollection({
  // One entry per photo, keyed by its position so the page keeps the order Ari chose.
  loader: file('src/content/gallery.yaml', {
    parser: (text) =>
      (parse(text) as { photos?: object[] }).photos?.map((photo, i) => ({
        id: String(i),
        ...photo,
      })) ?? [],
  }),
  schema: z.object({
    /**
     * Relative to gallery.yaml: ../assets/images/gallery/photos/<slug>/image.jpg. A plain string
     * rather than image(), so a photo in a format Astro can't optimise (an iPhone .heic) is skipped
     * by the gallery page instead of failing the build and blocking every later edit.
     */
    image: z.string(),
    /** Hebrew alt text (`name`), required so no photo goes live without it. `slug` names the folder. */
    alt: z.object({ name: z.string().trim().min(1), slug: z.string() }),
    category: z.enum(Object.keys(galleryCategories) as [GalleryCategory, ...GalleryCategory[]]),
  }),
});

export const collections = { services, gallery };
