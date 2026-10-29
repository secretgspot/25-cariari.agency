<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { get } from 'svelte/store';
	import maplibregl from 'maplibre-gl';
	import { effectiveTheme, settings } from '#lib/settings/settings.js';
	import { normalizePosition, isValidPosition } from '#lib/utils/mapUtils.js';

	/** @type {{ position: { lat: number|string, lng: number|string }, zoom?: number }} */
	let { position, zoom = 17 } = $props();

	let mapElement;
	let mapInstance = null;
	let markerInstance = null;
	let resizeObserver = null;
	let unsubscribeTheme = null;
	let currentTheme = 'light';
	let isSnapping = false;

	const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';
	const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

	// Bounds matching the main map route on Cariari
	const MAIN_MAX_BOUNDS = [
		[-84.1789, 9.962],
		[-84.1423, 9.9802],
	];

	function resolveThemeMode() {
		if (typeof window === 'undefined') return 'light';
		const theme = get(settings)?.theme ?? 'System';
		if (theme === 'Dark') return 'dark';
		if (theme === 'Light') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function resolveStyle() {
		return resolveThemeMode() === 'dark' ? DARK_STYLE : LIGHT_STYLE;
	}

	function handleStyleImageMissing({ id }) {
		if (id !== 'wood-pattern' || mapInstance.hasImage(id)) return;

		const size = 8;
		const data = new Uint8Array(size * size * 4);
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const index = (y * size + x) * 4;
				const grain = (x + y) % 4 === 0;
				const shade = grain ? 58 : 38;
				data[index] = shade;
				data[index + 1] = shade;
				data[index + 2] = shade;
				data[index + 3] = 160;
			}
		}
		mapInstance.addImage(id, { width: size, height: size, data });
	}

	function getCoordinates() {
		const norm = normalizePosition(position);
		if (norm && isValidPosition(norm)) {
			return [norm.lng, norm.lat];
		}
		return null;
	}

	function resolveMaxBounds(coords) {
		if (!coords) return MAIN_MAX_BOUNDS;
		const [lng, lat] = coords;
		return [
			[Math.min(MAIN_MAX_BOUNDS[0][0], lng - 0.005), Math.min(MAIN_MAX_BOUNDS[0][1], lat - 0.005)],
			[Math.max(MAIN_MAX_BOUNDS[1][0], lng + 0.005), Math.max(MAIN_MAX_BOUNDS[1][1], lat + 0.005)],
		];
	}

	function snapBackToCenter() {
		if (!mapInstance || isSnapping) return;
		const targetCoords = getCoordinates();
		if (!targetCoords) return;

		const currentCenter = mapInstance.getCenter();
		const dist = Math.hypot(
			currentCenter.lng - targetCoords[0],
			currentCenter.lat - targetCoords[1],
		);

		// If dragged away from center, smoothly snap back
		if (dist > 0.00001) {
			isSnapping = true;
			mapInstance.easeTo({
				center: targetCoords,
				duration: 380,
				essential: true,
			});
			mapInstance.once('moveend', () => {
				isSnapping = false;
			});
		}
	}

	onMount(() => {
		if (!browser || !mapElement) return;

		const coords = getCoordinates();
		if (!coords) return;

		currentTheme = resolveThemeMode();
		const bounds = resolveMaxBounds(coords);

		mapInstance = new maplibregl.Map({
			container: mapElement,
			style: resolveStyle(),
			center: coords,
			zoom,
			minZoom: 13,
			maxZoom: 19,
			maxBounds: bounds,
			attributionControl: false,
			dragRotate: false,
			touchPitch: false,
			renderWorldCopies: false,
		});
		mapInstance.on('styleimagemissing', handleStyleImageMissing);

		// Create lightweight custom marker element
		const markerEl = document.createElement('div');
		markerEl.className = 'map-static-marker';
		markerEl.setAttribute('aria-hidden', 'true');

		markerInstance = new maplibregl.Marker({
			element: markerEl,
			anchor: 'bottom',
		})
			.setLngLat(coords)
			.addTo(mapInstance);

		// When user drags and releases, snap the marker back into the center
		mapInstance.on('dragend', snapBackToCenter);

		// When user zooms in/out, keep marker in the center
		mapInstance.on('zoomend', () => {
			requestAnimationFrame(snapBackToCenter);
		});

		// Handle live theme switching
		unsubscribeTheme = effectiveTheme.subscribe((theme) => {
			if (!mapInstance || theme === currentTheme) return;
			currentTheme = theme;
			mapInstance.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
		});

		// Ensure map resizes properly when container dimensions change
		if (typeof ResizeObserver !== 'undefined') {
			resizeObserver = new ResizeObserver(() => {
				mapInstance?.resize();
			});
			resizeObserver.observe(mapElement);
		}

		mapInstance.on('load', () => {
			mapInstance?.resize();
		});
	});

	// Reactively update marker position and bounds if position prop changes
	$effect(() => {
		if (!mapInstance || !markerInstance || !position) return;
		const coords = getCoordinates();
		if (coords) {
			const bounds = resolveMaxBounds(coords);
			mapInstance.setMaxBounds(bounds);
			markerInstance.setLngLat(coords);
			mapInstance.jumpTo({ center: coords });
		}
	});

	onDestroy(() => {
		if (unsubscribeTheme) unsubscribeTheme();
		if (resizeObserver) resizeObserver.disconnect();
		if (markerInstance) {
			markerInstance.remove();
			markerInstance = null;
		}
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	});
</script>

<div
	id="maplibre-static-canvas"
	class="map-static-container"
	bind:this={mapElement}
></div>

<style>
	@import './maplibre-gl.css';

	.map-static-container {
		height: 400px;
		width: 100%;
		min-height: 250px;
		border-radius: var(--radius-2, 8px);
		overflow: hidden;
		position: relative;
		z-index: 1;
		box-shadow: var(--shadow-2, 0 3px 6px rgba(0, 0, 0, 0.16));
	}

	:global(.map-static-marker) {
		width: 28px;
		height: 46px;
		background: url('/map/marker-icon.svg') center / contain no-repeat;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
		pointer-events: none;
	}
</style>
