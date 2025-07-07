<script>
	import { onMount, onDestroy } from 'svelte';
	import { isEmpty } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';

	/** @type {{markers: any[], onLoaded: (value: boolean) => void, onSelected: (id: string) => void}} */
	let { markers = [], onLoaded, onSelected } = $props();

	let map = $state(null);
	let baseLayer = $state(null);
	let L_instance = $state(null); // Use a distinct name for the Leaflet instance
	let mapReady = $state(false); // New state variable to track map readiness
	let markersLayer = $state(null); // Layer group for markers
	let resizeObserver;

	onMount(async () => {
		if (browser) {
			const leaflet = await import('leaflet');
			L_instance = leaflet;
			if (typeof window !== 'undefined') {
				window.L = L_instance; // Make it globally available for plugins
			}

			baseLayer = L_instance.tileLayer(
				'//{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}',
				{
					subdomains: 'abcd',
					minZoom: 15,
					maxZoom: 18,
					ext: 'jpg',
				},
			);

			markersLayer = L_instance.layerGroup(); // Initialize layer group for markers

			map = L_instance.map('map-canvas', {
				zoomControl: false,
				center: new L_instance.LatLng(9.970881419133026, -84.16046619415285),
				maxBounds: L_instance.latLngBounds([
					[9.98943, -84.199448],
					[9.938958, -84.128766],
				]),
				zoom: 16,
				attributionControl: false,
				scrollWheelZoom: true,
				layers: [baseLayer, markersLayer], // Add markersLayer to the map
			}).invalidateSize();

			L_instance.control.zoom({ position: 'bottomleft' }).addTo(map);
			L_instance.control.scale({ position: 'bottomright' }).addTo(map);

			resizeObserver = new ResizeObserver(() => {
				if (map) {
					map.invalidateSize();
				}
			});
			resizeObserver.observe(document.getElementById('map-canvas'));
			baseLayer.on('load', () => {
				console.log(`🗺 loaded`);
				if (onLoaded) onLoaded(true);
			});

			mapReady = true; // Set mapReady to true once the map is initialized
		}
	});

	// Define onMarkerClick outside, so it's accessible by updateMarkers
	const onMarkerClick = (e) => {
		if (onSelected) onSelected(e.sourceTarget.options.property_id);
		map.setView(e.target.getLatLng(), 17);
	};

		// Function to convert property_for to a valid icon name
	const getPropertyIconName = (propertyFor) => {
		if (Array.isArray(propertyFor)) {
			return propertyFor.join('_');
		} else if (typeof propertyFor === 'string') {
			return propertyFor.replace(',', '_');
		} else {
			return 'null'; // Default or error case
		}
	};

	// Function to update markers, depends on L_instance, map, markersLayer
	const updateMarkers = (currentMarkers) => {
		if (!L_instance || !map || !markersLayer) return; // Ensure dependencies are ready

		markersLayer.clearLayers(); // Clear existing markers
		currentMarkers.forEach((item) => {
			let marker;
			let property_id = item.id;
			let msl = item.msl;
			let property_for = item.property_for;
			let lan = item.location.lat;
			let lon = item.location.lng;

			if (!isEmpty(lan) && !isEmpty(lon) && item.is_active) {
				const iconName = getPropertyIconName(property_for);
				marker = L_instance.marker(new L_instance.LatLng(+lan, +lon), {
					property_id,
					property_for,
					icon: L_instance.icon({
						iconUrl: `/map/${iconName}.svg`,
						iconSize: [21, 21],
						iconAnchor: [9, 9],
						opacity: 0.5,
					}),
				});
				marker.bindTooltip(`${msl} - ${property_for}`).openTooltip();
				marker.on('click', onMarkerClick);
				markersLayer.addLayer(marker); // Add marker to the layer group
			}
		});
	};

	// Use $effect to react to changes in markers and mapReady
	$effect(() => {
		if (mapReady && markersLayer) {
			// Only run this effect when the map is ready and markersLayer is initialized
			updateMarkers(markers);
		}
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
		resizeObserver.disconnect();
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="/node_modules/leaflet/dist/leaflet.css" />
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
