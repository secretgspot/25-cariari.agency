<script>
	import { onMount, onDestroy } from 'svelte';

	/** @type {{position?: any}} */
	let { position = null } = $props();

	let map, baseLayer, marker, positionData;

	onMount(async () => {
		const leafletModule = await import('leaflet');
		L = leafletModule.default;

		// NICE CLEAR ONE!
		// http://maps.stamen.com/
		// https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}
		// https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.{ext}
		// https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}{r}.{ext}
		// https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}
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
			attributionControl: false, // Instead of default attribution, we add custom at the bottom of script
			center: [9.933576017916193, -84.0551265784177], // Initial map center
			zoom: 15, // Initial zoom level
			layers: [baseLayer],
		});

		// L.control.zoom({ position: "topright" }).addTo(map);
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
	});

	onDestroy(async () => {
		if (map) {
			// console.log("Unloading 🗺");
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
