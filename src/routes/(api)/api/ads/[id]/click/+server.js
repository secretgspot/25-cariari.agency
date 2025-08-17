import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, fetch }) {
    const { id } = params;

    try {
        const apiUrl = `https://25-cariari-community.vercel.app/api/ads/${id}/click`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return json({ success: true, message: 'Click logged successfully' });
        } else {
            const errorText = await response.text();
            console.error('API error:', errorText);
            return json({ success: false, warning: `Analytics API error: ${response.status}` });
        }
    } catch (error) {
        console.error('Error in logClick:', error);
        return json({ success: false, warning: `Analytics logging failed: ${error.message}` });
    }
}
