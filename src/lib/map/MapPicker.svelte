<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { isValidPosition, normalizePosition } from '#lib/utils/mapUtils.js';

	let { position = $bindable({}) } = $props();

	let mapElement;
	let mapInstance = $state.raw(null);
	let markerInstance = $state.raw(null);
	let isMapReady = $state(false);
	let resizeObserver;
	let lastPositionKey = null;

	const DEFAULT_POSITION = { lat: 9.97088, lng: -84.16046 };
	const PICKER_MAX_BOUNDS = [
		[-84.1789, 9.962],
		[-84.1423, 9.9802],
	];
	const SATELLITE_STYLE = {
		version: 8,
		sources: {
			'esri-satellite': {
				type: 'raster',
				tiles: [
					'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				],
				tileSize: 256,
				attribution:
					'© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
			},
		},
		layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite' }],
	};

	// --- Event Handlers (Update State Only) ---

	const handleMarkerDragEnd = () => {
		const newLatLng = markerInstance?.getLngLat();
		if (newLatLng) {
			position = { lat: newLatLng.lat, lng: newLatLng.lng };
		}
	};

	const handleMapClick = (event) => {
		if (event.lngLat) {
			position = { lat: event.lngLat.lat, lng: event.lngLat.lng };
		}
	};

	export function updategps(coords) {
		if (!coords) return;
		const newPosition = {
			lat: coords.latitude ?? coords.lat,
			lng: coords.longitude ?? coords.lng,
		};
		if (isValidPosition(newPosition)) {
			position = newPosition;
		} else {
			console.warn('Invalid GPS coordinates provided:', coords);
		}
	}

	function initializeMap() {
		const normalizedPosition = normalizePosition(position);
		const initialPosition = isValidPosition(normalizedPosition)
			? normalizedPosition
			: DEFAULT_POSITION;

		mapInstance = new maplibregl.Map({
			container: mapElement,
			style: SATELLITE_STYLE,
			center: [initialPosition.lng, initialPosition.lat],
			zoom: 15,
			minZoom: 15,
			maxZoom: 18,
			maxBounds: PICKER_MAX_BOUNDS,
			attributionControl: false,
			scrollZoom: true,
			dragRotate: false,
			touchPitch: false,
			renderWorldCopies: false,
		});

		mapInstance.on('click', handleMapClick);
		mapInstance.on('load', () => {
			isMapReady = true;
			mapInstance.resize();
		});
	}

	onMount(() => {
		if (!browser || !mapElement) return;

		try {
			initializeMap();
			if (window.ResizeObserver) {
				resizeObserver = new ResizeObserver(() => mapInstance?.resize());
				resizeObserver.observe(mapElement);
			}
		} catch (error) {
			console.error('Error initializing MapLibre position picker:', error);
		}
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (markerInstance) {
			markerInstance.off('dragend', handleMarkerDragEnd);
			markerInstance.remove();
			markerInstance = null;
		}
		if (mapInstance) {
			mapInstance.off('click', handleMapClick);
			mapInstance.remove();
			mapInstance = null;
		}
	});

	// --- Reactive Effect (Single Source of Truth for UI Updates) ---

	$effect(() => {
		if (!isMapReady || !mapInstance) return;

		const validPosition = normalizePosition(position);

		if (!isValidPosition(validPosition)) {
			if (markerInstance) {
				markerInstance.off('dragend', handleMarkerDragEnd);
				markerInstance.remove();
				markerInstance = null;
			}
			lastPositionKey = null;
			return;
		}

		const lngLat = [validPosition.lng, validPosition.lat];
		const positionKey = `${validPosition.lat},${validPosition.lng}`;

		if (!markerInstance) {
			const element = document.createElement('div');
			element.className = 'map-picker-marker';
			markerInstance = new maplibregl.Marker({
				element,
				anchor: 'bottom',
				offset: [-0.5, 0],
				draggable: true,
			})
				.setLngLat(lngLat)
				.addTo(mapInstance);
			markerInstance.on('dragend', handleMarkerDragEnd);
		} else {
			const currentLngLat = markerInstance.getLngLat();
			if (currentLngLat.lng !== lngLat[0] || currentLngLat.lat !== lngLat[1]) {
				markerInstance.setLngLat(lngLat);
			}
		}

		if (positionKey !== lastPositionKey) {
			lastPositionKey = positionKey;
			mapInstance.easeTo({
				center: lngLat,
				zoom: mapInstance.getZoom() || 16,
				duration: 300,
				essential: true,
			});
		}
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}></div>

<style>
	@import './maplibre-gl.css';

	.map {
		height: 222px;
		width: 100%;
		z-index: 1;
		min-height: 200px;
		min-width: 200px;
		border-radius: var(--radius-2);
		overflow: hidden;
	}

		:global(.map-picker-marker) {
			width: 25px;
			height: 41px;
			background: url('/map/marker-icon.svg') center / contain no-repeat;
			cursor: grab;
		}

		:global(.map-picker-marker:active) {
			cursor: grabbing;
		}
</style>
