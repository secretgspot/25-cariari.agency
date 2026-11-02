<script>
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/env';
	import { get } from 'svelte/store';
	import maplibregl from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { effectiveTheme, settings } from '#lib/settings/settings.js';
	import Marker from '#lib/map/Marker.svelte';
	import MapControls from '#lib/map/MapControls.svelte';

	let { markers = [], selectedId = null, onSelected, onDeselect } = $props();

	let mapElement;
	let mapInstance = $state(null);
	let resizeObserver;
	let currentLayer = $state('default');
	let currentTheme = 'light';
	let preSelectionZoom = null;

	const defaultCenter = [-84.16046, 9.97088];
	const maxBounds = [
		[-84.1789, 9.962],
		[-84.1423, 9.9842],
	];

	const LIGHT_STYLE = 'https://tiles.openfreemap.org/styles/positron';
	const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

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

		const offsetX =
			window.innerWidth >= 768 && window.innerWidth < 1200 ? 100 : 0;
		const camera = {
			center: [lng, lat],
			zoom: 18,
			offset: [-offsetX, 0],
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

	function handleMarkerCenter(marker) {
		rememberMapView();
		centerMapOnMarker(marker);
	}

	function handleLayerChange(nextLayer) {
		settings.update((state) => ({ ...state, map_layer: nextLayer }));
	}

	function setLayerStyle(nextLayer) {
		if (nextLayer === currentLayer) return;
		currentLayer = nextLayer;
		currentTheme = resolveThemeMode();
		mapInstance?.setStyle(resolveStyle(nextLayer));
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
			pixelRatio: window.matchMedia('(pointer: coarse)').matches
				? Math.min(window.devicePixelRatio || 1, 1.5)
				: undefined,
			attributionControl: false,
			dragRotate: false,
			touchPitch: false,
			renderWorldCopies: false,
		});
		mapInstance.on('styleimagemissing', handleStyleImageMissing);
		mapInstance.on('load', () => {
			const selectedMarker = getSelectedMarker();
			if (!selectedMarker?.location) return;
			rememberMapView();
			centerMapOnMarker(selectedMarker);
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
			const nextLayer = state?.map_layer === 'satellite' ? 'satellite' : 'default';
			setLayerStyle(nextLayer);
		});
		const unsubscribeTheme = effectiveTheme.subscribe((theme) => {
			if (!mapInstance || currentLayer === 'satellite' || theme === currentTheme) return;
			currentTheme = theme;
			mapInstance.setStyle(theme === 'dark' ? DARK_STYLE : LIGHT_STYLE);
		});

		return () => {
			unsubscribe();
			unsubscribeTheme();
			resizeObserver?.disconnect();
		};
	});

	$effect(() => {
		if (!selectedId) restoreMapView();
	});

	onDestroy(() => {
		mapInstance?.remove();
	});
</script>

<div class="map-shell">
	<div class="map" bind:this={mapElement}></div>
	{#if mapInstance}
		<Marker
			map={mapInstance}
			{markers}
			{selectedId}
			{onSelected}
			{onDeselect}
			onMarkerCenter={handleMarkerCenter}
			onSelectionEnd={restoreMapView}
		/>
		<MapControls
			map={mapInstance}
			layer={currentLayer}
			onLayerChange={handleLayerChange}
		/>
	{/if}
</div>

<style>
	.map-shell {
		position: relative;
		height: 100%;
		width: 100%;
		min-height: 200px;
		min-width: 200px;
		z-index: 1;
	}

	.map {
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
	}
</style>
