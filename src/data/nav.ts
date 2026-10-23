// Site navigation, shared by the header, the mobile menu and the footer.
// URLs follow plan.md section 4. Pages that don't exist yet are built in Phase 3.

export interface NavLink {
  label: string;
  href: string;
  children?: readonly NavLink[];
}

export const mainNav: readonly NavLink[] = [
  {
    label: 'קייטרינג לאירועים',
    href: '/catering',
    children: [
      { label: 'חתונות בטבע', href: '/catering/weddings' },
      { label: 'אירועים פרטיים', href: '/catering/private-events' },
      { label: 'אירועי חברה', href: '/catering/corporate-events' },
      { label: 'שולחנות שוק ועמדות בשר', href: '/catering/market-tables' },
    ],
  },
  {
    label: 'חוויות במתת',
    href: '/matat',
    children: [
      { label: 'ארוחת שף פרטית', href: '/matat/private-chef' },
      { label: 'ימי גיבוש בפרדסים', href: '/matat/team-building' },
    ],
  },
  { label: 'תפריט', href: '/menu' },
  { label: 'אודות', href: '/about' },
  { label: 'גלריה', href: '/gallery' },
];

export const quoteLink: NavLink = { label: 'קבלת הצעת מחיר', href: '/contact' };
