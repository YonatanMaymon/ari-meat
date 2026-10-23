import { getCollection, type CollectionEntry } from 'astro:content';

export type Service = CollectionEntry<'services'>;
export type ServiceGroup = Service['data']['group'];

/** Hub page for each group, as in plan.md section 4. */
export const groups: Record<ServiceGroup, { label: string; href: string }> = {
  catering: { label: 'קייטרינג לאירועים', href: '/catering' },
  matat: { label: 'חוויות במתת', href: '/matat' },
};

export const serviceHref = (service: Service) => `${groups[service.data.group].href}/${service.id}`;

/** All services, optionally of one group, in display order. */
export async function getServices(group?: ServiceGroup): Promise<Service[]> {
  const all = await getCollection('services', (s) => !group || s.data.group === group);
  return all.sort((a, b) =>
    a.data.group === b.data.group
      ? a.data.order - b.data.order
      : a.data.group === 'catering'
        ? -1
        : 1,
  );
}
