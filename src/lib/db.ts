// D1 storage for quote requests and contact-click events, so no lead is lost even if the email
// fails. The database is created by `wrangler deploy` (binding DB in wrangler.jsonc); the tables
// are created here on first use, so there's no migration step to remember.
// To read the data: Cloudflare dashboard → Storage & databases → D1 → the database → Explore data.
import { env } from 'cloudflare:workers';
import type { Quote } from './quote';

const schema = [
  `CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    event_type TEXT NOT NULL,
    event_date TEXT,
    guests INTEGER,
    region TEXT,
    message TEXT,
    page TEXT,
    email_sent INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    name TEXT NOT NULL,
    path TEXT
  )`,
];

// Once per Worker isolate. Reset on failure so the next request retries.
let ready: Promise<unknown> | undefined;
function ensureSchema() {
  ready ??= env.DB.batch(schema.map((sql) => env.DB.prepare(sql))).catch((error: unknown) => {
    ready = undefined;
    throw error;
  });
  return ready;
}

/** Stores a quote request and returns its id. */
export async function saveQuote(quote: Quote, page: string | null): Promise<number> {
  await ensureSchema();
  const row = await env.DB.prepare(
    `INSERT INTO quotes (name, phone, email, event_type, event_date, guests, region, message, page)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
  )
    .bind(
      quote.name,
      quote.phone,
      quote.email,
      quote.eventType,
      quote.date,
      quote.guests,
      quote.region,
      quote.message,
      page,
    )
    .first<{ id: number }>();
  return row?.id ?? 0;
}

export async function markQuoteEmailed(id: number) {
  await env.DB.prepare('UPDATE quotes SET email_sent = 1 WHERE id = ?').bind(id).run();
}

export async function saveEvent(name: string, path: string | null) {
  await ensureSchema();
  await env.DB.prepare('INSERT INTO events (name, path) VALUES (?, ?)').bind(name, path).run();
}
