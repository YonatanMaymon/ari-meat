import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { site } from '../../data/site';
import { quoteEmailFrom } from '../../lib/config';
import { markQuoteEmailed, saveEvent, saveQuote } from '../../lib/db';
import {
  eventTypeLabel,
  fields,
  formatDate,
  HONEYPOT,
  quoteSummary,
  validateQuote,
  type Quote,
  type QuoteErrors,
  type QuoteInput,
} from '../../lib/quote';

// Receives the quote form (QuoteForm.astro). The browser posts with fetch and gets JSON back;
// a plain form post (no JS) is answered with a redirect.
export const prerender = false;

type Result =
  | { ok: true }
  | { ok: false; error: 'invalid'; errors: QuoteErrors }
  | { ok: false; error: 'turnstile' | 'server' };

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const respond = (result: Result, status = 200) =>
    wantsJson
      ? Response.json(result, { status, headers: { 'cache-control': 'no-store' } })
      : redirect(result.ok ? '/thank-you' : '/contact?error=1#quote-form');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return respond({ ok: false, error: 'invalid', errors: {} }, 400);
  }

  // Bots that fill the honeypot get a normal-looking success and nothing is stored or sent.
  if (String(form.get(HONEYPOT) ?? '')) return respond({ ok: true });

  const input = Object.fromEntries(fields.map((f) => [f, String(form.get(f) ?? '')])) as QuoteInput;
  const result = validateQuote(input);
  if (!result.ok) return respond({ ok: false, error: 'invalid', errors: result.errors }, 422);

  const token = String(form.get('cf-turnstile-response') ?? '');
  if (!(await verifyTurnstile(token, clientAddress))) {
    return respond({ ok: false, error: 'turnstile' }, 403);
  }

  const page = pathOf(request.headers.get('referer'));
  const { quote } = result;

  // Store first, then email: if either works, the lead isn't lost.
  let id: number | null = null;
  try {
    id = await saveQuote(quote, page);
  } catch (error) {
    console.error('quote: saving to D1 failed', error);
  }

  let emailed = false;
  try {
    await sendQuoteEmail(quote, id);
    emailed = true;
  } catch (error) {
    console.error('quote: sending the email failed', error);
  }

  if (id === null && !emailed) return respond({ ok: false, error: 'server' }, 500);

  const followUp = Promise.all([
    id !== null && emailed ? markQuoteEmailed(id) : null,
    saveEvent('quote_submit', page),
  ]).catch((error: unknown) => console.error('quote: follow-up writes failed', error));
  locals.cfContext.waitUntil(followUp);

  return respond({ ok: true });
};

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  if (!token) return false;
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('quote: TURNSTILE_SECRET_KEY is not set, rejecting the submission');
    return false;
  }
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    const outcome = await res.json<{ success: boolean; 'error-codes'?: string[] }>();
    if (!outcome.success) console.warn('quote: Turnstile rejected', outcome['error-codes']);
    return outcome.success;
  } catch (error) {
    console.error('quote: Turnstile verification failed', error);
    return false;
  }
}

async function sendQuoteEmail(quote: Quote, id: number | null) {
  if (!env.QUOTE_EMAIL) throw new Error('QUOTE_EMAIL binding is missing');

  const subjectParts = [
    `בקשה להצעת מחיר: ${eventTypeLabel(quote.eventType)}`,
    quote.date && formatDate(quote.date),
    quote.guests && `${quote.guests} אורחים`,
    quote.name,
  ];
  const callBack = quote.phone.startsWith('0')
    ? `972${quote.phone.slice(1)}`
    : quote.phone.slice(1);
  const text = [
    quoteSummary(quote),
    '',
    '---',
    `וואטסאפ ללקוח: https://wa.me/${callBack}`,
    id !== null ? `מספר פנייה: ${id}` : 'הפנייה לא נשמרה במסד הנתונים, רק במייל הזה.',
  ].join('\n');

  await env.QUOTE_EMAIL.send({
    from: quoteEmailFrom,
    to: site.email,
    replyTo: quote.email ?? undefined,
    subject: subjectParts.filter(Boolean).join(' · '),
    text,
  });
}

function pathOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).pathname.slice(0, 200);
  } catch {
    return null;
  }
}

const redirect = (location: string) =>
  new Response(null, { status: 303, headers: { location, 'cache-control': 'no-store' } });
