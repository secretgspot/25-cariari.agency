<script>
	/** @type {import('./$types').PageData} */

	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance, applyAction } from '$app/forms';
	import { v4 as uuidv4 } from 'uuid'; // For unique file names
	import Compressor from 'compressorjs';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import { Button } from '$lib/buttons';
	import Checkboxes from '$lib/Checkboxes.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import Select from '$lib/Select.svelte';
	import MapPicker from '$lib/map/MapPicker.svelte'; // MapPickerLibre
	import Uploader from '$lib/Uploader.svelte';
	import Notify from '$lib/Notify.svelte';
	import {
		isEmpty,
		getPosition,
		addFeature,
		removeFeature,
		enter,
	} from '$lib/utils/helpers.js';
	// import JsonDump from '$lib/JSONDump.svelte';

	let { data } = $props();
	// console.log('(app)/[id=uuid]/edit/+page.svelte data:', data);

	let propertyData = $state({
		...data.property,
		property_for: data.property?.property_for || [],
		features: data.property?.features || [],
		photos: data.property?.photos || [],
		location: data.property?.location || { lat: null, lng: null },
	});
	// $inspect('(app)/[id=uuid]/edit/+page.svelte form:', propertyData);
	// $inspect('(app)/[id=uuid]/edit/+page.svelte session:', data.session);

	let newPhotosToUpload = $state([]); // Bindable for Uploader
	let featureInput;

	let loading = $state(false),
		isError = $state(false),
		error = $state(''),
		message = $state(''),
		isAdmin = data.is_admin || false,
		uploadingPhotos = $state(false),
		uploadedPhotoDetails = $state([]),
		gps = $state();

	// Function to handle photo uploads to Supabase Storage directly from client
	async function uploadPhotos() {
		if (newPhotosToUpload.length === 0) {
			return { success: true, details: [] };
		}

		uploadingPhotos = true;
		const uploadPromises = newPhotosToUpload.map(async (file) => {
			// Compress the image before uploading
			const compressedFile = await new Promise((resolve, reject) => {
				new Compressor(file, {
					quality: 0.6, // 60% quality
					maxWidth: 1920, // Max width of 1280px
					maxHeight: 1080,
					convertSize: 1000000, // files larger than 1mb converted to jpg
					success(result) {
						resolve(result);
					},
					error(err) {
						reject(err);
					},
				});
			});

			const fileName = `${uuidv4()}-${compressedFile.name.replace(/\s/g, '_')}`; // Use crypto.randomUUID() for client-side UUID
			const filePath = `${propertyData.msl}/${fileName}`; // Path in storage bucket

			try {
				const { data: uploadData, error: uploadError } = await data.supabase.storage
					.from('photos') // Your Supabase Storage bucket name
					.upload(filePath, compressedFile, {
						cacheControl: '3600',
						upsert: false, // Do not overwrite if file exists with same path
					});

				if (uploadError) {
					console.error('Error uploading photo:', uploadError);
					throw new Error(
						`Failed to upload photo: ${file.name}. Error: ${uploadError.message}`,
					);
				}

				const { data: publicUrlData } = data.supabase.storage
					.from('photos')
					.getPublicUrl(filePath);

				if (!publicUrlData || !publicUrlData.publicUrl) {
					throw new Error(`Could not get public URL for photo: ${filePath}`);
				}

				return {
					publicUrl: publicUrlData.publicUrl,
					filePath: filePath,
					originalName: file.name,
				};
			} catch (err) {
				console.error(`Upload failed for ${file.name}:`, err);
				addToast({
					message: `Failed to upload photo ${file.name}: ${err.message}`,
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
				return null; // Return null for failed uploads
			}
		});

		const results = await Promise.all(uploadPromises);
		uploadedPhotoDetails = results.filter((detail) => detail !== null); // Filter out failed uploads
		uploadingPhotos = false;

		if (uploadedPhotoDetails.length !== newPhotosToUpload.length) {
			// Some uploads failed
			error = `Not all photos were uploaded. Successfully uploaded ${uploadedPhotoDetails.length} out of ${newPhotosToUpload.length}. Check console for details.`;
			return { success: false, details: uploadedPhotoDetails };
		}

		return { success: true, details: uploadedPhotoDetails };
	}

	/**
	 * Handles the custom event dispatched from Uploader to delete an existing photo.
	 * This will trigger a separate form action.
	 * @param {Object} photo - The photo object to delete (from Uploader).
	 */
	async function handleDeleteExistingPhoto(photo) {
		const { id, file_path } = photo; // Access id and file_path directly from the passed photo object
		loading = true;
		message = 'Deleting photo...';
		isError = false;

		// Use a separate form action for deletion
		const deleteFormData = new FormData();
		deleteFormData.append('photoId', id);
		deleteFormData.append('filePath', file_path);

		const response = await fetch('?/deletePhoto', {
			// Call the new deletePhoto action
			method: 'POST',
			body: deleteFormData,
		});

		const result = await response.json(); // Assuming your action returns JSON

		loading = false;
		if (response.ok) {
			message = 'Photo deleted successfully!';
			isError = false;
			// Optimistically update the UI by removing the photo
			propertyData.photos = propertyData.photos.filter((p) => p.id !== id);
		} else {
			message = `Error deleting photo: ${result.message}`;
			isError = true;
		}
	}
</script>

<svelte:head>
	<title>Editing {propertyData.msl} - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
	<Nav />
{/if}

<form
	class="edit-property"
	method="POST"
	enctype="multipart/form-data"
	use:enhance={async ({ form: htmlFormElement, formData, action, cancel }) => {
		// 'htmlFormElement' is the '<form>' element
		// 'formData' is it's 'FormData' object
		// 'action' is the URL to which the form is posted
		// 'cancel()' will prevent the submission

		// ALL THIS RUNS BEFORE SUBMISSION TO SERVER
		loading = true;
		message = '';
		error = '';

		if (isEmpty(propertyData.property_for)) {
			cancel();
			error = 'Must select at least one for PROPERTY FOR in Property Type section';
			loading = false;
			return; // Stop execution if validation fails
		}

		// Client-side photo upload
		const uploadResult = await uploadPhotos();

		if (!uploadResult.success) {
			cancel(); // Stop form submission if uploads fail
			loading = false;
			// The error message is already set inside uploadPhotos
			return;
		}

		// Append uploaded photo details to the form data
		// The server action expects 'photo_urls_and_paths'
		formData.delete('photo_urls_and_paths'); // Clear any existing values
		uploadResult.details.forEach((detail) => {
			formData.append('photo_urls_and_paths', JSON.stringify(detail));
		});

		// prevent default callback from resetting the form
		return async ({ result, update }) => {
			// console.log('/[id=uuid]/edit/+page.svelte result: ', result);
			if (result.type === 'success') {
				if (result.data.delisted) {
					propertyData.is_active = false;
				}
				message = result.data.message;
				await applyAction(result);
			}

			if (result.type === 'invalid') {
				error = result.data.message;
				await applyAction(result);
			}
			loading = false;
			update({ reset: false });
		};
	}}>
	<!-- PROPERTY TYPE -->
	<section class="section section_property_type">
		<div class="header">
			<h3>Property type</h3>
			<p>
				Categories listing in appropriate section and coloring on the map. Is part of
				filtering.
			</p>
		</div>

		<div class="inputs">
			{#if isAdmin || propertyData.user_id === data.session.user.id}
				<fieldset>
					<legend>Status</legend>
					<Toggle
						name="is_active"
						bind:checked={propertyData.is_active}
						label={propertyData.is_active ? 'Listed' : 'Delisted'}
						kind="flip"
						colored
						on="Listed"
						off="Delisted" />
				</fieldset>
			{/if}

			<fieldset class={propertyData.is_active ? 'active' : 'removed'}>
				<legend>MSL</legend>
				<input
					type="text"
					placeholder="ex: CR-001"
					bind:value={propertyData.msl}
					disabled />
			</fieldset>

			<fieldset>
				<legend>Land Use</legend>
				<Select name="land_use" bind:selected={propertyData.land_use} />
			</fieldset>

			<fieldset class="flow">
				<legend>Property For</legend>
				<Checkboxes bind:selected={propertyData.property_for} kind="square" />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY LOCATION -->
	<section class="section section_location">
		<div class="header">
			<h3>Location</h3>
			<p>
				GPS coordinates and physical address. Location displayed on map via GPS, accuracy
				is important.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Address</legend>
				<input
					type="text"
					name="address"
					placeholder="ex: Avenida 52, Provincia Heredia, La Asunción, 40703"
					bind:value={propertyData.address} />
			</fieldset>

			<fieldset class="location">
				<legend>Location (lat, lng)</legend>
				<input
					type="text"
					placeholder="ex: 9.97542"
					bind:value={propertyData.location.lat} />
				<input
					type="text"
					placeholder="ex: -84.163443"
					bind:value={propertyData.location.lng} />
				<Button type="button" size="block" onclick={() => getPosition(propertyData, gps)}
					>Get current GPS</Button>

				<MapPicker bind:updategps={gps} bind:position={propertyData.location} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY CONTACTS -->
	<section class="section section_contacts">
		<div class="header">
			<h3>Contacts</h3>
			<p>
				Email and Phone number of a realtor or person selling the property, usually found
				on a placard in front of the property.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Phone</legend>
				<input
					type="tel"
					name="contact_phone"
					placeholder="ex: 1234-5678"
					bind:value={propertyData.contact_phone} />
			</fieldset>

			<fieldset>
				<legend>Email</legend>
				<input
					type="email"
					name="contact_email"
					placeholder="ex: this@that.there"
					bind:value={propertyData.contact_email} />
			</fieldset>

			<fieldset>
				<legend>Realtor</legend>
				<input
					type="text"
					name="contact_realtor"
					placeholder="ex: Re/Max or Jane Doe"
					bind:value={propertyData.contact_realtor} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY BASICS -->
	<section class="section section_basics">
		<div class="header">
			<h3>Basics</h3>
			<p>
				These are initial values and usually first thing user looks for when narrowing
				down their options.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Year built</legend>
				<input
					type="number"
					name="year_built"
					placeholder="ex: 2019"
					bind:value={propertyData.year_built} />
			</fieldset>

			<fieldset>
				<legend>Building Style</legend>
				<input
					type="text"
					name="building_style"
					placeholder="ex: 2 Story"
					bind:value={propertyData.building_style} />
			</fieldset>

			<fieldset>
				<legend>Lot Size ㎡</legend>
				<input
					type="number"
					name="lot_size"
					placeholder="ex: 900"
					bind:value={propertyData.lot_size} />
			</fieldset>

			<fieldset>
				<legend>Building Size ㎡</legend>
				<input
					type="number"
					name="building_size"
					placeholder="ex: 810"
					bind:value={propertyData.building_size} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY DETAILS -->
	<section class="section section_details">
		<div class="header">
			<h3>Details</h3>
			<p>
				Information important to the user and thus should be filled in as soon as
				possible. Also used in filters.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Bedrooms</legend>
				<input
					type="number"
					name="beds"
					placeholder="ex: 3"
					bind:value={propertyData.beds} />
			</fieldset>

			<fieldset>
				<legend>Bathrooms</legend>
				<input
					type="number"
					name="baths"
					placeholder="ex: 3"
					bind:value={propertyData.baths} />
			</fieldset>

			<fieldset>
				<legend>Restrooms (half-baths)</legend>
				<input
					type="number"
					name="half_baths"
					placeholder="ex: 2"
					bind:value={propertyData.half_baths} />
			</fieldset>

			<fieldset>
				<legend>Rooms</legend>
				<input
					type="number"
					name="rooms"
					placeholder="ex: 6"
					bind:value={propertyData.rooms} />
			</fieldset>

			<fieldset>
				<legend>Parking Spaces</legend>
				<input
					type="number"
					name="parking_spaces"
					placeholder="ex: 9"
					bind:value={propertyData.parking_spaces} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY PRICING -->
	<section class="section section_pricing">
		<div class="header">
			<h3>Pricing</h3>
			<p>
				Everything regarding money goes in here and is very important since used in
				filters and relevent to user.
			</p>
		</div>

		<div class="inputs">
			{#if propertyData.property_for.includes('Sale')}
				<fieldset>
					<legend>Price $</legend>
					<input
						type="number"
						name="price"
						placeholder="ex: 630000"
						bind:value={propertyData.price} />
				</fieldset>
			{/if}

			{#if propertyData.property_for.includes('Rent')}
				<fieldset>
					<legend>Rent ($/month)</legend>
					<input
						type="number"
						name="rent"
						placeholder="ex: 1800"
						bind:value={propertyData.rent} />
				</fieldset>
			{/if}

			<fieldset>
				<legend>Taxes ($/year)</legend>
				<input
					type="number"
					name="taxes"
					placeholder="ex: 1500"
					bind:value={propertyData.taxes} />
			</fieldset>

			<fieldset>
				<legend>Fees (condo, asssociation) ($/month)</legend>
				<input
					type="number"
					name="fees"
					placeholder="ex: 120"
					bind:value={propertyData.fees} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY FEATURES -->
	<section class="section section_features">
		<div class="header">
			<h3>Features</h3>
			<p>
				Description, features, photos. Photos are important and good quality should be
				provided.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Features</legend>
				<div class="features-flow">
					<input
						bind:this={featureInput}
						type="text"
						placeholder="ex: BBQ"
						onkeydown={(evt) => {
							if (evt.key == 'Enter') evt.preventDefault();
						}}
						use:enter={(input) => addFeature(input, propertyData)} />
					<Button
						type="button"
						size="icon"
						onclick={() => addFeature(featureInput, propertyData)}>
						{#snippet icon()}
							➕
						{/snippet}
					</Button>
				</div>
				<div class="feature-list">
					{#each propertyData.features || [] as feature, i}
						<span class="feature">
							<svg
								class="close"
								onclick={() => removeFeature(i, propertyData)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') removeFeature(i);
								}}
								role="button"
								tabindex="0"
								width="18px"
								height="18px"
								stroke-width="1.5"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								color="currentColor"
								><path
									d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									stroke-linejoin="round" /></svg>
							{feature}
						</span>
					{/each}
				</div>
			</fieldset>

			<fieldset class="description">
				<legend>Description</legend>
				<textarea
					name="description"
					class="scroller"
					rows="6"
					placeholder="Description (max 9 sentences)"
					bind:value={propertyData.description}></textarea>
			</fieldset>

			<fieldset class="photos">
				<legend>Photos</legend>
				<Uploader
					{loading}
					bind:existingAttachments={propertyData.photos}
					bind:newFiles={newPhotosToUpload}
					propertyId={data.property.id}
					currentUserId={data.session?.user?.id}
					isAdmin={data.isAdmin}
					onDeleteExistingPhoto={handleDeleteExistingPhoto} />
			</fieldset>
		</div>
	</section>

	<!-- BUTTONS -->
	<footer class="buttons-group">
		{#if propertyData.is_active && !isAdmin}
			<Button formaction="?/remove" color="danger" {loading} disabled={loading}>
				{#snippet icon()}
					❌
				{/snippet}
				Remove
			</Button>
		{/if}
		{#if isAdmin}
			<Button formaction="?/delete" color="danger" {loading} disabled={loading}>
				{#snippet icon()}
					❌
				{/snippet}
				Delete
			</Button>
		{/if}

		{#if isAdmin || propertyData.is_active}
			<Button
				type="button"
				disabled={loading}
				onclick={() => {
					goto(`/${propertyData.id}/print`);
				}}>
				{#snippet icon()}
					👁‍🗨
				{/snippet}
				Print
			</Button>
		{/if}

		<input type="hidden" hidden name="id" value={propertyData.id} />
		<input type="hidden" hidden name="msl" value={propertyData.msl} />
		<input
			type="hidden"
			hidden
			name="location"
			value={JSON.stringify(propertyData.location)} />
		<input
			type="hidden"
			hidden
			name="property_for"
			value={JSON.stringify(propertyData.property_for)} />
		<input
			type="hidden"
			hidden
			name="features"
			value={JSON.stringify(propertyData.features)} />
		<!-- <Button type="button" disabled={loading || !formIsValid}
				>Submit Changes
			</Button> -->
		<Button formaction="?/edit" {loading} disabled={loading}>
			{#snippet icon()}
				💾
			{/snippet}
			Submit Changes
		</Button>
	</footer>

	<!-- NOTIFICATIONS -->
	{#if message}
		<Notify type="success">{message}</Notify>
	{/if}
	{#if error}
		<Notify type="danger">{error}</Notify>
	{/if}
</form>

<!-- CONFIRMATION MODAL -->

<!-- <Modal title="Delete listing?" bind:showModal>
	<div slot="content">
		Are you sure you want to delete this listing? By doing this, all data will
		be permenantly deleted.
	</div>
	<Button mode="clean" onclick={() => (showModal = false)}>Cancel</Button>
	<Button
		mode="danger"
		onclick={() => {
			showModal = false;
			remove();
		}}>Confirm</Button
	>
</Modal> -->

<!-- <JsonDump name="data" {data} /> -->
<style>
	.edit-property {
		display: grid;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: calc(var(--padding-large) * 3) 0;
		gap: var(--gap-small);
	}

	fieldset input[type='text'],
	fieldset input[type='email'],
	fieldset input[type='number'],
	fieldset input[type='tel'],
	fieldset :global(select),
	fieldset textarea {
		display: block;
		padding: var(--padding-small);
		color: var(--primary-content);
		border: var(--border);
		border-radius: var(--border-radius);
		width: 100%;
		background: transparent;
	}
	/* fieldset :global(button) {
		height: auto;
		width: 100%;
	} */

	.section {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		gap: var(--gap-medium);
		padding: var(--padding-medium);
		box-shadow: var(--shadow-small);
	}
	.section .header p {
		color: var(--secondary-content);
	}
	.section .inputs {
		display: flex;
		flex-direction: column;
		gap: var(--gap-small);
	}
	.section fieldset {
		/* border: var(--border); */
		border-radius: var(--border-radius);
		border: none;
		display: grid;
		gap: var(--gap-small);
	}
	.section fieldset.flow {
		grid-auto-flow: column;
	}
	.section legend {
		text-transform: uppercase;
		font-size: 0.81rem;
		color: var(--secondary-content);
	}

	@media (min-width: 768px) {
		.section {
			grid-template-columns: minmax(auto, 270px) minmax(auto, 540px);
			grid-template-rows: 1fr;
		}
		/* .section fieldset {
			margin: 0 0 2rem;
		} */
	}

	.section_property_type .active {
		border: 1px solid var(--success);
	}
	.section_property_type .removed {
		border: 1px solid var(--error);
	}

	/* .section_location .location input:first-of-type {
		border-bottom: 0;
	}
	.section_location .location input:last-of-type {
		border-top: 0;
	} */
	/* .section_location .location :global(img) {
		width: 100%;
		margin: 1rem 0;
		border-radius: var(--border-radius);
	} */

	.section_features {
		.features-flow {
			display: flex;
			align-items: center;
			gap: var(--padding-small);
			:global(.btn-icon) {
				/* Small tablets and larger mobile devices (481px - 768px) */
				@media (min-width: 481px) {
					display: none;
				}
			}
		}
	}

	.section_features .feature-list {
		/* margin: 1rem 0; */
		gap: var(--gap-extra-small);
		display: flex;
		flex-wrap: wrap;
	}
	.section_features .feature {
		display: inline-flex;
		align-items: center;
		border: var(--border);
		border-radius: var(--border-radius);
		padding: var(--padding-extra-small);
		/* margin: var(--padding-extra-small); */
		cursor: default;
	}
	.section_features .feature .close {
		width: 18px;
		color: var(--error);
		border: var(--border);
		border-radius: var(--border-radius);
		margin-right: var(--padding-extra-small);
		cursor: pointer;
		text-align: center;
	}

	.section_features .description,
	.section_features .photos {
		grid-column: 1 / -1;
	}

	.section_features .description textarea {
		resize: vertical;
	}

	footer.buttons-group {
		display: grid;
		justify-items: center;
		gap: var(--gap-small);
		padding: var(--padding-small);
	}
	@media (min-width: 768px) {
		footer.buttons-group {
			justify-content: flex-end;
			grid-template-columns: repeat(3, 1fr);
		}
		/* footer.buttons-group :global(button) {
			flex: 0 1 auto;
			width: 333px;
		} */
	}
</style>
