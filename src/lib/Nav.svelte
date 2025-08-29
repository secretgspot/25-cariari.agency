<script>
	import { page } from '$app/state';
	import { LinkButton } from '$lib/buttons';

	/** @type {{ is_logged_in: boolean; fixed?: boolean; basic?: boolean; url: any; }} */
	let { fixed = false, basic = false, url, ...rest } = $props();
	// console.log('Nav props', { page, fixed, basic, url, ...rest });
</script>

<!-- {JSON.stringify(is_logged_in, null, 2)} -->

<nav class:fixed class:basic {...rest}>
	<div class="wrapper">
		{#if page.data.is_admin}<span title="admin">🔥</span>{/if}
		{#if page.url.pathname != '/'}
			<li><LinkButton href="/">Map</LinkButton></li>
		{/if}
		{#if page.url.pathname != '/properties'}
			<li><LinkButton href="/properties">Properties</LinkButton></li>
		{/if}
		{#if page.url.pathname != '/properties/add'}
			<li><LinkButton href="/properties/add">Add</LinkButton></li>
		{/if}
		{#if page.url.pathname != '/about'}
			<li><LinkButton href="/about">About</LinkButton></li>
		{/if}
		{#if page.data.is_logged_in}
			<li>
				<form action="/logout" method="post">
					<LinkButton sound={true} sound_pattern="failA">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
							style="height: 17px;">
							<path
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="32"
								d="M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40M368 336l80-80-80-80M176 256h256" />
						</svg>
					</LinkButton>
				</form>
			</li>
		{/if}
	</div>
</nav>

<style>
	nav {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		user-select: none;
		z-index: 3;
	}
	.wrapper {
		display: flex;
		gap: var(--size-2);
		list-style: none;
		background: var(--surface-1);
		/* backdrop-filter: blur(3px); */
		padding: var(--size-1);
		border-radius: var(--radius-2);
	}
	.fixed {
		position: fixed;
	}
	.basic {
		position: static;
		justify-self: end;
	}
</style>
