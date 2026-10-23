// schema.org JSON-LD builders, passed to BaseLayout's `jsonLd`. Business details come from site.ts.
import { getImage } from 'astro:assets';
import businessPhoto from '../assets/images/heroes/asado-cross-fire.jpg';
import { site } from '../data/site';

export interface Crumb {
  label: string;
  /** Root-relative URL. The last crumb (the current page) can omit it. */
  href?: string;
}

const abs = (path: string) => new URL(path, site.url).href;

/** Stable ids, so the Service on each page and the business on the homepage are one entity. */
const BUSINESS_ID = abs('/#business');
const WEBSITE_ID = abs('/#website');

/** The business as a LocalBusiness (FoodEstablishment), for the homepage and the contact page. */
export async function business() {
  return { '@context': 'https://schema.org', ...(await businessEntity()) };
}

/** The business without @context, for nesting inside another item (a Service's provider). */
async function businessEntity() {
  const photo = await getImage({ src: businessPhoto, width: 1200, format: 'jpg' });
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': 'FoodEstablishment',
    '@id': BUSINESS_ID,
    name: site.name,
    alternateName: `${site.name}: ${site.tagline}`,
    url: site.url,
    image: abs(photo.src),
    telephone: site.phone.href.replace('tel:', ''),
    email: site.email,
    servesCuisine: ['ארגנטינאי', 'גלילי', 'בשרים על האש'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    areaServed: site.serviceAreas.flatMap((area) =>
      area.places.map((name) => ({ '@type': 'Place', name })),
    ),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: site.name,
    url: site.url,
    inLanguage: 'he',
    publisher: { '@id': BUSINESS_ID },
  };
}

export function breadcrumbList(crumbs: readonly Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href && { item: abs(crumb.href) }),
    })),
  };
}

export function faqPage(faqs: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/**
 * A service page's Service. The provider is the full business: Google reads a provider typed as a
 * local business as a LocalBusiness item of its own and flags every missing field.
 */
export async function service(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: abs(path),
    serviceType: 'Catering',
    areaServed: { '@type': 'Country', name: 'Israel' },
    provider: await businessEntity(),
  };
}
