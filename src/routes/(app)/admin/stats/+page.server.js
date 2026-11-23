import { redirect, error } from '@sveltejs/kit';
import { calculateMarketStats } from '#lib/stats/marketStats.js';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const session = await event.locals.getSession();
	const user = session?.user;
	const is_admin = session?.is_admin;

	if (!user) {
		redirect(307, '/login?redirectTo=/admin/stats');
	}

	if (!is_admin) {
		error(403, 'Unauthorized: Administrator access required');
	}

	const supabase = event.locals.supabase;

	// Fetch all properties preview for comprehensive stats
	const { data: properties, error: propsError } = await supabase
		.from('properties_preview')
		.select('*')
		.order('created_at', { ascending: false });

	if (propsError) {
		console.error('Error fetching properties for stats:', propsError);
	}

	// Fetch inquiries for demand & lead funnel intelligence
	let inquiries = [];
	try {
		const { data: inqData, error: inqError } = await supabase
			.from('inquiries')
			.select('*')
			.order('created_at', { ascending: false });

		if (!inqError && Array.isArray(inqData)) {
			inquiries = inqData;
		}
	} catch (err) {
		console.warn('Inquiries query fallback:', err);
	}

	const stats = calculateMarketStats(properties || [], inquiries);

	return {
		stats,
		user,
		is_admin: true,
		timestamp: new Date().toISOString()
	};
}
