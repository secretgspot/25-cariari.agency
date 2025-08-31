<script>
	import { page } from '$app/state';
	import Notify from '$lib/Notify.svelte';
	import ErrorImage from '$lib/ErrorImage.svelte';
	import { Button } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';
</script>

<main>
	<Notify type="danger">{page.status}: {page.error.message}</Notify>

	{#if page.status == 401 || page.status == 404 || page.status == 500}
		<Button shadow href="/" alt="Home">
			{#snippet icon()}
				<Icon kind="home" size="27" />
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
		gap: var(--size-3);
		flex-direction: column;
		align-items: center;
		align-self: center;
		justify-self: center;
		height: 100vh;
		justify-content: center;
	}
</style>
