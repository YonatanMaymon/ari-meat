// Fonts Ari can pick for headings and body text in the admin (src/content/settings.yaml).
// All of them support Hebrew. Only the two chosen fonts are loaded (components/FontFaces.astro);
// the files of the others are emitted but never requested. Names for the admin: font-options.ts.
import type { FontId } from './font-options';
import heeboHe from '@fontsource-variable/heebo/files/heebo-hebrew-wght-normal.woff2?url';
import heeboLa from '@fontsource-variable/heebo/files/heebo-latin-wght-normal.woff2?url';
import frankHe from '@fontsource-variable/frank-ruhl-libre/files/frank-ruhl-libre-hebrew-wght-normal.woff2?url';
import frankLa from '@fontsource-variable/frank-ruhl-libre/files/frank-ruhl-libre-latin-wght-normal.woff2?url';
import assistantHe from '@fontsource-variable/assistant/files/assistant-hebrew-wght-normal.woff2?url';
import assistantLa from '@fontsource-variable/assistant/files/assistant-latin-wght-normal.woff2?url';
import rubikHe from '@fontsource-variable/rubik/files/rubik-hebrew-wght-normal.woff2?url';
import rubikLa from '@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2?url';
import notoSansHe from '@fontsource-variable/noto-sans-hebrew/files/noto-sans-hebrew-hebrew-wght-normal.woff2?url';
import notoSansLa from '@fontsource-variable/noto-sans-hebrew/files/noto-sans-hebrew-latin-wght-normal.woff2?url';
import notoSerifHe from '@fontsource-variable/noto-serif-hebrew/files/noto-serif-hebrew-hebrew-wght-normal.woff2?url';
import notoSerifLa from '@fontsource-variable/noto-serif-hebrew/files/noto-serif-hebrew-latin-wght-normal.woff2?url';
import suezHe from '@fontsource/suez-one/files/suez-one-hebrew-400-normal.woff2?url';
import suezLa from '@fontsource/suez-one/files/suez-one-latin-400-normal.woff2?url';
import bellefairHe from '@fontsource/bellefair/files/bellefair-hebrew-400-normal.woff2?url';
import bellefairLa from '@fontsource/bellefair/files/bellefair-latin-400-normal.woff2?url';
import secularHe from '@fontsource/secular-one/files/secular-one-hebrew-400-normal.woff2?url';
import secularLa from '@fontsource/secular-one/files/secular-one-latin-400-normal.woff2?url';
import varelaHe from '@fontsource/varela-round/files/varela-round-hebrew-400-normal.woff2?url';
import varelaLa from '@fontsource/varela-round/files/varela-round-latin-400-normal.woff2?url';

export interface Font {
  family: string;
  /** Variable fonts cover every weight. The others have one weight, used for bold too. */
  variable: boolean;
  serif: boolean;
  hebrew: string;
  latin: string;
}

export const fonts = {
  heebo: {
    family: 'Heebo',
    variable: true,
    serif: false,
    hebrew: heeboHe,
    latin: heeboLa,
  },
  'frank-ruhl-libre': {
    family: 'Frank Ruhl Libre',
    variable: true,
    serif: true,
    hebrew: frankHe,
    latin: frankLa,
  },
  assistant: {
    family: 'Assistant',
    variable: true,
    serif: false,
    hebrew: assistantHe,
    latin: assistantLa,
  },
  rubik: {
    family: 'Rubik',
    variable: true,
    serif: false,
    hebrew: rubikHe,
    latin: rubikLa,
  },
  'noto-sans-hebrew': {
    family: 'Noto Sans Hebrew',
    variable: true,
    serif: false,
    hebrew: notoSansHe,
    latin: notoSansLa,
  },
  'noto-serif-hebrew': {
    family: 'Noto Serif Hebrew',
    variable: true,
    serif: true,
    hebrew: notoSerifHe,
    latin: notoSerifLa,
  },
  'suez-one': {
    family: 'Suez One',
    variable: false,
    serif: true,
    hebrew: suezHe,
    latin: suezLa,
  },
  bellefair: {
    family: 'Bellefair',
    variable: false,
    serif: true,
    hebrew: bellefairHe,
    latin: bellefairLa,
  },
  'secular-one': {
    family: 'Secular One',
    variable: false,
    serif: false,
    hebrew: secularHe,
    latin: secularLa,
  },
  'varela-round': {
    family: 'Varela Round',
    variable: false,
    serif: false,
    hebrew: varelaHe,
    latin: varelaLa,
  },
} satisfies Record<FontId, Font>;
