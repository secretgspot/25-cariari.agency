<script>
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
	import MapPicker from '$lib/map/MapPicker.svelte';
	import Uploader from '$lib/Uploader.svelte';
	import Notify from '$lib/Notify.svelte';
	import { addToast } from '$lib/toasts';
	import {
		isEmpty,
		getPosition,
		addFeature,
		removeFeature,
		enter,
	} from '$lib/utils/helpers.js';
	// import JsonDump from '$lib/JSONDump.svelte';

	// Component Props
	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	// Rune-based Reactive State and Computations
	let loading = $state(false);
	let error = $state('');
	let message = $state('');
	let isAdmin = data.is_admin;
	let uploadingPhotos = $state(false);
	let uploadedPhotoDetails = $state([]);
	let gps = $state();

	const property = $state({
		is_active: true,
		msl: data.msl,
		property_for: [],
		location: {},
		features: [],
		photos: [],
	});

	let newPropertyFiles = $state([]);

	// Local State Variables
	let featureInput;

	// Utility/Helper Functions
	// Function to handle photo uploads to Supabase Storage directly from client
	async function uploadPhotos() {
		if (newPropertyFiles.length === 0) {
			return { success: true, details: [] };
		}

		uploadingPhotos = true;
		const uploadPromises = newPropertyFiles.map(async (file) => {
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
			const filePath = `${property.msl}/${fileName}`; // Path in storage bucket

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

		if (uploadedPhotoDetails.length !== newPropertyFiles.length) {
			// Some uploads failed
			error = `Not all photos were uploaded. Successfully uploaded ${uploadedPhotoDetails.length} out of ${newPropertyFiles.length}. Check console for details.`;
			return { success: false, details: uploadedPhotoDetails };
		}

		return { success: true, details: uploadedPhotoDetails };
	}

	const clearStorage = async () => await localStorage.clear();

	// Debug/Test Variables and Functions
	// $effect(() => {
	// $inspect('🐍 ADD PROPERTY temp data:', property);
	// });
	// export let form;
</script>

<svelte:head>
	<title>Add property - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
	<Nav />
{/if}

<form
	name="add-form"
	class="add-property"
	method="POST"
	action="?/add"
	enctype="multipart/form-data"
	use:enhance={async ({ formElement, formData, action, cancel }) => {
		// --- Pre-submission Logic ---

		// Initial State Reset
		loading = true;
		message = '';
		error = '';

		// Client-side Validation
		if (isEmpty(property.property_for)) {
			error =
				'Please select at least one option (Sale, Rent, or both) under "PROPERTY FOR" in the Property Type section.';
			loading = false;
			cancel();
			return;
		}

		// Client-side Photo Upload
		const uploadResult = await uploadPhotos();
		if (!uploadResult.success) {
			loading = false;
			cancel(); // The error message is already set inside uploadPhotos
			return;
		}

		// Prepare FormData for Server
		formData.delete('photo_urls_and_paths');
		uploadResult.details.forEach((detail) => {
			formData.append('photo_urls_and_paths', JSON.stringify(detail));
		});

		// --- Post-submission Callback Logic ---
		return async ({ result, update }) => {
			loading = false; // Always reset loading state here

			if (result.status === 200 && result.data.success) {
				// reset form
				clearStorage();
				addToast({
					message: result.data.message,
					type: 'success',
					timeout: 1200,
				});
				goto(`/${result.data.property_id}/print`);
			} else {
				console.log('➕🏠❌ TRIGGED DUE TO: ', result);
				addToast({
					message: `Something went wrong, server returned: ${JSON.stringify(result)}`,
					type: 'error',
					dismissible: true,
					timeout: 0,
				});
			}

			if (result.type === 'invalid') {
				error = result.data.message;
				await applyAction(result);
			}
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
			{#if isAdmin}
				<fieldset>
					<legend>Status</legend>
					<Toggle
						name="is_active"
						bind:checked={property.is_active}
						label={property.is_active ? 'Listed' : 'Delisted'}
						kind="flip"
						colored
						on="Listed"
						off="Delisted" />
				</fieldset>
			{/if}

			<fieldset class={property.is_active ? 'active' : 'removed'}>
				<legend>MSL</legend>
				<input
					type="text"
					placeholder="ex: CR-001"
					bind:value={property.msl}
					disabled={!isAdmin} />
			</fieldset>

			<fieldset>
				<legend>Land Use</legend>
				<Select name="land_use" bind:selected={property.land_use} />
			</fieldset>

			<fieldset class="flow">
				<legend>Property For</legend>
				<Checkboxes bind:selected={property.property_for} kind="square" />
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
					bind:value={property.address} />
			</fieldset>

			<fieldset class="location">
				<legend>Location (lat, lng)</legend>
				<input type="text" placeholder="ex: 9.97542" bind:value={property.location.lat} />
				<input
					type="text"
					placeholder="ex: -84.163443"
					bind:value={property.location.lng} />
				<Button type="button" size="block" onclick={() => getPosition(property, gps)}
					>Get current GPS</Button>

				<MapPicker bind:updategps={gps} bind:position={property.location} />
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
					bind:value={property.contact_phone} />
			</fieldset>

			<fieldset>
				<legend>Email</legend>
				<input
					type="email"
					name="contact_email"
					placeholder="ex: this@that.there"
					autocomplete="off"
					bind:value={property.contact_email} />
			</fieldset>

			<fieldset>
				<legend>Realtor</legend>
				<input
					type="text"
					name="contact_realtor"
					placeholder="ex: Re/Max or Jane Doe"
					bind:value={property.contact_realtor} />
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
					min="1900"
					max="2099"
					step="1"
					bind:value={property.year_built} />
			</fieldset>

			<fieldset>
				<legend>Building Style</legend>
				<input
					type="text"
					name="building_style"
					placeholder="ex: 2 Story"
					bind:value={property.building_style} />
			</fieldset>

			<fieldset>
				<legend>Lot Size ㎡</legend>
				<input
					type="number"
					name="lot_size"
					placeholder="ex: 900"
					min="0"
					bind:value={property.lot_size} />
			</fieldset>

			<fieldset>
				<legend>Building Size ㎡</legend>
				<input
					type="number"
					name="building_size"
					placeholder="ex: 810"
					min="0"
					bind:value={property.building_size} />
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
					min="0"
					bind:value={property.beds} />
			</fieldset>

			<fieldset>
				<legend>Bathrooms</legend>
				<input
					type="number"
					name="baths"
					placeholder="ex: 3"
					min="0"
					bind:value={property.baths} />
			</fieldset>

			<fieldset>
				<legend>Restrooms (half-baths)</legend>
				<input
					type="number"
					name="half_baths"
					placeholder="ex: 2"
					min="0"
					bind:value={property.half_baths} />
			</fieldset>

			<fieldset>
				<legend>Rooms</legend>
				<input
					type="number"
					name="rooms"
					placeholder="ex: 6"
					min="0"
					bind:value={property.rooms} />
			</fieldset>

			<fieldset>
				<legend>Parking Spaces</legend>
				<input
					type="number"
					name="parking_spaces"
					placeholder="ex: 9"
					min="0"
					bind:value={property.parking_spaces} />
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
			{#if property.property_for.includes('Sale')}
				<fieldset>
					<legend>Price $</legend>
					<input
						type="number"
						name="price"
						placeholder="ex: 630000"
						min="0"
						bind:value={property.price} />
				</fieldset>
			{/if}

			{#if property.property_for.includes('Rent')}
				<fieldset>
					<legend>Rent ($/month)</legend>
					<input
						type="number"
						name="rent"
						placeholder="ex: 1800"
						min="0"
						bind:value={property.rent} />
				</fieldset>
			{/if}

			<fieldset>
				<legend>Taxes ($/year)</legend>
				<input
					type="number"
					name="taxes"
					placeholder="ex: 1500"
					min="0"
					bind:value={property.taxes} />
			</fieldset>

			<fieldset>
				<legend>Fees (condo, asssociation) ($/month)</legend>
				<input
					type="number"
					name="fees"
					placeholder="ex: 120"
					min="0"
					bind:value={property.fees} />
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
						use:enter={(input) => addFeature(input, property)} />
					<Button
						type="button"
						size="icon"
						onclick={() => addFeature(featureInput, property)}>
						{#snippet icon()}
							➕
						{/snippet}
					</Button>
				</div>
				<div class="feature-list">
					{#each property.features || [] as feature, i}
						<span class="feature">
							<svg
								class="close"
								onclick={() => removeFeature(i, property)}
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
					bind:value={property.description}></textarea>
			</fieldset>

			<fieldset class="photos">
				<legend>Photos</legend>
				<Uploader {loading} bind:newFiles={newPropertyFiles} />
			</fieldset>
		</div>
	</section>

	<!-- BUTTONS -->
	<footer class="buttons-group">
		<input type="hidden" hidden name="user_id" value={page.data?.user?.id} />
		<input type="hidden" hidden name="msl" value={property.msl} />
		<input
			type="hidden"
			hidden
			name="location"
			value={JSON.stringify(property.location)} />
		<input
			type="hidden"
			hidden
			name="property_for"
			value={JSON.stringify(property.property_for)} />
		<input
			type="hidden"
			hidden
			name="features"
			value={JSON.stringify(property.features)} />

		<!-- <Button type="button" disabled={loading || !formIsValid}
				>Submit Changes
			</Button> -->
		<Button {loading} disabled={loading}>
			{#snippet icon()}
				💾
			{/snippet}
			Add Property
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

<!-- <JsonDump name="page" data={page} /> -->
<style>
	.add-property {
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

		@media (min-width: 768px) {
			grid-template-columns: minmax(auto, 270px) minmax(auto, 540px);
			grid-template-rows: 1fr;
		}

		.header p {
			color: var(--secondary-content);
		}

		.inputs {
			display: flex;
			flex-direction: column;
			gap: var(--gap-small);
		}

		fieldset {
			/* border: var(--border); */
			border-radius: var(--border-radius);
			border: none;
			display: grid;
			gap: var(--gap-small);

			&.flow {
				grid-auto-flow: column;
			}

			legend {
				text-transform: uppercase;
				font-size: 0.81rem;
				color: var(--secondary-content);
			}
		}
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

		.feature-list {
			/* margin: 1rem 0; */
			gap: var(--gap-extra-small);
			display: flex;
			flex-wrap: wrap;
		}

		.feature {
			display: inline-flex;
			align-items: center;
			border: var(--border);
			border-radius: var(--border-radius);
			padding: var(--padding-extra-small);
			/* margin: var(--padding-extra-small); */
			cursor: default;

			.close {
				width: 18px;
				color: var(--error);
				border: var(--border);
				border-radius: var(--border-radius);
				margin-right: var(--padding-extra-small);
				cursor: pointer;
				text-align: center;
			}
		}
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

		@media (min-width: 768px) {
			justify-content: flex-end;
			grid-template-columns: repeat(3, 1fr);
		}
	}
</style>
