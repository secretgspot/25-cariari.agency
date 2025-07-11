<script>
	/** @type {{checked?: boolean, label?: string, name?: string, disabled?: boolean, kind?: string, on?: string, off?: string}} */
	let {
		checked = $bindable(false),
		label = '',
		name = '',
		disabled = false,
		kind = 'basic', // basic|skewed|flip
		on = '',
		off = '',
		...rest
	} = $props();
</script>

<div class="toggle">
	<input
		type="checkbox"
		bind:checked
		class="tgl {kind}"
		{...rest}
		id={name}
		value={label}
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
			/* & *,
			& *:after,
			& *:before, */
			& + label {
				box-sizing: border-box;
				&::selection {
					background: none;
				}
			}

			+ label {
				outline: 0;
				display: block;
				width: 4em;
				height: 2em;
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
				/* transition: all 0.3s ease; */
				&:after {
					border-radius: var(--border-radius);
					background: var(--error);
					/* transition: all 0.1s ease; */
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
				background: var(--error);
				min-width: 100px;
				&:after,
				&:before {
					transform: skew(10deg);
					display: inline-block;
					transition: all 0.2s ease;
					width: 100%;
					text-align: center;
					position: absolute;
					line-height: 2em;
					font-weight: bold;
					color: var(--color-white);
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
					background: var(--error);
					&:before {
						left: -10%;
					}
				}
			}

			&:checked + label {
				background: var(--success);
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
		}

		.flip {
			+ label {
				padding: 2px;
				transition: all 0.2s ease;
				perspective: 100px;
				min-width: 90px;
				&:after,
				&:before {
					display: inline-block;
					transition: all 0.3s ease;
					width: 100%;
					text-align: center;
					position: absolute;
					line-height: 2em;
					color: var(--color-white);
					position: absolute;
					top: 0;
					left: 0;
					backface-visibility: hidden;
					border-radius: var(--border-radius);
				}

				&:after {
					content: attr(data-tg-on);
					background: var(--success);
					transform: rotateY(-180deg);
				}

				&:before {
					background: var(--error);
					content: attr(data-tg-off);
				}

				&:active:before {
					transform: rotateY(-20deg);
				}
			}

			&:checked + label {
				&:before {
					transform: rotateY(180deg);
				}

				&:after {
					transform: rotateY(0);
					left: 0;
					background: var(--success);
				}

				&:active:after {
					transform: rotateY(20deg);
				}
			}
		}
	}
</style>
