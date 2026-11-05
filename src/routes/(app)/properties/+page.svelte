<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
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
	let { data, form } = $props();

	const initialBatchSize = 24;
	// svelte-ignore state_referenced_locally
	let visibleCount = $state(form?.visibleCount ?? initialBatchSize);
	let previousFilter = JSON.stringify($filterStore);
	let loadMoreForm = $state();
	let loadMoreButton = $state();
	let isLoadingMore = $state(false);

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
	let visibleProperties = $derived(filtered.slice(0, visibleCount));
	let totalDisplayCount = $derived(
		data.properties.filter(
			(p) =>
				p.is_active === $filterStore.active &&
				(p.land_use === $filterStore.filter_type || $filterStore.filter_type === 'Any'),
		).length,
	);

	$effect(() => {
		const filterSnapshot = JSON.stringify($filterStore);
		if (filterSnapshot !== previousFilter) {
			previousFilter = filterSnapshot;
			visibleCount = initialBatchSize;
		}
	});

	function loadMoreOnSubmit() {
		const submittedFilter = JSON.stringify($filterStore);
		isLoadingMore = true;

		return async ({ result, update }) => {
			if (result.type === 'success' && submittedFilter === JSON.stringify($filterStore)) {
				visibleCount = result.data.visibleCount;
			}

			try {
				await update({ reset: false, refreshAll: false });
			} finally {
				isLoadingMore = false;
			}
		};
	}

	function observeLoadMore(node) {
		if (!('IntersectionObserver' in window)) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !isLoadingMore) {
					loadMoreForm?.requestSubmit(loadMoreButton);
				}
			},
			{ rootMargin: '600px 0px' }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	function nextVisibleCount() {
		return Math.min(visibleCount + initialBatchSize, filtered.length);
	}
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
	{#if form?.error}
		<p class="load-more-error" role="alert">{form.error}</p>
	{/if}

	<article class="properties_list grid">
		{#if visibleProperties.length > 0}
			{#each visibleProperties as property (property.id)}
				<Property {property} />
			{/each}
			<p class="load-more-status" aria-live="polite" aria-atomic="true">
				{#if visibleProperties.length < filtered.length}
					Showing {visibleProperties.length} of {filtered.length} properties
				{:else}
					Showing all {visibleProperties.length} properties
				{/if}
			</p>
		{:else}
			<NothingToSee />
		{/if}

		{#if visibleProperties.length < filtered.length}
			<div class="load-more" use:observeLoadMore>
				<form
					bind:this={loadMoreForm}
					method="POST"
					use:enhance={loadMoreOnSubmit}
					aria-busy={isLoadingMore}
				>
					<button
						bind:this={loadMoreButton}
						type="submit"
						name="visibleCount"
						value={nextVisibleCount()}
						disabled={isLoadingMore}
					>
						{isLoadingMore ? 'Loading properties…' : 'Load more properties'}
					</button>
				</form>
			</div>
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

		@media (min-width: 481px) and (max-width: 767px) and (orientation: landscape) {
			grid-template-areas: 'properties-filter' 'properties-list';
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.load-more {
		display: grid;
		justify-items: center;
		gap: var(--size-2);
		padding: var(--size-4) 0 var(--size-8);
	}

	.load-more button {
		min-height: 2.75rem;
		padding: var(--size-2) var(--size-5);
		border: 1px solid var(--surface-4);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.load-more button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.load-more button:disabled {
		cursor: wait;
		opacity: 0.7;
	}

	.load-more-status {
		grid-column: 1 / -1;
		margin: 0;
		padding: 0 0 var(--size-2);
		color: var(--text-2);
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		text-align: center;
	}

	.load-more-error {
		color: var(--warning-content);
		text-align: center;
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

		@media (min-width: 768px) {
			align-self: stretch;
		}

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
