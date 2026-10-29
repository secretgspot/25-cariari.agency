<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import LogoSvg from '#lib/LogoSvg.svelte';
	import Map from '#lib/map/MapLibre.svelte';
	import Preview from '#lib/Preview.svelte';
	import Nav from '#lib/Nav.svelte';
	import Filters from '#lib/Filters.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	let loading = $derived(data.loading ?? false);
	let selectedProperty = $state(null);
	let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	let quickSearch = $state('');
	let saleFilter = $state(true);
	let rentFilter = $state(true);
	let layoutFilter = $state('Any');
	let priceFilter = $state('Any');

	const isMobile = $derived(innerWidth < 768);

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
		if (!data || !Array.isArray(data.properties)) return [];

		const search = quickSearch.trim().toLowerCase();
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());
			const beds = Number(property.beds ?? 0);
			const price = Number(property.price ?? 0);

			const matchesType =
				(propertyFor.includes('Sale') && saleFilter) ||
				(propertyFor.includes('Rent') && rentFilter);
			if (!matchesType) return false;

			const matchesLayout =
				layoutFilter === 'Any' ||
				(layoutFilter === '2+ beds' && beds >= 2) ||
				(layoutFilter === '3+ beds' && beds >= 3) ||
				(layoutFilter === '4+ beds' && beds >= 4);
			if (!matchesLayout) return false;

			const matchesPrice =
				priceFilter === 'Any' ||
				(priceFilter === 'Up to $400k' && price <= 400000) ||
				(priceFilter === '$400k - $800k' && price >= 400000 && price <= 800000) ||
				(priceFilter === '$800k+' && price > 800000);
			if (!matchesPrice) return false;

			if (!search) return true;

			const haystack = [
				property.msl,
				property.land_use,
				property.building_style,
				propertyFor.join(' '),
				property.description,
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();

			return haystack.includes(search);
		});
	});

	function resetFilters() {
		saleFilter = true;
		rentFilter = true;
		quickSearch = '';
		layoutFilter = 'Any';
		priceFilter = 'Any';
	}

	function selectProperty(id) {
		if (selectedProperty === id) {
			selectedProperty = null;
			if (browser) {
				const url = new URL(window.location.href);
				url.searchParams.delete('property');
				goto(url, { state: page.state, shallow: true, replace: true, reset: false });
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
			goto(url, { state: page.state, shallow: true, replace: true, reset: false });
		}
	}

	onMount(() => {
		loading = false;
		const syncFromUrl = () => {
			if (!browser) return;
			const propParam = new URL(window.location.href).searchParams.get('property');
			if (propParam && data?.properties) {
				const match = data.properties.find(
					(p) =>
						p.id === propParam ||
						(p.msl && p.msl.toLowerCase() === propParam.toLowerCase()),
				);
				selectedProperty = match ? match.id : null;
			} else {
				selectedProperty = null;
			}
		};

		syncFromUrl();
		window.addEventListener('popstate', syncFromUrl);
		return () => window.removeEventListener('popstate', syncFromUrl);
	});
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<title>Cariari Agency - Costa Rica Real Estate</title>
</svelte:head>

{#if !navigating.complete && !loading}
	<LogoSvg animate={true} kind="gold" fixed invert />
{/if}

<main class="app-shell">
	<section class="map-zone" class:has-selection={Boolean(selectedProperty)}>
		<Nav />

		<Filters
			bind:saleFilter
			bind:rentFilter
			bind:layoutFilter
			bind:priceFilter
			bind:quickSearch
			{saleCount}
			{rentCount}
			onreset={resetFilters}
		/>

		<Map
			markers={filteredProperties}
			selectedId={selectedProperty}
			onSelected={(id) => selectProperty(id)}
			onDeselect={() => selectProperty(null)}
		/>
	</section>

	{#if selectedProperty}
		<aside
			class:mobile-sheet={isMobile}
			class:desktop-drawer={!isMobile}
			class="preview-wrapper"
		>
			<Preview
				property_id={selectedProperty}
				supabase={data.supabase}
				is_admin={data.is_admin}
				onclose={() => selectProperty(null)}
			/>
		</aside>
	{/if}
</main>

<style>
	:global(body) {
		margin: 0;
	}

	.app-shell {
		position: relative;
		height: 100dvh;
		width: 100%;
		overflow: hidden;
		background: var(--surface-1);
	}

	.map-zone {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.preview-wrapper {
		position: absolute;
		z-index: 20;
		background: var(--surface-1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.desktop-drawer {
		top: 0;
		right: 0;
		bottom: 0;
		width: min(24rem, 38vw);
		border-left: 1px solid var(--surface-3);
		box-shadow: -12px 0 24px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 767px) {
		.app-shell {
			height: auto;
			min-height: 100dvh;
			overflow: visible;
		}

		.map-zone {
			position: relative;
			inset: auto;
			height: 100dvh;
			min-height: 100dvh;
			background: var(--surface-1);
		}

		.map-zone.has-selection {
			height: 40dvh;
			min-height: 40dvh;
		}

		.preview-wrapper.mobile-sheet {
			position: relative;
			inset: auto;
			z-index: 1;
			display: block;
			width: 100%;
			height: auto;
			min-height: 60dvh;
			max-height: none;
			overflow: visible;
			border: 0;
			border-radius: 0;
			box-shadow: none;
		}
	}
</style>
