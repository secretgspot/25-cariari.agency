<script>
	import { onMount, onDestroy, untrack } from 'svelte';
	import { isEmpty } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';
	import 'leaflet/dist/leaflet.css';

	/** @type {{position?: any}} */
	let { position = $bindable({}) } = $props();

	let mapElement;
	let mapInstance = $state(null);
	let leafletInstance = $state(null);
	let baseLayer = $state(null);
	let marker = $state(null);
	let pickerIcon = $state(null);
	let isMapReady = $state(false);
	let resizeObserver;
	let isUpdatingFromUser = false; // Flag to prevent effect loops

	// Default position fallback
	const DEFAULT_POSITION = {
		lat: 9.970881419133026,
		lng: -84.16046619415285,
	};

	// Validate position data
	const isValidPosition = (pos) => {
		return (
			pos &&
			typeof pos === 'object' &&
			!isEmpty(pos.lat) &&
			!isEmpty(pos.lng) &&
			!isNaN(Number(pos.lat)) &&
			!isNaN(Number(pos.lng)) &&
			Number(pos.lat) >= -90 &&
			Number(pos.lat) <= 90 &&
			Number(pos.lng) >= -180 &&
			Number(pos.lng) <= 180
		);
	};

	// Normalize position to ensure it's a valid object
	const normalizePosition = (pos) => {
		if (!pos) return null;

		try {
			// Handle array format [lat, lng]
			if (Array.isArray(pos) && pos.length >= 2) {
				return { lat: Number(pos[0]), lng: Number(pos[1]) };
			}

			// Handle object format { lat, lng }
			if (typeof pos === 'object' && pos.lat !== undefined && pos.lng !== undefined) {
				return { lat: Number(pos.lat), lng: Number(pos.lng) };
			}

			return null;
		} catch (error) {
			console.error('Error normalizing position:', error);
			return null;
		}
	};

	// Update marker position on map
	const updateMarkerPosition = (newPosition) => {
		if (!mapInstance || !leafletInstance || !isMapReady) {
			console.warn('Map not ready for position update');
			return;
		}

		try {
			const validPosition = normalizePosition(newPosition);
			if (!isValidPosition(validPosition)) {
				console.warn('Invalid position provided:', newPosition);
				return;
			}

			const { lat, lng } = validPosition;
			const latLng = new leafletInstance.LatLng(lat, lng);

			// Create marker if it doesn't exist
			if (!marker) {
				marker = leafletInstance.marker(latLng, {
					icon: pickerIcon,
					draggable: true,
				});

				// Add drag event listener
				marker.on('dragend', handleMarkerDrag);
				marker.addTo(mapInstance);
			} else {
				// Update existing marker position
				marker.setLatLng(latLng);
			}

			// Update map view smoothly
			mapInstance.setView(latLng, 16, {
				animate: true,
				pan: { duration: 0.3 },
			});

			console.log('Marker position updated:', { lat, lng });
		} catch (error) {
			console.error('Error updating marker position:', error);
		}
	};

	// Handle marker drag events
	const handleMarkerDrag = (e) => {
		try {
			const newLatLng = e.target.getLatLng();
			if (newLatLng) {
				const newPosition = {
					lat: newLatLng.lat,
					lng: newLatLng.lng,
				};

				// Set flag to prevent effect loop
				isUpdatingFromUser = true;
				position = newPosition;
				// Reset flag after a tick
				setTimeout(() => {
					isUpdatingFromUser = false;
				}, 0);
			}
		} catch (error) {
			console.error('Error handling marker drag:', error);
		}
	};

	// Handle map click events
	const handleMapClick = (e) => {
		try {
			if (!e.latlng) return;

			const newPosition = {
				lat: e.latlng.lat,
				lng: e.latlng.lng,
			};

			// Set flag to prevent effect loop
			isUpdatingFromUser = true;
			position = newPosition;

			// Update marker position directly
			if (marker) {
				marker.setLatLng(e.latlng);
			} else {
				updateMarkerPosition(newPosition);
			}

			// Reset flag after a tick
			setTimeout(() => {
				isUpdatingFromUser = false;
			}, 0);
		} catch (error) {
			console.error('Error handling map click:', error);
		}
	};

	// Public function to update GPS position
	export function updategps(coords) {
		try {
			if (!coords) {
				console.warn('No coordinates provided to updategps');
				return;
			}

			const newPosition = {
				lat: coords.latitude || coords.lat,
				lng: coords.longitude || coords.lng,
			};

			if (isValidPosition(newPosition)) {
				// Set flag to prevent effect loop
				isUpdatingFromUser = true;
				position = newPosition;
				updateMarkerPosition(newPosition);
				// Reset flag after a tick
				setTimeout(() => {
					isUpdatingFromUser = false;
				}, 0);
			} else {
				console.warn('Invalid GPS coordinates:', coords);
			}
		} catch (error) {
			console.error('Error updating GPS position:', error);
		}
	}

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
			// Dynamically import Leaflet
			const leaflet = await import('leaflet');
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
				await new Promise((resolve) => setTimeout(resolve, 100));
			}

			// Create picker icon
			pickerIcon = leafletInstance.icon({
				iconUrl: '/map/marker-icon.svg',
				// shadowUrl: '/map/marker-shadow.svg',
				iconSize: [25, 41],
				iconAnchor: [13, 41],
				popupAnchor: [1, -34],
				// shadowSize: [36, 36],
				// shadowAnchor: [4, 33],
			});

			// Initialize base layer
			baseLayer = leafletInstance.tileLayer(
				'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}',
				{
					subdomains: 'abcd',
					minZoom: 15,
					maxZoom: 18,
					ext: 'jpg',
					errorTileUrl:
						'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
				},
			);

			// Initialize map
			const initialPosition = isValidPosition(position) ? position : DEFAULT_POSITION;
			const maxBounds = leafletInstance.latLngBounds([
				[9.980261288306549, -84.17891979217531],
				[9.962086432098069, -84.14235591888429],
			]);

			mapInstance = leafletInstance.map(mapElement, {
				zoomControl: false,
				center: [initialPosition.lat, initialPosition.lng],
				maxBounds: maxBounds,
				maxBoundsViscosity: 0.8,
				zoom: 15,
				attributionControl: false,
				scrollWheelZoom: true,
				layers: [baseLayer],
				preferCanvas: true,
			});

			// Add controls
			// leafletInstance.control.zoom({ position: 'topright' }).addTo(mapInstance);

			// Set up resize observer
			if (window.ResizeObserver) {
				resizeObserver = new ResizeObserver(handleResize);
				resizeObserver.observe(mapElement);
			}

			// Wait for map to be ready
			mapInstance.whenReady(() => {
				isMapReady = true;
				mapInstance.invalidateSize();
				console.log('🗺 Position picker map ready');

				// Set initial position if provided
				if (isValidPosition(position)) {
					updateMarkerPosition(position);
				}
			});

			// Add event listeners
			mapInstance.on('click', handleMapClick);

			// Handle tile load events
			baseLayer.on('load', () => {
				console.log('🗺 Base layer loaded');
			});

			baseLayer.on('tileerror', (error) => {
				console.warn('Tile load error:', error);
			});
		} catch (error) {
			console.error('Error initializing position picker map:', error);
		}
	});

	// Position comparison function
	const positionsEqual = (a, b) => {
		if (a === b) return true;
		if (!a || !b) return false;

		const normalizedA = normalizePosition(a);
		const normalizedB = normalizePosition(b);

		if (!normalizedA || !normalizedB) return false;

		return (
			Math.abs(normalizedA.lat - normalizedB.lat) < 0.000001 &&
			Math.abs(normalizedB.lng - normalizedB.lng) < 0.000001
		);
	};

	// React to position changes from outside (props)
	$effect(() => {
		// Only respond to external position changes when map is ready
		// and when the update is not coming from user interaction
		if (isMapReady && !isUpdatingFromUser && position && isValidPosition(position)) {
			updateMarkerPosition(position);
		}
	});

	onDestroy(() => {
		try {
			if (resizeTimeout) clearTimeout(resizeTimeout);

			if (resizeObserver) {
				resizeObserver.disconnect();
				resizeObserver = null;
			}

			if (marker) {
				marker.off('dragend', handleMarkerDrag);
				marker.remove();
				marker = null;
			}

			if (mapInstance) {
				mapInstance.off('click', handleMapClick);
				mapInstance.remove();
				mapInstance = null;
			}

			baseLayer = null;
			pickerIcon = null;
			leafletInstance = null;
			isMapReady = false;
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}></div>

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
			filter: invert(1) brightness(0.8) hue-rotate(180deg);
		}
	}

	/* Ensure Leaflet controls are visible */
	:global(.leaflet-control-zoom) {
		background: rgba(255, 255, 255, 0.9) !important;
		border-radius: 4px !important;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2) !important;
	}

	:global(.leaflet-control-zoom a) {
		color: #333 !important;
		text-decoration: none !important;
	}

	@media (prefers-color-scheme: dark) {
		:global(.leaflet-control-zoom) {
			background: rgba(0, 0, 0, 0.9) !important;
		}

		:global(.leaflet-control-zoom a) {
			color: white !important;
		}
	}

	/* Improve marker visibility */
	:global(.leaflet-marker-icon) {
		transition: transform 0.2s ease;
	}

	:global(.leaflet-marker-icon:hover) {
		transform: scale(1.1);
	}
</style>
