<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import LogoSvg from '$lib/LogoSvg.svelte';
	import Map from '$lib/map/Map.svelte'; // MapLibre
	import Preview from '$lib/Preview.svelte';
	import Nav from '$lib/Nav.svelte';
	import JsonDump from '$lib/JSONDump.svelte';
	import Checkbox from '$lib/Checkbox.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	let loading = $state(data.loading ?? false),
		error = '',
		message = '',
		showPreview = false,
		selectedProperty = $state();

	let saleFilter = $state(true);
	let rentFilter = $state(true);

	const filteredProperties = $derived(() => {
		if (!data || !Array.isArray(data.properties)) {
			return [];
		}
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: property.property_for.split(',').map((s) => s.trim());

			if (saleFilter && propertyFor.includes('Sale')) return true;
			if (rentFilter && propertyFor.includes('Rent')) return true;
			return false;
		});
	});

	onMount(async () => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Cariari Agency - Costa Rica Real Estate</title>
</svelte:head>

<!-- <JsonDump name="data" {data} /> -->
{#if !navigating.complete && !loading}
	<LogoSvg animate={true} kind="gold" fixed />
{/if}

<main class:preview={selectedProperty}>
	<section class="map-wrapper">
		<Nav />
		<div class="filter-controls">
			<Checkbox name="sale" label="Sale" kind="circle" bind:checked={saleFilter} />
			<Checkbox name="rent" label="Rent" kind="circle" bind:checked={rentFilter} />
		</div>
		<Map
			markers={filteredProperties()}
			onSelected={(id) => {
				selectedProperty = id;
			}} />
	</section>

	<!-- <JsonDump name="filteredProperties" {filteredProperties} /> -->

	{#if selectedProperty}
		<aside class="preview-wrapper">
			<Preview
				property_id={selectedProperty}
				supabase={data.supabase}
				is_admin={data.is_admin} />
		</aside>
	{/if}
</main>

<!-- {/if} -->
<style>
	main {
		display: grid;
		height: 100svh;
		width: 100svw;
	}
	.map-wrapper {
		position: relative;
	}
	main.preview {
		grid-template-rows: 42svh 1fr;
		@media (min-width: 768px) {
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 369px;
		}
	}
	.preview-wrapper {
		/* preview wrapper */
		@media (min-width: 768px) {
			height: 100svh;
			display: grid;
			position: relative;
		}
		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			overflow-y: scroll;
		}
	}

	.filter-controls {
		display: flex;
		gap: var(--gap-extra-small);
		margin-block: var(--padding-extra-small);
		border-bottom: 1px solid var(--color-border);
		position: absolute;
		top: calc(var(--padding-small) * 3);
		right: var(--padding-small);
		row-gap: var(--gap-extra-small);
		user-select: none;
		z-index: 3;
		background: var(--primary);
		padding: var(--padding-extra-small);
		border-radius: var(--border-radius);
	}
</style>
