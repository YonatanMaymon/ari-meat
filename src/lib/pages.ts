// The editable content of the hand-built pages (src/content/pages/<id>.yaml, see content.config.ts).
import { getEntry, type CollectionEntry } from 'astro:content';

const ids = {
  homePage: 'home',
  aboutPage: 'about',
  menuPage: 'menu',
  cateringPage: 'catering',
  matatPage: 'matat',
  contactPage: 'contact',
} as const;

export async function getPage<C extends keyof typeof ids>(
  collection: C,
): Promise<CollectionEntry<C>['data']> {
  const entry = (await getEntry(collection, ids[collection])) as CollectionEntry<C> | undefined;
  if (!entry) throw new Error(`Missing src/content/pages/${ids[collection]}.yaml`);
  return entry.data;
}
