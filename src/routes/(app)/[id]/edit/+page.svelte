<script>
	/** @type {import('./$types').PageData} */

	import { navigating, page } from '$app/state';
	import { error } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { enhance, applyAction } from '$app/forms';
	import { v4 as uuidv4 } from 'uuid'; // For unique file names
	import Compressor from 'compressorjs';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import Icon from '$lib/Icon.svelte';
	import { Button } from '$lib/buttons';
	import Checkboxes from '$lib/Checkboxes.svelte';
	import Toggle from '$lib/Toggle.svelte';
	import Select from '$lib/Select.svelte';
	import MapPicker from '$lib/map/MapPicker.svelte'; // MapPickerLibre
	import Uploader from '$lib/Uploader.svelte';
	import Notify from '$lib/Notify.svelte';
	import Dialog from '$lib/Dialog.svelte';
	import { addToast } from '$lib/toasts';
	import { addFeature, removeFeature, enter } from '$lib/utils/helpers.js';
	import { getPosition } from '$lib/utils/gps.js';
	import { isEmpty } from '$lib/utils/validators.js';
	// import JsonDump from '$lib/JSONDump.svelte';

	// Component Props
	let { data } = $props();

	// Rune-based Reactive State and Computations
	let propertyData = $state({
		...data.property,
		property_for: data.property?.property_for || [],
		features: data.property?.features || [],
		photos: data.property?.photos || [],
		location: data.property?.location || { lat: null, lng: null },
	});

	// This effect will run whenever `data.property` changes
	$effect(() => {
		if (data.property) {
			propertyData = { ...data.property };
		}
	});

	let newPhotosToUpload = $state([]); // Bindable for Uploader
	let loading = $state(false);
	let errorMessage = $state('');
	let message = $state('');
	let isAdmin = data.is_admin || false;
	let uploadingPhotos = $state(false);
	let uploadedPhotoDetails = $state([]);
	let gps = $state();
	let photosToDelete = $state([]);
	let deleteDialogRef;

	// Local State Variables
	let featureInput;

	const showDeleteConfirm = () => {
		deleteDialogRef.showModal();
	};

	// Utility/Helper Functions
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
					convertSize: 500000, // files larger than 500kb converted to jpg
					success(result) {
						console.log('Compressed file size:', result.size, 'bytes'); // Log for debugging
						resolve(result);
					},
					error(err) {
						console.error('Compression error:', err); // Log compression errors
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
					addToast({
						message: `Failed to upload: ${file.name}. Error: ${uploadError.message}`,
						type: 'error',
						dismissible: true,
						timeout: 0,
					});
					error(
						400,
						`Failed to upload photo: ${file.name}. Error: ${uploadError.message}`,
					);
				}

				const { data: publicUrlData } = data.supabase.storage
					.from('photos')
					.getPublicUrl(filePath);

				if (!publicUrlData || !publicUrlData.publicUrl) {
					addToast({
						message: `Could not get public URL for photo: ${filePath}.`,
						type: 'error',
						dismissible: true,
						timeout: 0,
					});
					error(400, `Could not get public URL for photo: ${filePath}`);
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
		newPhotosToUpload = []; // Clear the new photos from the uploader after they are processed

		return { success: true, details: uploadedPhotoDetails };
	}

	// Function to mark a photo for deletion
	function markPhotoForDeletion(photo) {
		// Add to deletion list if not already there
		if (!photosToDelete.find((p) => p.id === photo.id)) {
			photosToDelete = [...photosToDelete, photo];
		}

		// Visually remove from the displayed list
		propertyData.photos = propertyData.photos.filter((p) => p.id !== photo.id);
	}

	// Debug/Test Variables and Functions
	// console.log('(app)/[id=uuid]/edit/+page.svelte data:', data);
	// $inspect('(app)/[id=uuid]/edit/+page.svelte form:', propertyData);
	// $inspect('(app)/[id=uuid]/edit/+page.svelte session:', data.session);
</script>

<svelte:head>
	<title>Editing {propertyData.msl} - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
	<Nav />
{/if}

<form
	name="edit-form"
	class="edit-property"
	method="POST"
	enctype="multipart/form-data"
	use:enhance={async ({ form: htmlFormElement, formData, action, cancel }) => {
		// --- Pre-submission Logic ---

		// Initial State Reset
		loading = true;
		message = '';
		errorMessage = '';

		// Client-side Validation
		if (isEmpty(propertyData.property_for)) {
			errorMessage = 'Must select at least one for PROPERTY FOR in Property Type section';
			loading = false;
			cancel();
			return;
		}

		// Client-side Photo Upload
		const uploadResult = await uploadPhotos();
		if (!uploadResult.success) {
			loading = false;
			cancel(); // Error message already set inside uploadPhotos
			return;
		}

		// Prepare FormData for Server
		formData.delete('photos_to_delete');
		photosToDelete.forEach((photo) => {
			formData.append('photos_to_delete', JSON.stringify(photo));
		});

		formData.delete('photo_urls_and_paths');
		uploadResult.details.forEach((detail) => {
			formData.append('photo_urls_and_paths', JSON.stringify(detail));
		});

		// --- Post-submission Callback Logic ---
		return async ({ result, update }) => {
			loading = false; // Always reset loading state here

			if (result.type === 'success') {
				if (result.data.delisted) {
					propertyData.is_active = false;
				}
				addToast({
					message: `${result.data.message}`,
					type: 'success',
					timeout: 3000,
				});
				await applyAction(result);
			} else if (result.type === 'invalid') {
				addToast({
					message: `${result.data.message}`,
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
				errorMessage = result.data.message;
				await applyAction(result);
			}
			await update({ reset: false });
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
			{#if data.is_admin || propertyData.user_id === data.user.id}
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
					autocomplete="off"
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
				<Button
					type="button"
					size="block"
					shadow
					onclick={() => getPosition(propertyData, gps)}>Get current GPS</Button>

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
					autocomplete="off"
					bind:value={propertyData.contact_phone} />
			</fieldset>

			<fieldset>
				<legend>Email</legend>
				<input
					type="email"
					name="contact_email"
					placeholder="ex: this@that.there"
					autocomplete="off"
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
							<Icon kind="plus" size="21" />
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
					bind:newFiles={newPhotosToUpload}
					bind:existingAttachments={propertyData.photos}
					currentUserId={data.user?.id}
					{isAdmin}
					onDeleteExisting={markPhotoForDeletion}
					{loading} />
			</fieldset>
		</div>
	</section>

	<!-- BUTTONS -->
	<footer class="buttons-group">
		{#if propertyData.is_active && !isAdmin}
			<Button formaction="?/remove" color="danger" {loading} disabled={loading}>
				{#snippet icon()}
					<Icon kind="delete" size="27" />
				{/snippet}
				Remove
			</Button>
		{/if}
		{#if isAdmin}
			<Button
				type="button"
				sound_pattern="longPress"
				shadow
				red
				{loading}
				disabled={loading}
				onclick={showDeleteConfirm}>
				{#snippet icon()}
					<Icon kind="delete" size="27" />
				{/snippet}
				Delete
			</Button>
		{/if}

		{#if isAdmin || propertyData.is_active}
			<Button
				type="button"
				shadow
				{loading}
				disabled={loading}
				onclick={() => {
					goto(`/${propertyData.id}/print`);
				}}>
				{#snippet icon()}
					<Icon kind="receipt" size="27" />
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
		<Button formaction="?/edit" shadow {loading} disabled={loading}>
			{#snippet icon()}
				<Icon kind="edit" size="27" />
			{/snippet}
			Submit Changes
		</Button>
	</footer>

	<!-- NOTIFICATIONS -->
	{#if message}
		<Notify type="success">{message}</Notify>
	{/if}
	{#if errorMessage}
		<Notify type="danger">{errorMessage}</Notify>
	{/if}
</form>

<!-- CONFIRMATION DIALOGS -->
<Dialog
	bind:this={deleteDialogRef}
	title="Delete Property"
	message="Are you sure you want to delete this property? This action cannot be undone."
	type="confirm"
	onConfirm={() => {
		loading = true;
		const deleteForm = document.createElement('form');
		deleteForm.name = 'delete-form';
		deleteForm.method = 'POST';
		deleteForm.action = `?/delete`;
		// Add the required hidden fields
		const idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.name = 'id';
		idInput.value = propertyData.id;
		deleteForm.appendChild(idInput);
		const mslInput = document.createElement('input');
		mslInput.type = 'hidden';
		mslInput.name = 'msl';
		mslInput.value = propertyData.msl;
		deleteForm.appendChild(mslInput);
		document.body.appendChild(deleteForm);
		deleteForm.submit();
		document.body.removeChild(deleteForm);
	}}
	onCancel={() => {
		/* Optionally handle cancel here */
	}} />

<!-- <JsonDump name="data" data={propertyData} /> -->

<style>
	.edit-property {
		display: grid;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		margin: calc(var(--size-8) * 3) 0;
		gap: var(--size-2);
	}

	/* fieldset :global(button) {
		height: auto;
		width: 100%;
	} */

	.section {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
		gap: var(--size-3);
		padding: var(--size-3);
		box-shadow: var(--shadow-1);
	}
	.section .header p {
		color: var(--text-2);
	}
	.section .inputs {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}
	.section fieldset {
		/* border: var(--border-size-1) solid var(--surface-4); */
		border-radius: var(--radius-2);
		border: none;
		display: grid;
		gap: var(--size-2);
	}
	.section fieldset.flow {
		grid-auto-flow: column;
	}
	.section legend {
		text-transform: uppercase;
		font-size: 0.81rem;
		color: var(--text-2);
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
		border: var(--border-size-1) solid var(--success);
	}
	.section_property_type .removed {
		border: var(--border-size-1) solid var(--error);
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
		border-radius: var(--radius-2);
	} */

	.section_features {
		.features-flow {
			display: flex;
			align-items: center;
			gap: var(--size-2);
			:global(.icon) {
				/* Small tablets and larger mobile devices (481px - 768px) */
				@media (min-width: 481px) {
					display: none;
				}
			}
		}
	}

	.section_features .feature-list {
		/* margin: 1rem 0; */
		gap: var(--size-1);
		display: flex;
		flex-wrap: wrap;
	}
	.section_features .feature {
		display: inline-flex;
		align-items: center;
		border: var(--border-size-1) solid var(--surface-4);
		border-radius: var(--radius-2);
		padding: var(--size-1);
		/* margin: var(--size-1); */
		cursor: default;
	}
	.section_features .feature .close {
		width: 18px;
		color: var(--error);
		border: var(--border-size-1) solid var(--surface-4);
		border-radius: var(--radius-2);
		margin-right: var(--size-1);
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
		gap: var(--size-2);
		padding: var(--size-2);
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
