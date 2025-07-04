/** @type {import('./$types').LayoutServerLoad} */
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';

export async function load(event) {
	// console.log('/+page.js data: ', data);
	// const { parent } = event;
	// const session = await parent();
	// console.log('/+page.js parent: ', session.user.id);
	const { session, supabaseClient } = await getSupabase(event);

	if (!session) {
		// throw redirect(303, '/login');
		console.log('juss 👓');
	}

	/////// SANITY CHECK ////////
	if (session) {
		console.log('🎈');
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