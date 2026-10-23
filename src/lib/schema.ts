// schema.org JSON-LD builders, passed to BaseLayout's `jsonLd`. Business details come from site.ts.
import { site } from '../data/site';

export interface Crumb {
  label: string;
  /** Root-relative URL. The last crumb (the current page) can omit it. */
  href?: string;
}

const abs = (path: string) => new URL(path, site.url).href;

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

export function service(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: abs(path),
    serviceType: 'Catering',
    areaServed: { '@type': 'Country', name: 'Israel' },
    provider: { '@type': 'FoodEstablishment', name: site.name, url: site.url },
  };
}
