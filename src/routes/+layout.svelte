<script>
	import { navigating, page } from '$app/state';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Toasts } from '$lib/toasts';
	import Splash from '$lib/Splash.svelte';
	// import 'leaflet/dist/leaflet.css';
	import '../styles/normalize.css';
	import '../styles/styles.css';
	import '../styles/leaflet.css';
	import '../styles/print.css';

	let { children, data } = $props();

	// console.log('🍖 page:', data);

	let { is_logged_in, is_admin, supabase } = $state(data);
	let loading = $state(true); // Add a local loading state

	// $effect(() => {
	// 	console.log('🛑 is_logged_in:', is_logged_in ? '👍' : '👎');
	// 	console.log('🛑 is_admin:', is_admin ? '👍' : '👎');
	// });

	onMount(async () => {
		const {
			data: { user },
			error,
		} = await data.supabase.auth.getUser();
		if (!error && user) {
			is_logged_in = true;
			is_admin = user?.app_metadata?.claims_admin || false;
		}
		loading = false;

		const {
			data: { subscription },
		} = data.supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'SIGNED_IN') {
				const {
					data: { user },
					error,
				} = await data.supabase.auth.getUser();
				if (!error && user) {
					is_logged_in = true;
					is_admin = user?.app_metadata?.claims_admin || false;
				}
			} else if (event === 'SIGNED_OUT') {
				is_logged_in = false;
				is_admin = false;
			}
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
