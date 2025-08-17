import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
  try {
    const response = await fetch('https://25-cariari-community.vercel.app/api/ads/ad', {
      headers: {
        'x-forwarded-host': request.headers.get('host')
      }
    });

    if (!response.ok) {
      // If the ad service returns a 404, it means no ad is available.
      // We pass this along to the client so it can handle the empty state.
      if (response.status === 404) {
        return json(null, { status: 404 });
      }
      // For other errors, we log them and return a generic error message.
      console.error('Failed to fetch ad:', response.status, response.statusText);
      throw new Error(`Failed to fetch ad: ${response.status} ${response.statusText}`);
    }

    const ad = await response.json();
    return json(ad);

  } catch (error) {
    console.error('Error fetching ad:', error);
    // Return a 500 status code for internal server errors.
    return json({ error: 'Failed to fetch ad' }, { status: 500 });
  }
}