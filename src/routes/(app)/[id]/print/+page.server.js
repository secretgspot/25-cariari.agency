import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const supabaseClient = event.locals.supabase;
	const { id } = event.params;

	const { data: property, error: err } = await supabaseClient
		.from('properties')
		.select(`*`)
		.eq('id', id)
		.single();

	if (err) error(404, `Can't get property with id: ${id}, ${err.message}`);

	return {
		property
	};
}
