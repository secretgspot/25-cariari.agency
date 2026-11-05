
import { error, fail } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const countValue = formData.get('visibleCount');
		const visibleCount = typeof countValue === 'string' && /^[1-9]\d*$/.test(countValue)
			? Number(countValue)
			: null;

		if (!Number.isSafeInteger(visibleCount)) {
			return fail(400, {
				error: 'The requested number of visible properties is invalid.',
				visibleCount: 24
			});
		}

		return { visibleCount };
	}
};

export async function load(event) {
	const supabaseClient = event.locals.supabase;

	const { data, error: err } = await supabaseClient.from('properties_preview')
		.select('*')
		.order('created_at', { ascending: false })
		.order('updated_at', { ascending: false })
		.order('id', { ascending: false });

	if (err) error(400, `💩 ${err.message}`);

	return {
		properties: data,
	};
};