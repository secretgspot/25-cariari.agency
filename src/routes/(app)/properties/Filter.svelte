<script>
	import filterStore from "./filter-store.js";
	import Toggle from "$lib/Toggle.svelte";
	import Checkboxes from "$lib/Checkboxes.svelte";
	import { formatter } from "$lib/utils/helpers.js";

	/** @type {{filter?: any}} */
	let { filter = $bindable($filterStore) } = $props();
</script>

<section class="filters">
	<div class="property_type">
		<h3>Property Type</h3>

		<label class="select">
			<select name="property_type" bind:value={filter.filter_type}>
				<option>Residential</option>
				<option>Commercial</option>
				<option>Industrial</option>
			</select>
		</label>
	</div>

	<div class="transaction_type">
		<h3>Transaction Type</h3>

		<div class="row">
			<Checkboxes bind:selected={filter.filter_for} />
		</div>
	</div>

	{#if filter.filter_for.includes("Rent") || filter.filter_for.includes("Sale") || filter.filter_for.includes("Investment")}
		<div class="price_range">
			<h3>Price Range</h3>

			<div class="column">
				{#if filter.filter_for.includes("Rent")}
					<label class="range column">
						<!-- {formatter.format(filter.rent)} -->
						<input
							type="range"
							min="100"
							max="10000"
							step="100"
							bind:value={filter.rent}
						/> <small>{formatter.format(filter.rent)} monthly</small>
					</label>
				{/if}

				{#if filter.filter_for.includes("Sale") || filter.filter_for.includes("Investment")}
					<label class="range column">
						<!-- {formatter.format(filter.price)} -->
						<input
							type="range"
							min="10000"
							max="10000000"
							step="10000"
							bind:value={filter.price}
						/> <small>{formatter.format(filter.price)} price</small>
					</label>
				{/if}
			</div>
		</div>
	{/if}

	<div class="features">
		<h3>Features</h3>

		<div class="row">
			<label class="number">
				<input type="number" min="0" bind:value={filter.beds} /> beds
			</label>

			<label class="number">
				<input type="number" min="0" bind:value={filter.baths} /> baths
			</label>

			<label class="number">
				<input type="number" min="0" bind:value={filter.rooms} /> rooms
			</label>
		</div>
	</div>

	<div class="others">
		<h3>Others</h3>

		<div class="row">
			<Toggle
				name="active"
				bind:checked={filter.active}
				label={filter.active ? "Listed" : "Delisted"}
			/>
			<!-- <label class="checkbox">
				<input type="checkbox" bind:checked="{filter.active}" />
				<span>Active</span>
			</label> -->

			<label class="text">
				<input type="text" bind:value={filter.msl} /> msl
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

	input[type="text"],
	input[type="number"],
	select {
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
	.others {
		box-shadow: var(--shadow-small);
		padding: 0 var(--padding-medium) var(--padding-medium);
	}

	.price_range .range:first-child {
		margin-bottom: var(--padding-small);
	}

	.features .row {
		gap: var(--gap-small);
	}

	.others .row {
		align-items: flex-start;
	}
</style>
