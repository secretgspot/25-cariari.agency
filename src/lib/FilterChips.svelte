<script>
	/**
	 * @type {{
	 *   ariaLabel?: string;
	 *   class?: string;
	 *   children?: import('svelte').Snippet;
	 * }}
	 */
	let {
		ariaLabel = 'Filter properties by type',
		class: className = '',
		children,
		...rest
	} = $props();
</script>

<div class="filter-controls {className}" role="group" aria-label={ariaLabel} {...rest}>
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	.filter-controls {
		display: flex;
		align-items: center;
		gap: var(--size-2, 6px);
		position: absolute;
		top: calc(var(--size-3) * 3.3);
		right: 0;
		user-select: none;
		z-index: 3;
		background: var(--surface-1);
		padding: 4px 8px 4px 6px;
		border-radius: var(--radius-2);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		box-shadow: var(--shadow-2);
		backdrop-filter: blur(8px);
	}
</style>
