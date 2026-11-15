<script>
	let { size = '69px', color = 'currentColor', kind } = $props();

	let svgContent = $state('');
	let viewBox = $state('0 0 512 512');

	$effect(() => {
		if (kind) {
			// Ensure fetch only runs client-side for relative URLs
			if (typeof window !== 'undefined') {
				fetch(`/icons/${kind}.svg`)
					.then((response) => response.text())
					.then((svg) => {
						// Extract only the path data from the SVG
						const parser = new DOMParser();
						const doc = parser.parseFromString(svg, 'image/svg+xml');
						const svgElement = doc.querySelector('svg');
						if (svgElement) {
							svgContent = svgElement.innerHTML; // Get inner HTML of SVG
							const vb = svgElement.getAttribute('viewBox');
							if (vb) {
								viewBox = vb;
							} else {
								viewBox = '0 0 512 512';
							}
						} else {
							svgContent = ''; // Handle cases where no SVG is found
						}
					})
					.catch((error) => {
						console.error(`Failed to load icon ${kind}.svg:`, error);
						svgContent = '';
					});
			} else {
				// During SSR, we can't fetch relative URLs.
				// svgContent will remain empty until client-side hydration.
				svgContent = '';
			}
		} else {
			svgContent = '';
		}
	});
</script>

<svg
	width={size}
	height={size}
	{viewBox}
	fill="none"
	stroke={color}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round">
	{@html svgContent}
</svg>

<style>
	svg {
		display: inline-block;
		vertical-align: middle;
	}
</style>
