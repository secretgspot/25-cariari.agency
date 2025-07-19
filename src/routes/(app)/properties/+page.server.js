
import { error } from '@sveltejs/kit';

export async function load(event) {
	const supabaseClient = event.locals.supabase;

	const { data, error: err } = await supabaseClient.from('properties_preview')
		.select('*')
		.order('created_at', { ascending: false })
		.order('updated_at', { ascending: false });

	if (err) error(400, `💩 ${err.message}`);

	return {
		properties: data,
	};
};