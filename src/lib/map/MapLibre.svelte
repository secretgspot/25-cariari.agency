<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/env';
	import { get } from 'svelte/store';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { effectiveTheme, settings } from '#lib/settings/settings.js';
	import { formatLargeNumber } from '#lib/utils/formatters.js';
	import {
		isMarkerSelected,
		isValidMarker,
		getPropertyMarkerBackground,
	} from '#lib/utils/mapUtils.js';
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';
	import { enableWakeLock, disableWakeLock } from '#lib/utils/helpers.js';

	let { markers = [], selectedId = null, onSelected, onDeselect } = $props();

	let mapElement;
	let mapInstance = null;
	let resizeObserver;
	let popup = null;
	let currentLayer = 'default';
	let currentTheme = 'light';
	let gpsWatchId = null;
	let gpsMarker = null;
	let gpsButton = null;
	let isLocating = false;
	let pinnedTooltipMarker = null;
	let markerLayers = [];
	let lastMarkerSignature = '';
	let lastSelectedId = null;
	let freshnessInterval = null;
	let preSelectionZoom = null;

	const defaultCenter = [-84.16046, 9.97088];
	const maxBounds = [
		[-84.1789, 9.962],
		[-84.1423, 9.9802],
	];

	const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';
	const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';
	const MAP_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="18" height="18"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="m180 440-148-80V72l148 80 152-80 148 80v288l-148-80-152 80Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="M180 152v288M332 72v288"/></svg>`;
	const SATELLITE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="18" height="18"><circle cx="256" cy="256" r="180" stroke="currentColor" stroke-width="36"/><ellipse cx="256" cy="256" rx="90" ry="180" stroke="currentColor" stroke-width="30"/><path stroke="currentColor" stroke-width="30" d="M80 256h352M108 160h296M108 352h296"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36" d="M420 110 A 240 100 45 0 1 92 402"/><circle cx="420" cy="110" r="22" fill="var(--accent)"/></svg>`;
	const GPS_TARGET_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="21" height="21"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="50" d="M256 484c125.92 0 228-102.08 228-228 0-125.921-102.08-228-228-228C130.079 28 28 130.079 28 256c0 125.92 102.079 228 228 228Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256.001 302.546c25.707 0 46.545-20.839 46.545-46.546 0-25.706-20.838-46.545-46.545-46.545S209.455 230.294 209.455 256c0 25.707 20.839 46.546 46.546 46.546Z"/></svg>`;
	const GPS_FOUND_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="21" height="21"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="30" d="M256 490c129.234 0 234-104.766 234-234 0-129.235-104.766-234-234-234C126.765 22 22 126.765 22 256c0 129.234 104.765 234 234 234Z"/><path stroke="var(--accent)" stroke-linecap="round" stroke-linejoin="round" stroke-width="180" d="M256 346c49.707 0 90-40.293 90-90 0-49.706-40.293-90-90-90-49.706 0-90 40.294-90 90 0 49.707 40.294 90 90 90Z"/></svg>`;

	function buildSatelliteStyle() {
		return {
			version: 8,
			sources: {
				'esri-satellite': {
					type: 'raster',
					tiles: [
						'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
					],
					tileSize: 256,
					attribution:
						'© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
				},
			},
			layers: [{ id: 'esri-satellite-layer', type: 'raster', source: 'esri-satellite' }],
		};
	}

	function handleStyleImageMissing({ id }) {
		if (id !== 'wood-pattern' || mapInstance.hasImage(id)) return;

		const size = 8;
		const data = new Uint8Array(size * size * 4);
		for (let y = 0; y < size; y += 1) {
			for (let x = 0; x < size; x += 1) {
				const index = (y * size + x) * 4;
				const grain = (x + y) % 4 === 0;
				data[index] = grain ? 58 : 38;
				data[index + 1] = grain ? 58 : 38;
				data[index + 2] = grain ? 58 : 38;
				data[index + 3] = 160;
			}
		}
		mapInstance.addImage(id, { width: size, height: size, data });
	}

	function updateLayerButton(button) {
		const switchingToSatellite = currentLayer === 'default';
		button.innerHTML = `
		<span class="layer-icon">${switchingToSatellite ? SATELLITE_ICON : MAP_ICON}</span>
		<span class="layer-label">${switchingToSatellite ? 'Satellite' : 'Default'}</span>
	`;
		const label = `Switch to ${switchingToSatellite ? 'Satellite' : 'Default'} view`;
		button.setAttribute('aria-label', label);
		button.title = label;
	}

	function updateGpsButton() {
		if (!gpsButton) return;
		gpsButton.innerHTML = isLocating ? GPS_FOUND_ICON : GPS_TARGET_ICON;
		gpsButton.setAttribute('aria-pressed', String(isLocating));
		gpsButton.setAttribute(
			'aria-label',
			isLocating ? 'Stop GPS tracking' : 'Start GPS tracking',
		);
		gpsButton.title = isLocating ? 'Stop GPS tracking' : 'Start GPS tracking';
	}

	function handleGpsPosition(position) {
		const { latitude, longitude } = position.coords;
		if (!mapInstance) return;
		const coordinates = [longitude, latitude];
		if (gpsMarker) {
			gpsMarker.setLngLat(coordinates);
		} else {
			const element = document.createElement('span');
			element.className = 'gps-marker-art';
			gpsMarker = new maplibregl.Marker({ element, anchor: 'center' })
				.setLngLat(coordinates)
				.addTo(mapInstance);
		}
		mapInstance.jumpTo({ center: coordinates, zoom: 18 });
	}

	function handleGpsError(error) {
		if (error.code === 2) return;
		console.error('GPS error:', error);
		if (error.code === 1) stopGpsTracking();
	}

	async function stopGpsTracking() {
		if (gpsWatchId !== null) navigator.geolocation.clearWatch(gpsWatchId);
		gpsWatchId = null;
		isLocating = false;
		if (gpsMarker) {
			gpsMarker.remove();
			gpsMarker = null;
		}
		updateGpsButton();
		await disableWakeLock();
	}

	async function toggleGpsTracking() {
		if (gpsWatchId !== null) {
			await stopGpsTracking();
			return;
		}
		if (!navigator.geolocation) return;

		isLocating = true;
		updateGpsButton();
		await enableWakeLock();
		gpsWatchId = navigator.geolocation.watchPosition(handleGpsPosition, handleGpsError, {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		});
	}

	function resolveThemeMode() {
		if (typeof window === 'undefined') return 'light';
		const theme = get(settings)?.theme ?? 'System';
		if (theme === 'Dark') return 'dark';
		if (theme === 'Light') return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	function resolveStyle(layerName = currentLayer) {
		if (layerName === 'satellite') return buildSatelliteStyle();
		return resolveThemeMode() === 'dark' ? DARK_STYLE : LIGHT_STYLE;
	}

	function getSelectedMarker() {
		return (markers ?? []).find(
			(marker) =>
				marker.id === selectedId ||
				(marker.msl && marker.msl.toLowerCase() === String(selectedId).toLowerCase()),
		);
	}

	function centerMapOnMarker(marker, animate = true) {
		if (!mapInstance || !marker?.location) return;
		const lng = Number(marker.location.lng);
		const lat = Number(marker.location.lat);
		if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
		let offsetX = 0;
		let offsetY = 0;
		if (window.innerWidth >= 768 && window.innerWidth < 1200) {
			offsetX = 100;
		}
		const camera = {
			center: [lng, lat],
			zoom: 18,
			offset: [-offsetX, -offsetY],
		};
		if (animate) {
			mapInstance.flyTo({ ...camera, duration: 350, essential: true });
		} else {
			mapInstance.jumpTo(camera);
		}
	}

	function rememberMapView() {
		if (!mapInstance || preSelectionZoom !== null) return;
		preSelectionZoom = mapInstance.getZoom();
	}

	function restoreMapView() {
		if (!mapInstance || preSelectionZoom === null) return;

		const zoom = preSelectionZoom;
		preSelectionZoom = null;
		mapInstance.easeTo({ zoom, duration: 350, essential: true });
	}

	function removeTooltip() {
		if (!popup) return;
		popup.remove();
		popup = null;
	}

	function showMarkerTooltip(marker) {
		removeTooltip();
		const propertyFor = Array.isArray(marker.property_for)
			? marker.property_for.join(', ')
			: marker.property_for || 'N/A';
		const price = marker.price ? ` ${formatLargeNumber(marker.price)}` : '';
		const content = document.createElement('div');
		content.className = 'map-tooltip';
		content.textContent = `${marker.msl || 'N/A'} - ${propertyFor}${price}`;
		popup = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			focusAfterOpen: false,
			offset: [0, -10],
		})
			.setLngLat([Number(marker.location.lng), Number(marker.location.lat)])
			.setDOMContent(content)
			.addTo(mapInstance);
	}

	function handleMarkerMouseLeave() {
		if (pinnedTooltipMarker) {
			showMarkerTooltip(pinnedTooltipMarker);
		} else {
			removeTooltip();
		}
	}

	function updateMarkerSelectionState() {
		for (const item of markerLayers) {
			const button = item?.element;
			if (!button) continue;
			const isSelected = Boolean(
				selectedId &&
					(item.id === selectedId ||
						(item.msl && item.msl.toLowerCase() === String(selectedId).toLowerCase())),
			);
			button.classList.toggle('is-selected', isSelected);
		}
	}

	function getMarkerSignature(markersList = []) {
		return (markersList ?? [])
			.map((marker) => {
				const propertyFor = Array.isArray(marker.property_for)
					? marker.property_for.join(',')
					: String(marker.property_for || '');
				return [
					marker.id,
					marker.msl || '',
					propertyFor,
					marker.location?.lat ?? '',
					marker.location?.lng ?? '',
					marker.created_at || '',
				].join('|');
			})
			.join(';');
	}

	function updateMarkerFreshness(now = Date.now()) {
		for (const item of markerLayers) {
			item.artwork.style.background = getPropertyMarkerBackground(
				item.propertyFor,
				item.createdAt,
				now,
			);
		}
	}

	function syncMarkers() {
		if (!mapInstance) return;

		for (const item of markerLayers) {
			item.instance.remove();
		}
		markerLayers = [];

		const validMarkers = (markers ?? []).filter(isValidMarker);
		const now = Date.now();
		validMarkers.forEach((marker) => {
			const element = document.createElement('button');
			element.type = 'button';
			element.className = 'property-marker';
			element.title = marker.msl || 'Property';
			const propertyFor = Array.isArray(marker.property_for)
				? marker.property_for
				: String(marker.property_for || '')
						.split(',')
						.map((type) => type.trim())
						.filter(Boolean);
			element.setAttribute(
				'aria-label',
				`${marker.msl || 'Property'}: ${propertyFor.join(', ') || 'Listing type unavailable'}`,
			);
			element.style.border = 'none';
			element.style.width = '21px';
			element.style.height = '21px';
			element.style.cursor = 'pointer';
			element.style.padding = '0';
			element.style.backgroundColor = 'transparent';

			const artwork = document.createElement('span');
			artwork.className = 'property-marker-art';
			artwork.style.background = getPropertyMarkerBackground(
				propertyFor,
				marker.created_at,
				now,
			);
			element.appendChild(artwork);

			const instance = new maplibregl.Marker({ element, anchor: 'center' })
				.setLngLat([Number(marker.location.lng), Number(marker.location.lat)])
				.addTo(mapInstance);

			element.addEventListener('mouseenter', () => showMarkerTooltip(marker));
			element.addEventListener('mouseleave', handleMarkerMouseLeave);
			element.addEventListener('click', (event) => {
				event.stopPropagation();
				if (isMarkerSelected(marker.id, marker.msl, selectedId)) {
					pinnedTooltipMarker = null;
					removeTooltip();
				} else {
					pinnedTooltipMarker = marker;
					showMarkerTooltip(marker);
				}
				playButtonSound('click');
				vibrateButton('click');
				const isAlreadySelected = isMarkerSelected(marker.id, marker.msl, selectedId);
				if (isAlreadySelected) {
					restoreMapView();
				} else {
					rememberMapView();
				}
				if (onSelected) onSelected(marker.id);
				if (!isAlreadySelected) centerMapOnMarker(marker);
				updateMarkerSelectionState();
			});

			markerLayers.push({
				id: marker.id,
				msl: marker.msl,
				element,
				artwork,
				propertyFor,
				createdAt: marker.created_at,
				instance,
			});
		});

		lastMarkerSignature = getMarkerSignature(markers ?? []);
		updateMarkerSelectionState();
	}

	function setLayerStyle(nextLayer) {
		currentLayer = nextLayer;
		currentTheme = resolveThemeMode();
		if (!mapInstance) return;
		mapInstance.setStyle(resolveStyle(nextLayer));
		mapInstance.once('style.load', () => {
			syncMarkers();
			updateMarkerSelectionState();
		});
	}

	function createLayerToggleControl() {
		if (!mapInstance) return;

		const control = {
			onAdd() {
				const container = document.createElement('div');
				container.className = 'maplibregl-ctrl map-custom-control';
				const button = document.createElement('button');
				button.type = 'button';
				button.className = 'map-action-button layer-toggle-btn';
				updateLayerButton(button);
				button.addEventListener('click', () => {
					playButtonSound('click');
					vibrateButton('click');
					const nextLayer = currentLayer === 'satellite' ? 'default' : 'satellite';
					settings.update((state) => ({ ...state, map_layer: nextLayer }));
					setLayerStyle(nextLayer);
					updateLayerButton(button);
				});
				container.appendChild(button);
				return container;
			},
			onRemove() {},
		};

		mapInstance.addControl(control, 'bottom-right');
	}

	function createGpsControl() {
		const control = {
			onAdd() {
				const container = document.createElement('div');
				container.className = 'maplibregl-ctrl map-custom-control';
				gpsButton = document.createElement('button');
				gpsButton.type = 'button';
				gpsButton.className = 'map-action-button gps-toggle-btn';
				updateGpsButton();
				gpsButton.disabled = !navigator.geolocation;
				gpsButton.addEventListener('click', (event) => {
					event.stopPropagation();
					toggleGpsTracking();
				});
				container.appendChild(gpsButton);
				return container;
			},
			onRemove() {
				gpsButton = null;
			},
		};
		mapInstance.addControl(control, 'bottom-left');
	}

	function initializeMap() {
		const initialSettings = get(settings);
		currentLayer = initialSettings?.map_layer === 'satellite' ? 'satellite' : 'default';
		currentTheme = resolveThemeMode();
		mapInstance = new maplibregl.Map({
			container: mapElement,
			style: resolveStyle(currentLayer),
			center: defaultCenter,
			zoom: 16,
			minZoom: 15,
			maxZoom: 18,
			maxBounds,
			attributionControl: false,
			dragRotate: false,
			touchPitch: false,
			renderWorldCopies: false,
		});
		mapInstance.on('styleimagemissing', handleStyleImageMissing);

		createLayerToggleControl();
		createGpsControl();

		mapInstance.on('load', () => {
			syncMarkers();
			updateMarkerSelectionState();
			if (selectedId) {
				const selectedMarker = getSelectedMarker();
				if (selectedMarker?.location) {
					pinnedTooltipMarker = selectedMarker;
					rememberMapView();
					centerMapOnMarker(selectedMarker);
					showMarkerTooltip(selectedMarker);
				}
			}
		});

		mapInstance.on('click', () => {
			pinnedTooltipMarker = null;
			removeTooltip();
			restoreMapView();
			if (onDeselect) onDeselect();
		});
	}

	onMount(() => {
		if (!browser || !mapElement) return;

		initializeMap();
		if (window.ResizeObserver) {
			resizeObserver = new ResizeObserver(() => {
				mapInstance?.resize();
				const selectedMarker = getSelectedMarker();
				if (selectedMarker) centerMapOnMarker(selectedMarker, false);
			});
			resizeObserver.observe(mapElement);
		}

		const unsubscribe = settings.subscribe((state) => {
			if (!mapInstance) return;
			const nextLayer = state?.map_layer === 'satellite' ? 'satellite' : 'default';
			if (nextLayer !== currentLayer) {
				setLayerStyle(nextLayer);
			}
		});

		const unsubscribeTheme = effectiveTheme.subscribe((theme) => {
			if (!mapInstance || currentLayer === 'satellite' || theme === currentTheme) return;
			currentTheme = theme;
			mapInstance.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
			mapInstance.once('style.load', () => {
				syncMarkers();
				updateMarkerSelectionState();
			});
		});
		freshnessInterval = setInterval(updateMarkerFreshness, 24 * 60 * 60 * 1000);

		return () => {
			unsubscribe();
			unsubscribeTheme();
			if (freshnessInterval) clearInterval(freshnessInterval);
			if (resizeObserver) resizeObserver.disconnect();
		};
	});

	$effect(() => {
		if (!mapInstance) return;

		const markerSignature = getMarkerSignature(markers ?? []);
		if (markerSignature !== lastMarkerSignature) {
			syncMarkers();
		}

		if (selectedId !== lastSelectedId) {
			lastSelectedId = selectedId;
			if (!selectedId) {
				pinnedTooltipMarker = null;
				removeTooltip();
				restoreMapView();
			} else {
				const selectedMarker = getSelectedMarker();
				if (selectedMarker) {
					pinnedTooltipMarker = selectedMarker;
					showMarkerTooltip(selectedMarker);
				}
			}
			updateMarkerSelectionState();
		}

		updateMarkerSelectionState();
	});

	onDestroy(() => {
		removeTooltip();
		if (gpsWatchId !== null) navigator.geolocation.clearWatch(gpsWatchId);
		if (gpsMarker) gpsMarker.remove();
		disableWakeLock();
		for (const item of markerLayers) item.instance.remove();
		if (mapInstance) mapInstance.remove();
		if (resizeObserver) resizeObserver.disconnect();
	});
</script>

<div class="map" bind:this={mapElement}></div>

<style>
	@import './maplibre-gl.css';

	.map {
		height: 100%;
		width: 100%;
		min-height: 200px;
		min-width: 200px;
		z-index: 1;
	}

	:global(.property-marker) {
		background-color: transparent;
		filter: drop-shadow(0 8px 16px rgba(15, 23, 42, 0.25));
	}

	:global(.property-marker-art) {
		position: absolute;
		inset: 0;
		border: 1px solid rgba(255, 255, 255, 0.85);
		border-radius: 50%;
		box-sizing: border-box;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
		transition:
			transform 150ms ease,
			background 300ms ease;
	}

	:global(.property-marker.is-selected .property-marker-art) {
		transform: scale(1.12);
	}

	:global(.property-marker.is-selected) {
		filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0))
			drop-shadow(0 14px 20px rgba(212, 175, 55, 0.4));
	}

	:global(.map-tooltip) {
		padding: 0.35rem 0.5rem;
		border-radius: 3px;
		background: #fff;
		color: #222;
		font-size: 0.72rem;
		font-weight: 600;
		line-height: 1.3;
	}

	:global(.maplibregl-popup) {
		z-index: 30;
	}

	:global(.map-custom-control) {
		background: none;
		border: 0;
		box-shadow: none;
	}

	:global(.map-action-button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		min-height: 38px;
		box-sizing: border-box;
		background: var(--surface-1, #1e1e1e);
		color: var(--text-1, #f0f0f0);
		border: 1px solid var(--surface-4, rgba(255, 255, 255, 0.2));
		border-radius: var(--radius-2, 6px);
		padding: 6px 12px;
		font-family: inherit;
		font-size: var(--font-size-0, 0.85rem);
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		box-shadow: var(--shadow-2, 0 3px 6px rgba(0, 0, 0, 0.2));
		backdrop-filter: blur(8px);
		transition:
			background 150ms ease,
			border-color 150ms ease,
			transform 150ms ease;
	}

	:global(.map-action-button:hover:not(:disabled)) {
		background: var(--surface-2, #2a2a2a);
		border-color: var(--accent, #d4af37);
		transform: translateY(-1px);
	}

	:global(.map-action-button:active:not(:disabled)) {
		transform: scale(0.96);
	}

	:global(.map-action-button:disabled) {
		cursor: not-allowed;
		opacity: 0.55;
	}

	:global(.layer-toggle-btn .layer-icon) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	:global(.layer-toggle-btn .layer-label) {
		letter-spacing: 0.02em;
	}

	:global(.gps-toggle-btn) {
		width: 38px;
		height: 38px;
		padding: 6px;
	}

	:global(.gps-marker-art) {
		display: block;
		width: 21px;
		height: 21px;
		background: url('/map/default.svg') center / contain no-repeat;
	}
</style>
