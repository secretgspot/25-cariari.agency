<script>
	import { navigating } from '$app/state';
	import { Spinner } from '$lib/loaders';
	import { playButtonSound } from '$lib/utils/audio.js';
	import { vibrateButton } from '$lib/utils/vibrate.js';

	let {
		size = 'regular', // regular, icon, small, block
		disabled = false,
		outline = false,
		right = false,
		active = false,
		loading = false,
		shadow = false,
		isLink = false,
		href = false,
		external = false,
		sound = true,
		sound_pattern = 'click',
		buzz = true,
		buzz_pattern = 'click',
		icon,
		children,
		onclick,
		class: customClass = '', // Extract class prop separately
		...rest
	} = $props();

	function handleClick(event) {
		// Play sound if enabled locally
		if (sound) {
			playButtonSound(sound_pattern);
		}

		// Trigger vibration if enabled locally
		if (buzz) {
			vibrateButton(buzz_pattern);
		}

		// Call the original onclick handler
		if (rest.onclick) {
			rest.onclick(event);
		}
	}

	// Only keep the derived values we actually need
	const isDisabled = $derived(disabled || loading || navigating.complete);
	const isLinkType = $derived(isLink || href);
	const linkHref = $derived(href ?? 'javascript:void(0);');
	const linkTarget = $derived(external ? '_blank' : null);

	// Combine all classes properly
	const buttonClasses = $derived(`button ${size} ${customClass}`.trim());
</script>

<!-- Icon Content Component -->
{#snippet iconContent()}
	<div class="icon_wrap">
		{#if loading}
			<Spinner size={16} />
		{:else if icon}
			{@render icon()}
		{:else}
			👀
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
			<span class="title">{@render children?.()}</span>
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
		role="button"
		{...rest}
		class={buttonClasses}
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		class:active
		href={linkHref}
		target={linkTarget}
		onclick={handleClick}>
		{@render buttonContent()}
	</a>
{:else}
	<button
		class={buttonClasses}
		class:disabled={isDisabled}
		class:shadow
		class:outline
		class:right
		class:active
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
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-2);
		background: transparent;
		text-decoration: none;
		padding: 0;
		cursor: pointer;
		user-select: none;
		transition: background var(--transition) cubic-bezier(0.33, 1, 0.69, 1);
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
		&:hover,
		&:active,
		&:focus,
		&.active {
			background: var(--surface-2);
		}

		.icon_wrap {
			display: flex;
		}

		.content_wrap {
			display: flex;
			flex-flow: column;
		}
	}

	.icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: inherit;
		height: inherit;

		.icon_wrap {
			padding: var(--size-1);
		}
	}

	.small {
		align-items: center;
		white-space: nowrap;
		.icon_wrap {
			padding: var(--size-2);
		}

		.content_wrap {
			padding: 0 calc(var(--size-2) * 2);
			border-left: var(--border-size-1) solid var(--surface-3);
		}
	}

	.regular {
		align-items: center;

		.icon_wrap {
			display: flex;
			flex-flow: row wrap;
			justify-content: flex-start;
			align-items: center;
			padding: var(--size-3);
		}

		.content_wrap {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: flex-start;
			flex: 1 0 auto;
			padding: var(--size-3);
			border-left: var(--border-size-1) solid var(--surface-3);
		}
	}

	.block {
		width: 100%;
		align-items: center;
		justify-content: center;

		.content_wrap {
			display: flex;
			flex-flow: column nowrap;
			justify-content: center;
			align-items: flex-start;
			padding: var(--size-3);
		}
	}

	.right {
		flex-flow: row-reverse;
		place-self: end;
		.content_wrap {
			border-left: 0;
			border-right: var(--border-size-1) solid var(--surface-3);
		}
	}

	.outline {
		outline: 1px solid var(--stone-9);
		&:active,
		&.active {
			outline: 2px solid var(--stone-3);
		}
	}

	.shadow {
		box-shadow: 0px 2px 0px 0px var(--surface-4);
		&:active {
			box-shadow: 0px 0px 0px 0px var(--surface-4);
			transform: translateY(2px);
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

	[green],
	.green {
		border-color: var(--green-3);
		&:hover {
			border-color: var(--green-4);
		}
	}

	[red],
	.red {
		border-color: var(--red-3);
		&:hover {
			border-color: var(--red-4);
		}
	}
</style>
