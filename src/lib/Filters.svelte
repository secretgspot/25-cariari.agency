<script>
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';
	import FilterChip from '#lib/FilterChip.svelte';

	/**
	 * @type {{
	 *   saleFilter?: boolean;
	 *   rentFilter?: boolean;
	 *   saleCount?: number;
	 *   rentCount?: number;
	 *   layoutFilter?: string;
	 *   priceFilter?: string;
	 *   listingAgeFilter?: string;
	 *   quickSearch?: string;
	 *   onreset?: () => void;
	 * }}
	 */
	let {
		saleFilter = $bindable(true),
		rentFilter = $bindable(true),
		saleCount = 0,
		rentCount = 0,
		layoutFilter = $bindable('Any'),
		priceFilter = $bindable('Any'),
		listingAgeFilter = $bindable('Any'),
		quickSearch = $bindable(''),
		onreset,
	} = $props();

	let popoverOpen = $state(false);
	let rootEl = $state(null);

	const activeSecondaryCount = $derived(
		(layoutFilter !== 'Any' ? 1 : 0) +
			(priceFilter !== 'Any' ? 1 : 0) +
			(listingAgeFilter !== 'Any' ? 1 : 0) +
			(quickSearch.trim() !== '' ? 1 : 0),
	);

	const hasActiveFilters = $derived(
		!saleFilter || !rentFilter || activeSecondaryCount > 0,
	);

	function togglePopover() {
		playButtonSound('click');
		vibrateButton('click');
		popoverOpen = !popoverOpen;
	}

	function handleReset() {
		playButtonSound('click');
		vibrateButton('click');
		saleFilter = true;
		rentFilter = true;
		layoutFilter = 'Any';
		priceFilter = 'Any';
		listingAgeFilter = 'Any';
		quickSearch = '';
		if (onreset) onreset();
	}

	function setLayout(val) {
		playButtonSound('click');
		vibrateButton('click');
		layoutFilter = val;
	}

	function setPrice(val) {
		playButtonSound('click');
		vibrateButton('click');
		priceFilter = val;
	}

	function setListingAge(val) {
		playButtonSound('click');
		vibrateButton('click');
		listingAgeFilter = val;
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && popoverOpen) {
			popoverOpen = false;
		}
	}

	function handleWindowPointerDown(e) {
		if (popoverOpen && rootEl && !rootEl.contains(e.target)) {
			popoverOpen = false;
		}
	}
</script>

<svelte:window onpointerdown={handleWindowPointerDown} onkeydown={handleKeydown} />

<div class="filters-container" bind:this={rootEl}>
	<div class="filters-bar" role="toolbar" aria-label="Map filters">
		<FilterChip
			bind:active={saleFilter}
			label="Sale"
			color="var(--sale)"
			count={saleCount}
		/>
		<FilterChip
			bind:active={rentFilter}
			label="Rent"
			color="var(--rent)"
			count={rentCount}
		/>

		<button
			type="button"
			class="more-btn"
			class:active={popoverOpen || activeSecondaryCount > 0}
			onclick={togglePopover}
			aria-expanded={popoverOpen}
			aria-label="Additional filters"
			title="More filters"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="4" y1="21" x2="4" y2="14"></line>
				<line x1="4" y1="10" x2="4" y2="3"></line>
				<line x1="12" y1="21" x2="12" y2="12"></line>
				<line x1="12" y1="8" x2="12" y2="3"></line>
				<line x1="20" y1="21" x2="20" y2="16"></line>
				<line x1="20" y1="12" x2="20" y2="3"></line>
				<line x1="1" y1="14" x2="7" y2="14"></line>
				<line x1="9" y1="8" x2="15" y2="8"></line>
				<line x1="17" y1="16" x2="23" y2="16"></line>
			</svg>
			<span class="more-label">Filter</span>
			{#if activeSecondaryCount > 0}
				<span class="active-badge">{activeSecondaryCount}</span>
			{/if}
		</button>
	</div>

	{#if popoverOpen}
		<div class="filters-popover" role="dialog" aria-label="Filter properties">
			<div class="popover-header">
				<span class="popover-title">Filters</span>
				{#if hasActiveFilters}
					<button type="button" class="reset-btn" onclick={handleReset}>
						Clear all
					</button>
				{/if}
			</div>

			<!-- Quick Search -->
			<div class="search-box">
				<svg
					class="search-icon"
					xmlns="http://www.w3.org/2000/svg"
					width="13"
					height="13"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<circle cx="11" cy="11" r="8"></circle>
					<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
				</svg>
				<input
					type="search"
					placeholder="MLS, area, style..."
					bind:value={quickSearch}
					aria-label="Quick search properties"
				/>
				{#if quickSearch}
					<button
						type="button"
						class="clear-search-btn"
						onclick={() => (quickSearch = '')}
						aria-label="Clear search"
					>
						×
					</button>
				{/if}
			</div>

			<!-- Bedrooms segmented row -->
			<div class="filter-group">
				<span class="group-label">Bedrooms</span>
				<div
					class="segmented-control"
					role="radiogroup"
					aria-label="Filter by bedrooms"
				>
					{#each ['Any', '2+ beds', '3+ beds', '4+ beds'] as opt}
						<button
							type="button"
							class="segment-btn"
							class:active={layoutFilter === opt}
							onclick={() => setLayout(opt)}
						>
							{opt === 'Any' ? 'Any' : opt.replace(' beds', '+')}
						</button>
					{/each}
				</div>
			</div>

			<!-- Price range segmented row -->
			<div class="filter-group">
				<span class="group-label">Price Range</span>
				<div
					class="segmented-control"
					role="radiogroup"
					aria-label="Filter by price"
				>
					{#each [{ id: 'Any', label: 'Any' }, { id: 'Up to $400k', label: '<$400k' }, { id: '$400k - $800k', label: '$400k-$800k' }, { id: '$800k+', label: '$800k+' }] as opt}
						<button
							type="button"
							class="segment-btn"
							class:active={priceFilter === opt.id}
							onclick={() => setPrice(opt.id)}
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>

			<div class="filter-group">
				<span class="group-label">On Market</span>
				<div
					class="segmented-control age-segmented-control"
					role="group"
					aria-label="Filter by listing age"
				>
					{#each [{ id: 'Any', label: 'Any' }, { id: 'Fresh', label: 'Fresh <30d' }] as opt}
						<button
							type="button"
							class="segment-btn"
							class:active={listingAgeFilter === opt.id}
							aria-pressed={listingAgeFilter === opt.id}
							onclick={() => setListingAge(opt.id)}
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.filters-container {
		position: absolute;
		top: calc(var(--size-3) * 3.3);
		right: 0;
		z-index: 12;
		user-select: none;
	}

	.filters-bar {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--surface-1);
		padding: 3px 8px 3px 6px;
		border-radius: var(--radius-2);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		box-shadow: var(--shadow-2);
		backdrop-filter: blur(8px);
	}

	.more-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		background: transparent;
		color: var(--text-2);
		border: 1px solid transparent;
		border-radius: var(--radius-round, 999px);
		padding: 3px 8px;
		font-family: inherit;
		font-size: var(--font-size-0, 0.82rem);
		font-weight: 500;
		cursor: pointer;
		opacity: 0.7;
		transition: all var(--transition, 0.15s ease);
	}

	.more-btn:hover {
		opacity: 1;
		color: var(--text-1);
	}

	.more-btn.active {
		color: var(--text-1);
		background: var(--surface-2);
		border-color: var(--surface-4);
		opacity: 1;
		font-weight: 600;
	}

	.more-label {
		display: inline;
		font-size: 0.8rem;
	}

	.active-badge {
		font-size: 0.68rem;
		background: var(--accent, #d4af37);
		color: var(--stone-12, #111);
		font-weight: 700;
		padding: 0 5px;
		border-radius: var(--radius-round, 999px);
		line-height: 1.3;
	}

	/* Popover Dropdown */
	.filters-popover {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		width: min(290px, calc(100vw - 16px));
		max-height: calc(85dvh - 4rem);
		overflow-y: auto;
		background: var(--surface-1);
		border: 1px solid var(--surface-3);
		border-radius: var(--radius-2);
		border-top-right-radius: 0;
		box-shadow: var(--shadow-4, 0 10px 25px rgba(0, 0, 0, 0.25));
		backdrop-filter: blur(14px);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.popover-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.popover-title {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--text-1);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.reset-btn {
		background: transparent;
		border: 0;
		color: var(--accent, #d4af37);
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		transition: opacity 0.15s ease;
	}

	.reset-btn:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	.search-box {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: 8px;
		color: var(--text-2);
		pointer-events: none;
	}

	.search-box input {
		width: 100%;
		padding: 6px 26px 6px 26px;
		border: 1px solid var(--surface-4);
		border-radius: var(--radius-1, 4px);
		background: var(--surface-2);
		color: var(--text-1);
		font-family: inherit;
		font-size: 0.8rem;
		outline: none;
		transition: border-color 0.15s ease;
	}

	.search-box input:focus {
		border-color: var(--accent, #d4af37);
	}

	.clear-search-btn {
		position: absolute;
		right: 6px;
		background: transparent;
		border: 0;
		color: var(--text-2);
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
		padding: 2px 4px;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.group-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--text-2);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.segmented-control {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 3px;
		background: var(--surface-2);
		padding: 2px;
		border-radius: var(--radius-1, 4px);
		border: 1px solid var(--surface-3);
	}

	.age-segmented-control {
		grid-template-columns: repeat(2, 1fr);
	}

	.segment-btn {
		border: 0;
		background: transparent;
		color: var(--text-2);
		font-family: inherit;
		font-size: 0.72rem;
		font-weight: 500;
		padding: 5px 2px;
		border-radius: 2px;
		cursor: pointer;
		text-align: center;
		white-space: nowrap;
		transition: all 0.15s ease;
	}

	.segment-btn:hover {
		color: var(--text-1);
	}

	.segment-btn.active {
		background: var(--surface-4);
		color: var(--text-1);
		font-weight: 700;
		box-shadow: var(--shadow-1);
	}
</style>
