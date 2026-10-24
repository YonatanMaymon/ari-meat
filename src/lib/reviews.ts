// Google reviews of Ari Catering, from the Places API (New), for the reviews section
// (components/GoogleReviews.astro, via /api/reviews). Only real reviews from Google are shown, as
// Google returns them (at most 5, "most relevant" first): nothing is written or edited here.
// Answers are cached in D1 for CACHE_HOURS, so Google is asked about twice a day. Place Details with
// reviews is billed per request, and that stays well inside Google's free monthly usage.
// https://developers.google.com/maps/documentation/places/web-service/place-details
import { env } from 'cloudflare:workers';
import { googlePlaceId } from './config';
import { getCachedReviews, saveCachedReviews } from './db';

const CACHE_HOURS = 12;
/** If Google can't be reached, an older answer is still shown for up to this long. */
const STALE_DAYS = 7;

export interface Review {
  author: string;
  /** Link to the author's Google Maps profile (Google requires it next to the name). */
  authorUri: string | null;
  authorPhoto: string | null;
  rating: number;
  /** In the reviewer's own words, not Google's translation. */
  text: string;
  /** e.g. "לפני חודש", worded by Google. */
  when: string;
  /** The review on Google Maps. */
  uri: string | null;
}

export interface Reviews {
  rating: number;
  count: number;
  /** All reviews on Google Maps. */
  allUri: string | null;
  writeUri: string | null;
  reviews: Review[];
}

interface PlaceDetails {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { reviewsUri?: string; writeAReviewUri?: string };
  reviews?: {
    rating?: number;
    relativePublishTimeDescription?: string;
    text?: { text?: string };
    originalText?: { text?: string };
    authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
    googleMapsUri?: string;
  }[];
}

const fieldMask = ['rating', 'userRatingCount', 'googleMapsUri', 'googleMapsLinks', 'reviews'];

async function fetchFromGoogle(apiKey: string): Promise<Reviews> {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}?languageCode=he&regionCode=IL`,
    { headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': fieldMask.join(',') } },
  );
  if (!response.ok) throw new Error(`Places API ${response.status}: ${await response.text()}`);
  const place: PlaceDetails = await response.json();

  return {
    rating: place.rating ?? 0,
    count: place.userRatingCount ?? 0,
    allUri: place.googleMapsLinks?.reviewsUri ?? place.googleMapsUri ?? null,
    writeUri: place.googleMapsLinks?.writeAReviewUri ?? null,
    reviews: (place.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? '',
        authorUri: r.authorAttribution?.uri ?? null,
        authorPhoto: r.authorAttribution?.photoUri ?? null,
        rating: r.rating ?? 0,
        text: (r.originalText?.text ?? r.text?.text ?? '').trim(),
        when: r.relativePublishTimeDescription ?? '',
        uri: r.googleMapsUri ?? null,
      }))
      // A star rating with no words says nothing in a quote card.
      .filter((r) => r.author && r.text),
  };
}

/** The reviews to show, or null when they aren't set up or can't be had. */
export async function getReviews(): Promise<Reviews | null> {
  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!googlePlaceId || !apiKey) return null;

  let cached: Awaited<ReturnType<typeof getCachedReviews>> = null;
  try {
    cached = await getCachedReviews();
  } catch (error) {
    console.error('reviews: reading the D1 cache failed', error);
  }
  const age = cached ? Date.now() - cached.fetchedAt : Infinity;
  if (cached && age < CACHE_HOURS * 3_600_000) return JSON.parse(cached.data) as Reviews;

  try {
    const reviews = await fetchFromGoogle(apiKey);
    await saveCachedReviews(JSON.stringify(reviews)).catch((error: unknown) =>
      console.error('reviews: saving the D1 cache failed', error),
    );
    return reviews;
  } catch (error) {
    console.error('reviews: fetching from Google failed', error);
    return cached && age < STALE_DAYS * 86_400_000 ? (JSON.parse(cached.data) as Reviews) : null;
  }
}
