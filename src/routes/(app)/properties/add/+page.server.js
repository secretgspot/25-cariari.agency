/** @type {import('./$types').PageServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect, error, fail } from '@sveltejs/kit';
import { isEmpty } from '$lib/utils/helpers.js';

export async function load(event) {
	// console.log('/formulario/edit/[msl]+page.server.js event: ', event);
	// something returned from +layout.server.js
	// const { something } = await parent();
	const { params, route } = event;

	const { session, supabaseClient } = await getSupabase(event);

	// if (!session) {
	// 	throw redirect(303, '/login');
	// }


	// if (session?.user.app_metadata.claims_admin) {
	// 	console.log('🌟');
	// }


	return {
		logged_in: session ? true : false,
	};
};

export const actions = {

	// ADD PROPERTY
	add: async (event) => {

		const { request, locals } = event;
		// const { session, supabaseClient } = await getSupabase(event);

		// if (!session) {
		// 	// the user is not signed in
		// 	throw error(403, { message: 'You need to log in to edit your listing' });
		// }

		const formData = await request.formData();

		const property = {
			// updated_at: new Date().toISOString(),
			user_id: formData.get('user_id'),
			msl: formData.get('msl'),
			is_active: (formData.get('is_active') == 'Listed' ? true : false),
			description: formData.get('description'),
			address: formData.get('address'),
			location: JSON.parse(formData.get('location')),
			land_use: formData.get('land_use'),
			property_for: JSON.parse(formData.get('property_for')),
			lot_size: Number(formData.get('lot_size')),
			year_built: Number(formData.get('year_built')),
			building_size: Number(formData.get('building_size')),
			building_style: formData.get('building_style'),
			rooms: Number(formData.get('rooms')),
			beds: Number(formData.get('beds')),
			baths: Number(formData.get('baths')),
			half_baths: Number(formData.get('half_baths')),
			parking_spaces: Number(formData.get('parking_spaces')),
			features: JSON.parse(formData.get('features')),
			price: Number(formData.get('price')),
			rent: Number(formData.get('rent')),
			fees: Number(formData.get('fees')),
			taxes: Number(formData.get('taxes')),
			contact_email: formData.get('contact_email'),
			contact_phone: formData.get('contact_phone'),
			contact_realtor: formData.get('contact_realtor'),
		}

		// console.log('/properties/add/+page.server.js action -> add: ', property);

		// push it to the server
		const { data: resData, error: resErr } = await locals.sb.from('properties').insert(property).select().maybeSingle();
		if (resErr) {
			if (resErr instanceof AuthApiError && resErr.status === 400) {
				return fail(400, {
					error: true,
					message: `Unable to add property, ${resErr.message}`,
					property,
				});
			}
			return fail(500, {
				error: true,
				message: `Unable to add property, ${resErr.message}`,
				property,
			});
		}

		return {
			success: true,
			property_id: resData.id,
			message: `Property ${resData.msl} added successfully!`
		}

	},
}