// The admin at /keystatic, where Ari edits content without touching code. Keystatic Cloud handles
// the login; each save is a commit to master, which Workers Builds deploys in about two minutes.
// Cloud mode runs in the browser, so the Worker only serves the admin page. (Local mode can't be
// used: it needs Node's file system, and `npm run dev` runs on-demand routes in workerd.)
import { collection, config, fields, singleton, type ComponentSchema } from '@keystatic/core';
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

// Shared fields for the hand-built pages (src/content/pages/<id>.yaml, read in content.config.ts).
const mdHelp = 'שורה ריקה מתחילה פסקה חדשה. קישור: [הטקסט](/menu). מודגש: **טקסט**.';
const longText = (label: string, description = mdHelp) =>
  fields.text({ label, description, multiline: true });
const line = (label: string, description?: string) => fields.text({ label, description });
const required = (label: string, description?: string) =>
  fields.text({ label, description, validation: { isRequired: true } });
const titledItems = (label: string) =>
  fields.array(
    fields.object({
      title: required('כותרת'),
      text: fields.text({ label: 'טקסט', multiline: true }),
    }),
    { label, itemLabel: (props) => props.fields.title.value },
  );
const hero = (id: string) => ({
  heroImage: fields.image({
    label: 'תמונה ראשית',
    description: 'התמונה הגדולה בראש הדף.',
    directory: `src/assets/images/pages/${id}`,
    publicPath: `../../assets/images/pages/${id}/`,
    validation: { isRequired: true },
  }),
  heroAlt: required(
    'תיאור התמונה הראשית',
    'משפט קצר שמתאר מה רואים בתמונה. גוגל וקוראי מסך משתמשים בו.',
  ),
  heroTitle: required('כותרת ראשית'),
  heroSubtitle: fields.text({
    label: 'כותרת משנה',
    multiline: true,
    validation: { isRequired: true },
  }),
});
const sections = fields.array(
  fields.object({
    heading: line('כותרת', 'אפשר להשאיר ריק.'),
    tone: fields.select({
      label: 'רקע',
      options: [
        { label: 'בהיר', value: 'light' },
        { label: 'חול', value: 'sand' },
        { label: 'כהה', value: 'dark' },
      ],
      defaultValue: 'light',
    }),
    text: fields.text({
      label: 'טקסט',
      description: mdHelp,
      multiline: true,
      validation: { isRequired: true },
    }),
  }),
  { label: 'חלקים בדף', itemLabel: (props) => props.fields.heading.value || '(בלי כותרת)' },
);
const pageSingleton = <S extends Record<string, ComponentSchema>>(
  id: string,
  label: string,
  schema: S,
) => singleton({ label, path: `src/content/pages/${id}`, format: { data: 'yaml' }, schema });

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
    home: pageSingleton('home', 'דף הבית', {
      ...hero('home'),
      heroEyebrow: line('שורה מעל הכותרת'),
      about: fields.object(
        {
          eyebrow: line('שורה מעל הכותרת'),
          heading: required('כותרת'),
          text: fields.text({
            label: 'טקסט',
            description: mdHelp,
            multiline: true,
            validation: { isRequired: true },
          }),
          moreHeading: line('כותרת ב"להמשך קריאה"'),
          moreText: longText('טקסט ב"להמשך קריאה"'),
        },
        { label: 'נעים להכיר' },
      ),
      services: fields.object(
        {
          heading: required('כותרת'),
          intro: line('משפט פתיחה'),
          more: fields.array(
            fields.object({
              label: required('כותרת'),
              text: fields.text({
                label: 'טקסט',
                description: mdHelp,
                multiline: true,
                validation: { isRequired: true },
              }),
            }),
            { label: 'הרחבות מתחת לכרטיסים', itemLabel: (props) => props.fields.label.value },
          ),
        },
        { label: 'מה אנחנו עושים' },
      ),
      steps: fields.object(
        {
          eyebrow: line('שורה מעל הכותרת'),
          heading: required('כותרת'),
          items: titledItems('שלבים'),
        },
        { label: 'איך זה עובד' },
      ),
      expertise: fields.object(
        {
          eyebrow: line('שורה מעל הכותרת'),
          heading: required('כותרת'),
          text: fields.text({
            label: 'טקסט',
            description: mdHelp,
            multiline: true,
            validation: { isRequired: true },
          }),
          moreText: longText('טקסט ב"להמשך קריאה"'),
        },
        { label: 'המומחיות שלי' },
      ),
      areas: fields.object(
        {
          eyebrow: line('שורה מעל הכותרת'),
          heading: required('כותרת'),
          text: fields.text({
            label: 'טקסט מעל רשימת האזורים',
            description: mdHelp,
            multiline: true,
            validation: { isRequired: true },
          }),
          closing: longText(
            'טקסט מתחת לרשימת האזורים',
            `${mdHelp} הטלפון והמייל מופיעים אחריו לבד.`,
          ),
        },
        { label: 'אזורי שירות' },
      ),
    }),
    about: pageSingleton('about', 'אודות', { ...hero('about'), sections }),
    menu: pageSingleton('menu', 'תפריט', {
      ...hero('menu'),
      sections,
      ctaHeading: required('כותרת בתחתית הדף'),
      ctaText: fields.text({
        label: 'טקסט בתחתית הדף',
        multiline: true,
        validation: { isRequired: true },
      }),
    }),
    catering: pageSingleton('catering', 'קייטרינג לאירועים', {
      ...hero('catering'),
      servicesHeading: required('כותרת מעל סוגי האירועים'),
      servicesIntro: fields.text({ label: 'משפט מתחת לכותרת', multiline: true }),
      areasEyebrow: line('שורה מעל כותרת האזורים'),
      areasHeading: required('כותרת אזורי שירות'),
      areasIntro: fields.text({ label: 'משפט מתחת לכותרת האזורים', multiline: true }),
    }),
    matat: pageSingleton('matat', 'חוויות במתת', {
      ...hero('matat'),
      heroEyebrow: line('שורה מעל הכותרת'),
      placeHeading: required('כותרת "המקום"'),
      placeIntro: fields.text({ label: 'טקסט על המקום', multiline: true }),
      produce: titledItems('כרטיסים: מה מגדלים ומייצרים'),
      servicesHeading: required('כותרת מעל החוויות'),
      ctaHeading: required('כותרת בתחתית הדף'),
      ctaText: fields.text({
        label: 'טקסט בתחתית הדף',
        multiline: true,
        validation: { isRequired: true },
      }),
    }),
    contact: pageSingleton('contact', 'יצירת קשר', {
      heroTitle: required('כותרת ראשית'),
      heroSubtitle: line('כותרת משנה'),
      channelsHeading: required('כותרת ליד הטופס'),
      whatsappText: required('טקסט ליד וואטסאפ'),
      phoneText: required('טקסט ליד הטלפון'),
      emailText: required('טקסט ליד המייל'),
      locationHeading: required('כותרת "איפה אנחנו"'),
      locationText: fields.text({ label: 'טקסט "איפה אנחנו"', multiline: true }),
    }),
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
