<script>
	import { createEventDispatcher } from 'svelte';

	import { onMount, onDestroy } from 'svelte';

	import { isEmpty } from '$lib/utils/helpers.js';

	/** @type {{markers: any[]}} */

	let { markers = [] } = $props();

	let map, baseLayer, mclusters;

	const dispatch = createEventDispatcher();

	onMount(async () => {
		const leafletModule = await import('leaflet');

		L = leafletModule.default;

		await import('./cluster.js'); // NICE CLEAR ONE!
		// http://maps.stamen.com/
		// //stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}
		// //stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}
		// //stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.{ext}
		// //stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.{ext}
		// //stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.{ext}

		baseLayer = L.tileLayer(
			'//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}',

			{
				subdomains: 'abcd',

				minZoom: 15,

				maxZoom: 18,

				ext: 'jpg',
			},
		);

		mclusters = L.markerClusterGroup({ disableClusteringAtZoom: 16 });

		markers.forEach((item) => {
			let marker;

			let property_id = item.id;

			let msl = item.msl;

			let property_for = item.property_for;

			let lan = item.location.lat;

			let lon = item.location.lng;

			if (!isEmpty(lan) && !isEmpty(lon) && item.is_active) {
				marker = L.marker(new L.LatLng(+lan, +lon), {
					property_id, // title: `${msl} ${property_for}`, // not needed because of line 61

					property_for, // icon: L.divIcon({
					// className: `icon-${createClass(property_for)}`,
					// }),

					icon: L.icon({
						iconUrl: `/map/${property_for}.svg`,

						iconSize: [21, 21],

						iconAnchor: [9, 9],

						opacity: 0.5,
					}),
				}); // if (!isEmpty(msl)) marker.bindPopup(msl);
				// if (!isEmpty(msl)) {

				marker.bindTooltip(`${msl} - ${property_for}`).openTooltip();

				marker.on('click', onMarkerClick); // }

				mclusters.addLayer(marker);
			}
		});

		map = L.map('map-canvas', {
			zoomControl: false, // Add zoom control separately below

			center: new L.LatLng(9.970881419133026, -84.16046619415285), // Initial map center

			maxBounds: L.latLngBounds([
				[9.99443, -84.199448],

				[9.943958, -84.128766],
			]),

			zoom: 16, // Initial zoom level

			attributionControl: false, // Instead of default attribution, we add custom at the bottom of script

			scrollWheelZoom: true,

			layers: [baseLayer, mclusters],
		}).invalidateSize(); // map.on("load", console.log("map loaded")); // 🚩 why doesn't work?

		L.control.zoom({ position: 'bottomleft' }).addTo(map);

		L.control.scale({ position: 'bottomright' }).addTo(map);

		map.on('resize', () => console.log('resized map'));

		baseLayer.on('load', () => {
			console.log(`🗺 loaded`);

			dispatch('loaded', true);
		}); // map.invalidateSize();
	});

	onDestroy(async () => {
		if (map) {
			// console.log("Unloading 🗺");

			map.remove();
		}
	});

	function onMarkerClick(e) {
		map.setView(e.target.getLatLng(), 17); // console.log("🗺", e.sourceTarget.options.property_id);

		dispatch('selected', e.sourceTarget.options.property_id);
	} // function createClass(property) {
	// console.log("🧨", property);
	// const propClasses = {
	//  "000": "dead", // none
	//  "001": "investment", // investment (magenta)
	//  "010": "rent", // rent (orange)
	//  "100": "sale", // sale (cyan)
	//  "011": "rent-investment", // investment + rent (burdengy)
	//  "101": "sale-investment", // investment + sale (purple)
	//  "110": "rent-sale", // rent + sale (green)
	//  "111": "rent-sale-investment", // investment + rent + sale (white)
	// };
	// return propClasses[
	//  `${Number(property.rent)}${Number(property.sale)}${Number(
	//   property.investment
	//  )}`
	// ];
	// }
</script>

<svelte:head>
	<link rel="stylesheet" href="/css/leaflet.css" />
	<link rel="stylesheet" href="/css/MarkerCluster.css" />
</svelte:head>

<div id="map-canvas" class="map"></div>

<style>
	.map {
		height: 100%;

		width: 100%;

		z-index: 1;
	}

	/* .map :global(.leaflet-marker-icon) {

  border-radius: 50%;

  outline: 3px solid white;

 }

 .map :global(.icon-undefined) {

  background: purple;

 }

 .map :global(.icon-sale) {

  background: rgb(0, 0, 255);

 }

 .map :global(.icon-rent) {

  background: rgb(0, 128, 0);

 }

 .map :global(.icon-rent-sale) {

  background: rgb(0, 102, 128);

 } */

	@media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness));
		}
	}
</style>
