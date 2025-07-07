<script>
	import { onMount, onDestroy } from 'svelte';
	import { isEmpty } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';

	let L; // Declare L at the top level

	/** @type {{position?: any}} */
	let { position = $bindable({}) } = $props();

	let map = $state(null);
	let baseLayer = $state(null);
	let marker = $state(null);
	let positionData;

	onMount(async () => {
		if (browser) {
			const leafletModule = await import('leaflet');
			L = leafletModule.default;

			baseLayer = L.tileLayer('//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}', {
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 18,
				ext: 'jpg',
			});

			map = L.map('map-canvas', {
				zoomControl: false,
				center: [9.970881419133026, -84.16046619415285],
				maxBounds: L.latLngBounds([
					[9.980261288306549, -84.17891979217531],
					[9.962086432098069, -84.14235591888429],
				]),
				zoom: 15,
				attributionControl: false,
				scrollWheelZoom: true,
				layers: [baseLayer],
			});

			let pickerIcon = L.icon({
				iconUrl: '/map/marker-icon.png',
				shadowUrl: '/map/marker-shadow.png',
				iconAnchor: [13, 42],
			});

			marker = L.marker(positionData, {
				icon: pickerIcon,
			});

			if (!isEmpty(position)) {
				positionData = [+position.lat, +position.lng];
				marker.setLatLng(positionData).addTo(map);
				map.setView(positionData, 16);
			}

			map.on('click', onMapClick);
		}
	});

	$effect(() => {
		if (marker && !isNaN(+position.lat) && !isNaN(+position.lng) && map && L) {
			// L is available in onMount scope, so it's available here too after map is initialized
			marker.setLatLng(position).addTo(map);
			map.setView(position, 16);
		}
	});

	export function updategps(e) {
		if (map && L) { // L is available in onMount scope, so it's available here too after map is initialized
			position = {
				lat: e.latitude,
				lng: e.longitude,
			};
			marker.setLatLng(position).addTo(map);
			map.setView(position, 16);
		}
	}

	function onMapClick(e) {
		if (map && L) { // L is available in onMount scope, so it's available here too after map is initialized
			position = {
				lat: e.latlng.lat,
				lng: e.latlng.lng,
			};
			marker.setLatLng(e.latlng).addTo(map);
		}
	}

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
		width: 100%;
		z-index: 1;
	}
	@media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness));
		}
	}
</style>