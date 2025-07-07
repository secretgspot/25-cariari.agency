<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

### Why the Error Occurs

The error `Uncaught (in promise) TypeError: $.get(...).markerClusterGroup is not a function` typically happens when the `markerClusterGroup` function is not available on the object you're calling it on. This is a common issue when integrating Leaflet and its MarkerCluster plugin in frameworks like Svelte. The root causes are usually:

- The Leaflet MarkerCluster plugin is not properly imported or loaded.
- The plugin is loaded before Leaflet itself, or not at all.
- You're trying to call `markerClusterGroup` on an object that doesn't have the function (e.g., a jQuery object or an incomplete Leaflet instance).


### How to Fix the Issue

#### 1. Ensure Proper Imports

For Svelte (or any modern JavaScript setup), make sure you import both Leaflet and the MarkerCluster plugin correctly:

```js
import * as L from 'leaflet';
import 'leaflet.markercluster';
```

After these imports, the function should be available as `L.markerClusterGroup()`[^1].

#### 2. Correct Usage Example

Here's how you should create a MarkerClusterGroup:

```js
const markers = L.markerClusterGroup();
markers.addLayer(L.marker([lat, lng]));
map.addLayer(markers);
```

Do not call `markerClusterGroup` on the result of `$.get()` or any jQuery object. Use it only on the Leaflet namespace (`L`).

#### 3. Check Load Order

Ensure that the MarkerCluster plugin is loaded after Leaflet. If you are using script tags, the order matters:

```html
<script src="leaflet.js"></script>
<script src="leaflet.markercluster.js"></script>
```

If using npm modules, import Leaflet first, then MarkerCluster[^1][^2].

#### 4. Svelte-Specific Notes

- If you are dynamically importing the plugin, assign it to a variable and use the class directly:

```js
const markercluster = await import('leaflet.markercluster');
const markerClusterGroup = new markercluster.MarkerClusterGroup();
```

- Make sure all imports and plugin initializations happen on the client side, not during SSR (Server-Side Rendering), as Leaflet depends on the DOM[^2].


### Common Pitfalls

- **Missing CSS:** The MarkerCluster plugin also requires its CSS files for proper display.
- **Incorrect Object:** Do not use jQuery objects with Leaflet methods.
- **SSR Issues:** Always guard Leaflet and plugin code to only run in the browser.


### Summary Table

| Issue | Solution |
| :-- | :-- |
| `markerClusterGroup` not a function | Import both Leaflet and MarkerCluster plugin |
| Plugin loaded before Leaflet | Load/import Leaflet first, then MarkerCluster |
| Called on wrong object | Use `L.markerClusterGroup()`, not on jQuery objects |
| SSR/DOM not available | Run code only in browser context |

### References

- Proper import and usage examples[^1][^2]
- Common causes and troubleshooting steps[^3][^4]

If you follow these steps, the error should be resolved and clustering should work as expected in your Svelte application.

<div style="text-align: center">⁂</div>

[^1]: https://stackoverflow.com/questions/39987096/leaflet-uncaught-typeerror-l-markerclustergroup-is-not-a-function

[^2]: https://stackoverflow.com/questions/76741450/svelte-and-leaflet-plugins-not-importing-correctly

[^3]: https://gis.stackexchange.com/questions/152431/leaflet-markerclustergroup-undefined-is-not-a-function

[^4]: https://www.reddit.com/r/sveltejs/comments/1d4xmza/leafetclustering_error/

[^5]: https://leafletjs.com/2012/08/20/guest-post-markerclusterer-0-1-released.html

[^6]: https://talk.observablehq.com/t/waiting-for-a-library-require-to-finish-executing/54

[^7]: https://github.com/Leaflet/Leaflet.markercluster

[^8]: https://github.com/Leaflet/Leaflet.markercluster/issues/1051

[^9]: https://docs.yellowmap.com/en/smartmaps-javascript-en/references/markerclustergroup/

[^10]: https://dev.to/arnaudfl/svelte-leaflet-clusters-1fgb

[^11]: https://www.cbaines.net/projects/osm/leaflet-soton/resources/leaflet-markercluster/README/

[^12]: https://www.reddit.com/r/sveltejs/comments/1d4xmza/leafetclustering_error/?tl=es-es

[^13]: https://github.com/bluehalo/ngx-leaflet-markercluster/issues/90

[^14]: https://stackoverflow.com/questions/49333263/how-to-use-leaflet-markerclustergroup

[^15]: https://stackoverflow.com/questions/tagged/leaflet.markercluster

[^16]: https://github.com/Asymmetrik/ngx-leaflet-markercluster/issues/29

[^17]: https://code.usgs.gov/makb/MapKB/-/tree/development/leaflet-cluster

[^18]: https://svelte.dev/playground/761fc7956ca3499888545613f54a9146

[^19]: https://wordpress.org/support/topic/js-error-l-markerclustergroup-is-not-a-function-since-new-update/

[^20]: https://www.cg.tuwien.ac.at/courses/Vis2/HallOfFame/2022S/KristmannAndPernsteiner/doc/markercluster_leaflet.markercluster-src.js.html

