<script>
	import { onMount, onDestroy } from 'svelte';
	import L from 'leaflet';

	export let position;

	let map;
	let mapContainer;

	// Define maxBounds as LatLngBounds
	const maxBounds = [
		[9.962086432098069, -84.17891979217531], // Southwest (min lat, min lng)
		[9.980261288306549, -84.14235591888429], // Northeast (max lat, max lng)
	];

	onMount(() => {
		if (!position) return;

		map = L.map(mapContainer, {
			zoomControl: false,
			maxBounds: maxBounds,
			maxBoundsViscosity: 0.8, // Optional: makes panning near edges "sticky"
		}).setView([parseFloat(position.lat), parseFloat(position.lng)], 17);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}', {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
			ext: 'jpg',
			errorTileUrl:
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
		}).addTo(map);

		L.marker([parseFloat(position.lat), parseFloat(position.lng)]).addTo(map);
	});

	onDestroy(() => {
		if (map) {
			map.remove(); // crucial to avoid conflicts
		}
	});
</script>

<div bind:this={mapContainer} style="height: 400px; width: 100%;"></div>
