<script>
	import { navigating } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { Toasts } from '$lib/toasts';
	import Splash from '$lib/Splash.svelte';
	import 'open-props/style';

	let { children, data } = $props();

	// console.log('🍖 page:', data);

	// Set up auth state listener with proper cleanup
	$effect(() => {
		// Guard clause - exit early if supabase isn't available
		if (!data.supabase) return;

		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			// Only invalidate on auth state changes that matter for the app
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		// Return cleanup function
		return () => {
			subscription?.unsubscribe();
		};
	});
</script>

<Toasts />

{#if navigating.complete}
	<Splash />
	<!-- {:else} -->
{/if}
{@render children?.()}
