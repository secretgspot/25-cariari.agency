<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	let L = $state(null); // Declare L as a state variable

	/** @type {{position?: any}} */
	let { position = null } = $props();

	let map = $state(null),
		baseLayer = $state(null),
		marker = $state(null),
		positionData;

	onMount(async () => {
		if (browser) {
			const leafletModule = await import('leaflet');
			L = leafletModule.default;

			baseLayer = L.tileLayer('//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}', {
				subdomains: 'abcd',
				minZoom: 15,
				maxZoom: 15,
				ext: 'jpg',
			});

			map = L.map('map-canvas', {
				zoomControl: false,
				doubleClickZoom: false,
				closePopupOnClick: false,
				boxZoom: false,
				dragging: false,
				zoomSnap: false,
				zoomDelta: false,
				trackResize: false,
				touchZoom: false,
				scrollWheelZoom: false,
				attributionControl: false,
				center: [9.933576017916193, -84.0551265784177],
				zoom: 15,
				layers: [baseLayer],
			});

			let pickerIcon = L.icon({
				iconUrl: '/logo/icon.png',
				iconSize: [30, 30],
				iconAnchor: [15, 15],
			});

			marker = L.marker(positionData, {
				icon: pickerIcon,
			});

			if (position) {
				positionData = [+position.lat, +position.lng];
				marker.setLatLng(positionData).addTo(map);
				map.setView(positionData, 15);
			}
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/leaflet.css" />
</svelte:head>

<div id="map-canvas" class="map"></div>

<style>
	.map {
		height: 222px;
		width: 333px;
		z-index: 1;
		border-radius: var(--border-radius);
	}
	@media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness));
		}
	}
</style>
