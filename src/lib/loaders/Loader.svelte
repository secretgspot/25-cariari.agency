<script>
	/** @type {{isActive?: boolean}} */
	let { isActive = false } = $props();
</script>

<div class="loader-wrapper" class:is-active={isActive}>
	<div class="loader is-loading"></div>
</div>

<style>
	.loader-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background: #fff;
		opacity: 0;
		z-index: -1;
		transition: opacity var(--transition);
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 6px;
	}
	.loader {
		height: 80px;
		width: 80px;
	}
	.loader-wrapper:global(.is-active) {
		opacity: 1;
		z-index: 1;
	}
</style>
