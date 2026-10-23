// Typed content collections. Service pages (/catering/*, /matat/*) are generated from these files.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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

export const collections = { services };
