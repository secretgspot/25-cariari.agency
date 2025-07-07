<script>
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';

	import LogoSvg from '$lib/LogoSvg.svelte';
	import Splash from '$lib/Splash.svelte';
	import Map from '$lib/map/Map.svelte';
	import Preview from '$lib/Preview.svelte';
	import Nav from '$lib/Nav.svelte';
	import JsonDump from '$lib/JSONDump.svelte';

	/** @type {{data: any, supabase: any}} */
	let { data } = $props();
	// console.log('(app)/+page.svelte data:', data);
	// console.log('(app)/+page.svelte supabase:', data.supabase);

	let loading = $state(data.loading ?? false),
		error = '',
		message = '',
		showPreview = false,
		selectedProperty = $state();

	// $: console.log("selected property: ", selectedProperty);

	onMount(async () => {
		loading = false;
	});
</script>

<svelte:head>
	<title>Cariari Agency - Costa Rica Real Estate</title>
</svelte:head>

<!-- <JsonDump name="data" {data} /> -->
{#if !navigating.complete && !loading}
	<LogoSvg animate={true} kind="gold" fixed />
{/if}

<main class:preview={selectedProperty}>
	<section class="map-wrapper">
		<Nav />
		<Map
			markers={data.properties}
			onSelected={(id) => {
				selectedProperty = id;
			}} />
	</section>

	{#if selectedProperty}
		<aside class="preview-wrapper">
			<Preview property_id={selectedProperty} supabase={data.supabase} />
		</aside>
	{/if}
</main>

<!-- {/if} -->
<style>
	main {
		display: grid;
		height: 100svh;
		width: 100svw;
	}
	.map-wrapper {
		position: relative;
	}
	main.preview {
		grid-template-rows: 30vh 1fr;
	}
	@media (min-width: 768px) {
		.preview-wrapper {
			height: 100vh;
			display: grid;
			position: relative;
		}
		main.preview {
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 369px;
		}
		/* main :global(.map) {
			width: 70vw;
		} */
	}
</style>
