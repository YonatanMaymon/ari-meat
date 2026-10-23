// Gallery photos. Each file in src/assets/images/gallery/ needs an entry here with Hebrew alt text
// and the event type it's filtered under. Files without an entry fail the build, so no photo
// ever goes live without alt text. Photos are shown in the order listed here.

export const galleryCategories = {
  events: 'אירועים',
  fire: 'מהאש',
  food: 'מנות',
  matat: 'מתת',
} as const;

export type GalleryCategory = keyof typeof galleryCategories;

export const galleryPhotos: Record<string, { alt: string; category: GalleryCategory }> = {
  'asado-crosses-and-chefs.jpg': {
    alt: 'שני שפים ליד בור אש גדול, עם נתחי אסאדו על צלבים מעל הגחלים',
    category: 'fire',
  },
  'guests-at-buffet.jpg': { alt: 'אורחים מתמלאים מעמדת אוכל באירוע בגינה', category: 'events' },
  'fig-salad.jpg': { alt: 'סלט עלים עם תאנים, עגבניות ובצל סגול', category: 'food' },
  'chef-slicing-steak.jpg': { alt: 'שף פורס סטייק על קרש עץ באירוע ערב', category: 'fire' },
  'goats-in-matat.jpg': { alt: 'עיזים בדיר במתת', category: 'matat' },
  'rack-of-lamb.jpg': { alt: 'קרה טלה צלוי על קרש חיתוך', category: 'fire' },
  'empanadas-with-dips.jpg': { alt: 'צלחת אמפנדס זהובות עם מטבלים ועשבי תיבול', category: 'food' },
  'garden-tables-set.jpg': {
    alt: 'שולחנות ערוכים עם מפות לבנות בגינה, תחת שרשרת נורות',
    category: 'events',
  },
  'sausages-on-grill.jpg': { alt: 'נקניקיות ולחמניות על גריל גדול', category: 'fire' },
  'cherries-and-wine.jpg': { alt: 'דובדבנים טריים וכוס יין אדום על שולחן עץ', category: 'matat' },
  'grilled-vegetables-board.jpg': {
    alt: 'קרש ארוך עם כרובית צלויה, פלפלים ובצלים מהאש',
    category: 'food',
  },
  'guests-at-night-buffet.jpg': {
    alt: 'אורחים שמחים בתור לאוכל באירוע ערב בחוץ',
    category: 'events',
  },
  'eggplants-on-fire.jpg': { alt: 'חצילים חצויים נצלים על רשת מעל גחלים', category: 'fire' },
  'tomato-salad.jpg': { alt: 'סלט עגבניות צלויות עם גבינה לבנה ועלי בזיליקום', category: 'food' },
  'chef-with-vegetable-board.jpg': {
    alt: 'שף מחזיק קרש ארוך עמוס ירקות צלויים, מתחת לאוהל אירוע',
    category: 'events',
  },
  'sliced-tbone.jpg': { alt: 'סטייק טי-בון פרוס בצלחת לבנה', category: 'fire' },
  'strawberry-tree.jpg': { alt: 'עץ קטלב אדום ונוף הגליל שמאחוריו', category: 'matat' },
  'ceviche-cups.jpg': { alt: 'קעריות סביצ׳ה על מגש קרח', category: 'food' },
  'chef-with-hanging-meat.jpg': {
    alt: 'שף מחייך ליד גריל, עם נתחי בשר תלויים מעליו',
    category: 'fire',
  },
  'dinner-with-a-view.jpg': {
    alt: 'שתי אורחות סועדות על המרפסת במתת מול נוף ההרים',
    category: 'matat',
  },
  'roast-beef-focaccia.jpg': { alt: 'פוקצ׳ה עם רוסטביף, עגבניות שרי ורוקט', category: 'food' },
  'chefs-with-platter.jpg': {
    alt: 'שני שפים מחזיקים מגש ארוך של בשרים וירקות',
    category: 'events',
  },
  'asado-on-grill.jpg': { alt: 'נתחי אסאדו צלויים על הגריל עם ענף טימין', category: 'fire' },
  'fish-carpaccio.jpg': { alt: 'קרפצ׳יו דג עם תותי עץ ורוקט בצלחת אדומה', category: 'food' },
  'vegetable-boxes.jpg': {
    alt: 'ארגזי ירקות טריים: דלעות, כרוב, חצילים ופלפלים',
    category: 'matat',
  },
  'flatbreads-on-board.jpg': { alt: 'לחמים שטוחים עם עוף ויוגורט על קרש עץ', category: 'food' },
  'carving-board.jpg': { alt: 'פריסת נתח בשר על קרש עץ חרוט', category: 'fire' },
  'grilled-asparagus.jpg': { alt: 'אספרגוס צלוי ופלפלים ירוקים בצלחת', category: 'food' },
  'grill-with-vegetables.jpg': {
    alt: 'גריל עם נתחי בשר, בצלים, עגבניות ותירס',
    category: 'fire',
  },
  'shakshuka-and-flatbread.jpg': { alt: 'מחבת ביצים עם עשבים ולחם טאבון', category: 'matat' },
  'empanadas-tray.jpg': { alt: 'מגש אמפנדס אפויות', category: 'food' },
  'sliced-steak-board.jpg': { alt: 'נתחי סטייק פרוסים על לחם וסלק, על קרש ארוך', category: 'fire' },
  'baked-fish.jpg': { alt: 'דג אפוי עם לימון, גזר ועשבי תיבול בתבנית חרס', category: 'food' },
  'plated-beef.jpg': { alt: 'מנת בשר פרוס עם חמאה וסלסה ירוקה בצלחת קרמיקה', category: 'food' },
  'grilled-eggplants.jpg': { alt: 'מגש חצילים צרובים בפסים', category: 'food' },
  'tahini-plate.jpg': { alt: 'צלחת טחינה עם שמן זית', category: 'food' },
  'grilled-bread-spread.jpg': { alt: 'לחם צלוי עם ממרח לבן על קרש עץ', category: 'food' },
  'charred-bread-and-herb-sauce.jpg': { alt: 'לחם חרוך וקערת רוטב עשבים ירוק', category: 'food' },
  'mushrooms.jpg': { alt: 'פטריות פורטבלו טריות על שולחן עץ', category: 'matat' },
  'flatbread-with-shrimp.jpg': { alt: 'לחם שטוח עם שרימפס, רוקט ויוגורט', category: 'food' },
  'vegetables-prepped.jpg': {
    alt: 'מגשים של כרוב, עגבניות שרי ותפוחי אדמה מוכנים לאש',
    category: 'food',
  },
};
