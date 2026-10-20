<script>
	import { playButtonSound } from '#lib/utils/audio.js';
	import { vibrateButton } from '#lib/utils/vibrate.js';

	/**
	 * @type {{
	 *   active?: boolean;
	 *   label?: string;
	 *   color?: string;
	 *   count?: number | string | null;
	 *   sound?: boolean;
	 *   buzz?: boolean;
	 *   sound_pattern?: string;
	 *   vibration_pattern?: string;
	 *   onchange?: (active: boolean) => void;
	 * }}
	 */
	let {
		active = $bindable(false),
		label = '',
		color = '',
		count = null,
		sound = true,
		buzz = true,
		sound_pattern = 'click',
		vibration_pattern = 'click',
		onchange,
		...rest
	} = $props();

	function handleClick(event) {
		if (sound) playButtonSound(sound_pattern);
		if (buzz) vibrateButton(vibration_pattern);
		active = !active;
		if (onchange) onchange(active);
		if (rest.onclick) rest.onclick(event);
	}
</script>

<button
	type="button"
	class="filter-chip"
	class:active
	onclick={handleClick}
	aria-pressed={active}
	{...rest}>
	{#if color}
		<span class="chip-dot" style:background={color}></span>
	{/if}
	<span class="chip-label">{label}</span>
	{#if count !== null && count !== undefined}
		<span class="chip-count">{count}</span>
	{/if}
</button>

<style>
	.filter-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: transparent;
		color: var(--text-2);
		border: 1px solid transparent;
		border-radius: var(--radius-round, 999px);
		padding: 3px 8px;
		font-family: inherit;
		font-size: var(--font-size-0, 0.82rem);
		font-weight: 500;
		cursor: pointer;
		user-select: none;
		transition: all var(--transition, 0.15s ease);
		opacity: 0.55;
	}

	.filter-chip.active {
		color: var(--text-1);
		background: var(--surface-2);
		border-color: var(--surface-4);
		opacity: 1;
		font-weight: 600;
	}

	.filter-chip:hover {
		opacity: 0.9;
	}

	.chip-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		display: inline-block;
		flex-shrink: 0;
	}

	.chip-count {
		font-size: 0.72rem;
		background: var(--surface-3);
		color: var(--text-2);
		padding: 1px 5px;
		border-radius: var(--radius-round, 999px);
		line-height: 1.2;
	}

	.filter-chip.active .chip-count {
		background: var(--surface-4);
		color: var(--text-1);
	}
</style>
