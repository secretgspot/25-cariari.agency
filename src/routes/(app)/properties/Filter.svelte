<script>
	import { filterStore } from './filter-store.js';
	import Toggle from '#lib/Toggle.svelte';
	import Checkboxes from '#lib/Checkboxes.svelte';
	import Select from '#lib/Select.svelte';
	import { formatter } from '#lib/utils/formatters.js';

	/** @type {{ loggedIn: boolean, isAdmin: boolean, filteredCount: number, totalCount: number }} */
	let { loggedIn, isAdmin, filteredCount, totalCount } = $props();
</script>

<section class="filters" aria-label="Property filters">
	<header class="filter-header">
		<div>
			<p class="filter-eyebrow">PROPERTY SEARCH</p>
			<h2>Refine your search</h2>
		</div>
		<p class="filter-count" aria-live="polite" aria-atomic="true">
			<strong>{filteredCount}</strong>
			<span>of {totalCount} properties</span>
		</p>
	</header>

	<div class="filter-body">
		<section class="filter-group property_type">
			<Select
				variant="filter"
				name="property_type"
				label="Property type"
				bind:selected={$filterStore.filter_type}
			/>
		</section>

		<section class="filter-group transaction_type">
			<h3>Transaction type</h3>

			<div class="row">
				<Checkboxes
					bind:selected={$filterStore.filter_for}
				/>
			</div>
		</section>

		{#if $filterStore.filter_for.includes('Rent') || $filterStore.filter_for.includes('Sale')}
			<section class="filter-group price_range">
				<h3>Maximum price</h3>

				<div class="price-options">
					{#if $filterStore.filter_for.includes('Rent')}
						<label class="price-option" for="rent-filter">
							<span class="price-label">Monthly rent</span>
							<output for="rent-filter">{formatter.format($filterStore.rent)}</output>
							<input
								type="range"
								name="rent-filter"
								id="rent-filter"
								min="100"
								max="10000"
								step="100"
								bind:value={$filterStore.rent}
							/>
						</label>
					{/if}

					{#if $filterStore.filter_for.includes('Sale')}
						<label class="price-option" for="price-filter">
							<span class="price-label">Sale price</span>
							<output for="price-filter">{formatter.format($filterStore.price)}</output>
							<input
								type="range"
								name="price-filter"
								id="price-filter"
								min="10000"
								max="10000000"
								step="10000"
								bind:value={$filterStore.price}
							/>
						</label>
					{/if}
				</div>
			</section>
		{/if}

		<section class="filter-group features">
			<h3>Features</h3>

			<div class="feature-grid">
				<Select
					variant="filter"
					name="beds"
					label="Bedrooms"
					bind:selected={$filterStore.beds}
					options={['Any', '1+', '2+', '3+', '4+', '5+']}
				/>

				<Select
					variant="filter"
					name="baths"
					label="Bathrooms"
					bind:selected={$filterStore.baths}
					options={['Any', '1+', '2+', '3+', '4+', '5+']}
				/>

				<label class="field">
					<span class="field-label">Minimum lot size</span>
					<input
						type="number"
						name="lot-filter"
						min="0"
						bind:value={$filterStore.lot_size}
					/>
				</label>

				<label class="field">
					<span class="field-label">MLS number</span>
					<input type="search" name="msl-filter" bind:value={$filterStore.msl} />
				</label>
			</div>
		</section>

		{#if loggedIn}
			<section class="filter-group other">
				<h3>Listing view</h3>

				<div class="row">
					{#if isAdmin}
						<Toggle
							name="active"
							bind:checked={$filterStore.active}
							label={$filterStore.active ? 'Listed' : 'Delisted'}
							kind="flip"
							on="Listed"
							off="Delisted"
						/>
					{/if}

					<Toggle
						name="user_only"
						bind:checked={$filterStore.user_only}
						label={$filterStore.user_only ? 'My Properties' : 'All Properties'}
						kind="flip"
						on="Mine"
						off="All"
					/>
				</div>
			</section>
		{/if}
	</div>
</section>

<style>
	.filters {
		overflow: hidden;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-3, 1rem);
		background: var(--surface-2);
		box-shadow: 0 12px 32px rgb(0 0 0 / 0.1);
	}

	@media (min-width: 768px) {
		.filters {
			border-top-right-radius: 0;
			border-bottom-right-radius: 0;
		}
	}

	.filter-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--size-3);
		padding: var(--size-4) var(--size-4) var(--size-3);
		border-bottom: 1px solid var(--surface-3);
	}

	.filter-eyebrow {
		margin: 0 0 var(--size-1);
		color: var(--accent);
		font-size: 0.62rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.filter-header h2 {
		margin: 0;
		font-size: 1.1rem;
		font-weight: 650;
		letter-spacing: -0.02em;
	}

	.filter-count {
		display: grid;
		gap: 0.1rem;
		justify-items: end;
		margin: 0;
		color: var(--text-2);
		font-size: 0.68rem;
	}

	.filter-count strong {
		color: var(--text-1);
		font-size: 1.15rem;
		font-variant-numeric: tabular-nums;
	}

	.filter-body {
		display: grid;
	}

	.filter-group {
		display: grid;
		gap: var(--size-2);
		padding: var(--size-3) var(--size-4);
		border-bottom: 1px solid var(--surface-3);
	}

	.filter-group:last-child {
		border-bottom: 0;
	}

	.filter-group h3 {
		margin: 0;
		color: var(--text-1);
		font-size: 0.78rem;
		font-weight: 650;
		letter-spacing: -0.01em;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
	}

	.transaction_type .row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--size-3);
	}

	.transaction_type .row :global(.square) {
		justify-self: center;
	}

	.price-options {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--size-3);
	}

	.price-option {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--size-2) var(--size-1);
		min-width: 0;
		color: var(--text-2);
		font-size: 0.68rem;
	}

	.price-label {
		min-width: 0;
	}

	output {
		padding: 0.25rem 0.4rem;
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		color: var(--text-1);
		font-size: 0.68rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	input[type='range'] {
		appearance: none;
		grid-column: 1 / -1;
		height: 1rem;
		margin: 0.2rem 0;
		padding: 0;
		border: 0;
		background: transparent;
		accent-color: var(--accent);
		cursor: pointer;
	}

	input[type='range']::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: var(--radius-round, 999px);
		background: var(--surface-4);
	}

	input[type='range']::-webkit-slider-thumb {
		width: 0.9rem;
		height: 0.9rem;
		margin-top: calc((4px - 0.9rem) / 2);
		border: 2px solid var(--surface-1);
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
		appearance: none;
	}

	input[type='range']::-moz-range-track {
		height: 4px;
		border-radius: var(--radius-round, 999px);
		background: var(--surface-4);
	}

	input[type='range']::-moz-range-progress {
		height: 4px;
		border-radius: var(--radius-round, 999px);
		background: var(--accent);
	}

	input[type='range']::-moz-range-thumb {
		width: 0.65rem;
		height: 0.65rem;
		border: 2px solid var(--surface-1);
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 0 1px var(--accent);
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: end;
		gap: var(--size-3);
	}

	.field {
		display: grid;
		gap: var(--size-1);
		min-width: 0;
		color: var(--text-2);
		font-size: 0.68rem;
	}

	.field-label {
		line-height: 1.3;
	}

	.field input {
		min-width: 0;
		min-height: 2.45rem;
		padding: 0.45rem 0.65rem;
		border: 1px solid var(--surface-4);
		border-radius: var(--radius-2);
		background: var(--surface-1);
		font: inherit;
		font-size: 0.82rem;
		transition:
			border-color var(--transition, 180ms),
			box-shadow var(--transition, 180ms);
	}

	.field input:hover {
		border-color: var(--text-2);
	}

	.field input:focus-visible,
	input[type='range']:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	.other .row {
		align-items: center;
	}
</style>
