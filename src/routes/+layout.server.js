/** @type {import('./$types').LayoutServerLoad} */
import { getServerSession } from '@supabase/auth-helpers-sveltekit';
// import { error } from '@sveltejs/kit';
// import db, { supabase } from '$lib/db';

export async function load(event) {
	// console.log('/+layout.server.js event: ', event);
	// const { locals } = event;

	// console.log('/+layout.server.js locals', locals)

	// TODO: 🚩 WHAT CAN BE DONE HERE?

	return {
		session: await getServerSession(event),
		// countries: getContries(),
		// currentAdmin: event.locals.currentAdmin,
	};
}