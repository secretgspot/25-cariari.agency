<script>
	import { onMount, onDestroy } from 'svelte';
	import { isEmpty } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';

	let { position = $bindable({}) } = $props();

	let mapElement;
	let mapInstance = $state(null);
	let leafletInstance = $state(null);
	let marker = $state(null);
	let pickerIcon = $state(null);
	let isMapReady = $state(false);
	let resizeObserver;

	const DEFAULT_POSITION = { lat: 9.97088, lng: -84.16046 };

	// --- Helper Functions ---

	const isValidPosition = (pos) =>
		pos &&
		typeof pos === 'object' &&
		!isEmpty(pos.lat) &&
		!isEmpty(pos.lng) &&
		!isNaN(Number(pos.lat)) &&
		!isNaN(Number(pos.lng)) &&
		Math.abs(Number(pos.lat)) <= 90 &&
		Math.abs(Number(pos.lng)) <= 180;

	const normalizePosition = (pos) => {
		if (!pos) return null;
		try {
			if (Array.isArray(pos) && pos.length >= 2) {
				return { lat: Number(pos[0]), lng: Number(pos[1]) };
			}
			if (typeof pos === 'object' && pos.lat !== undefined && pos.lng !== undefined) {
				return { lat: Number(pos.lat), lng: Number(pos.lng) };
			}
			return null;
		} catch (error) {
			console.error('Error normalizing position:', error);
			return null;
		}
	};

	// --- Event Handlers (Update State Only) ---

	const handleMarkerDrag = (e) => {
		const newLatLng = e.target.getLatLng();
		if (newLatLng) {
			position = { lat: newLatLng.lat, lng: newLatLng.lng };
		}
	};

	const handleMapClick = (e) => {
		if (e.latlng) {
			position = { lat: e.latlng.lat, lng: e.latlng.lng };
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

	onMount(() => {
		if (!browser) return;

		const init = async () => {
			if (!mapElement) {
				console.error('Map element not found');
				return;
			}

			leafletInstance = await import('leaflet');

			pickerIcon = leafletInstance.icon({
				iconUrl: '/map/marker-icon.svg',
				iconSize: [25, 41],
				iconAnchor: [13, 41],
			});

			/*
			 * https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}
			 * stadiamaps styles https://docs.stadiamaps.com/themes/
			 * https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png
			 * https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}@2x.png
			 * https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png
			 * https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}@2x.png
			 * https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png
			 * https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}@2x.png
			 * https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png
			 * https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png
			 * https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg
			 * https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}@2x.jpg
			 * https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
			 */

			const baseLayer = leafletInstance.tileLayer(
				'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
				{
					subdomains: 'abcd',
					minZoom: 15,
					maxZoom: 18,
					ext: 'jpg',
					errorTileUrl:
						'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
				},
			);

			const initialPos = isValidPosition(position) ? position : DEFAULT_POSITION;
			const maxBounds = leafletInstance.latLngBounds([
				[9.9802, -84.1789],
				[9.962, -84.1423],
			]);

			mapInstance = leafletInstance.map(mapElement, {
				zoomControl: false,
				center: [initialPos.lat, initialPos.lng],
				maxBounds: maxBounds,
				maxBoundsViscosity: 0.8,
				zoom: 15,
				attributionControl: false,
				scrollWheelZoom: true,
				layers: [baseLayer],
				preferCanvas: true,
			});

			mapInstance.on('click', handleMapClick);

			if (window.ResizeObserver) {
				resizeObserver = new ResizeObserver(() => mapInstance.invalidateSize());
				resizeObserver.observe(mapElement);
			}

			mapInstance.whenReady(() => {
				isMapReady = true;
				mapInstance.invalidateSize();
				console.log('🗺 Position picker map ready');
			});
		};

		init().catch((error) => console.error('Error initializing map:', error));
	});

	onDestroy(() => {
		if (resizeObserver) resizeObserver.disconnect();
		if (marker) marker.off('dragend', handleMarkerDrag);
		if (mapInstance) {
			mapInstance.off('click', handleMapClick);
			mapInstance.remove();
		}
	});

	// --- Reactive Effect (Single Source of Truth for UI Updates) ---

	$effect(() => {
		if (!isMapReady || !leafletInstance) return;

		const validPosition = normalizePosition(position);

		if (!isValidPosition(validPosition)) {
			if (marker) {
				marker.remove();
				marker = null;
			}
			return;
		}

		const latLng = leafletInstance.latLng(validPosition.lat, validPosition.lng);

		if (!marker) {
			marker = leafletInstance
				.marker(latLng, { icon: pickerIcon, draggable: true })
				.on('dragend', handleMarkerDrag)
				.addTo(mapInstance);
		} else {
			const currentLatLng = marker.getLatLng();
			if (!currentLatLng.equals(latLng)) {
				marker.setLatLng(latLng);
			}
		}

		// Center the view on the marker
		mapInstance.setView(latLng, mapInstance.getZoom() || 16, {
			animate: true,
			pan: { duration: 0.3 },
		});
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}></div>

<style>
	.map {
		--brightness-map: 1;
		height: 222px;
		width: 100%;
		z-index: 1;
		/* Ensure minimum dimensions */
		min-height: 200px;
		min-width: 200px;
		border-radius: 8px;
		overflow: hidden;
	}

	/* @media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness-map)) hue-rotate(180deg);
		}
	} */
</style>
