// The fonts offered in the admin's design settings (keystatic.config.ts), by id. The files and
// families are in fonts.ts, kept apart so the admin doesn't bundle font files.
export const fontLabels = {
  heebo: 'Heebo (נקי ומודרני)',
  'frank-ruhl-libre': 'Frank Ruhl Libre (קלאסי עם סריפים)',
  assistant: 'Assistant (רך וקריא)',
  rubik: 'Rubik (עגול וידידותי)',
  'noto-sans-hebrew': 'Noto Sans Hebrew (פשוט וניטרלי)',
  'noto-serif-hebrew': 'Noto Serif Hebrew (ספרותי עם סריפים)',
  'suez-one': 'Suez One (כותרות כבדות)',
  bellefair: 'Bellefair (אלגנטי ודק)',
  'secular-one': 'Secular One (כותרות עבות)',
  'varela-round': 'Varela Round (עגול ורך)',
} as const;

export type FontId = keyof typeof fontLabels;

/** Display fonts with a single weight: fine for headings, too heavy or thin for body text. */
export const headingOnlyFonts: readonly FontId[] = ['suez-one', 'bellefair', 'secular-one'];

export const defaultFonts = {
  heading: 'frank-ruhl-libre',
  body: 'heebo',
} as const satisfies Record<string, FontId>;
