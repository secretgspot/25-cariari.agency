<script>
	/** @type {{selected?: any, disabled?: boolean, options?: any}} */
	let {
		selected = $bindable([]),
		disabled = false,
		options = ['Sale', 'Rent'],
	} = $props();
</script>

{#each options as option, indx}
	<div class="checkbox-circle">
		<input
			type="checkbox"
			id={option}
			name={option}
			value={option}
			bind:group={selected}
			{disabled} />
		<label for={option}>{option}</label>
	</div>
{:else}
	<p>no data</p>
{/each}

<style>
	/* checkbox-circle */
	.checkbox-circle input[type='checkbox'] {
		display: none;
	}

	.checkbox-circle input[type='checkbox'] + label {
		display: block;
		position: relative;
		padding-left: var(--padding-medium);
		margin-bottom: 20px;
		cursor: pointer;
		user-select: none;
	}

	.checkbox-circle input[type='checkbox']:hover + label:hover {
		color: var(--secondary-content);
	}

	.checkbox-circle input[type='checkbox']:hover + label:before {
		border: var(--border);
		width: 1.3em;
		height: 1.3em;
		border: 1px solid var(--accent);
	}

	.checkbox-circle input[type='checkbox'] + label:last-child {
		margin-bottom: 0;
	}

	.checkbox-circle input[type='checkbox'] + label:before {
		content: '';
		display: block;
		width: 1.4em;
		height: 1.4em;
		border: var(--border);
		border-radius: 50%;
		position: absolute;
		left: 0;
		top: 50%;
		/* background: var(--neutral); */
		transform: translateY(-50%);
	}

	.checkbox-circle input[type='checkbox']:checked + label:before {
		border-radius: 50%;
		border: 1px solid var(--accent);
		width: 1.3em;
		height: 1.3em;
		/* background: var(--success); */
		box-shadow: inset 0px 0px 0 3px var(--success);
	}

	/* checkbox-circle end */
</style>
