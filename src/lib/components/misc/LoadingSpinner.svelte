<script lang="ts">
	import { LoaderCircle } from '@lucide/svelte';

	type Props = {
		msg: string;
	};

	let { msg }: Props = $props();
</script>

<div class="loading">
	<span class="spinner"><LoaderCircle /></span>
	<p>{msg}</p>
</div>

<style>
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.loading .spinner {
		animation: spin 1s linear infinite;
		display: flex;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		font-size: 1.25rem;
		font-weight: 500;
	}
</style>
