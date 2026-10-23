// The admin at /keystatic, where Ari edits content without touching code. Keystatic Cloud handles
// the login; each save is a commit to master, which Workers Builds deploys in about two minutes.
// Cloud mode runs in the browser, so the Worker only serves the admin page. (Local mode can't be
// used: it needs Node's file system, and `npm run dev` runs on-demand routes in workerd.)
import { collection, config, fields, singleton } from '@keystatic/core';
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
  // keystatic.cloud: team "ari-cataring", project "ari-meat". Editors are invited to the team.
  cloud: { project: 'ari-cataring/ari-meat' },
  ui: {
    brand: { name: 'ארי קייטרינג' },
  },
  collections: {
    services: collection({
      label: 'דפי שירות',
      // The file name is the page's URL (weddings.md → /catering/weddings), so it must not change.
      path: 'src/content/services/*',
      slugField: 'title',
      format: { contentField: 'body' },
      entryLayout: 'content',
      columns: ['label'],
      schema: {
        // Fields that only matter for the site's structure and SEO stay in the file but are hidden
        // from Ari (an ignored field is written back unchanged).
        group: fields.ignored(),
        order: fields.ignored(),
        title: fields.slug({
          name: { label: 'כותרת ראשית', validation: { isRequired: true } },
          slug: {
            label: 'כתובת הדף',
            description: 'חלק מכתובת הדף באתר. לא לשנות: שינוי ישבור קישורים ויפגע בגוגל.',
          },
        }),
        seoTitle: fields.ignored(),
        description: fields.ignored(),
        label: fields.text({
          label: 'שם קצר',
          description: 'מופיע בתפריטים ובקישורים לדף.',
          validation: { isRequired: true },
        }),
        summary: fields.text({
          label: 'תקציר',
          description: 'משפט או שניים לכרטיס של השירות בדף הבית.',
          multiline: true,
          validation: { isRequired: true },
        }),
        subtitle: fields.text({
          label: 'כותרת משנה',
          description: 'מופיעה מתחת לכותרת הראשית, על התמונה.',
          multiline: true,
          validation: { isRequired: true },
        }),
        steps: fields.array(
          fields.object({
            title: fields.text({ label: 'כותרת', validation: { isRequired: true } }),
            text: fields.text({ label: 'טקסט', multiline: true, validation: { isRequired: true } }),
          }),
          { label: 'איך זה עובד (שלבים)', itemLabel: (props) => props.fields.title.value },
        ),
        faqs: fields.array(
          fields.object({
            question: fields.text({ label: 'שאלה', validation: { isRequired: true } }),
            answer: fields.text({
              label: 'תשובה',
              multiline: true,
              validation: { isRequired: true },
            }),
          }),
          { label: 'שאלות נפוצות', itemLabel: (props) => props.fields.question.value },
        ),
        image: fields.image({
          label: 'תמונה ראשית',
          description: 'התמונה הגדולה בראש הדף, וגם בכרטיס של השירות.',
          directory: 'src/assets/images/services',
          publicPath: '../../assets/images/services/',
          validation: { isRequired: true },
        }),
        imageAlt: fields.text({
          label: 'תיאור התמונה הראשית',
          description: 'משפט קצר שמתאר מה רואים בתמונה. גוגל וקוראי מסך משתמשים בו.',
          validation: { isRequired: true },
        }),
        related: fields.ignored(),
        body: fields.markdoc({ label: 'תוכן הדף', extension: 'md' }),
      },
    }),
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
