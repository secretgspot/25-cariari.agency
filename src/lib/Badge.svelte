<script>
	import Icon from './Icon.svelte';
	/** @type {{type?: string, label: any, value: any, direction?: string, loop?: boolean}} */
	let {
		type = 'text', // icon | text | tiny
		label,
		value,
		direction = 'column',
		loop = false,
	} = $props();
</script>

<div class="badge {direction}" title="{value} {label}">
	{#if type === 'icon'}
		<!-- <img class="icon" src="images/icons/icon_{label}.svg" alt="{label}" loading="eager"> -->
		<Icon kind={label} size="30" />
		<div class="value">{value}</div>
	{:else if type === 'tiny'}
		<div class="value">{value}</div>
		<Icon kind={label} size="15" />
	{:else if type === 'text'}
		{#if loop}
			<div class="value">
				{#each value as val}
					<span>{val}</span>
				{/each}
			</div>
		{:else if value}
			<div class="value">{value}</div>
		{:else}
			<div class="value">N/A</div>
		{/if}
		<div class="label">{label}</div>
	{/if}
</div>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
	}
	/* .icon {
		width: 30px;
		height: 27px;
	} */
	.badge :global(svg) {
		color: var(--text-1);
	}
	.label {
		text-transform: uppercase;
		/* line-height: 1; */
		/* font-family: 'Economica', sans-serif; */
		font-size: 0.6rem;
		color: var(--text-2);
	}
	.value {
		/* font-size: 1.8em; */
		color: var(--text-1);
		/* line-height: 1; */
		/* font-family: 'Cabin', sans-serif; */
	}
	.row {
		flex-direction: row-reverse;
		justify-content: center;
	}
	.row .label {
		margin-right: 1rem;
	}
	.row .value {
		display: flex;
		flex-wrap: wrap;
	}
	.column {
		flex-direction: column;
	}

	span {
		margin: 0 0.2rem;
		border: var(--border-size-1) dashed var(--surface-2);
		padding: 0 0.2rem;
		border-radius: var(--radius-2);
		border-top: none;
		border-bottom: none;
		text-transform: uppercase;
	}
</style>
