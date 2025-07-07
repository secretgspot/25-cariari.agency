<script>
	import Login from '$lib/Login.svelte';
	let { data } = $props();
</script>

<Login redirectTo={data.redirectTo} />
