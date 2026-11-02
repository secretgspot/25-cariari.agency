<script>
	import { onDestroy, onMount, untrack } from 'svelte';
	import maplibregl from 'maplibre-gl';
	import { formatLargeNumber } from '#lib/utils/formatters.js';
	import {
		getPropertyMarkerColors,
		isMarkerSelected,
		isValidMarker,
	} from '#lib/utils/mapUtils.js';
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';

	let {
		map,
		markers = [],
		selectedId = null,
		onSelected,
		onDeselect,
		onSelectionEnd,
		onMarkerCenter,
	} = $props();

	const SOURCE_ID = 'property-markers';
	const CIRCLE_LAYER_ID = 'property-markers-circle';
	const MIXED_LAYER_ID = 'property-markers-mixed';
	const INTERACTIVE_LAYERS = [CIRCLE_LAYER_ID, MIXED_LAYER_ID];
	const MARKER_SIZE = 21;

	let freshnessNow = $state(Date.now());
	let tooltipMarker = null;
	let pinnedTooltipMarker = $state(null);
	let popup = null;
	let freshnessInterval;

	const validMarkers = $derived((markers ?? []).filter(isValidMarker));
	const markerIndex = $derived(
		new Map(validMarkers.map((marker) => [String(marker.id), marker])),
	);
	const featureCollection = $derived.by(() => {
		const now = freshnessNow;

		return {
			type: 'FeatureCollection',
			features: validMarkers.map((marker) => {
				const colors = getPropertyMarkerColors(
					marker.property_for,
					marker.created_at,
					now,
				);
				const markerKind = colors.hasSale && colors.hasRent ? 'mixed' : 'circle';
				const mixedImage = markerKind === 'mixed'
					? getMixedImageId(colors.sale, colors.rent)
					: null;

				return {
					type: 'Feature',
					id: String(marker.id),
					geometry: {
						type: 'Point',
						coordinates: [Number(marker.location.lng), Number(marker.location.lat)],
					},
					properties: {
						markerId: String(marker.id),
						markerKind,
						color: colors.hasSale
							? colors.sale
							: colors.hasRent
								? colors.rent
								: '#6B7280',
						image: mixedImage,
						selected: isMarkerSelected(marker.id, marker.msl, selectedId),
					},
				};
			}),
		};
	});

	function getMixedImageId(saleColor, rentColor) {
		return `property-marker-${saleColor.slice(1)}-${rentColor.slice(1)}`;
	}

	function addMixedMarkerImage(currentMap, imageId, saleColor, rentColor) {
		if (currentMap.hasImage(imageId)) return;

		const canvas = document.createElement('canvas');
		canvas.width = MARKER_SIZE * 2;
		canvas.height = MARKER_SIZE * 2;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Unable to create the property marker image.');
		}

		context.beginPath();
		context.arc(MARKER_SIZE, MARKER_SIZE, MARKER_SIZE, 0, Math.PI * 2);
		context.clip();
		context.fillStyle = saleColor;
		context.fillRect(0, 0, MARKER_SIZE, MARKER_SIZE * 2);
		context.fillStyle = rentColor;
		context.fillRect(MARKER_SIZE, 0, MARKER_SIZE, MARKER_SIZE * 2);
		const image = context.getImageData(0, 0, canvas.width, canvas.height);
		currentMap.addImage(imageId, image, { pixelRatio: 2 });
	}

	function ensureMixedMarkerImages(currentMap, collection) {
		for (const feature of collection.features) {
			if (feature.properties.markerKind !== 'mixed') continue;
			const [sale, rent] = feature.properties.image
				.slice('property-marker-'.length)
				.split('-');
			const saleColor = `#${sale}`;
			const rentColor = `#${rent}`;
			addMixedMarkerImage(currentMap, feature.properties.image, saleColor, rentColor);
		}
	}

	function setFeatureCollection(currentMap, collection) {
		ensureMixedMarkerImages(currentMap, collection);
		const source = currentMap.getSource(SOURCE_ID);
		if (source) {
			source.setData(collection);
		} else {
			currentMap.addSource(SOURCE_ID, {
				type: 'geojson',
				data: collection,
			});
		}

		if (!currentMap.getLayer(CIRCLE_LAYER_ID)) {
			currentMap.addLayer({
				id: CIRCLE_LAYER_ID,
				type: 'circle',
				source: SOURCE_ID,
				filter: ['==', ['get', 'markerKind'], 'circle'],
				paint: {
					'circle-color': ['get', 'color'],
					'circle-radius': [
						'case',
						['get', 'selected'],
						MARKER_SIZE * 0.75,
						MARKER_SIZE * 0.5,
					],
				},
			});
		}
		if (!currentMap.getLayer(MIXED_LAYER_ID)) {
			currentMap.addLayer({
				id: MIXED_LAYER_ID,
				type: 'symbol',
				source: SOURCE_ID,
				filter: ['==', ['get', 'markerKind'], 'mixed'],
				layout: {
					'icon-image': ['get', 'image'],
					'icon-size': [
						'case',
						['get', 'selected'],
						1.5,
						1,
					],
					'icon-allow-overlap': true,
					'icon-ignore-placement': true,
				},
			});
		}
	}

	function markerForFeature(feature) {
		const featureId =
			feature?.properties?.markerId ?? feature?.id ?? feature?.properties?.id;
		return featureId === undefined ? null : markerIndex.get(String(featureId)) ?? null;
	}

	function markerLabel(marker) {
		const propertyFor = Array.isArray(marker.property_for)
			? marker.property_for.join(', ')
			: marker.property_for || 'Listing type unavailable';
		const price = marker.price ? ` ${formatLargeNumber(marker.price)}` : '';
		return `${marker.msl || 'Property'}: ${propertyFor}${price}`;
	}

	function removeTooltip() {
		popup?.remove();
		popup = null;
		tooltipMarker = null;
	}

	function showMarkerTooltip(currentMap, marker) {
		if (!marker?.location) return;
		if (tooltipMarker?.id === marker.id && popup) return;
		removeTooltip();

		const propertyFor = Array.isArray(marker.property_for)
			? marker.property_for.join(', ')
			: marker.property_for || 'N/A';
		const price = marker.price ? ` ${formatLargeNumber(marker.price)}` : '';
		const content = document.createElement('div');
		content.textContent = `${marker.msl || 'N/A'} - ${propertyFor}${price}`;
		Object.assign(content.style, {
			padding: '0.35rem 0.5rem',
			borderRadius: '3px',
			background: '#fff',
			color: '#222',
			fontSize: '0.72rem',
			lineHeight: '1.3',
			whiteSpace: 'nowrap',
		});

		popup = new maplibregl.Popup({
			closeButton: false,
			closeOnClick: false,
			focusAfterOpen: false,
			offset: [0, -10],
		})
			.setLngLat([Number(marker.location.lng), Number(marker.location.lat)])
			.setDOMContent(content)
			.addTo(currentMap);
		popup.getElement().style.zIndex = '30';
		const popupContent = popup.getElement().querySelector('.maplibregl-popup-content');
		if (popupContent) {
			popupContent.style.padding = '0';
			popupContent.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)';
		}
		tooltipMarker = marker;
	}

	function handleMarkerClick(currentMap, marker) {
		const alreadySelected = isMarkerSelected(marker.id, marker.msl, selectedId);
		if (alreadySelected) {
			pinnedTooltipMarker = null;
			removeTooltip();
			if (onSelectionEnd) onSelectionEnd();
		} else {
			pinnedTooltipMarker = marker;
			showMarkerTooltip(currentMap, marker);
		}
		if (onSelected) onSelected(marker.id);
		if (!alreadySelected && marker.location) {
			if (onMarkerCenter) onMarkerCenter(marker);
		}
		playButtonSound('click');
		vibrateButton('click');
	}

	function handleMapClick(event, currentMap) {
		const layers = INTERACTIVE_LAYERS.filter((layer) => currentMap.getLayer(layer));
		if (!layers.length) return;
		const feature = currentMap.queryRenderedFeatures(event.point, { layers })[0];
		const marker = markerForFeature(feature);
		if (marker) {
			handleMarkerClick(currentMap, marker);
			return;
		}

		pinnedTooltipMarker = null;
		removeTooltip();
		if (onSelectionEnd) onSelectionEnd();
		if (onDeselect) onDeselect();
	}

	function handlePointerMove(event, currentMap) {
		const layers = INTERACTIVE_LAYERS.filter((layer) => currentMap.getLayer(layer));
		if (!layers.length) return;

		const feature = currentMap.queryRenderedFeatures(event.point, { layers })[0];
		const marker = markerForFeature(feature);
		currentMap.getCanvas().style.cursor = marker ? 'pointer' : '';
		if (!marker) {
			if (pinnedTooltipMarker) {
				showMarkerTooltip(currentMap, pinnedTooltipMarker);
			} else {
				removeTooltip();
			}
			return;
		}

		showMarkerTooltip(currentMap, marker);
	}

	$effect(() => {
		const currentMap = map;
		if (!currentMap) return;

		const setup = () => untrack(() => {
			setFeatureCollection(currentMap, featureCollection);
		});
		const click = (event) => handleMapClick(event, currentMap);
		const pointerMove = (event) => handlePointerMove(event, currentMap);
		const pointerOut = () => {
			currentMap.getCanvas().style.cursor = '';
			if (pinnedTooltipMarker) {
				showMarkerTooltip(currentMap, pinnedTooltipMarker);
			} else {
				removeTooltip();
			}
		};

		currentMap.on('load', setup);
		currentMap.on('style.load', setup);
		currentMap.on('click', click);
		currentMap.on('mousemove', pointerMove);
		currentMap.on('mouseout', pointerOut);
		if (currentMap.isStyleLoaded()) setup();

		return () => {
			currentMap.off('load', setup);
			currentMap.off('style.load', setup);
			currentMap.off('click', click);
			currentMap.off('mousemove', pointerMove);
			currentMap.off('mouseout', pointerOut);
			currentMap.getCanvas().style.cursor = '';
			removeTooltip();
		};
	});

	$effect(() => {
		const currentMap = map;
		const collection = featureCollection;
		if (!currentMap) return;
		const source = currentMap.getSource(SOURCE_ID);
		if (source) source.setData(collection);
	});

	$effect(() => {
		const currentMap = map;
		const currentSelectedId = selectedId;
		const currentMarkers = markers;
		if (!currentMap) return;

		const selectedMarker = (currentMarkers ?? []).find((marker) =>
			isMarkerSelected(marker.id, marker.msl, currentSelectedId),
		);
		if (selectedMarker) {
			pinnedTooltipMarker = selectedMarker;
			showMarkerTooltip(currentMap, selectedMarker);
		} else if (!currentSelectedId) {
			pinnedTooltipMarker = null;
			removeTooltip();
		} else if (pinnedTooltipMarker) {
			pinnedTooltipMarker = null;
			removeTooltip();
		}
	});

	onMount(() => {
		freshnessInterval = setInterval(() => {
			freshnessNow = Date.now();
		}, 24 * 60 * 60 * 1000);
	});

	onDestroy(() => {
		if (freshnessInterval) clearInterval(freshnessInterval);
		removeTooltip();
	});
</script>

<div class="marker-overlay">
	<ul class="accessible-marker-list" aria-label="Properties on the map">
		{#each validMarkers as marker (marker.id)}
			<li>
				<button
					type="button"
					class="accessible-marker"
					aria-label={markerLabel(marker)}
					aria-pressed={isMarkerSelected(marker.id, marker.msl, selectedId)}
					onfocus={() => {
						if (map) showMarkerTooltip(map, marker);
					}}
					onblur={() => {
						if (!isMarkerSelected(marker.id, marker.msl, selectedId)) {
							if (pinnedTooltipMarker && map) {
								showMarkerTooltip(map, pinnedTooltipMarker);
							} else {
								removeTooltip();
							}
						}
					}}
					onclick={() => handleMarkerClick(map, marker)}
				></button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.marker-overlay {
		position: absolute;
		z-index: 5;
		inset: 0;
		pointer-events: none;
	}

	.accessible-marker-list {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.accessible-marker {
		pointer-events: none;
	}
</style>
