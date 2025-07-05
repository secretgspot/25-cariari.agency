<!-- @migration-task Error while migrating Svelte code: Cannot bind to derived state -->
<script>
	/** @type {import('./$types').PageData} */
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import JsonDump from '$lib/JSONDump.svelte';
	import ErrorImage from '$lib/ErrorImage.svelte';
	import Property from './Property.svelte';
	import Filter from './Filter.svelte';
	import Logo from '$lib/Logo.svelte';
	import Nav from '$lib/Nav.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data, supabase } = $props();

	let filter = $derived((filter && filterArray(data.properties, filters)) || []);
	let view_style = $state('grid');

	const filters = {
		is_active: (is_active) => is_active == filter.active,
		land_use: (land_use) => land_use == filter.filter_type,
		property_for: (property_for) =>
			property_for.find((x) => filter.filter_for.includes(x)),
		rent: (rent) => rent <= filter.rent,
		price: (price) => price <= filter.price,
		beds: (beds) => beds <= filter.beds,
		baths: (baths) => baths <= filter.baths,
		rooms: (rooms) => rooms <= filter.rooms,
		msl: (msl) => msl.includes(filter.msl),
	};

	function filterArray(array, filters) {
		const filterKeys = Object.keys(filters);
		return array.filter((item) => {
			// validates all filter criteria
			return filterKeys.every((key) => {
				if (typeof filters[key] !== 'function') return true; // ignores non-function predicates
				if (!filters[key].length) return true; // passing an empty filter means that filter is ignored.
				// console.log("🎈", filters[key](item[key]));
				return filters[key](item[key]);
			});
		});
	}
</script>

<svelte:head>
	<title>Properties listing - Cariari Agency</title>
</svelte:head>

{#if !navigating.complete}
	<Logo type="regular" color="bw" fixed="fixed" onclick={() => goto('/')} />
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
				<Nav basic url={page.url} />
			</div>

			<Filter bind:filter />
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
	}

	@media (min-width: 768px) {
		/* .filter-wrapper {
			height: 100vh;
			display: grid;
			position: relative;
		} */
		main {
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
	}
	@media (min-width: 720px) {
		.filters-menu {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.filters-menu h3 {
		white-space: nowrap;
		margin: 0;
		justify-self: end;
	}
	.view_type {
		display: none;
	}
	@media (min-width: 720px) {
		.filters-menu h3 {
			justify-self: auto;
		}
		.view_type {
			display: flex;
		}
	}
	.view_type label {
		border: var(--border);
		padding: var(--padding-extra-small);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow);
		cursor: pointer;
	}

	.view_type label:not(:first-of-type) {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.view_type label:not(:last-of-type) {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.view_type input[type='radio'] {
		display: none;
	}
	.view_type label:has(input[type='radio']:checked) {
		border: 1px solid var(--accent);
		box-shadow: inset 0px 0px 0 3px var(--success);
	}
</style>
