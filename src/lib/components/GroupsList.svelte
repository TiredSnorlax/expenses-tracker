<script lang="ts">
	import type { Group } from '$lib';
	import type { AuthUser } from '$lib/stores/auth';
	import NewGroupMenu from './NewGroupMenu.svelte';

	type Props = {
		groups: Group[];
		user: AuthUser;
		addNewGroup: (newGroup: Group) => void;
	};

	let { groups, user, addNewGroup }: Props = $props();

	let newGroupMenuOpen = $state(false);
</script>

<div class="groups-container">
	<div class="heading">
		<h2>Your Groups</h2>
		<button onclick={() => (newGroupMenuOpen = !newGroupMenuOpen)}>+ New</button>
	</div>
	<NewGroupMenu bind:newGroupMenuOpen {addNewGroup} />
	{#if groups.length > 0}
		<div class="groups-grid">
			{#each groups as group}
				<a href="/group/{group.id}" class="group-card-link">
					<div class="group-card">
						<div>
							<h3>{group.name}</h3>
							<p>{group.description}</p>
						</div>
						<div class="group-stats">
							<p>${group.spent}/${group.budget}</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{:else}
		<p class="info">No group expenses yet.</p>
	{/if}
</div>

<style>
	.groups-container .heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2rem;
		margin-bottom: 1rem;
	}

	.groups-container p.info {
		text-align: center;
		color: var(--subtle-text-color);
	}

	.groups-container .heading button {
		background: var(--secondary-color);
		color: var(--text-color);
		font-weight: bold;
		padding: 0.5rem 1rem;
		border-radius: 5px;
		cursor: pointer;
		border: none;
	}

	.groups-grid {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.group-card {
		background: var(--primary-color);
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		transition: transform 0.2s ease;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.group-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--secondary-color);
	}

	.group-card-link {
		text-decoration: none;
		color: inherit;
		display: block;
		width: 100%;
	}

	.group-card h3 {
		font-size: 1.2rem;
	}

	.group-card p {
		color: var(--subtle-text-color);
		font-size: 1rem;
	}

	.group-stats {
		display: flex;
		justify-content: space-between;
		font-size: 0.9rem;
		font-weight: bold;
		gap: 1rem;
	}
</style>
