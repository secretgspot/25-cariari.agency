/** @type {import('./$types').LayoutServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { getSupabase } from '@supabase/auth-helpers-sveltekit';
import { redirect, error, fail } from '@sveltejs/kit';
import { isEmpty } from '$lib/utils/helpers.js';

export async function load(event) {
	// console.log('/formulario/edit/[msl]+page.server.js event: ', event);
	// something returned from +layout.server.js
	// const { something } = await parent();
	const { params, url, route } = event;

	const { session, supabaseClient } = await getSupabase(event);
	if (session?.user.app_metadata.claims_admin) {
		console.log('🌟');
	}

	// Get the SLUG
	const { id: property_id } = params;
	// console.log('🎀', url, route)


	const getPropertyDetails = async () => {
		const { data: propertyData, error: propertyErr } = await supabaseClient
			.from('properties')
			.select('*')
			.eq('id', property_id).single();
		if (propertyErr) error(500, `Can't get property with id: ${property_id}, ${propertyErr.message}`);

		if (propertyData) {
			console.log(`📷 check photos for ${propertyData.msl}`)
			const { data: photosData, error: photosErr } = await supabaseClient
				.from("photos")
				.select("*")
				.eq("msl", propertyData.msl).order('name', { ascending: true });
			if (!isEmpty(photosData)) {
				console.log('📷📷 photos detected', photosData.length)
				propertyData.photos = photosData;
			};
		}

		return propertyData;
	}
	// const getPropertyDetails = async () => {
	// 	const { data: propertyData, error: propertyErr } = await supabaseClient
	// 		.from('properties')
	// 		.select('*,photos(*)')
	// 		.eq('id', property_id).single();
	// 	if (propertyErr) throw error(500, `Can't get property with id: ${property_id}, ${propertyErr.message}`)

	// 	return propertyData;
	// }

	return {
		property: getPropertyDetails(),
		hostname: url.host,
	};
};
