<script>
	/** @type {{type?: string, color?: string, size?: string, fixed?: string}} */
	let { type = 'regular', color = 'gold', size = '36', fixed = '', ...rest } = $props();
</script>

<img
	class="logo {fixed} {color}"
	src="/logo/logo_{type}_{color}.svg"
	width={size}
	alt="CR logo"
	{...rest} />

<style lang="scss">
	.logo {
		z-index: 10;
		cursor: pointer;
	}
	.fixed {
		position: fixed;
		top: var(--padding-small);
		left: var(--padding-small);
	}
</style>
