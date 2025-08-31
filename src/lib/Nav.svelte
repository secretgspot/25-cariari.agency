<script>
	import { page } from '$app/state';
	import { LinkButton } from '$lib/buttons';
	import Icon from '$lib/Icon.svelte';

	/** @type {{ is_logged_in: boolean; fixed?: boolean; basic?: boolean; url: any; }} */
	let { fixed = false, basic = false, url, ...rest } = $props();
	// console.log('Nav props', { page, fixed, basic, url, ...rest });
</script>

<!-- {JSON.stringify(is_logged_in, null, 2)} -->

<nav class="site-nav" class:fixed class:basic {...rest}>
	{#if page.url.pathname != '/'}
		<LinkButton href="/" underline={false} class="nav-link">
			<span class="nav-icon"><Icon kind="map" size="21" /></span>
			<span class="nav-text">Map</span>
		</LinkButton>
	{/if}
	{#if page.url.pathname != '/properties'}
		<LinkButton href="/properties" underline={false} class="nav-link">
			<span class="nav-icon"><Icon kind="properties" size="21" /></span>
			<span class="nav-text">Properties</span>
		</LinkButton>
	{/if}
	{#if page.url.pathname != '/properties/add'}
		<LinkButton href="/properties/add" underline={false} class="nav-link">
			<span class="nav-icon"><Icon kind="add" size="21" /></span>
			<span class="nav-text">Add</span>
		</LinkButton>
	{/if}
	{#if page.url.pathname != '/about'}
		<LinkButton href="/about" underline={false} class="nav-link">
			<span class="nav-icon"><Icon kind="about" size="21" /></span>
			<span class="nav-text">About</span>
		</LinkButton>
	{/if}
	{#if page.data.is_logged_in}
		<form action="/logout" method="post" class="form-logout">
			{#if page.data.is_admin}<span title="admin">🔥</span>{/if}
			<LinkButton
				sound_pattern="logout"
				underline={false}
				title="Logout"
				class="nav-link">
				<Icon kind="logout" size="18" />
			</LinkButton>
		</form>
	{:else}
		<LinkButton href="/login">Login</LinkButton>
	{/if}
</nav>

<style>
	nav.site-nav {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		user-select: none;
		z-index: 3;
		display: flex;
		align-items: center;
		gap: var(--size-3);
		list-style: none;
		background: var(--surface-1);
		padding: var(--size-1);
		border-radius: var(--radius-2);

		&.fixed {
			position: fixed;
		}
		&.basic {
			position: static;
			justify-self: end;
		}

		.nav-text {
			display: none;
			color: var(--text-2);
			@media (min-width: 481px) {
				display: block;
			}
		}
		:global(.nav-link) {
			display: flex;
			align-items: flex-end;
			gap: var(--size-2);
			color: var(--text-1);
			&:hover {
				color: var(--accent);
			}
		}

		.form-logout {
			display: grid;
			align-items: stretch;
			justify-items: stretch;
			> span[title='admin'] {
				font-size: small;
				grid-area: 1/1;
			}
			:global(.nav-link) {
				grid-area: 1/1;
			}
		}
	}
</style>
