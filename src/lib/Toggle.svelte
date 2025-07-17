<script>
	/** @type {{checked?: boolean, label?: string, name?: string, disabled?: boolean, kind?: string, colored?: boolean, on?: string, off?: string}} */
	let {
		checked = $bindable(false),
		label = '',
		name = '',
		disabled = false,
		kind = 'basic', // basic|skewed|flip
		colored = false,
		on = '',
		off = '',
		...rest
	} = $props();
</script>

<div class="toggle">
	<input
		type="checkbox"
		bind:checked
		class:colored
		class="tgl {kind}"
		{...rest}
		id={name}
		{name}
		{disabled} />
	<label for={name} data-label={label} data-tg-off={off} data-tg-on={on}></label>
</div>

<style>
	.toggle {
		.tgl {
			display: none;

			&,
			&:after,
			&:before,
			& + label {
				box-sizing: border-box;
				&::selection {
					background: none;
				}
			}

			+ label {
				outline: 0;
				display: block;
				width: min-content;
				height: min-content;
				position: relative;
				cursor: pointer;
				user-select: none;
				&:after,
				&:before {
					position: relative;
					display: block;
					content: '';
					width: 50%;
					height: 100%;
				}

				&:after {
					left: 0;
				}

				&:before {
					display: none;
				}
			}

			&:checked + label:after {
				left: 50%;
			}
		}

		.basic {
			+ label {
				border: var(--border);
				border-radius: var(--border-radius);
				padding: 2px;
				&:after {
					border-radius: var(--border-radius);
					background: var(--error);
				}
			}

			&:checked + label::after {
				background: var(--success);
			}
		}

		.skewed {
			+ label {
				overflow: hidden;
				transform: skew(-10deg);
				backface-visibility: hidden;
				transition: all 0.2s ease;
				border: 1px solid var(--accent);
				width: 4em;
				height: 2em;
				min-width: min-content;
				&:after,
				&:before {
					transform: skew(10deg);
					display: inline-flex;
					align-items: center;
					justify-content: center;
					text-align: center;
					transition: all 0.2s ease;
					width: 100%;
					position: absolute;
					font-weight: bold;
					color: var(--primary-content);
					text-shadow: var(--shadow-small);
				}

				&:after {
					left: 100%;
					content: attr(data-tg-on);
				}

				&:before {
					left: 0;
					content: attr(data-tg-off);
				}

				&:active {
					&:before {
						left: -10%;
					}
				}
			}

			&.colored + label {
				background: var(--error);
				border-color: transparent;
				&::before,
				&::after {
					color: var(--color-white);
				}
			}

			&:checked + label {
				&:before {
					left: -100%;
				}

				&:after {
					left: 0;
				}

				&:active:after {
					left: 10%;
				}
			}
			&.colored:checked + label {
				background: var(--success);
			}
		}

		.flip {
			+ label {
				padding: var(--padding-small);
				transition: all 0.2s ease;
				perspective: 100px;
				min-width: 90px;
				&:after,
				&:before {
					display: inline-flex;
					align-items: center;
					justify-content: center;
					text-align: center;
					transition: all 0.3s ease;
					width: 100%;
					color: var(--primary-content);
					position: absolute;
					top: 0;
					left: 0;
					backface-visibility: hidden;
					border-radius: var(--border-radius);
					border: 1px solid var(--accent);
				}

				&:after {
					content: attr(data-tg-on);
					transform: rotateY(-180deg);
				}

				&:before {
					content: attr(data-tg-off);
				}

				&:active:before {
					transform: rotateY(-20deg);
				}
			}
			&.colored + label {
				&::before {
					background: var(--error);
					border-color: var(--error);
					color: var(--color-white);
				}
				&::after {
					background: var(--success);
					border-color: var(--success);
					color: var(--color-white);
				}
			}

			&:checked + label {
				&:before {
					transform: rotateY(180deg);
				}

				&:after {
					transform: rotateY(0);
					left: 0;
				}

				&:active:after {
					transform: rotateY(20deg);
				}
			}
		}
	}
</style>
