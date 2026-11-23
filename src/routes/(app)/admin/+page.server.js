import { redirect, error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const session = await event.locals.getSession();
	const user = session?.user;
	const is_admin = session?.is_admin;

	if (!user) {
		redirect(307, '/login?redirectTo=/admin');
	}

	if (!is_admin) {
		error(403, 'Unauthorized: Administrator access required');
	}

	const supabase = event.locals.supabase;

	// Fetch quick counts for the hub cards
	const { count: propertyCount } = await supabase
		.from('properties_preview')
		.select('*', { count: 'exact', head: true })
		.eq('is_active', true);

	let inquiryCount = 0;
	try {
		const { count } = await supabase
			.from('inquiries')
			.select('*', { count: 'exact', head: true });
		inquiryCount = count ?? 0;
	} catch (e) {
		console.warn('Inquiries count head query warning:', e);
	}

	return {
		user,
		is_admin: true,
		quickCounts: {
			activeProperties: propertyCount ?? 0,
			totalInquiries: inquiryCount
		}
	};
}
