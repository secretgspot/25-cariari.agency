<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import pkg from 'maplibre-gl';
	const { Map, Marker } = pkg;
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { isValidMarker, getPropertyIconName } from '$lib/utils/mapUtils.js';
	import mapStyle from './style.json';

	/** @type {{markers: any[], onSelected: (id: string) => void}} */
	let { markers = [], onSelected } = $props();

	let mapElement; // Bind to the div element
	let mapInstance = $state(null);
	let isMapReady = $state(false);
	let mapMarkers = []; // To store MapLibre GL markers
	let currentOpenPopup = $state(null);

	// Define onMarkerClick outside, so it's accessible by updateMarkers and keeps its reference stable
	const handleMarkerClick = (property_id, lng, lat, tooltipText) => {
		if (onSelected && property_id) {
			onSelected(property_id);
		}

		// Close any currently open popup
		if (currentOpenPopup) {
			currentOpenPopup.remove();
			currentOpenPopup = null;
		}

		// Smooth pan to the clicked marker
		if (mapInstance) {
			const lngLat = [lng, lat];
			console.log('Clicked marker LngLat:', lngLat);
			mapInstance.flyTo({
				center: lngLat,
				zoom: 17,
				speed: 1.2,
				curve: 1,
				easing: (t) => t,
			});

			// Create and open a new popup
			const popup = new pkg.Popup({
				offset: [0, -10], // Adjusted offset to move tooltip down by 30px from previous position
				closeButton: false,
				closeOnClick: false,
			})
				.setLngLat(lngLat)
				.setHTML(`<div class="map-tooltip">${tooltipText}</div>`)
				.addTo(mapInstance);

			currentOpenPopup = popup;
		} else {
			console.warn('Map not ready for centering or popup.');
		}
	};

	// Function to update markers on the map
	const updateMapMarkers = async (newMarkers) => {
		if (!mapInstance || !isMapReady) {
			return;
		}

		// Remove existing markers
		mapMarkers.forEach((marker) => marker.remove());
		mapMarkers = [];

		const validMarkers = newMarkers.filter(isValidMarker);

		for (const item of validMarkers) {
			try {
				const { id: property_id, msl, property_for, location } = item;
				const { lat, lng } = location;

				console.log(`Marker ${property_id} location:`, location);
				console.log(`Marker ${property_id} lat: ${lat}, lng: ${lng}`);

				const iconName = getPropertyIconName(property_for);
				const iconUrl = `/map/${iconName}.svg`; // Assuming icons are in static/map/

				// Create a custom HTML element for the marker
				const el = document.createElement('div');
				el.className = 'map-marker';
				el.style.backgroundImage = `url(${iconUrl})`;
				el.style.width = '21px';
				el.style.height = '21px';
				el.style.backgroundSize = 'contain';
				el.style.backgroundRepeat = 'no-repeat';
				el.style.backgroundPosition = 'center';
				el.style.cursor = 'pointer';

				// Create the MapLibre GL JS marker
				const marker = new Marker({ element: el })
					.setLngLat([Number(lng), Number(lat)])
					.addTo(mapInstance);

				// Store property_id with the marker for click handling
				marker.property_id = property_id;

				// Create and attach tooltip
				const tooltipText = `${msl || 'N/A'} - ${
					Array.isArray(property_for) ? property_for.join(', ') : property_for || 'N/A'
				}`;

				// Store the marker
				mapMarkers.push(marker);

				// Add click listener to the marker element
				el.addEventListener('click', () => {
					handleMarkerClick(property_id, Number(lng), Number(lat), tooltipText);
				});
			} catch (error) {
				console.error('Error processing marker:', error, item);
			}
		}
	};

	let resizeObserver;
	const handleResize = () => {
		if (mapInstance) {
			mapInstance.resize();
		}
	};

	function initializeMap() {
		const initialCenter = [-84.16400029415285, 9.970881419133026]; // [lng, lat] - moved west by 5%
		const maxBounds = [
			[-84.199448, 9.9465288], // Southwest coordinates [lng, lat] - moved up by 15% from original
			[-84.128766, 9.9970008], // Northeast coordinates [lng, lat] - moved up by 15% from original
		];

		/*
		 * stadiamaps styles https://docs.stadiamaps.com/themes/
		 * https://tiles.stadiamaps.com/styles/alidade_smooth.json
		 * https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json
		 * https://tiles.stadiamaps.com/styles/stamen_toner.json
		 * https://tiles.stadiamaps.com/styles/stamen_toner_lite.json
		 * https://tiles.stadiamaps.com/styles/alidade_satellite.json
		 */

		mapInstance = new Map({
			container: mapElement,
			style: 'https://tiles.stadiamaps.com/styles/stamen_toner_lite.json', // Use imported style.json
			center: initialCenter,
			zoom: 16,
			minZoom: 15,
			maxZoom: 18,
			maxBounds: maxBounds,
			attributionControl: false,
		});

		mapInstance.on('load', () => {
			isMapReady = true;
			console.log('🗺 MapLibre GL Map is ready');
			mapInstance.resize(); // Ensure map resizes correctly after load
		});

		mapInstance.on('error', (e) => {
			console.error('MapLibre GL Map error:', e.error);
		});
	}

	onMount(async () => {
		if (!browser) return;

		// Defer map initialization to ensure element has dimensions
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
					resizeObserver = new ResizeObserver(handleResize);
					resizeObserver.observe(mapElement);
				}
			} catch (error) {
				console.error('Error initializing MapLibre GL map:', error);
			}
		}, 0);
	});

	$effect(() => {
		console.log('Markers prop changed:', markers);
		if (isMapReady) {
			updateMapMarkers(markers);
		}
	});

	onDestroy(() => {
		try {
			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}

			if (mapInstance) {
				mapInstance.remove();
				mapInstance = null;
			}
			mapMarkers = [];
			isMapReady = false;
		} catch (error) {
			console.error('Error during MapLibre GL cleanup:', error);
		}
	});
</script>

<div id="maplibre-canvas" class="map" bind:this={mapElement}></div>

<style>
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map {
		height: 100%;
		width: 100%;
		z-index: 1;
		/* Ensure the map container has a minimum size */
		min-height: 200px;
		min-width: 200px;
	}

	/* Use CSS custom properties for better dark mode control */
	@media (prefers-color-scheme: dark) {
		.map {
			/* Consider using a dark tile layer instead of CSS filters for better performance */
			filter: invert(1) brightness(0.8) hue-rotate(180deg);
		}
	}
</style>
