<script>
	import qr from 'qr.js';
	import { onMount } from 'svelte'; // onMount is still used for DOM-related side effects

	/** @type {{size?: number, message?: string}} */
	let { size = 180, message = '' } = $props();

	let canvas = $state();
	let qrcode = $derived(qr(message));

	$effect(() => {
		// This effect will re-run whenever `canvas` or `qrcode` changes.
		// We add a check for `canvas` to ensure it's available before drawing.
		if (canvas && qrcode) {
			const ctx = canvas.getContext('2d');
			let cells = qrcode.modules;

			var tileW = canvas.width / cells.length;
			var tileH = canvas.height / cells.length;

			for (var r = 0; r < cells.length; ++r) {
				let row = cells[r];
				for (var c = 0; c < row.length; ++c) {
					ctx.fillStyle = row[c] ? '#000' : '#fff';
					let w = Math.ceil((c + 1) * tileW) - Math.floor(c * tileW);
					let h = Math.ceil((r + 1) * tileH) - Math.floor(r * tileH);
					ctx.fillRect(Math.round(c * tileW), Math.round(r * tileH), w, h);
				}
			}
		}
	});
</script>

<canvas class="qr" bind:this={canvas} width={size} height={size}></canvas>

<style>
	@media (prefers-color-scheme: dark) {
		.qr {
			filter: invert(1) brightness(var(--brightness));
		}
	}
</style>
