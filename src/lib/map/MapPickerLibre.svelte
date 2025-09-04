<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import pkg from 'maplibre-gl';
	const { Map, Marker } = pkg;
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { isValidPosition, normalizePosition } from '$lib/utils/mapUtils.js';

	let { position = $bindable({}) } = $props();

	let mapElement;
	let mapInstance = $state(null);
	let marker = $state(null);
	let isMapReady = $state(false);
	let resizeObserver;

	const DEFAULT_POSITION = { lat: 9.97088, lng: -84.16046 };

	// --- Event Handlers (Update State Only) ---

	const handleMarkerDragEnd = () => {
		if (marker) {
			const newLngLat = marker.getLngLat();
			position = { lat: newLngLat.lat, lng: newLngLat.lng };
		}
	};

	const handleMapClick = (e) => {
		if (e.lngLat) {
			position = { lat: e.lngLat.lat, lng: e.lngLat.lng };
		}
	};

	export function updategps(coords) {
		if (!coords) return;
		const newPosition = {
			lat: coords.latitude || coords.lat,
			lng: coords.longitude || coords.lng,
		};
		if (isValidPosition(newPosition)) {
			position = newPosition;
		} else {
			console.warn('Invalid GPS coordinates provided:', coords);
		}
	}

	// --- Lifecycle and Initialization ---

	function initializeMap() {
		const initialPos = isValidPosition(position) ? position : DEFAULT_POSITION;
		const maxBounds = [
			[-84.1789, 9.962], // Southwest coordinates [lng, lat]
			[-84.1423, 9.9802], // Northeast coordinates [lng, lat]
		];

		mapInstance = new Map({
			container: mapElement,
			style: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json', // Placeholder style
			center: [initialPos.lng, initialPos.lat],
			zoom: 15,
			maxBounds: maxBounds,
			attributionControl: false,
		});

		mapInstance.on('load', () => {
			isMapReady = true;
			console.log('🗺 MapLibre GL Position picker map ready');
			mapInstance.resize();
		});

		mapInstance.on('click', handleMapClick);

		mapInstance.on('error', (e) => {
			console.error('MapLibre GL Map error:', e.error);
		});
	}

	onMount(async () => {
		if (!browser) return;

		setTimeout(() => {
			try {
				if (
					!mapElement ||
					mapElement.clientWidth === 0 ||
					mapElement.clientHeight === 0
				) {
					console.error('Map element not found or has no dimensions.');
					return;
				}

				initializeMap();

				if (window.ResizeObserver) {
					resizeObserver = new ResizeObserver(() => mapInstance.resize());
					resizeObserver.observe(mapElement);
				}
			} catch (error) {
				console.error('Error initializing MapLibre GL map picker:', error);
			}
		}, 0);
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (marker) marker.remove();
		if (mapInstance) {
			mapInstance.off('click', handleMapClick);
			mapInstance.remove();
		}
	});

	// --- Reactive Effect (Single Source of Truth for UI Updates) ---

	$effect(() => {
		if (!isMapReady) return;

		const validPosition = normalizePosition(position);

		if (!isValidPosition(validPosition)) {
			if (marker) {
				marker.remove();
				marker = null;
			}
			return;
		}

		const lngLat = [validPosition.lng, validPosition.lat];

		if (!marker) {
			const el = document.createElement('div');
			el.className = 'map-picker-marker';
			el.style.backgroundImage = `url(/map/marker-icon.svg)`;
			el.style.width = '25px';
			el.style.height = '41px';
			el.style.backgroundSize = 'contain';
			el.style.backgroundRepeat = 'no-repeat';
			el.style.backgroundPosition = 'center';
			el.style.cursor = 'grab';

			marker = new Marker({ element: el, draggable: true })
				.setLngLat(lngLat)
				.addTo(mapInstance);

			marker.on('dragend', handleMarkerDragEnd);
		} else {
			const currentLngLat = marker.getLngLat();
			if (currentLngLat.lng !== lngLat[0] || currentLngLat.lat !== lngLat[1]) {
				marker.setLngLat(lngLat);
			}
		}

		// Center the view on the marker
		mapInstance.flyTo({
			center: lngLat,
			zoom: mapInstance.getZoom() || 16,
			animate: true,
			speed: 1.2,
			curve: 1,
			easing: (t) => t,
		});
	});
</script>

<div id="maplibre-picker-canvas" class="map" bind:this={mapElement}></div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		height: 222px;
		width: 100%;
		z-index: 1;
		min-height: 200px;
		min-width: 200px;
		border-radius: var(--radius-2);
		overflow: hidden;
	}

	/* Dark mode considerations */
	@media (prefers-color-scheme: dark) {
		/* MapLibre GL styles might need custom dark mode styles or a dark map style */
		/* For now, no filter applied as it can distort map tiles */
	}
</style>
