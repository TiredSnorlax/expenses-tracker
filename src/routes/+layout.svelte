<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:root {
		--background-color: #000000;
		--primary-color: #2a2a2a;
		--text-color: #f0f0f0;
		--subtle-text-color: #a0a0a0;
		--secondary-color: #4caf50;
		--border-color: #444;
	}

	:global(body) {
		background-color: var(--background-color);
		color: var(--text-color);
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}

	:global(*) {
		box-sizing: border-box;
	}
</style>
