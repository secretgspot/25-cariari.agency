<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		enableWakeLock,
		disableWakeLock,
		prefersDarkTheme,
	} from '$lib/utils/helpers.js';
	import { isEmpty } from '$lib/utils/validators.js';
	import { formatLargeNumber } from '$lib/utils/formatters.js';
	import { browser } from '$app/environment';
	// import { playButtonSound } from '$lib/utils/audio.js';

	// --- State ---
	let { markers = [], onSelected } = $props();
	let mapElement;
	let map = $state(null);
	let L = $state(null);
	let userMarker = $state(null);
	let watchId = $state(null);
	let isLocating = $state(false);
	let resizeObserver;
	let resizeTimeout;
	let markersLayer = $state(null);

	const icons = {};
	const maxBounds = [
		[9.962, -84.1789],
		[9.9802, -84.1423],
	];
	const center = [9.97088, -84.16046];

	function createIcon(url) {
		return L.icon({
			iconUrl: url,
			iconSize: [21, 21],
			iconAnchor: [10, 10],
			tooltipAnchor: [0, 0],
		});
	}

	function getIconName(propertyFor) {
		if (Array.isArray(propertyFor))
			return propertyFor.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
		return typeof propertyFor === 'string'
			? propertyFor.replace(/[^a-zA-Z0-9_]/g, '_')
			: 'default';
	}

	function addMarkers() {
		if (!markersLayer) return;
		markersLayer.clearLayers();

		const validMarkers = markers.filter(
			(m) =>
				m?.id &&
				m?.location &&
				!isEmpty(m.location.lat) &&
				!isEmpty(m.location.lng) &&
				!isNaN(Number(m.location.lat)) &&
				!isNaN(Number(m.location.lng)) &&
				m.is_active,
		);

		validMarkers.forEach(({ id, msl, property_for, location, price }) => {
			const iconName = getIconName(property_for);
			const marker = L.marker([location.lat, location.lng], {
				property_id: id,
				icon: icons[iconName] || icons.default,
			});

			const tooltipText = `${msl || 'N/A'} - ${
				Array.isArray(property_for) ? property_for.join(', ') : property_for || 'N/A'
			}${price ? ` ${formatLargeNumber(price)}` : ''}`;

			marker.bindTooltip(tooltipText, {
				permanent: false,
				direction: 'top',
				offset: [0, -10],
			});
			marker.on('click', (e) => {
				// playButtonSound('click');
				if (onSelected && e.target.options.property_id) {
					onSelected(e.target.options.property_id);
				}
				map.setView(e.target.getLatLng(), 18, { animate: true, pan: { duration: 0.3 } });
			});

			markersLayer.addLayer(marker);
		});
	}

	function gpsCallback(position) {
		const { latitude, longitude } = position.coords;
		if (!map) return;
		if (userMarker) {
			userMarker.setLatLng([latitude, longitude]);
		} else {
			userMarker = L.marker([latitude, longitude], { icon: icons.default }).addTo(map);
		}
		map.setView([latitude, longitude], 18);
	}

	function gpsError(error) {
		if (error.code === 2) return; // Ignore POSITION_UNAVAILABLE
		console.error('GPS error:', error);
		if (error.code === 1) {
			isLocating = false;
			disableWakeLock();
		}
	}

	async function toggleGPS() {
		if (watchId) {
			navigator.geolocation.clearWatch(watchId);
			watchId = null;
			isLocating = false;
			if (userMarker && map) {
				map.removeLayer(userMarker);
				userMarker = null;
			}
			await disableWakeLock();
		} else {
			isLocating = true;
			await enableWakeLock();
			watchId = navigator.geolocation.watchPosition(gpsCallback, gpsError, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			});
		}
	}

	function handleResize() {
		if (resizeTimeout) clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			if (map) map.invalidateSize();
		}, 100);
	}

	function createToggleControl() {
		const ToggleControl = L.Control.extend({
			options: { position: 'bottomleft' },
			onAdd: function () {
				const container = L.DomUtil.create('div', 'leaflet-control-toggle toggle');
				const toggle = L.DomUtil.create('input', 'tgl flip', container);
				const label = L.DomUtil.create('label', 'gps-toggle-label', container);

				toggle.type = 'checkbox';
				toggle.id = 'gps-toggle';
				toggle.checked = isLocating;
				label.htmlFor = 'gps-toggle';

				const targetIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="27" height="27"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="50" d="M256 484c125.92 0 228-102.08 228-228 0-125.921-102.08-228-228-228C130.079 28 28 130.079 28 256c0 125.92 102.079 228 228 228Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256.001 302.546c25.707 0 46.545-20.839 46.545-46.546 0-25.706-20.838-46.545-46.545-46.545S209.455 230.294 209.455 256c0 25.707 20.839 46.546 46.546 46.546Z"/></svg>`;
				const targetFoundIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="27" height="27"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256 490c129.234 0 234-104.766 234-234 0-129.235-104.766-234-234-234C126.765 22 22 126.765 22 256c0 129.234 104.765 234 234 234Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="60" d="M256.001 303.77c26.383 0 47.77-21.387 47.77-47.77 0-26.383-21.387-47.771-47.77-47.771-26.383 0-47.771 21.388-47.771 47.771s21.388 47.77 47.771 47.77Z"/></svg>`;

				label.innerHTML = isLocating ? targetFoundIcon : targetIcon;

				L.DomEvent.disableClickPropagation(container);
				L.DomEvent.on(toggle, 'change', (e) => {
					label.innerHTML = e.target.checked ? targetFoundIcon : targetIcon;
					toggleGPS();
				});

				return container;
			},
		});
		map.addControl(new ToggleControl());
	}

	onMount(async () => {
		if (!browser) return;

		L = await import('leaflet');

		// Create icons
		Object.assign(icons, {
			Sale: createIcon('/map/Sale.svg'),
			Rent: createIcon('/map/Rent.svg'),
			Sale_Rent: createIcon('/map/Sale_Rent.svg'),
			default: createIcon('/map/default.svg'),
		});

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
		 * https://tiles.stadiamapis.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg
		 * https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
		 * http://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}
		 * http://{s}.tile.osm.org/{z}/{x}/{y}.png
		 */

		// Create map
		const isDark = prefersDarkTheme();
		const tileUrl = isDark
			? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.jpg'
			: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.jpg';

		const defaultLayer = L.tileLayer(tileUrl, {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
		});
		const satelliteLayer = L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{ minZoom: 15, maxZoom: 18 },
		);

		markersLayer = L.layerGroup();
		map = L.map(mapElement, {
			center,
			zoom: 16,
			maxBounds,
			maxBoundsViscosity: 0.8,
			layers: [defaultLayer, markersLayer],
			zoomControl: false,
			attributionControl: false,
			preferCanvas: true,
		});

		// Add controls
		L.control
			.layers({ Default: defaultLayer, Satellite: satelliteLayer }, null, {
				position: 'bottomright',
			})
			.addTo(map);

		createToggleControl();

		// Add resize observer
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(mapElement);
		}

		// Add markers once map is ready
		map.whenReady(() => {
			addMarkers();
			map.invalidateSize();
			console.log('🗺 Map is ready');
		});
	});

	onDestroy(() => {
		if (watchId) navigator.geolocation.clearWatch(watchId);
		disableWakeLock();
		if (resizeTimeout) clearTimeout(resizeTimeout);
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
		if (map) map.remove();
	});

	// Reactively update markers when markers prop changes
	$effect(() => {
		if (map && markersLayer) {
			addMarkers();
		}
	});
</script>

<div class="map" bind:this={mapElement}></div>

<style>
	@import './leaflet.css';

	.map {
		height: 100%;
		width: 100%;
		min-height: 369px;
		min-width: 369px;
		z-index: 1;
	}

	:global(.leaflet-control-toggle) {
		background: none !important;
		border: none !important;
		box-shadow: none !important;
	}
</style>
