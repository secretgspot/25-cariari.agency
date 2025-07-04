<script>
	import Icon from "./Icon.svelte";
	/** @type {{type?: string, label: any, value: any, direction?: string, loop?: boolean}} */
	let {
		type = "text",
		label,
		value,
		direction = "column",
		loop = false
	} = $props();
</script>

<div class="badge {direction}">
	{#if type === "icon"}
		<!-- <img class="icon" src="images/icons/icon_{label}.svg" alt="{label}"> -->
		<Icon type={label} size="30" />
		<div class="value">{value}</div>
	{:else if type === "text"}
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
		color: var(--primary-content);
	}
	.label {
		text-transform: uppercase;
		/* line-height: 1; */
		/* font-family: 'Economica', sans-serif; */
		font-size: 0.6rem;
		color: var(--secondary-content);
	}
	.value {
		/* font-size: 1.8em; */
		color: var(--primary-content);
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
		border: 1px dashed var(--secondary);
		padding: 0 0.2rem;
		border-radius: var(--border-radius);
		border-top: none;
		border-bottom: none;
		text-transform: uppercase;
	}
</style>
