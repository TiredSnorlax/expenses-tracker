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
				<a href="/profile" class="profile-link">Profile</a>
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
		min-width: 150px;
	}

	.card .profile-link,
	.card .signout-btn {
		display: block;
		border: 1px solid grey;
		border-radius: 0.5rem;
		padding: 0.5rem;
		width: 100%;
		text-align: center;
		text-decoration: none;
		color: inherit;
		cursor: pointer;
		font-size: 0.9rem;
		box-sizing: border-box;
	}

	.card .profile-link {
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.card .profile-link:hover,
	.card .signout-btn:hover {
		background: var(--secondary-color);
		color: white;
		border-color: var(--secondary-color);
	}
</style>
