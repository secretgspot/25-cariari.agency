<script>
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
		<svg
			data-v-4c034fe6=""
			xmlns="http://www.w3.org/2000/svg"
			width="24px"
			height="24px"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="icon-svg">
			{#if type == 'tip'}
				<circle data-v-4c034fe6="" cx="12" cy="12" r="10" /><line
					data-v-4c034fe6=""
					x1="12"
					y1="8"
					x2="12"
					y2="12" /><line data-v-4c034fe6="" x1="12" y1="16" x2="12.01" y2="16" />
			{:else if type == 'danger'}
				<polygon
					data-v-4c034fe6=""
					points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" /><line
					data-v-4c034fe6=""
					x1="12"
					y1="8"
					x2="12"
					y2="12" /><line data-v-4c034fe6="" x1="12" y1="16" x2="12.01" y2="16" />
			{:else if type == 'warn'}
				<path
					data-v-4c034fe6=""
					d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line
					data-v-4c034fe6=""
					x1="12"
					y1="9"
					x2="12"
					y2="13" /><line data-v-4c034fe6="" x1="12" y1="17" x2="12.01" y2="17" />
			{:else if type == 'success'}
				<path
					data-v-4c034fe6=""
					d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
			{/if}
		</svg>
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
		width: fit-content;
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
