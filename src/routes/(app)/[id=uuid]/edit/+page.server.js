/** @type {import('./$types').PageServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, error, fail, json } from '@sveltejs/kit';
// import { isEmpty } from '$lib/utils/helpers.js';
import { v4 as uuidv4 } from 'uuid'; // For unique file names

export async function load(event) {
	const { params, url, locals } = event; // Destructure to get supabaseClient and session
	const supabaseClient = locals.supabase;

	const { data: { session } } = await locals.supabase.auth.getSession();

	if (!session) {
		const currentPath = url.pathname;
		// console.log('🐍 currentPath: ', currentPath);
		// redirect(307, `/login?redirectTo=${encodeURIComponent(currentPath)}`);
		redirect(307, `/login?redirectTo=${currentPath}`);
	}

	// Determine if the current user is an admim
	const isAdmin = session.user.app_metadata.claims_admin

	// console.log('(app)/[id=uuid]/edit/+page.server.js load -> isAdmin:', session.user.app_metadata.claims_admin);
	// console.log('(app)/[id=uuid]/edit/+page.server.js load -> session:', session);

	// Get the SLUG
	const { id: property_id } = params;
	// console.log('params:', params);

	// Fetch property details and associated photos
	// Ensure 'id' and 'user_id' are selected for photos for the Uploader component's logic
	const { data: property, error: err } = await supabaseClient
		.from('properties')
		.select(`*, photos(id, file_path, file_url, user_id)`) // Added id and user_id for photos
		.eq('id', property_id)
		.single();

	if (err) {
		console.error(`Can't get property with id: ${property_id}, ${err.message}`);
		error(404, `Can't get property with id: ${property_id}, ${err.message}`);
	}

	// Boot user to whom this property doesn't belong to as long as it's not admin
	if (session.user.id !== property.user_id && !isAdmin) {
		console.log('⛔ YOU DON"T BELONG HERE!')
		redirect(307, `/`);
	}

	// Filter out any photos that might have a null or undefined ID
	// This addresses the "each_key_duplicate" error if IDs are missing from DB records.
	const filteredPhotos = (property.photos || []).filter(photo => photo && photo.id);

	return {
		property,
		photos: filteredPhotos, // Pass the filtered array
		currentUserId: session.user.id, // Pass current user ID for Uploader
		isAdmin: isAdmin, // Pass isAdmin flag for Uploader
		session: session, // Pass the full session object if needed elsewhere
	};
}


export const actions = {

	// EDIT PROPERTY (and add new photos)
	edit: async (event) => {
		const { request, locals, params } = event; // Destructure locals and params
		const supabaseClient = locals.supabase;
		const { id: propertyId } = params; // Get propertyId from params

		const { data: { session } } = await locals.supabase.auth.getSession();
		if (!session) {
			// the user is not signed in
			redirect(307, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
		}
		const userId = session.user.id; // Get the current user's ID

		const formData = await request.formData();

		// Extract property details (excluding photos for now, they are handled separately)
		const propertyUpdates = {
			updated_at: new Date().toISOString(),
			msl: formData.get('msl'),
			is_active: Boolean(formData.get('is_active')),
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

		// console.log('/[uuid]/+layout.server.js action -> edit: ', property);

		// Extract new files from formData
		const newPhotos = formData.getAll('photos'); // This will be an array of File objects

		try {
			// 1. Update property details
			console.log(`Updating property ${propertyId}:`, propertyUpdates);
			const { data: resData, error: resErr } = await supabaseClient
				.from('properties')
				.update(propertyUpdates)
				.eq('id', propertyId) // Use propertyId from params
				.select('id, msl')
				.maybeSingle();

			if (resErr) {
				console.error('Error updating property details:', resErr);
				if (resErr instanceof AuthApiError && resErr.status === 400) {
					return fail(400, {
						error: true,
						message: `Unable to update property, ${resErr.message}`,
						property: propertyUpdates, // Return updated property for form re-population
					});
				}
				return fail(500, {
					error: true,
					message: `Unable to update property, ${resErr.message}`,
					property: propertyUpdates,
				});
			}

			const photoRecords = [];

			// 2. Upload each new photo to Supabase Storage
			for (const photo of newPhotos) {
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
					console.error('Error uploading new photo:', uploadError);
					// Decide how to handle this: fail the whole operation, or log and continue
					// For now, we'll fail the operation if any photo upload fails.
					return fail(500, { message: `Failed to upload new photo: ${photo.name}. Error: ${uploadError.message}` });
				}

				// Get public URL of the uploaded photo
				const { data: publicUrlData } = supabaseClient.storage
					.from('photos')
					.getPublicUrl(filePath);

				if (!publicUrlData || !publicUrlData.publicUrl) {
					console.error('Could not get public URL for new photo:', filePath);
					return fail(500, { message: `Failed to get public URL for new photo: ${photo.name}` });
				}

				photoRecords.push({
					property_id: propertyId,
					msl: formData.get('msl'),
					file_url: publicUrlData.publicUrl,
					file_path: filePath,
					name: photo.name, // Store original name
					user_id: userId, // Associate with the uploader
				});
			}

			// 3. Insert new photo records into 'photos' table
			if (photoRecords.length > 0) {
				const { error: photosInsertError } = await supabaseClient
					.from('photos')
					.insert(photoRecords);

				if (photosInsertError) {
					console.error('Error inserting new photo records:', photosInsertError);
					// This is a critical error, consider rolling back storage uploads
					// or marking the property for review.
					return fail(500, { message: 'Failed to save new photo references in the database.' });
				}
			}

			return {
				success: true,
				property_id: resData.id,
				message: `Property ${resData.msl} updated successfully!`
			};

		} catch (error) {
			console.error('Unhandled error in edit property action:', error);
			return fail(500, { message: error.message || 'An unexpected error occurred during property update.' });
		}
	},

	// DELETES PROPERTY
	delete: async (event) => {

		const { request } = event;
		const session = await event.locals.getSession();
		const supabaseClient = event.locals.supabase;

		if (!session) {
			// the user is not signed in
			error(403, { message: 'You need to log in to delete your listing' });
		}

		const formData = await request.formData();

		const property_id = formData.get('id');

		// push it to the server
		const { error: resErr } = await supabaseClient.from('properties').delete().eq('id', property_id);
		if (resErr) {
			if (resErr instanceof AuthApiError && resErr.status === 400) {
				return fail(400, {
					error: true,
					message: `Unable to delete property, ${resErr.message}`,
				});
			}
			return fail(500, {
				error: true,
				message: `Unable to delete property, ${resErr.message}`,
			});
		} else {
			redirect(303, '/properties');
		}
	},

	// DELISTS PROPERTY
	remove: async (event) => {
		const { request, locals } = event; // Destructure locals
		const supabaseClient = locals.supabase;

		const { data: { session } } = await locals.supabase.auth.getSession();
		if (!session) {
			error(403, { message: 'You need to log in to remove your listing' });
		}

		const formData = await request.formData();

		const property_id = formData.get('id');

		// push it to the server
		const { data: resData, error: resErr } = await supabaseClient.from('properties').update({ is_active: false }).eq('id', property_id).select().single();
		if (resErr) {
			if (resErr instanceof AuthApiError && resErr.status === 400) {
				return fail(400, {
					error: true,
					message: `Unable to delist property, ${resErr.message}`,
					resErr,
				});
			}
			return fail(500, {
				error: true,
				message: `Unable to delist property, ${resErr.message}`,
				resErr,
			});
		}

		return {
			success: true,
			message: `Property ${resData.msl} has been delisted!`,
			delisted: true
		}
	},

	// NEW ACTION: Delete a single photo
	deletePhoto: async ({ request, locals }) => {
		const supabaseClient = locals.supabase;

		const { data: { session } } = await locals.supabase.auth.getSession();
		if (!session) {
			return json({ success: false, message: 'Unauthorized' }, { status: 401 });
		}
		const userId = session.user.id;

		const formData = await request.formData();
		const photoId = formData.get('photoId');
		const filePath = formData.get('filePath');

		if (!photoId || !filePath) {
			return json({ success: false, message: 'Photo ID and file path are required.' }, { status: 400 });
		}

		try {
			// First, verify authorization: check if the user owns the photo or is an admin
			const { data: photoData, error: fetchPhotoError } = await supabaseClient
				.from('photos')
				.select('user_id')
				.eq('id', photoId)
				.single();

			if (fetchPhotoError || !photoData) {
				console.error('Error fetching photo for deletion check:', fetchPhotoError);
				return json({ success: false, message: 'Photo not found or access denied.' }, { status: 404 });
			}

			// Implement your isAdmin logic here (e.g., from user roles in session)
			const isAdmin = false; // Placeholder for actual admin check

			if (photoData.user_id !== userId && !isAdmin) {
				return json({ success: false, message: 'You are not authorized to delete this photo.' }, { status: 403 });
			}

			// 1. Delete from Supabase Storage
			const { error: storageError } = await supabaseClient.storage
				.from('photos') // Your Supabase Storage bucket name
				.remove([filePath]);

			if (storageError) {
				console.error('Error deleting photo from storage:', storageError);
				return json({ success: false, message: `Failed to delete photo from storage: ${storageError.message}` }, { status: 500 });
			}

			// 2. Delete record from 'photos' table
			const { error: dbError } = await supabaseClient
				.from('photos')
				.delete()
				.eq('id', photoId);

			if (dbError) {
				console.error('Error deleting photo record from DB:', dbError);
				return json({ success: false, message: `Failed to delete photo record: ${dbError.message}` }, { status: 500 });
			}

			return {
				success: true,
				message: `Photo deleted successfully.`
			}

		} catch (error) {
			console.error('Unhandled error in deletePhoto action:', error);
			return {
				success: false,
				message: error.message || 'An unexpected error occurred during photo deletion.'
			}
			// return json({ success: false, message: error.message || 'An unexpected error occurred during photo deletion.' }, { status: 500 });
		}
	},
};