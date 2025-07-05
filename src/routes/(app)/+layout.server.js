/** @type {import('./$types').LayoutServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';

export async function load(event) {
	const session = await event.locals.getSession();

	if (!session.session) {
		// throw redirect(303, '/login');
		console.log('(app)/+layout.server 👓 no session');
	}

	/////// SANITY CHECK ////////
	if (session.session) {
		console.log('(app)/+layout.server 🎈 session detected');
		console.log('logged in:', session.is_logged_in);
		console.log('isAdmin:', session.is_admin);
	}

	/////// EVERYTHING WENT WELL, USER GOT ALL DETAILS /////////////////////////////
	// const user = await session.user;

	return {
		// loading: false,
		// user_data: {
		// 	user_id: user?.id,
		// 	admin: Boolean(user?.app_metadata.claims_admin),
		// 	active: Boolean(user?.user_metadata.active),
		// 	name: user?.user_metadata.name,
		// 	email: user?.email,
		// 	phone: user?.user_metadata.phone,
		// }
	};
}