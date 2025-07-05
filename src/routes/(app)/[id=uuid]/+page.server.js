import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load(event) {
	const supabaseClient = event.locals.supabase;
	const { id } = event.params;

	const { data: property, error: err } = await supabaseClient
		.from('properties')
		.select(`*, photos(file_path, file_url)`)
		.eq('id', id)
		.order('created_at', { referencedTable: 'photos', ascending: true })
		.single();

	if (err) error(404, `Can't get property with id: ${id}, ${err.message}`);

	return {
		property
	};
}
