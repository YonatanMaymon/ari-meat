// Single source of truth for business details (NAP: name, address, phone).
// Every page, the footer and the JSON-LD read from here, so they can never disagree.

const phoneE164 = '+972528580775';

export const site = {
  name: 'ארי קייטרינג',
  tagline: 'חווית בשר ייחודית',
  url: 'https://www.aricatering.com',
  locale: 'he_IL',

  phone: {
    display: '052-8580775',
    href: `tel:${phoneE164}`,
  },
  whatsapp: {
    href: `https://wa.me/${phoneE164.slice(1)}`,
  },
  // TODO(open question): the Wix site shows two addresses (this one and Aricatering1998@gmail.com).
  email: 'arielmaykab@gmail.com',

  address: {
    street: 'הזייתים 2',
    locality: 'מתת',
    region: 'גליל עליון',
    country: 'IL',
  },

  social: {
    instagram: 'https://www.instagram.com/_ari_catering_/',
    // TODO: confirm the exact Facebook and TikTok profile URLs with Ari.
    facebook: '',
    tiktok: '',
  },

  serviceAreas: [
    { name: 'צפון', places: ['גליל', 'גולן', 'חיפה', 'חוף הכרמל', 'עמק יזרעאל'] },
    {
      name: 'מרכז',
      places: ['תל אביב וגוש דן', 'הוד השרון', 'כפר סבא', 'השרון', 'חוף חפר', 'קיסריה'],
    },
    { name: 'שפלה וירושלים', places: ['מודיעין', 'הרי ירושלים', 'בית שמש'] },
    { name: 'דרום', places: ['באר שבע', 'מדבר יהודה', 'ים המלח', 'ערבה', 'נגב'] },
  ],
} as const;
