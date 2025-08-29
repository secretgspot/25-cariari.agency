<script>
	/** @type {{type?: string, color?: string, size?: number, fixed?: boolean}} */
	let {
		type = 'regular',
		color = 'gold',
		size = 36,
		fixed = false,
		invert = false,
		...rest
	} = $props();
</script>

<img
	class:fixed
	class="logo {color}"
	src="/logo/logo_{type}_{color}.svg"
	width={size}
	alt="Cariari Agency Logo"
	loading="eager"
	{...rest} />

<style>
	.logo {
		z-index: 10;
		cursor: pointer;
		&.fixed {
			position: fixed;
			top: var(--size-2);
			left: var(--size-2);
		}
		&.invert {
			mix-blend-mode: difference;
		}
	}
</style>
