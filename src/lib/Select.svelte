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
		selected = $bindable(),
		disabled = false,
		options = ['Residential', 'Commercial', 'Industrial'],
	} = $props();
</script>

<label class="select">
	<select {name} bind:value={selected}>
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>

<style>
	select,
	::picker(select) {
		appearance: base-select;
	}

	select {
		&:open::picker-icon {
			rotate: 180deg;
		}
		option {
			display: flex;
			justify-content: flex-start;
			gap: 20px;

			background: var(--primary);
			padding: var(--padding-small);
			color: var(--primary-content);

			&:hover,
			&:focus {
				background: var(--primary-focus);
			}
			&::checkmark {
				order: 1;
				margin-left: auto;
				content: '✔';
			}
		}
	}
</style>
