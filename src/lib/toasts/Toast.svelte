<script>
	import { fade } from 'svelte/transition';

	/** @type {{type?: string, dismissible?: boolean, children?: import('svelte').Snippet, ondismiss?: () => void}} */
	let { type = '', dismissible = true, children, ondismiss } = $props();

	function handleDismiss() {
		// console.log('Toast dismiss clicked'); // Debug log
		ondismiss?.();
	}
</script>

<i class="toast {type}" role="alert" transition:fade|global>
	{#if type === 'success'}
		👍
	{:else if type === 'error'}
		👎
	{:else}
		👀
	{/if}

	<div class="text">
		{@render children?.()}
	</div>

	{#if dismissible}
		<button class="close" onclick={handleDismiss}> ❌ </button>
	{/if}
</i>

<style>
	.toast {
		display: flex;
		border-radius: var(--border-radius);
		border: var(--border);
		align-items: center;
		padding: var(--padding-extra-small);
		gap: var(--gap-small);
		pointer-events: auto; /* Ensure toasts are clickable */
	}
	.error {
		background: var(--error);
		border-color: var(--error);
		color: var(--error-content);
	}
	.success {
		background: var(--success);
		border-color: var(--success);
		color: var(--success-content);
	}
	.info {
		background: var(--info);
		border-color: var(--info);
		color: var(--primary);
	}
	.text {
		margin-right: 1rem;
		font-size: 0.81rem;
	}
	.close {
		background: transparent;
		border: 0 none;
		padding: 0;
		cursor: pointer;
		pointer-events: auto; /* Ensure button is clickable */
	}
	.close:hover {
		opacity: 0.7;
	}
</style>
