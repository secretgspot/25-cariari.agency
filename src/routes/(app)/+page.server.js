/** @type {import('./$types').LayoutServerLoad} */
import { redirect, error, fail } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';


export async function load(event) {

	const session = await event.locals.getSession();
	const supabaseClient = event.locals.supabase;

	if (!session) {
		console.log('(app)/+page.server 🥽');
	}

	const getProperties = async () => {
		const { data, error: err } = await supabaseClient.from('properties')
			.select('*');
		if (err) error(400, `💩 ${err.message}`);
		return data;
	}

	return {
		loading: true,
		properties: await getProperties(),
	};
};