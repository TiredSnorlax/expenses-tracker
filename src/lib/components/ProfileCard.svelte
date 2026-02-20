<script lang="ts">
	import type { Profile } from '$lib';
	import type { AuthUser } from '$lib/stores/auth';

	type Props = {
		user: AuthUser;
		profile: Profile;
		onUpdate: (newBudget: number) => Promise<void>;
	};

	let { user, profile = $bindable(), onUpdate }: Props = $props();

	let isEditing = $state(false);

	const handleEdit = () => {
		isEditing = true;
	};

	const handleSave = async () => {
		await onUpdate(profile.monthlyBudget);
		isEditing = false;
	};

	const handleCancel = () => {
		isEditing = false;
	};
</script>

<div class="profile-card">
	{#if user.photoURL}
		<img src={user.photoURL} alt={user.displayName} class="avatar" />
	{:else}
		<div class="avatar placeholder">
			{user.displayName ? user.displayName[0].toUpperCase() : 'U'}
		</div>
	{/if}
	<div class="info">
		<h1>{user.displayName || 'User'}</h1>
		<p class="email">{user.email}</p>
		{#if profile}
			<div class="stats">
				<div class="stat">
					<span class="label">Monthly Budget</span>
					{#if isEditing}
						<div class="edit-group">
							<span class="prefix">S$</span>
							<input type="number" bind:value={profile.monthlyBudget} class="budget-input" />
							<div class="actions">
								<button class="btn save" onclick={handleSave}>Save</button>
								<button class="btn cancel" onclick={handleCancel}>Cancel</button>
							</div>
						</div>
					{:else}
						<div class="value-group">
							<span class="value">S${profile.monthlyBudget.toFixed(2)}</span>
							<button class="btn edit" onclick={handleEdit}>Edit</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.profile-card {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2rem;
		background: var(--primary-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		margin-bottom: 2rem;
		border: 1px solid var(--border-color);
	}
	.avatar {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid var(--border-color);
	}
	.avatar.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #ddd;
		font-size: 2.5rem;
		color: #555;
	}
	.info {
		flex: 1;
	}
	.info h1 {
		margin: 0;
		font-size: 1.8rem;
		color: var(--text-color);
	}
	.email {
		color: var(--subtle-text-color);
		margin: 0.5rem 0 1.5rem;
		font-size: 1rem;
	}
	.stats {
		display: flex;
		gap: 3rem;
		flex-wrap: wrap;
	}
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		max-width: 400px;
	}
	.label {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: var(--subtle-text-color);
	}
	.value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-color);
	}

	.value-group,
	.edit-group {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.prefix {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-color);
	}

	.budget-input {
		font-size: 1.5rem;
		font-weight: 700;
		background: var(--primary-color);
		border: 1px solid var(--border-color);
		color: var(--text-color);
		border-radius: 6px;
		padding: 0.25rem 0.5rem;
		width: 150px;
	}

	.budget-input:focus {
		outline: 2px solid var(--secondary-color);
		border-color: transparent;
	}

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
	}

	.btn.edit {
		background: transparent;
		border: 1px solid var(--subtle-text-color);
		color: var(--subtle-text-color);
	}
	.btn.edit:hover {
		border-color: var(--text-color);
		color: var(--text-color);
	}

	.btn.save {
		background: var(--secondary-color);
		border: 1px solid var(--secondary-color);
		color: white;
	}
	.btn.save:hover {
		opacity: 0.9;
	}

	.btn.cancel {
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--subtle-text-color);
	}
	.btn.cancel:hover {
		border-color: var(--text-color);
		color: var(--text-color);
	}
</style>
