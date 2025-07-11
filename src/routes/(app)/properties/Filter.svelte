<script>
	import { filterStore } from './filter-store.js';
	import Toggle from '$lib/Toggle.svelte';
	import Checkboxes from '$lib/Checkboxes.svelte';
	import Select from '$lib/Select.svelte';
	import { formatter } from '$lib/utils/helpers.js';
</script>

<section class="filters">
	<div class="property_type">
		<h3>Property Type</h3>

		<label class="select">
			<Select name="property_type" bind:selected={$filterStore.filter_type} />
		</label>
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
			<label class="select">
				<Select
					name="beds"
					bind:selected={$filterStore.beds}
					options={['Any', '1+', '2+', '3+', '4+', '5+']} /> bedrooms
			</label>

			<label class="select">
				<Select
					name="baths"
					bind:selected={$filterStore.baths}
					options={['Any', '1+', '2+', '3+', '4+', '5+']} /> baths
			</label>

			<label class="number">
				<input type="number" min="0" bind:value={$filterStore.lot_size} /> min lot size
			</label>
		</div>
	</div>

	<div class="other">
		<h3>Other</h3>

		<div class="row">
			<Toggle
				name="active"
				bind:checked={$filterStore.active}
				label={$filterStore.active ? 'Listed' : 'Delisted'}
				kind="flip"
				on="Listed"
				off="Delisted" />

			<Toggle
				name="user_only"
				bind:checked={$filterStore.user_only}
				label={$filterStore.user_only ? 'My Properties' : 'All Properties'}
				kind="flip"
				on="Mine"
				off="All" />

			<label class="text">
				<input type="text" bind:value={$filterStore.msl} /> msl
			</label>
		</div>
	</div>
</section>

<style>
	.filters {
		display: grid;
	}
	.filters h3 {
		color: var(--secondary-content);
		font-weight: normal;
	}

	.row {
		display: flex;
		justify-content: space-between;
	}
	.column {
		display: flex;
		flex-direction: column;
	}

	input[type='text'],
	input[type='number'],
	:global(select) {
		display: block;
		padding: var(--padding-extra-small);
		border: var(--border);
		border-radius: var(--border-radius);
		width: 100%;
		background: transparent;
		color: var(--primary-content);
	}
	/* input[type="text"],
	input[type="number"] {
		max-width: 81px;
	} */

	.property_type,
	.transaction_type,
	.price_range,
	.features,
	.other {
		box-shadow: var(--shadow-small);
		padding: 0 var(--padding-medium) var(--padding-medium);
	}

	.price_range .range:first-child {
		margin-bottom: var(--padding-small);
	}

	.transaction_type .row {
		justify-content: space-around;
	}

	.features .row {
		gap: var(--gap-small);
	}

	.other .row {
		align-items: flex-start;
		gap: var(--gap-medium);
	}
</style>
