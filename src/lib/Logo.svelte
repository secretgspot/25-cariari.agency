<script>
	/** @type {{type?: string, color?: string, size?: number, fixed?: boolean}} */
	let { type = 'regular', color = 'gold', size = 36, fixed = false, ...rest } = $props();
</script>

<img
	class:fixed
	class="logo {color}"
	src="/logo/logo_{type}_{color}.svg"
	width={size}
	alt="Cariari Agency Logo"
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
