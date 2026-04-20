<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/brand/shwesar_logo.png" />
</svelte:head>

{@render children()}
