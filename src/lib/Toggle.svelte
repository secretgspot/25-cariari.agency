<script>
	/** @type {{checked?: boolean, label?: string, name?: string, disabled?: boolean}} */
	let {
		checked = $bindable(false),
		label = '',
		name = '',
		disabled = false,
		...rest
	} = $props();
</script>

<div class="toggle">
	<input
		type="checkbox"
		bind:checked
		{...rest}
		id={name}
		value={label}
		{name}
		{disabled} />
	<label for={name}></label>
</div>

<style>
	.toggle input[type='checkbox'] {
		display: none;
	}
	.toggle input[type='checkbox'] + label {
		display: block;
		position: relative;
		width: 3em;
		height: 1.8em;
		border-radius: var(--border-radius);
		border: var(--border);
		cursor: pointer;
		user-select: none;
	}
	.toggle input[type='checkbox'] + label:before {
		content: '';
		display: block;
		width: 1.2em;
		height: 1.2em;
		border-radius: 0.2em;
		background: var(--error);
		position: absolute;
		left: 0.2em;
		top: 0.2em;
	}
	.toggle input[type='checkbox']:checked + label:before {
		background: var(--success);
		left: 1.6em;
	}
</style>
