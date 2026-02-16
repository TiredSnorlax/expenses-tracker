<script lang="ts">
	import { goto } from '$app/navigation';
	import { signInWithGoogle } from '$lib/stores/auth';

	let loading: boolean = false;
	let error: string = '';

	const handleSignIn = async (): Promise<void> => {
		loading = true;
		error = '';

		try {
			await signInWithGoogle();
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	};
</script>

<div class="signin-container">
	<h1>Please Sign In to proceed</h1>
	{#if error}
		<div class="error">{error}</div>
	{/if}

	<button class="google-btn" on:click={handleSignIn} disabled={loading}>
		{#if loading}
			<span class="spinner"></span>
			Signing in...
		{:else}
			<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
				<path
					fill="#EA4335"
					d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
				/>
				<path
					fill="#4285F4"
					d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
				/>
				<path
					fill="#FBBC05"
					d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
				/>
				<path
					fill="#34A853"
					d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
				/>
			</svg>
			Sign in with Google
		{/if}
	</button>
</div>

<style>
	.signin-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.google-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 12px 24px;
		background: white;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		color: #333;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.google-btn:hover:not(:disabled) {
		border-color: #4285f4;
		box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
	}

	.google-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.error {
		background: #fee;
		border: 1px solid #fcc;
		border-radius: 6px;
		padding: 12px;
		color: #c33;
		font-size: 14px;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid #f3f3f3;
		border-top: 2px solid #4285f4;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
