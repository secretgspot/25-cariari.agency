<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';

	const dispatch = createEventDispatcher();

	/** @type {{type?: string, dismissible?: boolean, children?: import('svelte').Snippet}} */
	let { type = '', dismissible = true, children } = $props();
</script>

<i class={type} role="alert" transition:fade|global>
	{#if type === 'success'}
		😅
	{:else if type === 'error'}
		👀
	{:else}
		🤷‍♂️
	{/if}

	<div class="text">
		{@render children?.()}
	</div>

	{#if dismissible}
		<button class="close" onclick={() => dispatch('dismiss')}> ❌ </button>
	{/if}
</i>

<style lang="postcss">
	i {
		display: flex;
		border-radius: var(--border-radius);
		border: var(--border);
		align-items: center;
		padding: var(--padding-extra-small);
		gap: var(--gap-small);
	}
	.error {
		/* background: var(--error); */
		border-color: var(--error);
		color: var(--error-content);
	}
	.success {
		/* background: var(--success); */
		border-color: var(--success);
		color: var(--success-content);
	}
	.info {
		/* background: var(--info); */
		border-color: var(--info);
		color: var(--primary);
	}
	.text {
		margin-right: 1rem;
		font-size: 0.81rem;
	}
	button {
		background: transparent;
		border: 0 none;
		padding: 0;
		/* font-size: 0.63rem; */
		cursor: pointer;
	}
</style>
