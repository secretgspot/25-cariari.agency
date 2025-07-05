<!-- @migration task: review uses of `navigating` -->
<script>
	import { navigating, page } from '$app/state';

	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Toasts } from '$lib/toasts';
	// import { FixedLine } from "$lib/loaders";
	import Splash from '$lib/Splash.svelte';
	/** @type {{children?: import('svelte').Snippet}} */
	let { children, data } = $props();

	console.log('Layout data:', data);

	onMount(() => {
		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<Toasts />

{#if navigating.complete}
	<Splash />
	<!-- <FixedLine /> -->
{/if}

{@render children?.()}
