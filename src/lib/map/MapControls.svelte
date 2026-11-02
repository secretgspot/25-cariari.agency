<script>
	import { onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import maplibregl from 'maplibre-gl';
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';
	import { enableWakeLock, disableWakeLock } from '#lib/utils/helpers.js';

	let { map, layer = 'default', onLayerChange } = $props();

	let isLocating = $state(false);
	let gpsWatchId = null;
	let gpsMarker = null;

	function switchLayer() {
		playButtonSound('click');
		vibrateButton('click');
		onLayerChange?.(layer === 'satellite' ? 'default' : 'satellite');
	}

	function handleGpsPosition(position) {
		if (!map) return;
		const coordinates = [position.coords.longitude, position.coords.latitude];

		if (gpsMarker) {
			gpsMarker.setLngLat(coordinates);
		} else {
			const element = document.createElement('span');
			element.setAttribute('aria-hidden', 'true');
			Object.assign(element.style, {
				display: 'block',
				width: '21px',
				height: '21px',
				background: "url('/map/default.svg') center / contain no-repeat",
			});
			gpsMarker = new maplibregl.Marker({ element, anchor: 'center' })
				.setLngLat(coordinates)
				.addTo(map);
		}

		map.jumpTo({ center: coordinates, zoom: 18 });
	}

	function handleGpsError(error) {
		if (error.code === 2) return;
		console.error('GPS error:', error);
		if (error.code === 1) stopGpsTracking();
	}

	async function stopGpsTracking() {
		if (gpsWatchId !== null) navigator.geolocation.clearWatch(gpsWatchId);
		gpsWatchId = null;
		isLocating = false;
		gpsMarker?.remove();
		gpsMarker = null;
		await disableWakeLock();
	}

	async function toggleGpsTracking() {
		if (gpsWatchId !== null) {
			await stopGpsTracking();
			return;
		}
		if (!navigator.geolocation) return;

		isLocating = true;
		await enableWakeLock();
		gpsWatchId = navigator.geolocation.watchPosition(
			handleGpsPosition,
			handleGpsError,
			{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
		);
	}

	onDestroy(() => {
		if (gpsWatchId !== null) navigator.geolocation.clearWatch(gpsWatchId);
		gpsMarker?.remove();
		disableWakeLock();
	});
</script>

<div class="map-controls">
	<div class="control-group location-controls">
		<button
			type="button"
			class="map-action-button gps-toggle-btn"
			disabled={!browser || !navigator.geolocation}
			aria-pressed={isLocating}
			aria-label={isLocating ? 'Stop GPS tracking' : 'Start GPS tracking'}
			title={isLocating ? 'Stop GPS tracking' : 'Start GPS tracking'}
			onclick={toggleGpsTracking}
		>
			<span class="icon" aria-hidden="true">
				{#if isLocating}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 512 512"
						width="21"
						height="21"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="30"
							d="M256 490c129.234 0 234-104.766 234-234 0-129.235-104.766-234-234-234C126.765 22 22 126.765 22 256c0 129.234 104.765 234 234 234Z"
						/>
						<path
							stroke="var(--accent)"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="180"
							d="M256 346c49.707 0 90-40.293 90-90 0-49.706-40.293-90-90-90-49.706 0-90 40.294-90 90 0 49.707 40.294 90 90 90Z"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 512 512"
						width="21"
						height="21"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="50"
							d="M256 484c125.92 0 228-102.08 228-228 0-125.921-102.08-228-228-228C130.079 28 28 130.079 28 256c0 125.92 102.079 228 228 228Z"
						/>
						<path
							stroke="var(--accent)"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="30"
							d="M256.001 302.546c25.707 0 46.545-20.839 46.545-46.546 0-25.706-20.838-46.545-46.545-46.545S209.455 230.294 209.455 256c0 25.707 20.839 46.546 46.546 46.546Z"
						/>
					</svg>
				{/if}
			</span>
		</button>
	</div>

	<div class="control-group layer-controls">
		<button
			type="button"
			class="map-action-button layer-toggle-btn"
			aria-label="Switch to {layer === 'default' ? 'Satellite' : 'Default'} view"
			title="Switch to {layer === 'default' ? 'Satellite' : 'Default'} view"
			onclick={switchLayer}
		>
			<span class="icon" aria-hidden="true">
				{#if layer === 'default'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 512 512"
						width="18"
						height="18"
					>
						<circle cx="256" cy="256" r="180" stroke="currentColor" stroke-width="36" />
						<ellipse
							cx="256"
							cy="256"
							rx="90"
							ry="180"
							stroke="currentColor"
							stroke-width="30"
						/>
						<path
							stroke="currentColor"
							stroke-width="30"
							d="M80 256h352M108 160h296M108 352h296"
						/>
						<path
							stroke="var(--accent)"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="36"
							d="M420 110 A 240 100 45 0 1 92 402"
						/>
						<circle cx="420" cy="110" r="22" fill="var(--accent)" />
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 512 512"
						width="18"
						height="18"
					>
						<path
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="36"
							d="m180 440-148-80V72l148 80 152-80 148 80v288l-148-80-152 80Z"
						/>
						<path
							stroke="var(--accent)"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="36"
							d="M180 152v288M332 72v288"
						/>
					</svg>
				{/if}
			</span>
			<span class="layer-label">{layer === 'default' ? 'Satellite' : 'Default'}</span>
		</button>
	</div>
</div>

<style>
	.map-controls {
		position: absolute;
		z-index: 10;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		padding: 12px;
		pointer-events: none;
	}

	.control-group {
		display: flex;
		pointer-events: auto;
	}

	.map-action-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 38px;
		box-sizing: border-box;
		background: var(--surface-1, #1e1e1e);
		color: var(--text-1, #f0f0f0);
		border: 1px solid var(--surface-4, rgba(255, 255, 255, 0.2));
		border-radius: var(--radius-2, 6px);
		padding: 6px 12px;
		font-family: inherit;
		font-size: var(--font-size-0, 0.85rem);
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		box-shadow: var(--shadow-2, 0 3px 6px rgba(0, 0, 0, 0.2));
		backdrop-filter: blur(8px);
		transition:
			background 150ms ease,
			border-color 150ms ease,
			transform 150ms ease;
	}

	.map-action-button:hover:not(:disabled) {
		background: var(--surface-2, #2a2a2a);
		border-color: var(--accent, #d4af37);
		transform: translateY(-1px);
	}

	.map-action-button:active:not(:disabled) {
		transform: scale(0.96);
	}

	.map-action-button:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.layer-label {
		letter-spacing: 0.02em;
	}

	.gps-toggle-btn {
		width: 38px;
		height: 38px;
		padding: 6px;
	}
</style>
