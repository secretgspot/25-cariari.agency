/** @type {import('./$types').LayoutServerLoad} */
// import { error } from '@sveltejs/kit';

export async function load({ locals: { getSession, supabase } }) {
	const { session, user, is_logged_in, is_admin } = await getSession();

	return {
		session,
		user,
		is_logged_in,
		is_admin,
	};
}