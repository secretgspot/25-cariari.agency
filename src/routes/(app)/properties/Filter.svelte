<script>
	import { filterStore } from './filter-store.js';
	import Toggle from '$lib/Toggle.svelte';
	import Checkboxes from '$lib/Checkboxes.svelte';
	import Select from '$lib/Select.svelte';
	import { formatter } from '$lib/utils/formatters.js';

	/** @type {import('./$types').PageData} */
	let { loggedIn, isAdmin } = $props();

	// console.log('(app)/properties/+page.svelte filter loggedIn: ', loggedIn);
</script>

<section class="filters">
	<div class="property_type">
		<h3>Property Type</h3>

		<Select name="property_type" bind:selected={$filterStore.filter_type} />
	</div>

	<div class="transaction_type">
		<h3>Transaction Type</h3>

		<div class="row">
			<Checkboxes bind:selected={$filterStore.filter_for} />
		</div>
	</div>

	{#if $filterStore.filter_for.includes('Rent') || $filterStore.filter_for.includes('Sale')}
		<div class="price_range">
			<h3>Price Range</h3>

			<div class="column">
				{#if $filterStore.filter_for.includes('Rent')}
					<label class="range column">
						<!-- {formatter.format($filterStore.rent)} -->
						<input
							type="range"
							name="rent-filter"
							min="100"
							max="10000"
							step="100"
							bind:value={$filterStore.rent} />
						<small>{formatter.format($filterStore.rent)} monthly</small>
					</label>
				{/if}

				{#if $filterStore.filter_for.includes('Sale')}
					<label class="range column">
						<!-- {formatter.format($filterStore.price)} -->
						<input
							type="range"
							name="price-filter"
							min="10000"
							max="10000000"
							step="10000"
							bind:value={$filterStore.price} />
						<small>{formatter.format($filterStore.price)} price</small>
					</label>
				{/if}
			</div>
		</div>
	{/if}

	<div class="features">
		<h3>Features</h3>

		<div class="row">
			<Select
				name="beds"
				label="bedrooms"
				bind:selected={$filterStore.beds}
				options={['Any', '1+', '2+', '3+', '4+', '5+']} />

			<Select
				name="baths"
				label="baths"
				bind:selected={$filterStore.baths}
				options={['Any', '1+', '2+', '3+', '4+', '5+']} />

			<label class="number">
				<input
					type="number"
					name="lot-filter"
					min="0"
					bind:value={$filterStore.lot_size} />
				<span class="label-text">min lot size</span>
			</label>

			<label class="text">
				<input type="text" name="msl-filter" bind:value={$filterStore.msl} />
				<span class="label-text">msl</span>
			</label>
		</div>
	</div>

	{#if loggedIn}
		<div class="other">
			<h3>Listing View</h3>

			<div class="row">
				{#if isAdmin}
					<Toggle
						name="active"
						bind:checked={$filterStore.active}
						label={$filterStore.active ? 'Listed' : 'Delisted'}
						kind="flip"
						on="Listed"
						off="Delisted" />
				{/if}

				<Toggle
					name="user_only"
					bind:checked={$filterStore.user_only}
					label={$filterStore.user_only ? 'My Properties' : 'All Properties'}
					kind="flip"
					on="Mine"
					off="All" />
			</div>
		</div>
	{/if}
</section>

<style>
	.filters {
		display: grid;
		h3 {
			color: var(--text-2);
			font-weight: normal;
		}
	}

	.row {
		display: flex;
		justify-content: space-between;
	}
	.column {
		display: flex;
		flex-direction: column;
	}

	.property_type,
	.transaction_type,
	.price_range,
	.features,
	.other {
		box-shadow: var(--shadow-1);
		padding: 0 var(--size-3) var(--size-3);
	}

	.price_range .range:first-child {
		margin-bottom: var(--size-2);
	}

	.transaction_type .row {
		justify-content: space-around;
	}

	.features .row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: baseline;
		gap: var(--size-2);
		row-gap: var(--size-3);

		.label-text {
			font-size: small;
			color: var(--text-2);
		}
	}

	.other .row {
		justify-content: flex-start;
		gap: var(--size-3);
	}
</style>
