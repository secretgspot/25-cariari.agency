<script>
	import { onMount, onDestroy } from 'svelte';
	import {
		enableWakeLock,
		disableWakeLock,
		prefersDarkTheme,
	} from '#lib/utils/helpers.js';
	import {
		isValidMarker,
		getPropertyIconName,
		isMarkerSelected,
	} from '#lib/utils/mapUtils.js';
	import { formatLargeNumber } from '#lib/utils/formatters.js';
	import { browser } from '$app/env';
	import { settings } from '#lib/settings/settings.js';
	import { get } from 'svelte/store';
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';

	// --- State ---
	let { markers = [], onSelected, onDeselect, selectedId = null } = $props();
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

	function addMarkers() {
		if (!markersLayer) return;
		markersLayer.clearLayers();

		const validMarkers = markers.filter(isValidMarker);

		validMarkers.forEach(({ id, msl, property_for, location, price }) => {
			const iconName = getPropertyIconName(property_for);
			const isCurrent = isMarkerSelected(id, msl, selectedId);
			const marker = L.marker([location.lat, location.lng], {
				property_id: id,
				property_msl: msl,
				icon: icons[iconName] || icons.default,
				zIndexOffset: isCurrent ? 1000 : 0,
			});
			const tooltipText = `${msl || 'N/A'} - ${Array.isArray(property_for) ? property_for.join(', ') : property_for || 'N/A'}${price ? ` ${formatLargeNumber(price)}` : ''}`;

			marker.bindTooltip(tooltipText, {
				permanent: false,
				direction: 'top',
				offset: [0, -10],
			});

			marker.on('click', (e) => {
				L.DomEvent.stopPropagation(e);
				playButtonSound('click');
				vibrateButton('click');
				if (onSelected && e.target.options.property_id) {
					onSelected(e.target.options.property_id);
				}
				map.setView(e.target.getLatLng(), 18, { animate: true, pan: { duration: 0.3 } });
			});

			markersLayer.addLayer(marker);
			if (isCurrent) {
				const el = marker.getElement?.();
				if (el) el.classList.add('is-selected');
			}
		});
	}

	function updateSelectedMarker() {
		if (!markersLayer) return;
		markersLayer.eachLayer((layer) => {
			const el = layer.getElement?.();
			if (!el) return;
			const isCurrent = isMarkerSelected(
				layer.options?.property_id,
				layer.options?.property_msl,
				selectedId,
			);
			if (isCurrent) {
				el.classList.add('is-selected');
				layer.setZIndexOffset(1000);
			} else {
				el.classList.remove('is-selected');
				layer.setZIndexOffset(0);
			}
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

				const targetIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="21" height="21"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="50" d="M256 484c125.92 0 228-102.08 228-228 0-125.921-102.08-228-228-228C130.079 28 28 130.079 28 256c0 125.92 102.079 228 228 228Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256.001 302.546c25.707 0 46.545-20.839 46.545-46.546 0-25.706-20.838-46.545-46.545-46.545S209.455 230.294 209.455 256c0 25.707 20.839 46.546 46.546 46.546Z"/></svg>`;
				const targetFoundIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="21" height="21"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256 490c129.234 0 234-104.766 234-234 0-129.235-104.766-234-234-234C126.765 22 22 126.765 22 256c0 129.234 104.765 234 234 234Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="180" d="M256 346c49.707 0 90-40.293 90-90 0-49.706-40.293-90-90-90-49.706 0-90 40.294-90 90 0 49.707 40.294 90 90 90Z"/></svg>`;

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
			? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
			: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';

		const defaultLayer = L.tileLayer(tileUrl, {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
		});
		const satelliteLayer = L.tileLayer(
			'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
			{ minZoom: 15, maxZoom: 18 },
		);

		const currentSettings = get(settings);
		let currentLayer = currentSettings.map_layer || 'default';
		const initialBaseLayer = currentLayer === 'satellite' ? satelliteLayer : defaultLayer;

		markersLayer = L.layerGroup();
		map = L.map(mapElement, {
			center,
			zoom: 16,
			maxBounds,
			maxBoundsViscosity: 0.8,
			layers: [initialBaseLayer, markersLayer],
			zoomControl: false,
			attributionControl: false,
			preferCanvas: true,
		});

		function createLayerToggleControl() {
			const LayerToggleControl = L.Control.extend({
				options: { position: 'bottomright' },
				onAdd: function () {
					const container = L.DomUtil.create('div', 'leaflet-control-layer-toggle');
					const button = L.DomUtil.create('button', 'layer-toggle-btn', container);
					button.type = 'button';

					const mapIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="18" height="18"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="m180 440-148-80V72l148 80 152-80 148 80v288l-148-80-152 80Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="M180 152v288M332 72v288"/></svg>`;
					const satelliteIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="18" height="18"><circle cx="256" cy="256" r="180" stroke="currentColor" stroke-width="36"/><ellipse cx="256" cy="256" rx="90" ry="180" stroke="currentColor" stroke-width="30"/><path stroke="currentColor" stroke-width="30" d="M80 256h352M108 160h296M108 352h296"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="M420 110 A 240 100 45 0 1 92 402"/><circle cx="420" cy="110" r="22" fill="var(--accent)"/></svg>`;

					function updateButtonUI() {
						if (currentLayer === 'default') {
							button.innerHTML = `
								<span class="layer-icon">${satelliteIcon}</span>
								<span class="layer-label">Satellite</span>
							`;
							button.setAttribute('aria-label', 'Switch to Satellite view');
							button.setAttribute('title', 'Switch to Satellite view');
						} else {
							button.innerHTML = `
								<span class="layer-icon">${mapIcon}</span>
								<span class="layer-label">Default</span>
							`;
							button.setAttribute('aria-label', 'Switch to Default view');
							button.setAttribute('title', 'Switch to Default view');
						}
					}

					updateButtonUI();

					L.DomEvent.disableClickPropagation(container);
					L.DomEvent.on(button, 'click', (e) => {
						L.DomEvent.stop(e);
						playButtonSound('click');
						vibrateButton('click');
						if (currentLayer === 'default') {
							map.removeLayer(defaultLayer);
							map.addLayer(satelliteLayer);
							currentLayer = 'satellite';
						} else {
							map.removeLayer(satelliteLayer);
							map.addLayer(defaultLayer);
							currentLayer = 'default';
						}
						settings.update((s) => ({ ...s, map_layer: currentLayer }));
						updateButtonUI();
					});

					return container;
				},
			});
			map.addControl(new LayerToggleControl());
		}

		createLayerToggleControl();

		createToggleControl();

		// Add resize observer
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(mapElement);
		}

		// Handle map background clicks (deselect property)
		map.on('click', () => {
			if (onDeselect) onDeselect();
		});

		// Add markers once map is ready
		map.whenReady(() => {
			addMarkers();
			map.invalidateSize();
			if (selectedId) {
				const target = markers.find(
					(m) =>
						m.id === selectedId ||
						(m.msl && m.msl.toLowerCase() === String(selectedId).toLowerCase()),
				);
				if (target?.location?.lat && target?.location?.lng) {
					map.setView([target.location.lat, target.location.lng], 18);
				}
			}
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

	let previousMarkers;

	// Reactively sync markers and active marker styling
	$effect(() => {
		if (!map || !markersLayer) return;

		if (markers !== previousMarkers) {
			previousMarkers = markers;
			addMarkers();
		}
		updateSelectedMarker();
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

	:global(.leaflet-control-layer-toggle) {
		margin-right: var(--size-3, 12px) !important;
		margin-bottom: var(--size-3, 12px) !important;
		background: none !important;
		border: none !important;
		box-shadow: none !important;
	}

	:global(.layer-toggle-btn) {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: var(--surface-1, #1e1e1e);
		color: var(--text-1, #f0f0f0);
		border: var(--border-size-1, 1px) solid var(--surface-4, rgba(255, 255, 255, 0.2));
		border-radius: var(--radius-2, 6px);
		padding: var(--size-2, 6px) var(--size-3, 12px);
		font-family: inherit;
		font-size: var(--font-size-0, 0.85rem);
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		box-shadow: var(--shadow-2, 0 3px 6px rgba(0, 0, 0, 0.2));
		backdrop-filter: blur(8px);
		transition:
			background var(--transition, 0.15s ease),
			border-color var(--transition, 0.15s ease),
			transform var(--transition, 0.15s ease);
	}

	:global(.layer-toggle-btn:hover) {
		background: var(--surface-2, #2a2a2a);
		border-color: var(--accent, #d4af37);
		transform: translateY(-1px);
	}

	:global(.layer-toggle-btn:active) {
		transform: scale(0.96);
	}

	:global(.layer-toggle-btn .layer-icon) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	:global(.layer-toggle-btn .layer-label) {
		letter-spacing: 0.02em;
	}

	:global(.leaflet-marker-icon.is-selected) {
		outline: 3px solid var(--accent, #d4af37) !important;
		outline-offset: 3px !important;
		border-radius: 50% !important;
		filter: drop-shadow(0 0 8px var(--accent, #d4af37)) !important;
		animation: marker-outline-pulse 1.6s infinite ease-in-out !important;
		z-index: 1000 !important;
	}

	@keyframes marker-outline-pulse {
		0%,
		100% {
			outline-color: var(--accent, #d4af37);
			outline-offset: 2px;
			box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.75);
		}
		50% {
			outline-color: #ffffff;
			outline-offset: 5px;
			box-shadow: 0 0 0 8px rgba(212, 175, 55, 0);
		}
	}
</style>
