/** @type {import('./$types').PageServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';
import { isEmpty, pad } from '$lib/utils/helpers.js';
// import { v4 as uuidv4 } from 'uuid'; // For unique file names
// You'll need to install uuid: npm install uuid

export async function load(event) {
	const { params, route } = event;

	const supabaseClient = event.locals.supabase;
	const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

	if (authError || !user) {
		redirect(307, '/login?redirectTo=/properties/add');
	}

	const getMsl = async () => {
		const { data: allMsls, error: err } = await supabaseClient
			.from('properties')
			.select('msl'); // Fetch all MSLs

		if (err) {
			error(400, `Failed to fetch MSLs: ${err.message}`);
		}

		const existingMslNumbers = new Set();
		if (allMsls && allMsls.length > 0) {
			for (const prop of allMsls) {
				const mslNum = Number(prop.msl.substring(3)); // Extract numeric part
				if (!isNaN(mslNum)) {
					existingMslNumbers.add(mslNum);
				}
			}
		}

		let nextMslNumber = 1;
		// Loop to find the smallest available MSL number
		while (existingMslNumbers.has(nextMslNumber)) {
			nextMslNumber++;
		}

		return `CR-${pad(nextMslNumber, 3)}`;
	}

	return {
		msl: await getMsl(),
		user // Pass the user to the client for currentUserId in Uploader
	};
};

export const actions = {
	// ADD PROPERTY
	add: async (event) => {
		const { request, locals } = event; // Destructure locals to get supabaseClient
		const supabaseClient = locals.supabase;

		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (!user || authError) {
			// The user is not signed in
			redirect(307, '/login?redirectTo=/properties/add'); // Redirect if not logged in
		}
		const userId = user.id; // Get the current user's ID

		const formData = await request.formData();

		// console.log("(app)/properties/add/+page.server.js formData is_active: ", formData.get('is_active'));

		// Extract property details
		const property = {
			user_id: userId, // Ensure user_id is from the authenticated session
			msl: formData.get('msl'),
			// is_active: formData.get('is_active') ?? true,
			// is_active: Boolean(formData.get('is_active')),
			// is_active: true,
			is_active: !['off', 'false'].includes((formData.get('is_active') || '').toLowerCase()),
			// is_active: ['on', 'true'].includes(formData.get('is_active')),
			// is_active: (formData.get('is_active') == 'on' ? true : false),
			// is_active: (formData.get('is_active') == 'Listed' ? true : false),
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
		};

		// 1. Get the uploaded photo URLs/paths from the formData
		// This will be an array of strings (JSON stringified URLs/paths)
		const photoDataStrings = formData.getAll('photo_urls_and_paths');
		let uploadedPhotoDetails = [];
		if (photoDataStrings.length > 0) {
			uploadedPhotoDetails = photoDataStrings.map(str => JSON.parse(str));
		}

		let newPropertyId = null;

		try {
			// 1. Insert new property into 'properties' table
			// console.log('/properties/add/+page.server.js action -> add: ', property);
			const { data: resData, error: resErr } = await supabaseClient
				.from('properties')
				.insert(property)
				.select('id, msl') // Select the id and msl for later use
				.maybeSingle();

			if (resErr) {
				console.error('Error inserting property:', resErr);
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

			newPropertyId = resData.id; // Get the ID of the newly created property
			const photoRecords = [];

			// 2. Prepare photo records using the already uploaded details from the client
			for (const photoDetail of uploadedPhotoDetails) {
				photoRecords.push({
					property_id: newPropertyId,
					msl: property.msl, // Using MSL from the newly created property
					file_url: photoDetail.publicUrl,
					file_path: photoDetail.filePath,
					name: photoDetail.originalName,
					user_id: userId,
				});
			}

			// 3. Insert photo records into 'photos' table
			if (photoRecords.length > 0) {
				const { error: photosInsertError } = await supabaseClient
					.from('photos')
					.insert(photoRecords);

				if (photosInsertError) {
					console.error('Error inserting photo records:', photosInsertError);
					// Consider cleanup here if property was created but photo records failed
					return fail(500, { message: 'Failed to save photo references in the database.' });
				}
			}

			return {
				success: true,
				property_id: resData.id,
				message: `Property ${resData.msl} added successfully!`
			};

		} catch (error) {
			console.error('Unhandled error in add property action:', error);
			// If a property was created but photo upload failed, you might want to clean up
			if (newPropertyId) {
				// Optionally delete the property if no photos were successfully linked
				// await supabaseClient.from('properties').delete().eq('id', newPropertyId);
			}
			return fail(500, { message: error.message || 'An unexpected error occurred during property creation.' });
		}
	},
};