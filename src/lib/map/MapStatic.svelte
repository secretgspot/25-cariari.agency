<script>
	import { onMount, onDestroy } from 'svelte';

	let { position } = $props();

	let map;
	let mapContainer;
	let marker; // Store the marker instance

	// Define a buffer for the bounds, in meters
	const BOUNDS_BUFFER_METERS = 50; // Adjust as needed

	onMount(async () => {
		if (!position) return;

		const leafletModule = await import('leaflet');
		const L = leafletModule.default;

		if (mapContainer._leaflet_id) {
			const existingMap = L.Map.get(mapContainer._leaflet_id);
			if (existingMap) existingMap.remove();
		}

		map = L.map(mapContainer, {
			zoomControl: false,
			// Initially, no maxBounds. We'll set them dynamically.
			attributionControl: false,
		}).setView([parseFloat(position.lat), parseFloat(position.lng)], 17);

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.{ext}', {
			subdomains: 'abcd',
			minZoom: 15,
			maxZoom: 18,
			ext: 'jpg',
			errorTileUrl:
				'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
		}).addTo(map);

		const customIcon = L.icon({
			iconUrl: '/map/marker-icon.svg',
			iconSize: [32, 32],
			iconAnchor: [16, 32],
			popupAnchor: [0, -32],
		});

		marker = L.marker([parseFloat(position.lat), parseFloat(position.lng)], {
			icon: customIcon,
		}).addTo(map);

		// Function to update maxBounds based on current view and marker
		const updateMaxBounds = () => {
			if (!map || !marker) return;

			const currentCenter = map.getCenter();
			const currentZoom = map.getZoom();

			// Get the pixel bounds of the current map view
			const pixelBounds = map.getPixelBounds();
			const sizeInPixels = pixelBounds.getSize();

			// Convert buffer from meters to pixels at current zoom level
			// This is a rough estimation, a more precise way would involve L.latLng.toGlobalPixel
			// and calculating the pixel equivalent of the buffer.
			// For simplicity, we'll just add a fixed pixel buffer.
			// A more accurate approach involves projecting lat/lng to pixels and then back.
			// Let's use a simpler approach for now to illustrate the concept.

			// Calculate the map's current visible bounds
			const visibleBounds = map.getBounds();

			// Extend these bounds by a small margin to prevent the marker from being right at the edge
			// We'll calculate a dynamic buffer based on the visible area.
			// A more robust approach might be to calculate the `L.LatLngBounds` from the marker's position
			// and extend it by a certain distance in meters, then convert that to `LatLngBounds`.

			// Let's create a small bounding box around the marker using a fixed pixel buffer
			const markerLatLng = marker.getLatLng();
			const markerPoint = map.latLngToContainerPoint(markerLatLng);

			// Define a small pixel buffer around the marker
			const pixelBuffer = L.point(map.getSize().x * 0.1, map.getSize().y * 0.1); // 10% of map width/height

			const southWestPixel = markerPoint.subtract(pixelBuffer);
			const northEastPixel = markerPoint.add(pixelBuffer);

			const newSouthWest = map.containerPointToLatLng(southWestPixel);
			const newNorthEast = map.containerPointToLatLng(northEastPixel);

			const markerBufferBounds = L.latLngBounds(newSouthWest, newNorthEast);

			// When zoomed out (default zoom), we want the bounds to be very tight around the marker,
			// preventing any scrolling.
			if (currentZoom === map.options.minZoom) {
				// Assuming minZoom is your default
				// For the default zoom, we want the visible area to be tightly centered on the marker
				// without allowing scrolling. We can achieve this by making maxBounds equal to the
				// current visible bounds when the marker is centered.
				map.setMaxBounds(map.getBounds());
			} else {
				// When zoomed in, allow scrolling within a slightly larger area around the marker.
				// We'll create a bounding box that's centered on the marker but allows some panning.
				// A more robust way is to use `map.getSize()` and `map.unproject` to calculate
				// a buffer in geographical coordinates.
				const center = marker.getLatLng();
				const latOffset = 0.0005; // Adjust these values to control the allowed pan area
				const lngOffset = 0.0005; // These are arbitrary, you'll need to tune them.

				const southWest = L.latLng(center.lat - latOffset, center.lng - lngOffset);
				const northEast = L.latLng(center.lat + latOffset, center.lng + lngOffset);

				map.setMaxBounds(L.latLngBounds(southWest, northEast));
			}
		};

		// Set initial max bounds after the map and marker are initialized
		updateMaxBounds();

		// Update maxBounds on zoom and move events
		map.on('zoomend', updateMaxBounds);
		map.on('moveend', updateMaxBounds); // This helps to re-center if user tries to pan outside bounds
		// although setMaxBounds should largely prevent it.
	});

	onDestroy(() => {
		if (map) {
			map.remove();
		}
	});
</script>

<div
	id="map-canvas"
	class="map"
	bind:this={mapContainer}
	style="height: 400px; width: 100%;">
</div>

<style>
	.map {
		height: 222px;
		width: 100%;
		z-index: 1;
		min-height: 200px;
		min-width: 200px;
		border-radius: 8px;
		overflow: hidden;
	}

	@media (prefers-color-scheme: dark) {
		.map {
			filter: invert(1) brightness(var(--brightness)) hue-rotate(180deg);
		}
	}
</style>
