<script>
	import { page } from '$app/state';
	import Notify from '$lib/Notify.svelte';
	import ErrorImage from '$lib/ErrorImage.svelte';
	import { Button } from '$lib/buttons';
</script>

<main>
	<Notify type="danger">{page.status}: {page.error.message}</Notify>

	{#if page.status == 401 || page.status == 404 || page.status == 500}
		<Button shadow right href="/" alt="Home">
			{#snippet icon()}
				🎈
			{/snippet}
			Return to homepage
		</Button>
	{/if}
</main>
<ErrorImage type={page.status || 'empty'} />

<style>
	main {
		grid-column: 1 / -1;
		grid-row: 1 / -1;
		display: flex;
		gap: var(--gap-medium);
		flex-direction: column;
		align-items: center;
		align-self: center;
		justify-self: center;
		height: 100vh;
		justify-content: center;
	}
</style>
