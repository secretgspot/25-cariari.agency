<!-- Ads.svelte (Merged and Refactored) -->
<script>
	import { onMount } from 'svelte';

	/**
	 * @typedef {Object} AdConfig
	 * @property {string} file - Image filename
	 * @property {string} title - Ad title/alt text
	 * @property {string} href - Click destination URL
	 * @property {number} width - Ad width in pixels
	 * @property {number} height - Ad height in pixels
	 * @property {number} [weight] - Weight for random selection (higher = more likely)
	 * @property {boolean} [active] - Whether the ad is currently active
	 */

	/** @type {AdConfig[]} */
	let ads = $state([]);
	/** @type {AdConfig | null} */
	let selectedAd = $state(null);
	let impressionLogged = $state(false);

	/**
	 * Filters ads based on current date and other criteria
	 * @param {AdConfig[]} adList
	 * @returns {AdConfig[]}
	 */
	function getActiveAds(adList) {
		return adList.filter((ad) => ad.active !== false);
	}

	/**
	 * Selects a random ad based on weights
	 * @param {AdConfig[]} adList
	 * @returns {AdConfig | null}
	 */
	function selectWeightedRandomAd(adList) {
		if (adList.length === 0) return null;

		const totalWeight = adList.reduce((sum, ad) => sum + (ad.weight || 1), 0);
		let random = Math.random() * totalWeight;

		for (const ad of adList) {
			random -= ad.weight || 1;
			if (random <= 0) return ad;
		}

		return adList[0]; // Fallback
	}

	/**
	 * Logs ad impression for analytics
	 * @param {AdConfig} ad
	 */
	async function logImpression(ad) {
		if (impressionLogged) return;
		impressionLogged = true;

		await fetch(`/api/ads/${ad.id}/impression`, {
			method: 'POST',
		});
	}

	/**
	 * Logs ad click for analytics
	 * @param {AdConfig} ad
	 * @param {MouseEvent} event
	 */
	async function logClick(ad, event) {
		await fetch(`/api/ads/${ad.id}/click`, {
			method: 'POST',
		});
	}

	onMount(async () => {
		const response = await fetch('/api/ads');
		if (response.ok) {
			const allAds = await response.json();
			const activeAds = getActiveAds(allAds);
			selectedAd = selectWeightedRandomAd(activeAds);

			if (selectedAd) {
				// Log impression after a short delay to ensure visibility
				setTimeout(() => logImpression(selectedAd), 1000);
			}
		}
	});

	// Use $effect instead of $: for reactive logging
	$effect(() => {
		if (selectedAd && !impressionLogged) {
			logImpression(selectedAd);
		}
	});
</script>

{#if selectedAd}
	<a
		class="advertising"
		style="width:{selectedAd.width}px; height:{selectedAd.height}px; aspect-ratio:{selectedAd.width}/{selectedAd.height};"
		href={selectedAd.href}
		target="_blank"
		rel="noopener noreferrer"
		title={selectedAd.title}
		aria-label={selectedAd.title}
		onclick={(event) => logClick(selectedAd, event)}>
		<img
			src={selectedAd.file}
			alt={selectedAd.title}
			width={selectedAd.width}
			height={selectedAd.height}
			loading="lazy"
			decoding="async" />
	</a>
{:else}
	<!-- Fallback placeholder -->
	<div class="advertising-placeholder" aria-label="Advertisement placeholder">
		<small class="placeholder-text">
			320×100<br />
			<span class="ad-text">AD</span>
		</small>
	</div>
{/if}

<style>
	.advertising {
		position: relative;
		display: block;
		line-height: 0;
		text-decoration: none;
		border-radius: var(--border-radius);
		background: var(--primary);
		color: var(--primary-content);

		&:hover {
			filter: brightness(1.05);
		}

		&::after {
			content: 'ad';
			position: absolute;
			top: var(--padding-extra-small);
			right: var(--padding-extra-small);
			color: var(--primary-content);
			line-height: 1;
			text-transform: uppercase;
			background: var(--primary);
			padding: calc(var(--padding-extra-small) / 2) calc(var(--padding-extra-small) / 2);
			border-radius: calc(var(--border-radius) / 2);
			pointer-events: none;
			font-size: xx-small;
		}

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			border-radius: inherit;
		}
	}

	.advertising-placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		background: var(--primary);
		color: var(--primary-content);
		border-radius: var(--border-radius);
		place-self: center;
		width: 320px;
		height: 100px;
		aspect-ratio: 320/100;

		.placeholder-text {
			font-size: 12px;
			font-weight: 500;
			user-select: none;

			.ad-text {
				font-weight: 700;
				opacity: 0.7;
			}
		}
	}
</style>
