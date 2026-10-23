import { site } from '../data/site';

/** Google typically shows ~60 characters of a title before cutting it off. */
export const TITLE_MAX_LENGTH = 60;

/** Keyword the homepage ranks for. Other pages pass their own keyword title. */
export const HOME_TITLE = 'קייטרינג בשרי על האש';

const SEPARATOR = ' | ';

/**
 * Builds the <title> for a page: keyword first, brand last
 * ("קייטרינג לחתונה בטבע | ארי קייטרינג"), so the part that matches the search is never cut off.
 *
 * If the keyword plus brand would exceed TITLE_MAX_LENGTH, the brand is dropped rather than
 * letting Google truncate the keyword.
 *
 * @param pageTitle The page's keyword-focused title, e.g. "קייטרינג לחתונה בטבע".
 *                  Undefined for the homepage.
 * @returns The full document title.
 */
export function formatTitle(pageTitle?: string): string {
  const keyword = pageTitle?.trim() || HOME_TITLE;
  const full = `${keyword}${SEPARATOR}${site.name}`;
  return full.length <= TITLE_MAX_LENGTH ? full : keyword;
}
