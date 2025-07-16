<script>
	import { onMount, onDestroy } from 'svelte';
	import { isEmpty, getPosition } from '$lib/utils/helpers.js';
	import { browser } from '$app/environment';
	import { Button } from '$lib/buttons';

	/** @type {{markers: any[], onSelected: (id: string) => void}} */
	let { markers = [], onSelected } = $props();

	let mapElement; // Bind to the div element
	let mapInstance = $state(null);
	let leafletInstance = $state(null);
	let markersLayer = $state(null);
	let resizeObserver;
	let isMapReady = $state(false);
	let icons = {}; // Object to hold pre-loaded icons
	let userLocationMarker = $state(null); // State to hold the user's location marker

	const findMe = async () => {
		if (!browser) return;

		const dummyProperty = { location: { lat: null, lng: null } };

		const gpsCallback = (coords) => {
			// console.log('gpsCallback received coords:', coords);
			if (!mapInstance) {
				console.error('mapInstance is null in gpsCallback');
				return;
			}
			if (!leafletInstance) {
				console.error('leafletInstance is null in gpsCallback');
				return;
			}
			if (!markersLayer) {
				console.error('markersLayer is null in gpsCallback');
				return;
			}

			try {
				// Remove existing user location marker if it exists
				if (userLocationMarker) {
					markersLayer.removeLayer(userLocationMarker);
				}

				const userLatLng = new leafletInstance.LatLng(coords.latitude, coords.longitude);
				// console.log('User LatLng:', userLatLng);

				mapInstance.setView(userLatLng, 18);
				// console.log('Map view set to user location.');

				const userIcon = leafletInstance.icon({
					iconUrl: '/map/default.svg',
					iconSize: [21, 21],
					iconAnchor: [10, 10],
					tooltipAnchor: [0, -10],
				});
				// console.log('User icon created.');

				userLocationMarker = leafletInstance
					.marker(userLatLng, { icon: userIcon })
					.addTo(markersLayer);
				// console.log('User marker added to markersLayer.');

				userLocationMarker
					.bindTooltip('Your Location', { permanent: false, direction: 'top' })
					.openTooltip();
				// console.log('Tooltip bound and opened.');
			} catch (error) {
				console.error('Error in gpsCallback:', error);
			}
		};

		await getPosition(dummyProperty, gpsCallback);
	};

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
					mapInstance.setView(latLng, 18, {
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

	// Function to get a pre-loaded icon
	const getIcon = (iconName) => {
		return icons[iconName] || icons.default;
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
			return;
		}

		try {
			markersLayer.clearLayers();
			const validMarkers = newMarkers.filter(isValidMarker);

			const batchSize = 50;
			for (let i = 0; i < validMarkers.length; i += batchSize) {
				const batch = validMarkers.slice(i, i + batchSize);

				for (const item of batch) {
					try {
						const { id: property_id, msl, property_for, location } = item;
						const { lat, lng } = location;

						const iconName = getPropertyIconName(property_for);
						const customIcon = getIcon(iconName);

						const marker = leafletInstance.marker(
							new leafletInstance.LatLng(Number(lat), Number(lng)),
							{
								property_id,
								property_for,
								icon: customIcon,
							},
						);

						const tooltipText = `${msl || 'N/A'} - ${
							Array.isArray(property_for)
								? property_for.join(', ')
								: property_for || 'N/A'
						}`;
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
	};

	let resizeTimeout;
	const handleResize = () => {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (mapInstance) {
				mapInstance.invalidateSize();
			}
		}, 100);
	};

	function initializeMap() {
		const createIcon = (url) => {
			return leafletInstance.icon({
				iconUrl: url,
				iconSize: [21, 21],
				iconAnchor: [10, 10],
				tooltipAnchor: [0, 0], // changed it from 0, -10
			});
		};

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
		 */

		const cartoDbLight = leafletInstance.tileLayer(
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
			preferCanvas: true,
		});

		// leafletInstance.control.zoom({ position: 'bottomleft' }).addTo(mapInstance);
		leafletInstance.control.scale({ position: 'bottomright' }).addTo(mapInstance);

		cartoDbLight.on('tileerror', (error) => {
			console.warn('Tile load error:', error);
		});

		mapInstance.whenReady(() => {
			isMapReady = true;
			mapInstance.invalidateSize();
			console.log('🗺 Map is ready');
		});
	}

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
		if (isMapReady) {
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

			leafletInstance = null;
			markersLayer = null;
			isMapReady = false;
		} catch (error) {
			console.error('Error during cleanup:', error);
		}
	});
</script>

<div id="map-canvas" class="map" bind:this={mapElement}>
	<Button type="button" size="icon" onclick={findMe}>
		{#snippet icon()}
			🎯
		{/snippet}
	</Button>

	<!-- <a
		href="#"
		class="find-me-button"
		onclick={(e) => {
			e.preventDefault();
			findMe();
		}}>Find Me</a> -->
</div>

<style>
	.map {
		height: 100%;
		width: 100%;
		z-index: 1;
		/* Ensure the map container has a minimum size */
		min-height: 200px;
		min-width: 200px;

		:global(button) {
			position: absolute;
			bottom: 10px;
			left: 10px;
			z-index: 999;
			width: min-content;
			height: min-content;
		}
	}

	/* Use CSS custom properties for better dark mode control */
	@media (prefers-color-scheme: dark) {
		.map {
			/* Consider using a dark tile layer instead of CSS filters for better performance */
			filter: invert(1) brightness(1) hue-rotate(180deg);
		}
	}
</style>
