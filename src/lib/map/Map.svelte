<script>
	// --- Imports ---
	import { onMount, onDestroy } from 'svelte';
	import {
		isEmpty,
		getPosition,
		formatLargeNumber,
		enableWakeLock,
		disableWakeLock,
		prefersDarkTheme,
	} from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';
	import Toggle from '$lib/Toggle.svelte';

	// --- State ---
	let { markers = [], onSelected } = $props();
	let mapElement;
	let mapInstance = $state(null);
	let leafletInstance = $state(null);
	let markersLayer = $state(null);
	let resizeObserver;
	let resizeTimeout;
	let isMapReady = $state(false);
	let icons = {};
	let userLocationMarker = $state(null);
	let watchId = $state(null);
	let isLocating = $state(false);
	let wakeLock = null;

	// --- Geolocation ---
	function gpsCallback(position) {
		const { latitude, longitude } = position.coords;
		if (!mapInstance || !leafletInstance || !markersLayer) return;
		const userLatLng = new leafletInstance.LatLng(latitude, longitude);
		if (userLocationMarker) {
			userLocationMarker.setLatLng(userLatLng);
		} else {
			const userIcon = leafletInstance.icon({
				iconUrl: '/map/default.svg',
				iconSize: [21, 21],
				iconAnchor: [10, 10],
				tooltipAnchor: [0, -10],
			});
			userLocationMarker = leafletInstance
				.marker(userLatLng, { icon: userIcon })
				.addTo(markersLayer);
			// userLocationMarker
			//  .bindTooltip('Your Location', { permanent: false, direction: 'top' })
			//  .openTooltip();
		}
		mapInstance.setView(userLatLng, 18);
	}
	function errorCallback(error) {
		// Ignore POSITION_UNAVAILABLE errors, which can be frequent with simulators.
		if (error.code === 2) return;
		console.error('Error getting user location:', error);
		// PERMISSION_DENIED
		if (error.code === 1) {
			isLocating = false;
			disableWakeLock();
		}
	}

	// --- Find Me Toggle ---
	async function findMe() {
		if (!browser) return;
		if (watchId) {
			navigator.geolocation.clearWatch(watchId);
			watchId = null;
			isLocating = false;
			if (userLocationMarker) {
				markersLayer.removeLayer(userLocationMarker);
				userLocationMarker = null;
			}
			await disableWakeLock();
			return;
		}
		isLocating = true;
		await enableWakeLock();
		watchId = navigator.geolocation.watchPosition(gpsCallback, errorCallback, {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		});
	}

	// --- Marker Helpers ---
	function getPropertyIconName(propertyFor) {
		try {
			if (Array.isArray(propertyFor)) {
				return propertyFor.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
			} else if (typeof propertyFor === 'string') {
				return propertyFor.replace(/[^a-zA-Z0-9_]/g, '_');
			} else {
				return 'default';
			}
		} catch (error) {
			console.error('Error getting property icon name:', error);
			return 'default';
		}
	}
	function getIcon(iconName) {
		return icons[iconName] || icons.default;
	}
	function isValidMarker(marker) {
		return (
			marker &&
			typeof marker === 'object' &&
			marker.id &&
			marker.location &&
			!isEmpty(marker.location.lat) &&
			!isEmpty(marker.location.lng) &&
			!isNaN(Number(marker.location.lat)) &&
			!isNaN(Number(marker.location.lng)) &&
			marker.is_active === true
		);
	}
	function handleMarkerClick(e) {
		try {
			if (onSelected && e.sourceTarget?.options?.property_id) {
				onSelected(e.sourceTarget.options.property_id);
			}
			// Smooth pan to the clicked marker with error handling
			if (mapInstance && e.target?.getLatLng) {
				const latLng = e.target.getLatLng();
				if (latLng) {
					mapInstance.setView(latLng, 18, {
						animate: true,
						pan: { duration: 0.3 },
					});
				}
			}
		} catch (error) {
			console.error('Error handling marker click:', error);
		}
	}

	// --- Marker Management ---
	async function updateMapMarkers(newMarkers) {
		if (!leafletInstance || !mapInstance || !markersLayer || !isMapReady) return;
		try {
			markersLayer.clearLayers();
			const validMarkers = newMarkers.filter(isValidMarker);
			const batchSize = 50;
			for (let i = 0; i < validMarkers.length; i += batchSize) {
				const batch = validMarkers.slice(i, i + batchSize);
				for (const item of batch) {
					try {
						const { id: property_id, msl, property_for, location, price } = item;
						const { lat, lng } = location;
						const iconName = getPropertyIconName(property_for);
						const customIcon = getIcon(iconName);
						const marker = leafletInstance.marker(
							new leafletInstance.LatLng(Number(lat), Number(lng)),
							{ property_id, property_for, icon: customIcon },
						);
						const tooltipText = `${msl || 'N/A'} - ${
							Array.isArray(property_for)
								? property_for.join(', ')
								: property_for || 'N/A'
						}${price ? ` $${formatLargeNumber(price)}` : ''}`;
						marker.bindTooltip(tooltipText, {
							permanent: false,
							direction: 'top',
							offset: [0, -10],
						});
						marker.on('click', handleMarkerClick);
						markersLayer.addLayer(marker);
					} catch (error) {
						console.error('Error processing marker:', error, item);
					}
				}
				if (i + batchSize < validMarkers.length) {
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
			}
		} catch (error) {
			console.error('Error updating map markers:', error);
		}
	}

	// --- Map Setup ---
	function createIcon(url) {
		return leafletInstance.icon({
			iconUrl: url,
			iconSize: [21, 21],
			iconAnchor: [10, 10],
			tooltipAnchor: [0, 0],
		});
	}
	function initializeMap() {
		icons = {
			Sale: createIcon('/map/Sale.svg'),
			Rent: createIcon('/map/Rent.svg'),
			Sale_Rent: createIcon('/map/Sale_Rent.svg'),
			default: createIcon('/map/default.svg'),
		};
		const initialCenter = new leafletInstance.LatLng(9.97088, -84.16046);
		const maxBounds = leafletInstance.latLngBounds([
			[9.962, -84.1789],
			[9.9802, -84.1423],
		]);

		/*
		 * https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}
		 * https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.{ext}
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
		 * https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg
		 * https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
		 */

		// Determine the map URL based on the theme preference
		const defaultMapUrl = prefersDarkTheme()
			? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.{ext}'
			: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}';

		const defaultMap = leafletInstance.tileLayer(defaultMapUrl, {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
			ext: 'jpg',
			errorTileUrl:
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
		});

		const satelliteMap = leafletInstance.tileLayer(
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

		const baseLayers = {
			Default: defaultMap,
			Satellite: satelliteMap,
		};

		markersLayer = leafletInstance.layerGroup();
		mapInstance = leafletInstance.map(mapElement, {
			zoomControl: false,
			center: initialCenter,
			maxBounds: maxBounds,
			maxBoundsViscosity: 0.8,
			zoom: 16,
			attributionControl: false,
			scrollWheelZoom: true,
			layers: [defaultMap, markersLayer],
			preferCanvas: true,
		});
		// leafletInstance.control.zoom({ position: 'bottomleft' }).addTo(mapInstance);
		// leafletInstance.control.scale({ position: 'bottomright' }).addTo(mapInstance);
		leafletInstance.control
			.layers(baseLayers, null, { position: 'bottomright' })
			.addTo(mapInstance);

		defaultMap.on('tileerror', (error) => {
			console.warn('Tile load error:', error);
		});
		mapInstance.whenReady(() => {
			isMapReady = true;
			mapInstance.invalidateSize();
			console.log('🗺 Map is ready');
		});
	}
	function handleResize() {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (mapInstance) mapInstance.invalidateSize();
		}, 100);
	}

	// --- Lifecycle ---
	onMount(async () => {
		if (!browser) return;
		try {
			const leaflet = await import('leaflet');
			leafletInstance = leaflet;
			if (!mapElement || mapElement.clientWidth === 0 || mapElement.clientHeight === 0) {
				console.error('Map element not found or has no dimensions.');
				return;
			}
			initializeMap();
			if (window.ResizeObserver) {
				resizeObserver = new ResizeObserver(handleResize);
				resizeObserver.observe(mapElement);
			}
		} catch (error) {
			console.error('Error initializing map:', error);
		}
	});

	$effect(() => {
		if (isMapReady) updateMapMarkers(markers);
	});

	onDestroy(() => {
		try {
			if (watchId) navigator.geolocation.clearWatch(watchId);
			if (wakeLock) {
				try {
					wakeLock.release();
				} catch (e) {}
				wakeLock = null;
			}
			if (resizeTimeout) clearTimeout(resizeTimeout);
			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}
			if (mapInstance) {
				mapInstance.remove();
				mapInstance = null;
			}
			leafletInstance = null;
			markersLayer = null;
			isMapReady = false;
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}>
	<Toggle
		kind="flip"
		on="📍"
		off="🎯"
		name="findMeToggle"
		onchange={findMe}
		bind:checked={isLocating} />
</div>

<style>
	.map {
		height: 100%;
		width: 100%;
		z-index: 1;
		/* Ensure the map container has a minimum size */
		min-height: 369px;
		min-width: 369px;

		:global(.toggle) {
			position: absolute;
			bottom: var(--padding-extra-small);
			left: var(--padding-extra-small);
			z-index: 999;
			:global(.flip + label) {
				min-width: min-content;
			}
		}
	}

	/* Use CSS custom properties for better dark mode control */
	/* @media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(1) hue-rotate(180deg);
		}
	} */
</style>
