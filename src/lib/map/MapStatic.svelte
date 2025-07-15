<script>
	import { onMount, onDestroy } from 'svelte';

	let { position } = $props();

	let map;
	let mapContainer;

	// Define maxBounds as LatLngBounds (southWest, northEast)
	const maxBounds = [
		[9.962086432098069, -84.17891979217531], // Southwest corner
		[9.980261288306549, -84.14235591888429], // Northeast corner
	];

	onMount(async () => {
		if (!position) return;

		// Dynamically import Leaflet and CSS only on client
		const leafletModule = await import('leaflet');
		const L = leafletModule.default;
		// await import('leaflet/dist/leaflet.css');

		// Remove existing map if any (defensive)
		if (mapContainer._leaflet_id) {
			const existingMap = L.Map.get(mapContainer._leaflet_id);
			if (existingMap) existingMap.remove();
		}

		map = L.map(mapContainer, {
			zoomControl: false,
			maxBounds: maxBounds,
			maxBoundsViscosity: 0.8,
			attributionControl: false,
		}).setView([parseFloat(position.lat), parseFloat(position.lng)], 17);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}', {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
			ext: 'jpg',
			errorTileUrl:
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
		}).addTo(map);

		// Create a custom icon using your SVG file in the public directory
		const customIcon = L.icon({
			iconUrl: '/map/marker-icon.svg', // Path relative to the public folder
			iconSize: [32, 32], // Adjust size as needed
			iconAnchor: [16, 32], // Point of the icon which corresponds to marker's location (bottom center)
			popupAnchor: [0, -32], // Where popups open relative to iconAnchor
			// shadowUrl: '/map/marker-shadow.png', // Optional shadow image
			// shadowSize: [32, 32],
			// shadowAnchor: [16, 32],
		});

		// Add marker with custom icon
		L.marker([parseFloat(position.lat), parseFloat(position.lng)], {
			icon: customIcon,
		}).addTo(map);
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div
	id="map-canvas"
	class="map"
	bind:this={mapContainer}
	style="height: 400px; width: 100%;">
</div>

<style>
	.map {
		height: 222px;
		width: 100%;
		z-index: 1;
		/* Ensure minimum dimensions */
		min-height: 200px;
		min-width: 200px;
		border-radius: 8px;
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness-map)) hue-rotate(180deg);
		}
	}
</style>
