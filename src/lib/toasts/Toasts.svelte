<script>
	import Toast from './Toast.svelte';
	import { dismissToast, toasts } from './store.js';
</script>

{#if $toasts}
	<section>
		{#each $toasts as toast (toast.id)}
			<Toast
				type={toast.type}
				dismissible={toast.dismissible}
				on:dismiss={() => dismissToast(toast.id)}>{toast.message}</Toast>
		{/each}
	</section>
{/if}

<style lang="postcss">
	section {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		width: 100%;
		display: flex;
		gap: var(--gap-extra-small);
		justify-content: center;
		flex-direction: column;
		align-items: flex-end;
		z-index: 12;
	}
</style>
