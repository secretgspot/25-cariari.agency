<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import NothingToSee from '#lib/NothingToSee.svelte';
	import Property from './Property.svelte';
	import Filter from './Filter.svelte';
	import Logo from '#lib/Logo.svelte';
	import Nav from '#lib/Nav.svelte';
	import {
		filterStore,
		getFilteredProperties,
		getPriceFilterLimits
	} from './filter-store.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// console.log('(app)/properties/+page.svelte data: ', data);

	let priceLimits = $derived(getPriceFilterLimits(data.properties, $filterStore.active));
	let effectiveFilter = $derived({
		...$filterStore,
		rent:
			$filterStore.rent === null || priceLimits.rent === null
				? priceLimits.rent
				: Math.min(Number($filterStore.rent), priceLimits.rent),
		price:
			$filterStore.price === null || priceLimits.price === null
				? priceLimits.price
				: Math.min(Number($filterStore.price), priceLimits.price)
	});

	let filtered = $derived(
		getFilteredProperties(data.properties, effectiveFilter, data.user),
	);
	let totalDisplayCount = $derived(
		data.properties.filter(
			(p) =>
				p.is_active === $filterStore.active &&
				(p.land_use === $filterStore.filter_type || $filterStore.filter_type === 'Any'),
		).length,
	);
</script>

<svelte:head>
	<title>Properties for Sale and Rent in Cariari, Costa Rica - Cariari Agency</title>
	<meta
		name="description"
		content="Browse properties for sale and rent in Cariari, Costa Rica. Find houses, apartments, and land with Cariari Agency." />
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
	<Nav fixed />
{/if}

<main>
	<article class="properties_list grid">
		{#if filtered.length > 0}
			{#each filtered as property (property.id)}
				<Property {property} />
			{/each}
		{:else}
			<NothingToSee />
		{/if}
	</article>

	<aside class="filter-wrapper">
		<div class="filter-sticky">
			<Filter
				loggedIn={data.is_logged_in}
				isAdmin={data.is_admin}
				filteredCount={filtered.length}
				totalCount={totalDisplayCount}
				rentMax={priceLimits.rent}
				priceMax={priceLimits.price}
			/>
		</div>
	</aside>
</main>

<style>
	main {
		display: grid;
		grid-template-areas:
			'properties-filter'
			'properties-list';
		grid-template-columns: minmax(0, 1fr);

		@media (min-width: 768px) {
			grid-template-areas: 'properties-list properties-filter';
			grid-template-columns: minmax(0, 1fr) minmax(300px, 369px);
			align-items: start;
		}

		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			grid-template-areas: 'properties-filter' 'properties-list';
			grid-template-columns: minmax(0, 1fr);
		}
	}

	/*
		PROPERTIES LIST SECTION
	 */
	.properties_list {
		grid-area: properties-list;
		display: grid;
		grid-template-columns: minmax(min-content, auto);
		grid-template-rows: max-content;
		grid-auto-flow: dense;
		/* grid-gap: var(--gap-medium); */
		row-gap: var(--size-2);
		padding: var(--size-8) 0;
		position: relative;
		margin-inline: var(--size-3);

		@media (min-width: 768px) {
			/* grid-template-columns: repeat(auto-fit, minmax(min-content, 369px)); */
			grid-template-columns: repeat(auto-fit, minmax(0, 369px));
			justify-content: space-evenly;
			margin-inline: unset;
		}

		> :global(.property) {
			grid-template-columns: 1fr;
			/* grid-template-rows: minmax(auto, 222px) min-content auto min-content; */
			grid-template-rows: minmax(auto, 222px) auto min-content;
			grid-template-areas:
				'property-image'
				'property-header'
				'property-footer';
		}
	}

	/*
		FILTER SECTION
	 */
	.filter-wrapper {
		grid-area: properties-filter;
		position: relative;

		.filter-sticky {
			position: sticky;
			top: var(--size-3);
			padding: var(--size-9) 0 0;
		}
	}

	@media (max-width: 767px) {
		.filter-wrapper .filter-sticky {
			position: static;
			padding: 4.5rem var(--size-3) 0;
		}
	}
</style>
