<script>
	/** @type {{width: any, height: any, children?: import('svelte').Snippet}} */
	let { width, height, children } = $props();
</script>

<div class="advertising" style="width:{width}px; height:{height}px;">
	{#if children}{@render children()}{:else}
		<small>{width}x{height}<br />AD</small>
	{/if}
</div>

<style>
	.advertising {
		position: relative;
		background: var(--neutral);
		color: var(--neutral-content);
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--shadow-small);
		/* margin: 2rem 0; */
		text-align: center;
		opacity: var(--brightness);
		&::after {
			content: 'ad';
			position: absolute;
			bottom: 100%;
			right: 0;
			font-size: 9px;
			color: var(--secondary-content);
			line-height: 1;
			text-transform: uppercase;
			margin-block: 0 var(--padding-extra-small);
		}
		small {
			font-size: 12px;
		}
	}
</style>
