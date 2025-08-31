<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import pkg from 'maplibre-gl';
	const { Map, Marker, GeolocateControl } = pkg;
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { isValidMarker, getPropertyIconName } from '$lib/utils/mapUtils.js';
	import { prefersDarkTheme } from '$lib/utils/helpers.js';

	/** @type {{markers: any[], onSelected: (id: string) => void}} */
	let { markers = [], onSelected } = $props();

	let mapElement;
	let mapInstance = $state(null);
	let isMapReady = $state(false);
	let currentOpenPopup = $state(null);

	// Style State
	const mapStyles = [
		{
			name: 'Lite',
			style: {
				version: 8,
				sources: {
					'carto-light': {
						type: 'raster',
						tiles: [
							'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
							'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
						],
						tileSize: 256,
						attribution: '© OpenStreetMap contributors, © CARTO',
					},
				},
				layers: [
					{
						id: 'carto-light-layer',
						type: 'raster',
						source: 'carto-light',
					},
				],
			},
		},
		{
			name: 'Dark',
			style: {
				version: 8,
				sources: {
					'carto-dark': {
						type: 'raster',
						tiles: [
							'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
							'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
							'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
							'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
						],
						tileSize: 256,
						attribution: '© OpenStreetMap contributors, © CARTO',
					},
				},
				layers: [
					{
						id: 'carto-dark-layer',
						type: 'raster',
						source: 'carto-dark',
					},
				],
			},
		},
		{
			name: 'Satellite',
			style: {
				version: 8,
				sources: {
					'arcgis-satellite': {
						type: 'raster',
						tiles: [
							'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
						],
						tileSize: 256,
						attribution:
							'© Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
					},
				},
				layers: [
					{
						id: 'arcgis-satellite-layer',
						type: 'raster',
						source: 'arcgis-satellite',
					},
				],
			},
		},
	];
	let currentStyle = $state(prefersDarkTheme() ? mapStyles[1] : mapStyles[0]);

	const handleMarkerClick = (property_id, lng, lat, tooltipText) => {
		if (onSelected && property_id) {
			onSelected(property_id);
		}

		if (currentOpenPopup) {
			currentOpenPopup.remove();
			currentOpenPopup = null;
		}

		if (mapInstance) {
			const lngLat = [lng, lat];
			mapInstance.flyTo({
				center: lngLat,
				zoom: 17,
				speed: 1.2,
				curve: 1,
				easing: (t) => t,
			});

			const popup = new pkg.Popup({
				offset: [0, -10],
				closeButton: false,
				closeOnClick: false,
			})
				.setLngLat(lngLat)
				.setHTML(`<div class="map-tooltip">${tooltipText}</div>`)
				.addTo(mapInstance);

			currentOpenPopup = popup;
		}
	};

	const updateMapMarkers = (newMarkers) => {
		if (!mapInstance || !isMapReady) return;

		const source = mapInstance.getSource('property-markers');
		if (!source) return;

		const validMarkers = newMarkers.filter(isValidMarker);

		const features = validMarkers.map((marker) => ({
			type: 'Feature',
			geometry: {
				type: 'Point',
				coordinates: [Number(marker.location.lng), Number(marker.location.lat)],
			},
			properties: {
				id: marker.id,
				msl: marker.msl,
				property_for: marker.property_for,
				icon: getPropertyIconName(marker.property_for),
			},
		}));

		source.setData({
			type: 'FeatureCollection',
			features,
		});
	};

	// Style Switcher Function
	const onStyleChange = (newStyle) => {
		currentStyle = newStyle;
		mapInstance.setStyle(newStyle.style);
	};

	class StyleControl {
		onAdd(map) {
			this._map = map;
			this._container = document.createElement('div');
			this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

			const select = document.createElement('select');
			select.className = 'maplibregl-ctrl-select';
			mapStyles.forEach((style) => {
				const option = document.createElement('option');
				option.value = style.name;
				option.textContent = style.name;
				if (style.name === currentStyle.name) {
					option.selected = true;
				}
				select.appendChild(option);
			});

			select.addEventListener('change', (e) => {
				const selectedStyle = mapStyles.find((s) => s.name === e.target.value);
				if (selectedStyle) {
					onStyleChange(selectedStyle);
				}
			});

			this._container.appendChild(select);
			return this._container;
		}

		onRemove() {
			if (this._container.parentNode) {
				this._container.parentNode.removeChild(this._container);
			}
			this._map = undefined;
		}
	}

	let resizeObserver;
	const handleResize = () => {
		if (mapInstance) {
			mapInstance.resize();
		}
	};

	let imageLoadPromise = null;
	async function loadImages(map) {
		if (!imageLoadPromise) {
			imageLoadPromise = (async () => {
				const iconNames = ['Sale', 'Rent', 'Sale_Rent', 'default'];
				for (const name of iconNames) {
					if (!map.hasImage(name)) {
						const url = `/map/${name}.svg`;
						try {
							const img = new Image(42, 42);
							img.src = url;
							await img.decode();
							map.addImage(name, img);
						} catch (error) {
							console.error(`Failed to load image: ${url}`, error);
						}
					}
				}
			})();
		}
		return imageLoadPromise;
	}

	async function setupMarkers(map) {
		await loadImages(map);

		if (!map.getSource('property-markers')) {
			map.addSource('property-markers', {
				type: 'geojson',
				data: { type: 'FeatureCollection', features: [] },
			});
		}

		if (!map.getLayer('property-markers-layer')) {
			map.addLayer({
				id: 'property-markers-layer',
				type: 'symbol',
				source: 'property-markers',
				layout: {
					'icon-image': ['get', 'icon'],
					'icon-size': 0.5,
					'icon-allow-overlap': true,
				},
			});

			map.on('click', 'property-markers-layer', (e) => {
				e.preventDefault();
				if (e.features && e.features.length > 0) {
					const feature = e.features[0];
					const { id, msl, property_for } = feature.properties;
					const coordinates = feature.geometry.coordinates.slice();
					const tooltipText = `${msl || 'N/A'} - ${
						Array.isArray(property_for) ? property_for.join(', ') : property_for || 'N/A'
					}`;

					while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
						coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
					}

					handleMarkerClick(id, coordinates[0], coordinates[1], tooltipText);
				}
			});

			map.on('mouseenter', 'property-markers-layer', () => {
				map.getCanvas().style.cursor = 'pointer';
			});

			map.on('mouseleave', 'property-markers-layer', () => {
				map.getCanvas().style.cursor = '';
			});
		}
	}

	function initializeMap() {
		const initialCenter = [-84.16046, 9.97088]; // from Map.svelte
		const maxBounds = [
			[-84.1789, 9.962],
			[-84.1423, 9.9802],
		]; // from Map.svelte

		mapInstance = new Map({
			container: mapElement,
			style: currentStyle.style,
			center: initialCenter,
			zoom: 16,
			minZoom: 15,
			maxZoom: 18,
			maxBounds: maxBounds,
			attributionControl: false,

			renderWorldCopies: false,
			dragRotate: false,
			touchPitch: false,
		});

		mapInstance.on('click', () => {
			if (currentOpenPopup) {
				currentOpenPopup.remove();
				currentOpenPopup = null;
			}
		});

		const geolocateControl = new GeolocateControl({
			positionOptions: {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 0,
			},
			trackUserLocation: true,
			showUserLocation: true,
		});
		mapInstance.addControl(geolocateControl, 'bottom-left');

		mapInstance.addControl(new StyleControl(), 'bottom-right');

		mapInstance.on('styledata', async () => {
			if (!isMapReady) {
				isMapReady = true;
				console.log('🗺 MapLibre GL Map is ready');
			}
			await setupMarkers(mapInstance);
			updateMapMarkers(markers);
			mapInstance.resize();
		});

		mapInstance.on('error', (e) => {
			console.error('MapLibre GL Map error:', e.error);
		});
	}

	onMount(async () => {
		if (!browser) return;

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
		if (isMapReady) {
			updateMapMarkers(markers);
		}
	});

	onDestroy(() => {
		try {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			if (mapInstance) {
				mapInstance.remove();
			}
		} catch (error) {
			console.error('Error during MapLibre GL cleanup:', error);
		}
	});
</script>

<div id="maplibre-canvas" class="map" bind:this={mapElement}></div>

<style>
	@import './maplibre-gl.css';

	.map {
		height: 100%;
		width: 100%;
		z-index: 1;
		min-height: 200px;
		min-width: 200px;
	}
</style>
