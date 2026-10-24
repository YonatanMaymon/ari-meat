// Single source of truth for business details (NAP: name, address, phone).
// Every page, the footer and the JSON-LD read from here, so they can never disagree.

const phoneE164 = '+972528580775';

export const site = {
  name: 'ארי קייטרינג',
  tagline: 'חווית בשר ייחודית',
  url: 'https://aricatering.com',
  locale: 'he_IL',

  phone: {
    display: '052-8580775',
    href: `tel:${phoneE164}`,
  },
  whatsapp: {
    href: `https://wa.me/${phoneE164.slice(1)}`,
  },
  // Confirmed as the only official address. Aricatering1998@gmail.com (on the Wix homepage) is not used.
  email: 'arielmaykab@gmail.com',

  address: {
    street: 'הזייתים 2',
    locality: 'מתת',
    region: 'גליל מערבי',
    country: 'IL',
  },

  social: {
    instagram: 'https://www.instagram.com/_ari_catering_/',
    // TODO: confirm the exact Facebook and TikTok profile URLs with Ari.
    facebook: '',
    tiktok: '',
  },

  // Place names as in the old Wix footer.
  serviceAreas: [
    {
      name: 'צפון',
      places: [
        'גליל עליון',
        'גליל תחתון',
        'גליל מערבי',
        'רמת הגולן',
        'סובב כנרת',
        'חיפה',
        'קריות',
        'זכרון יעקוב',
        'בינימינה',
        'פרדס חנה',
        'חוף הכרמל',
        'עמק יזרעאל',
      ],
    },
    {
      name: 'מרכז',
      places: [
        'תל אביב וגוש דן',
        'הרצליה',
        'רמת השרון',
        'רעננה',
        'הוד השרון',
        'כפר סבא',
        'יישובי השרון',
        'עמק חפר',
        'קיסריה',
      ],
    },
    {
      name: 'שפלה וירושלים',
      places: ['מודיעין', 'מכבים-רעות', 'הרי ירושלים', 'בית שמש', 'יישובי השפלה'],
    },
    { name: 'דרום', places: ['באר שבע', 'מדבר יהודה', 'ים המלח', 'יישובי הערבה', 'הנגב'] },
  ],
} as const;
