/** @type {import('./$types').LayoutServerLoad} */
// import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';

export async function load(event) {
	const { data: { user }, error: authError } = await event.locals.supabase.auth.getUser();

	if (!user || authError) {
		console.log('(app)/+layout.server: no authenticated user detected 👎');
		return {};
	}

	// Get auth cookies for client
	const { data: { session } } = await event.locals.supabase.auth.getSession();
	const cookies = session?.cookies || [];

	/////// SANITY CHECK ////////
	const is_admin = user.app_metadata?.claims_admin || false;
	console.log('(app)/+layout.server: authenticated user detected 👍');
	console.log(`${is_admin ? '🔥' : '👻'}👤: ${user.id} 🌐${event.url.pathname}`);

	return {
		user,
		is_admin,
		cookies
	}

	return {};
}