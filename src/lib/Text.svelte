<script>
	/** @type {{type?: string, children?: import('svelte').Snippet, [key: string]: any}} */
	let { type = "", children, ...rest } = $props();
</script>

<span
	{...rest}
	class:error={type == "error"}
	class:success={type == "success"}
>
	{@render children?.()}
</span>

<style>
	.error {
		color: var(--error);
	}
	.success {
		color: var(--success-content);
	}
</style>
