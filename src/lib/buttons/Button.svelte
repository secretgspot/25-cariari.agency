<script>
	import { navigating } from '$app/state';
	import { computeClasses, getDomAttributes } from './utils.js';
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

	const classes = $derived(
		`button ${rest.class ?? ''} ${computeClasses('btn', {
			size,
			shadow,
			outline,
			right,
		})}`,
	);

	const isDisabled = $derived(disabled || navigating.complete);
	const isLinkType = $derived(isLink || href);
	const linkHref = $derived(href ?? 'javascript:void(0);');
	const linkTarget = $derived(external ? '_blank' : null);

	// Spinner sizes based on button size
	const getSpinnerSize = $derived.by(() => {
		if (size === 'icon') return '21';
		if (size === 'block') return '15';
		if (size === 'small') return '12';
		return '18';
	});

	// Spinner sizes for icon state specifically
	const getIconSpinnerSize = $derived.by(() => {
		if (size === 'icon') return '21';
		if (size === 'small') return '27';
		return '36';
	});
</script>

{#if isLinkType}
	<a
		class:disabled={isDisabled}
		class={classes}
		data-sveltekit-prefetch
		role="button"
		href={linkHref}
		target={linkTarget}
		onclick={handleClick}
		{...rest}>
		{#if size === 'icon'}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
		{:else if size === 'block'}
			<div class="content_wrap">
				<span class="title">
					{#if loading}<Spinner size={getSpinnerSize} />{/if}
					{@render children?.()}
				</span>
			</div>
		{:else}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getIconSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
			<div class="content_wrap">
				<b class="title">{@render children?.()}</b>
			</div>
		{/if}
	</a>
{:else}
	<button
		{...rest}
		class:disabled={isDisabled}
		class={classes}
		disabled={isDisabled}
		onclick={handleClick}>
		{#if size === 'icon'}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
		{:else if size === 'block'}
			<div class="content_wrap">
				<span class="title">
					{#if loading}<Spinner size={getSpinnerSize} />{/if}
					{@render children?.()}
				</span>
			</div>
		{:else}
			<div class="icon_wrap">
				{#if loading}
					<Spinner size={getIconSpinnerSize} />
				{:else if icon}
					{@render icon()}
				{:else}
					🧵
				{/if}
			</div>
			<div class="content_wrap">
				<b class="title">{@render children?.()}</b>
			</div>
		{/if}
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
	}
	.button:hover,
	.button:active,
	.button:focus,
	.button.active {
		background: var(--primary-focus);
		/* background: hsl(var(--pf) / var(--bg-opacity, 0.45)); */
	}
	.shadow {
		box-shadow: var(--shadow-button);
	}
	.shadow:hover,
	.shadow:active {
		box-shadow: var(--shadow-button-active);
	}
	.icon_wrap {
		display: flex;
	}
	.content_wrap {
		display: flex;
		flex-flow: column;
	}

	.btn-icon {
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
	}
	.btn-icon:hover {
		background: transparent;
		color: var(--primary-content);
		outline: solid 6px hsl(var(--a) / var(--bg-opacity, 0.1));
	}
	.btn-icon .icon_wrap {
		padding: var(--padding-extra-small);
	}

	.btn-small {
		align-items: center;
		white-space: nowrap;
	}
	.btn-small:active,
	.btn-small:focus,
	.btn-small:hover {
		background: var(--primary);
		/* border-color: var(--accent); */
		border-style: solid;
	}
	.btn-small .icon_wrap {
		padding: var(--padding-small);
	}
	.btn-small .content_wrap {
		padding: 0 calc(var(--padding-small) * 2);
		border-left: var(--border);
	}

	.btn-medium {
		width: 270px;
		align-items: center;
		/* box-shadow: var(--shadow-small); */
	}
	.btn-medium:active,
	.btn-medium:focus,
	.btn-medium:hover {
		border-style: solid;
		/* border-color: var(--accent); */
	}
	.btn-medium .icon_wrap {
		display: flex;
		flex-flow: row wrap;
		justify-content: flex-start;
		align-items: center;
		padding: var(--padding-small);
	}
	.btn-medium .content_wrap {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: flex-start;
		flex: 1 0 auto;
		padding: var(--padding-small);
		border-left: var(--border);
	}

	.btn-block {
		width: 100%;
		padding: var(--padding-small);
		/* text-shadow: 0 1px 0 var(--base-300); */
		font-weight: 600;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.btn-block:active,
	.btn-block:focus,
	.btn-block:hover {
		border-style: solid;
		/* border-color: var(--accent); */
	}
	.btn-block .content_wrap {
		flex: 1;
	}
	.btn-block .content_wrap .title {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.right {
		flex-flow: row-reverse;
	}
	.right .content_wrap {
		border-left: 0;
		border-right: var(--border);
	}
	[disabled],
	.disabled {
		cursor: pointer;
		background: var(--primary-focus);
		opacity: 0.6;
		pointer-events: none;
	}
	[disabled]:hover,
	[disabled]:focus,
	.disabled:focus,
	.disabled:hover {
		background: var(--primary-focus);
		box-shadow: none;
		opacity: 0.6;
	}
	[green] {
		border-color: var(--success);
	}
	[green]:hover {
		border-color: var(--info);
		filter: hue-rotate(111deg);
	}
	[red] {
		border-color: var(--error);
	}
	[red]:hover {
		border-color: var(--info);
		filter: hue-rotate(111deg);
	}
</style>
