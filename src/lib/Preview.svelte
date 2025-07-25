<script>
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import Badge from '$lib/Badge.svelte';
	import { Button } from '$lib/buttons';
	import Ad from '$lib/Ad.svelte';
	import { formatter, ago } from '$lib/utils/helpers.js';
	import { Spinner } from '$lib/loaders';

	/** @type {{data: any}} */
	let { property_id, supabase, is_admin } = $props();

	// console.log('Preview.svelte property_id:', property_id);
	// console.log('Preview.svelte supabase:', supabase);

	let loading = $state(false),
		error = '',
		message = '',
		property = $state({});

	const loadDetails = async (e) => {
		loading = true;
		message = '';
		error = '';

		const { data: propertyData, error: propertyErr } = await supabase
			.from('properties_preview')
			.select('*')
			.eq('id', property_id)
			.single();
		if (propertyErr) error = propertyErr.message;
		property = propertyData;
		loading = false;
	};

	$effect(() => {
		if (supabase) loadDetails();
	});
</script>

{#if loading}
	<div class="loader"><Spinner /></div>
{/if}

<section class="preview-content" class:loading>
	{#if is_admin}
		<Button
			class="admin-edit"
			size="icon"
			{loading}
			disabled={loading}
			onclick={() => goto(property.id + '/edit')}>
			{#snippet icon()}
				📝
			{/snippet}
			Show Details
		</Button>
	{/if}
	<figure>
		<!-- {JSON.stringify(property.photos, null, 2)} -->
		{#if property?.photo?.length > 0}
			<img
				class="image"
				src={property.photo}
				alt="{property.msl} - {property.land_use}"
				loading="eager"
				intrinsicsize="450x360" />
		{:else}
			<img
				class="image"
				src="/placeholder/450x360.png"
				alt="Property placeholder"
				loading="eager" />
		{/if}
	</figure>

	<div class="content scroller">
		<!-- {JSON.stringify(data, null, 2)} -->
		<div class="preview-group" transition:fade={{ duration: 600 }}>
			<div class="land_use">
				<!-- {#each property.property_for as p_for}
					<span>{p_for}</span>
				{/each} -->
			</div>

			<div class="price_rent">
				{#if property.rent}<span>{formatter.format(property.rent)}/m</span>{/if}
				{#if property.price}<span>{formatter.format(property.price)}</span>{/if}
			</div>

			<div class="type_age">
				{#if property.land_use}<span>{property.land_use}</span>{/if}
				{#if property.building_style}<span>&bull; {property.building_style}</span>{/if}
				{#if property.year_built}<span>&bull; {ago(property.year_built)} old</span>{/if}
			</div>

			<!-- <div class="loc_address">
				{#if property.location}<span>{property.location.lat} / {property.location.lng}</span
					>{/if}
			</div> -->
		</div>

		<div class="badge-group">
			{#if property.rooms > 0}
				<Badge type="icon" label="rooms" value={property.rooms} />
			{/if}
			{#if property.beds > 0}
				<Badge type="icon" label="beds" value={property.beds} />
			{/if}
			{#if property.baths > 0}
				<Badge type="icon" label="baths" value={property.baths} />
			{/if}
			{#if property.half_baths > 0}
				<Badge type="icon" label="half baths" value={property.half_baths} />
			{/if}
			{#if property.parking_spaces > 0}
				<Badge type="icon" label="parkings" value={property.parking_spaces} />
			{/if}
		</div>

		{#if property.description}
			<p class="description">
				{@html property.description}
			</p>
		{/if}
	</div>

	<div class="commercial-wrapper">
		<Ad width="320" height="100">
			<a
				href="//25-cariaripintor.vercel.app"
				target="_blank"
				rel="noreferrer"
				title="Cariari House Painting Services">
				<img src="/ads/pintarcariari-300x100.webp" alt="Pintar Cariari" loading="lazy" />
			</a>
		</Ad>
	</div>

	<footer>
		<Button right shadow {loading} disabled={loading} onclick={() => goto(property.id)}>
			{#snippet icon()}
				👁‍🗨
			{/snippet}
			Show Details
		</Button>
	</footer>
</section>

<style>
	.preview-content {
		position: relative;
		z-index: 3;
		background: var(--primary);
		color: var(--primary-content);
		display: grid;
		grid-template-rows: minmax(min-content, 30vh) 1fr minmax(min-content, 111px) minmax(
				min-content,
				90px
			);

		@media (min-width: 768px) {
			height: 100dvh;
		}

		:global(.admin-edit) {
			position: absolute;
			top: 0;
			right: 0;
			height: min-content;
			width: min-content;
		}
	}

	figure {
		margin: 0;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 5 / 4;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
		overflow-y: auto;
		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			overflow-y: unset;
		}

		.badge-group {
			padding: 2rem 0;
			display: flex;
			justify-content: space-evenly;
			width: 100%;
		}

		.preview-group {
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			width: 100%;
			padding: 2rem 3rem 0rem;

			.land_use {
				display: flex;
				justify-content: space-between;
			}
			.type_age {
				text-transform: uppercase;
				color: var(--txt-tertiary);
			}
			.price_rent {
				font-size: 1.8em;
				display: flex;
				justify-content: space-between;
				margin: 0.3rem 0;
			}
			/* .loc_address {
				font-size: smaller;
				display: flex;
				flex-direction: column;
				color: var(--color-dark);
			} */
		}

		.description {
			padding: 3rem;
			text-align: justify;
		}
	}

	.commercial-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		flex: 1;
	}

	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-block: var(--padding-large);

		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			padding-block-end: var(--padding-large);
		}
	}

	.loader {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 4;
		display: grid;
		justify-items: center;
		align-items: center;
	}
	.loading {
		/* background: red; */
		filter: grayscale(1) blur(3px);
	}
	@media (prefers-color-scheme: dark) {
		.image {
			filter: brightness(var(--brightness));
		}
	}
</style>
