// Typed content collections. Service pages (/catering/*, /matat/*) are generated from these files.
// Ari edits these, gallery.yaml and pages/*.yaml through the admin at /keystatic (keystatic.config.ts).
import { defineCollection, type SchemaContext } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse } from 'yaml';
import { galleryCategories, type GalleryCategory } from './data/gallery';
import { defaultFonts, fontLabels, type FontId } from './data/font-options';

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
      /** Hero and card photo, relative to this file: ../../assets/images/services/<slug>/image.jpg. */
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

// One YAML file per page (src/content/pages/<id>.yaml), each with its own fields. Text blocks are
// Markdown, rendered by components/Markdown.astro. SEO titles and descriptions stay in the pages.
const page = <T extends z.ZodRawShape>(id: string, shape: (helpers: SchemaContext) => T) =>
  defineCollection({
    loader: glob({ pattern: `${id}.yaml`, base: './src/content/pages' }),
    schema: (helpers) => z.object(shape(helpers)),
  });

const text = z.string().trim().min(1);
/** The admin leaves an emptied field out of the file. */
const optional = z.string().default('');
const hero = ({ image }: SchemaContext) => ({
  /** Relative to the YAML file: ../../assets/images/pages/<id>/heroImage.jpg. */
  heroImage: image(),
  heroAlt: text,
  heroTitle: text,
  heroSubtitle: text,
});
const sections = z.array(
  z.object({
    heading: optional,
    tone: z.enum(['light', 'sand', 'dark']),
    text,
  }),
);

const homePage = page('home', (h) => ({
  ...hero(h),
  heroEyebrow: optional,
  about: z.object({
    eyebrow: optional,
    heading: text,
    text,
    moreHeading: optional,
    moreText: optional,
  }),
  services: z.object({
    heading: text,
    intro: optional,
    more: z.array(z.object({ label: text, text })),
  }),
  steps: z.object({ eyebrow: optional, heading: text, items: z.array(titledText) }),
  expertise: z.object({ eyebrow: optional, heading: text, text, moreText: optional }),
  areas: z.object({ eyebrow: optional, heading: text, text, closing: optional }),
}));

const aboutPage = page('about', (h) => ({ ...hero(h), sections }));

const menuPage = page('menu', (h) => ({
  ...hero(h),
  sections,
  ctaHeading: text,
  ctaText: text,
}));

const cateringPage = page('catering', (h) => ({
  ...hero(h),
  servicesHeading: text,
  servicesIntro: optional,
  areasEyebrow: optional,
  areasHeading: text,
  areasIntro: optional,
}));

const matatPage = page('matat', (h) => ({
  ...hero(h),
  heroEyebrow: optional,
  placeHeading: text,
  placeIntro: optional,
  produce: z.array(titledText),
  servicesHeading: text,
  ctaHeading: text,
  ctaText: text,
}));

const contactPage = page('contact', () => ({
  heroTitle: text,
  heroSubtitle: optional,
  channelsHeading: text,
  whatsappText: text,
  phoneText: text,
  emailText: text,
  locationHeading: text,
  locationText: optional,
}));

// Site-wide design settings Ari picks in the admin (src/content/settings.yaml).
const fontId = z.enum(Object.keys(fontLabels) as [FontId, ...FontId[]]);
const settings = defineCollection({
  loader: glob({ pattern: 'settings.yaml', base: './src/content' }),
  schema: z.object({
    headingFont: fontId.default(defaultFonts.heading),
    bodyFont: fontId.default(defaultFonts.body),
  }),
});

export const collections = {
  services,
  settings,
  gallery,
  homePage,
  aboutPage,
  menuPage,
  cateringPage,
  matatPage,
  contactPage,
};
