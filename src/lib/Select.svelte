<script>
	/** @type {{name?: string, label?: string, selected?: string, disabled?: boolean, options?: string[], variant?: 'default' | 'filter'}} */
	/* Usage
	/ 			<Select
						name="land_use"
						bind:selected={property.land_use}
						options={['House', 'Condo', 'Apartment']} />
	*/
	let {
		name = '',
		label = '',
		selected = $bindable(),
		disabled = false,
		options = ['Residential', 'Commercial', 'Industrial'],
		variant = 'default',
	} = $props();
</script>

<label class="select" class:filter={variant === 'filter'} {disabled}>
	{#if label && variant === 'filter'}
		<span class="label-text">{label}</span>
	{/if}
	<select {name} bind:value={selected}>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
	{#if label && variant !== 'filter'}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	select {
		appearance: base-select;
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-width: 69px;

		&::picker-icon {
			margin-left: auto;
		}

		&:open::picker-icon {
			rotate: 180deg;
		}

		&::picker(select) {
			appearance: base-select;
			background: var(--surface-1);
			border: var(--border-size-1) solid var(--surface-4);
			border-radius: var(--radius-2);
			box-shadow: var(--shadow-2);
		}

		option {
			display: flex;
			justify-content: flex-start;
			gap: 20px;

			background: var(--surface-1);
			padding: var(--size-2);
			color: var(--text-1);

			&:hover,
			&:focus {
				background: var(--surface-2);
			}
			&::checkmark {
				order: 1;
				margin-left: auto;
				content: '✔';
				/* color: var(--accent); */
			}
		}
	}
	.label-text {
		font-size: small;
		color: var(--text-2);
	}

	.select.filter {
		display: grid;
		gap: var(--size-1);

		.label-text {
			font-size: 0.68rem;
			line-height: 1.3;
		}

		select {
			box-sizing: border-box;
			width: 100%;
			min-height: 2.45rem;
			padding: 0.45rem 0.65rem;
			border: 1px solid var(--surface-4);
			border-radius: var(--radius-2);
			background: var(--surface-1);
			color: var(--text-1);
			font: inherit;
			font-size: 0.82rem;
			transition:
				border-color var(--transition, 180ms),
				box-shadow var(--transition, 180ms);

			&:hover {
				border-color: var(--text-2);
			}

			&:focus-visible {
				border-color: var(--accent);
				outline: 2px solid var(--accent);
				outline-offset: 2px;
			}
		}
	}
</style>
