<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import LogoSvg from '#lib/LogoSvg.svelte';
	import Map from '#lib/map/MapLibre.svelte';
	import Preview from '#lib/Preview.svelte';
	import Nav from '#lib/Nav.svelte';
	import FilterChip from '#lib/FilterChip.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	let loading = $state(data.loading ?? false);
	let selectedProperty = $state(null);
	let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);
	let filtersOpen = $state(false);
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
					(p) => p.id === propParam || (p.msl && p.msl.toLowerCase() === propParam.toLowerCase()),
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

		<div class="toolbar">
			<button
				type="button"
				class="filters-toggle"
				onclick={() => (filtersOpen = !filtersOpen)}
				aria-label="Toggle filters"
				aria-expanded={filtersOpen}>
				Filters
			</button>
		</div>

		<div class="filter-panel" class:open={filtersOpen}>
			<div class="panel-header">
				<h2>Filters</h2>
				<button type="button" class="clear-button" onclick={resetFilters}>Clear all</button>
			</div>

			<label class="search-field">
				<span>Quick search</span>
				<input
					bind:value={quickSearch}
					type="search"
					placeholder="MLS, area, style..."
					aria-label="Quick search properties" />
			</label>

			<div class="filter-shelves">
				<details class="filter-shelf" open>
					<summary>Property type</summary>
					<div class="shelf-body">
						<div class="chip-row">
							<FilterChip bind:active={saleFilter} label="Sale" color="var(--sale)" count={saleCount} />
							<FilterChip bind:active={rentFilter} label="Rent" color="var(--rent)" count={rentCount} />
						</div>
					</div>
				</details>

				<details class="filter-shelf" open>
					<summary>Layout</summary>
					<div class="shelf-body stacked-buttons">
						<button type="button" class="pill-button" class:active={layoutFilter === 'Any'} onclick={() => (layoutFilter = 'Any')}>Any</button>
						<button type="button" class="pill-button" class:active={layoutFilter === '2+ beds'} onclick={() => (layoutFilter = '2+ beds')}>2+ beds</button>
						<button type="button" class="pill-button" class:active={layoutFilter === '3+ beds'} onclick={() => (layoutFilter = '3+ beds')}>3+ beds</button>
						<button type="button" class="pill-button" class:active={layoutFilter === '4+ beds'} onclick={() => (layoutFilter = '4+ beds')}>4+ beds</button>
					</div>
				</details>

				<details class="filter-shelf">
					<summary>Pricing</summary>
					<div class="shelf-body stacked-buttons">
						<button type="button" class="pill-button" class:active={priceFilter === 'Any'} onclick={() => (priceFilter = 'Any')}>Any</button>
						<button type="button" class="pill-button" class:active={priceFilter === 'Up to $400k'} onclick={() => (priceFilter = 'Up to $400k')}>Up to $400k</button>
						<button type="button" class="pill-button" class:active={priceFilter === '$400k - $800k'} onclick={() => (priceFilter = '$400k - $800k')}>$400k - $800k</button>
						<button type="button" class="pill-button" class:active={priceFilter === '$800k+'} onclick={() => (priceFilter = '$800k+')}>$800k+</button>
					</div>
				</details>
			</div>
		</div>

		<Map
			markers={filteredProperties}
			selectedId={selectedProperty}
			onSelected={(id) => selectProperty(id)}
			onDeselect={() => selectProperty(null)} />
	</section>

	{#if selectedProperty}
		<aside class:mobile-sheet={isMobile} class:desktop-drawer={!isMobile} class="preview-wrapper">
			<Preview
				property_id={selectedProperty}
				supabase={data.supabase}
				is_admin={data.is_admin}
				onclose={() => selectProperty(null)} />
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

	.toolbar {
		position: absolute;
		top: 1rem;
		left: 1rem;
		z-index: 12;
	}

	.filters-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.6rem 0.9rem;
		border: 1px solid var(--surface-4);
		border-radius: 999px;
		background: rgba(15, 23, 42, 0.7);
		color: var(--text-1);
		font: inherit;
		font-weight: 600;
		backdrop-filter: blur(8px);
		cursor: pointer;
	}

	.filter-panel {
		position: absolute;
		top: 4.4rem;
		right: 1rem;
		left: auto;
		z-index: 11;
		width: min(22rem, calc(100vw - 2rem));
		padding: 1rem;
		border: 1px solid var(--surface-3);
		border-radius: 1rem;
		background: color-mix(in srgb, var(--surface-1) 88%, transparent);
		backdrop-filter: blur(14px);
		box-shadow: var(--shadow-4, 0 12px 28px rgba(0, 0, 0, 0.24));
		transform: translateX(0);
		transition: transform 180ms ease, opacity 180ms ease;
	}

	.filter-panel:not(.open) {
		opacity: 0;
		pointer-events: none;
		transform: translateX(12px);
	}

	@media (min-width: 768px) {
		.filter-panel {
			top: 5rem;
			right: 1rem;
			left: auto;
		}
		.filter-panel:not(.open) {
			opacity: 1;
			pointer-events: auto;
			transform: translateX(0);
		}
		.filters-toggle {
			display: none;
		}
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 0.85rem;
	}

	.panel-header h2 {
		margin: 0;
		font-size: 1rem;
		font-weight: 700;
		color: var(--text-1);
	}

	.clear-button {
		border: 0;
		background: transparent;
		color: var(--accent, #d4af37);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
	}

	.search-field {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 1rem;
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--text-2);
	}

	.search-field input {
		width: 100%;
		padding: 0.7rem 0.8rem;
		border: 1px solid var(--surface-4);
		border-radius: 0.75rem;
		background: var(--surface-2);
		color: var(--text-1);
		font: inherit;
	}

	.filter-shelves {
		display: grid;
		gap: 0.75rem;
	}

	.filter-shelf {
		border: 1px solid var(--surface-3);
		border-radius: 0.8rem;
		background: rgba(255, 255, 255, 0.02);
		overflow: hidden;
	}

	.filter-shelf summary {
		list-style: none;
		cursor: pointer;
		font-weight: 700;
		padding: 0.8rem 0.9rem;
		color: var(--text-1);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.filter-shelf summary::-webkit-details-marker {
		display: none;
	}

	.filter-shelf summary::after {
		content: '+';
		font-size: 1.1rem;
		color: var(--text-2);
	}

	.filter-shelf[open] summary::after {
		content: '−';
	}

	.shelf-body {
		padding: 0 0.9rem 0.9rem;
	}

	.chip-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.stacked-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.pill-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.52rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--surface-4);
		background: transparent;
		color: var(--text-2);
		font: inherit;
		font-size: 0.78rem;
		cursor: pointer;
	}

	.pill-button.active {
		background: var(--surface-2);
		color: var(--text-1);
		border-color: color-mix(in srgb, var(--accent, #d4af37) 70%, transparent);
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
			z-index: 10;
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

		.filter-panel {
			top: 3.7rem;
		}
	}
</style>
