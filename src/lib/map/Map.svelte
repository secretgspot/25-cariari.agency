<script>
	import { onMount, onDestroy } from 'svelte';
	import { isEmpty } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';
	// import 'leaflet/dist/leaflet.css';

	/** @type {{markers: any[], onSelected: (id: string) => void}} */
	let { markers = [], onSelected } = $props();

	let mapElement; // Bind to the div element
	let mapInstance = $state(null);
	let leafletInstance = $state(null);
	let markersLayer = $state(null);
	let resizeObserver;
	let isMapReady = $state(false);
	let currentMarkers = $state([]);
	let loadedIcons = new Map(); // Cache for loaded icons

	// Define onMarkerClick outside, so it's accessible by updateMarkers and keeps its reference stable
	const handleMarkerClick = (e) => {
		try {
			if (onSelected && e.sourceTarget?.options?.property_id) {
				onSelected(e.sourceTarget.options.property_id);
			}
			// Smooth pan to the clicked marker with error handling
			if (mapInstance && e.target?.getLatLng) {
				const latLng = e.target.getLatLng();
				if (latLng) {
					mapInstance.setView(latLng, 17, {
						animate: true,
						pan: {
							duration: 0.3,
						},
					});
				}
			}
		} catch (error) {
			console.error('Error handling marker click:', error);
		}
	};

	// Function to convert property_for to a valid icon name
	const getPropertyIconName = (propertyFor) => {
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
	};

	// Function to create or get cached icon
	const getOrCreateIcon = async (iconName) => {
		if (loadedIcons.has(iconName)) {
			return loadedIcons.get(iconName);
		}

		const iconUrl = `/map/${iconName}.svg`;

		// Check if icon exists before creating
		try {
			const response = await fetch(iconUrl, { method: 'HEAD' });
			const finalIconUrl = response.ok ? iconUrl : '/map/default.svg';

			const customIcon = leafletInstance.icon({
				iconUrl: finalIconUrl,
				iconSize: [21, 21],
				iconAnchor: [10, 10],
				tooltipAnchor: [0, -10],
				opacity: 1,
			});

			loadedIcons.set(iconName, customIcon);
			return customIcon;
		} catch (error) {
			console.warn(`Icon ${iconUrl} not found, using default`);
			const defaultIcon = leafletInstance.icon({
				iconUrl: '/map/default.svg',
				iconSize: [21, 21],
				iconAnchor: [10, 10],
				tooltipAnchor: [0, -10],
				opacity: 1,
			});
			loadedIcons.set(iconName, defaultIcon);
			return defaultIcon;
		}
	};

	// Function to validate marker data
	const isValidMarker = (marker) => {
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
	};

	// Function to update markers on the map
	const updateMapMarkers = async (newMarkers) => {
		if (!leafletInstance || !mapInstance || !markersLayer || !isMapReady) {
			console.warn('Map not ready for marker updates');
			return;
		}

		try {
			// Clear existing markers
			markersLayer.clearLayers();

			// Filter and validate markers
			const validMarkers = newMarkers.filter(isValidMarker);

			// Process markers in batches to avoid blocking the UI
			const batchSize = 50;
			for (let i = 0; i < validMarkers.length; i += batchSize) {
				const batch = validMarkers.slice(i, i + batchSize);

				await Promise.all(
					batch.map(async (item) => {
						try {
							const { id: property_id, msl, property_for, location } = item;
							const { lat, lng } = location;

							const iconName = getPropertyIconName(property_for);
							const customIcon = await getOrCreateIcon(iconName);

							const marker = leafletInstance.marker(
								new leafletInstance.LatLng(Number(lat), Number(lng)),
								{
									property_id,
									property_for,
									icon: customIcon,
								},
							);

							const tooltipText = `${msl || 'N/A'} - ${Array.isArray(property_for) ? property_for.join(', ') : property_for || 'N/A'}`;
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
					}),
				);

				// Allow other tasks to run between batches
				if (i + batchSize < validMarkers.length) {
					await new Promise((resolve) => setTimeout(resolve, 0));
				}
			}

			console.log(`Updated ${validMarkers.length} markers on map`);
		} catch (error) {
			console.error('Error updating map markers:', error);
		}
	};

	// Debounced resize handler
	let resizeTimeout;
	const handleResize = () => {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (mapInstance) {
				mapInstance.invalidateSize();
			}
		}, 100);
	};

	onMount(async () => {
		if (!browser) return;

		try {
			// Dynamically import Leaflet to ensure it only runs in the browser
			const leaflet = await import('leaflet');
			// await import('leaflet/dist/leaflet.css');
			leafletInstance = leaflet;

			// Wait for DOM to be ready
			await new Promise((resolve) => setTimeout(resolve, 0));

			// Ensure the map container is ready
			if (!mapElement) {
				console.error('Map element not found');
				return;
			}

			// Check if element has dimensions
			const rect = mapElement.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				console.warn('Map element has no dimensions, waiting...');
				// Wait a bit for CSS to load
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Initialize map once
			if (!mapInstance) {
				const initialCenter = new leafletInstance.LatLng(
					9.970881419133026,
					-84.16046619415285,
				);
				const maxBounds = leafletInstance.latLngBounds([
					[9.98943, -84.199448],
					[9.938958, -84.128766],
				]);

				const cartoDbLight = leafletInstance.tileLayer(
					'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}',
					{
						subdomains: 'abcd',
						minZoom: 15,
						maxZoom: 18,
						ext: 'jpg',
						errorTileUrl:
							'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Transparent fallback
					},
				);

				markersLayer = leafletInstance.layerGroup();

				mapInstance = leafletInstance.map(mapElement, {
					zoomControl: false,
					center: initialCenter,
					maxBounds: maxBounds,
					maxBoundsViscosity: 0.8,
					zoom: 16,
					attributionControl: false,
					scrollWheelZoom: true,
					layers: [cartoDbLight, markersLayer],
					preferCanvas: true, // Better performance for many markers
				});

				leafletInstance.control.zoom({ position: 'bottomleft' }).addTo(mapInstance);
				leafletInstance.control.scale({ position: 'bottomright' }).addTo(mapInstance);

				// Set up resize observer with debouncing
				if (window.ResizeObserver) {
					resizeObserver = new ResizeObserver(handleResize);
					resizeObserver.observe(mapElement);
				}

				// Wait for map to be fully loaded
				mapInstance.whenReady(() => {
					isMapReady = true;
					mapInstance.invalidateSize();
					console.log('🗺 Map is ready');

					// Load initial markers
					updateMapMarkers(markers);
				});

				// Handle tile load events
				cartoDbLight.on('load', () => {
					console.log('🗺 Base layer loaded');
				});

				cartoDbLight.on('tileerror', (error) => {
					console.warn('Tile load error:', error);
				});
			}
		} catch (error) {
			console.error('Error initializing map:', error);
		}
	});

	// Deep comparison function for markers
	const markersEqual = (a, b) => {
		if (a === b) return true;
		if (!a || !b || a.length !== b.length) return false;

		return a.every((markerA, index) => {
			const markerB = b[index];
			return (
				markerA.id === markerB.id &&
				markerA.is_active === markerB.is_active &&
				markerA.location?.lat === markerB.location?.lat &&
				markerA.location?.lng === markerB.location?.lng &&
				JSON.stringify(markerA.property_for) === JSON.stringify(markerB.property_for) &&
				markerA.msl === markerB.msl
			);
		});
	};

	// Use $effect to react to changes in the 'markers' prop
	$effect(() => {
		// Only update if markers actually changed and map is ready
		if (isMapReady && !markersEqual(currentMarkers, markers)) {
			currentMarkers = [...markers]; // Create a copy
			updateMapMarkers(markers);
		}
	});

	onDestroy(() => {
		try {
			if (resizeTimeout) clearTimeout(resizeTimeout);

			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}

			if (mapInstance) {
				mapInstance.remove();
				mapInstance = null;
			}

			// Clear icon cache
			loadedIcons.clear();

			leafletInstance = null;
			markersLayer = null;
			isMapReady = false;
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}></div>

<style>
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
