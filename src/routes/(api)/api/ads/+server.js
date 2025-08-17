import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    const response = await fetch('https://25-cariari-community.vercel.app/api/ads');
    if (!response.ok) {
      throw new Error(`Failed to fetch ads: ${response.status} ${response.statusText}`);
    }
    const ads = await response.json();
    return json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    return json({ error: 'Failed to fetch ads' }, { status: 500 });
  }
}