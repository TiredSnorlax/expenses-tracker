<script lang="ts">
	import { authStore, signOut, type AuthUser } from '$lib/stores/auth';
	import { onMount } from 'svelte';

	type Props = {
		user: AuthUser;
	};

	let { user }: Props = $props();

	let open = $state(false);

	const handleSignOut = async (): Promise<void> => {
		try {
			await signOut();
		} catch (error) {
			console.error('Sign-out error:', error);
		}
	};

	onMount(() => {
		console.log(user);
	});
</script>

{#if user}
	<div class="profile" class:open>
		<button class="profile-pic" onclick={() => (open = !open)}>
			<img src={user.photoURL} alt="User Avatar" />
		</button>
		{#if open}
			<div class="card">
				<p>{user.displayName}</p>
				<span>{user.email}</span>
				<button class="signout-btn" onclick={handleSignOut}>Sign Out</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	p {
		margin: 0;
		padding: 0;
	}

	span {
		font-size: 0.8rem;
		color: grey;
	}

	button {
		background: none;
		outline: none;
		border: none;
		margin: 0;
		padding: 0;
		cursor: pointer;
	}

	.profile {
		position: fixed;
		right: 1rem;
		top: 1rem;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-end;
		border-radius: 50%;

		color: black;
	}

	.profile.open {
		border-radius: 1rem;
		gap: 1rem;
	}

	.profile-pic {
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}

	.profile-pic img {
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}

	.card {
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
	}

	.card .signout-btn {
		border: 1px solid grey;
		border-radius: 0.5rem;
		padding: 0.5rem;

		margin-top: 1rem;
		align-self: center;
	}

	.card .signout-btn:hover {
		background: var(--secondary-color);
		color: white;
	}
</style>
