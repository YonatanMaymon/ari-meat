import { site } from '../data/site';

/** Google typically shows ~60 characters of a title before cutting it off. */
export const TITLE_MAX_LENGTH = 60;

/**
 * Builds the <title> for a page.
 *
 * @param pageTitle The page's keyword-focused title, e.g. "קייטרינג לחתונה בטבע".
 *                  Undefined for the homepage.
 * @returns The full document title.
 */
export function formatTitle(pageTitle?: string): string {
  // TODO(you): decide the title format. Temporary placeholder below.
  return pageTitle ?? site.name;
}
