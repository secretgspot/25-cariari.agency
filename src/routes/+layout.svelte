<script>
	import { navigating, page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Toasts } from '$lib/toasts';
	import Splash from '$lib/Splash.svelte';

	let { children, data } = $props();

	let { session, is_logged_in, is_admin, supabase } = $state(data);
	let loading = $state(true); // Add a local loading state

	$effect(() => {
		console.log('is_logged_in:', is_logged_in ? '👍' : '👎');
		console.log('is_admin:', is_admin);
	});

	onMount(() => {
		// Set loading to false once the component mounts and session data is available
		if (session) {
			loading = false;
		}
		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange((event, _session) => {
			session = _session;
			is_logged_in = !!_session;
			is_admin = _session?.user?.app_metadata?.claims_admin || false;
			loading = false; // Set loading to false after auth state changes
			invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<Toasts />

{#if navigating.complete || loading}
	<Splash />
{:else}
	{@render children?.()}
{/if}
