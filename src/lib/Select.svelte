<script>
	/** @type {{name?: any, selected?: string, disabled?: boolean, options?: array}} */
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
	} = $props();
</script>

<label class="select" {disabled}>
	<select {name} bind:value={selected}>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
	{#if label}
		<span class="label-text">{label}</span>
	{/if}
</label>

<style>
	select {
		appearance: base-select;
		min-width: 69px;
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
</style>
