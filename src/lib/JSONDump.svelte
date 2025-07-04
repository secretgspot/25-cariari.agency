<!--
	import JSONDump from "./JSONDump.svelte";
	<JSONDump name='list' data={list} />

 -->
<script>
	/** @type {{name?: string, data: any, open?: boolean}} */
	let { name = "<unknown>", data, open = true } = $props();
</script>

<details {open}>
	<summary>{name}</summary>{JSON.stringify(data, undefined, "\t")}
</details>

<style>
	details {
		font-family: monospace;
		tab-size: 4ch;
		white-space: pre-wrap;
		border: 1px dotted;
		margin: 1em 0;
		padding: 10px;
	}
	summary {
		font-weight: bold;
		cursor: pointer;
	}
	details[open] > summary::after {
		content: ":";
	}
</style>
