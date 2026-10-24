<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/env';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import LogoSvg from '#lib/LogoSvg.svelte';
	import Map from '#lib/map/Map.svelte';
	import Preview from '#lib/Preview.svelte';
	import Nav from '#lib/Nav.svelte';
	import FilterChips from '#lib/FilterChips.svelte';
	import FilterChip from '#lib/FilterChip.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();

	let loading = $state(data.loading ?? false);
	let selectedProperty = $state(null);
	let innerWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1024);

	const isMobile = $derived(innerWidth < 768);

	// ------- Mobile Bottom Sheet State Machine -------
	// 'peek'     = halfway open (~48dvh)
	// 'expanded' = near full screen (~88dvh)
	let sheetState = $state(/** @type {'peek'|'expanded'} */ ('peek'));

	// Heights in dvh units for each snap state
	const SHEET_PEEK_HEIGHT = 48;
	const SHEET_EXPANDED_HEIGHT = 88;

	// Live drag height (null = not dragging, use CSS snap height)
	let dragHeight = $state(/** @type {number|null} */ (null));

	let sheetEl = $state(/** @type {HTMLElement|null} */ (null));
	let handleEl = $state(/** @type {HTMLElement|null} */ (null));

	// Pointer drag state (not reactive, mutation-only)
	let dragStartY = 0;
	let dragStartHeight = 0;
	let dragging = false;

	function snapHeightForState(state) {
		return state === 'expanded' ? SHEET_EXPANDED_HEIGHT : SHEET_PEEK_HEIGHT;
	}

	function currentSnapPx() {
		if (typeof window === 'undefined') return 0;
		return (snapHeightForState(sheetState) / 100) * window.innerHeight;
	}

	function onHandlePointerDown(e) {
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		e.currentTarget.setPointerCapture(e.pointerId);
		dragStartY = e.clientY;
		dragStartHeight = currentSnapPx();
		dragging = false;
	}

	function onHandlePointerMove(e) {
		if (!handleEl?.hasPointerCapture(e.pointerId)) return;
		const dy = dragStartY - e.clientY; // positive = dragging up
		const newHeightPx = dragStartHeight + dy;
		const vh = window.innerHeight;
		// Clamp: min 20% to allow dismiss gesture, max 95%
		const clamped = Math.max(vh * 0.2, Math.min(vh * 0.95, newHeightPx));
		dragHeight = (clamped / vh) * 100;
		dragging = true;
	}

	function onHandlePointerUp(e) {
		if (!dragging) {
			// Pure tap on handle — toggle state
			sheetState = sheetState === 'peek' ? 'expanded' : 'peek';
			dragHeight = null;
			return;
		}
		dragging = false;
		const vh = window.innerHeight;
		const currentDvh = dragHeight ?? snapHeightForState(sheetState);
		const midpoint = (SHEET_PEEK_HEIGHT + SHEET_EXPANDED_HEIGHT) / 2;

		if (currentDvh < SHEET_PEEK_HEIGHT * 0.6) {
			// Dragged far enough down — dismiss
			dragHeight = null;
			selectProperty(null);
		} else if (currentDvh < midpoint) {
			sheetState = 'peek';
			dragHeight = null;
		} else {
			sheetState = 'expanded';
			dragHeight = null;
		}
	}

	// Computed sheet height string for inline style
	const sheetHeight = $derived(
		dragHeight !== null
			? `${dragHeight}dvh`
			: `${snapHeightForState(sheetState)}dvh`
	);

	// Reset sheet to peek when a new property is selected
	$effect(() => {
		if (selectedProperty) sheetState = 'peek';
	});

	// --------- Filters ----------
	let saleFilter = $state(true);
	let rentFilter = $state(true);

	const saleCount = $derived.by(() => {
		if (!data?.properties || !Array.isArray(data.properties)) return 0;
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());
			return propertyFor.includes('Sale');
		}).length;
	});

	const rentCount = $derived.by(() => {
		if (!data?.properties || !Array.isArray(data.properties)) return 0;
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());
			return propertyFor.includes('Rent');
		}).length;
	});

	const filteredProperties = $derived.by(() => {
		if (!data || !Array.isArray(data.properties)) {
			return [];
		}
		return data.properties.filter((property) => {
			const propertyFor = Array.isArray(property.property_for)
				? property.property_for
				: (property.property_for || '').split(',').map((s) => s.trim());

			if (saleFilter && propertyFor.includes('Sale')) return true;
			if (rentFilter && propertyFor.includes('Rent')) return true;
			return false;
		});
	});

	function selectProperty(id) {
		if (selectedProperty === id) {
			selectedProperty = null;
			if (browser) {
				const url = new URL(window.location.href);
				url.searchParams.delete('property');
				replaceState(url.toString(), page.state);
			}
			return;
		}

		selectedProperty = id;
		if (browser) {
			const url = new URL(window.location.href);
			if (id) {
				const match = data?.properties?.find((p) => p.id === id);
				url.searchParams.set('property', match?.msl || id);
			} else {
				url.searchParams.delete('property');
			}
			replaceState(url.toString(), page.state);
		}
	}

	onMount(() => {
		loading = false;
		const syncFromUrl = () => {
			if (!browser) return;
			const propParam = new URL(window.location.href).searchParams.get('property');
			if (propParam && data?.properties) {
				const match = data.properties.find(
					(p) => p.id === propParam || (p.msl && p.msl.toLowerCase() === propParam.toLowerCase())
				);
				selectedProperty = match ? match.id : null;
			} else {
				selectedProperty = null;
			}
		};

		syncFromUrl();
		window.addEventListener('popstate', syncFromUrl);
		return () => {
			window.removeEventListener('popstate', syncFromUrl);
		};
	});
</script>

<svelte:window bind:innerWidth />

<svelte:head>
	<title>Cariari Agency - Costa Rica Real Estate</title>
</svelte:head>

{#if !navigating.complete && !loading}
	<LogoSvg animate={true} kind="gold" fixed invert />
{/if}

<main>
	<section class="map-wrapper">
		<Nav />
		<FilterChips>
			<FilterChip
				bind:active={saleFilter}
				label="Sale"
				color="var(--sale)"
				count={saleCount} />
			<FilterChip
				bind:active={rentFilter}
				label="Rent"
				color="var(--rent)"
				count={rentCount} />
		</FilterChips>
		<Map
			markers={filteredProperties}
			selectedId={selectedProperty}
			onSelected={(id) => {
				selectProperty(id);
			}}
			onDeselect={() => {
				selectProperty(null);
			}} />
	</section>

	{#if selectedProperty}
		{#if isMobile}
			<!-- Mobile: Interactive Bottom Sheet with drag handle -->
			<aside
				class="preview-wrapper mobile-sheet"
				style:height={sheetHeight}
				style:transition={dragHeight !== null ? 'none' : 'height 0.3s cubic-bezier(0.2, 0, 0, 1)'}>

				<!-- Drag handle -->
				<div
					class="sheet-handle"
					role="button"
					tabindex="0"
					aria-label="Drag to resize or tap to toggle preview"
					bind:this={handleEl}
					onpointerdown={onHandlePointerDown}
					onpointermove={onHandlePointerMove}
					onpointerup={onHandlePointerUp}
					onlostpointercapture={onHandlePointerUp}
					onkeydown={(e) => {
						if (e.key === 'ArrowUp') sheetState = 'expanded';
						if (e.key === 'ArrowDown') sheetState === 'expanded' ? (sheetState = 'peek') : selectProperty(null);
						if (e.key === 'Escape') selectProperty(null);
					}}>
					<div class="sheet-handle-pill"></div>
				</div>

				<Preview
					property_id={selectedProperty}
					supabase={data.supabase}
					is_admin={data.is_admin}
					onclose={() => selectProperty(null)} />
			</aside>
		{:else}
			<!-- Desktop: Floating side drawer -->
			<aside
				class="preview-wrapper desktop-drawer"
				transition:fly={{ x: 380, duration: 250, easing: cubicOut }}>
				<Preview
					property_id={selectedProperty}
					supabase={data.supabase}
					is_admin={data.is_admin}
					onclose={() => selectProperty(null)} />
			</aside>
		{/if}
	{/if}
</main>

<style>
	main {
		position: relative;
		height: 100dvh;
		width: 100%;
		overflow: hidden;
		overscroll-behavior: none;
	}

	.map-wrapper {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		touch-action: pan-x pan-y;
	}

	/* ---- Shared aside ---- */
	.preview-wrapper {
		position: absolute;
		z-index: 10;
		background: var(--surface-1);
		box-shadow: var(--shadow-4, 0 -4px 24px rgba(0, 0, 0, 0.3));
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* ---- Mobile bottom sheet ---- */
	.mobile-sheet {
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		/* height is set inline via sheetHeight */
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
		border-top: 1px solid var(--surface-3, rgba(255, 255, 255, 0.12));
		/* no overflow on the outer shell — let Preview's content scroll */
		overflow: visible;
	}

	/* ---- Desktop drawer ---- */
	.desktop-drawer {
		top: 0;
		right: 0;
		bottom: 0;
		width: 380px;
		height: 100dvh;
		border-left: 1px solid var(--surface-3, rgba(255, 255, 255, 0.12));
		box-shadow: var(--shadow-4, -4px 0 24px rgba(0, 0, 0, 0.3));
	}

	/* ---- Drag handle ---- */
	.sheet-handle {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 28px;
		width: 100%;
		cursor: grab;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
		/* sits on top of the inner scroll */
		position: relative;
		z-index: 2;
		background: var(--surface-1);
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
	}

	.sheet-handle:active {
		cursor: grabbing;
	}

	.sheet-handle:focus-visible {
		outline: 2px solid var(--accent, #3b82f6);
		outline-offset: -2px;
	}

	.sheet-handle-pill {
		width: 36px;
		height: 4px;
		border-radius: 2px;
		background: var(--surface-4, rgba(128, 128, 128, 0.5));
	}
</style>
