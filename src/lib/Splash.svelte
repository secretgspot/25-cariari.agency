<script>
	import { fly, fade } from 'svelte/transition';
	import LogoSvg from './LogoSvg.svelte';
</script>

<div transition:fade|global class="splash">
	<div class="backdrop"></div>

	<div class="logo-group">
		<span>Cariari</span>
		<LogoSvg animate={true} kind="gold" size="69" time={3} />
		<span>Agency</span>
	</div>
</div>

<style>
	.splash {
		z-index: 9;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100dvh;
		width: 100dvw;
	}
	.backdrop {
		z-index: 8;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		backdrop-filter: blur(30px);
		background: var(--surface-1);
	}
	.logo-group {
		z-index: 12;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		cursor: pointer;
		position: relative;
		gap: var(--size-3);
		@media screen and (orientation: portrait) {
			flex-direction: column;
		}

		span {
			font-size: var(--font-size-fluid-2);
			font-weight: lighter;
			text-transform: uppercase;
		}
	}
</style>
