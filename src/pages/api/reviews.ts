import type { APIRoute } from 'astro';
import { getReviews } from '../../lib/reviews';

// Google reviews for components/GoogleReviews.astro. 204 when there are none to show (not set up
// yet, or Google unreachable), and the section stays hidden.
export const prerender = false;

export const GET: APIRoute = async () => {
  const reviews = await getReviews();
  if (!reviews || reviews.reviews.length === 0) {
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
  return Response.json(reviews, { headers: { 'cache-control': 'public, max-age=3600' } });
};
