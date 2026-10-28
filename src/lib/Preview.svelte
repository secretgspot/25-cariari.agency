<script>
	import { goto } from '$app/navigation';
	import Badge from '#lib/Badge.svelte';
	import { Button } from '#lib/buttons/index.js';
	import Ad from '#lib/Ad.svelte';
	import { formatter } from '#lib/utils/formatters.js';
	import { ago } from '#lib/utils/time.js';
	import { Spinner } from '#lib/loaders/index.js';
	import Icon from '#lib/Icon.svelte';
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';

	/** @type {{property_id: any, supabase: any, is_admin: boolean, onclose?: () => void}} */
	let { property_id, supabase, is_admin, onclose } = $props();

	// console.log('Preview.svelte property_id:', property_id);
	// console.log('Preview.svelte supabase:', supabase);

	let loading = $state(false),
		error = '',
		message = '',
		property = $state({});

	const loadDetails = async (e) => {
		loading = true;
		message = '';
		error = '';

		const { data: propertyData, error: propertyErr } = await supabase
			.from('properties_preview')
			.select('*')
			.eq('id', property_id)
			.single();
		if (propertyErr) error = propertyErr.message;
		property = propertyData;
		loading = false;
	};

	$effect(() => {
		if (supabase) loadDetails();
	});

	function handleClose() {
		playButtonSound('click');
		vibrateButton('click');
		if (onclose) onclose();
	}
</script>

{#if loading}
	<div class="loader"><Spinner /></div>
{/if}

<section class="preview-content" class:loading>
	{#if onclose}
		<!-- Close button: visible on desktop drawer only; hidden on mobile (drag handle serves this purpose) -->
		<button
			type="button"
			class="preview-close"
			onclick={handleClose}
			aria-label="Close preview"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="18" y1="6" x2="6" y2="18"></line>
				<line x1="6" y1="6" x2="18" y2="18"></line>
			</svg>
		</button>
	{/if}

	{#if is_admin}
		<Button
			class="admin-edit"
			size="icon"
			{loading}
			disabled={loading}
			onclick={() => goto(`/${property.id}/edit`)}
		>
			{#snippet icon()}
				<Icon kind="modify" size="27" />
			{/snippet}
			Show Details
		</Button>
	{/if}
	<figure>
		<!-- {JSON.stringify(property.photos, null, 2)} -->
		{#if property?.photo?.length > 0}
			<img
				class="image"
				src={property.photo}
				alt="{property.msl} - {property.land_use}"
				loading="eager"
				intrinsicsize="450x360"
			/>
		{:else}
			<img
				class="image"
				src="/placeholder/450x360.png"
				alt="Property placeholder"
				loading="eager"
			/>
		{/if}
	</figure>

	<div class="content scroller">
		<!-- {JSON.stringify(data, null, 2)} -->
		<div class="preview-group">
			<!--
			<div class="land_use">
				 {#each property.property_for as p_for}
					<span>{p_for}</span>
				{/each}
			</div>
			-->

			<div class="price_rent">
				{#if property.rent}<span>{formatter.format(property.rent)}/m</span>{/if}
				{#if property.price}<span>{formatter.format(property.price)}</span>{/if}
			</div>

			<div class="type_age">
				{#if property.land_use}<span>{property.land_use}</span>{/if}
				{#if property.building_style}<span>&bull; {property.building_style}</span>{/if}
				{#if property.year_built}<span>&bull; {ago(property.year_built)} old</span>{/if}
			</div>

			<!--
			<div class="loc_address">
				{#if property.location}<span>{property.location.lat} / {property.location.lng}</span
					>{/if}
			</div>
			-->
		</div>

		<div class="badge-group">
			{#if property.rooms > 0}
				<Badge type="icon" label="rooms" value={property.rooms} />
			{/if}
			{#if property.beds > 0}
				<Badge type="icon" label="beds" value={property.beds} />
			{/if}
			{#if property.baths > 0}
				<Badge type="icon" label="baths" value={property.baths} />
			{/if}
			{#if property.half_baths > 0}
				<Badge type="icon" label="half baths" value={property.half_baths} />
			{/if}
			{#if property.parking_spaces > 0}
				<Badge type="icon" label="parkings" value={property.parking_spaces} />
			{/if}
		</div>

		{#if property.description}
			<p class="description">
				{@html property.description}
			</p>
		{/if}
	</div>

	<div class="commercial-wrapper">
		<Ad />
	</div>

	<footer>
		<Button
			right
			shadow
			outline
			sound_pattern="swipe"
			{loading}
			disabled={loading}
			onclick={() => goto(`/${property.msl}`)}
		>
			{#snippet icon()}
				<Icon kind="view" size="27" />
			{/snippet}
			View Property
		</Button>
	</footer>
</section>

<style>
	/* Close button — only visible on desktop (≥768px) */
	.preview-close {
		position: absolute;
		top: var(--size-2, 8px);
		left: var(--size-2, 8px);
		z-index: 5;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-round, 999px);
		background: rgba(0, 0, 0, 0.55);
		color: #ffffff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		backdrop-filter: blur(8px);
		transition:
			transform 0.15s ease,
			background 0.15s ease;
	}
	.preview-close:hover {
		transform: scale(1.08);
		background: rgba(0, 0, 0, 0.75);
	}
	.preview-close:active {
		transform: scale(0.95);
	}

	.preview-content {
		position: relative;
		z-index: 3;
		background: var(--surface-1);
		color: var(--text-1);
		/* Mobile preview participates in document scrolling below the sticky map. */
		display: flex;
		flex-direction: column;
		height: auto;
		min-height: 60dvh;
		overflow-y: visible;
		overflow-x: clip;
		overscroll-behavior-y: auto;

		@media (min-width: 768px) {
			/* Desktop: fixed grid rows, no scroll on section itself */
			display: grid;
			grid-template-rows: minmax(min-content, 30vh) 1fr minmax(min-content, 111px) minmax(
					min-content,
					90px
				);
			height: 100dvh;
			overflow-y: hidden;
		}

		:global(.admin-edit) {
			position: absolute;
			top: 0;
			right: 0;
			height: min-content;
			width: min-content;
			z-index: 2;
			aspect-ratio: 1;
			background: var(--surface-1);
			border-top-right-radius: 0;
			border-top-left-radius: 0;
			border-bottom-right-radius: 0;
		}
	}

	figure {
		margin: 0;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-shrink: 0;
	}

	.image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 5 / 4;
		/* Cap image height on mobile so price/details are always visible at peek */
		max-height: 180px;

		@media (min-width: 768px) {
			max-height: unset;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 0 0 auto;
		/* Mobile: don't set overflow here — parent .preview-content scrolls */
		overflow-y: visible;

		@media (min-width: 768px) {
			overflow-y: auto;
		}

		.badge-group {
			padding: 2rem 0;
			display: flex;
			justify-content: space-evenly;
			width: 100%;
		}

		.preview-group {
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
			width: 100%;
			padding: 1.2rem 2rem 0;

			@media (min-width: 768px) {
				padding: 2rem 3rem 0;
			}

			.type_age {
				text-transform: uppercase;
				color: var(--text-2);
			}
			.price_rent {
				font-size: 1.8em;
				display: flex;
				justify-content: space-between;
				margin: 0.3rem 0;
			}
		}

		.description {
			padding: 3rem;
			text-align: justify;
		}
	}

	.commercial-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		flex: 0 0 auto;
	}

	footer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-block: var(--size-8);

		@media (min-width: 481px) and (max-width: 991px) and (orientation: landscape) {
			padding-block-end: var(--size-8);
		}

		:global(button) {
			min-width: 220px;
			max-width: 260px;
		}
	}

	.loader {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 4;
		display: grid;
		justify-items: center;
		align-items: center;
	}
	.loading {
		filter: grayscale(1) blur(3px);
	}
	@media (prefers-color-scheme: dark) {
		.image {
			filter: brightness(var(--brightness));
		}
	}
</style>
