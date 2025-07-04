import '$lib/db';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// const jwt = event.cookies.get('jwt');
	// event.locals.user = jwt ? JSON.parse(atob(jwt)) : null;
	const { session, supabaseClient } = await getSupabase(event);

	/*
	can be accessed from server.js pages
	export const actions = {
		register: async ({request, locals}) => {
			...
			const {data, error: err} = await locals.sb.auth.signup({...})
		}
	}
	*/
	event.locals.sb = supabaseClient; // gives access to supabase on every serverload
	event.locals.session = session; // gives access to session on every load

	return resolve(event);
}