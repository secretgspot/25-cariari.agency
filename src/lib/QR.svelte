<script>
	import { qr } from '@svelte-put/qr/svg';

	/** @type {{size?: number, message?: string}} */
	let { size = 180, message = '' } = $props();
</script>

<svg
	class="qr"
	width={size}
	height={size}
	use:qr={{
		data: message,
		// logo: '/static/logo/logo_minimal_gold.svg',
		shape: 'circle',
		anchorInnerFill: '#000',
		anchorOuterFill: '#000',
		moduleFill: '#000',
	}} />

<style>
	@media (prefers-color-scheme: dark) {
		.qr {
			filter: invert(1) brightness(var(--brightness));
		}
	}
</style>
