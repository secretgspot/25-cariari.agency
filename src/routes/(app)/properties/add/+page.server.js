/** @type {import('./$types').PageServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail } from '@sveltejs/kit';
import { isEmpty, pad } from '$lib/utils/helpers.js';
import { v4 as uuidv4 } from 'uuid'; // For unique file names

// You'll need to install uuid: npm install uuid

export async function load(event) {
	const { params, route } = event;

	const session = await event.locals.getSession();
	const supabaseClient = event.locals.supabase;

	if (!session.session) {
		redirect(307, '/login?redirectTo=/properties/add');
	}

	const getMsl = async () => {
		const { data, error: err } = await supabaseClient
			.from('properties')
			.select('msl')
			.order('msl', { ascending: false })
			.limit(1)
			.single();
		if (err) error(400, `💩 ${err.message}`);
		if (data) {
			// console.log('🐍 LAST MSL DIGIT', data.msl);
			return `CR-${pad(Number(data.msl.substring(3)) + 1, 3)}`;
		} else {
			// console.log('🐍 LAST MSL DIGIT NOT FOUND');
			return 'CR-001';
		}
	}

	return {
		msl: await getMsl(),
		session: session.session // Pass the session to the client for currentUserId in Uploader
	};
};

export const actions = {
	// ADD PROPERTY
	add: async (event) => {
		const { request, locals } = event; // Destructure locals to get supabaseClient and session
		const supabaseClient = locals.supabase;

		const { data: { session } } = await locals.supabase.auth.getSession();
		if (!session) {
			// The user is not signed in
			redirect(307, '/login?redirectTo=/properties/add'); // Redirect if not logged in
		}
		const userId = session.user.id; // Get the current user's ID

		const formData = await request.formData();

		// Extract property details
		const property = {
			user_id: userId, // Ensure user_id is from the authenticated session
			msl: formData.get('msl'),
			is_active: formData.get('is_active') ?? true,
			// is_active: Boolean(formData.get('is_active')),
			// is_active: true,
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

		// Extract files from formData
		const photos = formData.getAll('photos'); // This will be an array of File objects

		let newPropertyId = null;

		try {
			// 1. Insert new property into 'properties' table
			console.log('/properties/add/+page.server.js action -> add: ', property);
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

			// 2. Upload each photo to Supabase Storage
			for (const photo of photos) {
				// Ensure it's a File object and not empty
				if (!(photo instanceof File) || photo.size === 0) {
					continue;
				}

				const fileName = `${uuidv4()}-${photo.name.replace(/\s/g, '_')}`; // Unique filename
				const filePath = `${formData.get('msl')}/${fileName}`; // Path in storage bucket

				const { data: uploadData, error: uploadError } = await supabaseClient.storage
					.from('photos') // Your Supabase Storage bucket name
					.upload(filePath, photo, {
						cacheControl: '3600', // Cache for 1 hour
						upsert: false // Do not overwrite if file exists with same path
					});

				if (uploadError) {
					console.error('Error uploading photo:', uploadError);
					// Decide how to handle this: fail the whole operation, or log and continue
					// For now, we'll fail the operation if any photo upload fails.
					return fail(500, { message: `Failed to upload photo: ${photo.name}. Error: ${uploadError.message}` });
				}

				// Get public URL of the uploaded photo
				const { data: publicUrlData } = supabaseClient.storage
					.from('photos')
					.getPublicUrl(filePath);

				if (!publicUrlData || !publicUrlData.publicUrl) {
					console.error('Could not get public URL for photo:', filePath);
					return fail(500, { message: `Failed to get public URL for photo: ${photo.name}` });
				}

				photoRecords.push({
					property_id: newPropertyId,
					msl: property.msl,
					file_url: publicUrlData.publicUrl,
					file_path: filePath,
					name: photo.name, // Store original name
					user_id: userId, // Associate with the uploader
				});
			}

			// 3. Insert photo records into 'photos' table
			if (photoRecords.length > 0) {
				const { error: photosInsertError } = await supabaseClient
					.from('photos')
					.insert(photoRecords);

				if (photosInsertError) {
					console.error('Error inserting photo records:', photosInsertError);
					// This is a critical error, consider rolling back storage uploads
					// or marking the property for review.
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
