<script>
	import Icon from '$lib/Icon.svelte';
	// https://joyofcode.xyz/animation-with-svelte for animation/transition
	// import { scale } from "svelte/transition";
	/** @type {{type?: string, children?: import('svelte').Snippet, [key: string]: any}} */
	let { type = 'tip', children, ...rest } = $props();
</script>

<!-- {#key type} -->
<aside
	class:success={type == 'success'}
	class:danger={type == 'danger'}
	class:warn={type == 'warn'}
	class:tip={type == 'tip'}
	{...rest}>
	<div class="icon">
		{#if type == 'tip'}
			<Icon kind="info" size="27" class="icon-svg" />
		{:else if type == 'danger'}
			<Icon kind="error" size="27" class="icon-svg" />
		{:else if type == 'warn'}
			<Icon kind="warning" size="27" class="icon-svg" />
		{:else if type == 'success'}
			<Icon kind="success" size="27" class="icon-svg" />
		{/if}
	</div>

	<strong class="title">
		{#if type == 'tip'}
			Notice
		{:else if type == 'danger'}
			An Error
		{:else if type == 'warn'}
			Warning
		{:else if type == 'success'}
			Success
		{/if}
	</strong>

	<p class="message">
		{@render children?.()}
	</p>
</aside>

<!-- {/key} -->
<style>
	aside {
		display: grid;
		/* width: fit-content; */
		height: min-content;
		max-width: 69ch;
		grid-template-areas:
			'icon title'
			'.  message';
		grid-template-rows: 0.5fr 1fr;
		grid-template-columns: 45px 1fr;
		border: var(--border-size-1) solid var(--surface-4);
		border-left-width: var(--border-size-3);
		border-radius: var(--radius-2);
		padding: var(--size-3);
		margin: var(--size-3);

		.icon {
			grid-area: icon;
		}
		.title {
			grid-area: title;
		}
		.message {
			grid-area: message;
			margin-top: 0;
		}

		&.success {
			border-color: var(--success);
			color: var(--success-content);
			.icon {
				color: var(--success);
			}
		}
		&.danger {
			border-color: var(--error);
			color: var(--error-content);
			.icon {
				color: var(--error);
			}
		}
		&.warn {
			border-color: var(--warning);
			color: var(--warning-content);
			.icon {
				color: var(--warning);
			}
		}
		&.tip {
			border-color: var(--info);
			color: var(--info-content);
			.icon {
				color: var(--info);
			}
		}
	}

	@media only screen and (min-width: 541px) {
		aside {
			margin: 0;
		}
	}
</style>
