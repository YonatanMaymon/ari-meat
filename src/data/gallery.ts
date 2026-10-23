// Gallery photos. Each file in src/assets/images/gallery/ needs an entry here with Hebrew alt text
// and the event type it's filtered under. Files without an entry fail the build, so no photo
// ever goes live without alt text.

export const galleryCategories = {
  weddings: 'חתונות',
  events: 'אירועים פרטיים',
  corporate: 'אירועי חברה',
  matat: 'מתת',
  food: 'אוכל',
} as const;

export type GalleryCategory = keyof typeof galleryCategories;

export const galleryPhotos: Record<string, { alt: string; category: GalleryCategory }> = {};
