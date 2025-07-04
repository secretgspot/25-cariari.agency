<script>
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { supabase } from '$lib/db';
	import { LinkButton, Button } from '$lib/buttons';

	/** @type {{sticky?: boolean, basic?: boolean}} */
	let { sticky = false, basic = false, ...rest } = $props();

	let open = $state(false);

	let url = $derived(page.url.pathname);

	async function handleSignOut() {
		localStorage.clear();
		await supabase.auth.signOut();
		// invalidateAll();
		goto('/');
	}
</script>

<nav class:sticky class:basic class:open {...rest}>
	<div class="icon">
		<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="0 0 485 485"
			><path
				fill="currentColor"
				d="M352.5 207.5a35 35 0 1 0 0 70 35 35 0 0 0 0-70zm-220 0a35 35 0 1 0 0 70 35 35 0 0 0 0-70zm110 0a35 35 0 1 0 0 70 35 35 0 0 0 0-70z" /><path
				fill="currentColor"
				d="M414 71C368.2 25.2 307.3 0 242.5 0S116.8 25.2 71 71 0 177.7 0 242.5 25.2 368.2 71 414s106.7 71 171.5 71 125.7-25.2 171.5-71 71-106.7 71-171.5S459.8 116.8 414 71zM242.5 455C125.3 455 30 359.7 30 242.5S125.3 30 242.5 30 455 125.3 455 242.5 359.7 455 242.5 455z" /></svg>
	</div>
	<div class="wrapper">
		{#if url != '/'}
			<li><LinkButton href="/">Map</LinkButton></li>
		{/if}
		{#if url != '/properties'}
			<li><LinkButton href="/properties">Properties</LinkButton></li>
		{/if}
		{#if url != '/properties/add'}
			<li><LinkButton href="/properties/add">Add</LinkButton></li>
		{/if}
		{#if url != '/about'}
			<li><LinkButton href="/about">About</LinkButton></li>
		{/if}
		{#if page.data.session}
			<li>
				<LinkButton onclick={handleSignOut}
					><svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 512 512"
						style="height: 17px;"
						><path
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="32"
							d="M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" /></svg
					></LinkButton>
			</li>
		{/if}
	</div>
</nav>

<style>
	nav {
		display: grid;
		justify-items: end;
		justify-content: end;
		position: absolute;
		top: var(--padding-small);
		right: var(--padding-small);
		row-gap: var(--gap-extra-small);
		user-select: none;
		cursor: pointer;
		z-index: 3;
	}
	.icon {
		width: 27px;
		height: 27px;
		border-radius: 50%;
		outline: 6px solid hsl(var(--p) / 0.6);
		background: hsl(var(--p) / 0.6);
		backdrop-filter: blur(3px);
	}
	.wrapper {
		display: none;
		gap: var(--gap-extra-small);
		list-style: none;
		z-index: 3;
		background: hsl(var(--p) / 0.9);
		backdrop-filter: blur(3px);
		padding: var(--padding-extra-small);
		border-radius: var(--border-radius);
	}
	.sticky {
		position: sticky;
		top: 0;
	}
	.basic {
		position: static;
		justify-self: end;
	}
	nav.open .icon + .wrapper {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		position: absolute;
		top: 54px;
	}
	@media (min-width: 768px) {
		.icon {
			display: none;
		}
		.wrapper {
			display: flex;
		}
	}
</style>
