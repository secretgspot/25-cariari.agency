
import { error } from '@sveltejs/kit';

const site = 'https://cariari.agency';

export async function GET({ locals }) {
    const supabaseClient = locals.supabase;

    const { data: properties, error: err } = await supabaseClient
        .from('properties_preview')
        .select('id, updated_at')
        .order('created_at', { ascending: false });

    if (err) {
        error(500, `Error fetching properties: ${err.message}`);
    }

    const pages = ['about', 'properties'];

    const sitemap = `<?xml version="1.0" encoding="UTF-8" ?>
<urlset
    xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xhtml="https://www.w3.org/1999/xhtml"
    xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
    xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
    xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
    xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
    <url>
        <loc>${site}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    ${pages
        .map(
            (page) => `
    <url>
        <loc>${site}/${page}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>
    `
        )
        .join('')}
    ${properties
        .map(
            (property) => `
    <url>
        <loc>${site}/${property.id}</loc>
        <changefreq>weekly</changefreq>
        <lastmod>${new Date(property.updated_at).toISOString()}</lastmod>
        <priority>0.5</priority>
    </url>
    `
        )
        .join('')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
