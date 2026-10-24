import type { APIRoute } from 'astro';
import { getReviews } from '../../lib/reviews';

// Google reviews for components/GoogleReviews.astro. 404 with the reason when there are none to
// show (not set up, or Google unreachable), and the section stays hidden.
export const prerender = false;

export const GET: APIRoute = async () => {
  const result = await getReviews();
  if ('reason' in result) {
    console.warn(`reviews: none to show: ${result.reason}`);
    return Response.json(result, { status: 404, headers: { 'cache-control': 'no-store' } });
  }
  return Response.json(result.reviews, { headers: { 'cache-control': 'public, max-age=3600' } });
};
