<script>
    import { onMount, onDestroy } from 'svelte';
    import pkg from 'maplibre-gl';
    const { Map, Marker } = pkg;
    import 'maplibre-gl/dist/maplibre-gl.css';
    import { isValidPosition, normalizePosition } from '$lib/utils/mapUtils.js';
    import mapStyle from './style.json';

    let { position } = $props();

    let mapElement;
    let mapInstance = $state(null);

    // Define maxBounds as [west, south, east, north]
    const maxBounds = [
        [-84.17891979217531, 9.962086432098069], // Southwest corner [lng, lat]
        [-84.14235591888429, 9.980261288306549],  // Northeast corner [lng, lat]
    ];

    onMount(() => {
        setTimeout(() => {
            if (!position || !mapElement) return;

            const initialCenter = [parseFloat(position.lng), parseFloat(position.lat)];

            mapInstance = new Map({
                container: mapElement,
                style: mapStyle, // Use imported style.json
                center: initialCenter,
                zoom: 17,
                maxBounds: maxBounds,
                attributionControl: false,
                interactive: false, // Make the map non-interactive
            });

            mapInstance.on('load', () => {
                // Create a custom HTML element for the marker
                const el = document.createElement('div');
                el.className = 'map-static-marker';
                el.style.backgroundImage = `url(/map/marker-icon.svg)`;
                el.style.width = '32px';
                el.style.height = '32px';
                el.style.backgroundSize = 'contain';
                el.style.backgroundRepeat = 'no-repeat';
                el.style.backgroundPosition = 'center';

                new Marker({ element: el })
                    .setLngLat(initialCenter)
                    .addTo(mapInstance);

                mapInstance.resize(); // Ensure map resizes correctly after load
            });

            mapInstance.on('error', (e) => {
                console.error('MapLibre GL Map error:', e.error);
            });
        }, 0);
    });

    onDestroy(() => {
        if (mapInstance) {
            mapInstance.remove();
            mapInstance = null;
        }
    });
</script>

<div
    id="maplibre-static-canvas"
    class="map"
    bind:this={mapElement}
    style="height: 400px; width: 100%;">
</div>

<style>
    @import 'maplibre-gl/dist/maplibre-gl.css';

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
        /* MapLibre GL styles might need custom dark mode styles or a dark map style */
        /* For now, no filter applied as it can distort map tiles */
    }
</style>
