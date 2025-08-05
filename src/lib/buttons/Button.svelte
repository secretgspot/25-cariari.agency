<script>
	import { navigating } from '$app/state';
	import { Spinner } from '$lib/loaders';
	import { playChime, playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';

	let {
		size = 'medium',
		disabled = false,
		outline = false,
		right = false,
		loading = false,
		shadow = false,
		isLink = false,
		href = false,
		external = false,
		sound = true,
		sound_pattern = 'tick', // basic, successA, successB, successC, failA, failB, failC, notification, warning, tick, swipe, bell, click
		buzz = true,
		icon,
		children,
		...rest
	} = $props();

	function handleClick(event) {
		if (sound) {
			const selectedPattern = chimePatterns[sound_pattern];
			if (selectedPattern) {
				if (Array.isArray(selectedPattern)) {
					playChimeSequence(selectedPattern);
				} else {
					playChime(
						selectedPattern.frequency,
						selectedPattern.duration,
						selectedPattern.volume,
						selectedPattern.waveType,
					);
				}
			}
		}

		if (buzz) {
			vibrate(vibratePatterns.basic);
		}

		if (rest.onclick) {
			rest.onclick(event);
		}
	}

	const isDisabled = $derived(disabled || navigating.complete);
	const isLinkType = $derived(isLink || href);
	const linkHref = $derived(href ?? 'javascript:void(0);');
	const linkTarget = $derived(external ? '_blank' : null);
</script>

<!-- Icon Content Component -->
{#snippet iconContent()}
	<div class="icon_wrap">
		{#if loading}
			<Spinner size={16} />
		{:else if icon}
			{@render icon()}
		{:else}
			🧵
		{/if}
	</div>
{/snippet}

<!-- Text Content Component -->
{#snippet textContent()}
	<div class="content_wrap">
		{#if size === 'block'}
			<span class="title">
				{#if loading}<Spinner size={16} />{/if}
				{@render children?.()}
			</span>
		{:else}
			<b class="title">{@render children?.()}</b>
		{/if}
	</div>
{/snippet}

<!-- Button Content Component -->
{#snippet buttonContent()}
	{#if size === 'icon'}
		{@render iconContent()}
	{:else if size === 'block'}
		{@render textContent()}
	{:else}
		{@render iconContent()}
		{@render textContent()}
	{/if}
{/snippet}

<!-- Main Template -->
{#if isLinkType}
	<a
		class="button {size} {rest.class ?? ''}"
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		href={linkHref}
		target={linkTarget}
		role="button"
		data-sveltekit-prefetch
		{...rest}
		onclick={handleClick}>
		{@render buttonContent()}
	</a>
{:else}
	<button
		class="button {size} {rest.class ?? ''}"
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		disabled={isDisabled}
		{...rest}
		onclick={handleClick}>
		{@render buttonContent()}
	</button>
{/if}

<style>
	.button {
		display: flex;
		width: auto;
		height: min-content;
		border: var(--border);
		border-radius: var(--border-radius);
		/* background: var(--primary); */
		background: hsl(var(--p) / var(--bg-opacity, 1));
		color: var(--primary-content);
		text-decoration: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition) cubic-bezier(0.33, 1, 0.69, 1);
		touch-action: manipulation;
		z-index: 2;
		&:hover,
		&:active,
		&:focus,
		&.active {
			background: var(--primary-focus);
			/* background: hsl(var(--pf) / var(--bg-opacity, 0.45)); */
		}
	}
	.shadow {
		box-shadow: var(--shadow-button);
		&:hover,
		&:active {
			box-shadow: var(--shadow-button-active);
		}
	}
	.icon_wrap {
		display: flex;
	}
	.content_wrap {
		display: flex;
		flex-flow: column;
	}

	.icon {
		display: inline-flex;
		align-items: center;
		border-radius: var(--border-radius);
		/* box-shadow: inherit; */
		justify-content: center;
		width: inherit;
		height: inherit;
		/* border-color: transparent; */
		background: transparent;
		color: var(--primary);
		&:hover {
			background: transparent;
			color: var(--primary-content);
			outline: solid 6px hsl(var(--a) / var(--bg-opacity, 0.1));
		}

		.icon_wrap {
			padding: var(--padding-extra-small);
		}
	}

	.small {
		align-items: center;
		white-space: nowrap;
		&:active,
		&:focus,
		&:hover {
			background: var(--primary);
			/* border-color: var(--accent); */
			border-style: solid;
		}
		.icon_wrap {
			padding: var(--padding-small);
		}
		.content_wrap {
			padding: 0 calc(var(--padding-small) * 2);
			border-left: var(--border);
		}
	}

	.medium {
		width: 270px;
		align-items: center;
		/* box-shadow: var(--shadow-small); */
		&:active,
		&:focus,
		&:hover {
			border-style: solid;
			/* border-color: var(--accent); */
		}
		.icon_wrap {
			display: flex;
			flex-flow: row wrap;
			justify-content: flex-start;
			align-items: center;
			padding: var(--padding-small);
		}
		.content_wrap {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: flex-start;
			flex: 1 0 auto;
			padding: var(--padding-small);
			border-left: var(--border);
		}
	}

	.block {
		width: 100%;
		padding: var(--padding-small);
		/* text-shadow: 0 1px 0 var(--base-300); */
		font-weight: 600;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		&:active,
		&:focus,
		&:hover {
			border-style: solid;
			/* border-color: var(--accent); */
		}
		.content_wrap {
			flex: 1;
			.title {
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.right {
		flex-flow: row-reverse;
		.content_wrap {
			border-left: 0;
			border-right: var(--border);
		}
	}
	[disabled],
	.disabled {
		cursor: pointer;
		background: var(--primary-focus);
		opacity: 0.6;
		pointer-events: none;
		&:hover,
		&:focus {
			background: var(--primary-focus);
			box-shadow: none;
			opacity: 0.6;
		}
	}
	[green] {
		border-color: var(--success);
		&:hover {
			border-color: var(--info);
			filter: hue-rotate(111deg);
		}
	}
	[red] {
		border-color: var(--error);
		&:hover {
			border-color: var(--info);
			filter: hue-rotate(111deg);
		}
	}
</style>
