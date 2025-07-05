/** @type {import('./$types').LayoutServerLoad} */
import { redirect, error, fail } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';


export async function load(event) {

	const { session, supabaseClient } = await getSupabase(event);

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