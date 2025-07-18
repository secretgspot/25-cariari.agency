<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import NothingToSee from '$lib/NothingToSee.svelte';
	import Property from './Property.svelte';
	import Filter from './Filter.svelte';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import { filterStore, getFilteredProperties } from './filter-store.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	// console.log('(app)/properties/+page.svelte data: ', data);

	let filtered = $derived(
		getFilteredProperties(data.properties, $filterStore, data.user),
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
	<meta name="description" content="Browse properties for sale and rent in Cariari, Costa Rica. Find houses, apartments, and land with Cariari Agency." />
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
{/if}

<main>
	<div class="properties_list grid">
		{#if filtered.length > 0}
			{#each filtered as property (property.id)}
				<Property {property} />
			{/each}
		{:else}
			<NothingToSee />
		{/if}
	</div>

	<aside class="filter-wrapper">
		<div class="filter-sticky">
			<div class="filters-menu">
				<h3>{filtered.length} / {totalDisplayCount}</h3>

				<!-- {#if isAdmin}
				<Button href="/property">Add new</Button>
				{/if} -->
				<Nav basic />
			</div>

			<Filter loggedIn={data.is_logged_in} />
		</div>
	</aside>
</main>

<style>
	main {
		display: grid;
		grid-template-areas:
			'properties-filter'
			'properties-list';

		@media (min-width: 768px) {
			grid-template-areas:
				'properties-list'
				'properties-filter';
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 369px;
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
		row-gap: var(--gap-small);
		padding: var(--padding-large) 0;
		position: relative;

		@media (min-width: 768px) {
			/* grid-template-columns: repeat(auto-fit, minmax(min-content, 369px)); */
			grid-template-columns: repeat(auto-fit, minmax(0, 369px));
			justify-content: space-evenly;
		}

		> :global(.property) {
			grid-template-columns: 1fr;
			/* grid-template-rows: minmax(auto, 222px) min-content auto min-content; */
			grid-template-rows: minmax(auto, 222px) min-content min-content;
			grid-template-areas:
				'property-image'
				'property-header'
				'property-footer';
			/* padding: 1rem 0 0; */
		}
	}
	/* @media (min-width: 1024px) {
		.properties_list.grid {
			grid-template-columns: repeat(auto-fit, minmax(min-content, 313px));
		}
	} */

	/*
		FILTER SECTION
	 */
	.filter-wrapper {
		position: relative;

		.filter-sticky {
			position: sticky;
			top: 0;
		}

		.filters-menu {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			align-items: center;
			justify-items: center;
			/* margin: 0 var(--padding-small); */
			padding: var(--padding-small);

			@media (min-width: 720px) {
				grid-template-columns: repeat(2, 1fr);
			}

			h3 {
				white-space: nowrap;
				margin: 0;
				justify-self: end;

				@media (min-width: 720px) {
					justify-self: auto;
				}
			}
		}
	}
</style>
