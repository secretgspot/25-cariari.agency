<script>
	import ErrorImage from './ErrorImage.svelte';
</script>

<div class="nothing_to_see">
	<ErrorImage type="empty" />
</div>

<style>
	.nothing_to_see {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: var(--bg-secondary);
		height: 60vh;
	}
</style>
