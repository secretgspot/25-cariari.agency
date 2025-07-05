<script>
	/** @type {import('./$types').PageData} */
	
	import { goto } from '$app/navigation';
	import { enhance, applyAction } from '$app/forms';
	import { Button } from '$lib/buttons';
	import Toggle from '$lib/Toggle.svelte';
	import MapPicker from '$lib/map/MapPicker.svelte';
	import Uploader from '$lib/Uploader.svelte';
	import Checkboxes from '$lib/Checkboxes.svelte';
	import JsonDump from '$lib/JSONDump.svelte';

	/** @type {{data: any}} */
	let { data = $bindable() } = $props();

	// export let form;

	let loading = $state(false),
		error = $state(''),
		message = $state(''),
		isAdmin = true,
		won = $state(false);

	async function getMsl() {
		const { data: mslData, error: mslErr } = await supabase
			.from('properties')
			.select('msl')
			.order('msl', { ascending: false })
			.limit(1)
			.single();
		if (mslErr) error = mslErr.message;
		// const response = await api.get(`properties.json`, null);
		// let digits = [];
		// for (let [key, value] of Object.entries(response)) {
		// digits = [...digits, Number(value.msl.substring(3))];
		// console.log(Number(value.msl.substring(3)));
		// }
		data.property.msl = `CR-${Math.max(Number(mslData.msl.substring(3))) + 1}`;
		console.log('MSL DATA', Number(mslData.msl.substring(3)));
	}

	async function getPosition() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					console.log('📍', pos);
					data.property.location.lat = pos.coords.latitude;
					data.property.location.lng = pos.coords.longitude;
				},
				(err) => console.warn('💩', err),
				{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
			);
		} else {
			// Browser doesn't support Geolocation
			console.log('YOUR BROWSER DOESN"T SUPPORT NAVIGATION');
		}
	}

	// function startDrag(item, i, e) {
	// 	startLoc = e.clientY;
	// 	dragging = true;
	// 	dragFrom = item;
	// 	console.log(dragFrom, i);
	// }

	// function finishDrag(item, pos) {
	// 	property.photos.splice(pos, 1);
	// 	property.photos.splice(over.pos, 0, item);
	// 	over = {};
	// 	property.photos = property.photos;
	// }

	// function onDragOver(item, pos, e) {
	// 	const dir = startLoc < e.clientY ? "down" : "up";
	// 	setTimeout(() => {
	// 		over = { item, pos, dir };
	// 	}, 50);
	// 	console.log(dir, over);
	// }

	// Helper function to allow on Enter events for AddFeature
	function enter(node, callback) {
		function onkeydown(event) {
			if (event.which === 13) callback(node);
		}
		node.addEventListener('keydown', onkeydown);
		return {
			destroy() {
				node.removeEventListener('keydown', onkeydown);
			},
		};
	}

	function addFeature(input) {
		if (input.value == '') return;
		data.property.features = [...(data.property?.features ?? []), input.value];
		input.value = '';
	}
	function removeFeature(index) {
		data.property.features = [
			...data.property.features.slice(0, index),
			...data.property.features.slice(index + 1),
		];
	}

	// function addPhoto(input) {
	// 	// let valInput = /(https?:\/\/.*\.(?:png|jpg|gif))/i;
	// 	// if (!valInput.test(input.value)) return;
	// 	if (input.value == "") return;
	// 	data.property.photos = [...data.property.photos, input.value];
	// 	input.value = "";
	// }
	// function removePhoto(index) {
	// 	data.property.photos = [
	// 		...data.property.photos.slice(0, index),
	// 		...data.property.photos.slice(index + 1),
	// 	];
	// }
</script>

<form
	class="edit-property"
	method="POST"
	action="?/edit"
	use:enhance={({ form, data, action, cancel }) => {
		// 'form' is the '<form>' element
		// 'data' is it's 'FormData' object
		// 'action' is the URL to which the form is posted
		// 'cancel()' will prevent the submission

		// ALL THIS RUNS BEFORE SUBMISSION TO SERVER
		won = false;
		loading = true;
		message = '';
		error = '';

		// prevent default callback from resetting the form
		return async ({ result, update }) => {
			if (result.type === 'success') {
				// reset form
				// clearStorage();
				// form.reset();
				won = true;
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
			{#if isAdmin}
				<fieldset>
					<legend>Status</legend>
					<Toggle
						name="is_active"
						bind:checked={data.property.is_active}
						label={data.property.is_active ? 'Listed' : 'Delisted'} />
				</fieldset>
			{/if}

			<fieldset class={data.property.is_active ? 'active' : 'removed'}>
				<legend>MSL</legend>
				<input
					type="text"
					placeholder="ex: CR-001"
					bind:value={data.property.msl}
					disabled />
				{#if !data.property.msl}
					<Button type="button" size="block" onclick={getMsl}>Set</Button>
				{/if}
			</fieldset>

			<fieldset>
				<legend>Land Use</legend>
				<select name="land_use" bind:value={data.property.land_use}>
					<option>Residential</option>
					<option>Commercial</option>
					<option>Industrial</option>
				</select>
			</fieldset>

			<fieldset class="flow">
				<legend>Property For</legend>
				<Checkboxes bind:selected={data.property.property_for} />
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
					bind:value={data.property.address} />
			</fieldset>

			<fieldset class="location">
				<legend>Location (lat, lng)</legend>
				<input
					type="text"
					placeholder="ex: 9.97542"
					bind:value={data.property.location.lat} />
				<input
					type="text"
					placeholder="ex: -84.163443"
					bind:value={data.property.location.lng} />
				<Button type="button" size="block" onclick={getPosition}>Get current GPS</Button>

				<MapPicker bind:position={data.property.location} />
			</fieldset>
		</div>
	</section>

	<!-- PROPERTY CONTACTS -->
	<section class="section section_contacts">
		<div class="header">
			<h3>Contacts</h3>
			<p>
				Email and Phone number of a realtor or person selling the property, usually found
				on a placard in front of the data.property.
			</p>
		</div>

		<div class="inputs">
			<fieldset>
				<legend>Phone</legend>
				<input
					type="tel"
					name="contact_phone"
					placeholder="ex: 1234-5678"
					bind:value={data.property.contact_phone} />
			</fieldset>

			<fieldset>
				<legend>Email</legend>
				<input
					type="email"
					name="contact_email"
					placeholder="ex: this@that.there"
					bind:value={data.property.contact_email} />
			</fieldset>

			<fieldset>
				<legend>Realtor</legend>
				<input
					type="text"
					name="contact_realtor"
					placeholder="ex: Re/Max or Jane Doe"
					bind:value={data.property.contact_realtor} />
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
					bind:value={data.property.year_built} />
			</fieldset>

			<fieldset>
				<legend>Building Style</legend>
				<input
					type="text"
					name="building_style"
					placeholder="ex: 2 Storey"
					bind:value={data.property.building_style} />
			</fieldset>

			<fieldset>
				<legend>Lot Size ㎡</legend>
				<input
					type="number"
					name="lot_size"
					placeholder="ex: 900"
					bind:value={data.property.lot_size} />
			</fieldset>

			<fieldset>
				<legend>Building Size ㎡</legend>
				<input
					type="number"
					name="building_size"
					placeholder="ex: 810"
					bind:value={data.property.building_size} />
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
					bind:value={data.property.beds} />
			</fieldset>

			<fieldset>
				<legend>Bathrooms</legend>
				<input
					type="number"
					name="baths"
					placeholder="ex: 3"
					bind:value={data.property.baths} />
			</fieldset>

			<fieldset>
				<legend>Restrooms (half-baths)</legend>
				<input
					type="number"
					name="half_baths"
					placeholder="ex: 2"
					bind:value={data.property.half_baths} />
			</fieldset>

			<fieldset>
				<legend>Rooms</legend>
				<input
					type="number"
					name="rooms"
					placeholder="ex: 6"
					bind:value={data.property.rooms} />
			</fieldset>

			<fieldset>
				<legend>Parking Spaces</legend>
				<input
					type="number"
					name="parking_spaces"
					placeholder="ex: 9"
					bind:value={data.property.parking_spaces} />
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
			<fieldset>
				<legend>Price $</legend>
				<input
					type="number"
					name="price"
					placeholder="ex: 630000"
					bind:value={data.property.price} />
			</fieldset>

			<fieldset>
				<legend>Rent ($/month)</legend>
				<input
					type="number"
					name="rent"
					placeholder="ex: 1800"
					bind:value={data.property.rent} />
			</fieldset>

			<fieldset>
				<legend>Taxes ($/year)</legend>
				<input
					type="number"
					name="taxes"
					placeholder="ex: 1500"
					bind:value={data.property.taxes} />
			</fieldset>

			<fieldset>
				<legend>Fees (condo, asssociation) ($/month)</legend>
				<input
					type="number"
					name="fees"
					placeholder="ex: 120"
					bind:value={data.property.fees} />
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
				<input
					type="text"
					placeholder="ex: BBQ"
					onkeydown={(evt) => {
						if (evt.key == 'Enter') evt.preventDefault();
					}}
					use:enter={addFeature} />
				<div class="feature-list">
					{#each data.property.features || [] as feature, i}
						<span class="feature">
							<svg
								class="close"
								onclick={() => removeFeature(i)}
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
					bind:value={data.property.description}></textarea>
			</fieldset>

			<fieldset class="photos">
				<legend>Photos</legend>

				<Uploader bind:attachments={data.property.photos} msl={data.property.msl} />

				<!-- <div class="photo-list">
					{#each data.property.photos || [] as photo, i}
						<div
							class="photo"
							draggable={true}
							id={i}
							ondragstart={(e) => startDrag(photo, i, e)}
							ondragend={(e) => finishDrag(photo, i, e)}
							ondragover={(e) => onDragOver(photo, i, e)}
							style="background-image: url({photo.file_url})"
						>
							<i class="close" onclick={() => removePhoto(i)} onkeydown />
						</div>
					{/each}
				</div> -->
			</fieldset>
		</div>
	</section>

	<!-- BUTTONS -->
	<footer class="buttons-group">
		{#if data.property.is_active && !isAdmin}
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

		{#if isAdmin}
			<Button
				type="button"
				disabled={loading}
				onclick={() => {
					goto(`/${data.property.id}/print`);
				}}>
				{#snippet icon()}
					👁‍🗨
				{/snippet}
				Print
			</Button>
		{/if}

		<input type="hidden" hidden name="id" value={data.property.id} />
		<input type="hidden" hidden name="msl" value={data.property.msl} />
		<input
			type="hidden"
			hidden
			name="location"
			value={JSON.stringify(data.property.location)} />
		<input
			type="hidden"
			hidden
			name="property_for"
			value={JSON.stringify(data.property.property_for)} />
		<input
			type="hidden"
			hidden
			name="features"
			value={JSON.stringify(data.property.features)} />
		<!-- <Button type="button" disabled={loading || !formIsValid}
				>Submit Changes
			</Button> -->
		<Button {loading} disabled={loading}>
			{#snippet icon()}
				💾
			{/snippet}
			Submit Changes
		</Button>
	</footer>
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
	fieldset select,
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
