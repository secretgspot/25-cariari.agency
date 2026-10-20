<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/env';
	import LogoSvg from '#lib/LogoSvg.svelte';
	import Map from '#lib/map/Map.svelte';
	import Preview from '#lib/Preview.svelte';
	import Nav from '#lib/Nav.svelte';
	import FilterChips from '#lib/FilterChips.svelte';
	import FilterChip from '#lib/FilterChip.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	let loading = $state(data.loading ?? false);
	let selectedProperty = $state(null);

	let saleFilter = $state(true);
	let rentFilter = $state(true);

	const saleCount = $derived.by(() => {
		if (!data?.properties || !Array.isArray(data.properties)) return 0;
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());
			return propertyFor.includes('Sale');
		}).length;
	});

	const rentCount = $derived.by(() => {
		if (!data?.properties || !Array.isArray(data.properties)) return 0;
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());
			return propertyFor.includes('Rent');
		}).length;
	});

	const filteredProperties = $derived.by(() => {
		if (!data || !Array.isArray(data.properties)) {
			return [];
		}
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());

			if (saleFilter && propertyFor.includes('Sale')) return true;
			if (rentFilter && propertyFor.includes('Rent')) return true;
			return false;
		});
	});

	function selectProperty(id) {
		if (selectedProperty === id) {
			// Clicking the active property again closes the preview pane
			selectedProperty = null;
			if (browser) {
				const url = new URL(window.location.href);
				url.searchParams.delete('property');
				replaceState(url.toString(), page.state);
			}
			return;
		}

		selectedProperty = id;
		if (browser) {
			const url = new URL(window.location.href);
			if (id) {
				const match = data?.properties?.find((p) => p.id === id);
				url.searchParams.set('property', match?.msl || id);
			} else {
				url.searchParams.delete('property');
			}
			replaceState(url.toString(), page.state);
		}
	}

	onMount(() => {
		loading = false;
		const syncFromUrl = () => {
			if (!browser) return;
			const propParam = new URL(window.location.href).searchParams.get('property');
			if (propParam && data?.properties) {
				const match = data.properties.find(
					(p) => p.id === propParam || (p.msl && p.msl.toLowerCase() === propParam.toLowerCase())
				);
				selectedProperty = match ? match.id : null;
			} else {
				selectedProperty = null;
			}
		};

		syncFromUrl();
		window.addEventListener('popstate', syncFromUrl);
		return () => {
			window.removeEventListener('popstate', syncFromUrl);
		};
	});
</script>

<svelte:head>
	<title>Cariari Agency - Costa Rica Real Estate</title>
</svelte:head>

{#if !navigating.complete && !loading}
	<LogoSvg animate={true} kind="gold" fixed invert />
{/if}

<main class:preview={selectedProperty}>
	<section class="map-wrapper">
		<Nav />
		<FilterChips>
			<FilterChip
				bind:active={saleFilter}
				label="Sale"
				color="var(--sale)"
				count={saleCount} />
			<FilterChip
				bind:active={rentFilter}
				label="Rent"
				color="var(--rent)"
				count={rentCount} />
		</FilterChips>
		<Map
			markers={filteredProperties}
			selectedId={selectedProperty}
			onSelected={(id) => {
				selectProperty(id);
			}}
			onDeselect={() => {
				selectProperty(null);
			}} />
	</section>

	{#if selectedProperty}
		<aside class="preview-wrapper">
			<Preview
				property_id={selectedProperty}
				supabase={data.supabase}
				is_admin={data.is_admin} />
		</aside>
	{/if}
</main>

<style>
	main {
		display: grid;
		height: 100dvh;
		width: 100dvw;
	}
	.map-wrapper {
		position: relative;
	}
	main.preview {
		grid-template-rows: 42vh 1fr;
		@media (min-width: 768px) {
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 369px;
		}
	}
	.preview-wrapper {
		@media (min-width: 768px) {
			height: 100dvh;
			display: grid;
			position: relative;
		}
		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			overflow-y: scroll;
		}
	}
</style>
