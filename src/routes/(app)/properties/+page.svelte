<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import JsonDump from '$lib/JSONDump.svelte';
	import ErrorImage from '$lib/ErrorImage.svelte';
	import Property from './Property.svelte';
	import Filter from './Filter.svelte';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';
	import { filterStore } from './filter-store.js';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let view_style = $state('grid');

	const filterFunctions = {
		is_active: (is_active) => is_active == $filterStore.active,
		land_use: (land_use) => land_use == $filterStore.filter_type,
		property_for: (property_for) =>
			property_for.find((x) => $filterStore.filter_for.includes(x)),
		rent: (rent) => rent <= $filterStore.rent,
		price: (price) => price <= $filterStore.price,
		beds: (beds) => beds <= $filterStore.beds,
		baths: (baths) => baths <= $filterStore.baths,
		rooms: (rooms) => rooms <= $filterStore.rooms,
		msl: (msl) => msl.includes($filterStore.msl),
	};

	let filtered = $derived(
		data.properties.filter((item) => {
			return Object.keys(filterFunctions).every((key) => {
				const filter = filterFunctions[key];
				if (typeof filter !== 'function') return true;
				return filter(item[key]);
			});
		}),
	);
</script>

<svelte:head>
	<title>Properties listing - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed onclick={() => goto('/')} />
{/if}

<main>
	<div class="properties_list {view_style}">
		{#if filtered.length > 0}
			{#each filtered as property (property.id)}
				<Property {property} />
			{/each}
		{:else}
			<!-- <div class="nothing_to_see"> -->
			<ErrorImage type="empty" />
			<!-- </div> -->
		{/if}
	</div>

	<aside class="filter-wrapper">
		<div class="filter-sticky">
			<div class="filters-menu">
				<div class="view_type {view_style}">
					<label
						class="radio radio_grid"
						class:active={view_style == 'grid'}
						for="radio_grid">
						<span>☷<!-- &#9783; --></span>
						<input type="radio" id="radio_grid" bind:group={view_style} value="grid" />
					</label>

					<label
						class="radio radio_list"
						class:active={view_style == 'list'}
						for="radio_list">
						<span>☰<!-- &#9776; --></span>
						<input type="radio" id="radio_list" bind:group={view_style} value="list" />
					</label>
				</div>

				<h3>{filtered.length} / {data.properties.length}</h3>

				<!-- {#if isAdmin}
				<Button href="/property">Add new</Button>
				{/if} -->
				<Nav basic />
			</div>

			<Filter />
		</div>
	</aside>
</main>

<!-- <JsonDump name="data" {data} /> -->
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
	.properties_list.grid > :global(.property) {
		grid-template-columns: 1fr;
		/* grid-template-rows: minmax(auto, 222px) min-content auto min-content; */
		grid-template-rows: minmax(auto, 222px) min-content min-content;
		grid-template-areas:
			'property-image'
			'property-header'
			'property-footer';
		/* padding: 1rem 0 0; */
	}
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
	}
	@media (min-width: 768px) {
		.properties_list.grid {
			/* grid-template-columns: repeat(auto-fit, minmax(min-content, 369px)); */
			grid-template-columns: repeat(auto-fit, minmax(0, 369px));
			justify-content: space-evenly;
		}
	}
	/* @media (min-width: 1024px) {
		.properties_list.grid {
			grid-template-columns: repeat(auto-fit, minmax(min-content, 313px));
		}
	} */

	/*
		NOTHING TO SEE LIST SECTION
	 */
	.nothing_to_see {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: var(--bg-secondary);
	}
	/* .nothing_to_see :global(svg) {
		max-width: 63%;
		filter: brightness(var(--brightness));
	} */

	/*
		FILTER SECTION
	 */
	.filters-wrappers {
		position: relative;
	}
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
			grid-template-columns: repeat(3, 1fr);
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

	.view_type {
		display: none;
		@media (min-width: 720px) {
			display: flex;
		}

		label {
			border: var(--border);
			padding: var(--padding-extra-small);
			border-radius: var(--border-radius);
			box-shadow: var(--shadow);
			cursor: pointer;

			&:not(:first-of-type) {
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
			}
			&:not(:last-of-type) {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
			}
			&:has(input[type='radio']:checked) {
				border: 1px solid var(--accent);
				box-shadow: inset 0px 0px 0 3px var(--success);
			}
		}

		input[type='radio'] {
			display: none;
		}
	}
</style>
