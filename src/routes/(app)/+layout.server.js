/** @type {import('./$types').LayoutServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';

export async function load(event) {
	const session = await event.locals.getSession();

	if (!session.session) {
		// throw redirect(303, '/login');
		console.log('(app)/+layout.server:  session detected 👎');
	}

	/////// SANITY CHECK ////////
	// session contains user and session data plus flags for is_logged_in and is_admin
	if (session.session) {
		console.log('(app)/+layout.server: session detected 👍');
		console.log(`${session.is_admin ? '🌟' : '👻'}👤: ${session.user.id} 🌐${event.url.pathname}`);
	}

	return {};
}