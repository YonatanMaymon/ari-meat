// Gallery categories. The photos themselves, with their Hebrew alt text and category, are listed in
// src/content/gallery.yaml (in display order), which Ari edits through the admin at /keystatic.

export const galleryCategories = {
  events: 'אירועים',
  fire: 'מהאש',
  food: 'מנות',
  matat: 'מתת',
} as const;

export type GalleryCategory = keyof typeof galleryCategories;
