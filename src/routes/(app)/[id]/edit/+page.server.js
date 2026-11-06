/** @type {import('./$types').PageServerLoad} */
import { AuthApiError } from '@supabase/supabase-js';
import { redirect, fail } from '@sveltejs/kit';
// import { isEmpty } from '#lib/utils/validators.js';
import { v4 as uuidv4 } from 'uuid'; // For unique file names

export async function load(event) {
	const { params, url, locals } = event; // Destructure to get supabaseClient and session
	const supabaseClient = locals.supabase;

	const { data: { user }, error: authError } = await locals.supabase.auth.getUser();

	if (authError || !user) {
		const currentPath = url.pathname;
		redirect(307, `/login?redirectTo=${currentPath}`);
	}

	// Determine if the current user is an admin
	const isAdmin = user.app_metadata.claims_admin

	// console.log('(app)/[id=uuid]/edit/+page.server.js load -> isAdmin:', user.app_metadata.claims_admin);
	// console.log('(app)/[id=uuid]/edit/+page.server.js load -> user:', user);

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
	if (user.id !== property.user_id && !isAdmin) {
		console.warn(`⛔ User ${user.id} denied access to edit property ${property.msl}`);
		redirect(307, `/`);
	}

	// Filter out any photos that might have a null or undefined ID
	// This addresses the "each_key_duplicate" error if IDs are missing from DB records.
	const filteredPhotos = (property.photos || []).filter(photo => photo && photo.id);

	// Get auth cookies for client
	const { data: { session } } = await supabaseClient.auth.getSession();
	const cookies = session?.cookies || [];

	return {
		property,
		photos: filteredPhotos, // Pass the filtered array
		currentUserId: user.id, // Pass current user ID for Uploader
		isAdmin, // Pass isAdmin flag for Uploader
		user, // Pass the user object
		cookies // Pass cookies for client auth
	};
}


export const actions = {

	// EDIT PROPERTY (and add new photos)
	edit: async (event) => {
		const { request, locals, params } = event; // Destructure locals and params
		const supabaseClient = locals.supabase;
		const { id: propertyId } = params; // Get propertyId from params

		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (!user || authError) {
			// the user is not signed in
			redirect(307, `/login?redirectTo=${encodeURIComponent(event.url.pathname)}`);
		}
		const userId = user.id; // Get the current user's ID

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
		const propertyLabel = String(propertyUpdates.msl || propertyId)
			.replace(/[\u0000-\u001f\u007f]/g, ' ')
			.slice(0, 100);

		// 1. Get the uploaded photo URLs/paths from the formData
		// This will be an array of strings (JSON stringified URLs/paths)
		const photoDataStrings = formData.getAll('photo_urls_and_paths');
		let uploadedPhotoDetails = [];
		if (photoDataStrings.length > 0) {
			uploadedPhotoDetails = photoDataStrings.map(str => JSON.parse(str));
		}

		try {
			// 1. Update property details
			// console.log(`Updating property ${propertyId}:`, propertyUpdates);
			const { data: resData, error: resErr } = await supabaseClient
				.from('properties')
				.update(propertyUpdates)
				.eq('id', propertyId) // Use propertyId from params
				.select('id, msl')
				// .select(`*, photos(id, file_path, file_url, user_id)`)
				.maybeSingle();

			if (resErr) {
				console.error(`❌ Failed to update property ${propertyLabel} for user ${userId}:`, resErr.message);
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
					property,
				});
			}

			// 2. Handle photo deletions
			const photosToDeleteStrings = formData.getAll('photos_to_delete');
			let photosToDelete = [];
			if (photosToDeleteStrings.length > 0) {
				photosToDelete = photosToDeleteStrings.map(str => JSON.parse(str));
			}

			if (photosToDelete.length > 0) {
				const filePathsToDelete = photosToDelete.map(p => p.file_path);
				const photoIdsToDelete = photosToDelete.map(p => p.id);

				// Delete from Supabase Storage
				const { error: storageError } = await supabaseClient.storage
					.from('photos')
					.remove(filePathsToDelete);

				if (storageError) {
					console.error(`🖼️ Failed to delete ${filePathsToDelete.length} photos from storage for property ${propertyLabel} by user ${userId}:`, storageError.message);
					// Decide if you want to fail the whole update or just log the error
				}

				// Delete from 'photos' table
				const { error: dbError } = await supabaseClient
					.from('photos')
					.delete()
					.in('id', photoIdsToDelete);

				if (dbError) {
					console.error(`🖼️ Failed to delete ${photoIdsToDelete.length} photo records for property ${propertyLabel} by user ${userId}:`, dbError.message);
					// Decide if you want to fail the whole update or just log the error
				}
			}

			// 3. Handle new photo uploads
			if (uploadedPhotoDetails.length > 0) {
				const photoRecords = uploadedPhotoDetails.map(detail => ({
					property_id: propertyId,
					msl: propertyUpdates.msl,
					file_url: detail.publicUrl,
					file_path: detail.filePath,
					name: detail.originalName,
					user_id: userId,
				}));

				const { error: photosInsertError } = await supabaseClient
					.from('photos')
					.insert(photoRecords);

				if (photosInsertError) {
					console.error(`🖼️ Failed to save ${photoRecords.length} new photo records for property ${propertyLabel} by user ${userId}:`, photosInsertError.message);
					return fail(500, { message: 'Failed to save new photo references.' });
				}
			}

			console.log(`✏️🏠 Property ${resData.msl} updated by user ${userId} (${uploadedPhotoDetails.length} photos added, ${photosToDelete.length} removals requested)`);
			return {
				success: true,
				property_id: resData.id,
				message: `Property ${resData.msl} updated successfully!`
			};

		} catch (error) {
			console.error(`❌ Unexpected error updating property ${propertyLabel} for user ${userId}:`, error.message);
			return fail(500, { message: error.message || 'An unexpected error occurred during property update.' });
		}
	},

	// DELETES PROPERTY
	delete: async (event) => {

		const { request, params } = event;
		const supabaseClient = event.locals.supabase;
		const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

		if (!user || authError) {
			// the user is not signed in
			error(403, { message: 'You need to log in to delete your listing' });
		}

		const formData = await request.formData();

		const property_id = formData.get('id') || params.id;
		const msl = formData.get('msl');
		const propertyLabel = String(msl || property_id || 'unknown')
			.replace(/[\u0000-\u001f\u007f]/g, ' ')
			.slice(0, 100);
		let removedStoragePhotoCount = 0;

		// 1. Delete associated photos from Supabase Storage bucket
		const filesToRemove = new Set();

		// Fetch photo records from DB
		const { data: photoRecords, error: photoRecordsError } = await supabaseClient
			.from('photos')
			.select('file_path')
			.eq('property_id', property_id);

		if (photoRecordsError) {
			console.error(`🖼️ Failed to load photo records for property ${property_id} before deletion by user ${user.id}:`, photoRecordsError.message);
		}

		if (photoRecords && photoRecords.length > 0) {
			for (const p of photoRecords) {
				if (p.file_path) filesToRemove.add(p.file_path);
			}
		}

		// Also list files in storage bucket under the property's MSL folder
		if (msl) {
			const { data: bucketFiles, error: bucketListError } = await supabaseClient.storage
				.from('photos')
				.list(msl);

			if (bucketListError) {
				console.error(`🖼️ Failed to list storage photos for property ${msl} before deletion by user ${user.id}:`, bucketListError.message);
			}

			if (bucketFiles && bucketFiles.length > 0) {
				for (const f of bucketFiles) {
					if (f.name) filesToRemove.add(`${msl}/${f.name}`);
				}
			}
		}

		if (filesToRemove.size > 0) {
			const { error: storageError } = await supabaseClient.storage
				.from('photos')
				.remove(Array.from(filesToRemove));

			if (storageError) {
				console.error(`🖼️ Failed to delete ${filesToRemove.size} storage photos for property ${propertyLabel} by user ${user.id}:`, storageError.message);
			} else {
				removedStoragePhotoCount = filesToRemove.size;
			}
		}

		// 2. Delete property from DB (cascades to 'photos' and 'inquiries' tables)
		const { error: resErr } = await supabaseClient.from('properties').delete().eq('id', property_id);
		if (resErr) {
			console.error(`❌ Failed to delete property ${propertyLabel} by user ${user.id}:`, resErr.message);
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
			console.log(`🗑️🏠 Property ${propertyLabel} deleted by user ${user.id} (${removedStoragePhotoCount} storage photos removed)`);
			redirect(303, '/properties');
		}
	},

	// DELISTS PROPERTY
	remove: async (event) => {
		const { request, locals } = event; // Destructure locals
		const supabaseClient = locals.supabase;

		const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
		if (!user || authError) {
			error(403, { message: 'You need to log in to remove your listing' });
		}

		const formData = await request.formData();

		const property_id = formData.get('id');

		// push it to the server
		const { data: resData, error: resErr } = await supabaseClient.from('properties').update({ is_active: false }).eq('id', property_id).select().single();
		if (resErr) {
			console.error(`❌ Failed to delist property ${property_id} by user ${user.id}:`, resErr.message);
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

		console.log(`📦🏠 Property ${resData.msl} delisted by user ${user.id}`);
		return {
			success: true,
			message: `Property ${resData.msl} has been delisted!`,
			delisted: true
		}
	},
};
