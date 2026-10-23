// /llms.txt (llmstxt.org): a plain-text map of the site for AI assistants. Replaces Wix's /llms page.
// Built from site.ts and the services collection, so it never disagrees with the pages.
import type { APIRoute } from 'astro';
import { site } from '../data/site';
import { getServices, groups, serviceHref } from '../lib/services';

const abs = (path: string) => new URL(path, site.url).href;

export const GET: APIRoute = async () => {
  const services = await getServices();
  const list = (group: keyof typeof groups) =>
    services
      .filter((s) => s.data.group === group)
      .map((s) => `- [${s.data.label}](${abs(serviceHref(s))}): ${s.data.description}`);

  const body = [
    `# ${site.name}`,
    '',
    `> ${site.name}: ${site.tagline}. קייטרינג בשרי על האש, מטבח ארגנטינאי וגלילי, ממושב ${site.address.locality} שבגליל העליון. ` +
      'מגיעים לאירועים בכל הארץ, ומארחים במטעים במתת.',
    '',
    `טלפון ווואטסאפ: ${site.phone.display}. אימייל: ${site.email}. ` +
      `כתובת: ${site.address.street}, ${site.address.locality}.`,
    `אזורי שירות: ${site.serviceAreas.map((a) => `${a.name} (${a.places.join(', ')})`).join('; ')}.`,
    '',
    `## ${groups.catering.label}`,
    '',
    `- [כל שירותי הקייטרינג](${abs(groups.catering.href)})`,
    ...list('catering'),
    '',
    `## ${groups.matat.label}`,
    '',
    `- [כל החוויות במתת](${abs(groups.matat.href)})`,
    ...list('matat'),
    '',
    '## עוד',
    '',
    `- [תפריט](${abs('/menu')}): דוגמאות מהתפריט. כל תפריט נבנה לכל אירוע.`,
    `- [אודות](${abs('/about')}): הסיפור של ארי, הגרילים והמטעים במתת.`,
    `- [גלריה](${abs('/gallery')})`,
    `- [יצירת קשר והצעת מחיר](${abs('/contact')})`,
    '',
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
