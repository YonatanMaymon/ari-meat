// The quote form's fields and validation, shared by the browser (QuoteForm.astro) and the
// Worker (/api/quote), so both enforce the same rules and show the same Hebrew messages.
import { site } from '../data/site';

export const eventTypes = [
  { value: 'wedding', label: 'חתונה' },
  { value: 'private', label: 'אירוע פרטי או משפחתי' },
  { value: 'corporate', label: 'אירוע חברה' },
  { value: 'market-table', label: 'שולחן שוק או עמדות בשר' },
  { value: 'private-chef', label: 'ארוחת שף פרטית במתת' },
  { value: 'team-building', label: 'יום גיבוש במתת' },
  { value: 'other', label: 'משהו אחר' },
] as const;

export const regions = [
  ...site.serviceAreas.map((a) => ({ value: a.name, label: a.name })),
  { value: 'מתת', label: 'אצלכם במתת' },
] as const;

/** Service page slug → event type, to preselect it when the form is opened from a service page. */
export const eventTypeByService: Record<string, string> = {
  weddings: 'wedding',
  'private-events': 'private',
  'corporate-events': 'corporate',
  'market-tables': 'market-table',
  'private-chef': 'private-chef',
  'team-building': 'team-building',
};

export const fields = [
  'name',
  'phone',
  'email',
  'eventType',
  'date',
  'guests',
  'region',
  'message',
] as const;
export type Field = (typeof fields)[number];

export type QuoteInput = Record<Field, string>;
export type QuoteErrors = Partial<Record<Field, string>>;

export interface Quote {
  name: string;
  /** Normalised to digits, Israeli numbers with a leading 0 (0528580775), others with +. */
  phone: string;
  email: string | null;
  eventType: string;
  date: string | null;
  guests: number | null;
  region: string | null;
  message: string | null;
}

/** The hidden field bots fill in. Named like a real field so they don't skip it. */
export const HONEYPOT = 'company_website';

export const limits = { name: 80, email: 120, message: 2000, maxGuests: 5000 } as const;

/**
 * Israeli mobile and landline numbers in any common spelling (052-858-0775, +972 52 858 0775),
 * or an international number starting with +.
 */
export function normalisePhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, '');
  const israeli = compact.replace(/^(\+|00)972/, '0');
  if (/^0(5\d|7\d|[23489])\d{7}$/.test(israeli)) return israeli;
  if (/^(\+|00)[1-9]\d{7,14}$/.test(compact)) return compact.replace(/^00/, '+');
  return null;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Today in Israel as YYYY-MM-DD, for the date field's `min` and the past-date check. */
export function todayInIsrael(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
}

export function validateQuote(
  input: QuoteInput,
): { ok: true; quote: Quote } | { ok: false; errors: QuoteErrors } {
  const v = Object.fromEntries(fields.map((f) => [f, (input[f] ?? '').trim()])) as QuoteInput;
  const errors: QuoteErrors = {};

  if (v.name.length < 2) errors.name = 'נא לכתוב שם';
  else if (v.name.length > limits.name) errors.name = 'השם ארוך מדי';

  const phone = normalisePhone(v.phone);
  if (!v.phone) errors.phone = 'נא לכתוב מספר טלפון';
  else if (!phone) errors.phone = 'מספר הטלפון לא נראה תקין';

  if (v.email && (v.email.length > limits.email || !emailPattern.test(v.email)))
    errors.email = 'כתובת האימייל לא נראית תקינה';

  if (!eventTypes.some((t) => t.value === v.eventType)) errors.eventType = 'נא לבחור סוג אירוע';

  if (v.date) {
    if (!datePattern.test(v.date) || Number.isNaN(Date.parse(v.date)))
      errors.date = 'התאריך לא תקין';
    else if (v.date < todayInIsrael()) errors.date = 'התאריך כבר עבר';
  }

  const guests = v.guests ? Number(v.guests) : null;
  if (guests !== null && (!Number.isInteger(guests) || guests < 1 || guests > limits.maxGuests))
    errors.guests = 'נא לכתוב מספר אורחים משוער';

  if (v.region && !regions.some((r) => r.value === v.region)) errors.region = 'נא לבחור אזור';

  if (v.message.length > limits.message) errors.message = 'ההודעה ארוכה מדי';

  if (Object.keys(errors).length > 0 || !phone) return { ok: false, errors };

  return {
    ok: true,
    quote: {
      name: v.name,
      phone,
      email: v.email || null,
      eventType: v.eventType,
      date: v.date || null,
      guests,
      region: v.region || null,
      message: v.message || null,
    },
  };
}

export const eventTypeLabel = (value: string) =>
  eventTypes.find((t) => t.value === value)?.label ?? value;

/** "15.11.2026" for an ISO date, the way it's written in Israel. */
export const formatDate = (iso: string) => iso.split('-').reverse().join('.');

/**
 * The details as a short Hebrew message, used for the WhatsApp alternative and as the email body.
 * Skips empty fields, so it also works for a half-filled form.
 */
export function quoteSummary(q: Partial<Record<Field, string | number | null>>): string {
  const lines: [string, string | number | null | undefined][] = [
    ['שם', q.name],
    ['טלפון', q.phone],
    ['אימייל', q.email],
    ['סוג אירוע', q.eventType ? eventTypeLabel(String(q.eventType)) : null],
    ['תאריך', q.date ? formatDate(String(q.date)) : null],
    ['מספר אורחים', q.guests],
    ['אזור', q.region],
  ];
  const body = lines.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`);
  if (q.message) body.push('', String(q.message));
  return body.join('\n');
}

/** wa.me link to Ari with the message prefilled. */
export const whatsappLink = (text: string) =>
  `${site.whatsapp.href}?text=${encodeURIComponent(text)}`;
