/** @type {import('./$types').LayoutServerLoad} */
import { redirect, error, fail } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';


export async function load(event) {

	const session = await event.locals.getSession();
	const supabaseClient = event.locals.supabase;

	if (!session) {
		console.log('🥽');
	}

	const getProperties = async () => {
		const { data, error: err } = await supabaseClient.from('properties_preview')
			.select('*').order('created_at', { ascending: false });
		if (err) error(400, `💩 ${err.message}`);

		return data;
	}

	return {
		properties: getProperties(),
	};
};