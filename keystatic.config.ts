// The admin at /keystatic, where Ari edits content without touching code. Keystatic Cloud handles
// the login; each save is a commit to master, which Workers Builds deploys in about two minutes.
// Cloud mode runs in the browser, so the Worker only serves the admin page. (Local mode can't be
// used: it needs Node's file system, and `npm run dev` runs on-demand routes in workerd.)
import { config, fields, singleton } from '@keystatic/core';
import { galleryCategories } from './src/data/gallery';

// Hebrew to Latin letters, for file names made from the Hebrew description.
const latin: Record<string, string> = Object.fromEntries(
  'אa בb גg דd הh וv זz חh טt יy כk ךk לl מm םm נn ןn סs עa פp ףf צtz ץtz קk רr שsh תt'
    .split(' ')
    .map((pair) => [pair[0], pair.slice(1)]),
);

function slugify(text: string) {
  return [...text.toLowerCase()]
    .map((char) => latin[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export default config({
  storage: { kind: 'cloud' },
  // TODO: the Keystatic Cloud project, "<team>/<project>" (keystatic.cloud).
  cloud: { project: 'ari-catering/ari-catering' },
  ui: {
    brand: { name: 'ארי קייטרינג' },
  },
  singletons: {
    gallery: singleton({
      label: 'גלריה',
      // Read by the `gallery` collection in src/content.config.ts.
      path: 'src/content/gallery',
      format: { data: 'yaml' },
      schema: {
        photos: fields.array(
          fields.object({
            image: fields.image({
              label: 'תמונה',
              directory: 'src/assets/images/gallery',
              publicPath: '../assets/images/gallery/',
              validation: { isRequired: true },
            }),
            alt: fields.slug({
              name: {
                label: 'תיאור התמונה',
                description:
                  'משפט קצר שמתאר מה רואים בתמונה. גוגל וקוראי מסך משתמשים בו, למשל: "שף פורס סטייק על קרש עץ באירוע ערב".',
                validation: { isRequired: true },
              },
              slug: {
                label: 'שם הקובץ',
                description: 'נוצר לבד מהתיאור, אין צורך לשנות.',
                generate: slugify,
              },
            }),
            category: fields.select({
              label: 'קטגוריה',
              options: Object.entries(galleryCategories).map(([value, label]) => ({
                value,
                label,
              })),
              defaultValue: 'events',
            }),
          }),
          {
            label: 'תמונות',
            description: 'התמונות מוצגות בגלריה בסדר הזה. גררו כדי לשנות את הסדר.',
            // Uploaded files are stored as gallery/photos/<file name>/image.jpg. Without a slug field
            // Keystatic names them by position, so adding a photo would rename every file after it.
            slugField: 'alt',
            itemLabel: (props) => props.fields.alt.value.name || 'תמונה חדשה',
          },
        ),
      },
    }),
  },
});
