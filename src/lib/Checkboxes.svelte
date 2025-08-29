<script>
	import { playChime, playChimeSequence, chimePatterns } from '$lib/utils/audio.js';
	import { vibrate, vibratePatterns } from '$lib/utils/vibrate.js';

	/** @type {{selected?: any, disabled?: boolean, options?: any, kind?: string}} */
	let {
		selected = $bindable(),
		disabled = false,
		options = ['Sale', 'Rent'],
		kind = 'square',
		sound = true,
		sound_pattern = 'tick', // basic, successA, successB, successC, failA, failB, failC, notification, warning, tick, swipe, bell, click
		buzz = true,
		...rest
	} = $props();

	function handleChange(event) {
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

		if (rest.onchange) {
			rest.onchange(event);
		}
	}
</script>

{#each options as option, indx}
	<div class={kind} {...rest}>
		<input
			type="checkbox"
			id={'chk-' + option}
			name={option}
			value={option}
			bind:group={selected}
			{disabled}
			onchange={handleChange} />
		<label for={'chk-' + option}>{option}</label>
	</div>
{:else}
	<p>no data</p>
{/each}

<style>
	/* Base for label styling */
	.square {
		[type='checkbox']:not(:checked),
		[type='checkbox']:checked {
			display: none;
		}
		[type='checkbox']:not(:checked) + label,
		[type='checkbox']:checked + label {
			position: relative;
			padding-left: var(--size-7);
			line-height: 1.7;
			cursor: pointer;
			user-select: none;
		}

		/* checkbox aspect */
		[type='checkbox']:not(:checked) + label:before,
		[type='checkbox']:checked + label:before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 1.4em;
			height: 1.4em;
			border: var(--border-size-1) solid var(--surface-4);
			border-radius: var(--radius-2);
		}

		/* checked mark aspect */
		[type='checkbox']:not(:checked) + label:after,
		[type='checkbox']:checked + label:after {
			content: '✔';
			position: absolute;
			top: 6px;
			left: 0;
			font-size: 2.1em;
			color: var(--success);
			line-height: 0;
		}

		/* checked mark aspect changes */
		[type='checkbox']:not(:checked) + label:after {
			opacity: 0;
			transform: scale(0) rotate(45deg);
		}

		[type='checkbox']:checked + label:after {
			opacity: 1;
			transform: scale(1) rotate(0);
		}

		/* Disabled checkbox */
		[type='checkbox']:disabled:not(:checked) + label:before,
		[type='checkbox']:disabled:checked + label:before {
			box-shadow: none;
			border-color: var(--surface-2);
			background-color: var(--surface-2);
		}

		[type='checkbox']:disabled:checked + label:after {
			color: var(--surface-4);
		}

		[type='checkbox']:disabled + label {
			color: var(--text-2);
		}

		/* Accessibility */
		[type='checkbox']:checked:focus + label:before,
		[type='checkbox']:not(:checked):focus + label:before {
			box-shadow: inset 0px 0px 0 1px var(--accent);
		}
	}

	.circle input[type='checkbox'] {
		display: none;

		+ label {
			display: block;
			position: relative;
			padding-left: var(--size-7);
			margin-bottom: var(--size-3);
			cursor: pointer;
			user-select: none;

			&:last-child {
				margin-bottom: 0;
			}
			&:before {
				content: '';
				display: block;
				width: 1.4em;
				height: 1.4em;
				border: var(--border-size-1) solid var(--surface-4);
				border-radius: 50%;
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		&:hover {
			+ label {
				color: var(--text-2);
				&:before {
					border: 1px solid var(--accent);
					width: 1.3em;
					height: 1.3em;
				}
			}
		}

		&:checked {
			+ label:before {
				border-radius: 50%;
				border: 1px solid var(--accent);
				width: 1.3em;
				height: 1.3em;
				box-shadow: inset 0px 0px 0 3px var(--success);
			}
		}
	}
</style>
