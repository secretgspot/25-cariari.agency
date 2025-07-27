<script>
	import { computeClasses, getDomAttributes } from './utils.js';
	import { playChime, playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';

	/** @type {{disabled?: boolean, isLink?: boolean, href?: any, external?: boolean, sound?: boolean, pattern?: string, vibrate?: boolean, children?: import('svelte').Snippet, [key: string]: any}} */
	let {
		disabled = false,
		isLink = false,
		href = null,
		external = false,
		sound = true,
		sound_pattern = 'tick', // basic, successA, successB, successC, failA, failB, failC, notification, warning, tick, swipe, bell, click
		buzz = true,
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
</script>

{#if isLink || href}
	<a
		class:disabled
		data-sveltekit-prefetch
		{...rest}
		role="button"
		href={href ?? 'javascript:void(0);'}
		target={external ? '_blank' : null}
		onclick={handleClick}>
		{@render children?.()}
	</a>
{:else}
	<!-- removed onclic={preventDefault()} -->
	<button {...rest} class:disabled {disabled} onclick={handleClick}>
		{@render children?.()}
	</button>
{/if}

<style>
	button,
	a {
		border: none;
		background: none;

		cursor: pointer;
		font-size: inherit;
		text-decoration: none;
		/* font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(62, 207, 142); */
		box-shadow: var(--accent) 0 -2px 0 -1px inset;
		color: var(--primary-content);
		padding-bottom: 2px;
		transition: box-shadow 93ms ease-in-out;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		white-space: nowrap;
	}
	button:hover,
	a:hover {
		box-shadow: var(--accent) inset 0 -3px 0 -1px;
		color: var(--accent);
	}
	button.active,
	a.active {
		box-shadow: var(--accent) inset 0 -5px 0 -1px;
		color: var(--accent);
	}
</style>
